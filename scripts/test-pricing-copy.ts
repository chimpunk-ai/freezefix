import {
  PRICING_COPY,
  PRICING_CURRENCY_LABELS,
  currencyKey,
  type PricingCopy,
} from "../lib/pricing-copy";
import { LOCALES } from "../lib/landing-copy";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });
const nonEmpty = (value: unknown) => typeof value === "string" && value.trim().length > 0;

for (const locale of LOCALES) {
  const copy: PricingCopy = PRICING_COPY[locale];
  const prefix = `PRICING-${locale.toUpperCase()}`;
  for (const key of [
    "htmlLang", "metaTitle", "metaDescription", "kicker", "headlineLine1", "headlineLine2",
    "subhead", "plannedLabel", "yearlyLabel", "monthlyLabel", "yearlyPriceFormat",
    "monthlyPriceFormat", "yearlyEquivalentFormat", "trialLabel", "trialBody",
    "availabilityHeading", "availabilityBody", "featureHeading", "trustHeading", "faqHeading", "backToHome",
  ] as const) {
    check(`${prefix}-${key}`, nonEmpty(copy[key]));
  }
  check(`${prefix}-yearly-price-placeholder`, copy.yearlyPriceFormat.includes("{price}"));
  check(`${prefix}-monthly-price-placeholder`, copy.monthlyPriceFormat.includes("{price}"));
  check(`${prefix}-annual-equivalent-placeholder`, copy.yearlyEquivalentFormat.includes("{price}"));
  check(`${prefix}-subhead-region-prices`, copy.subhead.includes("{yearly}") && copy.subhead.includes("{monthly}"));
  check(`${prefix}-features-count`, copy.features.length === 4 && copy.features.every(nonEmpty));
  check(`${prefix}-trust-count`, copy.trustBullets.length === 3 && copy.trustBullets.every(nonEmpty));
  check(`${prefix}-faqs-count`, copy.faqs.length === 5);
  copy.faqs.forEach((faq, index) => {
    check(`${prefix}-faq-${index}-q`, nonEmpty(faq.q));
    check(`${prefix}-faq-${index}-a`, nonEmpty(faq.a));
  });
  const text = JSON.stringify(copy);
  check(`${prefix}-no-founder-discount`, !/(founding-member|founding member|membre fondateur|miembro fundador|membro fondatore|founder deal|foundersaanbod)/i.test(text));
  check(`${prefix}-waitlist-not-checkout`, /waitlist|warteliste|wachtlijst|liste d[’']attente|lista de espera|lista d[’']attesa/i.test(copy.availabilityBody));
}

check("currency-GB", currencyKey("GB") === "GB");
check("currency-US", currencyKey("US") === "US");
for (const region of ["DE", "FR", "NL", "ES", "IT", "IE", "PT", "GR", "HR"]) {
  check(`currency-${region}-EU`, currencyKey(region) === "EU");
}
for (const region of ["SE", "PL", "CH", "DK", "NO", "CZ"]) {
  check(`currency-${region}-fallback`, currencyKey(region) === "US");
}
check("currency-fallback", currencyKey("ZZ") === "US");
check("yearly-US-price", PRICING_CURRENCY_LABELS.US.yearly === "$39.99");
check("monthly-US-price", PRICING_CURRENCY_LABELS.US.monthly === "$9.99");
check("yearly-EU-price", PRICING_CURRENCY_LABELS.EU.yearly === "39,99 €");
check("monthly-EU-price", PRICING_CURRENCY_LABELS.EU.monthly === "9,99 €");
check("yearly-GB-price", PRICING_CURRENCY_LABELS.GB.yearly === "£39.99");
check("monthly-GB-price", PRICING_CURRENCY_LABELS.GB.monthly === "£9.99");

const passed = results.filter((result) => result.ok).length;
const failed = results.length - passed;
for (const result of results.filter((item) => !item.ok)) {
  console.log(`  FAIL ${result.id}${result.note ? ` :: ${result.note}` : ""}`);
}
console.log(`Pricing copy check: ${passed}/${results.length} passed`);
if (failed > 0) process.exit(1);
