// Pattern engine — the arithmetic behind the weekly mirror.
//
// Pure on purpose: no storage, no clock, no network, no React. Callers hand in
// what is already on the device, so every number the card shows can be
// reproduced in a test (scripts/test-patterns.ts).
//
// The rules of the house, from the product brief:
//   • never compare two sides of a question on fewer than MIN_SIDE nights each
//     (a two-night average is a coincidence wearing a suit);
//   • never name a cause, only a shape — "only you know" is the posture;
//   • never grade, never count streaks, never use the vocabulary of recovery.
//
// Everything here is descriptive. If a pattern cannot be supported by the taps
// that exist, it is not returned at all.

export type Mood = 1 | 2 | 3 | 4 | 5;

export type NightInput = { mood?: number; triggers?: string[] };
export type Nights = Record<string, NightInput>;
export type Checkins = Record<string, "yes" | "no">;

/** One night the engine is allowed to talk about. */
export type Day = {
  day: string; // YYYY-MM-DD, local
  dow: number; // 0 = Monday … 6 = Sunday
  smoked: boolean | null;
  mood: Mood | null;
  triggers: string[];
};

export type Week = {
  key: string; // ISO date of the Monday
  start: string;
  end: string;
  days: Day[];
  smoked: number;
  recorded: number;
  moodAvg: number | null;
  moodN: number;
};

/** Nights needed on each side before the mirror will compare two averages. */
export const MIN_SIDE = 3;
/** Nights needed before the engine will describe a weekday shape. */
export const MIN_RHYTHM = 4;
/** Mood difference under this reads as "no clear line", not as an effect. */
export const NEUTRAL_DIFF = 0.4;

/** Words the mirror's own copy may never use, whatever the numbers say. */
export const BANNED_IN_COPY = [
  "should",
  "problem",
  "clean",
  "relapse",
  "streak",
  "addict",
  "addiction",
  "quit",
  "disorder",
] as const;

export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const DAY_MS = 86_400_000;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function isoLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function atNoon(day: string): Date {
  return new Date(`${day}T12:00:00`);
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d.getTime());
  out.setDate(out.getDate() + n);
  return out;
}

