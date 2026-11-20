// The companion: a small, named character that stands in for the mirror —
// something to feel like "theirs" rather than a bare chart. Added 19 Nov
// 2026 at the founder's explicit request for a gamified, habit-forming
// feel, reconciled with the app's existing harm-reduction rules the same
// way Fix's own voice already is (lib/fix-prompt.ts):
//
//   - It levels up on USING THE APP, never on smoking less. The only input
//     is "did you log a night", not whether that night was a smoke night.
//     Gamifying abstinence itself would turn cannabis use into something
//     scored and graded, which every other part of this product (the
//     behaviour profile, Fix's own voice rules) deliberately refuses to do.
//   - The number actually celebrated is the LONGEST streak, which only
//     ever grows. A missed night doesn't reset a shown counter to zero —
//     there's a live "current streak" too, but nothing here frames a gap
//     as a loss, a broken streak, or something to feel bad about. Compare
//     Fix's own rule: "never moralise, never congratulate, never grade."
//   - It's opt-out: ShowCompanion in a profile's settings can turn the
//     whole thing off and fall back to the plain mirror, same as the app
//     already promises control over the Sunday ping.
//
// Levels are deliberately generous early (every few nights) and slower
// later — the first few are reachable in the free week itself.

import { addDays, todayISO, type Entries } from "./entry";

export type CompanionStage = "seed" | "sprout" | "sapling" | "young tree" | "full bloom";

// The companion picker (task 13 of the 50-step plan, 20 Nov 2026): the
// plant was the only companion anyone could have. These are drawn as
// components/CompanionSpecies.tsx's base forms, in the same one-line,
// never-grading visual language as the plant and MoodFace — picked for
// having genuinely distinct silhouettes at icon size (ear shape, tail vs.
// no tail, a dome instead of a round body), not because they're the "most
// popular" pets. The plant stays available too — switching species never
// deletes anyone's progress, since a species is a skin on the same level
// number, not a separate save file.
export type CompanionSpecies = "plant" | "fox" | "cat" | "rabbit" | "owl" | "turtle";

export const DEFAULT_SPECIES: CompanionSpecies = "plant";

export const SPECIES_ORDER: readonly CompanionSpecies[] = ["plant", "fox", "cat", "rabbit", "owl", "turtle"];

export const SPECIES_LABEL: Record<CompanionSpecies, string> = {
  plant: "a plant",
  fox: "a fox",
  cat: "a cat",
  rabbit: "a rabbit",
  owl: "an owl",
  turtle: "a turtle",
};

export type Companion = {
  name: string;
  level: number; // 1-based
  levelName: string; // "a sprout, pushing up" — shown next to the number
  stage: CompanionStage;
  totalNightsLogged: number;
  currentStreak: number; // consecutive logged nights ending today or yesterday
  longestStreak: number; // the number to actually show off; never resets downward
  nightsToNextLevel: number | null; // null once maxed out
  progress: LevelProgress | null; // null once maxed out — same condition as nightsToNextLevel
};

export const DEFAULT_COMPANION_NAME = "fix";

// Nights logged (not nights smoke-free) needed to reach each level above 1.
// Levels 1-5 move fast on purpose — level 5 lands inside most people's free
// week. No entry for level 1 itself: everyone starts there with zero nights.
const LEVEL_THRESHOLDS = [3, 7, 14, 25, 40, 60, 85, 115, 150];

const MAX_LEVEL = LEVEL_THRESHOLDS.length + 1;

export function levelFor(totalNightsLogged: number): number {
  let level = 1;
  for (const t of LEVEL_THRESHOLDS) {
    if (totalNightsLogged >= t) level += 1;
    else break;
  }
  return Math.min(level, MAX_LEVEL);
}

export function nightsToNextLevel(totalNightsLogged: number): number | null {
  const next = LEVEL_THRESHOLDS.find((t) => t > totalNightsLogged);
  return next === undefined ? null : next - totalNightsLogged;
}

