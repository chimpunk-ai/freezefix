import { LANDING_COPY, LOCALES, type LandingCopy, type Locale } from "../lib/landing-copy";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });
const nonEmpty = (value: unknown) => typeof value === "string" && value.trim().length > 0;

for (const locale of LOCALES) {
  const copy: LandingCopy = LANDING_COPY[locale];
  const prefix = `LANDING-${locale.toUpperCase()}`;
  for (const key of [
    "htmlLang", "metaTitle", "metaDescription", "getHelpNow", "openReturning",
    "kicker", "heroHeadlineLine1", "heroHeadlineLine2", "heroBody", "ctaWaitlist",
    "ctaPrivacy", "releaseNote", "loopHeading", "loopIntro", "footerBlurb",
    "footerPricingPosture",
  ] as const) {
    check(`${prefix}-${key}`, nonEmpty(copy[key]));
  }
  check(`${prefix}-language-links`, copy.languageLinks.length >= 1 && copy.languageLinks.every((link) => nonEmpty(link.href) && nonEmpty(link.label)));
  check(`${prefix}-features-count`, copy.features.length === 3);
  copy.features.forEach((feature, index) => {
    check(`${prefix}-feature-${index}-title`, nonEmpty(feature.title));
    check(`${prefix}-feature-${index}-body`, nonEmpty(feature.body));
  });
  check(`${prefix}-mirror-weekdays-count`, copy.mirror.weekdays.length === 7);
  check(`${prefix}-mirror-chart-summary`, nonEmpty(copy.mirror.chartSummary));
  check(`${prefix}-mirror-example-caption`, nonEmpty(copy.mirror.caption));
  check(`${prefix}-mirror-copy`, [copy.mirror.kicker, copy.mirror.heading, copy.mirror.observation, copy.mirror.goalLine].every(nonEmpty));
  check(`${prefix}-loop-steps-count`, copy.loopSteps.length === 3);
  copy.loopSteps.forEach((step, index) => {
    check(`${prefix}-loop-${index}-title`, nonEmpty(step.title));
    check(`${prefix}-loop-${index}-body`, nonEmpty(step.body));
  });
  const waitlist = copy.waitlist;
  for (const key of ["label", "placeholder", "submit", "submitting", "footnote", "error", "throttled", "done", "notCollecting"] as const) {
    check(`${prefix}-waitlist-${key}`, nonEmpty(waitlist[key]));
  }
  check(`${prefix}-footer-links`, copy.footerLinks.length >= 4 && copy.footerLinks.every((link) => nonEmpty(link.href) && nonEmpty(link.label)));
  check(`${prefix}-prelaunch-disclosure`, /development|in development|in Arbeit|en cours|in ontwikkeling|en desarrollo|in sviluppo|in fase di sviluppo/i.test(copy.releaseNote));
}

check("EN-switcher-primary", LANDING_COPY.en.switchTo.href === "/de");
for (const locale of ["de", "fr", "nl", "es", "it"] as const satisfies Locale[]) {
  check(`${locale.toUpperCase()}-switcher-english`, LANDING_COPY[locale].switchTo.href === "/");
}

const ENGLISH_LEAKS: Record<Exclude<Locale, "en">, RegExp> = {
  de: /\b(the|please|your|would|get help now|open fix|email only)\b/i,
  fr: /\b(the|please|your|would|get help now|open fix|email only)\b/i,
  nl: /\b(the|please|your|would|get help now|email only)\b/i,
  es: /\b(the|please|your|would|get help now|email only)\b/i,
  it: /\b(the|please|your|would|get help now|email only)\b/i,
};
for (const locale of ["de", "fr", "nl", "es", "it"] as const) {
  const copy = LANDING_COPY[locale];
  const text = JSON.stringify(copy);
  check(`${locale.toUpperCase()}-no-common-english-leaks`, !ENGLISH_LEAKS[locale].test(text), text.match(ENGLISH_LEAKS[locale])?.[0]);
}

const passed = results.filter((result) => result.ok).length;
const failed = results.length - passed;
for (const result of results.filter((item) => !item.ok)) {
  console.log(`  FAIL ${result.id}${result.note ? ` :: ${result.note}` : ""}`);
}
console.log(`Landing copy check: ${passed}/${results.length} passed`);
if (failed > 0) process.exit(1);
