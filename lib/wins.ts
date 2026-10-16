"use client";

// The wins log: small things that actually happened, in the person's own words.
//
// On the device only, like memory. Nothing is uploaded, so nobody can lose face by having
// this read back to them, and there is no server copy to leak.
//
// Deliberately no streaks and no counters that reset. Missing a week costs nothing here:
// the point is that someone can scroll back in February and see what they got through in
// October, not that they feel bad on a Tuesday.

const KEY = "ff_wins_log";
const MAX = 200;

export type Win = {
  /** Their words where possible, ours only if they tapped a suggestion. */
  text: string;
  /** ISO date, no time: enough to group by week, not enough to track anyone's night. */
  day: string;
  /** Which kind of moment it came out of, for the weekly card. */
  moment?: string;
};

function read(): Win[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Win[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(list: Win[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX)));
  } catch {
    /* storage can be blocked; the app still works, it just won't remember */
  }
}

export function allWins(): Win[] {
  return read().slice().reverse(); // newest first for the screen
}

export function addWin(text: string, moment?: string) {
  const clean = text.trim().slice(0, 140);
  if (!clean) return;
  const day = new Date().toISOString().slice(0, 10);
  write([...read(), { text: clean, day, moment }]);
}

export function removeWin(index: number) {
  // The screen shows newest first, so the index has to be flipped back.
  const list = read();
  const real = list.length - 1 - index;
  if (real < 0 || real >= list.length) return;
  write(list.filter((_, i) => i !== real));
}

export function clearWins() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export type WeekSummary = {
  count: number;
  days: number;
  wins: Win[];
  /** The kind of moment that came up most, if one stands out. */
  topMoment?: string;
};

/** The last seven days, for the weekly card. Returns null when there's nothing to show. */
export function thisWeek(now = new Date()): WeekSummary | null {
  const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const wins = read().filter((w) => w.day >= since);
  if (!wins.length) return null;

  const byMoment = new Map<string, number>();
  for (const w of wins) if (w.moment) byMoment.set(w.moment, (byMoment.get(w.moment) ?? 0) + 1);
  const ranked = [...byMoment.entries()].sort((a, b) => b[1] - a[1]);
  // Only call something a pattern if it actually happened more than once.
  const topMoment = ranked[0]?.[1] > 1 ? ranked[0][0] : undefined;

  return {
    count: wins.length,
    days: new Set(wins.map((w) => w.day)).size,
    wins: wins.slice().reverse(),
    topMoment,
  };
}