// A name per level, two per growth stage (STAGE_LABEL below), so the
// number always has a plain-words companion instead of standing alone.
// These are framing, not a new fact about the person — same rule as
// STAGE_LABEL and traitFor: nothing here claims anything about how much
// they smoke, only about how long they've been using the app.
const LEVEL_NAME: Record<number, string> = {
  1: "a seed, just planted",
  2: "a seed, taking root",
  3: "a sprout, pushing up",
  4: "a sprout, finding the light",
  5: "a sapling, standing on its own",
  6: "a sapling, branching out",
  7: "a young tree, growing steadily",
  8: "a young tree, well rooted",
  9: "in full bloom",
  10: "in full bloom, still reaching",
};

export function levelName(level: number): string {
  return LEVEL_NAME[Math.min(Math.max(1, level), MAX_LEVEL)] ?? LEVEL_NAME[MAX_LEVEL];
}

export type LevelProgress = {
  /** Nights logged since the current level was reached. */
  into: number;
  /** Nights the current level spans, start to next threshold. */
  span: number;
  /** 0-1, for a progress bar. Always <= 1; never negative. */
  fraction: number;
};

/**
 * How far into the current level the person is, in real nights logged —
 * never a fabricated XP number, just the same count everything else here
 * is built from. Null once maxed out, same as nightsToNextLevel.
 */
export function levelProgress(totalNightsLogged: number): LevelProgress | null {
  const level = levelFor(totalNightsLogged);
  if (level >= MAX_LEVEL) return null;
  const prevThreshold = level === 1 ? 0 : LEVEL_THRESHOLDS[level - 2];
  const nextThreshold = LEVEL_THRESHOLDS[level - 1];
  const into = Math.max(0, totalNightsLogged - prevThreshold);
  const span = Math.max(1, nextThreshold - prevThreshold);
  return { into, span, fraction: Math.min(1, into / span) };
}

export function stageFor(level: number): CompanionStage {
  if (level <= 2) return "seed";
  if (level <= 4) return "sprout";
  if (level <= 6) return "sapling";
  if (level <= 8) return "young tree";
  return "full bloom";
}

export const STAGE_LABEL: Record<CompanionStage, string> = {
  seed: "a seed",
  sprout: "a sprout",
  sapling: "a sapling",
  "young tree": "a young tree",
  "full bloom": "in full bloom",
};

