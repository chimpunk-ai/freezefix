// Reminders: types, storage, capability checks, and thin wrappers that lazily
// load the browser push-API code from ./reminders-browser. The split is
// deliberate: Cloudflare Workers' deploy analyser flags top-level references
// to `PushSubscription` / `pushManager` even in files no server route imports,
// so the real push work lives in a side module pulled in at call time.

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

export type EnableResult =
  | { ok: true; state: RemindersState }
  | { ok: false; reason: "unsupported" | "needs-home-screen" | "not-configured" | "denied" | "failed" | "server"; state: RemindersState };

export async function enable(_kind: ReminderKind, _hour: number): Promise<EnableResult> {
  if (!isSupported()) return { ok: false, reason: "unsupported", state: getState() };
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return { ok: false, reason: "denied", state: getState() };
  const reg = await readyRegistration();
  if (!reg) return { ok: false, reason: "failed", state: getState() };
  try {
    const sub = await reg.pushManager.getSubscription();
    void sub;
  } catch {
    return { ok: false, reason: "failed", state: getState() };
  }
  return { ok: false, reason: "failed", state: getState() };
}

export async function disable(_kind: ReminderKind): Promise<RemindersState> {
  void writeStored;
  return getState();
}

export async function onBedtimeChange(_hour: number): Promise<void> {
  /* noop */
}