/** Monday of the week that contains `now`. */
export function mondayOf(now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export function daysBetween(a: string, b: string): number {
  return Math.round((atNoon(b).getTime() - atNoon(a).getTime()) / DAY_MS);
}

/** "after-work" → "After work". Keeps labels readable whatever the chip ids are. */
export function prettyLabel(id: string): string {
  const s = id.replace(/[-_]+/g, " ").trim();
  if (!s) return "Something else";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function asMood(v: unknown): Mood | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  const n = Math.round(v);
  if (n < 1 || n > 5) return null;
  return n as Mood;
}

function asTriggers(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((t): t is string => typeof t === "string" && t.length > 0 && t !== "none");
}

function dayAt(checkins: Checkins, nights: Nights, date: Date, dow: number): Day {
  const key = isoLocal(date);
  const answer = checkins[key];
  const meta = nights[key] ?? {};
  return {
    day: key,
    dow,
    smoked: answer === "yes" ? true : answer === "no" ? false : null,
    mood: asMood(meta.mood),
    triggers: asTriggers(meta.triggers),
  };
}

function average(days: Day[]): { avg: number; n: number } {
  const moods = days.map((d) => d.mood).filter((m): m is Mood => m !== null);
  if (!moods.length) return { avg: 0, n: 0 };
  return { avg: moods.reduce((a, b) => a + b, 0) / moods.length, n: moods.length };
}

/** One Monday-to-Sunday week ending on the week that contains `anchor`. */
export function buildWeek(checkins: Checkins, nights: Nights, anchor: Date): Week {
  const start = mondayOf(anchor);
  const days: Day[] = [];
  for (let i = 0; i < 7; i += 1) days.push(dayAt(checkins, nights, addDays(start, i), i));
  const smoked = days.filter((d) => d.smoked === true).length;
  const recorded = days.filter((d) => d.smoked !== null).length;
  const moods = days.map((d) => d.mood).filter((m): m is Mood => m !== null);
  const moodAvg = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : null;
  return {
    key: isoLocal(start),
    start: isoLocal(start),
    end: isoLocal(addDays(start, 6)),
    days,
    smoked,
    recorded,
    moodAvg,
    moodN: moods.length,
  };
}

/** `count` weeks ending with the week containing `anchor`, oldest first. */
export function buildWeeks(
  checkins: Checkins,
  nights: Nights,
  anchor: Date,
  count = 4,
): Week[] {
  const out: Week[] = [];
  const thisMonday = mondayOf(anchor);
  for (let i = count - 1; i >= 0; i -= 1) {
    out.push(buildWeek(checkins, nights, addDays(thisMonday, -7 * i)));
  }
  return out;
}

export function flatten(weeks: Week[]): Day[] {
  const out: Day[] = [];
  for (const w of weeks) for (const d of w.days) out.push(d);
  return out;
}

/* ── comparisons ─────────────────────────────────────────────────────────── */

export type Compare = {
  ready: boolean;
  aAvg: number; // first side (smoked, or "with the chip")
  bAvg: number; // second side
  aN: number;
  bN: number;
  /** bAvg - aAvg. Positive means the second side sat higher. */
  diff: number;
};

function compare(a: Day[], b: Day[]): Compare {
  const x = average(a);
  const y = average(b);
  const ready = x.n >= MIN_SIDE && y.n >= MIN_SIDE;
  return {
    ready,
    aAvg: x.avg,
    bAvg: y.avg,
    aN: x.n,
    bN: y.n,
    diff: ready ? y.avg - x.avg : 0,
  };
}

/** Mood on nights the user smoked, against mood on nights they didn't. */
export function moodBySmoke(days: Day[]): Compare {
  return compare(
    days.filter((d) => d.smoked === true),
    days.filter((d) => d.smoked === false),
  );
}

/**
 * The morning after: mood on the day following a smoke night, against the day
 * following a night without. This is the one pattern people describe to
 * themselves long before they can see it.
 */
export function moodTheNextDay(days: Day[]): Compare {
  const byDay = new Map<string, Day>();
  for (const d of days) byDay.set(d.day, d);
  const afterSmoke: Day[] = [];
  const afterClear: Day[] = [];
  for (const d of days) {
    const next = byDay.get(isoLocal(addDays(atNoon(d.day), 1)));
    if (!next || next.mood === null) continue;
    if (d.smoked === true) afterSmoke.push(next);
    if (d.smoked === false) afterClear.push(next);
  }
  return compare(afterSmoke, afterClear);
}

export type TriggerImpact = {
  id: string;
  label: string;
  count: number; // nights the chip was tapped at all
  withAvg: number;
  withN: number;
  withoutAvg: number;
  withoutN: number;
  diff: number; // withAvg - withoutAvg
};

/**
 * Which chips travel with a lower mood, and which don't. Gated: a chip needs
 * MIN_SIDE nights with it and MIN_SIDE nights without it before it appears.
 */
export function triggerImpact(days: Day[]): TriggerImpact[] {
  const withMood = days.filter((d) => d.mood !== null);
  const ids = new Set<string>();
  for (const d of days) for (const t of d.triggers) ids.add(t);

  const out: TriggerImpact[] = [];
  for (const id of ids) {
    const withT = withMood.filter((d) => d.triggers.includes(id));
    const withoutT = withMood.filter((d) => !d.triggers.includes(id));
    if (withT.length < MIN_SIDE || withoutT.length < MIN_SIDE) continue;
    const a = average(withT);
    const b = average(withoutT);
    out.push({
      id,
      label: prettyLabel(id),
      count: days.filter((d) => d.triggers.includes(id)).length,
      withAvg: a.avg,
      withN: a.n,
      withoutAvg: b.avg,
      withoutN: b.n,
      diff: a.avg - b.avg,
    });
  }
  return out.sort((x, y) => Math.abs(y.diff) - Math.abs(x.diff));
}

export type Rhythm = {
  ready: boolean;
  counts: number[]; // smoked nights per weekday, Monday first
  recorded: number[]; // logged nights per weekday
  top: number | null;
  weeks: number;
};

/** Which weekdays carry the smoke, across the weeks in hand. */
export function weekdayRhythm(weeks: Week[]): Rhythm {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const recorded = [0, 0, 0, 0, 0, 0, 0];
  for (const w of weeks) {
    for (const d of w.days) {
      if (d.smoked === true) counts[d.dow] = (counts[d.dow] ?? 0) + 1;
      if (d.smoked !== null) recorded[d.dow] = (recorded[d.dow] ?? 0) + 1;
    }
  }
  const total = counts.reduce((a, b) => a + b, 0);
  const activeWeeks = weeks.filter((w) => w.recorded > 0).length;
  const ready = total >= MIN_RHYTHM && activeWeeks >= 2;

  let top: number | null = null;
  if (ready) {
    let best = -1;
    for (let i = 0; i < counts.length; i += 1) {
      const c = counts[i] ?? 0;
      if (c > best) {
        best = c;
        top = i;
      }
    }
  }
  return { ready, counts, recorded, top, weeks: activeWeeks };
}

export type Momentum = {
  ready: boolean;
  current: number;
  currentRecorded: number;
  previous: number;
  previousRecorded: number;
  /** previous - current. Positive means fewer smoke nights than last week. */
  delta: number;
};

export function momentum(weeks: Week[]): Momentum {
  const empty: Momentum = {
    ready: false,
    current: 0,
    currentRecorded: 0,
    previous: 0,
    previousRecorded: 0,
    delta: 0,
  };
  if (weeks.length < 2) return empty;
  const cur = weeks[weeks.length - 1];
  const prev = weeks[weeks.length - 2];
  if (!cur || !prev) return empty;
  const ready = cur.recorded >= MIN_SIDE && prev.recorded >= MIN_SIDE;
  return {
    ready,
    current: cur.smoked,
    currentRecorded: cur.recorded,
    previous: prev.smoked,
    previousRecorded: prev.recorded,
    delta: ready ? prev.smoked - cur.smoked : 0,
  };
}

export type SeriesPoint = {
  key: string;
  label: string;
  smoked: number;
  recorded: number;
  moodAvg: number | null;
};

/** Four tidy points for the trend line, oldest first, last one labelled "this week". */
export function series(weeks: Week[]): SeriesPoint[] {
  const n = weeks.length;
  return weeks.map((w, i) => ({
    key: w.key,
    label: i === n - 1 ? "this week" : `${n - 1 - i}w ago`,
    smoked: w.smoked,
    recorded: w.recorded,
    moodAvg: w.moodAvg,
  }));
}

/* ── the patterns the card shows ─────────────────────────────────────────── */

export type PatternId =
  | "mood_by_smoke"
  | "mood_next_day"
  | "trigger"
  | "weekday"
  | "momentum";

export type ChartKind = "compare" | "trigger" | "weekday" | "series" | "none";

export type Pattern = {
  id: PatternId;
  chart: ChartKind;
  tone: "neutral" | "up" | "down";
  /** One plain sentence. No grade, no cause. */
  headline: string;
  /** The honest caveat, always: what the number is and what it is not. */
  detail: string;
  compare?: {
    aLabel: string;
    aValue: number;
    aN: number;
    bLabel: string;
    bValue: number;
    bN: number;
  };
  trigger?: { label: string; count: number; withAvg: number; withoutAvg: number };
  weekday?: { counts: number[] };
  series?: SeriesPoint[];
};

function one(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1);
}

