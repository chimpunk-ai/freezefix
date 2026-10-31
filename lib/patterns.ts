"use client";

// Private, on-device pattern analysis.
//
// This file reads what the person has already saved on their own phone: the wins log,
// the recent scenario cards they used, visit counts, and the moments they picked.
// Nothing here calls the server, no provider sees any of it, and nothing is written
// back — this is a read-only derivation on top of what the chat flow already stores.
//
// If storage is empty or blocked, every function returns a safe empty shape so the UI
// renders "No patterns yet" rather than crashing. This is deliberate: a cold-start
// user should see a calm, honest page, not an error state.

import { allWins, type Win } from "@/lib/wins";

const K_RECENT = "ff_recent_scenarios";
const K_MOMENT_LOG = "ff_moment_log"; // written by FreezeFixApp; may not exist on old devices
const K_VISITS = "ff_visits";

export type MomentCount = { moment: string; count: number };
export type DayBucket = { day: string; count: number };
export type HourBucket = { hour: number; count: number }; // 0..23

export type Patterns = {
  totalWins: number;
  activeDays: number;        // distinct days anything was logged
  visits: number;            // app opens
  topMoments: MomentCount[]; // sorted by count desc
  byWeekday: DayBucket[];    // Mon..Sun, 0=Mon
  byHour: HourBucket[];      // 24 buckets
  longestStreak: number;     // longest consecutive-day streak of wins (not shown as pressure, just as reflection)
  currentStreak: number;     // only shown if >= 2, never framed as "don't break it"
  recentScenarios: string[]; // the scenario card ids they used, most recent first
};

// WEEKDAY_LABEL is declared BEFORE EMPTY on purpose: EMPTY's initializer reads from it,
// and Next.js 16's prerender evaluates this module server-side at build time. Keeping the
// label above the const avoids a temporal-dead-zone ReferenceError when the Turbopack
// minifier reorders the file and renames WEEKDAY_LABEL into a short local — the symptom
// was "Cannot access 'h' before initialization" during the /patterns prerender step.
export const WEEKDAY_LABEL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const EMPTY: Patterns = {
  totalWins: 0,
  activeDays: 0,
  visits: 0,
  topMoments: [],
  byWeekday: Array.from({ length: 7 }, (_, i) => ({ day: WEEKDAY_LABEL[i], count: 0 })),
  byHour: Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 })),
  longestStreak: 0,
  currentStreak: 0,
  recentScenarios: [],
};

/** Safe JSON array read from localStorage; returns [] on any failure. */
function readArray<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? (list as T[]) : [];
  } catch {
    return [];
  }
}

