// The companion: levels, stages, and streaks. Pure functions, no storage,
// no live model call. Run: npm run test:companion
//
// What this guards against:
//   - Leveling ever depending on smoking/not-smoking instead of just
//     logging a night (the harm-reduction line this feature has to hold).
//   - A streak calculation that's off by one at a boundary, or that
//     silently drops to zero just because tonight hasn't been logged yet.
//   - The "longest streak" number ever decreasing.

import {
  companionFor,
  growthMessage,
  growthSince,
  levelFor,
  levelName,
  levelProgress,
  nightsToNextLevel,
  seedFromProfile,
  stageFor,
  statsFor,
  streaksFor,
  traitFor,
  DEFAULT_COMPANION_NAME,
  EMPTY_PROFILE_SEED,
  STAT_ORDER,
} from "../lib/companion";
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

// --- traitFor ----------------------------------------------------------------
// The onboarding reveal's one-line personality, read from the person's own
// answers, not fabricated. Must never mention smoking more/less/dosage —
// same forbidden-words boundary Fix's own prompt holds (lib/fix-prompt.ts).

const FORBIDDEN_IN_TRAIT = /\b(less|more weed|smok(e|ing)|dose|doses|strain|relapse|clean|addict)\b/i;

check("trait-never-mentions-smoking-amount", !FORBIDDEN_IN_TRAIT.test(traitFor({})));
check(
  "trait-stuck-before-wins-over-slipped-back",
  traitFor({ triedCuttingDown: "tried, and it stuck for a while" }).includes("held")
);
check(
  "trait-slipped-back-distinct-from-stuck",
  traitFor({ triedCuttingDown: "tried, and slipped back" }) !==
    traitFor({ triedCuttingDown: "tried, and it stuck for a while" })
);
check("trait-late-night", /night owl/.test(traitFor({ smokeTime: "late night" })));
check("trait-after-work", /unwind/.test(traitFor({ smokeTime: "after work" })));
check("trait-no-answers-is-honest-not-invented", traitFor({}).includes("later"));
for (const s of ["after work", "the evening", "late night", "weekends only", "varies, honestly"]) {
  check(`trait-no-crash-smoketime-${s.replace(/\s+/g, "-")}`, typeof traitFor({ smokeTime: s }) === "string");
}
for (const f of ["pretty much daily", "most days", "a few times a week", "weekends mostly", "it varies a lot"]) {
  check(`trait-no-crash-frequency-${f.replace(/\s+/g, "-")}`, typeof traitFor({ frequency: f }) === "string");
}

// --- levelName / levelProgress -------------------------------------------
// The "Level 03 — The Explorer, 340/500 XP" bar from the product vision,
// built from real nights logged rather than a separate fabricated XP
// number. Must never claim progress past 100%, never go negative, and
// must be null exactly when there's no next level to show a bar toward.

check("level-name-defined-for-every-level-1-through-10", (() => {
  for (let l = 1; l <= 10; l++) {
    if (typeof levelName(l) !== "string" || !levelName(l)) return false;
  }
  return true;
})());
check("level-name-clamps-below-1", levelName(0) === levelName(1));
check("level-name-clamps-above-max", levelName(999) === levelName(10));
check("level-name-fresh-user-is-seed", /seed/.test(levelName(levelFor(0))));
check("level-name-maxed-user-is-bloom", /bloom/.test(levelName(levelFor(100000))));

check("progress-fresh-user-is-zero-fraction", levelProgress(0)?.fraction === 0);
check("progress-null-once-maxed", levelProgress(100000) === null);
check("progress-fraction-never-exceeds-one", (() => {
  for (let n = 0; n <= 200; n++) {
    const p = levelProgress(n);
    if (p && p.fraction > 1) return false;
  }
  return true;
})());
check("progress-fraction-never-negative", (() => {
  for (let n = 0; n <= 200; n++) {
    const p = levelProgress(n);
    if (p && p.fraction < 0) return false;
  }
  return true;
})());
check("progress-into-matches-nights-at-level-start", (() => {
  // Right at a threshold (e.g. 3 nights = level 2's start), into should be 0.
  const p = levelProgress(3);
  return p?.into === 0;
})());
check("progress-monotonic-within-a-level", (() => {
  // Walking from one level-up to just before the next, `into` only grows.
  let prevInto = -1;
  for (let n = 3; n < 7; n++) {
    const p = levelProgress(n);
    if (!p || p.into < prevInto) return false;
    prevInto = p.into;
  }
  return true;
})());

// --- statsFor / seedFromProfile ----------------------------------------
// The five attribute meters replacing the plain-text onboarding board. The
// one rule that matters most: a bar can never fall as the log grows.

check("stats-always-five-in-fixed-order", (() => {
  const s = statsFor(EMPTY_PROFILE_SEED, {});
  return s.length === 5 && s.every((stat, i) => stat.key === STAT_ORDER[i]);
})());

check("stats-fresh-profile-all-zero", statsFor(EMPTY_PROFILE_SEED, {}).every((s) => s.tier === 0));

