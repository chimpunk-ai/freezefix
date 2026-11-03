// Unit tests for lib/program.ts and shape tests for lib/program-copy.ts.
// Run: npm run test:program
//
// Program is the first stateful user-facing feature with real business logic
// (progress math, dates, state machine) and the first with its own
// localStorage schema. The tests cover:
//   - Date math (todayISO, mondayOf, daysSinceStart, weekNumber,
//     isFinished)
//   - Create / log / clear / reflect / pause / resume / delete, all through
//     the mocked localStorage so the real browser surface is exercised
//   - Progress counting and the last14Days view
//   - Schema version guard — a program at a wrong version is treated as
//     missing (so a future migration can bump safely)
//   - Copy shape in both locales so an untranslated string can't slip in

import {
  PROGRAM_VERSION,
  createProgram,
  readProgram,
  writeProgram,
  deleteProgram,
  exportProgram,
  setDay,
  clearDay,
  setReflection,
  pause,
  resume,
  isPaused,
  isFinished,
  todayISO,
  mondayOf,
  daysSinceStart,
  weekNumber,
  progressFor,
  last14Days,
  cleanStreakDays,
  daysUntilTarget,
  type ReductionProgram,
  type DayState,
} from "../lib/program";
import { PROGRAM_COPY } from "../lib/program-copy";
import { LOCALES } from "../lib/landing-copy";

// ────────────────────────── mock localStorage ──────────────────────────
// The library guards every call with try/catch, so if we don't mock the
// browser surface it falls back to the "storage blocked" path and nothing
// persists between calls — which is correct in production but useless in a
// test. Install a minimal mock before any import side-effect runs.

const store = new Map<string, string>();
const mockStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};
(globalThis as unknown as { window: unknown }).window = {
  localStorage: mockStorage,
  // Node tsx exposes a crypto.randomUUID; a few helpers may touch it later.
};

// ────────────────────────────── runner ───────────────────────────────
type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });
const nonEmpty = (s: unknown) => typeof s === "string" && s.trim().length > 0;

// ────────────────────────────── dates ────────────────────────────────
{
  const d = new Date("2026-03-01T15:00:00Z"); // 1 March 2026 = a Sunday UTC
  // todayISO must return LOCAL date; since tsx runs with the system TZ,
  // check only that the format is right.
  check("DATE-today-shape", /^\d{4}-\d{2}-\d{2}$/.test(todayISO(d)));

  // mondayOf should return the Monday of the week containing the input.
  // 2 Nov 2026 is a Monday.
  const monday = new Date("2026-11-02T12:00:00");
  const tuesday = new Date("2026-11-03T12:00:00");
  const sunday = new Date("2026-11-08T12:00:00");
  check("DATE-monday-of-monday", mondayOf(monday) === "2026-11-02");
  check("DATE-monday-of-tuesday", mondayOf(tuesday) === "2026-11-02");
  check("DATE-monday-of-sunday", mondayOf(sunday) === "2026-11-02");
}

// ────────────────────────── create / read ───────────────────────────
{
  store.clear();
  const now = new Date("2026-11-03T10:00:00");
  const p = createProgram({
    weeks: 4,
    goal: { kind: "days_per_week", current: 5, target: 2 },
    now,
  });
  check("CREATE-version", p.version === PROGRAM_VERSION);
  check("CREATE-weeks", p.weeks === 4);
  check("CREATE-goal", p.goal.kind === "days_per_week");
  check("CREATE-paused-null", p.pausedAt === null);
  check("CREATE-logs-empty", Object.keys(p.logs).length === 0);

  const r = readProgram();
  check("READ-roundtrip", r !== null && r.weeks === 4 && r.goal.kind === "days_per_week");
}

// ─────────────────── version guard: wrong version = null ──────────
{
  store.clear();
  store.set("ff_program", JSON.stringify({ ...minimalProgram(), version: 999 }));
  check("GUARD-wrong-version", readProgram() === null);

  store.set("ff_program", "not valid json");
  check("GUARD-malformed", readProgram() === null);

  store.set("ff_program", JSON.stringify({}));
  check("GUARD-empty-object", readProgram() === null);

  store.set("ff_program", JSON.stringify({ ...minimalProgram(), weeks: 3 }));
  check("GUARD-bad-weeks", readProgram() === null);
}

