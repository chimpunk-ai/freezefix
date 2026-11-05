import { NextResponse } from "next/server";
import { consumeQuota, readDeviceId, newDeviceId, deviceCookie } from "@/lib/quota";

// Waitlist capture.
//
// Added 3 November 2026 as audit item P1.4. Takes an email + (optional) region
// and locale from the landing or future-plan page and files it on the server
// via a security-definer function in Supabase so the anon key cannot be used
// to list, scrape or edit the table from a browser.
//
// What is stored: a lowercased email, a 2-letter region, the first browser
// language tag (max 16 chars), and which page the email came from.
//
// What is NOT stored: name, phone, device id, IP, user-agent, referrer, or
// any message. Joining a captured email back to a Fix session is exactly
// what the product promises not to do, so this route never writes the device
// id to Supabase alongside the email — the quota cookie it uses to rate-limit
// stays on the browser.

export const dynamic = "force-dynamic";

// RFC 5321 says 254 is the longest practical email address; a tighter regex
// here keeps garbage out before it reaches the DB, and the DB has its own
// cheap sanity check as a second line of defence.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SOURCES = new Set(["home", "future-plan", "pricing"]);

export async function POST(req: Request) {
  let deviceId = readDeviceId(req);
  const isNew = !deviceId;
  if (!deviceId) deviceId = newDeviceId();

  let countCookie: string | null = null;
  const respond = (body: unknown, status = 200) => {
    const res = NextResponse.json(body, { status });
    if (isNew) res.headers.append("Set-Cookie", deviceCookie(deviceId!));
    if (countCookie) res.headers.append("Set-Cookie", countCookie);
    return res;
  };

  let body: { email?: string; region?: string; locale?: string; source?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return respond({ ok: false, error: "bad_request" }, 400);
  }

  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);
  if (!email || !EMAIL_RE.test(email)) {
    return respond({ ok: false, error: "bad_email" }, 400);
  }

  const region = String(body.region ?? "").trim().toUpperCase().slice(0, 2);
  const locale = String(body.locale ?? "").trim().slice(0, 16);
  const source = SOURCES.has(String(body.source ?? "")) ? String(body.source) : null;

  // A handful of waitlist signups per device per day is plenty. Prevents a
  // single device being used to flood the table while leaving honest UX fast.
  // Reuses the "check" quota bucket already present in lib/quota.ts.
  const quota = await consumeQuota(req, deviceId, "check");
  countCookie = quota.setCookie ?? null;
  if (!quota.allowed) return respond({ ok: true, throttled: true });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    // Nowhere to put it yet. Say so honestly rather than showing a thank-you
    // for something that went in the bin — matches the suggest-route pattern.
    return respond({ ok: false, error: "not_collecting" });
  }

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/add_waitlist`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        p_email: email,
        p_region: region || null,
        p_locale: locale || null,
        p_source: source,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return respond({ ok: false, error: "not_saved" });
    // The DB function uses `on conflict (email) do nothing`, so a duplicate
    // signup returns ok:true from here without the user needing to know that
    // their email was already captured. Keeps the UX friendly either way.
    return respond({ ok: true });
  } catch {
    return respond({ ok: false, error: "not_saved" });
  }
}