check(
  "stats-onboarding-answers-seed-without-any-log",
  (() => {
    const seed = seedFromProfile({
      interferesWith: ["sleep"],
      smokeTime: "late night",
      preferredTriggers: ["bored"],
      frequency: "most days",
      triedCuttingDown: "tried, and slipped back",
      goal: { text: "go for a run", target: 2, madeAt: "2026-11-01" },
    });
    const s = statsFor(seed, {});
    // every one of the six onboarding answers seeded SOME attribute, so
    // nothing but consistency — which has no onboarding seed by design, it
    // only reflects a real logged streak — is still sitting at a bare zero.
    return s.every((stat) => stat.key === "consistency" || stat.tier > 0) && s.find((stat) => stat.key === "consistency")?.tier === 0;
  })()
);

check(
  "stats-nothing-in-particular-does-not-seed-resilience",
  (() => {
    const seed = seedFromProfile({ interferesWith: ["nothing in particular"] });
    return seed.hasInterferes === false;
  })()
);

check("stats-empty-profile-fields-seed-nothing", (() => {
  const seed = seedFromProfile({});
  return Object.values(seed).every((v) => v === false);
})());

{
  // The non-decrease guarantee: as the log grows night by night — smoke
  // nights, sober nights, triggered nights, plain nights, a gap in the
  // middle, a stretch with nothing logged at all — no stat's tier is ever
  // allowed to be lower than it was on an earlier, shorter slice of the
  // same log.
  const days = 40;
  const full: Entries = {};
  for (let i = 0; i < days; i++) {
    const day = addDays("2026-09-01", i);
    full[day] = {
      day,
      smoked: i % 3 === 0,
      mood: ((i % 5) + 1) as Entry["mood"],
      triggers: i % 4 === 0 ? ["stressed"] : i % 7 === 0 ? ["bored"] : [],
      note: i % 6 === 0 ? "a note" : undefined,
      goalDone: i % 5 === 0,
      at: 0,
    };
  }
  const seed = seedFromProfile({ smokeTime: "late night", frequency: "most days", goal: { text: "x", target: 1, madeAt: "2026-09-01" } });

  let prevTiers: number[] = statsFor(seed, {}).map((s) => s.tier);
  let everDecreased = false;
  const sortedDays = Object.keys(full).sort();
  const partial: Entries = {};
  for (const day of sortedDays) {
    partial[day] = full[day];
    const tiers = statsFor(seed, partial).map((s) => s.tier);
    if (tiers.some((t, i) => t < prevTiers[i])) everDecreased = true;
    prevTiers = tiers;
  }
  check("stats-never-decrease-as-log-grows", !everDecreased);
  check("stats-eventually-move-off-zero", prevTiers.some((t) => t > 0));
}

check(
  "stats-consistency-tracks-longest-streak-not-current",
  (() => {
    // Five in a row, then a gap, then one more nine days later. Current
    // streak drops to 1; consistency (built on the longest run) must not.
    const e: Entries = {};
    for (let i = 0; i < 5; i++) {
      const day = addDays("2026-10-01", i);
      e[day] = { day, smoked: false, mood: 3, triggers: [], at: 0 };
    }
    const laterDay = addDays("2026-10-01", 14);
    e[laterDay] = { day: laterDay, smoked: false, mood: 3, triggers: [], at: 0 };
    const stats = statsFor(EMPTY_PROFILE_SEED, e);
    const consistency = stats.find((s) => s.key === "consistency");
    return Boolean(consistency && consistency.tier > 0);
  })()
);

// --- growthSince / growthMessage ----------------------------------------
// The post-save "your awareness just grew" line. Must only ever fire when
// a bar actually moved for THIS save, and must never mention smoking.

check(
  "growth-first-ever-log-grows-something",
  (() => {
    const before: Entries = {};
    const after: Entries = { "2026-11-19": entry("2026-11-19", true) };
    const growth = growthSince(EMPTY_PROFILE_SEED, before, after);
    return growth.leveledUp || growth.grownStat !== null;
  })()
);

check(
  "growth-identical-entries-grows-nothing",
  (() => {
    const e = fill("2026-11-01", 5);
    const growth = growthSince(EMPTY_PROFILE_SEED, e, e);
    return !growth.leveledUp && growth.grownStat === null;
  })()
);

check(
  "growth-message-null-when-nothing-grew",
  growthMessage("fix", { leveledUp: false, grownStat: null }) === null
);

check(
  "growth-message-never-mentions-smoking",
  (() => {
    const msgs = [
      growthMessage("fix", { leveledUp: true, grownStat: null }),
      growthMessage("fix", { leveledUp: false, grownStat: "awareness" }),
    ];
    return msgs.every((m) => !m || !FORBIDDEN_IN_TRAIT.test(m));
  })()
);

check(
  "growth-message-leveling-up-wins-over-a-stat",
  growthMessage("fix", { leveledUp: true, grownStat: "awareness" }).includes("level")
);

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Companion check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
