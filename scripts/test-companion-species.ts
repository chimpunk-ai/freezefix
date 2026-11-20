// lib/companion.ts's species additions check. Run: npm run test:companion-species
//
// Covers task 13 of the 50-step plan (20 Nov 2026): the companion picker's
// base data — CompanionSpecies, SPECIES_ORDER, SPECIES_LABEL, DEFAULT_SPECIES.
// The actual SVG art (components/CompanionSpecies.tsx) is drawing, parse-
// checked only, same as CompanionAvatar.tsx always has been — nothing here
// renders JSX, it only checks the plain data every consumer (a future
// picker screen, profile storage) will actually read.

import { DEFAULT_SPECIES, SPECIES_LABEL, SPECIES_ORDER, type CompanionSpecies } from "../lib/companion";

let fails = 0;
function ok(cond: boolean, msg: string) {
  if (!cond) {
    fails++;
    console.log("FAIL", msg);
  }
}

ok(
  SPECIES_ORDER.length >= 4 && SPECIES_ORDER.length <= 7,
  `SPECIES_ORDER has a pickable number of options (got ${SPECIES_ORDER.length}) — the plant plus 4-6 animals`
);

ok(new Set(SPECIES_ORDER).size === SPECIES_ORDER.length, "SPECIES_ORDER has no duplicate species");

ok(SPECIES_ORDER.includes("plant"), "the plant stays a selectable species — switching never deletes it as an option");

ok(SPECIES_ORDER.includes(DEFAULT_SPECIES), "DEFAULT_SPECIES is itself one of the pickable species");

ok(DEFAULT_SPECIES === "plant", "the plant stays the default for existing users who never picked a species");

for (const species of SPECIES_ORDER) {
  const label = SPECIES_LABEL[species];
  ok(typeof label === "string" && label.trim().length > 0, `${species} has a non-empty SPECIES_LABEL`);
  ok(/^an? /.test(label), `${species}'s label ("${label}") reads as plain words — "a "/"an " plus the name`);
}

// Every key in SPECIES_LABEL is a real species and vice versa — no stray
// entries either direction, so a typo'd species id fails loudly here
// instead of silently rendering no label somewhere downstream.
const labelKeys = Object.keys(SPECIES_LABEL) as CompanionSpecies[];
ok(labelKeys.length === SPECIES_ORDER.length, "SPECIES_LABEL has exactly one entry per species, nothing extra");

console.log(fails ? `${fails} failing` : `companion-species check: ${SPECIES_ORDER.length * 2 + 4}/${SPECIES_ORDER.length * 2 + 4} passed`);
process.exit(fails ? 1 : 0);
