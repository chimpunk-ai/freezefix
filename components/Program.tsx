"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import {
  readProgram,
  createProgram,
  setDay,
  clearDay,
  setReflection,
  pause as pauseProgram,
  resume as resumeProgram,
  deleteProgram,
  exportProgram,
  isPaused,
  isFinished,
  weekNumber,
  daysSinceStart,
  mondayOf,
  todayISO,
  progressFor,
  last14Days,
  type ReductionProgram,
  type Goal,
  type Weeks,
  type DayState,
} from "@/lib/program";
import { PROGRAM_COPY } from "@/lib/program-copy";
import { detectRegion } from "@/lib/country";
import { pickLandingLocale, type Locale } from "@/lib/landing-copy";

// Reduction Program UI. Audit P2.8, 3 November 2026.
//
// Full state machine inside a single component — the program is complex
// enough to need coordination between intro / setup / today / reflection /
// finished / paused, but small enough that a reducer-and-sections approach
// reads better than a routing tree. Each section is its own small render
// function at the bottom.
//
// Locale is detected on mount from the browser (same path as /de uses).
// The chat is still English — we don't localize Fix from here — but every
// visible string in the program itself comes from PROGRAM_COPY[locale].

type Phase =
  | { kind: "loading" }
  | { kind: "intro" }
  | { kind: "setup-goal" }
  | { kind: "setup-goal-detail"; goalKind: Goal["kind"] }
  | { kind: "setup-weeks"; goal: Goal }
  | { kind: "today"; program: ReductionProgram }
  | { kind: "finished"; program: ReductionProgram }
  | { kind: "paused"; program: ReductionProgram };

