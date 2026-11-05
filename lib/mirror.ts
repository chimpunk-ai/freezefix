import type { DayShape, Mood, TriggerId } from "@/lib/checkins";
import type { WeeklyGoal } from "@/lib/weekly-goal";

export type MirrorSummary = {
  recorded: number;
  useDays: number;
  noUseDays: number;
  topTrigger: { id: TriggerId; count: number } | null;
  moodDifference: { useAverage: number; noUseAverage: number; useN: number; noUseN: number } | null;
  goalDone: number;
  goalTarget: number | null;
  sentence: string;
  caveat: string;
};

const MOOD_NAMES: Record<Mood, string> = {
  1: "rough",
  2: "low",
  3: "in the middle",
  4: "pretty good",
  5: "good",
};

/** Pure weekly summary: only describe the data the person actually logged. */
export function summarizeWeek(days: DayShape[], goal: WeeklyGoal | null = null): MirrorSummary {
  const recordedDays = days.filter((day) => day.answer === "yes" || day.answer === "no");
  const useDays = recordedDays.filter((day) => day.answer === "yes");
  const noUseDays = recordedDays.filter((day) => day.answer === "no");

  const triggerCounts = new Map<TriggerId, number>();
  for (const day of useDays) {
    for (const trigger of new Set(day.triggers)) triggerCounts.set(trigger, (triggerCounts.get(trigger) ?? 0) + 1);
  }
  const ranked = [...triggerCounts.entries()].sort((a, b) => b[1] - a[1]);
  const topTrigger = ranked.length > 0 && (ranked.length === 1 || ranked[0][1] - ranked[1][1] >= 1)
    ? { id: ranked[0][0], count: ranked[0][1] }
    : null;

  const useMoods = useDays.flatMap((day) => (day.mood ? [day.mood] : []));
  const noUseMoods = noUseDays.flatMap((day) => (day.mood ? [day.mood] : []));
  const moodDifference = useMoods.length >= 3 && noUseMoods.length >= 3
    ? {
        useAverage: average(useMoods),
        noUseAverage: average(noUseMoods),
        useN: useMoods.length,
        noUseN: noUseMoods.length,
      }
    : null;

  const goalDone = days.filter((day) => day.goalDone === true).length;
  let sentence: string;
  if (recordedDays.length < 3) {
    sentence = "A few dots so far. More check-ins will give this week a clearer shape.";
  } else if (useDays.length === 0) {
    sentence = `You logged no use on ${noUseDays.length} of ${recordedDays.length} days you checked in.`;
  } else if (noUseDays.length === 0) {
    sentence = `You logged use on ${useDays.length} of ${recordedDays.length} days you checked in.`;
  } else {
    sentence = `You logged use on ${useDays.length} of ${recordedDays.length} days you checked in.`;
  }
  if (topTrigger && topTrigger.count >= 2) {
    sentence += ` “${triggerLabel(topTrigger.id)}” appeared on ${topTrigger.count} of those use days.`;
  }

  return {
    recorded: recordedDays.length,
    useDays: useDays.length,
    noUseDays: noUseDays.length,
    topTrigger: topTrigger && topTrigger.count >= 2 ? topTrigger : null,
    moodDifference,
    goalDone,
    goalTarget: goal?.target ?? null,
    sentence,
    caveat: "This is a description of the check-ins you chose to save, not a cause, diagnosis, or grade. A day without a check-in is left open.",
  };
}

export function moodLabel(value: Mood): string {
  return MOOD_NAMES[value];
}

export function triggerLabel(id: TriggerId): string {
  const labels: Record<TriggerId, string> = {
    "after-work": "after work",
    bored: "boredom",
    friends: "time with friends",
    sleep: "difficulty sleeping",
    "after-person": "being around someone",
    alone: "being alone",
    other: "something else",
  };
  return labels[id];
}

function average(values: number[]): number {
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}