// --- per-species evolution tiers (design only) ---------------------------
//
// Task 15 of the 50-step plan, 20 Nov 2026: define what each animal's five
// growth tiers ARE, before task 16 draws them. A species doesn't get its
// own level thresholds — stageFor() above already decides, from the same
// nights-logged count, which of the five shared stages (seed through full
// bloom) anyone is at, plant or animal. What a species gets here is its own
// LOOK and NAME at each of those five stages, so "level 6" reads as "a
// young fox, finding its legs" instead of the plant's "a sapling,
// branching out" when the companion isn't a plant.
//
// UPDATE, task 16 (20 Nov 2026): now wired into the live UI, via
// displayLevelName() below — CompanionPortrait draws every species' real
// stage, so showing the matching label no longer claims growth the picture
// doesn't back up. (This comment originally said the opposite — "not wired
// in yet, would read as a bug" — while only the art was missing; kept this
// note rather than deleting it so the reasoning for *why* it waited isn't
// lost, now that it's true again in the other direction.)
//
// Kept here, in code, rather than in a separate design doc, so it can't
// drift out of sync with CompanionStage/CompanionSpecies and is covered by
// a test (scripts/test-companion-species.ts) the moment it's wrong or
// incomplete.
//
// Visual brief per tier, for whoever draws task 16 — same "one warm ink
// line, no gradients, never performs happiness it hasn't earned" rules
// components/CompanionSpecies.tsx already states. Only the full-bloom tier
// gets a single accent-coloured fleck, mirroring the plant's one blossom
// mark (components/CompanionAvatar.tsx's FullBloom) — every earlier tier
// stays monochrome.
//
//   fox    seed        a curled, sleeping kit — ears already pointed but
//                       tucked down, tail small and close to the body.
//          sprout       ears up, eyes still closed — rounder-faced than
//                       what it'll grow into, tail a little fuller.
//          sapling      leaner face, legs reading longer, tail visibly
//                       bushier.
//          young tree   alert posture, sharper features, tail held in a
//                       confident curl.
//          full bloom   the adult brush tail with a single accent-coloured
//                       tip; poised rather than resting.
//
//   cat    seed        curled tight, eyes closed, ears small and close to
//                       the head.
//          sprout       sitting up, whiskers drawn in, ears perked.
//          sapling      longer body line, tail now visibly curled.
//          young tree   poised sit, tail raised.
//          full bloom   the full adult cat, tail wrapped neatly, one
//                       accent-coloured marking (a small chest patch).
//
//   rabbit seed        ears low, folded close against a small round body.
//          sprout       one ear starting to lift.
//          sapling      both ears up, body reading a little longer.
//          young tree   ears tall, weight forward as if about to hop.
//          full bloom   full height, ears at their tallest, one
//                       accent-coloured tuft at the chest.
//
//   owl    seed        eyes closed, small and round, tufts flat.
//          sprout       eyes still closed, tufts just starting to show.
//          sapling      a more defined facial disc, the suggestion of
//                       folded wings at the sides.
//          young tree   fuller body, wing/feather lines more defined.
//          full bloom   the full adult owl, one accent-coloured chest
//                       marking — eyes stay closed even here; calm, not
//                       sleepy-because-it's-young.
//
//   turtle seed        a tiny shell, head mostly tucked in.
//          sprout       shell a little larger, head peeking out more.
//          sapling      the shell's pattern lines more defined, legs more
//                       visible.
//          young tree   a fuller shell, a steadier stance.
//          full bloom   the full adult shell with its complete seam
//                       pattern, one accent-coloured marking on the shell.
//
// Flavor labels, parallel to LEVEL_NAME above but one per STAGE rather than
// per level (an animal doesn't need the plant's finer two-per-stage split
// to read as "growing" — the art itself, once task 16 draws it, carries
// most of that). plant's own column is STAGE_LABEL verbatim, not
// retyped, so the two can never quietly drift apart.
export const SPECIES_STAGE_LABEL: Record<CompanionSpecies, Record<CompanionStage, string>> = {
  plant: STAGE_LABEL,
  fox: {
    seed: "a kit, just curled up",
    sprout: "a kit, ears up",
    sapling: "a young fox, finding its legs",
    "young tree": "a fox, quick and sure",
    "full bloom": "a fox, full and clever",
  },
  cat: {
    seed: "a kitten, barely stirring",
    sprout: "a kitten, taking notice",
    sapling: "a young cat, finding its feet",
    "young tree": "a cat, watchful",
    "full bloom": "a cat, entirely its own",
  },
  rabbit: {
    seed: "a kit, ears still down",
    sprout: "a kit, one ear up",
    sapling: "a young rabbit, alert",
    "young tree": "a rabbit, ready to go",
    "full bloom": "a rabbit, fully grown",
  },
  owl: {
    seed: "an owlet, eyes shut",
    sprout: "an owlet, tufts coming in",
    sapling: "a young owl, filling out",
    "young tree": "an owl, watchful even with its eyes closed",
    "full bloom": "an owl, fully fledged",
  },
  turtle: {
    seed: "a hatchling, shell still soft-looking",
    sprout: "a hatchling, head out",
    sapling: "a young turtle, settling into its shell",
    "young tree": "a turtle, steady",
    "full bloom": "a turtle, unhurried and whole",
  },
};

/**
 * The species-flavoured stage label for a level — e.g. "a young fox,
 * finding its legs" for a fox at level 6, vs. the plant's "a sapling,
 * branching out" (from LEVEL_NAME) at the same level.
 */
