// Unit tests for lib/country.ts's language-fallback picker.
// Run: npx tsx scripts/test-country.ts
//
// Context: these cases exist because the first-match language sniff was routing
// English-speaking continental-Europe residents (Raj persona, Berlin/Amsterdam/
// Paris expats, international students) to US resources. See the
// fix/country-prefer-verified PR note for the full history.

import { pickRegionFromLanguages } from "../lib/country";

type Case = { id: string; langs: string[]; want: string; note?: string };

const CASES: Case[] = [
  // The exact Raj-persona case from Abhay's hands-on Europe audit. OS English,
  // living in Berlin. Must route DE, not US.
  { id: "C01", langs: ["en-US", "en", "de-DE"], want: "DE", note: "Raj (Berlin expat): en-US first, de-DE later" },
  // Dutch expat with English UI
  { id: "C02", langs: ["en-US", "nl-NL"], want: "NL" },
  // French expat with English UI
  { id: "C03", langs: ["en-US", "fr-FR"], want: "FR" },
  // Irish user with Irish English — en-IE is preferred over the dangling en
  { id: "C04", langs: ["en-IE", "en"], want: "IE" },
  // UK user, legacy "en-UK" alias → GB
  { id: "C05", langs: ["en-UK"], want: "GB" },
  // Genuine US user — no preferred-region tag anywhere, keep first match
  { id: "C06", langs: ["en-US"], want: "US" },
  // Genuine US user with just "en" — no suffix match at all, empty string
  { id: "C07", langs: ["en"], want: "" },
  // Multiple preferred regions — first preferred wins (DE before FR)
  { id: "C08", langs: ["de-DE", "fr-FR"], want: "DE" },
  { id: "C09", langs: ["fr-FR", "de-DE"], want: "FR" },
  // Underscore separator (older Android)
  { id: "C10", langs: ["en_US", "de_DE"], want: "DE" },
  // Mixed case input, lowercased GB in tag — must still canonicalize
  { id: "C11", langs: ["en-gb"], want: "GB" },
  // Nothing usable
  { id: "C12", langs: [], want: "" },
  { id: "C13", langs: ["en", "fr", "de"], want: "", note: "Bare language codes, no region suffix" },
  // Preferred region at the very end of a long list still wins
  { id: "C14", langs: ["en-US", "en-CA", "en-AU", "en-NZ", "en", "de-DE"], want: "DE" },
  // Indian user — IN is NOT in PREFERRED_REGIONS (we don't fully localize there
  // yet, resources list is English-language fallback), so first-match keeps IN
  { id: "C15", langs: ["en-IN"], want: "IN" },
  // Expat edge: en-US first, en-IN later, no European tag. Keep US (first match)
  // because IN isn't preferred-localized yet.
  { id: "C16", langs: ["en-US", "en-IN"], want: "US" },
];

let pass = 0;
let fail = 0;
for (const c of CASES) {
  const got = pickRegionFromLanguages(c.langs);
  if (got === c.want) {
    pass++;
  } else {
    fail++;
    const label = c.note ? ` :: ${c.note}` : "";
    console.log(`  FAIL ${c.id} expected ${JSON.stringify(c.want)}, got ${JSON.stringify(got)}${label}`);
  }
}

console.log(`Country check: ${pass}/${pass + fail} passed`);
if (fail > 0) process.exit(1);
