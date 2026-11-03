// Shape test for lib/landing-copy.ts.
// Run: npm run test:landing-copy
//
// This file catches the one thing TypeScript cannot: a locale whose keys
// are present but whose values were accidentally left empty, placeholdery
// or still in English. It's a cheap check that runs in a second and would
// have caught a dropped German hero line before it shipped.

import { LANDING_COPY, LOCALES, type Locale, type LandingCopy } from "../lib/landing-copy";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];

function check(id: string, ok: boolean, note?: string) {
  results.push({ id, ok, note });
}

function nonEmpty(x: string | null | undefined): boolean {
  return typeof x === "string" && x.trim().length > 0;
}

for (const locale of LOCALES) {
  const c: LandingCopy = LANDING_COPY[locale];
  const prefix = `COPY-${locale.toUpperCase()}`;

  // Required text fields — one per key the Landing component actually reads.
  const required: Array<[keyof LandingCopy, string]> = [
    ["htmlLang", "htmlLang"],
    ["metaTitle", "metaTitle"],
    ["metaDescription", "metaDescription"],
    ["getHelpNow", "getHelpNow"],
    ["openReturning", "openReturning"],
    ["kicker", "kicker"],
    ["heroHeadlineLine1", "heroHeadlineLine1"],
    ["heroHeadlineLine2", "heroHeadlineLine2"],
    ["heroBody", "heroBody"],
    ["ctaOpen", "ctaOpen"],
    ["ctaPrivacy", "ctaPrivacy"],
    ["exampleHeading", "exampleHeading"],
    ["exampleKicker", "exampleKicker"],
    ["exampleSubtitle", "exampleSubtitle"],
    ["footerBlurb", "footerBlurb"],
  ];
  for (const [key, label] of required) {
    check(`${prefix}-${label}`, nonEmpty(c[key] as string));
  }

  // Switcher must point somewhere, with a label.
  check(`${prefix}-switchTo-href`, nonEmpty(c.switchTo?.href));
  check(`${prefix}-switchTo-label`, nonEmpty(c.switchTo?.label));

  // Features: exactly 3, each with a title.
  check(`${prefix}-features-count`, c.features?.length === 3);
  c.features?.forEach((f, i) => {
    check(`${prefix}-feature-${i}-title`, nonEmpty(f.title));
  });

  // Example steps: 4, label on every one, body on 1-3 (none on step 4 by design).
  check(`${prefix}-example-steps-count`, c.exampleSteps?.length === 4);
  c.exampleSteps?.forEach((s, i) => {
    check(`${prefix}-example-${i}-index`, nonEmpty(s.index));
    check(`${prefix}-example-${i}-label`, nonEmpty(s.label));
    if (i < 3) {
      check(`${prefix}-example-${i}-body`, nonEmpty(s.body));
    } else {
      check(`${prefix}-example-${i}-body-null`, s.body === null);
    }
  });

  // Waitlist block must be fully populated — every one of these is reached
  // by at least one state in WaitlistCapture.
  const w = c.waitlist;
  for (const k of ["label", "placeholder", "submit", "submitting", "footnote", "error", "throttled", "done", "notCollecting"] as const) {
    check(`${prefix}-waitlist-${k}`, nonEmpty(w?.[k]));
  }

  // Footer links: at least four, each with href + label.
  check(`${prefix}-footer-links-count`, (c.footerLinks?.length ?? 0) >= 4);
  c.footerLinks?.forEach((l, i) => {
    check(`${prefix}-footer-link-${i}-href`, nonEmpty(l.href));
    check(`${prefix}-footer-link-${i}-label`, nonEmpty(l.label));
  });
}

