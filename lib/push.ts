// Web Push, server side. Two reminders, both opt-in, both off by default:
//   - sunday: 8:15pm local, "your week is ready."
//   - nightly: the user's bedtime hour, "tonight's three taps, if you want them."
//
// What the server stores per subscription: the push endpoint URL, the two
// browser keys needed to address it, two booleans, a local hour, an IANA
// timezone, and two "last sent" dates so a slow cron can't double-send. No
// name, no log, no device cookie. The push itself carries NO payload — the
// service worker decides the wording locally from the clock — so nothing
// about the user ever transits the push service either.
//
// VAPID keys: the web-push convention. VAPID_PUBLIC_KEY is the 65-byte
// uncompressed P-256 point, base64url. VAPID_PRIVATE_KEY is the raw 32-byte
// scalar d, base64url. `tsx scripts/gen-vapid.ts` prints a pair in exactly
// this shape. Keys live in Cloudflare secrets, never in the repo.

import { rpc } from "@/lib/quota";

export const VAPID_SUBJECT = "mailto:privacy@getfreezefix.com";

export type Kinds = { sunday: boolean; nightly: boolean };

export type Subscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
  sunday: boolean;
  nightly: boolean;
  hour: number;
  tz: string;
  last_sent_sunday: string | null;
  last_sent_nightly: string | null;
};

// --- base64url -------------------------------------------------------------

export function b64urlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// --- local time --------------------------------------------------------------

export type LocalNow = { date: string; weekday: number; hour: number; minute: number };

/** Local wall-clock in an IANA zone. weekday: 0 = Sunday … 6 = Saturday. */
export function localNow(tz: string, at: Date = new Date()): LocalNow | null {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
    }).formatToParts(at);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    if (wd < 0) return null;
    return {
      date: `${get("year")}-${get("month")}-${get("day")}`,
      weekday: wd,
      hour: Number(get("hour")),
      minute: Number(get("minute")),
    };
  } catch {
    return null; // unknown zone — never send
  }
}

export type Due = { sunday: boolean; nightly: boolean };

/**
 * Which reminders are due for this subscription right now. The cron runs
 * every ten minutes, so each window is ten minutes wide and each kind is
 * sent at most once per local date.
 */
export function dueKinds(sub: Pick<Subscription, "sunday" | "nightly" | "hour" | "tz" | "last_sent_sunday" | "last_sent_nightly">, at: Date = new Date()): Due {
  const now = localNow(sub.tz, at);
  if (!now) return { sunday: false, nightly: false };
  const sunday =
    sub.sunday && now.weekday === 0 && now.hour === 20 && now.minute >= 15 && now.minute < 25 && sub.last_sent_sunday !== now.date;
  const nightly =
    sub.nightly && now.hour === sub.hour && now.minute < 10 && sub.last_sent_nightly !== now.date;
  return { sunday, nightly };
}

// --- VAPID -------------------------------------------------------------------

function derToJose(der: Uint8Array): Uint8Array {
  // WebCrypto ECDSA returns raw r||s (64 bytes) already; keep for safety if a DER slips in.
  if (der.length === 64) return der;
  let i = 2;
  if (der[i] !== 0x02) throw new Error("bad sig");
  const rl = der[i + 1];
  let r = der.slice(i + 2, i + 2 + rl);
  i += 2 + rl;
  const sl = der[i + 1];
  let s = der.slice(i + 2, i + 2 + sl);
  r = r.length > 32 ? r.slice(r.length - 32) : r;
  s = s.length > 32 ? s.slice(s.length - 32) : s;
  const out = new Uint8Array(64);
  out.set(r, 32 - r.length);
  out.set(s, 64 - s.length);
  return out;
}

export async function importVapidPrivateKey(publicKeyB64: string, privateKeyB64: string): Promise<CryptoKey> {
  const pub = b64urlDecode(publicKeyB64);
  if (pub.length !== 65 || pub[0] !== 4) throw new Error("vapid public key must be a 65-byte uncompressed P-256 point");
  const d = b64urlDecode(privateKeyB64);
  if (d.length !== 32) throw new Error("vapid private key must be the raw 32-byte scalar");
  const jwk: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    x: b64urlEncode(pub.slice(1, 33)),
    y: b64urlEncode(pub.slice(33, 65)),
    d: b64urlEncode(d),
    ext: true,
  };
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
}

