"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { currentWeekDays, weekDays, weekStartISO, type DayShape } from "@/lib/checkins";
import { readWeeklyGoal, type WeeklyGoal } from "@/lib/weekly-goal";
import { summarizeWeek } from "@/lib/mirror";

export default function InsightsPage() {
  const [mounted, setMounted] = useState(false);
  const [goal, setGoal] = useState<WeeklyGoal | null>(null);
  const [thisWeek, setThisWeek] = useState<DayShape[]>([]);
  const [archive, setArchive] = useState<Array<{ start: string; days: DayShape[] }>>([]);

  useEffect(() => {
    const now = new Date();
    setGoal(readWeeklyGoal());
    const current = currentWeekDays(now);
    setThisWeek(current);
    const currentStart = weekStartISO(now);
    const [year, month, day] = currentStart.split("-").map(Number);
    const monday = new Date(year, month - 1, day, 12);
    const past: Array<{ start: string; days: DayShape[] }> = [];
    for (let offset = 1; offset <= 12; offset++) {
      const start = new Date(monday);
      start.setDate(monday.getDate() - offset * 7);
      const startKey = localISO(start);
      const days = weekDays(startKey);
      if (days.some((item) => item.answer)) past.push({ start: startKey, days });
    }
    setArchive(past);
    setMounted(true);
  }, []);

  return (
    <AppShell wide>
      <header className="flex flex-col gap-3 pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">The weekly mirror · on this device only</p>
        <h1 className="text-[clamp(2rem,6vw,3rem)] leading-tight text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>A quieter look back.</h1>
        <p className="max-w-[60ch] text-base leading-relaxed text-ink-soft">A plain-language view of the check-ins you chose to keep. No causal claims, grades or streaks. Your daily log is never uploaded by Fix.</p>
      </header>

      {!mounted ? null : (
        <div className="flex flex-col gap-5">
          <WeekCard title="This week so far" days={thisWeek} goal={goal} />
          <section className="rounded-[1.25rem] border border-line bg-card p-5 sm:p-6">
            <h2 className="text-xl text-ink" style={{ fontFamily: "var(--font-display)" }}>Past weeks</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">Weeks appear here when you have at least one saved check-in. An empty week stays out of view; it is not counted as a zero.</p>
            {archive.length ? (
              <div className="mt-5 flex flex-col gap-3">
                {archive.map(({ start, days }) => (
                  <WeekCard key={start} title={formatWeek(start)} days={days} goal={null} compact />
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-sm text-ink-faint">No past weeks saved yet. A check-in takes a few seconds.</p>
            )}
          </section>
          <div className="flex flex-wrap gap-3">
            <Link href="/home" className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-accent-ink">Back to tonight’s log</Link>
            <Link href="/settings" className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm text-ink">Manage or delete data</Link>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function WeekCard({ title, days, goal, compact = false }: { title: string; days: DayShape[]; goal: WeeklyGoal | null; compact?: boolean }) {
  const summary = summarizeWeek(days, goal);
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const recorded = days.filter((day) => day.answer).length;
  return (
    <article className="rounded-[1.25rem] border border-line bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg text-ink" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
        <span className="text-xs text-ink-faint">{recorded} of 7 days logged</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{summary.sentence}</p>
      <div className={`mt-4 grid grid-cols-7 gap-2 ${compact ? "max-w-md" : "max-w-lg"}`} aria-label={`${title} use and mood ratings`}>
        {days.map((day, index) => (
          <div key={day.day} className="flex flex-col items-center gap-1.5" title={`${labels[index]} ${day.day}: ${day.answer === "yes" ? "use logged" : day.answer === "no" ? "no use logged" : "no check-in"}${day.mood ? `, mood ${day.mood}/5` : ""}`}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl border text-[10px] ${day.answer === "yes" ? "border-accent/60 bg-accent/10 text-ink" : day.answer === "no" ? "border-accent/30 bg-accent/25 text-ink" : "border-line text-ink-faint"}`} aria-hidden="true">{day.mood ? `${day.mood}/5` : day.answer === "yes" ? "Y" : day.answer === "no" ? "N" : "·"}</span>
            <span className="text-[10px] text-ink-faint">{labels[index]}</span>
          </div>
        ))}
      </div>
      {!compact && goal ? <p className="mt-4 rounded-xl border border-line/70 px-3 py-2 text-sm text-ink-soft">Your thing: {goal.text} · checked off {summary.goalDone} of {goal.target} times</p> : null}
      {summary.moodDifference ? <p className="mt-3 text-xs leading-relaxed text-ink-faint">Average mood: {summary.moodDifference.useAverage} on use days and {summary.moodDifference.noUseAverage} on days without use ({summary.moodDifference.useN}/{summary.moodDifference.noUseN} ratings). Descriptive only, not a cause.</p> : null}
      <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">{summary.caveat}</p>
    </article>
  );
}

function formatWeek(start: string): string {
  const [year, month, day] = start.split("-").map(Number);
  const monday = new Date(year, month - 1, day, 12);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${monday.toLocaleDateString(undefined, fmt)}–${sunday.toLocaleDateString(undefined, fmt)}`;
}

function localISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
