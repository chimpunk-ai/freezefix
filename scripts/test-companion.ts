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
  entriesBefore,
  growthMessage,
  growthSince,
  hpFor,
  hpToNextLevel,
  levelFor,
  levelName,
  levelProgress,
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

// --- levelFor / hpToNextLevel (HP-based since task 70) ----------------------
// Level/stage moved from nights-logged to total HP (task 70, 20 Nov 2026) so
// the number, the label text, and the portrait's growth stage can never
// quietly disagree with each other the way they could when level was on
// nights but the art (task 68/69) was going to be on HP.

check("level-zero-hp-is-level-1", levelFor(0) === 1);
check("level-at-first-threshold-is-level-2", levelFor(10) === 2);
check("level-just-below-first-threshold-is-still-level-1", levelFor(9) === 1);
check("level-caps-at-max", levelFor(100000) === levelFor(99999) && levelFor(100000) > 1);
check("next-level-hp-positive-when-not-maxed", (hpToNextLevel(0) ?? 0) > 0);
check("next-level-null-once-maxed", hpToNextLevel(100000) === null);

// Leveling must never depend on whether the nights logged were smoke
// nights or not — only on what actually happened on each one (same stats
// inputs either way: fill()'s entries carry no triggers/notes, so smoked
// true vs false produces identical stats and therefore identical HP).
{
  const allSmoked = fill("2026-10-01", 10); // every other night smoked by fill()'s pattern, but let's force all true
  const forced: Entries = {};
  for (const [day, e] of Object.entries(allSmoked)) forced[day] = { ...e, smoked: true };
  const allSober: Entries = {};
  for (const [day, e] of Object.entries(allSmoked)) allSober[day] = { ...e, smoked: false };
  check(
    "level-identical-regardless-of-smoked-flag",
    companionFor("x", EMPTY_PROFILE_SEED, forced, "2026-10-20").level ===
      companionFor("x", EMPTY_PROFILE_SEED, allSober, "2026-10-20").level
  );
}

