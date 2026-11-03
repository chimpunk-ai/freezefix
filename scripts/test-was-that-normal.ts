// Shape + posture test for lib/was-that-normal-copy.ts.
// Run: npm run test:was-that-normal
//
// Clinical / posture guards:
//   - Every locale has non-empty hero + three content sections + closing.
//   - The page MUST open with reassurance ("fine" / "ok" / "bien" /
//     "goed") in the heroH1 — Sophie's whole finding is that the FIRST
//     thing a mildly-anxious post-party reader sees needs to put her at
//     ease.
//   - The page MUST NOT recommend or glorify cannabis use. The
//     "what to do with this" section is allowed to mention there might
//     be a next time, but it must NOT prescribe how to use next time
//     (no dose advice, no strain advice, no timing advice). "Smaller
//     dose next time" / "petite quantité la prochaine fois" and
//     equivalents are banned here.

import { WAS_THAT_NORMAL_COPY } from "../lib/was-that-normal-copy";
import { LOCALES } from "../lib/landing-copy";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });
const nonEmpty = (s: unknown) => typeof s === "string" && s.trim().length > 0;

for (const locale of LOCALES) {
  const c = WAS_THAT_NORMAL_COPY[locale];
  const prefix = `WTN-${locale.toUpperCase()}`;

  check(`${prefix}-metaTitle`, nonEmpty(c?.metaTitle));
  check(`${prefix}-metaDescription`, nonEmpty(c?.metaDescription));
  check(`${prefix}-kicker`, nonEmpty(c?.kicker));
  check(`${prefix}-heroH1`, nonEmpty(c?.heroH1));
  check(`${prefix}-heroLead`, nonEmpty(c?.heroLead));
  check(`${prefix}-normalHeading`, nonEmpty(c?.normalHeading));
  check(`${prefix}-normalParagraphs-2+`, (c?.normalParagraphs?.length ?? 0) >= 2);
  check(`${prefix}-normalParagraphs-nonempty`, (c?.normalParagraphs ?? []).every(nonEmpty));
  check(`${prefix}-whyHeading`, nonEmpty(c?.whyHeading));
  check(`${prefix}-whyParagraphs-2+`, (c?.whyParagraphs?.length ?? 0) >= 2);
  check(`${prefix}-whyParagraphs-nonempty`, (c?.whyParagraphs ?? []).every(nonEmpty));
  check(`${prefix}-nextHeading`, nonEmpty(c?.nextHeading));
  check(`${prefix}-nextParagraphs-2+`, (c?.nextParagraphs?.length ?? 0) >= 2);
  check(`${prefix}-nextParagraphs-nonempty`, (c?.nextParagraphs ?? []).every(nonEmpty));
  check(`${prefix}-closingHeading`, nonEmpty(c?.closingHeading));
  check(`${prefix}-closingLead`, nonEmpty(c?.closingLead));
  check(`${prefix}-closingToHomeLabel`, nonEmpty(c?.closingToHomeLabel));
  check(`${prefix}-closingToHomeCaption`, nonEmpty(c?.closingToHomeCaption));
  check(`${prefix}-closingToHelpLabel`, nonEmpty(c?.closingToHelpLabel));
  check(`${prefix}-closingToHelpCaption`, nonEmpty(c?.closingToHelpCaption));

  // HeroH1 MUST open with reassurance — that's the whole point of the page.
  const heroLower = (c?.heroH1 ?? "").toLowerCase();
  const reassuring = locale === "de"
    ? ["gut", "ok", "normal"]
    : locale === "fr"
    ? ["bien", "normal", "d'accord"]
    : locale === "nl"
    ? ["goed", "ok", "normaal"]
    : ["fine", "ok", "okay", "normal"];
  const hasReassurance = reassuring.some((w) => heroLower.includes(w));
  check(`${prefix}-hero-reassures`, hasReassurance,
    `heroH1 must open with reassurance (one of ${JSON.stringify(reassuring)}); got: ${c?.heroH1}`);

  // No dose / strain / timing advice anywhere on the page. These frames
  // violate the product rule: "Do not frame cannabis or other substance
  // use as harmless, prescribe when to use it, or encourage use."
  const allProse = [
    c?.heroLead,
    ...(c?.normalParagraphs ?? []),
    ...(c?.whyParagraphs ?? []),
    ...(c?.nextParagraphs ?? []),
    c?.closingLead,
  ].filter(Boolean).join(" ").toLowerCase();

  const forbiddenAdvice = locale === "de"
    ? ["kleinere dosis", "weniger nehmen", "bessere sorte", "sorte", "indica statt sativa"]
    : locale === "fr"
    ? ["plus petite dose", "moins la prochaine fois", "meilleure variété", "indica plutôt que sativa"]
    : locale === "nl"
    ? ["kleinere dosis", "minder nemen", "betere soort", "indica in plaats van sativa"]
    : ["smaller dose next time", "take less next time", "better strain", "try indica", "indica not sativa"];
  for (const bad of forbiddenAdvice) {
    if (allProse.includes(bad)) {
      check(`${prefix}-no-dose-advice-${bad.replace(/[^a-z]/gi, "")}`, false,
        `prose contains dose/strain advice: "${bad}"`);
    }
  }
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Was-that-normal check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
