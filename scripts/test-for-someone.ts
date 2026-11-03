// Shape test for lib/for-someone-copy.ts.
// Run: npm run test:for-someone
//
// Catches the handful of things that would make the page silently
// unusable or anti-supportive:
//   - Every locale's page has non-empty hero, sections and forward
//     message.
//   - Forward message is short enough to fit a text message (<= 400
//     chars) — a longer one won't get sent.
//   - Posture guard: "intervention" / "addict" / "enabling" never
//     appear AS ADVICE in the How-To bullets. They are allowed to
//     appear in the "what not to do" section (that's exactly where
//     they should be called out). This catches a future PR that
//     slides the DIY-intervention-style language into the supportive
//     bullets.

import { FOR_SOMEONE_COPY } from "../lib/for-someone-copy";
import { LOCALES } from "../lib/landing-copy";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });
const nonEmpty = (s: unknown) => typeof s === "string" && s.trim().length > 0;

// All four locales must exist with full page content.
for (const locale of LOCALES) {
  const c = FOR_SOMEONE_COPY[locale];
  const prefix = `SOMEONE-${locale.toUpperCase()}`;

  check(`${prefix}-metaTitle`, nonEmpty(c?.metaTitle));
  check(`${prefix}-metaDescription`, nonEmpty(c?.metaDescription));
  check(`${prefix}-kicker`, nonEmpty(c?.kicker));
  check(`${prefix}-heroH1`, nonEmpty(c?.heroH1));
  check(`${prefix}-heroLead`, nonEmpty(c?.heroLead));
  check(`${prefix}-whoHeading`, nonEmpty(c?.whoHeading));
  check(`${prefix}-whoParagraphs-2+`, (c?.whoParagraphs?.length ?? 0) >= 2);
  check(`${prefix}-whoParagraphs-nonempty`, (c?.whoParagraphs ?? []).every(nonEmpty));
  check(`${prefix}-howHeading`, nonEmpty(c?.howHeading));
  check(`${prefix}-howIntro`, nonEmpty(c?.howIntro));
  check(`${prefix}-howBullets-4+`, (c?.howBullets?.length ?? 0) >= 4);
  check(`${prefix}-howBullets-nonempty`, (c?.howBullets ?? []).every(nonEmpty));
  check(`${prefix}-notHeading`, nonEmpty(c?.notHeading));
  check(`${prefix}-notIntro`, nonEmpty(c?.notIntro));
  check(`${prefix}-notBullets-4+`, (c?.notBullets?.length ?? 0) >= 4);
  check(`${prefix}-notBullets-nonempty`, (c?.notBullets ?? []).every(nonEmpty));
  check(`${prefix}-forwardHeading`, nonEmpty(c?.forwardHeading));
  check(`${prefix}-forwardIntro`, nonEmpty(c?.forwardIntro));
  check(`${prefix}-forwardMessage`, nonEmpty(c?.forwardMessage));
  check(`${prefix}-forwardCopyLabel`, nonEmpty(c?.forwardCopyLabel));
  check(`${prefix}-forwardCopiedLabel`, nonEmpty(c?.forwardCopiedLabel));
  check(`${prefix}-backHome`, nonEmpty(c?.backHome));

  // Forward message must fit in an SMS. Hard cap at 400 (a soft target —
  // GSM-7 is 160 per SMS, UCS-2 is 70; 400 is three segments which most
  // carriers concatenate for free. Longer than that and Clara won't send it.)
  check(`${prefix}-forward-length-<=400`,
    (c?.forwardMessage?.length ?? 0) <= 400,
    `forwardMessage is ${c?.forwardMessage?.length ?? 0} chars; cap is 400`);

  // Posture guard: anti-intervention language must stay in the "what not
  // to do" section, not in the supportive bullets. "Intervention" / "addict"
  // in the howBullets would be a slip.
  const howJoined = (c?.howBullets ?? []).join(" ").toLowerCase();
  const forbiddenInHow = locale === "de"
    ? ["intervention", "sucht", "abhängig"]
    : locale === "fr"
    ? ["intervention", "dépendance", "accro"]
    : locale === "nl"
    ? ["interventie", "verslaving"]
    : ["intervention", "addict", "addiction", "enabling"];
  for (const bad of forbiddenInHow) {
    if (howJoined.includes(bad)) {
      check(`${prefix}-how-no-${bad.replace(/[^a-z]/gi, "")}`, false,
        `howBullets contain "${bad}" — belongs in notBullets, not howBullets`);
    }
  }

  // "What not to do" MUST include the anti-intervention line explicitly.
  // It is the single most important piece of advice on the page.
  const notJoined = (c?.notBullets ?? []).join(" ").toLowerCase();
  const interventionWord = locale === "de" || locale === "en" || locale === "fr"
    ? "intervention"
    : "interventie";
  check(`${prefix}-not-has-intervention-warning`,
    notJoined.includes(interventionWord),
    `notBullets must warn against "${interventionWord}"`);
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`For-Someone check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
