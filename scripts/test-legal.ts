// Legal copy vs. shipped code.
// Run: npm run test:legal
//
// The privacy policy, terms and the at-a-glance card must describe the product
// in this repository, not the one it replaced. This file catches the drift that
// bit us in November 2026: the policy kept describing "moments", "moves" and
// screenshot uploads months after those surfaces were deleted, and claimed a
// consent checkbox the onboarding never showed.
//
// It is deliberately a string check over source files — the same approach as
// scripts/test-pwa.ts — so it runs with no Next.js runtime and fails loudly in
// CI when someone edits the product and forgets the policy, or vice versa.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PRIVACY, TERMS, REFUNDS, LAST_UPDATED } from "../lib/legal";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

const summary = read("components/PrivacySummary.tsx");
const appClient = read("components/AppClient.tsx");
const plans = read("app/plans/page.tsx");
const landing = read("components/Landing.tsx");
const helpScreen = read("components/HelpScreen.tsx");
const onboarding = read("components/Onboarding.tsx");

const legal = [
  ["PRIVACY", PRIVACY],
  ["TERMS", TERMS],
  ["REFUNDS", REFUNDS],
  ["SUMMARY", summary],
] as const;

// ───────────── Retired product features must not be described as live ─────────────
// Each of these named a surface of the old "unfreeze me" product. None exist in
// app/ or components/ any more. If one of them comes back, add the real
// description to lib/legal.ts and remove the phrase here in the same PR.
const RETIRED = [
  /the moment you pick/i,
  /\b3 moves\b/i,
  /\bthree moves\b/i,
  /\bwins? log\b/i,
  /scenario history/i,
  /patterns page/i,
  /image you choose to share/i,
  /screenshot/i,
  /home check-in/i,
  /\binsights\b/i,
  /FreezeFix Plus/i,
  /future-plan/i,
  /Did it help/i,
  /tick a box before your first session/i,
  /Sends account and reminder emails/i,
];
for (const [name, text] of legal) {
  for (const re of RETIRED) {
    check(`RETIRED-${name}-${re.source.slice(0, 24)}`, !re.test(text), `${name} still mentions ${re}`);
  }
}

// ───────────── The real product must be described ─────────────
const REAL: Array<[string, RegExp]> = [
  ["log-stays-on-phone", /stays? on your phone/i],
  ["sunday-card", /Sunday card/i],
  ["ask-fix-button", /ask Fix about this week/i],
  ["seven-nights-sent", /last seven nights/i],
  ["anthropic-named", /Anthropic/],
  ["voice-off-today", /switched off/i],
  ["voice-remote-not-browser", /not (inside|in) your browser/i],
  ["device-cookie-named", /ff_did/],
  ["forget-everything", /forget everything/i],
  ["no-account", /no account/i],
];
for (const [id, re] of REAL) {
  check(`REAL-PRIVACY-${id}`, re.test(PRIVACY), `privacy policy should say: ${re}`);
}
check("REAL-TERMS-mirror", /mirror/i.test(TERMS));
check("REAL-TERMS-free-week-does-not-end", /free week does not end/i.test(TERMS));
check("REAL-TERMS-no-card", /does not ask for a card/i.test(TERMS));
check("REAL-TERMS-help-free", /\/help/.test(TERMS));
check("REAL-REFUNDS-nothing-today", /nothing to refund today/i.test(REFUNDS));
check("REAL-SUMMARY-nightly-log", /nightly log/i.test(summary));
check("REAL-SUMMARY-voice-off", /Switched off today/i.test(summary));
check("REAL-SUMMARY-payments-off", /Not switched on/i.test(summary));

// ───────────── Brand: the product is Fix; the legal entity is FreezeFix ─────────────
check("BRAND-privacy-h1", /^# Fix Privacy Policy$/m.test(PRIVACY));
check("BRAND-terms-h1", /^# Fix Terms of Use$/m.test(TERMS));
check("BRAND-trading-as", /trading as FreezeFix/.test(PRIVACY) && /trading as FreezeFix/.test(TERMS));
check("BRAND-help-copy-uses-fix", !/\bFreezeFix\b/.test(helpScreen), "HelpScreen body copy should say Fix");
check("BRAND-summary-uses-fix", !/\bFreezeFix\b/.test(summary));

// ───────────── Claims that depend on code must have the code ─────────────
// Terms §5: "until payments are switched on, the free week does not end".
// True only while AppClient gates the lockout on paymentsOn.
check(
  "CODE-lockout-gated-on-paymentsOn",
  /locked\s*=\s*Boolean\([^)]*paymentsOn\)/.test(appClient),
  "AppClient must include paymentsOn in the `locked` expression, or Terms §5 is false"
);
// Plans page: 5 free / 20 paid, matching lib/quota.ts LIMITS.fix.
check("CODE-plans-fix-limits", /five questions a day on the free week, twenty a day on the paid/.test(plans));
// Landing must not claim in-browser transcription (the route uploads audio).
check("CODE-landing-no-browser-transcription", !/in the browser/i.test(landing) && !/throw the audio away/i.test(landing));
// Privacy §4 says voice is off; lib/features.ts must still default it off.
check("CODE-voice-default-off", /ENABLE_VOICE === "true"/.test(read("lib/features.ts")));
// Terms §2 says "18 or over (or the age of adulthood where you live, if higher)";
// the gate must ask the same thing, not just "18 or over".
check("CODE-age-gate-matches-terms", /adult where you live|age of adulthood/i.test(onboarding), "age gate copy should match Terms §2");

// Privacy §9: "forget everything" removes every ff_* key the app writes.
// Collect the keys from the lib files and make sure forget() clears each one.
{
  const keyFiles = ["lib/entry.ts", "lib/profile.ts", "lib/mirror.ts", "lib/chime-pref.ts", "components/HelpPage.tsx"];
  const keys = new Set<string>();
  for (const f of keyFiles) for (const m of read(f).matchAll(/["'](ff_[a-z_]+)["']/g)) keys.add(m[1]);
  check("CODE-forget-keys-found", keys.size >= 6, `found ${[...keys].join(", ")}`);
  const forgetBody = appClient.slice(appClient.indexOf("function forget()"));
  const clears = {
    ff_entries: /clearEntries\(\)/,
    ff_profile: /clearProfile\(\)/,
    ff_mirror_seen: /clearSeen\(\)/,
    ff_chime: /clearChimePref\(\)/,
    ff_chime_asked: /clearChimePref\(\)/,
    ff_region: /removeItem\("ff_region"\)/,
  } as Record<string, RegExp>;
  for (const k of keys) {
    check(`CODE-forget-clears-${k}`, Boolean(clears[k]) && clears[k].test(forgetBody), `forget() must clear ${k}`);
  }
}

// ───────────── Dates ─────────────
check("DATE-last-updated-set", /^\d{1,2} \w+ 20\d\d$/.test(LAST_UPDATED), `LAST_UPDATED = ${LAST_UPDATED}`);

// ───────────── runner ─────────────
const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Legal copy check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
