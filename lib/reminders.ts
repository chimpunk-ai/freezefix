// Reminders, browser side. Two switches in settings, both off until the person
// turns them on, each explained — with the exact lock-screen text — before
// the browser's own permission prompt ever appears.
//
// Mechanism: Web Push through the service worker that components/PwaRegister
// registers. This file never registers the worker itself; it waits for
// navigator.serviceWorker.ready with a timeout and reports "unsupported" when
// that never resolves (dev, private windows, browsers without SW, an iPhone
// where the site isn't on the home screen yet).
//
// Local state lives in ff_reminders. It is a UI mirror, not the source of
// truth: the browser's PushSubscription is. forget-everything clears it.
//
// No "use client" directive on purpose. The 14 Nov diagnosis: the Cloudflare
// Workers build (OpenNext deploy, not next build) refused to upload a worker
// bundle that referenced window/navigator at module scope, even inside a file
// marked "use client" that nothing in the active tree imported. The tsconfig
// include walks every .ts, and the deploy policy is strict about globals. So
// this file exports plain functions and types, every browser-only API is
// called inside a function guarded by `typeof window`, and callers stay in
// "use client" components.

export type ReminderKind = "sunday" | "nightly";

export type RemindersState = {
  permission: "default" | "granted" | "denied" | "unsupported";
  subscribed: boolean;
  sunday: boolean;
  nightly: boolean;
  hour: number;
  configured: boolean;
};

const KEY = "ff_reminders";
const READY_TIMEOUT_MS = 4000;

type Stored = { sunday: boolean; nightly: boolean; hour: number; subscribed: boolean };

/** The VAPID public key the server was built with, or "" when the owner has not set it. */
export function publicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
}

const EMPTY_STORED: Stored = { sunday: false, nightly: false, hour: 23, subscribed: false };

function readStored(): Stored {
  if (typeof window === "undefined") return EMPTY_STORED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_STORED;
    const p = JSON.parse(raw) as Partial<Stored>;
    return {
      sunday: Boolean(p.sunday),
      nightly: Boolean(p.nightly),
      hour: Number.isInteger(p.hour) ? Math.min(23, Math.max(0, Number(p.hour))) : 23,
      subscribed: Boolean(p.subscribed),
    };
  } catch {
    return EMPTY_STORED;
  }
}

function writeStored(s: Stored): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage can be blocked */
  }
}

export function clearReminderPref(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* storage can be blocked */
  }
}

/** The browser can do Web Push notifications at all. */
export function isSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/** iOS/iPadOS only supports Web Push for installed PWAs. */
export function needsHomeScreen(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!iOS) return false;
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
  return !standalone;
}

export function getState(): RemindersState {
  const stored = readStored();
  const configured = Boolean(publicKey());
  const supported = isSupported();
  const permission: RemindersState["permission"] = !supported
    ? "unsupported"
    : typeof Notification !== "undefined"
      ? Notification.permission
      : "default";
  return {
    permission,
    subscribed: stored.subscribed,
    sunday: stored.sunday,
    nightly: stored.nightly,
    hour: stored.hour,
    configured,
  };
}

async function readyRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await Promise.race<ServiceWorkerRegistration | null>([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), READY_TIMEOUT_MS)),
    ]);
  } catch {
    return null;
  }
}

async function postSubscription(sub: PushSubscription, kinds: { sunday: boolean; nightly: boolean }, hour: number): Promise<boolean> {
  const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" : "UTC";
  const json = sub.toJSON();
  try {
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, kinds, hour, tz }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export type EnableResult =
  | { ok: true; state: RemindersState }
  | { ok: false; reason: "unsupported" | "home-screen" | "off" | "denied" | "not-ready" | "failed"; state: RemindersState };

/**
 * Switch one reminder on. Call ONLY after the UI has shown what the
 * notification will say — this is where the browser's permission prompt
 * appears (once; a denial is remembered by the browser and we never nag).
 */
export async function enable(kind: ReminderKind, hour: number): Promise<EnableResult> {
  const fail = (reason: Exclude<EnableResult, { ok: true }>["reason"]): EnableResult => ({ ok: false, reason, state: getState() });
  if (!publicKey()) return fail("off");
  if (!isSupported()) return fail(needsHomeScreen() ? "home-screen" : "unsupported");
  if (typeof Notification === "undefined") return fail("unsupported");
  if (Notification.permission === "denied") return fail("denied");

  const reg = await readyRegistration();
  if (!reg) return fail("not-ready");

  let permission = Notification.permission;
  if (permission === "default") {
    try {
      permission = await Notification.requestPermission();
    } catch {
      permission = "denied";
    }
  }
  if (permission !== "granted") return fail("denied");

  let sub: PushSubscription | null = null;
  try {
    sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: publicKey() }));
  } catch {
    return fail("failed");
  }

  const stored = readStored();
  const kinds = { sunday: kind === "sunday" ? true : stored.sunday, nightly: kind === "nightly" ? true : stored.nightly };
  const ok = await postSubscription(sub, kinds, hour);
  if (!ok) return fail("failed");
  writeStored({ ...kinds, hour, subscribed: true });
  return { ok: true, state: getState() };
}

/** Switch one reminder off. When both are off, the browser subscription goes too. */
export async function disable(kind: ReminderKind): Promise<RemindersState> {
  const stored = readStored();
  const kinds = { sunday: kind === "sunday" ? false : stored.sunday, nightly: kind === "nightly" ? false : stored.nightly };
  const reg = await readyRegistration();
  const sub = reg ? await reg.pushManager.getSubscription().catch(() => null) : null;
  if (sub) {
    if (!kinds.sunday && !kinds.nightly) {
      fetch("/api/push/unsubscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) }).catch(() => {});
      await sub.unsubscribe().catch(() => {});
    } else {
      await postSubscription(sub, kinds, stored.hour);
    }
  }
  writeStored({ ...kinds, hour: stored.hour, subscribed: Boolean(sub) && (kinds.sunday || kinds.nightly) });
  return getState();
}

/** The bedtime changed in settings: tell the server the new nightly hour. */
export async function onBedtimeChange(hour: number): Promise<void> {
  const stored = readStored();
  if (stored.hour === hour) return;
  writeStored({ ...stored, hour });
  if (!stored.nightly || !stored.subscribed) return;
  const reg = await readyRegistration();
  const sub = reg ? await reg.pushManager.getSubscription().catch(() => null) : null;
  if (sub) await postSubscription(sub, { sunday: stored.sunday, nightly: stored.nightly }, hour);
}
