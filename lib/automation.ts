"use client";

// Automation for the two loops in the product.
//
// Daily loop:  one soft nudge at bedtime. Nothing else, ever.
// Weekly loop: the mirror card arrives Sunday evening, and the week that just
//              closed is rolled up into the shelf automatically — the user never
//              has to press "generate" for their own reflection to exist.
//
// Everything here is on-device and opt-in. The nudges use the Web Notification
// API, so they only fire while the app is open (a real app would use a push
// service worker; this is honest about what a web build can do). No permission
// is requested until the user taps the toggle.

import { archivedWeeks, buildMirror, saveMirror, type Mirror } from "@/lib/mirror";

const NUDGE_KEY = "ff_nudge";
const DAY_MS = 24 * 60 * 60 * 1000;

export type NudgePrefs = {
  /** The one evening ping, at the hour the user said they go to bed. */
  nightly: boolean;
  /** The Sunday mirror ping. */
  weekly: boolean;
  /** Local hour for the nightly ping, 0–23. */
  bedtimeHour: number;
};

const DEFAULT_PREFS: NudgePrefs = { nightly: false, weekly: true, bedtimeHour: 22 };

/* ── weekly roll-up ────────────────────────────────────────────────────── */

/**
 * Run on app open. Archives the week that just closed (once), and returns the
 * live mirror for the week in progress plus the shelf.
 *
 * Idempotent: saving the same week twice overwrites with fresher numbers, and
 * weeks with nothing logged are never archived — an empty card is not a memory.
 */
export function runWeeklyAutomation(now = new Date()): {
  current: Mirror;
  shelf: Mirror[];
} {
  const current = buildMirror(now);

  // The week that ended: only archive it if the user actually logged something.
  const closed = buildMirror(new Date(now.getTime() - 7 * DAY_MS));
  if (closed.recorded > 0) saveMirror(closed);

  // A week is also worth keeping the moment it's complete and Sunday has passed.
  if (current.recorded > 0 && now.getDay() === 0 && now.getHours() >= 20) {
    saveMirror(current);
  }

  return { current, shelf: archivedWeeks() };
}

/* ── nudges ────────────────────────────────────────────────────────────── */

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function readNudgePrefs(): NudgePrefs {
  try {
    const raw = window.localStorage.getItem(NUDGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const o = JSON.parse(raw) as Partial<NudgePrefs>;
    return {
      nightly: Boolean(o.nightly),
      weekly: o.weekly !== false,
      bedtimeHour:
        typeof o.bedtimeHour === "number" && o.bedtimeHour >= 0 && o.bedtimeHour <= 23
          ? Math.round(o.bedtimeHour)
          : DEFAULT_PREFS.bedtimeHour,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function writeNudgePrefs(prefs: Partial<NudgePrefs>): NudgePrefs {
  const next = { ...readNudgePrefs(), ...prefs };
  try {
    window.localStorage.setItem(NUDGE_KEY, JSON.stringify(next));
  } catch {
    /* storage can be blocked */
  }
  return next;
}

/** Ask for notification permission — only ever called from a user gesture. */
export async function enableNudges(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  try {
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    return (await Notification.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

/** Next Sunday at 20:15 local — the moment the brief picks for the mirror. */
export function nextWeeklyNudge(now = new Date()): Date {
  const d = new Date(now);
  const daysUntilSunday = (7 - d.getDay()) % 7;
  d.setDate(d.getDate() + daysUntilSunday);
  d.setHours(20, 15, 0, 0);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 7);
  return d;
}

/** Tonight at the bedtime hour, or tomorrow if that has already passed. */
export function nextNightlyNudge(now = new Date(), hour = DEFAULT_PREFS.bedtimeHour): Date {
  const d = new Date(now);
  d.setHours(hour, 0, 0, 0);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

let timers: ReturnType<typeof setTimeout>[] = [];

export function clearNudgeTimers(): void {
  for (const t of timers) clearTimeout(t);
  timers = [];
}

function fire(title: string, body: string, tag: string): void {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, tag });
  } catch {
    /* some browsers require a service worker; silence is fine */
  }
}

/**
 * Arm the timers for the current session. Safe to call on every open — it
 * clears whatever was armed before. Long gaps are re-armed on the next open,
 * which is why the weekly card also auto-opens from the UI itself.
 */
export function scheduleNudges(now = new Date()): void {
  clearNudgeTimers();
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  const prefs = readNudgePrefs();

  if (prefs.nightly) {
    const at = nextNightlyNudge(now, prefs.bedtimeHour);
    timers.push(
      setTimeout(
        () => fire("Fix", "three taps when you're ready. no rush.", "ff-nightly"),
        Math.max(0, at.getTime() - now.getTime()),
      ),
    );
  }

  if (prefs.weekly) {
    const at = nextWeeklyNudge(now);
    timers.push(
      setTimeout(
        () => fire("your week is ready", "four minutes. nothing to fix.", "ff-weekly"),
        Math.max(0, at.getTime() - now.getTime()),
      ),
    );
  }
}

/* ── one-time helpers for the UI ───────────────────────────────────────── */

/** Has the mirror been opened for this week? Used to decide auto-open. */
export function mirrorSeenThisWeek(weekKey: string): boolean {
  try {
    return window.localStorage.getItem("ff_mirror_seen") === weekKey;
  } catch {
    return false;
  }
}

export function markMirrorSeen(weekKey: string): void {
  try {
    window.localStorage.setItem("ff_mirror_seen", weekKey);
  } catch {
    /* ignore */
  }
}