// ──────────────────────── log / clear ──────────────────────────────
{
  store.clear();
  const now = new Date("2026-11-03T12:00:00");
  let p = createProgram({ weeks: 2, goal: { kind: "pause_for", days: 7 }, now });
  const day = todayISO(now);
  p = setDay(p, "well", "stayed off, cooked instead", now);
  check("LOG-saved", p.logs[day]?.state === "well");
  check("LOG-note-saved", p.logs[day]?.note === "stayed off, cooked instead");
  check("LOG-persisted", readProgram()?.logs[day]?.state === "well");

  // Overwrite preserves the value
  p = setDay(p, "mixed", "", now);
  check("LOG-overwrite", p.logs[day]?.state === "mixed");
  check("LOG-note-cleared-on-empty", p.logs[day]?.note === undefined);

  // Clear removes the entry
  p = clearDay(p, day);
  check("LOG-cleared", p.logs[day] === undefined);
}

// ────────────────────── reflections ───────────────────────────────
{
  store.clear();
  const now = new Date("2026-11-03T12:00:00");
  let p = createProgram({ weeks: 2, goal: { kind: "pause_for", days: 7 }, now });
  const monday = mondayOf(now);
  p = setReflection(p, monday, "easier than I thought on Tuesday");
  check("REFL-saved", p.reflections[monday] === "easier than I thought on Tuesday");

  // Empty text removes the reflection
  p = setReflection(p, monday, "");
  check("REFL-cleared-on-empty", p.reflections[monday] === undefined);

  // Max length is 400 chars
  const long = "x".repeat(500);
  p = setReflection(p, monday, long);
  check("REFL-trimmed-to-400", (p.reflections[monday] ?? "").length === 400);
}

// ────────────────────── pause / resume ────────────────────────────
{
  store.clear();
  let p = createProgram({ weeks: 2, goal: { kind: "pause_for", days: 7 } });
  check("PAUSE-not-paused-yet", !isPaused(p));
  p = pause(p);
  check("PAUSE-paused", isPaused(p));
  check("PAUSE-persisted", readProgram()?.pausedAt !== null);
  p = resume(p);
  check("RESUME-cleared", !isPaused(p));
}

// ──────────────────── daysSinceStart / weekNumber ───────────────
{
  const start = new Date("2026-11-03T10:00:00");
  const p = createProgram({
    weeks: 4,
    goal: { kind: "days_per_week", current: 5, target: 2 },
    now: start,
  });

  check("DAY-same-day", daysSinceStart(p, start) === 0);
  check("DAY-plus-1", daysSinceStart(p, new Date("2026-11-04T09:00:00")) === 1);
  check("DAY-plus-7", daysSinceStart(p, new Date("2026-11-10T10:00:00")) === 7);
  check("WEEK-day-0", weekNumber(p, start) === 1);
  check("WEEK-day-6", weekNumber(p, new Date("2026-11-09T10:00:00")) === 1);
  check("WEEK-day-7", weekNumber(p, new Date("2026-11-10T10:00:00")) === 2);
  check("WEEK-caps-at-plan-plus-1", weekNumber(p, new Date("2026-12-30T10:00:00")) === 5);

  check("FINISHED-false", !isFinished(p, new Date("2026-11-30T10:00:00")));
  check("FINISHED-true", isFinished(p, new Date("2026-12-15T10:00:00")));
}

// ──────────────────── progress + last14Days ────────────────────
{
  store.clear();
  const start = new Date("2026-11-01T10:00:00");
  let p = createProgram({
    weeks: 2,
    goal: { kind: "days_per_week", current: 5, target: 2 },
    now: start,
  });
  p = setDay(p, "well", "day 1", new Date("2026-11-01T20:00:00"));
  p = setDay(p, "mixed", "day 2", new Date("2026-11-02T20:00:00"));
  p = setDay(p, "tough", "day 3", new Date("2026-11-03T20:00:00"));
  // day 4 missing on purpose

  const prog = progressFor(p, new Date("2026-11-04T10:00:00"));
  check("PROGRESS-logged-3", prog.loggedDays === 3);
  check("PROGRESS-elapsed-4", prog.elapsedDays === 4);
  check("PROGRESS-total-14", prog.totalDays === 14);
  check("PROGRESS-well-1", prog.wellCount === 1);
  check("PROGRESS-mixed-1", prog.mixedCount === 1);
  check("PROGRESS-tough-1", prog.toughCount === 1);

  const trail = last14Days(p, new Date("2026-11-05T10:00:00"));
  check("TRAIL-length-14", trail.length === 14);
  check("TRAIL-newest-last", trail[13].day === "2026-11-05");
  // Day 1 (2026-11-01) should carry its log
  const d1 = trail.find((t) => t.day === "2026-11-01");
  check("TRAIL-log-present-day1", d1?.log?.state === "well");
  const d4 = trail.find((t) => t.day === "2026-11-04");
  check("TRAIL-missing-day4-null", d4?.log === null);
}

