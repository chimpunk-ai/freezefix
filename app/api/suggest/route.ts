import { NextResponse } from "next/server";
import { consumeQuota, readDeviceId, newDeviceId, deviceCookie } from "@/lib/quota";
import { keywordCheck } from "@/lib/risk";

// Suggestions from visitors while the app is being finished.
//
// The only endpoint that stores words somebody typed, so it is kept thin on purpose:
// the answer, their words, an optional contact, a country. No device id and no IP are
// stored with it, even though a device cookie is used to rate-limit, because joining a
// suggestion back to a person is exactly what this product promises not to do.
//
// The safety check runs here too. A suggestion box is a place someone might say something
// serious, and it would be inexcusable to file that as feedback and move on.

export const dynamic = "force-dynamic";

const NEEDED = ["yes", "maybe", "no"] as const;

export async function POST(req: Request) {
  let deviceId = readDeviceId(req);
  const isNew = !deviceId;
  if (!deviceId) deviceId = newDeviceId();

  // Captured by `respond`: when the Supabase-less fallback counter in consumeQuota
  // returns a Set-Cookie, we must apply it or the fallback never persists its count.
  let countCookie: string | null = null;
  const respond = (body: unknown, status = 200) => {
    const res = NextResponse.json(body, { status });
    if (isNew) res.headers.append("Set-Cookie", deviceCookie(deviceId!));
    if (countCookie) res.headers.append("Set-Cookie", countCookie);
    return res;
  };

  let body: { needed?: string; words?: string; contact?: string; country?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return respond({ error: "bad_request" }, 400);
  }

  const needed = NEEDED.includes(body.needed as (typeof NEEDED)[number]) ? body.needed! : null;
  if (!needed) return respond({ error: "bad_request" }, 400);

  const words = String(body.words ?? "").trim().slice(0, 600);
  const contact = String(body.contact ?? "").trim().slice(0, 120);
  const country = String(body.country ?? "").trim().slice(0, 8);

  // If someone uses this box to say something urgent, they get the help screen, and the
  // words are not filed as a suggestion.
  const risk = keywordCheck(words);
  if (risk.level >= 3 || risk.underage) {
    return respond({ ok: true, route: true, level: risk.level, screen: risk.screen, underage: risk.underage });
  }

  // A few per device per day is plenty for honest feedback and stops the box being flooded.
  const quota = await consumeQuota(req, deviceId, "check");
  countCookie = quota.setCookie ?? null;
  if (!quota.allowed) return respond({ ok: true, throttled: true });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    // Nowhere to put it yet. Say so honestly rather than showing a thank-you for something
    // that went in the bin.
    return respond({ ok: false, error: "not_collecting" });
  }

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/add_suggestion`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        p_needed: needed,
        p_words: words || null,
        p_contact: contact || null,
        p_country: country || null,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return respond({ ok: false, error: "not_saved" });
    return respond({ ok: true });
  } catch {
    return respond({ ok: false, error: "not_saved" });
  }
}