export function speciesStageLabel(species: CompanionSpecies, level: number): string {
  return SPECIES_STAGE_LABEL[species][stageFor(level)];
}

/**
 * What to actually show next to a level number, for whichever species the
 * person has (task 16, 20 Nov 2026): the plant keeps its existing, finer
 * two-names-per-stage LEVEL_NAME text (passed in as `plantLevelName` — e.g.
 * companion.levelName from companionFor()); every animal gets its
 * speciesStageLabel() instead. The one place every display site
 * (CompanionBadge, PatternCard, the onboarding reveal) should go through,
 * so "which text for which species" is decided once, not three times.
 */
export function displayLevelName(species: CompanionSpecies | undefined, level: number, plantLevelName: string): string {
  if (!species || species === "plant") return plantLevelName;
  return speciesStageLabel(species, level);
}

/**
 * Current streak (consecutive logged nights, counting back from today — a
 * gap "ends" the current streak but today or yesterday being unlogged yet
 * doesn't count against it, since the night isn't over) and longest streak
 * ever seen across the whole log.
 */
export function streaksFor(entries: Entries, today: string = todayISO()): { current: number; longest: number } {
  const days = Object.keys(entries).sort();
  if (days.length === 0) return { current: 0, longest: 0 };

  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of days) {
    if (prev && addDays(prev, 1) === day) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = day;
  }

  // Current streak: walk back from today (or yesterday, if tonight isn't
  // logged yet — the night isn't over, so that's not a gap) while each day
  // has an entry.
  let current = 0;
  let cursor = entries[today] ? today : addDays(today, -1);
  while (entries[cursor]) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  return { current, longest };
}

// A one-line personality for the companion reveal at onboarding, when the
// log has zero nights and every companion would otherwise be identical
// (seed, level 1). This isn't gamifying smoking — it never mentions whether
// they smoke more or less — it's reflecting the shape of their OWN answers
// back at them, same honest-mirror rule as lib/behaviour-profile.ts. Picked
// by simple priority, not scored or weighted, so it stays easy to reason
// about and impossible to feel "graded" by.
export function traitFor(input: {
  smokeTime?: string;
  frequency?: string;
  triedCuttingDown?: string;
}): string {
  if (input.triedCuttingDown === "tried, and it stuck for a while") {
    return "steady — you've done this before, and it held.";
  }
  if (input.triedCuttingDown === "tried, and slipped back") {
    return "persistent — you've been here before and came back to look again.";
  }
  if (input.smokeTime === "late night") return "a night owl, by your own account.";
  if (input.smokeTime === "after work") return "quietly unwinds, same time most days.";
  if (input.frequency === "it varies a lot") return "hard to pin down — even to yourself.";
  if (input.frequency === "pretty much daily") return "consistent, at least in this.";
  return "just getting started — the shape comes later.";
}

export function companionFor(name: string, entries: Entries, today?: string): Companion {
  const totalNightsLogged = Object.keys(entries).length;
  const { current, longest } = streaksFor(entries, today);
  const level = levelFor(totalNightsLogged);
  return {
    name: name.trim() || DEFAULT_COMPANION_NAME,
    level,
    levelName: levelName(level),
    stage: stageFor(level),
    totalNightsLogged,
    currentStreak: current,
    longestStreak: longest,
    nightsToNextLevel: nightsToNextLevel(totalNightsLogged),
    progress: levelProgress(totalNightsLogged),
  };
}

