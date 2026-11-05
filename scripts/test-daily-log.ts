import assert from "node:assert/strict";
import { normalizeLog } from "../lib/checkins";
import { summarizeWeek } from "../lib/mirror";
import type { DayShape } from "../lib/checkins";

const migrated = normalizeLog({
  "2026-11-02": "yes",
  "2026-11-03": {
    answer: "no",
    mood: 4,
    triggers: ["bored", "bored", "invalid", "sleep", "friends", "alone"],
    goalDone: true,
    voiceText: "  made dinner  ",
  },
  nonsense: "yes",
  "2026-11-04": "maybe",
});
assert.deepEqual(migrated["2026-11-02"], { answer: "yes", triggers: [] });
assert.deepEqual(migrated["2026-11-03"], {
  answer: "no",
  mood: 4,
  triggers: ["bored", "sleep", "friends"],
  goalDone: true,
  voiceText: "made dinner",
});
assert.equal(Object.keys(migrated).length, 2);
assert.deepEqual(normalizeLog({ "2026-11-05": { answer: "yes", triggers: ["alone"] } })["2026-11-05"]?.triggers, ["alone"]);
assert.deepEqual(normalizeLog(null), {});

const blankWeek = Array.from({ length: 7 }, (_, i) => ({
  day: `2026-11-${String(i + 2).padStart(2, "0")}`,
  initial: "M",
  answer: undefined,
  triggers: [],
})) as DayShape[];
const blankSummary = summarizeWeek(blankWeek);
assert.equal(blankSummary.recorded, 0);
assert.match(blankSummary.sentence, /A few dots/);
assert.equal(blankSummary.moodDifference, null);

const days = Array.from({ length: 7 }, (_, i) => ({
  day: `2026-11-${String(i + 2).padStart(2, "0")}`,
  initial: "M",
  answer: i < 3 ? "yes" as const : "no" as const,
  mood: (i < 3 ? 2 : 4) as 2 | 4,
  triggers: i < 3 ? ["after-work" as const] : [],
  goalDone: i === 4,
})) as DayShape[];
const summary = summarizeWeek(days, { text: "Run twice", target: 2 });
assert.equal(summary.recorded, 7);
assert.equal(summary.useDays, 3);
assert.equal(summary.noUseDays, 4);
assert.equal(summary.topTrigger?.id, "after-work");
assert.deepEqual(summary.moodDifference, { useAverage: 2, noUseAverage: 4, useN: 3, noUseN: 4 });
assert.equal(summary.goalDone, 1);
assert.equal(summary.goalTarget, 2);
assert.match(summary.sentence, /3 of 7/);
assert.doesNotMatch(summary.sentence, /because|caused|should/i);

console.log("daily log migration and weekly mirror tests passed");
