// The daily log.
//
// One entry per local day: whether they smoked, one mood face, up to three
// triggers, an optional spoken note (transcript only, audio is never kept) and
// an optional goal tick. On the device only. Nothing here is uploaded.
//
// If storage is blocked every read returns an empty shape, so the log still
// opens and just forgets, rather than crashing.

export const TRIGGERS = [
  "after-work",
  "bored",
  "with-friends",
  "couldnt-sleep",
  "after-her",
  "alone",
  "nothing-really",
] as const;

export type TriggerId = (typeof TRIGGERS)[number];

export const TRIGGER_LABEL: Record<TriggerId, string> = {
  "after-work": "after work",
  bored: "bored",
  "with-friends": "with friends",
  "couldnt-sleep": "couldn't sleep",
  "after-her": "after her",
  alone: "alone",
  "nothing-really": "nothing really",
};

export const MAX_TRIGGERS = 3;

export const MOODS = [1, 2, 3, 4, 5] as const;
export type Mood = (typeof MOODS)[number];

export const MOOD_LABEL: Record<Mood, string> = {
  1: "rough",
  2: "low",
  3: "okay",
  4: "good",
  5: "great",
};

export type Entry = {
  /** Local day, YYYY-MM-DD. */
  day: string;
  smoked: boolean;
  mood: Mood;
  triggers: TriggerId[];
  /** Transcript of the optional voice note, or typed words. Never audio. */
  note?: string;
  /** Whether they did their own thing today. Absent = skipped. */
  goalDone?: boolean;
  /** When the entry was saved (ms). */
  at: number;
};

const KEY = "ff_entries";
const NOTE_MAX = 500;

export type Entries = Record<string, Entry>;

export function todayISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dayFromISO(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(day: string, delta: number): string {
  const d = dayFromISO(day);
  d.setDate(d.getDate() + delta);
  return todayISO(d);
}

function cleanTriggers(input: unknown): TriggerId[] {
  if (!Array.isArray(input)) return [];
  const out: TriggerId[] = [];
  for (const t of input) {
    if ((TRIGGERS as readonly string[]).includes(String(t)) && !out.includes(t as TriggerId)) {
      out.push(t as TriggerId);
    }
  }
  return out.slice(0, MAX_TRIGGERS);
}

export function readEntries(): Entries {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Entries;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Entries = {};
    for (const [day, e] of Object.entries(parsed)) {
      if (!e || typeof e !== "object") continue;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
      if (typeof e.smoked !== "boolean") continue;
      const mood = Number(e.mood);
      if (!(MOODS as readonly number[]).includes(mood)) continue;
      out[day] = {
        day,
        smoked: e.smoked,
        mood: mood as Mood,
        triggers: cleanTriggers(e.triggers),
        note: typeof e.note === "string" ? e.note.slice(0, NOTE_MAX) : undefined,
        goalDone: typeof e.goalDone === "boolean" ? e.goalDone : undefined,
        at: Number(e.at) || 0,
      };
    }
    return out;
  } catch {
    return {};
  }
}

export function writeEntries(entries: Entries) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* storage can be blocked; the app still works, just forgets. */
  }
}

export function saveEntry(entry: Omit<Entry, "day" | "at"> & { day?: string; at?: number }): Entries {
  const entries = readEntries();
  const day = entry.day || todayISO();
  entries[day] = {
    day,
    smoked: entry.smoked,
    mood: entry.mood,
    triggers: cleanTriggers(entry.triggers),
    note: entry.note ? entry.note.trim().slice(0, NOTE_MAX) : undefined,
    goalDone: typeof entry.goalDone === "boolean" ? entry.goalDone : undefined,
    at: entry.at ?? Date.now(),
  };
  writeEntries(entries);
  return entries;
}

export function getEntry(day: string): Entry | undefined {
  return readEntries()[day];
}

export function removeEntry(day: string): Entries {
  const entries = readEntries();
  delete entries[day];
  writeEntries(entries);
  return entries;
}

export function clearEntries() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export type DayDot = { day: string; entry: Entry | undefined };

/** The last `n` days ending today, oldest first. */
export function lastDays(n: number, now = new Date()): DayDot[] {
  const entries = readEntries();
  const today = todayISO(now);
  const out: DayDot[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const day = addDays(today, -i);
    out.push({ day, entry: entries[day] });
  }
  return out;
}

export const WEEKDAY_SHORT = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export function weekdayShort(day: string): string {
  return WEEKDAY_SHORT[dayFromISO(day).getDay()];
}

export function isWeekend(day: string): boolean {
  const d = dayFromISO(day).getDay();
  return d === 0 || d === 6;
}

export function prettyDay(day: string): string {
  return dayFromISO(day).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}
