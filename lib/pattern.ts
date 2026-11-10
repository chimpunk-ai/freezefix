// The pattern engine.
//
// Plain arithmetic on the user's own log. No model, no scoring, no diagnosis.
// It produces the sentences the Sunday card shows, and the grounding text Fix
// is allowed to talk about. Every claim is checked against a real entry; when
// there isn't enough data for a comparison, the comparison is left out rather
// than guessed.

import {
  addDays,
  dayFromISO,
  isWeekend,
  todayISO,
  weekdayShort,
  TRIGGER_LABEL,
  type Entries,
  type Entry,
  type Mood,
  type TriggerId,
} from "./entry";
import type { Goal } from "./profile";

const WORD = ["zero", "one", "two", "three", "four", "five", "six", "seven"] as const;

export function numberWord(n: number): string {
  return WORD[Math.max(0, Math.min(7, Math.round(n)))];
}

export type DayCell = {
  day: string;
  initial: string;
  smoked: boolean | null;
  mood: Mood | null;
  triggers: TriggerId[];
};

export type GoalLine = {
  text: string;
  done: number;
  target: number;
  lastWeekDone: number | null;
  direction: "up" | "down" | "same" | "first";
};

export type WeekStats = {
  start: string;
  end: string;
  cells: DayCell[];
  logged: number;
  smoked: number;
  notSmoked: number;
  topTrigger: TriggerId | null;
  topTriggerCount: number;
  weekdaySmokes: number;
  weekendSmokes: number;
  /** Average mood logged on the day AFTER a no-smoke night, when both days exist. */
  moodAfterNoSmoke: number | null;
  /** Average mood logged on the day AFTER a smoke night, when both days exist. */
  moodAfterSmoke: number | null;
  sentences: string[];
  observation: string | null;
  goalLine: GoalLine | null;
};

function cellsFor(entries: Entries, end: string): DayCell[] {
  const cells: DayCell[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = addDays(end, -i);
    const e = entries[day];
    cells.push({
      day,
      initial: weekdayShort(day),
      smoked: e ? e.smoked : null,
      mood: e ? e.mood : null,
      triggers: e ? e.triggers : [],
    });
  }
  return cells;
}

