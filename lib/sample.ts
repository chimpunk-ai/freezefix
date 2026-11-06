import { addDays, type Entries } from "./entry";
import type { Goal } from "./profile";

// A fixed sample week, used only on the landing page so a visitor can see what
// the Sunday card looks like before they've logged anything. Not user data.

export const SAMPLE_END = "2026-11-01";
export const SAMPLE_GOAL: Goal = { text: "go for a run", target: 2, madeAt: "2026-10-26" };

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
