// Web Push invariants (lib/push.ts).
//
// This is the one piece of the reminders feature that had a long trail of
// "diag:" commits fighting a production crash (see feat/real-product-round,
// abandoned, and feat/reminders-web-push, merged) and still had zero
// automated coverage. These are all pure/deterministic functions — no
// network, no real VAPID secrets, no Supabase — so there's no excuse not
// to test them.
//
// Run: npm run test:push

import { webcrypto } from "node:crypto";
import {
  b64urlDecode,
  b64urlEncode,
  dueKinds,
  importVapidPrivateKey,
  localNow,
  parseSubscribeBody,
  vapidJwt,
  type Subscription,
} from "../lib/push";

// Node's webcrypto isn't global in every tsx invocation; lib/push.ts calls
// the bare `crypto` global, so make sure it's wired up here the same way
// Workers/browsers provide it.
if (typeof (globalThis as { crypto?: unknown }).crypto === "undefined") {
  (globalThis as { crypto?: unknown }).crypto = webcrypto;
}

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });

// -- base64url round trip ----------------------------------------------------

{
  const samples = [new Uint8Array([]), new Uint8Array([0]), new Uint8Array([255, 254, 1, 0, 128]), webcrypto.getRandomValues(new Uint8Array(65))];
  samples.forEach((s, i) => {
    const enc = b64urlEncode(s);
    check(`b64url-no-padding-${i}`, !enc.includes("="), `encoded value still has padding: ${enc}`);
    check(`b64url-no-plus-slash-${i}`, !enc.includes("+") && !enc.includes("/"));
    const dec = b64urlDecode(enc);
    check(`b64url-roundtrip-${i}`, dec.length === s.length && dec.every((b, j) => b === s[j]));
  });
}

// -- localNow -----------------------------------------------------------------

{
  // A fixed UTC instant with known wall-clock equivalents.
  // 2026-11-15 is a Sunday. 20:00 UTC.
  const at = new Date("2026-11-15T20:00:00Z");
  const utc = localNow("UTC", at);
  check("localNow-utc-weekday", utc?.weekday === 0, `got ${JSON.stringify(utc)}`);
  check("localNow-utc-hour", utc?.hour === 20);

  // America/New_York is UTC-5 in November (no DST): 15:00 local, still Sunday.
  const ny = localNow("America/New_York", at);
  check("localNow-ny-hour", ny?.hour === 15, `got ${JSON.stringify(ny)}`);
  check("localNow-ny-weekday-same-day", ny?.weekday === 0);

  // Asia/Kolkata is UTC+5:30: 01:30 the NEXT day, Monday.
  const kol = localNow("Asia/Kolkata", at);
  check("localNow-kolkata-rolls-to-next-day", kol?.weekday === 1, `got ${JSON.stringify(kol)}`);
  check("localNow-kolkata-hour", kol?.hour === 1 && kol?.minute === 30, `got ${JSON.stringify(kol)}`);

  check("localNow-unknown-tz-returns-null", localNow("Not/AZone", at) === null);
  check("localNow-empty-tz-returns-null", localNow("", at) === null);
}

// -- dueKinds -------------------------------------------------------------------

function sub(over: Partial<Subscription> = {}): Pick<Subscription, "sunday" | "nightly" | "hour" | "tz" | "last_sent_sunday" | "last_sent_nightly"> {
  return {
    sunday: false,
    nightly: false,
    hour: 23,
    tz: "UTC",
    last_sent_sunday: null,
    last_sent_nightly: null,
    ...over,
  };
}

