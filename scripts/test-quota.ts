// Server-side quota invariants (lib/quota.ts): voice/screenshot/check/fix
// daily limits. Like lib/push.ts, this had zero automated coverage despite
// being the thing that stands between "feature works" and "silently caps
// everyone at zero" if its fallback logic is ever wrong — see the comment
// in consumeQuota() about the 503-that-looked-like-a-real-limit incident.
//
// Deliberately run with NO SUPABASE_URL / SUPABASE_ANON_KEY in the
// environment, so every DB-backed path (isPaid, getEntitlement, rpc) takes
// its documented offline fallback deterministically — no live database,
// no network, no secrets. If this file is ever run with those env vars
// set, the isPaid/consumeQuota checks below would try the real RPC path
// instead and could behave differently, so it fails loudly up front.
//
// Run: npm run test:quota

import {
  consumeQuota,
  deviceCookie,
  DEVICE_COOKIE,
  getEntitlement,
  isPaid,
  LIMITS,
  newDeviceId,
  readDeviceId,
  refundQuota,
  sha256,
  type QuotaKind,
} from "../lib/quota";

if (process.env.SUPABASE_URL || process.env.SUPABASE_ANON_KEY) {
  console.error("test-quota.ts must run with no SUPABASE_URL/SUPABASE_ANON_KEY set — it tests the offline fallback path specifically.");
  process.exit(1);
}

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });

function req(cookie = "", headers: Record<string, string> = {}): Request {
  return new Request("https://getfreezefix.com/api/fix", { headers: { cookie, ...headers } });
}

// -- LIMITS shape -------------------------------------------------------------

{
  const kinds: QuotaKind[] = ["voice", "screenshot", "check", "fix"];
  for (const k of kinds) {
    check(`limits-${k}-paid-gte-free`, LIMITS[k].paid >= LIMITS[k].free, `paid (${LIMITS[k].paid}) must be >= free (${LIMITS[k].free}) for ${k}`);
    check(`limits-${k}-free-positive`, LIMITS[k].free > 0, `${k} free limit must be > 0 (help/typing must never be limited, but these kinds are)`);
  }
}

// -- device id / cookie --------------------------------------------------------

{
  const id = newDeviceId();
  check("newDeviceId-is-uuid-shape", /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id), id);

  const cookieHeader = deviceCookie(id);
  check("deviceCookie-has-name", cookieHeader.startsWith(`${DEVICE_COOKIE}=${id}`));
  check("deviceCookie-is-httponly", cookieHeader.includes("HttpOnly"));
  check("deviceCookie-is-secure", cookieHeader.includes("Secure"));
  check("deviceCookie-samesite-lax", cookieHeader.includes("SameSite=Lax"));

  // readDeviceId must parse the id back out of a real browser Cookie header,
  // whether it's alone or mixed in with other cookies, but reject junk.
  check("readDeviceId-alone", readDeviceId(req(`${DEVICE_COOKIE}=${id}`)) === id);
  check("readDeviceId-among-others", readDeviceId(req(`theme=dark; ${DEVICE_COOKIE}=${id}; ff_q=xyz`)) === id);
  check("readDeviceId-missing", readDeviceId(req("theme=dark")) === null);
  check("readDeviceId-malformed-value-rejected", readDeviceId(req(`${DEVICE_COOKIE}=not-a-uuid`)) === null, "a non-UUID cookie value must not be treated as a device id");
  check("readDeviceId-no-cookie-header", readDeviceId(req()) === null);
}

// -- sha256 --------------------------------------------------------------------

async function sha256Checks() {
  const h1 = await sha256("hello");
  check("sha256-is-64-hex-chars", /^[0-9a-f]{64}$/.test(h1), h1);
  const h2 = await sha256("hello");
  check("sha256-deterministic", h1 === h2);
  const h3 = await sha256("hellO");
  check("sha256-case-sensitive-differs", h1 !== h3);
}

// -- isPaid / getEntitlement, offline (no DB configured) ----------------------