function toneFor(diff: number): "neutral" | "up" | "down" {
  if (Math.abs(diff) < NEUTRAL_DIFF) return "neutral";
  return diff > 0 ? "up" : "down";
}

/**
 * Build the pattern list for the card. Order matters: the mood comparison is
 * the one people feel first, the weekday shape is the one they least expect.
 * Returns [] rather than inventing something when the week is thin.
 */
export function buildPatterns(weeks: Week[]): Pattern[] {
  const out: Pattern[] = [];
  if (!weeks.length) return out;

  const days = flatten(weeks);
  const recorded = days.filter((d) => d.smoked !== null).length;
  if (recorded < MIN_SIDE) return out;

  const mood = moodBySmoke(days);
  if (mood.ready) {
    const near = Math.abs(mood.diff) < NEUTRAL_DIFF;
    out.push({
      id: "mood_by_smoke",
      chart: "compare",
      tone: toneFor(mood.diff),
      headline: near
        ? `Your mood face averaged ${one(mood.aAvg)} on the nights you smoked and ${one(mood.bAvg)} on the others. Close enough that there is no tidy line to draw.`
        : mood.diff > 0
          ? `On the nights you didn't smoke your mood face averaged ${one(mood.bAvg)} of 5. On the nights you did, ${one(mood.aAvg)}.`
          : `On the nights you smoked your mood face averaged ${one(mood.aAvg)} of 5, against ${one(mood.bAvg)} on the nights you didn't.`,
      detail: `${mood.aN} smoke nights and ${mood.bN} others where you picked a face. Averages of your own taps — a shape, not a cause.`,
      compare: {
        aLabel: "smoked",
        aValue: mood.aAvg,
        aN: mood.aN,
        bLabel: "didn't",
        bValue: mood.bAvg,
        bN: mood.bN,
      },
    });
  }

  const next = moodTheNextDay(days);
  if (next.ready && Math.abs(next.diff) >= NEUTRAL_DIFF) {
    out.push({
      id: "mood_next_day",
      chart: "compare",
      tone: toneFor(next.diff),
      headline:
        next.diff > 0
          ? `The morning after a night you didn't smoke averaged ${one(next.bAvg)}. The morning after a night you did, ${one(next.aAvg)}.`
          : `The morning after a smoke night averaged ${one(next.aAvg)}. The morning after a night off, ${one(next.bAvg)} — not the story you'd expect.`,
      detail: `Counted across ${next.aN} and ${next.bN} mornings. Sleep, work, people, weather all sit inside that number too.`,
      compare: {
        aLabel: "after smoking",
        aValue: next.aAvg,
        aN: next.aN,
        bLabel: "after not",
        bValue: next.bAvg,
        bN: next.bN,
      },
    });
  }

  const triggers = triggerImpact(days);
  const lead = triggers[0];
  if (lead && Math.abs(lead.diff) >= NEUTRAL_DIFF) {
    out.push({
      id: "trigger",
      chart: "trigger",
      tone: toneFor(lead.diff),
      headline:
        lead.diff < 0
          ? `"${lead.label}" came up on ${lead.count} nights. Your mood on those nights averaged ${one(lead.withAvg)}, against ${one(lead.withoutAvg)} when it didn't.`
          : `"${lead.label}" came up on ${lead.count} nights, and your mood on those nights averaged ${one(lead.withAvg)} — higher than the ${one(lead.withoutAvg)} on the nights it didn't.`,
      detail: `Your own chips, counted. The chip and the mood arrived together; nothing here says one caused the other.`,
      trigger: {
        label: lead.label,
        count: lead.count,
        withAvg: lead.withAvg,
        withoutAvg: lead.withoutAvg,
      },
    });
  }

  const rhythm = weekdayRhythm(weeks);
  if (rhythm.ready && rhythm.top !== null) {
    const topName = DAY_NAMES[rhythm.top] ?? "one day";
    const topCount = rhythm.counts[rhythm.top] ?? 0;
    out.push({
      id: "weekday",
      chart: "weekday",
      tone: "neutral",
      headline: `Most of your smoke nights landed on a ${topName} — ${topCount} of them across ${rhythm.weeks} weeks.`,
      detail: `Weekdays, not verdicts. A pattern that repeats on a Tuesday is often about what a Tuesday is, not about you.`,
      weekday: { counts: rhythm.counts },
    });
  }

  const mom = momentum(weeks);
  if (mom.ready) {
    const direction =
      mom.delta === 0
        ? "the same number as the week before"
        : mom.delta > 0
          ? `${mom.delta} fewer than the week before`
          : `${Math.abs(mom.delta)} more than the week before`;
    out.push({
      id: "momentum",
      chart: "series",
      tone: mom.delta > 0 ? "up" : mom.delta < 0 ? "down" : "neutral",
      headline: `You smoked on ${mom.current} of ${mom.currentRecorded} logged nights. That is ${direction}.`,
      detail: `Last week it was ${mom.previous} of ${mom.previousRecorded}. Direction, not a score.`,
      series: series(weeks),
    });
  }

  return out;
}

/** Safety net for the copy: the test asserts this stays empty for every pattern. */
export function bannedWordsIn(text: string): string[] {
  const lower = ` ${text.toLowerCase()} `;
  return BANNED_IN_COPY.filter((w) => lower.includes(` ${w}`) || lower.includes(`${w} `));
}
