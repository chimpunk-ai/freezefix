"use client";

// Daily "did you use cannabis today?" check-in log.
//
// On the device only, like memory and wins. Nothing is uploaded, no server knows.
// Deliberately store yes/no only — the point is a quiet weekly shape, not a diary of
// detail that would feel like surveillance.
//
// All derived views (7-day shape, "N fewer use days than the week before") compute
// from the local object; nothing is cached across sessions. If storage is blocked,
// every function returns a safe empty shape so the UI shows a calm "nothing yet"
// state instead of crashing.

const KEY = "ff_checkins";

export type Answer = "yes" | "no";

/** Map from ISO date (YYYY-MM-DD, local day) → answer. */
export type Log = Record<string, Answer>;

function read(): Log {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const o = JSON.parse(raw);
    return o && typeof o === "object" ? (o as Log) : {};
  } catch {
    return {};
  }
}

function write(log: Log) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(log));
  } catch {
    /* storage can be blocked; the app still works, just forgets. */
  }
}

/** Local-timezone ISO date (YYYY-MM-DD). */
export function todayISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getAnswer(day: string): Answer | undefined {
  return read()[day];
}

/** Save (or overwrite) today's answer. Returns the updated log so the caller can
 *  re-render immediately without re-reading storage. */
export function setToday(answer: Answer, now = new Date()): Log {
  const log = read();
  log[todayISO(now)] = answer;
  write(log);
  return log;
}

/** Clear today's answer (used by the Settings "Reset today" control). */
export function clearToday(now = new Date()): Log {
  const log = read();
  delete log[todayISO(now)];
  write(log);
  return log;
}

export type DayShape = {
  /** YYYY-MM-DD, oldest to newest, exactly 7 entries ending on today. */
  day: string;
  /** The weekday initial, "S","M","T","W","T","F","S". */
  initial: string;
  /** The answer for that day; `undefined` means no check-in that day. */
  answer: Answer | undefined;
};

const WEEKDAY_INITIAL = ["S", "M", "T", "W", "T", "F", "S"];

/** The last 7 days ending today, in order. */
export function last7Days(now = new Date()): DayShape[] {
  const log = read();
  const out: DayShape[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const day = todayISO(d);
    out.push({ day, initial: WEEKDAY_INITIAL[d.getDay()], answer: log[day] });
  }
  return out;
}

export type Shape = {
  withoutUse: number;
  useDays: number;
  recorded: number; // yes + no, out of 7
  /** Positive = fewer use days than last week; negative = more. `null` when there is
   *  not enough last-week data to compare honestly. */
  deltaVsLastWeek: number | null;
};

export function last7Summary(now = new Date()): Shape {
  const days = last7Days(now);
  const yes = days.filter((d) => d.answer === "yes").length;
  const no = days.filter((d) => d.answer === "no").length;

  // Last week = the 7 days before `last7`. We compare only on days that both weeks have
  // a recorded answer; otherwise returning a delta would be making a story up.
  const log = read();
  let lastWeekUse = 0;
  let lastWeekRecorded = 0;
  for (let i = 13; i >= 7; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ans = log[todayISO(d)];
    if (ans === "yes") lastWeekUse += 1;
    if (ans === "yes" || ans === "no") lastWeekRecorded += 1;
  }
  // Need at least 3 recorded days in each window before the delta is honest enough
  // to show.
  const delta = yes + no >= 3 && lastWeekRecorded >= 3 ? lastWeekUse - yes : null;

  return { withoutUse: no, useDays: yes, recorded: yes + no, deltaVsLastWeek: delta };
}