// All alt locales: chatIsEnglishNote must be present. English-specific: it
// must be null (no bait-and-switch sentinel accidentally rendered).
// ─────────────────── tutorial card (feat/tutorial, 4 Nov 2026) ───────────
// Tutorial card has 4 steps + a Patterns example caption. A future PR
// that drops the card from a locale fails here instead of rendering a
// blank right-column.
for (const locale of LOCALES) {
  const t = LANDING_COPY[locale].tutorial;
  const prefix = `COPY-${locale.toUpperCase()}-tutorial`;
  check(`${prefix}-kicker`, nonEmpty(t?.kicker));
  check(`${prefix}-heading`, nonEmpty(t?.heading));
  check(`${prefix}-patternsExampleCaption`, nonEmpty(t?.patternsExampleCaption));
  check(`${prefix}-steps-count-4`, (t?.steps?.length ?? 0) === 4);
  t?.steps?.forEach((s, i) => {
    check(`${prefix}-step-${i}-title`, nonEmpty(s?.title));
    check(`${prefix}-step-${i}-body`, nonEmpty(s?.body));
  });
}

// ─────────────────── pricing-posture footer line ───────────────────
// Added after Tom (NYC, 15-persona audit) called out that lib/plans.ts
// carries dormant prices while the landing says nothing.
for (const locale of LOCALES) {
  check(`COPY-${locale.toUpperCase()}-footerPricingPosture`,
    nonEmpty(LANDING_COPY[locale].footerPricingPosture));
}

check("COPY-DE-chatIsEnglishNote-present", nonEmpty(LANDING_COPY.de.chatIsEnglishNote));
check("COPY-FR-chatIsEnglishNote-present", nonEmpty(LANDING_COPY.fr.chatIsEnglishNote));
check("COPY-NL-chatIsEnglishNote-present", nonEmpty(LANDING_COPY.nl.chatIsEnglishNote));
check("COPY-EN-chatIsEnglishNote-null", LANDING_COPY.en.chatIsEnglishNote === null);

// Switcher wiring: EN points to /de (primary alt); every alt locale pivots
// back to EN rather than to another alt. One tap, no dropdown. Extended
// 3 Nov 2026 for audit P3.11.
check("COPY-EN-switcher-points-to-de", LANDING_COPY.en.switchTo.href === "/de");
check("COPY-DE-switcher-points-to-en", LANDING_COPY.de.switchTo.href === "/");
check("COPY-FR-switcher-points-to-en", LANDING_COPY.fr.switchTo.href === "/");
check("COPY-NL-switcher-points-to-en", LANDING_COPY.nl.switchTo.href === "/");

// languageLinks shape: EN has 3 (de, fr, nl); every alt locale has 1 (en).
check("COPY-EN-languageLinks-3", LANDING_COPY.en.languageLinks.length === 3);
check("COPY-DE-languageLinks-1-en", LANDING_COPY.de.languageLinks.length === 1 && LANDING_COPY.de.languageLinks[0].href === "/");
check("COPY-FR-languageLinks-1-en", LANDING_COPY.fr.languageLinks.length === 1 && LANDING_COPY.fr.languageLinks[0].href === "/");
check("COPY-NL-languageLinks-1-en", LANDING_COPY.nl.languageLinks.length === 1 && LANDING_COPY.nl.languageLinks[0].href === "/");

// Hard regression: no alt-locale field accidentally left in English. A short
// allowlist of words that are the same across languages (brand name, placeholder
// stub, email) means we can't just do a strict "no English" check — instead we
// look for English stop-words that would never appear in natural copy.
const ENGLISH_LEAKS: Record<"de" | "fr" | "nl", RegExp> = {
  de: /\b(the|please|your|here|would|get help now|open fix|email only)\b/i,
  fr: /\b(the|please|your|would|get help now|open fix|email only)\b/i,
  nl: /\b(the|please|your|here|would|get help now|open fix|email only)\b/i,
};
for (const loc of ["de", "fr", "nl"] as const) {
  for (const [key, value] of Object.entries(LANDING_COPY[loc]) as Array<[string, unknown]>) {
    if (typeof value === "string" && ENGLISH_LEAKS[loc].test(value)) {
      check(`COPY-${loc.toUpperCase()}-${key}-english-leak`, false,
        `value contained an English stop-word: ${value.slice(0, 60)}`);
    }
  }
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Landing copy check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
