import { addDays, type Entries } from "./entry";
import type { Goal } from "./profile";

// A fixed sample week, used only on the landing page so a visitor can see what
// the Sunday card looks like before they've logged anything. Not user data.

export const SAMPLE_END = "2026-11-01";
export const SAMPLE_GOAL: Goal = { text: "go for a run", target: 2, madeAt: "2026-10-26" };

/**
 * Three sample weeks for the landing's shelf section, oldest first, as one
 * Entries map so weekStats can see the week before each week (that's how the
 * goal line gets its "last week" number). The first week is deliberately
 * thin — three nights logged — because the shelf must show that a gap is a
 * gap, never a no. The goal count climbs 0 → 1 → 2: a direction, not a score.
 */
export const SAMPLE_WEEK_ENDS = ["2026-10-18", "2026-10-25", SAMPLE_END] as const;

export function sampleShelfEntries(): Entries {
  const out: Entries = { ...sampleEntries() };
  // Week ending 18 Oct: only three nights logged.
  const thin: Array<[number, boolean, 1 | 2 | 3 | 4 | 5, string[]]> = [
    [1, true, 3, ["after-work"]],
    [4, true, 2, ["couldnt-sleep", "alone"]],
    [5, true, 3, ["with-friends"]],
  ];
  for (const [offset, smoked, mood, triggers] of thin) {
    const day = addDays("2026-10-18", -6 + offset);
    out[day] = { day, smoked, mood, triggers: triggers as Entries[string]["triggers"], at: 0 };
  }
  // Week ending 25 Oct: five nights, the run happened once.
  const mid: Array<[number, boolean, 1 | 2 | 3 | 4 | 5, string[], boolean?]> = [
    [0, true, 3, ["after-work"]],
    [1, true, 2, ["after-work", "bored"]],
    [3, false, 3, [], true],
    [4, true, 3, ["after-work"]],
    [6, true, 3, ["with-friends"]],
  ];
  for (const [offset, smoked, mood, triggers, goalDone] of mid) {
    const day = addDays("2026-10-25", -6 + offset);
    out[day] = { day, smoked, mood, triggers: triggers as Entries[string]["triggers"], goalDone, at: 0 };
  }
  return out;
}

export function sampleEntries(): Entries {
  const rows: Array<[number, boolean, 1 | 2 | 3 | 4 | 5, string[], boolean?]> = [
    [0, false, 4, [], true],
    [1, true, 3, ["after-work", "couldnt-sleep"]],
    [2, true, 2, ["after-work", "after-her"]],
    [3, false, 3, [], true],
    [4, true, 3, ["after-work"]],
    [5, true, 2, ["after-her", "bored"]],
    [6, false, 4, []],
  ];
  const out: Entries = {};
  for (const [offset, smoked, mood, triggers, goalDone] of rows) {
    const day = addDays(SAMPLE_END, -6 + offset);
    out[day] = {
      day,
      smoked,
      mood,
      triggers: triggers as Entries[string]["triggers"],
      goalDone,
      at: 0,
    };
  }
  return out;
}
