"use client";

// The weekly mirror — the engine behind the one magic moment in the product.
//
// Brief, section 5: every Sunday evening the user gets one card that says what
// their week looked like, in plain English, with no grade and no trophies. This
// file computes that card from what is already on the device:
//
//   • lib/checkins  — the nightly yes/no tap ("did you smoke today?")
//   • lib/journal   — the richer entries, which carry trigger contexts
//   • lib/wins      — the quick saves ("something that helped")
//   • lib/goals     — the user's own goal, if they picked one
//   • the "one small thing" counter below — a tiny opt-in weekly goal
//
// Everything is local. Nothing is uploaded, nothing is sent to an AI, and the
// engine never guesses: every sentence it produces is backed by a count it can
// point at. If the week is too thin to say anything true, it says that instead
// of inventing a pattern.
//
// Posture (brief, section 6): descriptive, never diagnostic. No "you should",
// no streaks, no score. "You smoked on four of seven nights" is the register.

import { todayISO } from "@/lib/checkins";
import { allNewestFirst, CONTEXTS } from "@/lib/journal";
import { thisWeek } from "@/lib/wins";
import { NIGHT_TRIGGERS, moodAverage, triggerCounts } from "@/lib/nights";
import { GOAL_LABEL, readGoal } from "@/lib/goals";

const MIRROR_KEY = "ff_mirrors";
const THING_KEY = "ff_thing";
const VERSION = 1 as const;

const WEEKDAY_INITIAL = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_MS = 24 * 60 * 60 * 1000;

/** One box in the seven-night grid. */
export type Night = {
  day: string;
  initial: string;
  /** true = smoked, false = didn't, null = nothing logged. */
  smoked: boolean | null;
  /** True for days in the future, so the grid can dim them instead of showing a gap. */
  future: boolean;
};

export type Mirror = {
  /** ISO date of the week's Monday — the storage key and the archive key. */
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  nights: Night[];
  /** Nights the user said yes. */
  smoked: number;
  /** Nights with any answer at all (yes or no). */
  recorded: number;
  /** Nights still to come in this week. */
  remaining: number;
  /** Most frequent trigger label, when one showed up at least twice. */
  topTrigger: string | null;
  topTriggerCount: number;
  /** Quick saves from lib/wins in this window. */
  wins: number;
  /** The user's chosen goal label, if they chose one. */
  goal: string | null;
  /** The "one small thing" line, already phrased, or null when unset. */
  thingLine: string | null;
  /** The headline sentence. Plain English, no judgement. */
  sentence: string;
  /** One small observation the user may not have put together. */
  observation: string;
  /** Honest direction vs the week before: positive = fewer smoke nights. */
  direction: string | null;
  /** False when there is not enough logged to say anything true yet. */
  hasEnough: boolean;
  generatedAt: number;
};

/** The user's own weekly "one small thing" — brief, section 3. */
export type Thing = {
  /** Their words, trimmed. e.g. "go for a run". */
  label: string;
  /** How many times a week they said they'd like to do it. */
  target: number;
  /** ISO days they marked done. */
  days: string[];
};

/* ── dates ─────────────────────────────────────────────────────────────── */

/** Monday of the week containing `now`, at local midnight. */
export function mondayOf(now = new Date()): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const shift = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - shift);
  return d;
}

