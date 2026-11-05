// Shape test for components/AgeGate.tsx's inline AGE_GATE_COPY.
// Run: npm run test:age-gate
//
// The age gate is one of the few components that hard-codes its strings
// (small widget, single consumer). This test still enforces that every
// locale has every required string and that no alt-locale key accidentally
// leaks English stop-words.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const src = readFileSync(
  resolve(__dirname, "..", "components", "AgeGate.tsx"),
  "utf8"
);

// Grep the AGE_GATE_COPY literal out of the TSX file. Not a full parse; a
// cheap regex that catches the shape we care about.
const match = src.match(/const AGE_GATE_COPY[\s\S]*?^};/m);
if (!match) {
  console.log("  FAIL AGE-source-shape :: could not locate AGE_GATE_COPY literal");
  process.exit(1);
}
const body = match[0];

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) =>
  results.push({ id, ok, note });

const REQUIRED_KEYS = [
  "kicker",
  "heading",
  "body",
  "adultLabel",
  "minorLabel",
  "helpLabel",
  "blockedHeading",
  "blockedBody",
  "blockedHelpLabel",
];

const LOCALES = ["en", "de", "fr", "nl", "es", "it"] as const;

for (const locale of LOCALES) {
  // Each locale block looks like:  en: { ... },  starting at col-less
  // indentation inside the object literal.
  const blockRe = new RegExp(`\\b${locale}:\\s*\\{([\\s\\S]*?)\\n\\s*\\},`, "m");
  const blockMatch = body.match(blockRe);
  check(`AGE-${locale.toUpperCase()}-block-found`, blockMatch !== null);
  if (!blockMatch) continue;
  const b = blockMatch[1];
  for (const k of REQUIRED_KEYS) {
    const keyRe = new RegExp(`\\b${k}:\\s*"([\\s\\S]*?)"`, "m");
    const m = b.match(keyRe);
    const ok = !!m && m[1].trim().length > 0;
    check(`AGE-${locale.toUpperCase()}-${k}-non-empty`, ok,
      m ? undefined : "key missing");
  }
}

// English stop-word leak guard. Fewer stop-words than the pricing pack
// because the age-gate copy is short.
const EN_STOPWORDS: Record<string, RegExp> = {
  de: /\b(the|please|would|adult|minor|help right now|under 18|older)\b/i,
  fr: /\b(the|please|would|adult|minor|help right now|under 18|older)\b/i,
  nl: /\b(the|please|would|adult|minor|help right now|under 18|older)\b/i,
  es: /\b(the|please|would|adult|minor|help right now|under 18|older)\b/i,
  it: /\b(the|please|would|adult|minor|help right now|under 18|older)\b/i,
};
for (const locale of ["de", "fr", "nl", "es", "it"] as const) {
  const blockRe = new RegExp(`\\b${locale}:\\s*\\{([\\s\\S]*?)\\n\\s*\\},`, "m");
  const b = body.match(blockRe)?.[1] ?? "";
  const stringRe = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;
  let m: RegExpExecArray | null;
  while ((m = stringRe.exec(b))) {
    const s = m[1];
    if (EN_STOPWORDS[locale].test(s)) {
      check(`AGE-${locale.toUpperCase()}-english-leak`, false,
        `english leak: ${s.slice(0, 60)}`);
    }
  }
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Age-gate copy check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
