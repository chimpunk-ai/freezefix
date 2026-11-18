// Moments: short free-form notes the user can add at any point in the day,
// outside the three-tap nightly ritual. Not a multi-time-of-day log — the log
// stays as it is. Moments are "something happened and I want fix to know."
//
// Shape and rules:
//   - Up to 200 characters per moment. Short on purpose; the nightly note
//     is the long-form path. Three sentences at most.
//   - Optional tag (one of a small fixed set): "note", "flag", "good", "hard".
//     Default is "note". The tag is for shape and quick scanning, not ranking.
//   - Timestamped to the device clock when saved. No edit, no delete-one — a
//     moment is a captured thing; you can clear all of a day's moments from
//     Settings or forget-everything.
//   - Capped at 20 moments per day. More than that reads as a different kind
//     of app; the cap keeps the week scannable.
//   - 90-day rolling window on-device so storage never balloons. Moments older
//     than 90 days are pruned on the next write.
//   - Stored under ff_moments in localStorage. Cleared by forget-everything.

export type MomentTag = "note" | "flag" | "good" | "hard";

export const MOMENT_TAG_LABEL: Record<MomentTag, string> = {
  note: "note",
  flag: "flag it",
  good: "good one",
  hard: "hard one",
};

export type Moment = {
  at: number;         // ms since epoch (device clock at save time)
  day: string;        // local YYYY-MM-DD derived from `at` at save time
  text: string;       // up to 200 chars after trim
  tag: MomentTag;
};

const KEY = "ff_moments";
export const MOMENT_MAX = 200;
export const MOMENTS_PER_DAY_CAP = 20;
const KEEP_DAYS = 90;

function todayLocal(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function readMoments(): Moment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((m): m is Moment => {
        if (!m || typeof m !== "object") return false;
        const x = m as Record<string, unknown>;
        return (
          typeof x.at === "number" &&
          typeof x.day === "string" &&
          typeof x.text === "string" &&
          (x.tag === "note" || x.tag === "flag" || x.tag === "good" || x.tag === "hard")
        );
      })
      .sort((a, b) => a.at - b.at);
  } catch {
    return [];
  }
}

function writeMoments(all: Moment[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage can be blocked */
  }
}

export function clearMoments(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Remove one moment by its exact timestamp. Returns true if a moment was
 *  found and removed, false otherwise (already deleted, or never there). */
export function deleteMoment(at: number): boolean {
  const all = readMoments();
  const next = all.filter((m) => m.at !== at);
  if (next.length === all.length) return false;
  writeMoments(next);
  return true;
}

/** Add a moment. Returns false when today is already at the 20-per-day cap. */
export function addMoment(text: string, tag: MomentTag = "note"): Moment | null {
  const now = Date.now();
  const day = todayLocal(now);
  const trimmed = text.trim().slice(0, MOMENT_MAX);
  if (!trimmed) return null;

  const all = readMoments();
  const todayCount = all.filter((m) => m.day === day).length;
  if (todayCount >= MOMENTS_PER_DAY_CAP) return null;

  const next: Moment = { at: now, day, text: trimmed, tag };

  // Prune old moments past the 90-day window so storage can't balloon.
  const cutoff = now - KEEP_DAYS * 24 * 60 * 60 * 1000;
  const kept = all.filter((m) => m.at >= cutoff);
  kept.push(next);

  writeMoments(kept);
  return next;
}

/** All moments for one calendar day (local). Oldest first. */
export function momentsForDay(day: string, all?: Moment[]): Moment[] {
  const list = all ?? readMoments();
  return list.filter((m) => m.day === day);
}

/** Moments inside the last N days, oldest first. Used by the Sunday card and
 *  by the Fix AI context builder. */
export function recentMoments(days: number, all?: Moment[]): Moment[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const list = all ?? readMoments();
  return list.filter((m) => m.at >= cutoff);
}

/** How much space is left in today's cap. 0 means today is full. */
export function todayMomentsRemaining(all?: Moment[]): number {
  const list = all ?? readMoments();
  const day = todayLocal(Date.now());
  const today = list.filter((m) => m.day === day).length;
  return Math.max(0, MOMENTS_PER_DAY_CAP - today);
}