{
  // Sunday window is 20:15–20:24 local, weekday 0, opted in, never sent today.
  const sundayAt = new Date("2026-11-15T20:18:00Z"); // Sunday 20:18 UTC
  check(
    "due-sunday-in-window",
    dueKinds(sub({ sunday: true }), sundayAt).sunday === true,
  );
  check(
    "due-sunday-opted-out",
    dueKinds(sub({ sunday: false }), sundayAt).sunday === false,
  );
  check(
    "due-sunday-before-window",
    dueKinds(sub({ sunday: true }), new Date("2026-11-15T20:10:00Z")).sunday === false,
    "20:10 is before the 20:15 window opens",
  );
  check(
    "due-sunday-after-window",
    dueKinds(sub({ sunday: true }), new Date("2026-11-15T20:26:00Z")).sunday === false,
    "20:26 is after the 20:25 window closes",
  );
  check(
    "due-sunday-wrong-weekday",
    dueKinds(sub({ sunday: true }), new Date("2026-11-16T20:18:00Z")).sunday === false,
    "Monday at the same time of day must not fire the Sunday reminder",
  );
  check(
    "due-sunday-already-sent-today",
    dueKinds(sub({ sunday: true, last_sent_sunday: "2026-11-15" }), sundayAt).sunday === false,
    "must not double-send within the same local date",
  );
  check(
    "due-sunday-sent-a-different-date-still-due",
    dueKinds(sub({ sunday: true, last_sent_sunday: "2026-11-08" }), sundayAt).sunday === true,
    "a different last-sent date (last week) must not suppress this week's send",
  );
}

{
  // Nightly fires at the subscriber's own bedtime hour, minute < 10, once per local date.
  const at = new Date("2026-11-16T23:05:00Z"); // Monday 23:05 UTC
  check(
    "due-nightly-in-window",
    dueKinds(sub({ nightly: true, hour: 23 }), at).nightly === true,
  );
  check(
    "due-nightly-wrong-hour",
    dueKinds(sub({ nightly: true, hour: 22 }), at).nightly === false,
  );
  check(
    "due-nightly-minute-too-late",
    dueKinds(sub({ nightly: true, hour: 23 }), new Date("2026-11-16T23:15:00Z")).nightly === false,
    "minute 15 is outside the 0-9 window",
  );
  check(
    "due-nightly-already-sent-today",
    dueKinds(sub({ nightly: true, hour: 23, last_sent_nightly: "2026-11-16" }), at).nightly === false,
  );
  // The two windows are disjoint by minute (sunday: 15-24, nightly: 0-9), so
  // they can never both be true for the same tick even if someone's bedtime
  // hour is 20 on a Sunday — confirms that despite push.ts's own comment
  // ("one push covers both kinds if they ever coincide"), a coincidence is
  // actually impossible by construction. Not a bug: just documents it, so a
  // future change to either window's minute range gets caught here.
  check(
    "due-sunday-and-nightly-windows-never-overlap",
    (() => {
      const d1 = dueKinds(sub({ sunday: true, nightly: true, hour: 20 }), new Date("2026-11-15T20:18:00Z"));
      const d2 = dueKinds(sub({ sunday: true, nightly: true, hour: 20 }), new Date("2026-11-15T20:05:00Z"));
      // At 20:18 only sunday can fire (nightly needs minute<10); at 20:05 only
      // nightly can fire (sunday needs minute 15-24) — never both at once.
      return !(d1.sunday && d1.nightly) && !(d2.sunday && d2.nightly) && d1.sunday && d2.nightly;
    })(),
  );
  check(
    "due-unknown-tz-never-fires",
    (() => {
      const d = dueKinds(sub({ sunday: true, nightly: true, tz: "Not/AZone" }), at);
      return d.sunday === false && d.nightly === false;
    })(),
  );
}

// -- VAPID sign / verify round trip -------------------------------------------
// (async, so it's wrapped in main() below rather than run at the top level —
// tsx's cjs transform doesn't support top-level await.)

