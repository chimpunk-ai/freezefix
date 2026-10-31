"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { allWins } from "@/lib/wins";
import { barPct, computePatterns, winsByWeek, type Patterns } from "@/lib/patterns";

// Private, on-device pattern view.
//
// Everything on this page is computed from what the person already saved on their own
// phone — the wins log, the recent scenario cards, the moment log, and the local visit
// count. Nothing is sent anywhere and nothing new is written. Deliberately quiet: this
// is a reflection surface, not a scoreboard. Streaks are shown only when they help; the
// page never scolds about a break.

const MOMENT_LABEL: Record<string, string> = {
  people: "Around people",
  alone: "Alone and spiralling",
  task: "Can't start a task",
  reply: "Can't reply",
};

function labelFor(id: string): string {
  if (MOMENT_LABEL[id]) return MOMENT_LABEL[id];
  // Scenario ids come through as kebab-case; make them readable without inventing meaning.
  return id.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PatternsPage() {
  const [data, setData] = useState<Patterns | null>(null);
  const [weeks, setWeeks] = useState<{ label: string; count: number }[]>([]);
  useEffect(() => {
    setData(computePatterns());
    setWeeks(winsByWeek(allWins()));
  }, []);

  // Keep the hooks stable: compute once per data change, never conditionally.
  const maxWeekday = useMemo(() => Math.max(1, ...(data?.byWeekday ?? []).map((d) => d.count)), [data]);
  const maxHour = useMemo(() => Math.max(1, ...(data?.byHour ?? []).map((d) => d.count)), [data]);
  const maxMoment = useMemo(() => Math.max(1, ...(data?.topMoments ?? []).map((m) => m.count)), [data]);
  const maxWeek = useMemo(() => Math.max(1, ...weeks.map((w) => w.count)), [weeks]);

  const empty = !data || (data.totalWins === 0 && data.topMoments.length === 0);

  return (
    <AppShell wide>
      {/* Hero */}
      <section className="flex flex-col gap-3 pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Patterns · on this device only</p>
        <h1
          className="text-[clamp(2rem,6vw,3rem)] leading-[1.08] text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
        >
          A quiet look at what keeps coming up.
        </h1>
        <p className="max-w-[52ch] text-base leading-relaxed text-ink-soft">
          Nothing on this page is sent anywhere. Fix reads what you already saved on this phone — the wins
          and the moments you picked — and groups it so you can notice patterns yourself. No streaks to defend.
          No scoreboard. If this device has nothing yet, the page is honestly empty.
        </p>
      </section>

      {empty && (
        <section className="rounded-[1.5rem] border border-line bg-card p-6 text-ink-soft">
          <h2 className="mb-2 font-serif text-xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
            Nothing to show yet
          </h2>
          <p className="mb-4 max-w-[48ch] text-sm leading-relaxed">
            Use Fix for a few moments and save a win or two. This page will fill itself from what you keep —
            still on your phone, still nowhere else.
          </p>
          <Link
            href="/app"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-medium text-accent-ink"
          >
            Open Fix
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      )}

      {!empty && data && (
        <div className="grid gap-6 pt-4 md:grid-cols-[1.1fr_1fr]">
          {/* Totals card */}
          <section className="rounded-[1.5rem] border border-line bg-card p-6">
            <h2
              className="mb-5 font-serif text-xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Overall
            </h2>
            <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Stat label="Wins saved" value={data.totalWins} />
              <Stat label="Active days" value={data.activeDays} />
              <Stat label="App opens" value={data.visits} />
              <Stat
                label="Longest streak"
                value={data.longestStreak}
                sub={data.currentStreak >= 2 ? `${data.currentStreak}-day run now` : undefined}
              />
            </dl>
            <p className="mt-5 text-xs leading-relaxed text-ink-faint">
              Streaks are shown as reflection, not pressure. If you miss a day, nothing resets anything.
            </p>
          </section>

          {/* Last four weeks sparkline-style */}
          <section className="rounded-[1.5rem] border border-line bg-card p-6">
            <h2
              className="mb-5 font-serif text-xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Last four weeks
            </h2>
            <ul className="flex items-end justify-between gap-3" aria-label="Wins per week, last four weeks">
              {weeks.map((w) => {
                const h = Math.max(w.count > 0 ? 8 : 2, (w.count / maxWeek) * 100);
                return (
                  <li key={w.label} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-md bg-accent/70"
                      style={{ height: `${h}px`, minHeight: "2px" }}
                      aria-hidden="true"
                    />
                    <span className="text-[11px] text-ink-faint">{w.label}</span>
                    <span className="text-sm font-medium text-ink">{w.count}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Moments — most common */}
          <section className="rounded-[1.5rem] border border-line bg-card p-6 md:col-span-2">
            <h2
              className="mb-5 font-serif text-xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Moments that come up most
            </h2>
            {data.topMoments.length === 0 ? (
              <p className="text-sm text-ink-soft">Nothing marked yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {data.topMoments.slice(0, 6).map((m) => (
                  <li key={m.moment} className="flex items-center gap-4">
                    <span className="w-40 flex-shrink-0 truncate text-sm text-ink">{labelFor(m.moment)}</span>
                    <span className="relative h-3 flex-1 overflow-hidden rounded-full bg-chip/50">
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 rounded-full bg-accent"
                        style={{ width: `${barPct(m.count, maxMoment)}%` }}
                      />
                    </span>
                    <span className="w-10 text-right text-sm tabular-nums text-ink-soft">{m.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Weekday distribution */}
          <section className="rounded-[1.5rem] border border-line bg-card p-6">
            <h2
              className="mb-5 font-serif text-xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              By day of week
            </h2>
            <ul className="flex items-end justify-between gap-2" aria-label="Wins by day of week">
              {data.byWeekday.map((d) => {
                const h = (d.count / maxWeekday) * 100;
                return (
                  <li key={d.day} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-md bg-accent/60"
                      style={{ height: `${Math.max(d.count > 0 ? 8 : 2, h)}px`, minHeight: "2px" }}
                      aria-hidden="true"
                    />
                    <span className="text-[11px] text-ink-faint">{d.day}</span>
                    <span className="text-xs tabular-nums text-ink-soft">{d.count}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Hour-of-day distribution — only shown if there's any hour data */}
          <section className="rounded-[1.5rem] border border-line bg-card p-6">
            <h2
              className="mb-5 font-serif text-xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              By time of day
            </h2>
            {data.byHour.every((h) => h.count === 0) ? (
              <p className="text-sm text-ink-soft">
                Fix starts logging the time once you open it in a new session. Nothing stored from before now.
              </p>
            ) : (
              <ul className="grid grid-cols-12 items-end gap-1" aria-label="Opens by hour">
                {data.byHour.map((h) => {
                  const height = (h.count / maxHour) * 100;
                  const show = h.hour % 3 === 0;
                  return (
                    <li key={h.hour} className="flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm bg-accent/60"
                        style={{ height: `${Math.max(h.count > 0 ? 6 : 2, height)}px`, minHeight: "2px" }}
                        aria-hidden="true"
                      />
                      {show && <span className="text-[10px] text-ink-faint">{h.hour}</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}

    </AppShell>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-serif text-3xl text-ink tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </span>
      <span className="text-xs uppercase tracking-wider text-ink-faint">{label}</span>
      {sub && <span className="text-[11px] text-ink-soft">{sub}</span>}
    </div>
  );
}