export async function vapidJwt(audience: string, key: CryptoKey, now: number = Math.floor(Date.now() / 1000)): Promise<string> {
  const enc = new TextEncoder();
  const header = b64urlEncode(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64urlEncode(enc.encode(JSON.stringify({ aud: audience, exp: now + 12 * 3600, sub: VAPID_SUBJECT })));
  const data = enc.encode(`${header}.${payload}`);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, data));
  return `${header}.${payload}.${b64urlEncode(derToJose(sig))}`;
}

export type SendResult = "sent" | "gone" | "failed";

/** One empty-payload push. 404/410 from the push service means the browser dropped us. */
export async function sendEmptyPush(endpoint: string, key: CryptoKey, publicKeyB64: string): Promise<SendResult> {
  let aud: string;
  try {
    aud = new URL(endpoint).origin;
  } catch {
    return "gone";
  }
  const jwt = await vapidJwt(aud, key);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `vapid t=${jwt}, k=${publicKeyB64}`,
        TTL: "3600",
        Urgency: "low",
        "Content-Length": "0",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 404 || res.status === 410) return "gone";
    return res.ok || res.status === 201 ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

// --- storage (through security-definer functions, like the rest of the schema) ---

export function pushConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.SUPABASE_URL);
}

export async function upsertSubscription(s: { endpoint: string; p256dh: string; auth: string; kinds: Kinds; hour: number; tz: string }): Promise<void> {
  await rpc("push_upsert", {
    p_endpoint: s.endpoint,
    p_p256dh: s.p256dh,
    p_auth: s.auth,
    p_sunday: s.kinds.sunday,
    p_nightly: s.kinds.nightly,
    p_hour: s.hour,
    p_tz: s.tz,
  });
}

export async function removeSubscription(endpoint: string): Promise<void> {
  await rpc("push_remove", { p_endpoint: endpoint });
}

export async function listActiveSubscriptions(): Promise<Subscription[]> {
  const out = (await rpc("push_active", {}, { service: true })) as Subscription[] | null;
  return Array.isArray(out) ? out : [];
}

export async function markSent(endpoint: string, kind: keyof Kinds, date: string): Promise<void> {
  await rpc("push_mark_sent", { p_endpoint: endpoint, p_kind: kind, p_date: date }, { service: true });
}

export async function removeSubscriptionService(endpoint: string): Promise<void> {
  await rpc("push_remove", { p_endpoint: endpoint }, { service: true });
}

/** Validation for the subscribe body. Returns null when anything is off. */
export function parseSubscribeBody(body: unknown): { endpoint: string; p256dh: string; auth: string; kinds: Kinds; hour: number; tz: string } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const endpoint = typeof b.endpoint === "string" ? b.endpoint : "";
  const keys = (b.keys ?? {}) as Record<string, unknown>;
  const p256dh = typeof keys.p256dh === "string" ? keys.p256dh : "";
  const auth = typeof keys.auth === "string" ? keys.auth : "";
  const kinds = (b.kinds ?? {}) as Record<string, unknown>;
  const hour = Number(b.hour);
  const tz = typeof b.tz === "string" ? b.tz : "";
  if (!/^https:\/\/[^\s]{10,1500}$/.test(endpoint)) return null;
  if (!/^[A-Za-z0-9_-]{20,200}$/.test(p256dh) || !/^[A-Za-z0-9_-]{10,100}$/.test(auth)) return null;
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
  if (!/^[A-Za-z_]+\/[A-Za-z0-9_+\-/]+$|^UTC$/.test(tz) || tz.length > 64) return null;
  if (!localNow(tz)) return null;
  return { endpoint, p256dh, auth, kinds: { sunday: Boolean(kinds.sunday), nightly: Boolean(kinds.nightly) }, hour, tz };
}
