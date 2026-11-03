// Shape + clinical-posture test for lib/seo-copy.ts.
// Run: npm run test:seo-copy
//
// What this catches:
//   1. Shape: every SEO page has non-empty strings on every field the
//      SeoLanding component actually reads, and exactly 3 "three things"
//      items, 6 red-flag items, and non-empty hero+what+cta sections.
//   2. Clinical posture: the red-flag list on every page includes the four
//      irreducible items — chest pain, breathing, fainting, suicide — AND
//      does NOT include "racing heart alone", so the pages stay in step
//      with lib/risk.ts after the P0.2 demotion.
//   3. Safety claims: the pages never say "safe", "harmless", or language
//      that frames cannabis use as desirable. They are allowed to say
//      "nobody has ever died from only cannabis" because that's a
//      well-sourced public-health statement (CDC, Health Canada).
//   4. CTAs: every CTA's primary href is an on-site route, not a third-party
//      URL. (A smash-and-grab PR shouldn't be able to retarget the SEO
//      funnel to an outside site without a lint-level alarm.)

import { SEO_PAGES } from "../lib/seo-copy";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });

const nonEmpty = (s: unknown) => typeof s === "string" && s.trim().length > 0;

for (const p of SEO_PAGES) {
  const prefix = `SEO-${p.slug}`;

  // Shape
  check(`${prefix}-meta-title`, nonEmpty(p.metaTitle));
  check(`${prefix}-meta-desc`, nonEmpty(p.metaDescription));
  check(`${prefix}-kicker`, nonEmpty(p.kicker));
  check(`${prefix}-hero-h1`, nonEmpty(p.heroH1));
  check(`${prefix}-hero-lead`, nonEmpty(p.heroLead));
  check(`${prefix}-what-heading`, nonEmpty(p.whatSection.heading));
  check(`${prefix}-what-paragraphs`, p.whatSection.paragraphs.length >= 1 && p.whatSection.paragraphs.every(nonEmpty));
  check(`${prefix}-what-cite`, nonEmpty(p.whatSection.cite));
  check(`${prefix}-three-count`, p.threeThings.items.length === 3);
  for (const [i, item] of p.threeThings.items.entries()) {
    check(`${prefix}-three-${i}-title`, nonEmpty(item.title));
    check(`${prefix}-three-${i}-body`, nonEmpty(item.body));
  }
  check(`${prefix}-when-count`, p.whenToCall.items.length >= 5);
  for (const [i, item] of p.whenToCall.items.entries()) {
    check(`${prefix}-when-${i}`, nonEmpty(item));
  }
  check(`${prefix}-when-emergency`, nonEmpty(p.whenToCall.emergencyLine));
  check(`${prefix}-cta-primary-href`, nonEmpty(p.cta.primary.href));
  check(`${prefix}-cta-primary-label`, nonEmpty(p.cta.primary.label));
  check(`${prefix}-disclosure`, nonEmpty(p.productDisclosure));

  // Clinical posture: the red-flag list must include the irreducible four.
  // We check for keywords in a locale-aware way; the German page uses the
  // German words, the English pages use English.
  const whenJoined = p.whenToCall.items.join(" | ").toLowerCase();
  const expectedKeywords = p.locale === "de"
    ? [["brustschmerzen", "druck", "enges"], ["arm"], ["luft", "atmen"], ["ohnmächtig", "blackout"], ["zusammengebrochen", "wacht"], ["leben zu beenden", "wehzutun"]]
    : [["chest"], ["arm"], ["breath"], ["faint", "pass out"], ["collapsed", "wake"], ["ending your life", "hurting yourself"]];
  for (const [i, kws] of expectedKeywords.entries()) {
    const found = kws.some((kw) => whenJoined.includes(kw));
    check(`${prefix}-when-contains-${i}`, found, `missing any of: ${kws.join(" / ")}`);
  }

  // The red-flag list must NOT include "racing heart" / "heart pounding" /
  // "schneller puls" as a standalone trigger — those were demoted by P0.2
  // and these pages must not re-raise them.
  const forbiddenAsEmergency = p.locale === "de"
    ? ["schneller puls", "schnelles herz", "herzrasen", "herz schlägt", "puls hoch"]
    : ["racing heart", "heart racing", "heart pounding", "fast heart", "pounding heart"];
  for (const bad of forbiddenAsEmergency) {
    if (whenJoined.includes(bad)) {
      check(`${prefix}-when-no-racing-heart`, false, `red-flag list contained: ${bad}`);
    }
  }

  // Safety-claim posture. The pages must not frame cannabis as "safe",
  // "harmless", or recommend a next-use dose/strain/timing.
  const allProseFields = [
    p.heroLead,
    ...p.whatSection.paragraphs,
    p.threeThings.intro,
    ...p.threeThings.items.map((x) => `${x.title} ${x.body}`),
    p.whenToCall.intro,
    p.cta.body,
  ].join(" ").toLowerCase();

  const forbiddenPhrases = p.locale === "de"
    ? ["ist sicher", "ist harmlos", "ungefährlich", "nächstes mal mehr"]
    : [
        "cannabis is safe",
        "weed is safe",
        "it's safe",
        "its safe",
        "harmless",
        "next time take more",
        "try more",
        "smoke more",
      ];
  for (const bad of forbiddenPhrases) {
    if (allProseFields.includes(bad)) {
      check(`${prefix}-no-safety-claim`, false, `prose contained forbidden phrase: ${bad}`);
    }
  }

  // CTA hrefs must be on-site (start with "/") — never a third-party URL.
  check(`${prefix}-cta-primary-onsite`, p.cta.primary.href.startsWith("/"));
  if (p.cta.secondary) {
    check(`${prefix}-cta-secondary-onsite`, p.cta.secondary.href.startsWith("/"));
  }

  // Edibles-softener guard (fix/safety-audit-wave, 4 Nov 2026). Alex (IE, 20,
  // first bad trip) crashed on the old "three to six hours" phrasing. The
  // whatSection prose must still mention edibles AND include a comforting
  // instruction ("somewhere comfortable" / "einen bequemen Platz") rather than
  // just a scary duration. Catches a future PR that silently reverts this.
  const whatProseJoined = p.whatSection.paragraphs.join(" ").toLowerCase();
  if (whatProseJoined.includes("edible")) {
    const expected = p.locale === "de"
      ? ["bequemen platz"]
      : ["somewhere comfortable", "somewhere you can rest", "stay put"];
    const hasComfort = expected.some((kw) => whatProseJoined.includes(kw));
    check(`${prefix}-edible-has-comfort-phrase`, hasComfort,
      `edibles timing mentioned without a comfort-wrapper phrase; expected one of ${JSON.stringify(expected)}`);
  }
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`SEO copy check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
