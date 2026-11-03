"use client";

// The Reduction Program.
//
// Shipped 3 November 2026 for Europe-audit P2.8. The audit's thesis was
// "Rescue is marketing. Transformation is the subscription." The landing +
// Fix chat solve the rescue moment; this is the ongoing-value piece — a
// self-guided, honest, non-chatbot structured plan the user builds for
// themselves and keeps for 2 / 4 / 6 weeks.
//
// How the program works (short version)
//   1. Pick ONE goal — fewer days per week, fewer times per session, pause
//      for N days, or shift the time you reach for a joint.
//   2. Pick a timeline — 2, 4, or 6 weeks. Nothing longer; a program the
//      user keeps extending becomes a chore.
//   3. Each day, open /program and see today's one line. Log at end of day:
//      "went well", "mixed", or "tough day." Optionally one line of what
//      happened. The log is three honest shapes; "well / mixed / tough"
//      replaces "yes / no" because a reduction plan is not pass/fail.
//   4. Each week, one gentle reflection question. Optional, skippable.
//   5. Visible progress chart. Honest: shows how many of your days you
//      logged, not a streak that breaks the first time you miss one.
//
// Posture — matches the project rules in CLAUDE / project instructions
//   - No streaks. A streak that breaks is a shame mechanic.
//   - No daily push notifications we didn't ask for. Opening the page is
//     the only reminder.
//   - "Tough day" is not failure. It is a valid log — the point is noticing.
//   - "Pause" is a feature, not a defection. Pausing freezes the counter
//     and lets the user resume with no "you broke it" message.
//   - "Delete" removes everything, locally, with no ceremony.
//   - "Export" returns a JSON blob the user can save or share.
//
// Storage
//   localStorage only, like checkins + goals + wins. One key: ff_program.
//   The schema has a `version` field so a future migration can bump it
//   without wiping existing programs. All reads tolerate a missing or
//   malformed value and return a safe empty shape; the UI never crashes
//   because storage was blocked (private window, locked-down enterprise
//   profile, etc.).
//
// What is NOT here
//   - No server round trip, no Supabase row, no device_id join. The whole
//     program is anonymous and local.
//   - No AI call. The program is a tool, not a chat. Fix (the chat) is one
//     tap away from the program UI, for the days a user wants to talk.
//   - No clinical claims. "Reduction" is the user's chosen goal; this
//     module calls it that because the user chose it, not because the
//     product is prescribing it.

export const PROGRAM_VERSION = 1 as const;

const KEY = "ff_program";

export type GoalKind =
  | "days_per_week" // fewer use days each week
  | "sessions_per_day" // fewer sessions on the days the user does use
  | "pause_for" // no use for N days
  | "shift_time"; // the specific "no joint before 8pm" / "no first-thing-in-the-morning" shift

/** The user's chosen goal. The numbers are the user's own numbers, saved as
 *  typed; this module never prescribes a target. "current" is where they
 *  started; "target" is where they want to be by the end of the plan. */
export type Goal =
  | { kind: "days_per_week"; current: number; target: number }
  | { kind: "sessions_per_day"; current: number; target: number }
  | { kind: "pause_for"; days: number }
  | { kind: "shift_time"; from: string; to: string };

export type Weeks = 2 | 4 | 6;

/** Three honest shapes for a day's log. "well" / "mixed" / "tough" — never
 *  "success" / "fail". A reduction plan is not a pass/fail test. */
export type DayState = "well" | "mixed" | "tough";

export type DayLog = {
  state: DayState;
  /** One line, up to 240 chars. The user's own words. Not shown anywhere
   *  except the program's own detail view; never uploaded. */
  note?: string;
  /** Epoch ms when the log was saved. Used only to show "logged just now"
   *  type copy; never left in analytics. */
  loggedAt: number;
};

export type ReductionProgram = {
  version: typeof PROGRAM_VERSION;
  /** Epoch ms when the program was first created. */
  startedAt: number;
  /** The plan length. 2 / 4 / 6 weeks only — see the posture note above. */
  weeks: Weeks;
  goal: Goal;
  /** Day logs, keyed by YYYY-MM-DD in LOCAL time. One entry per calendar day. */
  logs: Record<string, DayLog>;
  /** Weekly reflections, keyed by the ISO date of the program-week's Monday
   *  (so week 1 = startedAt's calendar week Monday). One optional sentence
   *  per week. */
  reflections: Record<string, string>;
  /** When set, the program is paused: today's screen shows "Paused" and the
   *  user can resume with one tap. Pausing freezes progress; resuming does
   *  not retroactively mark missed days. */
  pausedAt: number | null;
};