export default function Program() {
  const [locale, setLocale] = useState<Locale>("en");
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });

  // Mount: pick locale from region, load any existing program.
  useEffect(() => {
    const region = detectRegion();
    setLocale(pickLandingLocale(region));
    const p = readProgram();
    if (!p) {
      setPhase({ kind: "intro" });
      return;
    }
    if (isPaused(p)) {
      setPhase({ kind: "paused", program: p });
      return;
    }
    if (isFinished(p)) {
      setPhase({ kind: "finished", program: p });
      return;
    }
    setPhase({ kind: "today", program: p });
  }, []);

  const t = PROGRAM_COPY[locale];

  // ────────────── Program-level actions ──────────────
  const onCreate = (weeks: Weeks, goal: Goal) => {
    const p = createProgram({ weeks, goal });
    setPhase({ kind: "today", program: p });
  };
  const onLogToday = (state: DayState, note: string, program: ReductionProgram) => {
    const next = setDay(program, state, note);
    setPhase({ kind: "today", program: next });
  };
  const onClearToday = (program: ReductionProgram) => {
    const next = clearDay(program, todayISO());
    setPhase({ kind: "today", program: next });
  };
  const onSaveReflection = (text: string, program: ReductionProgram) => {
    const next = setReflection(program, mondayOf(), text);
    setPhase({ kind: "today", program: next });
  };
  const onPause = (program: ReductionProgram) => {
    const next = pauseProgram(program);
    setPhase({ kind: "paused", program: next });
  };
  const onResume = (program: ReductionProgram) => {
    const next = resumeProgram(program);
    if (isFinished(next)) setPhase({ kind: "finished", program: next });
    else setPhase({ kind: "today", program: next });
  };
  const onExport = () => {
    const txt = exportProgram();
    if (!txt) return;
    const blob = new Blob([txt], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `freezefix-plan-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  const onDelete = () => {
    // Native confirm is honest and does not need design review. The copy
    // comes from the locale pack so it never reads as English in a DE
    // user's browser.
    if (window.confirm(t.deleteConfirm)) {
      deleteProgram();
      setPhase({ kind: "intro" });
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-16">
      <PageHeader locale={locale} />

      {phase.kind === "loading" ? (
        // No skeleton — the real content loads in one tick from
        // localStorage, so showing anything would be a flash.
        <div className="min-h-[20rem]" aria-hidden="true" />
      ) : phase.kind === "intro" ? (
        <IntroSection
          t={t}
          onStart={() => setPhase({ kind: "setup-goal" })}
        />
      ) : phase.kind === "setup-goal" ? (
        <SetupPickGoal
          t={t}
          onPick={(goalKind) => setPhase({ kind: "setup-goal-detail", goalKind })}
          onBack={() => setPhase({ kind: "intro" })}
        />
      ) : phase.kind === "setup-goal-detail" ? (
        <SetupGoalDetail
          t={t}
          goalKind={phase.goalKind}
          onBack={() => setPhase({ kind: "setup-goal" })}
          onNext={(goal) => setPhase({ kind: "setup-weeks", goal })}
        />
      ) : phase.kind === "setup-weeks" ? (
        <SetupPickWeeks
          t={t}
          goal={phase.goal}
          onBack={() => setPhase({ kind: "setup-goal-detail", goalKind: phase.goal.kind })}
          onStart={(weeks) => onCreate(weeks, phase.goal)}
        />
      ) : phase.kind === "paused" ? (
        <PausedSection t={t} onResume={() => onResume(phase.program)} />
      ) : phase.kind === "finished" ? (
        <FinishedSection
          t={t}
          onWrap={() => {
            deleteProgram();
            setPhase({ kind: "intro" });
          }}
        />
      ) : (
        // kind === "today"
        <TodaySection
          t={t}
          program={phase.program}
          onLog={(s, n) => onLogToday(s, n, phase.program)}
          onClear={() => onClearToday(phase.program)}
          onReflect={(text) => onSaveReflection(text, phase.program)}
          onPause={() => onPause(phase.program)}
          onExport={onExport}
          onDelete={onDelete}
        />
      )}

      <div className="mt-10">
        <SiteFooter locale={locale} />
      </div>
    </main>
  );
}

// ─────────────────────────────── header ───────────────────────────────

function PageHeader({ locale }: { locale: Locale }) {
  return (
    <header className="flex items-center justify-between py-5">
      <Link
        href={locale === "en" ? "/" : `/${locale}`}
        aria-label="GetFreezeFix home"
        className="flex items-center gap-2.5"
      >
        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-serif text-lg italic text-accent-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          f
        </span>
        <span className="font-serif text-xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
          Fix
        </span>
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link
          href="/help"
          className="flex min-h-[44px] items-center gap-2 rounded-full border border-frost/60 px-4 py-2 text-frost transition hover:border-frost hover:bg-frost/10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {locale === "de" ? "Hilfe jetzt" : locale === "fr" ? "Aide maintenant" : locale === "nl" ? "Hulp nu" : "Get help now"}
        </Link>
      </nav>
    </header>
  );
}

// ─────────────────────────────── intro ───────────────────────────────

type Copy = typeof PROGRAM_COPY["en"];

function IntroSection({ t, onStart }: { t: Copy; onStart: () => void }) {
  return (
    <section className="flex flex-col gap-6 py-6 md:py-10">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">{t.introKicker}</p>
      <h1
        className="text-[clamp(2rem,6vw,3rem)] leading-[1.08] text-ink"
        style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
      >
        {t.introH1}
      </h1>
      <p className="max-w-[52ch] text-base leading-relaxed text-ink">{t.introBody}</p>
      <ul className="flex flex-col gap-2 text-sm leading-relaxed text-ink-soft">
        {t.introBullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap items-center gap-5">
        <button
          type="button"
          onClick={onStart}
          className="group flex min-h-[52px] items-center gap-3 rounded-full bg-accent px-7 py-3 text-lg font-medium text-accent-ink shadow-[0_14px_32px_-14px_rgba(175,215,182,0.55)] transition active:scale-[0.98]"
        >
          {t.introStartLabel}
          <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
            &rarr;
          </span>
        </button>
        <Link
          href="/app"
          className="min-h-[44px] text-base text-ink-soft underline-offset-4 hover:text-ink hover:underline"
        >
          {t.introPauseFixLink}
        </Link>
      </div>
    </section>
  );
}

// ─────────────────────────────── setup: pick goal kind ───────────────

function SetupPickGoal({
  t,
  onPick,
  onBack,
}: {
  t: Copy;
  onPick: (kind: Goal["kind"]) => void;
  onBack: () => void;
}) {
  return (
    <section className="flex flex-col gap-5 py-6">
      <SetupKicker t={t} />
      <h2 className="text-xl text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
        {t.pickGoalH2}
      </h2>
      <p className="text-base leading-relaxed text-ink-soft">{t.pickGoalIntro}</p>
      <ul className="mt-2 flex flex-col gap-3">
        {t.goalOptions.map((g) => (
          <li key={g.kind}>
            <button
              type="button"
              onClick={() => onPick(g.kind)}
              className="w-full rounded-[1.25rem] border border-line bg-card p-4 text-left transition hover:border-accent/70 active:scale-[0.995]"
            >
              <span className="text-base font-semibold text-ink">{g.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{g.body}</span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onBack}
        className="mt-2 self-start text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
      >
        &larr; {t.backLabel}
      </button>
    </section>
  );
}

function SetupKicker({ t }: { t: Copy }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">{t.setupStepKicker}</p>
  );
}

// ─────────────────────── setup: pick numbers for goal ───────────────

function SetupGoalDetail({
  t,
  goalKind,
  onBack,
  onNext,
}: {
  t: Copy;
  goalKind: Goal["kind"];
  onBack: () => void;
  onNext: (goal: Goal) => void;
}) {
  // Sensible defaults per goal kind. The user types their own numbers.
  const [current, setCurrent] = useState<number>(goalKind === "days_per_week" ? 5 : 3);
  const [target, setTarget] = useState<number>(goalKind === "days_per_week" ? 3 : 1);
  const [days, setDays] = useState<number>(7);
  const [fromTime, setFromTime] = useState<string>("12:00");
  const [toTime, setToTime] = useState<string>("20:00");

  const canContinue =
    goalKind === "pause_for"
      ? days >= 1 && days <= 90
      : goalKind === "shift_time"
      ? /^\d{2}:\d{2}$/.test(fromTime) && /^\d{2}:\d{2}$/.test(toTime)
      : current > 0 && target >= 0 && target <= current;

  const onContinue = () => {
    if (!canContinue) return;
    const goal: Goal =
      goalKind === "pause_for"
        ? { kind: "pause_for", days }
        : goalKind === "shift_time"
        ? { kind: "shift_time", from: fromTime, to: toTime }
        : goalKind === "days_per_week"
        ? { kind: "days_per_week", current, target }
        : { kind: "sessions_per_day", current, target };
    onNext(goal);
  };

  return (
    <section className="flex flex-col gap-5 py-6">
      <SetupKicker t={t} />
      <h2 className="text-xl text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
        {t.pickGoalH2}
      </h2>
      <div className="rounded-[1.25rem] border border-line bg-card p-4">
        <p className="text-sm font-semibold text-ink">
          {t.goalOptions.find((g) => g.kind === goalKind)?.title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          {t.goalOptions.find((g) => g.kind === goalKind)?.body}
        </p>
      </div>

      {goalKind === "pause_for" ? (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-ink">
            {t.daysLabel}
            <input
              type="number"
              min={1}
              max={90}
              value={days}
              onChange={(e) => setDays(Math.max(1, Math.min(90, Number(e.target.value) || 0)))}
              className="min-h-[44px] rounded-full border border-line bg-bg px-4 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </label>
        </div>
      ) : goalKind === "shift_time" ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
            {t.fromTimeLabel}
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="min-h-[44px] rounded-full border border-line bg-bg px-4 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
            {t.toTimeLabel}
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="min-h-[44px] rounded-full border border-line bg-bg px-4 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </label>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
            {t.currentLabel}
            <input
              type="number"
              min={0}
              max={20}
              value={current}
              onChange={(e) => setCurrent(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
              className="min-h-[44px] rounded-full border border-line bg-bg px-4 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
            {t.targetLabel}
            <input
              type="number"
              min={0}
              max={20}
              value={target}
              onChange={(e) => setTarget(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
              className="min-h-[44px] rounded-full border border-line bg-bg px-4 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </label>
        </div>
      )}

      <div className="mt-2 flex items-center gap-5">
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="min-h-[48px] rounded-full bg-accent px-6 py-3 text-base font-medium text-accent-ink transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t.nextLabel}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
        >
          &larr; {t.backLabel}
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────── setup: pick weeks ───────────────────────

function SetupPickWeeks({
  t,
  onBack,
  onStart,
}: {
  t: Copy;
  goal: Goal;
  onBack: () => void;
  onStart: (weeks: Weeks) => void;
}) {
  return (
    <section className="flex flex-col gap-5 py-6">
      <SetupKicker t={t} />
      <h2 className="text-xl text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
        {t.pickWeeksH2}
      </h2>
      <p className="text-base leading-relaxed text-ink-soft">{t.pickWeeksIntro}</p>
      <ul className="mt-2 flex flex-col gap-3">
        {t.weeksOptions.map((w) => (
          <li key={w.weeks}>
            <button
              type="button"
              onClick={() => onStart(w.weeks)}
              className="w-full rounded-[1.25rem] border border-line bg-card p-4 text-left transition hover:border-accent/70 active:scale-[0.995]"
            >
              <span className="text-base font-semibold text-ink">{w.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{w.body}</span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onBack}
        className="mt-2 self-start text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
      >
        &larr; {t.backLabel}
      </button>
    </section>
  );
}

// ─────────────────────────────── today ───────────────────────────────

function TodaySection({
  t,
  program,
  onLog,
  onClear,
  onReflect,
  onPause,
  onExport,
  onDelete,
}: {
  t: Copy;
  program: ReductionProgram;
  onLog: (state: DayState, note: string) => void;
  onClear: () => void;
  onReflect: (text: string) => void;
  onPause: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const day = todayISO();
  const existing = program.logs[day];
  const totalDays = program.weeks * 7;
  const dayNum = daysSinceStart(program) + 1;
  const week = weekNumber(program);
  const progress = progressFor(program);
  const trail = useMemo(() => last14Days(program), [program]);

  // Weekly reflection: show on the first time the user opens /program in a
  // new program-week, if they have logged at least once. Replace with the
  // actual reflection text if already saved.
  const weekMonday = mondayOf();
  const reflection = program.reflections[weekMonday] ?? "";

  // Local state for the log form.
  const [note, setNote] = useState<string>(existing?.note ?? "");
  const [reflectionText, setReflectionText] = useState<string>(reflection);

  return (
    <section className="flex flex-col gap-6 py-6">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
        {sprintf(t.todayKicker, dayNum, totalDays)}
      </p>
      <h1
        className="text-[clamp(2rem,6vw,3rem)] leading-[1.08] text-ink"
        style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
      >
        {t.todayH1}
      </h1>

      {/* Plan line */}
      <div className="rounded-[1.25rem] border border-line bg-card p-4">
        <p className="text-xs uppercase tracking-wider text-ink-soft">{t.todayGoalPrefix}</p>
        <p className="mt-1 text-base text-ink">{goalDescription(t, program.goal)}</p>
      </div>

      {/* Log for today */}
      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-line bg-card p-5 sm:p-6">
        <h2 className="text-lg text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          {t.logQuestion}
        </h2>
        {existing ? (
          <>
            <p className="text-sm text-ink-soft">
              {t.loggedLabel}: <strong className="text-ink">{t.logStates[existing.state].title}</strong>
            </p>
            {existing.note ? (
              <p className="rounded-xl border border-line bg-bg/40 px-3 py-2 text-sm leading-relaxed text-ink">
                &ldquo;{existing.note}&rdquo;
              </p>
            ) : null}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClear}
                className="min-h-[40px] rounded-full border border-line px-4 text-sm text-ink-soft transition hover:text-ink"
              >
                {t.clearLabel}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {(["well", "mixed", "tough"] as DayState[]).map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => onLog(state, note)}
                  className="w-full rounded-[1.25rem] border border-line bg-bg/40 p-4 text-left transition hover:border-accent/70 active:scale-[0.995]"
                >
                  <span className="text-base font-semibold text-ink">{t.logStates[state].title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
                    {t.logStates[state].body}
                  </span>
                </button>
              ))}
            </div>
            <label htmlFor="log-note" className="mt-2 text-sm text-ink">
              {t.noteLabel}
            </label>
            <input
              id="log-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.notePlaceholder}
              maxLength={240}
              className="min-h-[44px] rounded-full border border-line bg-bg px-4 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </>
        )}
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-line bg-card p-5 sm:p-6">
        <h2 className="text-lg text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          {t.progressH2}
        </h2>
        <p className="text-sm text-ink-soft">
          {sprintf(t.progressLogged, progress.loggedDays, progress.elapsedDays)}
        </p>
        <div
          className="mt-1 grid grid-cols-14 gap-1.5"
          style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
          aria-label={t.progressH2}
        >
          {trail.map(({ day: d, log }) => (
            <div
              key={d}
              title={d}
              className={`aspect-square rounded-md ${
                log === null
                  ? "bg-bg/50 border border-line"
                  : log.state === "well"
                  ? "bg-accent/70"
                  : log.state === "mixed"
                  ? "bg-frost/60"
                  : "bg-ink-faint/50"
              }`}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-soft">
          <LegendDot className="bg-accent/70" label={t.progressStateLegend.well} />
          <LegendDot className="bg-frost/60" label={t.progressStateLegend.mixed} />
          <LegendDot className="bg-ink-faint/50" label={t.progressStateLegend.tough} />
        </div>
      </div>

      {/* Weekly reflection: show on the first day of each program-week once
          the user has logged at least once. */}
      {week >= 1 && progress.loggedDays >= 1 ? (
        <div className="flex flex-col gap-3 rounded-[1.5rem] border border-line bg-card p-5 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
            {t.reflectionKicker}
          </p>
          <h2 className="text-lg text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            {t.reflectionH2}
          </h2>
          <p className="text-sm leading-relaxed text-ink-soft">{t.reflectionIntro}</p>
          <input
            type="text"
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder={t.reflectionPlaceholder}
            maxLength={400}
            className="min-h-[44px] rounded-full border border-line bg-bg px-4 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onReflect(reflectionText)}
              disabled={!reflectionText.trim()}
              className="min-h-[40px] rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {reflection ? t.reflectionDoneLabel : t.reflectionSaveLabel}
            </button>
            <button
              type="button"
              onClick={() => onReflect("")}
              className="min-h-[40px] rounded-full border border-line px-4 text-sm text-ink-soft transition hover:text-ink"
            >
              {t.reflectionSkipLabel}
            </button>
          </div>
        </div>
      ) : null}

      {/* Program settings */}
      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-line bg-card p-5 sm:p-6">
        <h2 className="text-lg text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          {t.settingsH2}
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onPause}
            className="min-h-[40px] rounded-full border border-line px-4 text-sm text-ink-soft transition hover:text-ink"
          >
            {t.pauseLabel}
          </button>
          <button
            type="button"
            onClick={onExport}
            className="min-h-[40px] rounded-full border border-line px-4 text-sm text-ink-soft transition hover:text-ink"
          >
            {t.exportLabel}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="min-h-[40px] rounded-full border border-frost/50 px-4 text-sm text-frost transition hover:border-frost hover:bg-frost/10"
          >
            {t.deleteLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-sm ${className}`} />
      {label}
    </span>
  );
}