async function entitlementChecks() {
  const id = newDeviceId();
  const ent = await getEntitlement(id);
  check("getEntitlement-offline-fails-closed", ent.active === false, JSON.stringify(ent));
  check("getEntitlement-offline-status-unknown", ent.status === "unknown", JSON.stringify(ent));

  const paid = await isPaid(id);
  check("isPaid-offline-is-false", paid === false, "with no DB configured, nobody should ever be treated as paid");
}

// -- consumeQuota / cookie fallback --------------------------------------------

async function consumeQuotaChecks() {
  const deviceId = newDeviceId();

  // First call for a fresh device/kind: no cookie yet, must be allowed and
  // hand back a Set-Cookie the caller is required to forward.
  const r1 = await consumeQuota(req(), deviceId, "voice");
  check("consume-first-call-allowed", r1.allowed === true, JSON.stringify(r1));
  check("consume-first-call-used-is-1", r1.used === 1, JSON.stringify(r1));
  check("consume-first-call-limit-matches-free", r1.limit === LIMITS.voice.free);
  check("consume-first-call-sets-cookie", typeof r1.setCookie === "string" && r1.setCookie.length > 0);

  // Feed that Set-Cookie back in as the next request's Cookie header, like a
  // real browser would, and confirm the count actually increments rather
  // than resetting every call (the bug this whole fallback exists to avoid).
  const cookieValue = (r1.setCookie as string).split(";")[0];
  let cookie = cookieValue;
  let last = r1;
  for (let i = 2; i <= LIMITS.voice.free; i++) {
    last = await consumeQuota(req(cookie), deviceId, "voice");
    check(`consume-call-${i}-allowed`, last.allowed === true, JSON.stringify(last));
    check(`consume-call-${i}-used-is-${i}`, last.used === i, JSON.stringify(last));
    cookie = (last.setCookie as string).split(";")[0];
  }

  // One more than the limit must be refused, not silently allowed.
  const over = await consumeQuota(req(cookie), deviceId, "voice");
  check("consume-over-limit-refused", over.allowed === false, JSON.stringify(over));
  check("consume-over-limit-reason", over.reason === "limit");
  check("consume-over-limit-no-new-cookie", over.setCookie === undefined, "a refused call must not hand back a cookie that would re-grant the allowance");

  // Different kinds must have independent counters within the same cookie.
  const screenshotFirst = await consumeQuota(req(cookie), deviceId, "screenshot");
  check("consume-kinds-are-independent", screenshotFirst.allowed === true && screenshotFirst.used === 1, JSON.stringify(screenshotFirst));

  // A cookie dated to a previous day must not carry the count forward —
  // this is what makes it a DAILY limit.
  const staleDay = { d: "2000-01-01", c: { voice: LIMITS.voice.free } };
  const staleCookie = `ff_q=${encodeURIComponent(JSON.stringify(staleDay))}`;
  const freshDay = await consumeQuota(req(staleCookie), deviceId, "voice");
  check("consume-stale-day-resets-count", freshDay.allowed === true && freshDay.used === 1, JSON.stringify(freshDay));

  // A corrupted/garbage cookie must not crash the request or fail closed —
  // it should be treated the same as no cookie at all.
  const garbage = await consumeQuota(req("ff_q=not%20json%20at%20all"), deviceId, "voice");
  check("consume-garbage-cookie-does-not-throw", garbage.allowed === true && garbage.used === 1, JSON.stringify(garbage));

  // refundQuota must not throw even with no DB configured (it should just
  // swallow the rpc failure silently).
  try {
    await refundQuota(req(), deviceId, "voice");
    check("refundQuota-offline-does-not-throw", true);
  } catch (err) {
    check("refundQuota-offline-does-not-throw", false, String(err));
  }
}

async function main() {
  await sha256Checks();
  await entitlementChecks();
  await consumeQuotaChecks();

  const pass = results.filter((r) => r.ok).length;
  const fail = results.length - pass;
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
  }
  console.log(`Quota check: ${pass}/${results.length} passed`);
  if (fail > 0) process.exit(1);
}

main();
