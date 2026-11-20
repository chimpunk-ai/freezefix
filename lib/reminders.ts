// Reminders: types, storage, capability checks, and a thin postMessage bridge
// to the service worker. All the push-subscribe work (pushManager.subscribe,
// PushSubscription.toJSON, etc.) happens inside public/sw.js, which Next and
// OpenNext don't bundle. This keeps the deploy analyser happy — see the note
// at the top of public/sw.js around the message handler.

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

type Stored = { sunday: boolean; nightly: boolean; hour: number; subscribed: boolean };

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

function writeStored(next: Stored): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
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

export function isSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

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
  return { permission, subscribed: stored.subscribed, sunday: stored.sunday, nightly: stored.nightly, hour: stored.hour, configured };
}

const READY_TIMEOUT_MS = 4000;

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

type SwReply = { ok: boolean; reason?: string; message?: string };

async function askSW(message: Record<string, unknown>): Promise<SwReply> {
  const reg = await readyRegistration();
  const target: ServiceWorker | null = reg?.active ?? (typeof navigator !== "undefined" ? navigator.serviceWorker?.controller ?? null : null);
  if (!target) return { ok: false, reason: "failed" };
  return new Promise<SwReply>((resolve) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => resolve({ ok: false, reason: "failed" }), 10000);
    channel.port1.onmessage = (ev) => {
      clearTimeout(timer);
      const r = (ev.data ?? {}) as SwReply;
      resolve({ ok: Boolean(r.ok), reason: r.reason, message: r.message });
    };
    try {
      target.postMessage(message, [channel.port2]);
    } catch {
      clearTimeout(timer);
      resolve({ ok: false, reason: "failed" });
    }
  });
}

export type EnableResult =
  | { ok: true; state: RemindersState }
  | { ok: false; reason: "unsupported" | "needs-home-screen" | "not-configured" | "denied" | "failed" | "server"; state: RemindersState };

export async function enable(kind: ReminderKind, hour: number): Promise<EnableResult> {
  if (!isSupported()) return { ok: false, reason: "unsupported", state: getState() };
  if (needsHomeScreen()) return { ok: false, reason: "needs-home-screen", state: getState() };
  const key = publicKey();
  if (!key) return { ok: false, reason: "not-configured", state: getState() };

  const perm = await Notification.requestPermission();
  if (perm !== "granted") return { ok: false, reason: "denied", state: getState() };

  const prev = readStored();
  const h = Number.isInteger(hour) ? Math.min(23, Math.max(0, hour)) : prev.hour;
  const next: Stored = {
    sunday: kind === "sunday" ? true : prev.sunday,
    nightly: kind === "nightly" ? true : prev.nightly,
    hour: h,
    subscribed: true,
  };

  const reply = await askSW({ type: "subscribe", key, kinds: { sunday: next.sunday, nightly: next.nightly }, hour: next.hour });
  if (!reply.ok) {
    const reason = reply.reason === "server" ? "server" : "failed";
    return { ok: false, reason, state: getState() };
  }
  writeStored(next);
  return { ok: true, state: getState() };
}

export async function disable(kind: ReminderKind): Promise<RemindersState> {
  const prev = readStored();
  const next: Stored = {
    sunday: kind === "sunday" ? false : prev.sunday,
    nightly: kind === "nightly" ? false : prev.nightly,
    hour: prev.hour,
    subscribed: prev.subscribed,
  };
  if (!next.sunday && !next.nightly) {
    await askSW({ type: "unsubscribe" });
    next.subscribed = false;
  } else {
    await askSW({ type: "update", kinds: { sunday: next.sunday, nightly: next.nightly }, hour: next.hour });
  }
  writeStored(next);
  return getState();
}

export async function onBedtimeChange(hour: number): Promise<void> {
  const prev = readStored();
  const h = Number.isInteger(hour) ? Math.min(23, Math.max(0, hour)) : prev.hour;
  writeStored({ ...prev, hour: h });
  if (!prev.subscribed) return;
  await askSW({ type: "update", kinds: { sunday: prev.sunday, nightly: prev.nightly }, hour: h });
}

// Privacy §9's "forget everything" has to actually cancel any live push
// subscription, not just wipe the local preference -- otherwise a device that
// "forgot everything" keeps getting Sunday/nightly notifications forever,
// because the subscription row in Supabase (push_subscriptions) is still
// there and nothing told the browser or the server to stop. Unconditional
// (doesn't check `subscribed` first) because forget() has to be safe to call
// even if local storage is already in a weird/partial state -- better to ask
// the service worker to unsubscribe one extra, harmless time than to skip it
// because a flag didn't match what's actually true.
export async function forgetReminders(): Promise<void> {
  await askSW({ type: "unsubscribe" });
  clearReminderPref();
}