function average(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function countTriggers(cells: DayCell[]): { top: TriggerId | null; count: number } {
  const counts = new Map<TriggerId, number>();
  for (const c of cells) {
    if (c.smoked !== true) continue;
    for (const t of c.triggers) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  let top: TriggerId | null = null;
  let count = 0;
  for (const [t, n] of counts) {
    if (n > count) {
      top = t;
      count = n;
    }
  }
  return { top, count };
}

// Compares the mood logged the day after a smoke with the day after a no-smoke
// night. Both days must be logged, so a missing day never counts as either.
//
// Returns the sample count per group alongside the averages so the caller can
// enforce the readme's promise: mood comparisons are withheld until there are
// at least MIN_MOOD_SAMPLES ratings on each side. A single data point on each
// side is not a trend, and the mirror must not whisper it to the user as one.
export const MIN_MOOD_SAMPLES = 3;

function moodAfter(
  entries: Entries,
  end: string,
): {
  afterNoSmoke: number | null;
  afterSmoke: number | null;
  afterNoSmokeN: number;
  afterSmokeN: number;
} {
  const afterNoSmoke: number[] = [];
  const afterSmoke: number[] = [];
  for (let i = 0; i < 14; i++) {
    const day = addDays(end, -i);
    const next = addDays(day, 1);
    const e = entries[day];
    const n = entries[next];
    if (!e || !n) continue;
    if (e.smoked) afterSmoke.push(n.mood);
    else afterNoSmoke.push(n.mood);
  }
  return {
    afterNoSmoke: average(afterNoSmoke),
    afterSmoke: average(afterSmoke),
    afterNoSmokeN: afterNoSmoke.length,
    afterSmokeN: afterSmoke.length,
  };
}

function goalLineFor(entries: Entries, goal: Goal | null, start: string): GoalLine | null {
  if (!goal) return null;
  let done = 0;
  for (let i = 0; i < 7; i++) {
    if (entries[addDays(start, i)]?.goalDone === true) done++;
  }
  let lastWeekDone: number | null = null;
  let lastWeekLogged = 0;
  for (let i = 1; i <= 7; i++) {
    const e = entries[addDays(start, -i)];
    if (e) lastWeekLogged++;
    if (e?.goalDone === true) lastWeekDone = (lastWeekDone ?? 0) + 1;
  }
  // Only claim last week when there's a real week of entries to compare with.
  // A logged week with no ticks is zero, not silence: "last week you did it not
  // once" is the direction, and it is the one line the goal is for.
  lastWeekDone = lastWeekLogged < 3 ? null : (lastWeekDone ?? 0);
  const direction: GoalLine["direction"] =
    lastWeekDone === null ? "first" : done > lastWeekDone ? "up" : done < lastWeekDone ? "down" : "same";
  return { text: goal.text, done, target: goal.target, lastWeekDone, direction };
}

export function weekStats(entries: Entries, goal: Goal | null, end = todayISO()): WeekStats {
  const cells = cellsFor(entries, end);
  const loggedCells = cells.filter((c) => c.smoked !== null);
  const smoked = cells.filter((c) => c.smoked === true).length;
  const logged = loggedCells.length;
  const { top, count } = countTriggers(cells);
  const mood = moodAfter(entries, end);
  const goalLine = goalLineFor(entries, goal, addDays(end, -6));

  const weekdaySmokes = cells.filter((c) => c.smoked === true && !isWeekend(c.day)).length;
  const weekendSmokes = cells.filter((c) => c.smoked === true && isWeekend(c.day)).length;

  const sentences: string[] = [];
  let observation: string | null = null;

  if (logged === 0) {
    sentences.push("nothing logged this week. the mirror is still here on sunday.");
  } else {
    if (smoked === 0) {
      sentences.push(
        logged === 7
          ? "no smoke logged on any of the seven nights this week."
          : `no smoke logged on the ${numberWord(logged)} nights you logged this week.`
      );
    } else if (logged < 7) {
      sentences.push(
        `you logged ${numberWord(logged)} of the seven nights, and smoked on ${numberWord(smoked)} of them.`
      );
    } else {
      sentences.push(`you smoked on ${numberWord(smoked)} of the seven nights this week.`);
    }

    if (top && count >= 2) {
      sentences.push(`you tapped “${TRIGGER_LABEL[top]}” on ${numberWord(count)} of them.`);
    }

    // The mood comparison is the only correlation claim the card makes. Under
    // MIN_MOOD_SAMPLES on either side, one or two data points can swing the
    // average by a whole mood level, and the mirror must not whisper a trend
    // it cannot support. Stay silent until both groups clear the floor.
    if (
      mood.afterNoSmoke !== null &&
      mood.afterSmoke !== null &&
      mood.afterNoSmokeN >= MIN_MOOD_SAMPLES &&
      mood.afterSmokeN >= MIN_MOOD_SAMPLES
    ) {
      const diff = mood.afterNoSmoke - mood.afterSmoke;
      if (Math.abs(diff) < 0.35) {
        sentences.push("the mood you logged the day after didn't move much either way.");
      } else {
        sentences.push(
          `the mood you logged the day after a no-smoke night was ${diff > 0 ? "a little higher" : "a little lower"}.`
        );
      }
    }

    if (smoked >= 3 && weekendSmokes === smoked) {
      observation = "all of this week's smokes were at the weekend.";
    } else if (smoked >= 3 && weekdaySmokes === smoked) {
      observation = "all of this week's smokes were on weekdays.";
    }
  }

  return {
    start: addDays(end, -6),
    end,
    cells,
    logged,
    smoked,
    notSmoked: logged - smoked,
    topTrigger: top,
    topTriggerCount: count,
    weekdaySmokes,
    weekendSmokes,
    moodAfterNoSmoke: mood.afterNoSmoke,
    moodAfterSmoke: mood.afterSmoke,
    sentences,
    observation,
    goalLine,
  };
}

export function goalSentence(line: GoalLine): string {
  const times = (n: number) =>
    n === 1 ? "once" : n === 0 ? "not once" : n === 2 ? "twice" : `${numberWord(n)} times`;
  const target = line.target === 1 ? "once" : line.target === 2 ? "twice" : `${numberWord(line.target)} times`;
  let s = `you wanted to ${line.text} ${target} this week. you did it ${times(line.done)}.`;
  if (line.lastWeekDone !== null && line.lastWeekDone !== line.done) {
    s += ` last week you did it ${times(line.lastWeekDone)}.`;
  }
  if (line.direction === "up") s += " that's a direction.";
  return s;
}

/** The weeks that have something in them, newest first. Used by the shelf. */
export function recentWeeks(entries: Entries, goal: Goal | null, count = 12, end = todayISO()): WeekStats[] {
  const out: WeekStats[] = [];
  for (let w = 0; w < count; w++) {
    const weekEnd = addDays(end, -7 * w);
    const stats = weekStats(entries, goal, weekEnd);
    if (stats.logged > 0) out.push(stats);
  }
  return out;
}

/**
 * The only text Fix is allowed to be grounded in. Built from entries, sent to
 * the server, and quoted back by the model. Deliberately factual: no
 * interpretation, no causes.
 */
export function buildFixContext(stats: WeekStats, entries: Entries, goal: Goal | null, maxChars = 2400): string {
  const lines: string[] = [];
  lines.push("THEIR OWN LOG, LAST SEVEN DAYS (newest last):");
  for (const c of stats.cells) {
    if (c.smoked === null) {
      lines.push(`${c.initial} ${c.day}: no entry`);
      continue;
    }
    const e: Entry | undefined = entries[c.day];
    const bits = [c.smoked ? "smoked" : "didn't smoke", `mood ${c.mood}/5`];
    if (c.triggers.length) bits.push(`triggers: ${c.triggers.map((t) => TRIGGER_LABEL[t]).join(", ")}`);
    if (e?.goalDone === true) bits.push("did their thing");
    lines.push(`${c.initial} ${c.day}: ${bits.join(" · ")}`);
    if (e?.note) lines.push(`  in their words: "${e.note.slice(0, 160)}"`);
  }
  lines.push("");
  lines.push(
    `SUMMARY: logged ${stats.logged} of 7 nights; smoked ${stats.smoked}.` +
      (stats.topTrigger && stats.topTriggerCount >= 2
        ? ` Most common trigger: ${TRIGGER_LABEL[stats.topTrigger]} (${stats.topTriggerCount}).`
        : "") +
      (stats.moodAfterNoSmoke !== null && stats.moodAfterSmoke !== null
        ? ` Average mood the day after a no-smoke night: ${stats.moodAfterNoSmoke.toFixed(1)}/5; after a smoke: ${stats.moodAfterSmoke.toFixed(1)}/5.`
        : "")
  );
  if (goal) {
    const g = stats.goalLine;
    lines.push(
      `GOAL: ${goal.text}, ${goal.target} times a week.` +
        (g ? ` Done this week: ${g.done}.` : "") +
        (g?.lastWeekDone !== null && g?.lastWeekDone !== undefined ? ` Last week: ${g.lastWeekDone}.` : "")
    );
  }
  const text = lines.join("\n");
  return text.length > maxChars ? `${text.slice(0, maxChars)}\n[log truncated]` : text;
}

/** Used by the landing page mock and the archive. Never claims more than the data. */
export function weekdayName(day: string): string {
  return dayFromISO(day).toLocaleDateString("en-GB", { weekday: "long" });
}
