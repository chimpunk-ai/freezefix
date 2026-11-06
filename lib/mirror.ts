// When the mirror arrives, and which weeks have already been seen.
//
// One card a week, on Sunday evening. Nothing else in the app notifies anyone.
// "Seen" lives on the device so the same card doesn't slide up twice.

import { addDays, todayISO, type Entries } from "./entry";
import type { Goal } from "./profile";
import { weekStats, type WeekStats } from "./pattern";

const SEEN_KEY = "ff_mirror_seen";

/** 8:15pm Sunday, the hour the card is meant to arrive. */
export const MIRROR_HOUR = 20;

export function readSeen(): Record<string, true> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, true>) : {};
  } catch {
    return {};
  }
}

export function markSeen(weekEnd: string) {
  if (typeof window === "undefined") return;
  try {
    const seen = readSeen();
    seen[weekEnd] = true;
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    /* ignore */
  }
}

export function clearSeen() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SEEN_KEY);
  } catch {
    /* ignore */
  }
}

/** The Sunday that closes the week containing `now`. */
export function weekEndFor(now = new Date()): string {
  const day = todayISO(now);
  const dow = now.getDay(); // 0 = Sunday
  return addDays(day, -dow);
}

/**
 * Is there a card waiting? A card is waiting when this week has closed (it is
 * Sunday evening or later in the week) and the user has logged something in it
 * and hasn't opened that week's card yet.
 */
export function dueMirror(entries: Entries, goal: Goal | null, now = new Date()): WeekStats | null {
  const sunday = weekEndFor(now);
  const seen = readSeen();
  // The week that just closed. On Sunday itself the week closes that evening.
  const closing = now.getDay() === 0 && now.getHours() >= MIRROR_HOUR ? sunday : addDays(sunday, -7);
  const candidates = [closing, addDays(closing, -7)];
  for (const end of candidates) {
    if (seen[end]) continue;
    const stats = weekStats(entries, goal, end);
    if (stats.logged > 0) return stats;
  }
  return null;
}

/** The card to show on the mirror page: this week's if it has closed, else the last one. */
export function latestMirror(entries: Entries, goal: Goal | null, now = new Date()): WeekStats {
  const seen = readSeen();
  const due = dueMirror(entries, goal, now);
  if (due) return due;
  const sunday = weekEndFor(now);
  for (let i = 0; i < 12; i++) {
    const end = addDays(sunday, -7 * i);
    if (seen[end]) {
      const stats = weekStats(entries, goal, end);
      if (stats.logged > 0) return stats;
    }
  }
  return weekStats(entries, goal, sunday);
}
