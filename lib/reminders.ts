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

// Still stubbed, with readyRegistration referenced so the bundler can't DCE it.
export type EnableResult = { ok: false; reason: "off"; state: RemindersState };
export async function enable(_kind: ReminderKind, _hour: number): Promise<EnableResult> {
  await readyRegistration();
  return { ok: false, reason: "off", state: getState() };
}
export async function disable(_kind: ReminderKind): Promise<RemindersState> {
  return getState();
}
export async function onBedtimeChange(_hour: number): Promise<void> {
  /* noop */
}