async function vapidChecks() {
  const pair = await webcrypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const rawPub = new Uint8Array(await webcrypto.subtle.exportKey("raw", pair.publicKey));
  const jwk = await webcrypto.subtle.exportKey("jwk", pair.privateKey);
  const pubB64 = b64urlEncode(rawPub);
  const privB64 = jwk.d as string;

  check("vapid-public-key-is-65-bytes", rawPub.length === 65 && rawPub[0] === 4);

  let signKey: Awaited<ReturnType<typeof importVapidPrivateKey>> | null = null;
  try {
    signKey = await importVapidPrivateKey(pubB64, privB64);
    check("vapid-import-succeeds", true);
  } catch (err) {
    check("vapid-import-succeeds", false, String(err));
  }

  if (signKey) {
    const jwt = await vapidJwt("https://push.example.com", signKey, 1_700_000_000);
    const parts = jwt.split(".");
    check("vapid-jwt-has-three-parts", parts.length === 3);

    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    check("vapid-jwt-payload-audience", payload.aud === "https://push.example.com");
    check("vapid-jwt-payload-expiry", payload.exp === 1_700_000_000 + 12 * 3600);
    check("vapid-jwt-payload-subject", payload.sub === "mailto:privacy@getfreezefix.com");

    // Verify the signature actually validates against the public key —
    // catches a derToJose mis-conversion that would otherwise only surface
    // as a silent push-service rejection in production.
    const verifyKey = await webcrypto.subtle.importKey("raw", rawPub, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
    const sigBytes = b64urlDecode(parts[2]);
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const valid = await webcrypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, verifyKey, sigBytes, data);
    check("vapid-jwt-signature-verifies", valid === true);
  }

  // Malformed keys must throw, not silently produce a bad key.
  try {
    await importVapidPrivateKey(b64urlEncode(new Uint8Array(64)), privB64); // wrong length, not 65, no 0x04 prefix
    check("vapid-rejects-bad-public-key-length", false, "should have thrown");
  } catch {
    check("vapid-rejects-bad-public-key-length", true);
  }
  try {
    await importVapidPrivateKey(pubB64, b64urlEncode(new Uint8Array(16))); // wrong length private scalar
    check("vapid-rejects-bad-private-key-length", false, "should have thrown");
  } catch {
    check("vapid-rejects-bad-private-key-length", true);
  }
}

// -- parseSubscribeBody (sync, runs at the top level as before) ---------------

{
  const GOOD = {
    endpoint: "https://fcm.googleapis.com/fcm/send/abcdefghijklmnopqrstuvwxyz",
    keys: { p256dh: "A".repeat(87), auth: "B".repeat(22) },
    kinds: { sunday: true, nightly: false },
    hour: 23,
    tz: "America/New_York",
  };
  const good = parseSubscribeBody(GOOD);
  check("parse-good-body-accepted", good !== null, JSON.stringify(good));
  check("parse-good-body-hour", good?.hour === 23);
  check("parse-good-body-kinds", good?.kinds.sunday === true && good?.kinds.nightly === false);

  check("parse-rejects-non-object", parseSubscribeBody(null) === null);
  check("parse-rejects-non-https-endpoint", parseSubscribeBody({ ...GOOD, endpoint: "http://fcm.googleapis.com/x".padEnd(30, "x") }) === null);
  check("parse-rejects-short-endpoint", parseSubscribeBody({ ...GOOD, endpoint: "https://a.b" }) === null);
  check("parse-rejects-missing-p256dh", parseSubscribeBody({ ...GOOD, keys: { auth: GOOD.keys.auth } }) === null);
  check("parse-rejects-bad-auth-chars", parseSubscribeBody({ ...GOOD, keys: { ...GOOD.keys, auth: "not valid!!" } }) === null);
  check("parse-rejects-hour-24", parseSubscribeBody({ ...GOOD, hour: 24 }) === null);
  check("parse-rejects-hour-negative", parseSubscribeBody({ ...GOOD, hour: -1 }) === null);
  check("parse-rejects-non-integer-hour", parseSubscribeBody({ ...GOOD, hour: 12.5 }) === null);
  check("parse-rejects-unknown-tz", parseSubscribeBody({ ...GOOD, tz: "Definitely/NotAZone" }) === null);
  check("parse-rejects-tz-with-weird-chars", parseSubscribeBody({ ...GOOD, tz: "America/New York; DROP TABLE" }) === null);
  check("parse-accepts-UTC", parseSubscribeBody({ ...GOOD, tz: "UTC" }) !== null);
  check("parse-defaults-missing-kinds-to-false", parseSubscribeBody({ ...GOOD, kinds: {} })?.kinds.sunday === false);
}

async function main() {
  await vapidChecks();

  const pass = results.filter((r) => r.ok).length;
  const fail = results.length - pass;
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
  }
  console.log(`Push reminders check: ${pass}/${results.length} passed`);
  if (fail > 0) process.exit(1);
}

main();
