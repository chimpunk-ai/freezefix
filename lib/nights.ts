"use client";

// Per-night detail that sits on top of the yes/no check-in: one mood face and up to
// three trigger chips.
//
// Brief, section 4: the nightly ritual is three taps — did you smoke, how did you feel,
// what was going on — and it must still take seconds. This lives in its own store
// (ff_nights) rather than being folded into ff_checkins so the existing check-in shape
// never changes and a device with history needs no migration.
//
// Everything here is optional by design. A night with only a yes/no answer is a
// complete night; the mirror simply has less to say. Nothing is uploaded.

const KEY = "ff_nights";

export type Mood = 1 | 2 | 3 | 4 | 5;

export type NightMeta = {
  mood?: Mood;
  /** Trigger ids from NIGHT_TRIGGERS, at most MAX_TRIGGERS. */
  triggers?: string[];
};

/** Map from ISO date (YYYY-MM-DD, local day) → that night's detail. */
export type NightLog = Record<string, NightMeta>;

export const MAX_TRIGGERS = 3;

/** The brief's chips. `none` is "nothing really" — an honest way out of the row, never
 *  counted as a pattern. */
export const NIGHT_TRIGGERS = [
  { id: "after-work", label: "After work" },
  { id: "boredom", label: "Bored" },
  { id: "social", label: "With friends" },
  { id: "sleep", label: "Couldn't sleep" },
  { id: "after-her", label: "After her" },
  { id: "none", label: "Nothing really" },
] as const;

export const MOOD_LABELS: Record<Mood, string> = {
  1: "Rough",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

export const MOODS: Mood[] = [1, 2, 3, 4, 5];

function read(): NightLog {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const o = JSON.parse(raw);
    return o && typeof o === "object" ? (o as NightLog) : {};
  } catch {
    return {};
  }
}

function write(log: NightLog) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(log));
  } catch {
    /* storage can be blocked; the app still works, just forgets. */
  }
}

function isoDay(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getNight(day: string): NightMeta {
  return read()[day] ?? {};
}

/** Set (or clear, with `undefined`) the mood face for a day. */
export function setMood(mood: Mood | undefined, now = new Date()): NightLog {
  const log = read();
  const day = isoDay(now);
  const cur = log[day] ?? {};
  if (mood === undefined) {
    const { mood: _drop, ...rest } = cur;
    log[day] = rest;
  } else {
    log[day] = { ...cur, mood };
  }
  write(log);
  return log;
}

/**
 * Toggle a trigger chip for today. Enforces two rules the UI relies on:
 *   • at most MAX_TRIGGERS at once — tapping a fourth replaces nothing, it is refused
 *   • "none" is exclusive: choosing it clears the others, choosing another clears it
 * Returns the updated log so the caller can re-render without re-reading storage.
 */
export function toggleTrigger(id: string, now = new Date()): NightLog {
  const log = read();
  const day = isoDay(now);
  const cur = log[day] ?? {};
  const list = cur.triggers ?? [];
  let next: string[];

  if (list.includes(id)) {
    next = list.filter((t) => t !== id);
  } else if (id === "none") {
    next = ["none"];
  } else {
    const withoutNone = list.filter((t) => t !== "none");
    if (withoutNone.length >= MAX_TRIGGERS) return log;
    next = [...withoutNone, id];
  }

  log[day] = { ...cur, triggers: next };
  write(log);
  return log;
}

/** Clear today's mood and triggers (used when the check-in is changed or reset). */
export function clearNight(now = new Date()): NightLog {
  const log = read();
  delete log[isoDay(now)];
  write(log);
  return log;
}

export function labelFor(id: string): string {
  return NIGHT_TRIGGERS.find((t) => t.id === id)?.label ?? id;
}

/** Trigger counts across the given days, most frequent first. "none" never counts. */
export function triggerCounts(days: string[]): [string, number][] {
  const log = read();
  const counts = new Map<string, number>();
  for (const day of days) {
    for (const t of log[day]?.triggers ?? []) {
      if (t === "none") continue;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

/** Mean mood over the given days, and how many of them actually had one. */
export function moodAverage(days: string[]): { avg: number; n: number } {
  const log = read();
  let sum = 0;
  let n = 0;
  for (const day of days) {
    const m = log[day]?.mood;
    if (typeof m === "number") {
      sum += m;
      n += 1;
    }
  }
  return { avg: n ? sum / n : 0, n };
}