// ────────────────────────────────────────────────────────────────────────────
// Storage
// ────────────────────────────────────────────────────────────────────────────

/** Read the program from localStorage. Tolerant of missing / malformed /
 *  wrong-version data; those cases return null so the UI shows the "intro"
 *  state and the user starts fresh. Never throws. */
export function readProgram(): ReductionProgram | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as unknown;
    if (!isProgram(o)) return null;
    return o;
  } catch {
    return null;
  }
}

export function writeProgram(p: ReductionProgram): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage can be blocked; the app still works, just forgets. */
  }
}

/** Full delete — removes the whole program with no residue. Called from the
 *  "Delete this plan" button on the program's own settings. */
export function deleteProgram(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}

/** Export the program as a JSON string the user can copy, save, or paste
 *  elsewhere. Returns null if nothing is stored. The exported shape is
 *  stable (bumping it = version bump) so a future "import" surface stays
 *  honest. */
export function exportProgram(): string | null {
  const p = readProgram();
  if (!p) return null;
  return JSON.stringify(p, null, 2);
}

// ────────────────────────────────────────────────────────────────────────────
// Dates
// ────────────────────────────────────────────────────────────────────────────

/** YYYY-MM-DD in local time. */
export function todayISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** The ISO date (YYYY-MM-DD) of the Monday of the week that contains `now`,
 *  in local time. Used to key weekly reflections. */
export function mondayOf(now = new Date()): string {
  const d = new Date(now);
  // getDay(): 0=Sun … 6=Sat. We want Monday as day 0 of the week.
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return todayISO(d);
}

/** Number of calendar days from startedAt to `now`, LOCAL. Day 0 = the day
 *  the program was created; day 1 = the next calendar day. Always ≥ 0. */
export function daysSinceStart(p: ReductionProgram, now = new Date()): number {
  const start = new Date(p.startedAt);
  const a = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.floor((b - a) / 86_400_000));
}

/** Which program-week this day falls in (1-indexed). Caps at the program's
 *  total weeks + 1 (the "wrap-up" state when the plan is over). */
export function weekNumber(p: ReductionProgram, now = new Date()): number {
  const d = daysSinceStart(p, now);
  const w = Math.floor(d / 7) + 1;
  return Math.min(w, p.weeks + 1);
}

/** True if `now` is past the final day of the program's planned length. The
 *  user is NEVER forced into a decision at this point; the UI shows a
 *  gentle "your plan reached its end — reflect, extend, or wrap up" state. */
export function isFinished(p: ReductionProgram, now = new Date()): boolean {
  return daysSinceStart(p, now) >= p.weeks * 7;
}

// ────────────────────────────────────────────────────────────────────────────
// Day log
// ────────────────────────────────────────────────────────────────────────────

export function getDay(p: ReductionProgram, day: string): DayLog | undefined {
  return p.logs[day];
}

/** Save or overwrite today's log. Returns a new program object (immutable
 *  update) so React re-renders cleanly. */
export function setDay(
  p: ReductionProgram,
  state: DayState,
  note?: string,
  now = new Date()
): ReductionProgram {
  const next: ReductionProgram = {
    ...p,
    logs: {
      ...p.logs,
      [todayISO(now)]: {
        state,
        note: note ? note.trim().slice(0, 240) || undefined : undefined,
        loggedAt: now.getTime(),
      },
    },
  };
  writeProgram(next);
  return next;
}

/** Remove today's log — a "I logged by mistake" undo. */
export function clearDay(p: ReductionProgram, day: string): ReductionProgram {
  if (!(day in p.logs)) return p;
  const { [day]: _removed, ...rest } = p.logs;
  const next: ReductionProgram = { ...p, logs: rest };
  writeProgram(next);
  return next;
}

// ────────────────────────────────────────────────────────────────────────────
// Reflections
// ────────────────────────────────────────────────────────────────────────────

export function getReflection(p: ReductionProgram, weekMonday: string): string | undefined {
  return p.reflections[weekMonday];
}

