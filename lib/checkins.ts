"use client";

/**
 * Private, device-local daily log. Legacy values (`"yes" | "no"`) are read and
 * normalized in place so existing check-ins survive this schema extension.
 * Nothing in this module makes a network request.
 */
const KEY = "ff_checkins";

export type Answer = "yes" | "no";
export type Mood = 1 | 2 | 3 | 4 | 5;
export const TRIGGER_IDS = ["after-work", "bored", "friends", "sleep", "after-person", "alone", "other"] as const;
export type TriggerId = (typeof TRIGGER_IDS)[number];

export type DailyEntry = {
  answer: Answer;
  mood?: Mood;
  triggers: TriggerId[];
  /** Optional local transcript; raw microphone audio is never stored here. */
  voiceText?: string;
  /** Optional answer to the user's own weekly-goal check-in. */
  goalDone?: boolean;
  savedAt?: number;
};
export type DailyLog = Record<string, DailyEntry>;
export type AnswerLog = Record<string, Answer>;

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const VALID_TRIGGERS = new Set<string>(TRIGGER_IDS);

function isAnswer(value: unknown): value is Answer {
  return value === "yes" || value === "no";
}

function isMood(value: unknown): value is Mood {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5;
}

function normalizeEntry(value: unknown): DailyEntry | undefined {
  // Previous versions stored the answer directly as a string.
  if (isAnswer(value)) return { answer: value, triggers: [] };
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const row = value as Record<string, unknown>;
  if (!isAnswer(row.answer)) return undefined;
  const triggers = Array.isArray(row.triggers)
    ? [...new Set(row.triggers.filter((x): x is TriggerId => typeof x === "string" && VALID_TRIGGERS.has(x)))].slice(0, 3)
    : [];
  const entry: DailyEntry = { answer: row.answer, triggers };
  if (isMood(row.mood)) entry.mood = row.mood;
  if (typeof row.voiceText === "string" && row.voiceText.trim()) entry.voiceText = row.voiceText.trim().slice(0, 500);
  if (typeof row.goalDone === "boolean") entry.goalDone = row.goalDone;
  if (typeof row.savedAt === "number" && Number.isFinite(row.savedAt)) entry.savedAt = row.savedAt;
  return entry;
}

/** Pure parser exported for regression tests and safe local-storage migration. */
export function normalizeLog(value: unknown): DailyLog {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: DailyLog = {};
  for (const [day, row] of Object.entries(value as Record<string, unknown>)) {
    if (!ISO_DAY.test(day)) continue;
    const normalized = normalizeEntry(row);
    if (normalized) out[day] = normalized;
  }
  return out;
}

function read(): DailyLog {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? normalizeLog(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function write(log: DailyLog) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(log));
  } catch {
    // Storage can be blocked or full; the log remains usable for this visit.
  }
}

/** Local-timezone date key (YYYY-MM-DD). */
export function todayISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDay(day: string): DailyEntry | undefined {
  return read()[day];
}

export function getAnswer(day: string): Answer | undefined {
  return getDay(day)?.answer;
}

/** Save a full daily entry for a YYYY-MM-DD local date. */
export function saveDay(day: string, input: DailyEntry): DailyLog {
  if (!ISO_DAY.test(day) || !isAnswer(input.answer)) return read();
  const log = read();
  log[day] = normalizeEntry(input) ?? { answer: input.answer, triggers: [] };
  write(log);
  return log;
}

export function saveToday(input: DailyEntry, now = new Date()): DailyLog {
  return saveDay(todayISO(now), { ...input, savedAt: input.savedAt ?? now.getTime() });
}

/** Compatibility helper for surfaces which only ask the old yes/no question. */
export function setToday(answer: Answer, now = new Date()): AnswerLog {
  const day = todayISO(now);
  const previous = getDay(day);
  saveToday({ ...previous, answer, triggers: previous?.triggers ?? [] }, now);
  return answerOnly(read());
}

/** Clear one day (used by Settings). */
export function clearDay(day: string): DailyLog {
  const log = read();
  delete log[day];
  write(log);
  return log;
}

export function clearToday(now = new Date()): AnswerLog {
  clearDay(todayISO(now));
  return answerOnly(read());
}

export function clearAll(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Ignore unavailable storage.
  }
}

function answerOnly(log: DailyLog): AnswerLog {
  return Object.fromEntries(Object.entries(log).map(([day, entry]) => [day, entry.answer]));
}

export type DayShape = {
  /** YYYY-MM-DD local date. */
  day: string;
  /** Weekday initial. */
  initial: string;
  answer: Answer | undefined;
  mood?: Mood;
  triggers: TriggerId[];
  voiceText?: string;
  goalDone?: boolean;
};

const WEEKDAY_INITIAL = ["S", "M", "T", "W", "T", "F", "S"];

function shapeFor(day: Date, log: DailyLog): DayShape {
  const key = todayISO(day);
  const entry = log[key];
  return {
    day: key,
    initial: WEEKDAY_INITIAL[day.getDay()],
    answer: entry?.answer,
    mood: entry?.mood,
    triggers: entry?.triggers ?? [],
    voiceText: entry?.voiceText,
    goalDone: entry?.goalDone,
  };
}

/** The last N days ending today, oldest first. */
export function lastNDays(count: number, now = new Date()): DayShape[] {
  const log = read();
  const out: DayShape[] = [];
  const n = Math.max(0, Math.min(366, Math.floor(count)));
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - i);
    out.push(shapeFor(date, log));
  }
  return out;
}

export function last7Days(now = new Date()): DayShape[] {
  return lastNDays(7, now);
}

export function last14Days(now = new Date()): DayShape[] {
  return lastNDays(14, now);
}

/** Local Monday for the week containing `now`. */
export function weekStartISO(now = new Date()): string {
  const date = new Date(now);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return todayISO(date);
}

/** Monday through Sunday for a YYYY-MM-DD Monday key, oldest first. */
export function weekDays(startISO: string): DayShape[] {
  if (!ISO_DAY.test(startISO)) return [];
  const [year, month, day] = startISO.split("-").map(Number);
  const monday = new Date(year, month - 1, day, 12);
  if (Number.isNaN(monday.getTime()) || monday.getDay() !== 1) return [];
  const log = read();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return shapeFor(date, log);
  });
}

/** Monday through Sunday of the current local week. Future days are empty. */
export function currentWeekDays(now = new Date()): DayShape[] {
  return weekDays(weekStartISO(now));
}

export type Shape = {
  withoutUse: number;
  useDays: number;
  recorded: number;
  /** Positive = fewer use days than last week; null when either week is sparse. */
  deltaVsLastWeek: number | null;
};

export function last7Summary(now = new Date()): Shape {
  const days = last7Days(now);
  const yes = days.filter((d) => d.answer === "yes").length;
  const no = days.filter((d) => d.answer === "no").length;
  const log = read();
  let lastWeekUse = 0;
  let lastWeekRecorded = 0;
  for (let i = 13; i >= 7; i--) {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const answer = log[todayISO(d)]?.answer;
    if (answer === "yes") lastWeekUse += 1;
    if (answer === "yes" || answer === "no") lastWeekRecorded += 1;
  }
  const delta = yes + no >= 3 && lastWeekRecorded >= 3 ? lastWeekUse - yes : null;
  return { withoutUse: no, useDays: yes, recorded: yes + no, deltaVsLastWeek: delta };
}
