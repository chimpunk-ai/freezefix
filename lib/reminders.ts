// Reminders (half 1 of 2): types, storage, capability checks, getState.

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

async function postSubscription(
  sub: PushSubscription,
  kinds: { sunday: boolean; nightly: boolean },
  hour: number,
): Promise<boolean> {
  const json = sub.toJSON();
  try {
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sub: json, kinds, hour }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function writeStored(next: Stored): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage can be blocked */
  }
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

  const reg = await readyRegistration();
  if (!reg) return { ok: false, reason: "failed", state: getState() };

  let sub: PushSubscription | null = null;
  try {
    sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });
    }
  } catch {
    return { ok: false, reason: "failed", state: getState() };
  }

  const prev = readStored();
  const h = Number.isInteger(hour) ? Math.min(23, Math.max(0, hour)) : prev.hour;
  const next: Stored = {
    sunday: kind === "sunday" ? true : prev.sunday,
    nightly: kind === "nightly" ? true : prev.nightly,
    hour: h,
    subscribed: true,
  };
  const ok = await postSubscription(sub, { sunday: next.sunday, nightly: next.nightly }, next.hour);
  if (!ok) return { ok: false, reason: "server", state: getState() };
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
  const reg = await readyRegistration();
  if (reg) {
    try {
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        if (!next.sunday && !next.nightly) {
          try {
            await fetch("/api/push/unsubscribe", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ endpoint: sub.endpoint }),
            });
          } catch {
            /* keep going */
          }
          try { await sub.unsubscribe(); } catch { /* ignore */ }
          next.subscribed = false;
        } else {
          await postSubscription(sub, { sunday: next.sunday, nightly: next.nightly }, next.hour);
        }
      }
    } catch {
      /* ignore */
    }
  }
  writeStored(next);
  return getState();
}

export async function onBedtimeChange(hour: number): Promise<void> {
  const prev = readStored();
  const h = Number.isInteger(hour) ? Math.min(23, Math.max(0, hour)) : prev.hour;
  writeStored({ ...prev, hour: h });
  if (!prev.subscribed) return;
  const reg = await readyRegistration();
  if (!reg) return;
  try {
    const sub = await reg.pushManager.getSubscription();
    if (sub) await postSubscription(sub, { sunday: prev.sunday, nightly: prev.nightly }, h);
  } catch {
    /* ignore */
  }
}
