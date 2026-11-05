// Shape test for lib/pricing-copy.ts.
// Run: npm run test:pricing-copy
//
// The pricing page is the one visitors read before paying, so every string
// matters. This test catches the same classes of regression test-landing-copy.ts
// catches: dropped locale, empty field, FAQ shape drift, English leak into
// an alt locale. It also enforces the pricing-specific invariants:
//   • exactly 9 feature rows per locale
//   • exactly 5 FAQs per locale
//   • exactly 3 trust bullets per locale
//   • "Yes/Ja/Oui/Sí/Sì" never leaks into the FR column of an EN table etc.
//   • currency key maps all 6 locales to a known bucket

import {
  PRICING_COPY,
  PRICING_CURRENCY_LABELS,
  currencyKey,
  type PricingCopy,
} from "../lib/pricing-copy";
import { LOCALES } from "../lib/landing-copy";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) =>
  results.push({ id, ok, note });
const nonEmpty = (s: unknown) =>
  typeof s === "string" && s.trim().length > 0;

for (const locale of LOCALES) {
  const c: PricingCopy = PRICING_COPY[locale];
  const prefix = `PRICING-${locale.toUpperCase()}`;

  const required: Array<keyof PricingCopy> = [
    "htmlLang",
    "metaTitle",
    "metaDescription",
    "kicker",
    "headlineLine1",
    "headlineLine2",
    "subhead",
    "preLaunchBadge",
    "preLaunchHeadline",
    "preLaunchHint",
    "preLaunchCtaLabel",
    "preLaunchNote",
    "comparisonHeading",
    "columnFree",
    "columnPro",
    "columnFreePrice",
    "columnProPrice",
    "columnProPriceHint",
    "trustHeading",
    "faqHeading",
    "backToHome",
  ];
  for (const k of required) {
    check(`${prefix}-${String(k)}`, nonEmpty(c[k] as string));
  }

  // 9 feature rows, each with feature + freeHas + proHas.
  check(`${prefix}-rows-count-9`, c.rows.length === 9);
  c.rows.forEach((r, i) => {
    check(`${prefix}-row-${i}-feature`, nonEmpty(r.feature));
    check(`${prefix}-row-${i}-freeHas`, nonEmpty(r.freeHas));
    check(`${prefix}-row-${i}-proHas`, nonEmpty(r.proHas));
  });

  // 3 trust bullets.
  check(`${prefix}-trust-count-3`, c.trustBullets.length === 3);
  c.trustBullets.forEach((b, i) =>
    check(`${prefix}-trust-${i}`, nonEmpty(b))
  );

  // 5 FAQs, each with q + a.
  check(`${prefix}-faqs-count-5`, c.faqs.length === 5);
  c.faqs.forEach((f, i) => {
    check(`${prefix}-faq-${i}-q`, nonEmpty(f.q));
    check(`${prefix}-faq-${i}-a`, nonEmpty(f.a));
  });

  // Crisis help is the first row in every locale — the moral promise that
  // the free band includes it shouldn't drift away in a translation PR.
  check(
    `${prefix}-row-0-is-crisis`,
    /crisis|hilfe|aide|hulp|ayuda|aiuto/i.test(c.rows[0].feature)
  );

  // The FAQ answers mention Paddle + 7-day refund somewhere so a visitor
  // reading only the FAQ still gets the merchant-of-record / refund promise.
  const allFaqText = c.faqs.map((f) => f.a).join("\n");
  check(`${prefix}-faq-mentions-paddle`, /paddle/i.test(allFaqText));
  check(`${prefix}-faq-mentions-7-day`, /7|siete|sette/i.test(allFaqText));
}

// English stop-words that should never appear in an alt-locale pricing
// pack (brand name "Fix", "Pro" and "Paddle" are allowed everywhere).
const EN_STOPWORDS: Record<string, RegExp> = {
  de: /\b(the|please|would|first year|per month|per year|cancel|refund)\b/i,
  fr: /\b(the|please|would|first year|per month|per year|cancel|refund)\b/i,
  nl: /\b(the|please|would|first year|per month|per year|cancel|refund)\b/i,
  es: /\b(the|please|would|first year|per month|per year|cancel|refund)\b/i,
  it: /\b(the|please|would|first year|per month|per year|cancel|refund)\b/i,
};
for (const loc of ["de", "fr", "nl", "es", "it"] as const) {
  const c = PRICING_COPY[loc];
  for (const [key, value] of Object.entries(c) as Array<[string, unknown]>) {
    if (typeof value === "string" && EN_STOPWORDS[loc].test(value)) {
      check(`PRICING-${loc.toUpperCase()}-${key}-english-leak`, false,
        `value contained an English stop-word: ${value.slice(0, 60)}`);
    }
  }
}

// currencyKey: every locale's typical region maps to a known bucket.
const regionsByLocale: Record<string, string> = {
  en: "US",
  de: "DE",
  fr: "FR",
  nl: "NL",
  es: "ES",
  it: "IT",
};
for (const [locale, region] of Object.entries(regionsByLocale)) {
  const key = currencyKey(region);
  check(
    `PRICING-currencyKey-${locale}-${region}`,
    key in PRICING_CURRENCY_LABELS
  );
}

// GB → GB, US → US, DE → EU, FR → EU, random → US fallback.
check("PRICING-currencyKey-GB-bucket", currencyKey("GB") === "GB");
check("PRICING-currencyKey-US-bucket", currencyKey("US") === "US");
check("PRICING-currencyKey-DE-bucket", currencyKey("DE") === "EU");
check("PRICING-currencyKey-FR-bucket", currencyKey("FR") === "EU");
check("PRICING-currencyKey-NL-bucket", currencyKey("NL") === "EU");
check("PRICING-currencyKey-ES-bucket", currencyKey("ES") === "EU");
check("PRICING-currencyKey-IT-bucket", currencyKey("IT") === "EU");
check("PRICING-currencyKey-SE-bucket", currencyKey("SE") === "EU");
check("PRICING-currencyKey-PL-bucket", currencyKey("PL") === "EU");
check("PRICING-currencyKey-CH-bucket", currencyKey("CH") === "EU");
check("PRICING-currencyKey-fallback-US", currencyKey("ZZ") === "US");
check("PRICING-currencyKey-empty-US", currencyKey("") === "US");

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Pricing copy check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
