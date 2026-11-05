// Shape test for lib/landing-sections-copy.ts.
// Run: npm run test:landing-sections
//
// The six new landing sections (scenarios, socialProof, pricingTeaser,
// privacyBand, faq, ageBadge) each carry enough strings that a dropped
// field in a translation PR would silently render an empty card. This
// test fails loud on that.

import { LANDING_SECTIONS } from "../lib/landing-sections-copy";
import { LOCALES } from "../lib/landing-copy";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) =>
  results.push({ id, ok, note });
const nonEmpty = (s: unknown) =>
  typeof s === "string" && s.trim().length > 0;

for (const locale of LOCALES) {
  const c = LANDING_SECTIONS[locale];
  const prefix = `SECTIONS-${locale.toUpperCase()}`;

  // scenarios: 6 cards, each with title + body.
  check(`${prefix}-scenarios-kicker`, nonEmpty(c.scenarios.kicker));
  check(`${prefix}-scenarios-heading`, nonEmpty(c.scenarios.heading));
  check(`${prefix}-scenarios-body`, nonEmpty(c.scenarios.body));
  check(`${prefix}-scenarios-6-cards`, c.scenarios.cards.length === 6);
  c.scenarios.cards.forEach((card, i) => {
    check(`${prefix}-scenario-${i}-title`, nonEmpty(card.title));
    check(`${prefix}-scenario-${i}-body`, nonEmpty(card.body));
  });

  // socialProof — every field required.
  for (const k of ["kicker", "heading", "body", "emptyLabel"] as const) {
    check(`${prefix}-social-${k}`, nonEmpty(c.socialProof[k]));
  }

  // pricingTeaser — three bullets each side, every field non-empty.
  for (const k of ["kicker", "heading", "body", "freeLabel", "freePrice", "proLabel", "proPrice", "proPerMonth", "ctaLabel", "foundingTag"] as const) {
    check(`${prefix}-pricing-${k}`, nonEmpty(c.pricingTeaser[k]));
  }
  check(`${prefix}-pricing-freeBullets-3`, c.pricingTeaser.freeBullets.length === 3);
  check(`${prefix}-pricing-proBullets-3`, c.pricingTeaser.proBullets.length === 3);
  c.pricingTeaser.freeBullets.forEach((b, i) =>
    check(`${prefix}-pricing-freeBullet-${i}`, nonEmpty(b))
  );
  c.pricingTeaser.proBullets.forEach((b, i) =>
    check(`${prefix}-pricing-proBullet-${i}`, nonEmpty(b))
  );

  // privacyBand — 3 bullets.
  check(`${prefix}-privacy-kicker`, nonEmpty(c.privacyBand.kicker));
  check(`${prefix}-privacy-heading`, nonEmpty(c.privacyBand.heading));
  check(`${prefix}-privacy-bullets-3`, c.privacyBand.bullets.length === 3);
  c.privacyBand.bullets.forEach((b, i) =>
    check(`${prefix}-privacy-bullet-${i}`, nonEmpty(b))
  );

  // FAQ — 5 Q&As.
  check(`${prefix}-faq-heading`, nonEmpty(c.faq.heading));
  check(`${prefix}-faq-items-5`, c.faq.items.length === 5);
  c.faq.items.forEach((item, i) => {
    check(`${prefix}-faq-${i}-q`, nonEmpty(item.q));
    check(`${prefix}-faq-${i}-a`, nonEmpty(item.a));
  });

  // 18+ badge.
  check(`${prefix}-ageBadge`, nonEmpty(c.ageBadge));
}

// English stop-word leak guard — the Grove landing pack already has this
// kind of regression, reuse the pattern here. "Fix" / "Pro" / "Paddle" stay
// allowed. Lots of alt-locale strings include the English anglicism
// "craving" / "greened out" by design — do NOT ban those.
const EN_STOPWORDS: Record<string, RegExp> = {
  de: /\b(the|please|would|first year|per month|per year|cancel|refund)\b/i,
  fr: /\b(the|please|would|first year|per month|per year|cancel|refund)\b/i,
  nl: /\b(the|please|would|first year|per month|per year|cancel|refund)\b/i,
  es: /\b(the|please|would|first year|per month|per year|cancel|refund)\b/i,
  it: /\b(the|please|would|first year|per month|per year|cancel|refund)\b/i,
};
function* walkStrings(obj: unknown, path: string): Generator<[string, string]> {
  if (typeof obj === "string") {
    yield [path, obj];
    return;
  }
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) yield* walkStrings(obj[i], `${path}[${i}]`);
    return;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      yield* walkStrings(v, `${path}.${k}`);
    }
  }
}
for (const loc of ["de", "fr", "nl", "es", "it"] as const) {
  for (const [path, s] of walkStrings(LANDING_SECTIONS[loc], loc)) {
    if (EN_STOPWORDS[loc].test(s)) {
      check(`SECTIONS-${loc.toUpperCase()}-${path}-english-leak`, false,
        `english leak: ${s.slice(0, 60)}`);
    }
  }
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Landing sections check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