// --- stats --------------------------------------------------------------
//
// Added 20 Nov 2026 at the founder's request: instead of one flat level,
// the companion carries five named attributes (same five the product
// vision names), each shown as a filled meter, 0 to 5 bars.
//
// CRITICAL RULE, same as the level above, now explicit per-attribute: a
// stat is never allowed to go down. Every stat is built as a COUNT of
// things that already happened (an onboarding answer given, a trigger
// tagged, a night logged, a harder night shown up for, a reflection
// written) fed through a one-way staircase (tierFor). Counts only grow as
// the log grows; nothing here is an average, a ratio, or anything that a
// quiet week could pull back down. The one way a number here could fall is
// the person deleting their own past entries on purpose (lib/entry.ts
// removeEntry) — that is their own edit to their own data, not the app
// grading a gap, and it isn't what "no decrease" is guarding against.
//
// The six onboarding answers (lib/behaviour-profile.ts) aren't thrown away
// to make room for this — each one seeds exactly one or two of the five
// attributes below, so the same facts the old text board showed are still
// what the bars are built from, just read as a starting point rather than
// a list.

export type StatKey = "awareness" | "mindfulness" | "consistency" | "resilience" | "selfUnderstanding";

export type Stat = {
  key: StatKey;
  label: string;
  /** 0-5 bars filled. */
  tier: number;
  maxTier: number;
  /** Why this one grows — shown as a small caption under the meter. */
  blurb: string;
};

export const STAT_ORDER: StatKey[] = ["awareness", "mindfulness", "consistency", "resilience", "selfUnderstanding"];

export const STAT_LABEL: Record<StatKey, string> = {
  awareness: "awareness",
  mindfulness: "mindfulness",
  consistency: "consistency",
  resilience: "resilience",
  selfUnderstanding: "self-understanding",
};

const STAT_BLURB: Record<StatKey, string> = {
  awareness: "grows when you name what's going on — a trigger, a time, a pattern.",
  mindfulness: "grows with every honest check-in, logged or not.",
  resilience: "grows when you show up on the harder nights, not just the easy ones.",
  selfUnderstanding: "grows with reflections and the goal you set for yourself.",
  consistency: "tracks your longest run on the app — it only ever grows, never resets.",
};

const MAX_TIER = 5;

// Counts needed to light each of the 5 bars. Deliberately gentle near the
// start (one onboarding answer already lights the first bar) and slower
// after, same shape as the level thresholds above.
const STAT_TIER_COUNTS = [0, 1, 3, 7, 14, 25];

function tierFor(count: number): number {
  let tier = 0;
  for (let i = 1; i < STAT_TIER_COUNTS.length; i++) {
    if (count >= STAT_TIER_COUNTS[i]) tier = i;
  }
  return Math.min(tier, MAX_TIER);
}

const HARDER_TRIGGERS = new Set(["stressed", "couldnt-sleep", "alone", "after-her"]);

/** Which of the onboarding answers are present, read at the raw-field
 *  level so this has no dependency on lib/behaviour-profile.ts's sentences.
 *
 *  hasHistory (from "have you tried cutting down before?") stopped being
 *  askable 20 Nov 2026 — the question was dropped from onboarding, so it's
 *  always false for anyone who onboards from here on. It stays in the type
 *  rather than being deleted, because it still reads real, previously-saved
 *  data for existing users who already answered it: nothing here takes that
 *  credit away from them. hasHarderTrigger replaces it as resilience's
 *  second seed point for everyone new — picking one of the four harder
 *  trigger chips up front (stressed, couldn't sleep, alone, after her) is
 *  the same signal the live stat already rewards from logged nights
 *  (statsFor's resilience line, below), just asked once at the start
 *  instead of only read back afterwards. */
export type ProfileSeed = {
  hasTrigger: boolean;
  hasTiming: boolean;
  hasFrequency: boolean;
  hasInterferes: boolean;
  hasHistory: boolean;
  hasHarderTrigger: boolean;
  hasGoal: boolean;
};

export const EMPTY_PROFILE_SEED: ProfileSeed = {
  hasTrigger: false,
  hasTiming: false,
  hasFrequency: false,
  hasInterferes: false,
  hasHistory: false,
  hasHarderTrigger: false,
  hasGoal: false,
};

