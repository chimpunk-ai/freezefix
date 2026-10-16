// Server-side daily limits (voice notes, screenshots). Counted on the server so a page
// refresh can't reset them. No login: we use an anonymous random device ID cookie plus a
// salted, daily-rotating hash of the IP address as a backstop. We never store raw IPs.
// Help screens and typing are NEVER limited.

export type QuotaKind = "voice" | "screenshot" | "check";

export const LIMITS = {
  voice: { free: 3, paid: 6 },
  // Founder set voice limits (16 Oct). Screenshot cap is a cost guard; Budget & Ops tunes it.
  screenshot: { free: Number(process.env.SCREENSHOT_DAILY_LIMIT || 10), paid: Number(process.env.SCREENSHOT_DAILY_LIMIT_PAID || 20) },
  // Safety checks the AI runs for people who hit the paywall (so crisis help is never missed
  // just because someone hasn't paid). Cost guard only; Budget & Ops tunes it.
  check: { free: 20, paid: 50 },
} as const;

// Per-IP backstop per day (stops someone clearing cookies over and over).
const IP_MULTIPLIER = 3;

export const DEVICE_COOKIE = "ff_did";

export type QuotaResult = { allowed: boolean; used: number; limit: number; reason?: "limit" | "unavailable"; setCookie?: string };

// Paid = an active Plus plan (not the trial). Checked ON THE SERVER, never trusted from the browser.
// Trial users get the free limits (3 voice notes a day); Plus gets 6.
export async function isPaid(deviceId: string): Promise<boolean> {
  const e = await getEntitlement(deviceId);
  return e.active && e.status !== "trialing";
}

export type Entitlement = { active: boolean; status: string };

// Is this device on an active trial or plan? Fails closed (not active) if the database is down,
// which only ever affects the paywall: help screens never check this.
export async function getEntitlement(deviceId: string): Promise<Entitlement> {
  try {
    const out = (await rpc("get_entitlement", { p_device_ref: await deviceRef(deviceId) })) as Entitlement;
    return { active: Boolean(out?.active), status: String(out?.status ?? "none") };
  } catch {
    return { active: false, status: "unknown" };
  }
}

// One-way hash of the device ID. This is what we hand to the payment provider (custom data)
// and what the webhook stores, so the raw device ID never leaves our server.
export async function deviceRef(deviceId: string): Promise<string> {
  const salt = process.env.QUOTA_SALT || "freezefix-dev-salt";
  return sha256(`ref:${deviceId}:${salt}`);
}

// The one free unfreeze per device (founder decision 16 Oct).
export async function claimFreeSession(deviceId: string): Promise<boolean> {
  const dbReady = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  if (!dbReady) return process.env.NODE_ENV !== "production";
  try {
    const out = (await rpc("use_free_session", { p_device_key: await deviceRef(deviceId) })) as { allowed?: boolean };
    return Boolean(out?.allowed);
  } catch {
    return false;
  }
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

export async function sha256(text: string): Promise<string> {
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

export async function rpc(name: string, args: Record<string, unknown>, opts?: { service?: boolean }): Promise<unknown> {
  const url = process.env.SUPABASE_URL;
  // The service key is used ONLY by the payment webhook to write subscriptions.
  const key = opts?.service ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.SUPABASE_ANON_KEY;
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
  const body = await res.text();
  return body ? JSON.parse(body) : null;
}

// Uses one of today's allowance. Returns allowed=false if the limit is reached.
export async function consumeQuota(req: Request, deviceId: string, kind: QuotaKind): Promise<QuotaResult> {
  const paid = await isPaid(deviceId);
  const limit = paid ? LIMITS[kind].paid : LIMITS[kind].free;

  const dbReady = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  if (!dbReady) {
    // No database yet. This used to fail closed, which quietly killed every image and voice
    // note on the live site and reported it as "you've hit today's limit", which was a lie.
    // Falling back to a per-device cookie counter keeps the feature working and still caps
    // the spend. It is weaker: clearing cookies resets it, and there is no cap per address.
    // Set SUPABASE_URL and SUPABASE_ANON_KEY to get the real limits back.
    return countInCookie(req, kind, limit);
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

// Fallback day counter, kept in a cookie, for when no database is configured.
// Returned alongside the result so the caller can set it on the response.
export type CookieCount = QuotaResult & { setCookie?: string };

const COUNT_COOKIE = "ff_q";

function countInCookie(req: Request, kind: QuotaKind, limit: number): CookieCount {
  const today = new Date().toISOString().slice(0, 10);
  const raw = /(?:^|;\s*)ff_q=([^;]+)/.exec(req.headers.get("cookie") ?? "")?.[1];
  let counts: Record<string, number> = {};
  let day = today;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw ?? "")) as { d?: string; c?: Record<string, number> };
    if (parsed.d === today && parsed.c) counts = parsed.c;
    day = today;
  } catch {
    counts = {};
  }
  const used = counts[kind] ?? 0;
  if (used >= limit) return { allowed: false, used, limit, reason: "limit" };
  const next = { d: day, c: { ...counts, [kind]: used + 1 } };
  const value = encodeURIComponent(JSON.stringify(next));
  return {
    allowed: true,
    used: used + 1,
    limit,
    setCookie: `${COUNT_COOKIE}=${value}; Path=/; Max-Age=172800; HttpOnly; Secure; SameSite=Lax`,
  };
}
