"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { last7Days, last7Summary, getAnswer, setToday, todayISO, type DayShape, type Shape } from "@/lib/checkins";
import { readGoal, writeGoal, GOALS, GOAL_LABEL, type GoalId } from "@/lib/goals";
import { allWins } from "@/lib/wins";
import { count as journalCount } from "@/lib/journal";

// Daily companion home — the Home tab in AppNav. The whole dashboard reads only this
// device's localStorage (check-ins, goal, wins log) and never writes anything to a
// server. Mirrors the reference prototype's shape without copying example data: a user
// with no history sees honest empty rows, not fake days.

function greet(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Late one";
}

// Chip for "What would help right now?". Each chip routes to a surface that already
// works today. Nothing is auto-sent to the AI; the user still chooses what to say.
type HelpChip = { label: string; href: string };
const HELP_CHIPS: HelpChip[] = [
  { label: "Craving", href: "/sos" },
  { label: "Unsettled after using", href: "/app" },
  { label: "Used more than I meant", href: "/app" },
  { label: "Overthinking", href: "/app" },
  { label: "Something else — talk to Fix", href: "/app" },
];

export default function HomeDashboard() {
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Hello");
  const [today, setTodayAnswer] = useState<"yes" | "no" | undefined>(undefined);
  const [days, setDays] = useState<DayShape[]>([]);
  const [shape, setShape] = useState<Shape>({ withoutUse: 0, useDays: 0, recorded: 0, deltaVsLastWeek: null });
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [winsCount, setWinsCount] = useState<number>(0);

  // All of this lives on the device. Reading happens once on mount and whenever the
  // user taps a control; nothing refreshes behind their back.
  useEffect(() => {
    const now = new Date();
    setGreeting(greet(now.getHours()));
    setTodayAnswer(getAnswer(todayISO(now)));
    setDays(last7Days(now));
    setShape(last7Summary(now));
    setGoal(readGoal());
    // Entries counted on home = wins (quick saves from inside /app) + journal entries
    // (richer, structured). Keeping them separate in storage but summed on the surface.
    setWinsCount(allWins().length + journalCount());
    setMounted(true);
  }, []);

  function answer(a: "yes" | "no") {
    setToday(a);
    setTodayAnswer(a);
    setDays(last7Days());
    setShape(last7Summary());
  }

  function pickGoal(id: GoalId) {
    // Tap same twice = clear. Nobody should be stuck with a label they didn't mean.
    const next = goal === id ? null : id;
    writeGoal(next);
    setGoal(next);
  }

  return (
    <AppShell>
      {/* Greeting + title */}
      <section className="flex flex-col gap-1">
        <p className="text-sm text-ink-soft">{greeting}</p>
        <h1
          className="text-[clamp(1.9rem,5.6vw,2.4rem)] leading-tight text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
        >
          Today
        </h1>
      </section>

      {/* Daily check-in */}
      <section className="mt-5 rounded-[1.5rem] border border-line bg-card p-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Today's check-in · 10 seconds</p>
        <p className="mt-2 text-lg font-medium text-ink">Did you use cannabis today?</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <CheckinButton
            label="No"
            active={today === "no"}
            onClick={() => answer("no")}
            disabled={!mounted}
          />
          <CheckinButton
            label="Yes"
            active={today === "yes"}
            onClick={() => answer("yes")}
            disabled={!mounted}
          />
        </div>
        {today && (
          <p className="mt-3 text-xs text-ink-faint">
            Logged for today. Tap again to change — nothing is sent anywhere.
          </p>
        )}
      </section>

      {/* Last 7 days */}
      <section className="mt-5 rounded-[1.5rem] border border-line bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Your last 7 days</p>
          {shape.recorded === 0 && (
            <span className="rounded-full border border-line/80 bg-bg px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-faint">
              Nothing yet
            </span>
          )}
        </div>

        {shape.recorded === 0 ? (
          <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-ink-soft">
            This row fills itself from your check-ins. Nothing from before now is counted — it's an
            honest week, not a backfill.
          </p>
        ) : (
          <div className="mt-3 flex items-end gap-6">
            <div className="flex flex-col">
              <span
                className="font-serif text-4xl text-ink tabular-nums"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {shape.withoutUse}
              </span>
              <span className="text-xs text-ink-soft">days without use</span>
            </div>
            <div className="flex flex-col">
              <span
                className="font-serif text-4xl text-ink tabular-nums"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {shape.useDays}
              </span>
              <span className="text-xs text-ink-soft">use days</span>
            </div>
          </div>
        )}

        {/* Donut row — always rendered so the shape is predictable; empty days read as
            muted outlines, use days as mint fills, "yes" days as a terracotta ring. */}
        <ul className="mt-4 flex items-center justify-between gap-1" aria-label="Seven-day check-in row">
          {days.map((d) => (
            <li key={d.day} className="flex flex-col items-center gap-1">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                  d.answer === "yes"
                    ? "border-frost/80 bg-frost/15"
                    : d.answer === "no"
                    ? "border-accent bg-accent/90"
                    : "border-line/80 bg-transparent"
                }`}
                aria-label={
                  d.answer === "yes"
                    ? `Use day on ${d.day}`
                    : d.answer === "no"
                    ? `Day without use on ${d.day}`
                    : `No check-in for ${d.day}`
                }
              />
              <span className="text-[10px] text-ink-faint">{d.initial}</span>
            </li>
          ))}
        </ul>

        {shape.deltaVsLastWeek !== null && (
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {shape.deltaVsLastWeek > 0
              ? `${shape.deltaVsLastWeek} fewer use day${shape.deltaVsLastWeek === 1 ? "" : "s"} than the week before.`
              : shape.deltaVsLastWeek < 0
              ? `${-shape.deltaVsLastWeek} more use day${shape.deltaVsLastWeek === -1 ? "" : "s"} than the week before — nothing to beat yourself up about.`
              : "Same number of use days as the week before."}
          </p>
        )}
      </section>

      {/* Goal picker */}
      <section className="mt-5 rounded-[1.5rem] border border-line bg-card p-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">What's your goal? · optional</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {GOALS.map((id) => {
            const active = goal === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => pickGoal(id)}
                aria-pressed={active}
                className={`min-h-[40px] rounded-full border px-4 py-1.5 text-sm transition active:scale-[0.98] ${
                  active
                    ? "border-accent bg-accent text-accent-ink"
                    : "border-line bg-bg text-ink hover:border-ink-soft"
                }`}
              >
                {GOAL_LABEL[id]}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Lives on this device. Tap again to clear. No streaks, no scoreboard.
        </p>
      </section>

      {/* What would help right now? */}
      <section className="mt-5 rounded-[1.5rem] border border-line bg-card p-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">What would help right now?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {HELP_CHIPS.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="min-h-[40px] rounded-full border border-line bg-bg px-4 py-1.5 text-sm text-ink transition hover:border-ink-soft active:scale-[0.98]"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Primary CTAs: SOS + log */}
      <section className="mt-5 flex flex-col gap-3">
        <Link
          href="/sos"
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-base font-medium text-accent-ink shadow-[0_10px_28px_-14px_rgba(175,215,182,0.55)] active:scale-[0.98]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          Craving SOS
        </Link>
        <Link
          href="/journal"
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-line bg-bg px-5 py-3 text-base text-ink transition hover:border-ink-soft active:scale-[0.98]"
        >
          Log what happened
        </Link>
      </section>

      {/* Journal count — a quiet link, not a nag */}
      <section className="mt-5 flex items-center justify-between gap-3 rounded-[1.25rem] border border-line/70 bg-card/60 px-4 py-3 text-sm text-ink-soft">
        <span>
          {winsCount === 0
            ? "No entries on this device yet."
            : `${winsCount} ${winsCount === 1 ? "entry" : "entries"} in this browser.`}
        </span>
        <Link href="/journal" className="underline-offset-4 hover:text-ink hover:underline">
          Journal →
        </Link>
      </section>
    </AppShell>
  );
}

function CheckinButton({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`min-h-[56px] rounded-2xl border px-5 py-3 text-xl font-medium transition active:scale-[0.98] disabled:opacity-50 ${
        active
          ? "border-accent bg-accent text-accent-ink"
          : "border-line bg-bg text-ink hover:border-ink-soft"
      }`}
    >
      {label}
    </button>
  );
}