export function setReflection(
  p: ReductionProgram,
  weekMonday: string,
  text: string
): ReductionProgram {
  const trimmed = text.trim().slice(0, 400);
  const next: ReductionProgram = {
    ...p,
    reflections: trimmed
      ? { ...p.reflections, [weekMonday]: trimmed }
      : (() => {
          const { [weekMonday]: _removed, ...rest } = p.reflections;
          return rest;
        })(),
  };
  writeProgram(next);
  return next;
}

// ────────────────────────────────────────────────────────────────────────────
// Pause / resume
// ────────────────────────────────────────────────────────────────────────────

export function pause(p: ReductionProgram, now = new Date()): ReductionProgram {
  const next: ReductionProgram = { ...p, pausedAt: now.getTime() };
  writeProgram(next);
  return next;
}

export function resume(p: ReductionProgram): ReductionProgram {
  const next: ReductionProgram = { ...p, pausedAt: null };
  writeProgram(next);
  return next;
}

export function isPaused(p: ReductionProgram): boolean {
  return p.pausedAt !== null;
}

// ────────────────────────────────────────────────────────────────────────────
// Progress
// ────────────────────────────────────────────────────────────────────────────

export type Progress = {
  /** How many of the days from startedAt → today have a log of ANY kind. */
  loggedDays: number;
  /** Total elapsed program days (0-indexed through the plan length). */
  elapsedDays: number;
  /** Total planned days (weeks * 7). */
  totalDays: number;
  /** Count of each state across all logged days. */
  wellCount: number;
  mixedCount: number;
  toughCount: number;
};

export function progressFor(p: ReductionProgram, now = new Date()): Progress {
  const elapsed = Math.min(daysSinceStart(p, now) + 1, p.weeks * 7);
  const totalDays = p.weeks * 7;
  let logged = 0;
  let well = 0;
  let mixed = 0;
  let tough = 0;
  for (const log of Object.values(p.logs)) {
    logged++;
    if (log.state === "well") well++;
    else if (log.state === "mixed") mixed++;
    else tough++;
  }
  return {
    loggedDays: logged,
    elapsedDays: elapsed,
    totalDays,
    wellCount: well,
    mixedCount: mixed,
    toughCount: tough,
  };
}

/** The last 14 days of logs as an array, newest last. Missing days become
 *  null so the renderer can show "no log" cells without re-fetching. */
export function last14Days(p: ReductionProgram, now = new Date()): Array<{ day: string; log: DayLog | null }> {
  const out: Array<{ day: string; log: DayLog | null }> = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const day = todayISO(d);
    out.push({ day, log: p.logs[day] ?? null });
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────────────
// Create
// ────────────────────────────────────────────────────────────────────────────

export function createProgram(input: {
  weeks: Weeks;
  goal: Goal;
  now?: Date;
}): ReductionProgram {
  const now = input.now ?? new Date();
  const p: ReductionProgram = {
    version: PROGRAM_VERSION,
    startedAt: now.getTime(),
    weeks: input.weeks,
    goal: input.goal,
    logs: {},
    reflections: {},
    pausedAt: null,
  };
  writeProgram(p);
  return p;
}

// ────────────────────────────────────────────────────────────────────────────
// Guards
// ────────────────────────────────────────────────────────────────────────────

/** Runtime type guard used by readProgram(). A stricter version than the
 *  TS compiler can enforce; blocks malformed payloads in localStorage from
 *  reaching the UI. */
function isProgram(o: unknown): o is ReductionProgram {
  if (!o || typeof o !== "object") return false;
  const p = o as Partial<ReductionProgram> & Record<string, unknown>;
  if (p.version !== PROGRAM_VERSION) return false;
  if (typeof p.startedAt !== "number") return false;
  if (p.weeks !== 2 && p.weeks !== 4 && p.weeks !== 6) return false;
  if (!p.goal || typeof p.goal !== "object") return false;
  const g = p.goal as { kind?: unknown };
  const kinds: GoalKind[] = ["days_per_week", "sessions_per_day", "pause_for", "shift_time"];
  if (typeof g.kind !== "string" || !kinds.includes(g.kind as GoalKind)) return false;
  if (!p.logs || typeof p.logs !== "object") return false;
  if (!p.reflections || typeof p.reflections !== "object") return false;
  if (!(p.pausedAt === null || typeof p.pausedAt === "number")) return false;
  return true;
}