// ─────────────────────────────── paused ───────────────────────────────

function PausedSection({ t, onResume }: { t: Copy; onResume: () => void }) {
  return (
    <section className="flex flex-col gap-5 py-6 md:py-10">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">{t.pausedKicker}</p>
      <h1
        className="text-[clamp(2rem,6vw,3rem)] leading-[1.08] text-ink"
        style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
      >
        {t.pausedH1}
      </h1>
      <p className="max-w-[52ch] text-base leading-relaxed text-ink">{t.pausedBody}</p>
      <button
        type="button"
        onClick={onResume}
        className="mt-2 self-start rounded-full bg-accent px-6 py-3 text-base font-medium text-accent-ink transition active:scale-[0.98]"
      >
        {t.resumeLabel}
      </button>
    </section>
  );
}

// ─────────────────────────────── finished ─────────────────────────────

function FinishedSection({ t, onWrap }: { t: Copy; onWrap: () => void }) {
  return (
    <section className="flex flex-col gap-5 py-6 md:py-10">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">{t.finishedKicker}</p>
      <h1
        className="text-[clamp(2rem,6vw,3rem)] leading-[1.08] text-ink"
        style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
      >
        {t.finishedH1}
      </h1>
      <p className="max-w-[52ch] text-base leading-relaxed text-ink">{t.finishedBody}</p>
      <div className="mt-2 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={onWrap}
          className="min-h-[48px] rounded-full border border-line px-6 py-3 text-base text-ink-soft transition hover:text-ink"
        >
          {t.finishedWrapLabel}
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────── helpers ──────────────────────────────

/** Tiny printf — only supports %d (number) and %s (string), in order. */
function sprintf(template: string, ...args: Array<number | string>): string {
  let i = 0;
  return template.replace(/%d|%s/g, (m) => {
    const v = args[i++];
    if (m === "%d") return String(Math.trunc(Number(v)));
    return String(v ?? "");
  });
}

function goalDescription(t: Copy, g: Goal): string {
  const line = t.goalLine;
  switch (g.kind) {
    case "days_per_week":
      return sprintf(line.days_per_week, g.current, g.target);
    case "sessions_per_day":
      return sprintf(line.sessions_per_day, g.current, g.target);
    case "pause_for":
      return sprintf(line.pause_for, g.days);
    case "shift_time":
      return sprintf(line.shift_time, g.from, g.to);
  }
}