// ─────────────────── export + delete ───────────────────────────
{
  store.clear();
  check("EXPORT-null-when-empty", exportProgram() === null);
  const p = createProgram({ weeks: 2, goal: { kind: "pause_for", days: 7 } });
  const txt = exportProgram();
  check("EXPORT-returns-string", typeof txt === "string");
  check("EXPORT-contains-version", (txt ?? "").includes(`"version": ${PROGRAM_VERSION}`));
  check("EXPORT-parseable", (() => {
    try {
      const o = JSON.parse(txt!);
      return o.version === PROGRAM_VERSION;
    } catch {
      return false;
    }
  })());

  deleteProgram();
  check("DELETE-wipes", readProgram() === null);
  void p;
}

// ─────────────────── all four goal kinds persist ──────────────────
{
  for (const goal of [
    { kind: "days_per_week" as const, current: 5, target: 2 },
    { kind: "sessions_per_day" as const, current: 3, target: 1 },
    { kind: "pause_for" as const, days: 14 },
    { kind: "shift_time" as const, from: "10:00", to: "20:00" },
    { kind: "quit_for_date" as const, targetDate: "2027-01-15" },
  ]) {
    store.clear();
    createProgram({ weeks: 2, goal });
    const r = readProgram();
    check(`GOAL-${goal.kind}-persisted`, r?.goal.kind === goal.kind);
  }
}

// ─────────────── quit-mode helpers (feat/quit-and-tbreak) ──────────
// Mohammed persona from the 15-persona audit. In quit mode the clean-streak
// counter and days-to-target drive the Today view, and reduction-mode helpers
// should not fire for quit goals.
{
  store.clear();
  const start = new Date("2026-11-01T10:00:00");
  let p = createProgram({
    weeks: 2,
    goal: { kind: "quit_for_date", targetDate: "2026-11-15" },
    now: start,
  });
  // Fresh program, no logs: streak counts from startedAt.
  check("QUIT-streak-fresh-day1", cleanStreakDays(p, start) === 1);
  check("QUIT-streak-fresh-day5", cleanStreakDays(p, new Date("2026-11-05T10:00:00")) === 5);
  // Days-to-target counts forward.
  check("QUIT-left-day1", daysUntilTarget(p, start) === 14);
  check("QUIT-left-day14", daysUntilTarget(p, new Date("2026-11-14T10:00:00")) === 1);
  check("QUIT-left-target-day", daysUntilTarget(p, new Date("2026-11-15T10:00:00")) === 0);
  check("QUIT-left-past-target", daysUntilTarget(p, new Date("2026-12-01T10:00:00")) === 0);
  // isFinished tracks the targetDate, not weeks.
  check("QUIT-finished-before", !isFinished(p, new Date("2026-11-14T10:00:00")));
  check("QUIT-finished-at-target", isFinished(p, new Date("2026-11-15T10:00:00")));
  check("QUIT-finished-past", isFinished(p, new Date("2026-12-10T10:00:00")));
  // Tough log resets streak; next day = 1.
  p = setDay(p, "tough", "caved", new Date("2026-11-05T22:00:00"));
  check("QUIT-streak-after-tough-same-day", cleanStreakDays(p, new Date("2026-11-05T23:00:00")) === 0);
  check("QUIT-streak-after-tough-next-day", cleanStreakDays(p, new Date("2026-11-06T10:00:00")) === 1);
  // Non-quit modes always return 0 from the helpers.
  const r = createProgram({ weeks: 2, goal: { kind: "pause_for", days: 7 }, now: start });
  check("QUIT-helpers-noop-on-reduction-streak", cleanStreakDays(r, start) === 0);
  check("QUIT-helpers-noop-on-reduction-left", daysUntilTarget(r, start) === 0);
  void r;
}

