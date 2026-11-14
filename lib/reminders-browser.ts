// Browser-only push subscription work, lazy-imported from lib/reminders.ts.
// Isolated so the top-level module stays free of `pushManager` /
// `PushSubscription` references, which the Cloudflare Workers deploy
// analyser flags even in client code.

export type Kinds = { sunday: boolean; nightly: boolean };

const READY_TIMEOUT_MS = 4000;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
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

async function postSubscription(sub: PushSubscription, kinds: Kinds, hour: number): Promise<boolean> {
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

export type SubscribeOk = { ok: true };
export type SubscribeErr = { ok: false; reason: "denied" | "failed" | "server" };

export async function doSubscribe(key: string, kinds: Kinds, hour: number): Promise<SubscribeOk | SubscribeErr> {
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return { ok: false, reason: "denied" };
  const reg = await readyRegistration();
  if (!reg) return { ok: false, reason: "failed" };
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
    return { ok: false, reason: "failed" };
  }
  const ok = await postSubscription(sub, kinds, hour);
  return ok ? { ok: true } : { ok: false, reason: "server" };
}

export async function doUpdate(kinds: Kinds, hour: number): Promise<void> {
  const reg = await readyRegistration();
  if (!reg) return;
  try {
    const sub = await reg.pushManager.getSubscription();
    if (sub) await postSubscription(sub, kinds, hour);
  } catch {
    /* ignore */
  }
}

export async function doUnsubscribe(): Promise<void> {
  const reg = await readyRegistration();
  if (!reg) return;
  try {
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
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
  } catch {
    /* ignore */
  }
}