export function weekKeyOf(now = new Date()): string {
  return todayISO(mondayOf(now));
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function storageAvailable(): boolean {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

/* ── the "one small thing" counter ─────────────────────────────────────── */

export function readThing(): Thing | null {
  if (!storageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(THING_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Thing;
    if (!o || typeof o.label !== "string" || !o.label.trim()) return null;
    return {
      label: o.label.trim().slice(0, 60),
      target: Math.max(1, Math.min(7, Number(o.target) || 2)),
      days: Array.isArray(o.days) ? o.days.filter((d) => typeof d === "string").slice(-60) : [],
    };
  } catch {
    return null;
  }
}

export function writeThing(label: string, target: number): Thing | null {
  if (!storageAvailable()) return null;
  const trimmed = label.trim().slice(0, 60);
  if (!trimmed) {
    try {
      window.localStorage.removeItem(THING_KEY);
    } catch {
      /* storage can be blocked */
    }
    return null;
  }
  const next: Thing = {
    label: trimmed,
    target: Math.max(1, Math.min(7, Math.round(target) || 2)),
    days: readThing()?.days ?? [],
  };
  try {
    window.localStorage.setItem(THING_KEY, JSON.stringify(next));
  } catch {
    /* storage can be blocked */
  }
  return next;
}

export function clearThing(): void {
  if (!storageAvailable()) return;
  try {
    window.localStorage.removeItem(THING_KEY);
  } catch {
    /* ignore */
  }
}

/** Mark the thing done today / undo it. Returns the updated store. */
export function toggleThingToday(now = new Date()): Thing | null {
  const thing = readThing();
  if (!thing) return null;
  const day = todayISO(now);
  const has = thing.days.includes(day);
  const next: Thing = {
    ...thing,
    days: has ? thing.days.filter((d) => d !== day) : [...thing.days, day],
  };
  if (storageAvailable()) {
    try {
      window.localStorage.setItem(THING_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}

/** How many times the thing was done inside the week containing `now`. */
export function thingDoneThisWeek(now = new Date()): number {
  const thing = readThing();
  if (!thing) return 0;
  const start = mondayOf(now);
  const end = addDays(start, 7);
  return thing.days.filter((d) => {
    const t = new Date(`${d}T12:00:00`);
    return t >= start && t < end;
  }).length;
}

/* ── the engine ────────────────────────────────────────────────────────── */

function triggerLabel(id: string): string {
  return (
    CONTEXTS.find((c) => c.id === id)?.label ??
    NIGHT_TRIGGERS.find((t) => t.id === id)?.label ??
    id
  );
}

/** Nights in the week containing `now`, Monday → Sunday. */
function nightsFor(now: Date): Night[] {
  const start = mondayOf(now);
  const today = todayISO(now);
  const log = readLog();
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    const day = todayISO(d);
    const answer = log[day];
    return {
      day,
      initial: WEEKDAY_INITIAL[d.getDay()],
      smoked: answer === "yes" ? true : answer === "no" ? false : null,
      future: day > today,
    };
  });
}

/** Read the check-in log without importing a second copy of its shape. */
function readLog(): Record<string, "yes" | "no"> {
  if (!storageAvailable()) return {};
  try {
    const raw = window.localStorage.getItem("ff_checkins");
    if (!raw) return {};
    const o = JSON.parse(raw);
    return o && typeof o === "object" ? (o as Record<string, "yes" | "no">) : {};
  } catch {
    return {};
  }
}

function smokeCounts(now: Date): { smoked: number; recorded: number } {
  const log = readLog();
  const start = mondayOf(now);
  let smoked = 0;
  let recorded = 0;
  for (let i = 0; i < 7; i++) {
    const ans = log[todayISO(addDays(start, i))];
    if (ans === "yes") smoked += 1;
    if (ans === "yes" || ans === "no") recorded += 1;
  }
  return { smoked, recorded };
}

/** Compute the mirror for the week containing `now`. Pure apart from the local reads. */
export function buildMirror(now = new Date()): Mirror {
  const start = mondayOf(now);
  const end = addDays(start, 6);
  const nights = nightsFor(now);
  const { smoked, recorded } = smokeCounts(now);
  const remaining = nights.filter((n) => n.future).length;

  // Triggers: only count entries that sit inside this week, and only call
  // something a pattern when it happened more than once.
  const startMs = start.getTime();
  const endMs = addDays(start, 7).getTime();
  const counts = new Map<string, number>();
  for (const e of allNewestFirst()) {
    if (e.ts < startMs || e.ts >= endMs) continue;
    for (const c of e.contexts ?? []) counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  // The nightly tap carries its own chips (lib/nights). Merging them with the journal
  // contexts is what lets the sentence fire from the three-tap log alone, without the
  // user ever opening the journal.
  for (const [id, n] of triggerCounts(nights.map((night) => night.day))) {
    counts.set(id, (counts.get(id) ?? 0) + n);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const topTrigger = ranked[0] && ranked[0][1] > 1 ? triggerLabel(ranked[0][0]) : null;
  const topTriggerCount = topTrigger ? ranked[0][1] : 0;

  const winsThisWeek = thisWeek(now)?.count ?? 0;
  const goalId = readGoal();
  const goal = goalId ? GOAL_LABEL[goalId] : null;

  const thing = readThing();
  const done = thingDoneThisWeek(now);
  const thingLine = thing
    ? `You wanted to ${thing.label} ${thing.target}× this week. So far: ${done}.`
    : null;

  const prev = smokeCounts(addDays(now, -7));
  const comparable = recorded >= 3 && prev.recorded >= 3;
  const delta = comparable ? prev.smoked - smoked : null;

  const hasEnough = recorded >= 3;

  // Mood only speaks when both sides of the comparison have at least two faces, so a
  // single rough night cannot masquerade as a pattern. A gap under half a face is not a
  // difference worth reporting.
  const smokedMood = moodAverage(
    nights.filter((night) => night.smoked === true).map((night) => night.day),
  );
  const cleanMood = moodAverage(
    nights.filter((night) => night.smoked === false).map((night) => night.day),
  );
  const moodDiff =
    smokedMood.n >= 2 && cleanMood.n >= 2 ? cleanMood.avg - smokedMood.avg : null;

  const sentence = (() => {
    if (recorded === 0) {
      return "Nothing logged this week yet. The mirror fills itself as you tap — three nights is enough to start.";
    }
    if (!hasEnough) {
      const need = 3 - recorded;
      return `You've logged ${recorded} ${recorded === 1 ? "night" : "nights"} so far. ${need} more and the shape starts to show.`;
    }
    const base = `You logged ${recorded} of the last seven nights, and smoked on ${smoked}.`;
    if (topTrigger) return `${base} ${topTriggerCount} of those entries had "${topTrigger.toLowerCase()}" in them.`;
    return base;
  })();

  const observation = (() => {
    if (!hasEnough) {
      return "Nothing to compare yet. Two weeks of taps and the picture gets more specific.";
    }
    if (delta !== null && delta !== 0) {
      return delta > 0
        ? `That's ${delta} fewer than the week before. Direction, not achievement — you can read that however you like.`
        : `That's ${Math.abs(delta)} more than the week before. Weeks move. Nothing here is a verdict.`;
    }
    if (winsThisWeek > 0) {
      return `You also saved ${winsThisWeek} small ${winsThisWeek === 1 ? "win" : "wins"} this week. Those count as data too.`;
    }
    if (moodDiff !== null && Math.abs(moodDiff) >= 0.5) {
      return moodDiff > 0
        ? "On the nights you didn't smoke, your mood face averaged a little higher. That is a correlation in your own taps, not a verdict."
        : "On the nights you didn't smoke, your mood face wasn't higher. Whatever else is going on, weed isn't the whole story.";
    }
    // `delta === null` means there is no earlier week worth comparing against. Saying
    // "the same as last week" there would invent a comparison the engine never made, so
    // only a real zero delta gets to claim sameness.
    if (delta === 0) {
      return "A week the same as the last one is still a shape. Only you know what it means.";
    }
    if (remaining > 0) {
      return `${remaining} ${remaining === 1 ? "night" : "nights"} left this week. Nothing to do about it unless you want to.`;
    }
    return "Seven nights logged, and no earlier week to compare them to yet. Next Sunday the picture gets a second point.";
  })();

  const direction = (() => {
    if (delta === null) return null;
    if (delta > 0) return `${delta} fewer than last week`;
    if (delta < 0) return `${Math.abs(delta)} more than last week`;
    return "the same as last week";
  })();

  return {
    weekKey: todayISO(start),
    weekStart: todayISO(start),
    weekEnd: todayISO(end),
    nights,
    smoked,
    recorded,
    remaining,
    topTrigger,
    topTriggerCount,
    wins: winsThisWeek,
    goal,
    thingLine,
    sentence,
    observation,
    direction,
    hasEnough,
    generatedAt: Date.now(),
  };
}

/* ── the archive ───────────────────────────────────────────────────────── */

type ArchiveStore = { v: typeof VERSION; items: Record<string, Mirror> };

function readArchive(): ArchiveStore {
  if (!storageAvailable()) return { v: VERSION, items: {} };
  try {
    const raw = window.localStorage.getItem(MIRROR_KEY);
    if (!raw) return { v: VERSION, items: {} };
    const o = JSON.parse(raw) as ArchiveStore;
    if (!o || typeof o !== "object" || !o.items) return { v: VERSION, items: {} };
    return { v: VERSION, items: o.items };
  } catch {
    return { v: VERSION, items: {} };
  }
}

/** Store a week so it survives into the shelf of Sundays. */
export function saveMirror(m: Mirror): void {
  if (!storageAvailable()) return;
  const store = readArchive();
  store.items[m.weekKey] = m;
  // Keep a year. The shelf is meant to be readable, not infinite.
  const keys = Object.keys(store.items).sort();
  while (keys.length > 52) {
    const drop = keys.shift();
    if (drop) delete store.items[drop];
  }
  try {
    window.localStorage.setItem(MIRROR_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

/** Past weeks, newest first. */
export function archivedWeeks(): Mirror[] {
  return Object.values(readArchive().items).sort((a, b) => (a.weekKey < b.weekKey ? 1 : -1));
}

/** The most recent stored week, if any. */
export function latestArchived(): Mirror | null {
  return archivedWeeks()[0] ?? null;
}