/** Builds a ProfileSeed straight from the onboarding/profile fields
 *  (lib/profile.ts's Profile shape, loosely typed here to avoid a circular
 *  import). Used identically at onboarding and in the live app, so a
 *  stat's starting tier is the same number in both places. */
export function seedFromProfile(p: {
  interferesWith?: string[];
  smokeTime?: string;
  preferredTriggers?: string[];
  frequency?: string;
  triedCuttingDown?: string;
  goal?: unknown;
}): ProfileSeed {
  return {
    hasTrigger: Boolean(p.preferredTriggers && p.preferredTriggers.length > 0),
    hasTiming: Boolean(p.smokeTime),
    hasFrequency: Boolean(p.frequency),
    hasInterferes: Boolean(p.interferesWith && p.interferesWith.length > 0 && !p.interferesWith.includes("nothing in particular")),
    hasHistory: Boolean(p.triedCuttingDown),
    hasHarderTrigger: Boolean(p.preferredTriggers && p.preferredTriggers.some((t) => HARDER_TRIGGERS.has(t))),
    hasGoal: Boolean(p.goal),
  };
}

/**
 * The five attribute meters. `seed` is the one-time credit from the
 * onboarding answers; everything after that is read live from `entries`,
 * so the bars keep moving every time a night gets logged.
 */
export function statsFor(seed: ProfileSeed, entries: Entries): Stat[] {
  const days = Object.values(entries);
  const { longest } = streaksFor(entries);

  const counts: Record<StatKey, number> = {
    awareness: (seed.hasTrigger ? 1 : 0) + (seed.hasTiming ? 1 : 0) + days.filter((d) => d.triggers.length > 0).length,
    mindfulness: (seed.hasFrequency ? 1 : 0) + days.length,
    consistency: longest,
    // The second point used to come only from hasHistory ("tried cutting
    // down before?"); that question is gone from onboarding, so
    // hasHarderTrigger now covers it too — either one is worth the same
    // single point, never both at once, so this stays the same 0-2 seed
    // range it always was for a user with just one of the two signals.
    resilience:
      (seed.hasInterferes ? 1 : 0) +
      (seed.hasHistory || seed.hasHarderTrigger ? 1 : 0) +
      days.filter((d) => d.triggers.some((t) => HARDER_TRIGGERS.has(t))).length,
    selfUnderstanding: (seed.hasGoal ? 1 : 0) + days.filter((d) => Boolean(d.note) || d.goalDone).length,
  };

  return STAT_ORDER.map((key) => ({
    key,
    label: STAT_LABEL[key],
    tier: tierFor(counts[key]),
    maxTier: MAX_TIER,
    blurb: STAT_BLURB[key],
  }));
}

// --- total HP (task 17 of the 50-step plan, 20 Nov 2026) -------------------
//
// One combined number instead of five separate meters — for two things that
// need a single value rather than a row of bars: the "Tekken-style" health
// bar UI (task 18, next) and, later, a stats-only number to compare with a
// friend (tasks 25-31) — a single HP figure is something to show someone
// else; five side-by-side meters asking to be read and compared one at a
// time are not.
//
// Deliberately NOT a new, separate counter. It's a pure arithmetic transform
// of statsFor()'s already-computed, already-tested tiers above — no new
// counting, nothing a user could do that moves this number without also
// moving one of the five meters they can already see. That also means the
// "never decreases" guarantee the five meters already have (a tier only
// ever goes up) carries over for free: summing numbers that only ever grow
// can itself only ever grow.
//
// 100 is the max HP because it reads instantly as a health/HP bar — "68/100"
// needs no explanation the way "17/25 arbitrary points" would — and it
// divides evenly five ways: 20 HP per stat, and since each stat has 5 tiers,
// exactly 4 HP per tier. The Tekken-style breakdown bar (task 18) is this
// same one bar, just drawn as five coloured segments end to end instead of
// a single fill colour, each segment's own length showing that one stat's
// own tier — nothing here commits to how that bar is drawn, only to the
// numbers it would be drawn from.