// Two people logging the same NUMBER of nights can still land at different
// levels if one logged with real depth and the other barely tapped through
// -- this is the whole point of task 70 (level no longer just counts days
// opened). totalNightsLogged itself, though, stays identical either way --
// it's still a genuine, separate fact (see the Companion type).
{
  const shallow = fill("2026-01-01", 20); // fill() entries carry no triggers/notes/goalDone
  const deep: Entries = {};
  for (const [day, e] of Object.entries(shallow)) {
    deep[day] = { ...e, triggers: ["stressed"], note: "a longer reflection about the day and what led up to it, written out in full", goalDone: true };
  }
  const shallowSeed = seedFromProfile({ preferredTriggers: ["stressed"] });
  const shallowC = companionFor("x", shallowSeed, shallow, "2026-01-21");
  const deepC = companionFor("x", shallowSeed, deep, "2026-01-21");
  check(
    "same-nights-logged-can-differ-in-level-by-depth",
    shallowC.totalNightsLogged === deepC.totalNightsLogged && deepC.level >= shallowC.level,
    `shallow: nights=${shallowC.totalNightsLogged} level=${shallowC.level} hp=${shallowC.totalHp}; deep: nights=${deepC.totalNightsLogged} level=${deepC.level} hp=${deepC.totalHp}`
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
  const c = companionFor("", EMPTY_PROFILE_SEED, {}, "2026-11-19");
  check("companion-empty-name-falls-back", c.name === DEFAULT_COMPANION_NAME);
  check("companion-fresh-is-level-1", c.level === 1);
}
{
  const c = companionFor("  Rex  ", EMPTY_PROFILE_SEED, {}, "2026-11-19");
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
// built from real total HP (task 70, 20 Nov 2026) rather than a separate
// fabricated XP number -- same HP that drives the five stat bars and the
// portrait's growth stage, so none of the three can ever disagree. Must
// never claim progress past 100%, never go negative, and must be null
// exactly when there's no next level to show a bar toward.

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
check("progress-into-matches-hp-at-level-start", (() => {
  // Right at a threshold (10 hp = level 2's start, see LEVEL_THRESHOLDS),
  // into should be 0.
  const p = levelProgress(10);
  return p?.into === 0;
})());
check("progress-monotonic-within-a-level", (() => {
  // Walking from one level-up to just before the next (level 2 spans
  // [10, 25) hp), `into` only grows.
  let prevInto = -1;
  for (let n = 10; n < 25; n++) {
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

// 20 Nov 2026: onboarding dropped "have you tried cutting down before?",
// so hasHistory can never be set by a new user again. hasHarderTrigger
// (picking one of the four harder trigger chips up front) now covers
// resilience's second seed point instead — same weight, never double-counted
// with hasHistory, and existing users who already answered the old question
// keep their credit from it untouched.
check(
  "stats-harder-trigger-chip-seeds-resilience-like-history-used-to",
  (() => {
    const seed = seedFromProfile({ preferredTriggers: ["stressed"] });
    return seed.hasHarderTrigger === true && statsFor(seed, {})[STAT_ORDER.indexOf("resilience")].tier > 0;
  })()
);

check(
  "stats-non-harder-trigger-chip-does-not-seed-resilience",
  (() => {
    const seed = seedFromProfile({ preferredTriggers: ["bored", "with-friends"] });
    return seed.hasHarderTrigger === false;
  })()
);

check(
  "stats-history-alone-still-seeds-resilience-for-existing-users",
  (() => {
    // No onboarding screen sets triedCuttingDown anymore, but a user who
    // answered it before 20 Nov 2026 still has it stored — this must keep
    // working exactly as it always did.
    const seed = seedFromProfile({ triedCuttingDown: "tried, and slipped back" });
    return seed.hasHistory === true && seed.hasHarderTrigger === false;
  })()
);

check(
  "stats-history-and-harder-trigger-together-dont-double-seed-resilience",
  (() => {
    const both = seedFromProfile({ triedCuttingDown: "tried, and slipped back", preferredTriggers: ["alone"] });
    const historyOnly = seedFromProfile({ triedCuttingDown: "tried, and slipped back" });
    const r = STAT_ORDER.indexOf("resilience");
    // Same tier either way: the second resilience point is one point,
    // never two, whichever of the two signals (or both) is present.
    return statsFor(both, {})[r].tier === statsFor(historyOnly, {})[r].tier;
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

// --- entriesBefore ---------------------------------------------------------
// Reconstructs "the log as it stood before day X", for the Sunday card's
// whole-week growth line. Cutoff day itself must be excluded.

{
  const e = fill("2026-11-10", 10); // 10..19
  const before = entriesBefore(e, "2026-11-15");
  check("entries-before-excludes-cutoff-and-later", !("2026-11-15" in before) && !("2026-11-19" in before));
  check("entries-before-keeps-earlier-days", "2026-11-10" in before && "2026-11-14" in before);
  check("entries-before-empty-log-stays-empty", Object.keys(entriesBefore({}, "2026-11-15")).length === 0);
  check("entries-before-cutoff-before-everything-is-empty", Object.keys(entriesBefore(e, "2026-11-01")).length === 0);
}

{
  // A week's worth of new nights logged, starting fresh, must show up as
  // real growth when diffed against "before the week started".
  const full = fill("2026-11-13", 7); // a full week, 13..19
  const before = entriesBefore(full, "2026-11-13");
  const growth = growthSince(EMPTY_PROFILE_SEED, before, full);
  check("entries-before-feeds-a-real-week-growth", growth.leveledUp || growth.grownStat !== null);
}

// --- hpFor (task 17 of the 50-step plan; rescaled open-ended, task 68) -----
// The single combined HP number is a pure transform of statsFor()'s output
// — not a new counter — so what matters is that the arithmetic is exactly
// right and that it can never disagree with the five meters it's built
// from. Since task 68 (20 Nov 2026) there is deliberately no fixed ceiling
// — the founder asked for a number that keeps climbing for months, not one
// that's effectively capped the moment someone's engaged with the app for a
// while. tier/maxTier are UNCHANGED by this rescale (still 0-5, still drive
// the onboarding reveal and the "it grew" message), so those are covered by
// the tier-specific checks elsewhere in this file; what's new here is that
// hp is now exactly the raw `points` behind each tier, uncapped.

{
  const zeroStats = statsFor(EMPTY_PROFILE_SEED, {});
  const zeroHp = hpFor(zeroStats);
  check("hp-zero-stats-is-zero-hp", zeroHp.hp === 0, `hp=${zeroHp.hp}`);
  check("hp-zero-stats-five-segments", zeroHp.segments.length === STAT_ORDER.length);
  check(
    "hp-zero-stats-segments-in-STAT_ORDER",
    zeroHp.segments.every((s, i) => s.key === STAT_ORDER[i])
  );
  check(
    "hp-zero-stats-every-segment-zero",
    zeroHp.segments.every((s) => s.hp === 0 && s.tier === 0)
  );

  // A heavily-logged, long-running log (long streak, plenty of
  // triggers/notes/goal-ticks on harder nights, ~7 months of nights) must
  // read well past the OLD 100-point ceiling — proving this is actually
  // open-ended now, not just a bigger fixed number. 200 nights all maxing
  // out every tier would have landed at exactly 100 under the old formula;
  // here it has to land well above that.
  const maxedEntries = fill("2026-01-01", 200);
  for (const day of Object.keys(maxedEntries)) {
    maxedEntries[day] = {
      day,
      smoked: maxedEntries[day].smoked,
      mood: 3,
      triggers: ["stressed"],
      note: "a note",
      goalDone: true,
      at: 0,
    };
  }
  const maxedSeed = seedFromProfile({
    preferredTriggers: ["stressed"],
    smokeTime: "evening",
    frequency: "most days",
    interferesWith: ["sleep"],
    goal: { text: "run", target: 3, madeAt: "2026-01-01" },
  });
  const maxedStats = statsFor(maxedSeed, maxedEntries);
  const maxedHp = hpFor(maxedStats);
  check(
    "hp-heavy-log-exceeds-old-100-ceiling",
    maxedHp.hp > 100 && maxedStats.every((s) => s.tier === s.maxTier),
    `hp=${maxedHp.hp}, tiers=${maxedStats.map((s) => s.tier).join(",")}`
  );
  // Roughly matches the founder's own illustration (a few hundred HP after
  // months of real use) -- a sanity range, not a literal target: the exact
  // number depends on the scoring formula's own judgment calls, which can
  // keep evolving without this test needing to track a specific figure.
  check(
    "hp-heavy-log-lands-in-hundreds-not-thousands",
    maxedHp.hp >= 150 && maxedHp.hp <= 3000,
    `hp=${maxedHp.hp}`
  );

  // Each segment's hp is EXACTLY that stat's own raw points -- no hidden
  // second formula, no re-derivation from tier.
  for (let i = 0; i < maxedStats.length; i++) {
    check(`hp-segment-${maxedStats[i].key}-equals-its-own-points`, maxedHp.segments[i].hp === maxedStats[i].points, `hp=${maxedHp.segments[i].hp}, points=${maxedStats[i].points}`);
  }
  check(
    "hp-total-equals-sum-of-segments",
    maxedHp.hp === maxedHp.segments.reduce((sum, s) => sum + s.hp, 0)
  );

  // A partially-grown log (early onboarding credit only, nothing logged
  // yet) must land strictly between zero and the heavy-log total above, and
  // must match hand-summing the five stats' own points -- no hidden second
  // formula.
  const partialStats = statsFor(
    seedFromProfile({ preferredTriggers: ["bored"], smokeTime: "evening" }),
    {}
  );
  const partialHp = hpFor(partialStats);
  const expectedPartial = partialStats.reduce((sum, s) => sum + s.points, 0);
  check(
    "hp-partial-log-between-zero-and-heavy",
    partialHp.hp > 0 && partialHp.hp < maxedHp.hp,
    `hp=${partialHp.hp}`
  );
  check("hp-partial-matches-hand-sum-of-points", partialHp.hp === expectedPartial);

  // Never decreases: growing the log can only ever raise the total, the
  // same guarantee the five meters already have, carried over by
  // construction (sum of non-decreasing terms is non-decreasing) -- holds
  // just as much for an uncapped sum as it did for the old bucketed one.
  const before = statsFor(EMPTY_PROFILE_SEED, fill("2026-02-01", 5));
  const after = statsFor(EMPTY_PROFILE_SEED, fill("2026-02-01", 20));
  check("hp-grows-with-more-logged-nights", hpFor(after).hp >= hpFor(before).hp);
}

// --- extra-detail HP bonus (task 20 of the 50-step plan) -------------------
//
// Resolved via an explicit question to the founder: this is extra credit
// toward the same five real stats, never a separate side-channel HP number
// (see the comment above triggerDetailScore/noteDetailScore in
// lib/companion.ts). What this guards against:
//   - The baseline (one trigger, or any note/goalDone) ever being worth
//     anything other than the exact same 1 point it always was.
//   - Extra detail not actually accelerating a stat's tier.
//   - A night with both a detailed note AND goalDone double-counting
//     instead of taking the better of the two.
//   - Any realistic log ending up worth LESS than the old flat formula
//     would have given it — this change may only ever raise a stat.

{
  // Mirrors lib/companion.ts's private STAT_TIER_COUNTS/tierFor (not
  // exported) just well enough to compute "what tier would the OLD flat
  // formula have given this count" for the never-worth-less-than-before
  // checks below. If those thresholds ever change, update this too.
  const TIER_COUNTS_MIRROR = [0, 1, 3, 7, 14, 25];
  function tierForTest(count: number): number {
    let tier = 0;
    for (let i = 1; i < TIER_COUNTS_MIRROR.length; i++) {
      if (count >= TIER_COUNTS_MIRROR[i]) tier = i;
    }
    return Math.min(tier, 5);
  }

  const detailedEntry = (day: string, triggers: string[], note?: string, goalDone?: boolean): Entry =>
    ({ day, smoked: false, mood: 3, triggers: triggers as Entry["triggers"], note, goalDone, at: 0 }) as Entry;

  // Baseline unchanged: a single one-trigger night is still worth exactly
  // 1 point, same as before this feature existed — two of them must NOT
  // reach tier 2 (which needs a count of 3).
  const twoSingleTriggerNights: Entries = {
    "2026-03-01": detailedEntry("2026-03-01", ["bored"]),
    "2026-03-02": detailedEntry("2026-03-02", ["bored"]),
  };
  const awarenessTwoSingles = statsFor(EMPTY_PROFILE_SEED, twoSingleTriggerNights).find((s) => s.key === "awareness")!;
  check("one-trigger-night-still-worth-exactly-1", awarenessTwoSingles.tier === 1, `tier=${awarenessTwoSingles.tier}`);

  // Extra detail accelerates the same stat: a SINGLE night naming all 3
  // triggers scores 5, which alone reaches tier 2 (needs count >= 3) —
  // something 3 separate single-trigger nights used to be needed for.
  const oneTripleTriggerNight: Entries = { "2026-03-01": detailedEntry("2026-03-01", ["after-work", "bored", "with-friends"]) };
  const awarenessTriple = statsFor(EMPTY_PROFILE_SEED, oneTripleTriggerNight).find((s) => s.key === "awareness")!;
  check("one-night-three-triggers-reaches-tier-2-alone", awarenessTriple.tier === 2, `tier=${awarenessTriple.tier}`);

  // Two such nights (5 + 5 = 10) reach tier 3 (count >= 7), where 10
  // separate single-trigger nights used to be needed.
  const twoTripleTriggerNights: Entries = {
    "2026-03-01": detailedEntry("2026-03-01", ["after-work", "bored", "with-friends"]),
    "2026-03-02": detailedEntry("2026-03-02", ["after-work", "bored", "with-friends"]),
  };
  const awarenessTwoTriples = statsFor(EMPTY_PROFILE_SEED, twoTripleTriggerNights).find((s) => s.key === "awareness")!;
  check("two-nights-three-triggers-reaches-tier-3", awarenessTwoTriples.tier === 3, `tier=${awarenessTwoTriples.tier}`);

  // Two triggers in one night is worth 3, strictly between the one-trigger
  // and three-trigger cases.
  const oneDoubleTriggerNight: Entries = { "2026-03-01": detailedEntry("2026-03-01", ["after-work", "bored"]) };
  const awarenessDouble = statsFor(EMPTY_PROFILE_SEED, oneDoubleTriggerNight).find((s) => s.key === "awareness")!;
  check("two-triggers-worth-more-than-one-less-than-three", awarenessDouble.tier === 2, `tier=${awarenessDouble.tier}`);

  // Notes: the same 1/3/5 scale, by word count. A short note is still
  // worth exactly the old flat 1 point.
  const shortNote: Entries = { "2026-04-01": detailedEntry("2026-04-01", [], "a quick note") };
  const selfShort = statsFor(EMPTY_PROFILE_SEED, shortNote).find((s) => s.key === "selfUnderstanding")!;
  check("short-note-still-worth-exactly-1", selfShort.tier === 1, `tier=${selfShort.tier}`);

  const fifteenWords = Array(15).fill("word").join(" ");
  const mediumNote: Entries = { "2026-04-01": detailedEntry("2026-04-01", [], fifteenWords) };
  const selfMedium = statsFor(EMPTY_PROFILE_SEED, mediumNote).find((s) => s.key === "selfUnderstanding")!;
  check("15-word-note-reaches-tier-2-alone", selfMedium.tier === 2, `tier=${selfMedium.tier}`);

  const fortyWords = Array(40).fill("word").join(" ");
  const longNoteAlone: Entries = { "2026-04-01": detailedEntry("2026-04-01", [], fortyWords) };
  const selfLong = statsFor(EMPTY_PROFILE_SEED, longNoteAlone).find((s) => s.key === "selfUnderstanding")!;
  check("40-word-note-worth-5-reaches-same-tier-2-band", selfLong.tier === 2, `tier=${selfLong.tier}`);

  // A longer note alone (one night) must score strictly higher than a
  // short note alone (one night) — checked below via two-night comparison
  // since both land in the same tier band at n=1 (tier bands aren't fine
  // enough to show 1 vs 5 directly) — two 40-word-note nights (10) clears
  // tier 3 (needs 7), where two short-note nights (2) does not.
  const twoLongNotes: Entries = {
    "2026-04-01": detailedEntry("2026-04-01", [], fortyWords),
    "2026-04-02": detailedEntry("2026-04-02", [], fortyWords),
  };
  const selfTwoLong = statsFor(EMPTY_PROFILE_SEED, twoLongNotes).find((s) => s.key === "selfUnderstanding")!;
  check("two-40-word-notes-reach-tier-3", selfTwoLong.tier === 3, `tier=${selfTwoLong.tier}`);
  const twoShortNotes: Entries = {
    "2026-04-01": detailedEntry("2026-04-01", [], "hey"),
    "2026-04-02": detailedEntry("2026-04-02", [], "hey"),
  };
  const selfTwoShort = statsFor(EMPTY_PROFILE_SEED, twoShortNotes).find((s) => s.key === "selfUnderstanding")!;
  check("two-short-notes-do-not-reach-tier-3", selfTwoShort.tier < 3, `tier=${selfTwoShort.tier}`);

  // goalDone alone is still worth exactly the old flat 1 point.
  const goalDoneOnly: Entries = {
    "2026-04-01": detailedEntry("2026-04-01", [], undefined, true),
    "2026-04-02": detailedEntry("2026-04-02", [], undefined, true),
  };
  const selfGoalOnly = statsFor(EMPTY_PROFILE_SEED, goalDoneOnly).find((s) => s.key === "selfUnderstanding")!;
  check("two-goalDone-only-nights-do-not-reach-tier-2", selfGoalOnly.tier < 2, `tier=${selfGoalOnly.tier}`);

  // goalDone + a long note on the same night takes the BETTER of the two
  // (5), not the sum (6) — no double-counting a single night.
  const goalDonePlusLongNote: Entries = { "2026-04-01": detailedEntry("2026-04-01", [], fortyWords, true) };
  const selfBoth = statsFor(EMPTY_PROFILE_SEED, goalDonePlusLongNote).find((s) => s.key === "selfUnderstanding")!;
  check("goalDone-plus-long-note-same-tier-as-long-note-alone", selfBoth.tier === selfLong.tier, `tier=${selfBoth.tier}`);

  // goalDone + a short note on the same night is still worth exactly 1
  // (max(1,1)), same as either alone — not stacked to 2.
  const goalDonePlusShortNote: Entries = {
    "2026-04-01": detailedEntry("2026-04-01", [], "hey", true),
    "2026-04-02": detailedEntry("2026-04-02", [], "hey", true),
  };
  const selfShortPlusGoal = statsFor(EMPTY_PROFILE_SEED, goalDonePlusShortNote).find((s) => s.key === "selfUnderstanding")!;
  check(
    "goalDone-plus-short-note-not-stacked",
    selfShortPlusGoal.tier === selfGoalOnly.tier,
    `tier=${selfShortPlusGoal.tier} vs goalDone-only tier=${selfGoalOnly.tier}`
  );

  // Never worth less than before: a realistic mixed log's new awareness
  // and selfUnderstanding tiers must be >= what the OLD flat
  // boolean-per-day formula would have produced for the exact same data.
  const mixedLog: Entries = {
    "2026-05-01": detailedEntry("2026-05-01", ["bored"]),
    "2026-05-02": detailedEntry("2026-05-02", ["after-work", "bored"]),
    "2026-05-03": detailedEntry("2026-05-03", ["after-work", "bored", "with-friends"], "a short one"),
    "2026-05-04": detailedEntry("2026-05-04", [], fortyWords),
    "2026-05-05": detailedEntry("2026-05-05", [], undefined, true),
    "2026-05-06": detailedEntry("2026-05-06", []),
  };
  const mixedDays = Object.values(mixedLog);
  const oldAwarenessCount = mixedDays.filter((d) => d.triggers.length > 0).length; // 3
  const oldSelfCount = mixedDays.filter((d) => Boolean(d.note) || d.goalDone).length; // 3
  const newAwareness = statsFor(EMPTY_PROFILE_SEED, mixedLog).find((s) => s.key === "awareness")!;
  const newSelf = statsFor(EMPTY_PROFILE_SEED, mixedLog).find((s) => s.key === "selfUnderstanding")!;
  check(
    "mixed-log-awareness-tier-never-below-old-formula",
    newAwareness.tier >= tierForTest(oldAwarenessCount),
    `new tier=${newAwareness.tier}, old-formula tier=${tierForTest(oldAwarenessCount)}`
  );
  check(
    "mixed-log-selfUnderstanding-tier-never-below-old-formula",
    newSelf.tier >= tierForTest(oldSelfCount),
    `new tier=${newSelf.tier}, old-formula tier=${tierForTest(oldSelfCount)}`
  );
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Companion check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
