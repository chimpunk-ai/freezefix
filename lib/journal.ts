"use client";

// Private, device-only journal. One of three kinds of entries:
//   • general          — anything else you want to look back on
//   • after-use        — reflection after you used
//   • craving          — a craving, whether or not it was acted on
//
// Nothing is uploaded, no server knows. The wins log (ff_wins_log) remains the
// quick-save surface inside /app; this journal is the richer surface on /journal.
// They are kept as separate stores on purpose: a win is a positive one-liner, a
// journal entry carries structured context tags and a longer note.

const KEY = "ff_journal_entries";
const MAX_ENTRIES = 500;
const MAX_NOTE = 500;

export type EntryType = "general" | "after-use" | "craving";
export type UseStatus = "yes" | "no" | "prefer-not-to-say";

export type Entry = {
  /** Random id so delete-by-index can never target the wrong row after a merge. */
  id: string;
  /** ms since epoch (local). */
  ts: number;
  type: EntryType;
  used: UseStatus;
  /** Short tag ids like "boredom", "stress". Lives in CONTEXTS below. */
  contexts: string[];
  /** Free text, trimmed to MAX_NOTE. */
  note: string;
};

export const TYPE_LABEL: Record<EntryType, string> = {
  general: "Something that happened",
  "after-use": "After-use reflection",
  craving: "Craving reflection",
};

export const USE_LABEL: Record<UseStatus, string> = {
  yes: "Used cannabis",
  no: "No use",
  "prefer-not-to-say": "Prefer not to say",
};

export const CONTEXTS = [
  { id: "boredom", label: "Boredom" },
  { id: "habit", label: "Habit" },
  { id: "stress", label: "Stress" },
  { id: "social", label: "Social" },
  { id: "discomfort", label: "Discomfort" },
  { id: "sleep", label: "Sleep" },
  { id: "other", label: "Something else" },
] as const;

function read(): Entry[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? (list as Entry[]) : [];
  } catch {
    return [];
  }
}

function write(list: Entry[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX_ENTRIES)));
  } catch {
    /* storage can be blocked; app still works, just forgets. */
  }
}

/** Oldest → newest, as stored. The screen reverses to show newest first. */
export function all(): Entry[] {
  return read();
}

export function allNewestFirst(): Entry[] {
  return read().slice().reverse();
}

export function count(): number {
  return read().length;
}

/** Add an entry; returns the stored object. */
export function add(input: {
  type: EntryType;
  used: UseStatus;
  contexts: string[];
  note: string;
}): Entry {
  const now = Date.now();
  const entry: Entry = {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    ts: now,
    type: input.type,
    used: input.used,
    contexts: input.contexts.filter((c) => CONTEXTS.some((o) => o.id === c)),
    note: (input.note || "").trim().slice(0, MAX_NOTE),
  };
  const list = read();
  list.push(entry);
  write(list);
  return entry;
}

export function remove(id: string) {
  write(read().filter((e) => e.id !== id));
}

export function clearAll() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