function readNumber(key: string): number {
  try {
    const raw = window.localStorage.getItem(key);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/** Internal shape of a moment-log entry if the app writes one (optional). */
type MomentLogEntry = { moment?: string; day?: string; iso?: string };

export function computePatterns(): Patterns {
  if (typeof window === "undefined") return EMPTY;

  const wins = allWins();
  if (!wins.length && readArray<MomentLogEntry>(K_MOMENT_LOG).length === 0) {
    // Pure cold-start: nothing to analyse. Return empty rather than fake "sample" data.
    return { ...EMPTY, visits: readNumber(K_VISITS), recentScenarios: readArray<string>(K_RECENT) };
  }

  // --- Top moments ---
  const momentCounts = new Map<string, number>();
  for (const w of wins) {
    if (!w.moment) continue;
    momentCounts.set(w.moment, (momentCounts.get(w.moment) ?? 0) + 1);
  }
  // Also fold in any moment-log entries (if present) so people who open Fix without
  // saving a win still see pattern counts.
  for (const e of readArray<MomentLogEntry>(K_MOMENT_LOG)) {
    if (!e.moment) continue;
    momentCounts.set(e.moment, (momentCounts.get(e.moment) ?? 0) + 1);
  }
  const topMoments: MomentCount[] = [...momentCounts.entries()]
    .map(([moment, count]) => ({ moment, count }))
    .sort((a, b) => b.count - a.count);

  // --- Day/hour distribution (from wins only — those have a day; from moment-log if iso) ---
  const byWeekday = Array.from({ length: 7 }, (_, i) => ({ day: WEEKDAY_LABEL[i], count: 0 }));
  const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));

  const sampleDays = new Set<string>();
  for (const w of wins) {
    if (!w.day) continue;
    sampleDays.add(w.day);
    // Interpret the ISO date as midnight local. Weekday computed in local time to match the person's calendar.
    const d = new Date(w.day + "T12:00:00"); // noon avoids any DST edges
    const jsDay = d.getDay(); // 0=Sun..6=Sat
    const mondayIdx = (jsDay + 6) % 7; // 0=Mon..6=Sun
    byWeekday[mondayIdx].count += 1;
  }
  for (const e of readArray<MomentLogEntry>(K_MOMENT_LOG)) {
    if (!e.iso) continue;
    const d = new Date(e.iso);
    if (Number.isNaN(d.getTime())) continue;
    const hour = d.getHours();
    byHour[hour].count += 1;
    const mondayIdx = (d.getDay() + 6) % 7;
    byWeekday[mondayIdx].count += 1;
    if (e.day) sampleDays.add(e.day);
  }

  // --- Streaks ---
  const sortedDays = [...sampleDays].sort(); // ISO strings sort chronologically
  const { longest, current } = streaks(sortedDays);

  return {
    totalWins: wins.length,
    activeDays: sampleDays.size,
    visits: readNumber(K_VISITS),
    topMoments,
    byWeekday,
    byHour,
    longestStreak: longest,
    currentStreak: current,
    recentScenarios: readArray<string>(K_RECENT).slice(0, 8),
  };
}

/** Longest consecutive-day streak in an ascending list of ISO dates, and the current
 *  streak if it ends on today (local). "Streak" here is reflection, not pressure — the UI
 *  never scolds about a break. */
function streaks(ascDates: string[]): { longest: number; current: number } {
  if (!ascDates.length) return { longest: 0, current: 0 };

  const dayMs = 24 * 60 * 60 * 1000;
  let longest = 1;
  let run = 1;

  for (let i = 1; i < ascDates.length; i++) {
    const prev = new Date(ascDates[i - 1] + "T12:00:00").getTime();
    const curr = new Date(ascDates[i] + "T12:00:00").getTime();
    const diffDays = Math.round((curr - prev) / dayMs);
    if (diffDays === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else if (diffDays === 0) {
      // same day twice — treat as no change
    } else {
      run = 1;
    }
  }

  // Current streak only counts if the last logged day is today or yesterday.
  const last = ascDates[ascDates.length - 1];
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - dayMs).toISOString().slice(0, 10);
  const current = last === today || last === yesterday ? run : 0;
  return { longest, current };
}

/** Helper for the chart: scale 0..max → percentage width (0..100), capped so a lone big bar
 *  doesn't flatten the rest. */
export function barPct(count: number, max: number): number {
  if (!max) return 0;
  const raw = (count / max) * 100;
  return Math.max(count > 0 ? 4 : 0, Math.min(100, raw)); // 4% floor so a count of 1 is visible
}

/** The last four full weeks of win counts, for a sparkline-style view. */
export function winsByWeek(wins: Win[], now = new Date()): { label: string; count: number }[] {
  const dayMs = 24 * 60 * 60 * 1000;
  const out: { label: string; count: number }[] = [];
  for (let w = 3; w >= 0; w--) {
    const start = new Date(now.getTime() - (w + 1) * 7 * dayMs);
    const end = new Date(now.getTime() - w * 7 * dayMs);
    const startISO = start.toISOString().slice(0, 10);
    const endISO = end.toISOString().slice(0, 10);
    const count = wins.filter((x) => x.day >= startISO && x.day < endISO).length;
    out.push({ label: w === 0 ? "This week" : `${w}w ago`, count });
  }
  return out;
}