// ─────────────────── copy shape (EN + DE) ───────────────────────
for (const locale of LOCALES) {
  const c = PROGRAM_COPY[locale];
  const prefix = `COPY-${locale.toUpperCase()}`;
  check(`${prefix}-metaTitle`, nonEmpty(c.metaTitle));
  check(`${prefix}-metaDescription`, nonEmpty(c.metaDescription));
  check(`${prefix}-introH1`, nonEmpty(c.introH1));
  check(`${prefix}-introBody`, nonEmpty(c.introBody));
  check(`${prefix}-introBullets-3`, c.introBullets.length === 3 && c.introBullets.every(nonEmpty));
  check(`${prefix}-goalOptions-5`, c.goalOptions.length === 5);
  check(`${prefix}-goalOptions-kinds`,
    JSON.stringify(c.goalOptions.map((g) => g.kind).sort()) ===
      JSON.stringify(["days_per_week", "pause_for", "quit_for_date", "sessions_per_day", "shift_time"]));
  check(`${prefix}-weeksOptions-3`, c.weeksOptions.length === 3);
  check(`${prefix}-weeksOptions-values`,
    JSON.stringify(c.weeksOptions.map((w) => w.weeks).sort()) === JSON.stringify([2, 4, 6]));
  check(`${prefix}-logStates-well`, nonEmpty(c.logStates.well.title) && nonEmpty(c.logStates.well.body));
  check(`${prefix}-logStates-mixed`, nonEmpty(c.logStates.mixed.title) && nonEmpty(c.logStates.mixed.body));
  check(`${prefix}-logStates-tough`, nonEmpty(c.logStates.tough.title) && nonEmpty(c.logStates.tough.body));
  check(`${prefix}-settingsH2`, nonEmpty(c.settingsH2));
  check(`${prefix}-deleteConfirm`, nonEmpty(c.deleteConfirm));
  check(`${prefix}-goalLine-days-has-%d`, c.goalLine.days_per_week.includes("%d"));
  check(`${prefix}-goalLine-shift-has-%s`, c.goalLine.shift_time.includes("%s"));
  check(`${prefix}-goalLine-quit-has-%s`, c.goalLine.quit_for_date.includes("%s"));
  check(`${prefix}-quit-streakH2`, nonEmpty(c.quit?.streakH2));
  check(`${prefix}-quit-daysLeftH2`, nonEmpty(c.quit?.daysLeftH2));
  check(`${prefix}-quit-streakResetNote`, nonEmpty(c.quit?.streakResetNote));
  check(`${prefix}-targetDateLabel`, nonEmpty(c.targetDateLabel));
  check(`${prefix}-targetDateHint`, nonEmpty(c.targetDateHint));
  // Ryan's "T-break" rename landed: the pause_for option title must now name
  // the term his search intent used. English cohort uses "t-break";
  // non-English copy keeps the loanword so Marcus / Sophie / Lars still
  // search it in English, which is what they type into Google anyway.
  const pauseTitle = (c.goalOptions.find((g) => g.kind === "pause_for")?.title ?? "").toLowerCase();
  check(`${prefix}-pause-has-tbreak`, pauseTitle.includes("t-break") || pauseTitle.includes("tolerance break"),
    `pause_for title must now mention T-break; got: ${pauseTitle}`);
}

// Posture guard — positive version. The program's whole posture is "not a
// streak, not pass/fail". Rather than banning the words "streak" and
// "failure" from the copy (which would be a false positive, because the
// current copy intentionally uses those words to call them out — "no
// streaks", "not a failure"), assert that each locale's copy EXPLICITLY
// says so somewhere in the intro bullets or in the tough-day state. If a
// future PR waters that down and loses the anti-shame framing, the test
// fails.
// Each locale has its own anti-streak and tough-not-failure phrasing. Lower-
// cased because the search is case-insensitive. "streak" is unchanged across
// languages (Marcus / Sophie / Lars all use the English word).
const POSTURE_PHRASES: Record<string, { antiStreak: string[]; notFailure: string[] }> = {
  en: { antiStreak: ["no streak"], notFailure: ["not a failure"] },
  de: { antiStreak: ["keine streak"], notFailure: ["kein scheitern"] },
  fr: { antiStreak: ["pas de streak"], notFailure: ["pas un échec"] },
  nl: { antiStreak: ["geen streak"], notFailure: ["geen mislukking"] },
};
for (const locale of LOCALES) {
  const c = PROGRAM_COPY[locale];
  const antiStreak = c.introBullets.join(" ").toLowerCase();
  const toughBody = c.logStates.tough.body.toLowerCase();
  const phrases = POSTURE_PHRASES[locale];
  if (!phrases) continue;
  check(
    `POSTURE-${locale}-anti-streak-stated`,
    phrases.antiStreak.some((p) => antiStreak.includes(p)),
    `expected intro bullets to say one of ${JSON.stringify(phrases.antiStreak)}; got: ${c.introBullets.join(" | ")}`
  );
  check(
    `POSTURE-${locale}-tough-not-failure`,
    phrases.notFailure.some((p) => toughBody.includes(p)),
    `expected tough-day body to say one of ${JSON.stringify(phrases.notFailure)}; got: ${c.logStates.tough.body}`
  );
}

// ─────────────────────────────── report ─────────────────────────────
const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Program check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);

// ─────────────────────── helpers ────────────────────────
function minimalProgram(): ReductionProgram {
  return {
    version: PROGRAM_VERSION,
    startedAt: 0,
    weeks: 2,
    goal: { kind: "pause_for", days: 7 },
    logs: {},
    reflections: {},
    pausedAt: null,
  };
}

// Silence unused-import warnings for exports we didn't need
void writeProgram;
void (undefined as unknown as DayState);
