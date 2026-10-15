// Server-side daily limits (voice notes, screenshots). Counted on the server so a page
// refresh can't reset them. No login: we use an anonymous random device ID cookie plus a
// salted, daily-rotating hash of the IP address as a backstop. We never store raw IPs.
// Help screens and typing are NEVER limited.

export type QuotaKind = "voice" | "screenshot";

export const LIMITS = {
  voice: { free: 3, paid: 6 },
  // Founder set voice limits (16 Oct). Screenshot cap is a cost guard; Budget & Ops tunes it.
  screenshot: { free: Number(process.env.SCREENSHOT_DAILY_LIMIT || 10), paid: Number(process.env.SCREENSHOT_DAILY_LIMIT_PAID || 20) },
} as const;

// Per-IP backstop per day (stops someone clearing cookies over and over).
const IP_MULTIPLIER = 3;

export const DEVICE_COOKIE = "ff_did";

export type QuotaResult = { allowed: boolean; used: number; limit: number; reason?: "limit" | "unavailable" };

// Payments aren't built yet (HQ order: paywall after the core flow), so everyone is on the
// free/trial limit. When payments ship, this checks the subscription ON THE SERVER.
export async function isPaid(_deviceId: string): Promise<boolean> {
  return false;
}

export function readDeviceId(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const m = new RegExp(`(?:^|;\\s*)${DEVICE_COOKIE}=([a-f0-9-]{36})`).exec(cookie);
  return m ? m[1] : null;
}

export function newDeviceId(): string {
  return crypto.randomUUID();
}

export function deviceCookie(id: string): string {
  // 1 year, not readable by page scripts.
  return `${DEVICE_COOKIE}=${id}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`;
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function keysFor(req: Request, deviceId: string) {
  const salt = process.env.QUOTA_SALT || "freezefix-dev-salt";
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const day = today();
  return {
    deviceKey: await sha256(`d:${deviceId}:${salt}`),
    ipKey: await sha256(`ip:${ip}:${day}:${salt}`),
  };
}

async function rpc(name: string, args: Record<string, unknown>): Promise<unknown> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("no_db");
  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`db_${res.status}`);
  return res.json();
}

// Uses one of today's allowance. Returns allowed=false if the limit is reached.
export async function consumeQuota(req: Request, deviceId: string, kind: QuotaKind): Promise<QuotaResult> {
  const paid = await isPaid(deviceId);
  const limit = paid ? LIMITS[kind].paid : LIMITS[kind].free;

  const dbReady = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  if (!dbReady) {
    // Local testing only. Live, we fail closed so costs can't run away.
    if (process.env.NODE_ENV !== "production") return { allowed: true, used: 0, limit };
    return { allowed: false, used: 0, limit, reason: "unavailable" };
  }

  try {
    const { deviceKey, ipKey } = await keysFor(req, deviceId);
    const out = (await rpc("use_quota", {
      p_kind: kind,
      p_device_key: deviceKey,
      p_ip_key: ipKey,
      p_limit: limit,
      p_ip_limit: limit * IP_MULTIPLIER,
    })) as { allowed: boolean; used: number };
    return { allowed: Boolean(out.allowed), used: Number(out.used) || 0, limit, reason: out.allowed ? undefined : "limit" };
  } catch {
    return { allowed: false, used: 0, limit, reason: "unavailable" };
  }
}

// Gives the allowance back if the voice note / screenshot failed on our side.
export async function refundQuota(req: Request, deviceId: string, kind: QuotaKind): Promise<void> {
  try {
    const { deviceKey, ipKey } = await keysFor(req, deviceId);
    await rpc("refund_quota", { p_kind: kind, p_device_key: deviceKey, p_ip_key: ipKey });
  } catch {
    /* ignore */
  }
}
