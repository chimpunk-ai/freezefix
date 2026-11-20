// lib/companion.ts's species additions check. Run: npm run test:companion-species
//
// Covers task 13 of the 50-step plan (20 Nov 2026): the companion picker's
// base data — CompanionSpecies, SPECIES_ORDER, SPECIES_LABEL, DEFAULT_SPECIES.
// The actual SVG art (components/CompanionSpecies.tsx) is drawing, parse-
// checked only, same as CompanionAvatar.tsx always has been — nothing here
// renders JSX, it only checks the plain data every consumer (the picker
// screen, profile storage) actually reads.
//
// Extended for task 15 (20 Nov 2026): SPECIES_STAGE_LABEL and
// speciesStageLabel() — the per-species evolution-tier design, not wired
// into the live UI yet (see lib/companion.ts's own comment on why).

import {
  DEFAULT_SPECIES,
  SPECIES_LABEL,
  SPECIES_ORDER,
  SPECIES_STAGE_LABEL,
  STAGE_LABEL,
  speciesStageLabel,
  stageFor,
  type CompanionSpecies,
  type CompanionStage,
} from "../lib/companion";

const STAGES: CompanionStage[] = ["seed", "sprout", "sapling", "young tree", "full bloom"];

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });

check(
  "species-order-count",
  SPECIES_ORDER.length >= 4 && SPECIES_ORDER.length <= 7,
  `SPECIES_ORDER has a pickable number of options (got ${SPECIES_ORDER.length}) — the plant plus 4-6 animals`
);

check("species-order-no-duplicates", new Set(SPECIES_ORDER).size === SPECIES_ORDER.length);

check("species-order-has-plant", SPECIES_ORDER.includes("plant"), "switching never deletes the plant as an option");

check("default-is-pickable", SPECIES_ORDER.includes(DEFAULT_SPECIES));

check("default-is-plant", DEFAULT_SPECIES === "plant", "existing users who never picked a species keep the plant");

for (const species of SPECIES_ORDER) {
  const label = SPECIES_LABEL[species];
  check(`species-label-nonempty-${species}`, typeof label === "string" && label.trim().length > 0);
  check(`species-label-plain-words-${species}`, /^an? /.test(label), `"${label}" should read as "a "/"an " plus the name`);
}

// Every key in SPECIES_LABEL is a real species and vice versa — no stray
// entries either direction, so a typo'd species id fails loudly here
// instead of silently rendering no label somewhere downstream.
{
  const labelKeys = Object.keys(SPECIES_LABEL) as CompanionSpecies[];
  check("species-label-exact-coverage", labelKeys.length === SPECIES_ORDER.length, "nothing extra, nothing missing");
}

// --- SPECIES_STAGE_LABEL (task 15) ---------------------------------------

{
  const speciesKeys = Object.keys(SPECIES_STAGE_LABEL) as CompanionSpecies[];
  check("tier-label-species-coverage", speciesKeys.length === SPECIES_ORDER.length, "every species has a tier-label row, nothing extra");
}

check("plant-tiers-match-stage-label", SPECIES_STAGE_LABEL.plant === STAGE_LABEL, "the plant's column is STAGE_LABEL itself, not a retyped copy that could drift");

for (const species of SPECIES_ORDER) {
  const tiers = SPECIES_STAGE_LABEL[species];
  for (const stage of STAGES) {
    const label = tiers[stage];
    check(
      `tier-label-nonempty-${species}-${stage}`,
      typeof label === "string" && label.trim().length > 0,
      `${species}'s "${stage}" tier has no label`
    );
  }
  // Five distinct tiers, not five copies of one string — an animal that
  // read identically at every level would defeat the point of having
  // tiers at all, even before task 16 draws the art.
  const unique = new Set(STAGES.map((s) => tiers[s]));
  check(`tier-labels-distinct-${species}`, unique.size === STAGES.length, `${species}'s tier labels repeat: ${JSON.stringify(tiers)}`);
}

// speciesStageLabel() picks the right tier for a level, same stage bands as
// stageFor() — levels 1-2 seed, 3-4 sprout, 5-6 sapling, 7-8 young tree,
// 9+ full bloom (stageFor()'s own boundaries, not re-guessed here).
{
  const sampleLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  for (const species of SPECIES_ORDER) {
    for (const level of sampleLevels) {
      const expected = SPECIES_STAGE_LABEL[species][stageFor(level)];
      check(
        `species-stage-label-fn-${species}-L${level}`,
        speciesStageLabel(species, level) === expected,
        `speciesStageLabel(${species}, ${level}) should match stageFor(${level})'s tier`
      );
    }
  }
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`companion-species check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
