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

export type Companion = {
  name: string;
  level: number; // 1-based
  stage: CompanionStage;
  totalNightsLogged: number;
  currentStreak: number; // consecutive logged nights ending today or yesterday
  longestStreak: number; // the number to actually show off; never resets downward
  nightsToNextLevel: number | null; // null once maxed out
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
    stage: stageFor(level),
    totalNightsLogged,
    currentStreak: current,
    longestStreak: longest,
    nightsToNextLevel: nightsToNextLevel(totalNightsLogged),
  };
}
