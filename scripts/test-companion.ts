// The companion: levels, stages, and streaks. Pure functions, no storage,
// no live model call. Run: npm run test:companion
//
// What this guards against:
//   - Leveling ever depending on smoking/not-smoking instead of just
//     logging a night (the harm-reduction line this feature has to hold).
//   - A streak calculation that's off by one at a boundary, or that
//     silently drops to zero just because tonight hasn't been logged yet.
//   - The "longest streak" number ever decreasing.

import { companionFor, levelFor, nightsToNextLevel, stageFor, streaksFor, DEFAULT_COMPANION_NAME } from "../lib/companion";
import { addDays, type Entries, type Entry } from "../lib/entry";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });

function entry(day: string, smoked: boolean): Entry {
  return { day, smoked, mood: 3, triggers: [], at: 0 };
}

function fill(from: string, days: number, skip: Set<number> = new Set()): Entries {
  const out: Entries = {};
  for (let i = 0; i < days; i++) {
    if (skip.has(i)) continue;
    const day = addDays(from, i);
    out[day] = entry(day, i % 2 === 0);
  }
  return out;
}

// --- levelFor / nightsToNextLevel -------------------------------------------

check("level-zero-nights-is-level-1", levelFor(0) === 1);
check("level-three-nights-is-level-2", levelFor(3) === 2);
check("level-caps-at-max", levelFor(100000) === levelFor(99999) && levelFor(100000) > 1);
check("next-level-nights-positive-when-not-maxed", (nightsToNextLevel(0) ?? 0) > 0);
check("next-level-null-once-maxed", nightsToNextLevel(100000) === null);

// Leveling must never depend on whether the nights logged were smoke
// nights or not — only that a night was logged at all.
{
  const allSmoked = fill("2026-10-01", 10); // every other night smoked by fill()'s pattern, but let's force all true
  const forced: Entries = {};
  for (const [day, e] of Object.entries(allSmoked)) forced[day] = { ...e, smoked: true };
  const allSober: Entries = {};
  for (const [day, e] of Object.entries(allSmoked)) allSober[day] = { ...e, smoked: false };
  check(
    "level-identical-regardless-of-smoked-flag",
    companionFor("x", forced, "2026-10-20").level === companionFor("x", allSober, "2026-10-20").level
  );
}

// --- stageFor ----------------------------------------------------------------

check("stage-level-1-is-seed", stageFor(1) === "seed");
check("stage-rises-monotonically", stageFor(9) !== stageFor(1));

// --- streaksFor ----------------------------------------------------------------

check("streaks-empty-log", streaksFor({}, "2026-11-19").current === 0 && streaksFor({}, "2026-11-19").longest === 0);

{
  // Five nights in a row, ending today.
  const e = fill("2026-11-15", 5); // 15,16,17,18,19
  const { current, longest } = streaksFor(e, "2026-11-19");
  check("streaks-five-in-a-row-current", current === 5, `got ${current}`);
  check("streaks-five-in-a-row-longest", longest === 5, `got ${longest}`);
}

{
  // A gap in the middle: two separate runs (10-12, then 14-19 after
  // skipping the 13th). Current must only count the most recent unbroken
  // run (14..19 = 6 nights); longest must be the bigger of the two runs,
  // which happens to be that same run here.
  const e = fill("2026-11-10", 10, new Set([3]));
  const { current, longest } = streaksFor(e, "2026-11-19");
  check("streaks-gap-current-is-recent-run", current === 6, `got ${current}`);
  check("streaks-gap-longest-is-bigger-run", longest === 6, `got ${longest}`);
}

{
  // Tonight not logged yet shouldn't zero out the streak — the night isn't
  // over. Yesterday logged, the day before logged.
  const e = fill("2026-11-16", 3); // 16,17,18 — today is the 19th, unlogged
  const { current } = streaksFor(e, "2026-11-19");
  check("streaks-today-unlogged-still-counts-through-yesterday", current === 3, `got ${current}`);
}

{
  // A real gap (missed yesterday) does end the current streak, but the
  // longest number from before the gap is never lost.
  const e = fill("2026-11-10", 5); // 10..14, nothing after
  const { current, longest } = streaksFor(e, "2026-11-19");
  check("streaks-old-gap-zeroes-current", current === 0, `got ${current}`);
  check("streaks-old-gap-keeps-longest", longest === 5, `got ${longest}`);
}

// --- companionFor ----------------------------------------------------------------

{
  const c = companionFor("", {}, "2026-11-19");
  check("companion-empty-name-falls-back", c.name === DEFAULT_COMPANION_NAME);
  check("companion-fresh-is-level-1", c.level === 1);
}
{
  const c = companionFor("  Rex  ", {}, "2026-11-19");
  check("companion-name-trimmed", c.name === "Rex");
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Companion check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