export const HP_PER_STAT = 20; // 5 stats x 20 HP = 100 total
export const MAX_HP = HP_PER_STAT * STAT_ORDER.length; // 100
const HP_PER_TIER = HP_PER_STAT / MAX_TIER; // 4 HP per tier, 5 tiers per stat

export type HPSegment = {
  key: StatKey;
  label: string;
  /** This one stat's own contribution to the total, 0..HP_PER_STAT, always
   *  a multiple of HP_PER_TIER (one step per tier, same tiers statsFor()
   *  already reports). */
  hp: number;
  maxHp: number;
  /** The same 0-5 tier statsFor() reports for this stat, kept alongside hp
   *  so a caption ("awareness: tier 3 of 5") doesn't need to re-derive it
   *  from hp/HP_PER_TIER. */
  tier: number;
};

export type HPTotal = {
  /** 0..maxHp, the sum of every segment. */
  hp: number;
  maxHp: number;
  /** One entry per stat, in STAT_ORDER — the breakdown the Tekken-style bar
   *  (task 18) draws as its coloured segments. */
  segments: HPSegment[];
};

/**
 * The single combined HP number, plus the per-stat breakdown it's made of.
 * A pure transform of statsFor()'s output — pass it the same Stat[] that
 * already feeds the five meters, so the combined number can never say
 * anything the five meters don't already say.
 */
export function hpFor(stats: Stat[]): HPTotal {
  const segments: HPSegment[] = stats.map((s) => ({
    key: s.key,
    label: s.label,
    hp: s.tier * HP_PER_TIER,
    maxHp: HP_PER_STAT,
    tier: s.tier,
  }));
  const hp = segments.reduce((sum, s) => sum + s.hp, 0);
  return { hp, maxHp: MAX_HP, segments };
}

// --- the "it grew" moment -------------------------------------------------
//
// "After saving a journal, trigger a satisfying but subtle character
// progression animation... 'Your awareness just grew.'" — from the product
// vision. Built by diffing real before/after state (never a guess, never
// shown for a night that didn't actually move a bar), and never mentioning
// whether the night was a smoke night — same rule as everything else here.

export type Growth = { leveledUp: boolean; grownStat: StatKey | null };

/** What changed between one log state and the next, for exactly one save. */
export function growthSince(seed: ProfileSeed, before: Entries, after: Entries): Growth {
  const beforeLevel = levelFor(Object.keys(before).length);
  const afterLevel = levelFor(Object.keys(after).length);
  const beforeStats = statsFor(seed, before);
  const afterStats = statsFor(seed, after);

  let grownStat: StatKey | null = null;
  for (let i = 0; i < STAT_ORDER.length; i++) {
    if (afterStats[i].tier > beforeStats[i].tier) {
      grownStat = STAT_ORDER[i];
      break;
    }
  }
  return { leveledUp: afterLevel > beforeLevel, grownStat };
}

/** One quiet line for the saved screen, or null when nothing moved this
 *  time (most nights, once the easy early bars are full) — never padded
 *  out with a generic "nice job" when nothing actually grew. */
export function growthMessage(name: string, growth: Growth): string | null {
  if (growth.leveledUp) return `${name} just grew — a new level.`;
  if (growth.grownStat) return `your ${STAT_LABEL[growth.grownStat]} grew a little.`;
  return null;
}

/** Entries strictly before a given day — used to reconstruct "the log as
 *  it stood at the start of this week" so the Sunday card can show what
 *  grew across the whole week (growthSince, above) without a second
 *  stored snapshot anywhere. `day` itself is excluded, so passing a
 *  week's own start date gives everything before that week began. */
export function entriesBefore(entries: Entries, day: string): Entries {
  const out: Entries = {};
  for (const [d, e] of Object.entries(entries)) {
    if (d < day) out[d] = e;
  }
  return out;
}
