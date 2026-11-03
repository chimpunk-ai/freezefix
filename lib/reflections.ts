"use client";

// Weekly reflection card.
//
// Shipped 3 November 2026 for Europe-audit P2.9. Even a user who never
// starts the Reduction Program should get a quiet weekly nudge to notice
// their own week. The card lives on the Home tab, appears once per ISO
// week, is skippable, and never nags.
//
// Why a separate storage key from the program's own reflections
//   The Reduction Program (lib/program.ts) has its own `reflections` map
//   keyed by the Monday of each program-week. That's scoped to the plan
//   and is wiped when the plan is deleted. This weekly card is a
//   stand-alone surface — users who never opt into a plan still get it,
//   and users who DO have a plan see their program's reflection on the
//   program page and the standalone card on home (not the same question).
//
// Storage
//   localStorage key `ff_weekly_reflections`. Shape:
//     { v: 1, items: { "YYYY-MM-DD": { text?: string; dismissed: boolean; promptIdx: number; savedAt: number } } }
//   Key is the ISO date of the week's Monday, matching program conventions.
//
// Prompt rotation
//   A fixed rotation of 8 prompts cycles weekly, keyed by the ordinal of
//   the week in the year, so the same person sees different prompts
//   week-to-week and no two consecutive weeks ask the same thing.

const KEY = "ff_weekly_reflections";
const VERSION = 1 as const;

export type WeeklyReflectionEntry = {
  /** Saved text, if the user wrote one. Max 400 chars. */
  text?: string;
  /** True if the user tapped "skip this week" without writing anything. */
  dismissed: boolean;
  /** Index into the locale's PROMPTS array that was shown this week. */
  promptIdx: number;
  /** Epoch ms when the state was last changed (saved or dismissed). */
  savedAt: number;
};

type Store = {
  v: typeof VERSION;
  items: Record<string, WeeklyReflectionEntry>;
};

function readStore(): Store {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { v: VERSION, items: {} };
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return { v: VERSION, items: {} };
    const s = o as Partial<Store> & Record<string, unknown>;
    if (s.v !== VERSION || !s.items || typeof s.items !== "object") {
      return { v: VERSION, items: {} };
    }
    return { v: VERSION, items: s.items as Record<string, WeeklyReflectionEntry> };
  } catch {
    return { v: VERSION, items: {} };
  }
}

function writeStore(s: Store) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage blocked — the UI still works, just forgets */
  }
}

// ─────────────────────────── Date helpers ───────────────────────────

/** YYYY-MM-DD in local time. */
export function todayISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** The Monday of the week containing `now`, local time. */
export function mondayOf(now = new Date()): string {
  const d = new Date(now);
  const dow = (d.getDay() + 6) % 7; // Mon = 0
  d.setDate(d.getDate() - dow);
  return todayISO(d);
}

/** A monotonically-increasing integer that identifies the current week.
 *  Keyed off the Monday of this week (local time) so it is STABLE across
 *  every day/hour of the same week and increments by 7 each week — which
 *  is exactly what the prompt rotation needs. Does not need to match ISO
 *  8601 week numbering. */
export function weekOrdinal(now = new Date()): number {
  // Build a Date at local midnight on this week's Monday, then divide by
  // 86,400,000 to get days-since-epoch. Any time during the same local
  // Monday → Sunday range maps to the same number.
  const [y, m, d] = mondayOf(now).split("-").map(Number);
  const monday = new Date(y, m - 1, d);
  return Math.floor(monday.getTime() / 86_400_000);
}

// ─────────────────────────── Reads ────────────────────────────

/** The entry for this week, if any. */
export function getThisWeek(now = new Date()): WeeklyReflectionEntry | undefined {
  return readStore().items[mondayOf(now)];
}

/** The 1-based position in the prompt rotation to show this week.
 *  Caller provides the number of prompts available for the active locale. */
export function pickPromptIdx(promptCount: number, now = new Date()): number {
  if (promptCount <= 0) return 0;
  return weekOrdinal(now) % promptCount;
}

/** Whether the card should render on home this week. False once the user
 *  has either saved a reflection or explicitly dismissed. */
export function shouldShowCard(now = new Date()): boolean {
  const e = getThisWeek(now);
  if (!e) return true;
  return !e.dismissed && !e.text;
}

// ─────────────────────────── Writes ───────────────────────────

export function saveReflection(text: string, promptIdx: number, now = new Date()): void {
  const monday = mondayOf(now);
  const s = readStore();
  s.items[monday] = {
    text: text.trim().slice(0, 400) || undefined,
    dismissed: false,
    promptIdx,
    savedAt: now.getTime(),
  };
  writeStore(s);
}

export function dismissThisWeek(promptIdx: number, now = new Date()): void {
  const monday = mondayOf(now);
  const s = readStore();
  s.items[monday] = {
    dismissed: true,
    promptIdx,
    savedAt: now.getTime(),
  };
  writeStore(s);
}

/** Full history, newest week first — used by a future "look back" view
 *  on /patterns, not yet rendered anywhere. */
export function allReflections(): Array<{ monday: string; entry: WeeklyReflectionEntry }> {
  const s = readStore();
  return Object.entries(s.items)
    .map(([monday, entry]) => ({ monday, entry }))
    .sort((a, b) => (a.monday < b.monday ? 1 : -1));
}

export function deleteAll(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}
