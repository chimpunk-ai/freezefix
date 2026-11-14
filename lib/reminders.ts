"use client";

// Reminders, browser side. Two switches in settings, both off until the
// person turns them on, each explained — with the exact lock-screen text —
// before the browser's own permission prompt ever appears.
//
// Mechanism: Web Push through the service worker that components/PwaRegister
// registers. This file never registers the worker itself; it waits for
// `navigator.serviceWorker.ready` with a timeout and reports "unsupported"
// when that never resolves (dev, private windows, browsers without SW, an
// iPhone where the site isn't on the home screen yet).
//
// Local state lives in ff_reminders. It is a UI mirror, not the source of
// truth: the browser's PushSubscription is. forget-everything clears it.

export type ReminderKind = "sunday" | "nightly";

export type RemindersState = {
  /** The browser's own permission state, or what stands in for it. */
  permission: "default" | "granted" | "denied" | "unsupported";
  /** true once the push server knows this browser. */
  subscribed: boolean;
  sunday: boolean;
  nightly: boolean;
  /** Local hour for the nightly nudge (the bedtime from the profile). */
  hour: number;
  /** Whether the server side is switched on at all (VAPID key present). */
  configured: boolean;
};

const KEY = "ff_reminders";
const READY_TIMEOUT_MS = 4000;

type Stored = { sunday: boolean; nightly: boolean; hour: number; subscribed: boolean };

export function publicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
}

function readStored(): Stored {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { sunday: false, nightly: false, hour: 23, subscribed: false };
    const p = JSON.parse(raw) as Partial<Stored>;
    return {
      sunday: Boolean(p.sunday),
      nightly: Boolean(p.nightly),
      hour: Number.isInteger(p.hour) ? Math.min(23, Math.max(0, Number(p.hour))) : 23,
      subscribed: Boolean(p.subscribed),
    };
  } catch {
    return { sunday: false, nightly: false, hour: 23, subscribed: false };
  }
}

function writeStored(s: Stored) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage can be blocked; the subscription itself still stands */
  }
}

export function clearReminderPref() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Push + notifications + service worker all present in this browser. */
export function isSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/** iPhone/iPad Safari only allows web push once the site is on the home screen. */
export function needsHomeScreen(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
  return iOS && !standalone;
}

export function getState(): RemindersState {
  const stored = readStored();
  const configured = Boolean(publicKey());
  if (!isSupported()) {
    return { ...stored, permission: "unsupported", configured };
  }
  return { ...stored, permission: Notification.permission, configured };
}

async function readyRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isSupported()) return null;
  try {
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), READY_TIMEOUT_MS));
    return await Promise.race([navigator.serviceWorker.ready, timeout]);
  } catch {
    return null;
  }
}

function timeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

async function postSubscription(sub: PushSubscription, kinds: { sunday: boolean; nightly: boolean }, hour: number): Promise<boolean> {
  const json = sub.toJSON();
  try {
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint, keys: json.keys, kinds, hour, tz: timeZone() }),
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
  const fail = (reason: Exclude<EnableResult, { ok: true }>["reason"]) => ({ ok: false as const, reason, state: getState() });
  if (!publicKey()) return fail("off");
  if (!isSupported()) return fail(needsHomeScreen() ? "home-screen" : "unsupported");
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
