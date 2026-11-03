// Smoke tests for lib/resources.ts.
// Run: npm run test:resources
//
// This file isn't trying to exercise every number — the Safety Pack owns
// verification of the exact strings and sources. What it DOES do: make sure
// every verified country has the shape the help-screen UI depends on, and
// specifically that France (added 3 November 2026 for Europe-audit P1.6) has
// the right contact lines, so Sophie-persona in Paris doesn't fall through to
// the generic "OTHER" fallback and so a future refactor doesn't silently
// break her view.

import {
  RESOURCES,
  VERIFIED_COUNTRIES,
  OTHER_EMERGENCY_NUMBERS,
  resourcesFor,
  type Contact,
} from "../lib/resources";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];

function check(id: string, ok: boolean, note?: string) {
  results.push({ id, ok, note });
}

// ──────────────────────────────── Shape ────────────────────────────────
// Every verified country has non-empty emergency, at least one crisis line,
// at least one urgentMentalHealth, at least one substances, at least one
// youth. If one of these is empty, the help screen renders a blank row.
for (const c of VERIFIED_COUNTRIES) {
  const r = RESOURCES[c];
  check(`SHAPE-${c}-name`, Boolean(r?.name), `${c}.name`);
  check(`SHAPE-${c}-emergency`, Boolean(r?.emergency?.display), `${c}.emergency.display`);
  check(`SHAPE-${c}-crisis`, (r?.crisis?.length ?? 0) > 0, `${c}.crisis`);
  check(`SHAPE-${c}-urgent`, (r?.urgentMentalHealth?.length ?? 0) > 0, `${c}.urgentMentalHealth`);
  check(`SHAPE-${c}-subst`, (r?.substances?.length ?? 0) > 0, `${c}.substances`);
  check(`SHAPE-${c}-youth`, (r?.youth?.length ?? 0) > 0, `${c}.youth`);
}

// ────────────────────────── France specifics ──────────────────────────
// Verified against sante.fr (French Ministry of Health) on 3 Nov 2026.
const FR = RESOURCES.FR;
const findBy = (list: Contact[], tel: string) => list.find((x) => x.tel === tel);

// ───────────────────────── Australia specifics ─────────────────────────
// Verified against healthdirect.gov.au/mental-health-helplines (the Australian
// Government's official directory) on 4 November 2026. Added after the
// 15-persona audit flagged that AU falling to the OTHER bucket meant Priya
// (Melbourne, GAD) was being handed 000 and findahelpline.com instead of
// Lifeline or Beyond Blue.
const AU = RESOURCES.AU;
check("AU-emergency-000", AU.emergency.tel === "000");
check("AU-lifeline-crisis", Boolean(findBy(AU.crisis, "131114")));
check("AU-lifeline-text", Boolean(AU.crisis.find((c) => c.sms?.to === "0477131114")));
check("AU-lifeline-chat-url", AU.crisis.some((c) => (c.url ?? "").includes("lifeline.org.au")));
check("AU-beyondblue-crisis", Boolean(findBy(AU.crisis, "1300224636")));
check("AU-suicide-callback", Boolean(findBy(AU.crisis, "1300659467")));
check("AU-13yarn-first-nations", Boolean(findBy(AU.crisis, "139276")));
check("AU-lifeline-urgent", Boolean(findBy(AU.urgentMentalHealth, "131114")));
check("AU-beyondblue-urgent", Boolean(findBy(AU.urgentMentalHealth, "1300224636")));
check("AU-national-aod", Boolean(findBy(AU.substances, "1800250015")));
check("AU-kids-helpline-youth", Boolean(findBy(AU.youth, "1800551800")));
check("AU-youth-night-backup", AU.youthNightBackup?.tel === "131114");

check("FR-emergency-112", FR.emergency.tel === "112");
check("FR-3114-crisis", Boolean(findBy(FR.crisis, "3114")));
check("FR-SOS-amitie-fr", Boolean(findBy(FR.crisis, "0972394050")));
check("FR-SOS-amitie-en", Boolean(findBy(FR.crisis, "0146214646")));
check(
  "FR-SOS-chat-link",
  FR.crisis.some((x) => x.url === "https://www.sos-amitie.com")
);
check("FR-3114-urgent", Boolean(findBy(FR.urgentMentalHealth, "3114")));
check("FR-drogues-info-service", Boolean(findBy(FR.substances, "0800231313")));
check("FR-3114-substances-backup", Boolean(findBy(FR.substances, "3114")));
check("FR-fil-sante-jeunes", Boolean(findBy(FR.youth, "0800235236")));
check("FR-youth-night-backup", FR.youthNightBackup?.tel === "3114");

// ────────────────────────── Resolver semantics ──────────────────────────
// resourcesFor should route FR to the verified set (not OTHER), carry the
// country code through, and still give OTHER countries the right 112.
const resolvedFR = resourcesFor("FR");
check("RESOLVE-FR-is-verified", resolvedFR.code === "FR");
check("RESOLVE-FR-has-3114", Boolean(findBy(resolvedFR.crisis, "3114")));

const resolvedPT = resourcesFor("PT");
check("RESOLVE-PT-falls-to-OTHER", resolvedPT.code === "OTHER");
check("RESOLVE-PT-emergency-112", resolvedPT.emergency.tel === "112");
check("OTHER-ES-still-112", OTHER_EMERGENCY_NUMBERS.ES === "112");

const resolvedAU = resourcesFor("AU");
check("RESOLVE-AU-is-verified", resolvedAU.code === "AU");
check("RESOLVE-AU-emergency-000", resolvedAU.emergency.tel === "000");
check("RESOLVE-AU-has-lifeline", Boolean(findBy(resolvedAU.crisis, "131114")));

// ────────────────────────── Non-regression ──────────────────────────
// If any of these fall over, something unrelated to FR has been touched.
check("DE-samu-still-116117", Boolean(findBy(RESOURCES.DE.urgentMentalHealth, "116117")));
check("NL-113-still-crisis", Boolean(findBy(RESOURCES.NL.crisis, "113")));
check("GB-samaritans-still-crisis", Boolean(findBy(RESOURCES.GB.crisis, "116123")));
check("IN-tele-manas-still-crisis", Boolean(findBy(RESOURCES.IN.crisis, "14416")));

// ─────────────────────────────── Report ───────────────────────────────
const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Resources check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
