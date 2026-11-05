"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DayShape, Mood } from "@/lib/checkins";
import type { WeeklyGoal } from "@/lib/weekly-goal";
import { moodLabel, summarizeWeek } from "@/lib/mirror";
import { MoodFace } from "@/components/MoodFace";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeeklyMirrorSheet({
  open,
  onClose,
  days,
  goal,
  petName,
}: {
  open: boolean;
  onClose: () => void;
  days: DayShape[];
  goal: WeeklyGoal | null;
  petName: string;
}) {
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
      return;
    }
    if (!visible) return;
    setClosing(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [open, visible]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!visible) return null;
  const summary = summarizeWeek(days, goal);
  const weekEnd = new Date();
  const isSunday = weekEnd.getDay() === 0;
  const title = petName ? `${petName}, here’s your week.` : "Here’s your week.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-5"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="weekly-mirror-title"
        className={`ff-mirror-sheet${closing ? " ff-mirror-sheet-out" : ""} relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[1.25rem] border border-line bg-card px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.6)] sm:rounded-[1.25rem] sm:px-8 sm:pb-8`}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-ink-faint/30 sm:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">Fix · weekly mirror</p>
            <h2 id="weekly-mirror-title" className="mt-2 text-2xl leading-tight text-ink" style={{ fontFamily: "var(--font-display)" }}>
              {title}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close weekly mirror" className="min-h-10 min-w-10 rounded-full border border-line text-ink-soft hover:text-ink">×</button>
        </div>

        <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-ink">{summary.sentence}</p>

        <section className="mt-6 rounded-2xl border border-line bg-bg/60 p-4 sm:p-5" aria-label="This week's daily check-ins">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">{isSunday ? "This week" : "This week so far"}</p>
            <p className="text-xs text-ink-faint">{summary.recorded} of 7 days logged</p>
          </div>
          <ul className="ff-mirror-graph mt-4 grid grid-cols-7 gap-2" aria-label="Seven-day use and mood chart">
            {days.map((day, index) => {
              const state = day.answer === "yes" ? "use logged" : day.answer === "no" ? "no use logged" : "no check-in";
              const moodText = day.mood ? `, mood ${moodLabel(day.mood as Mood).toLowerCase()}` : "";
              return (
                <li key={day.day} className="flex min-w-0 flex-col items-center gap-2">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${day.answer === "yes" ? "border-accent/70 bg-accent/10" : day.answer === "no" ? "border-accent/35 bg-accent/20" : "border-line bg-transparent"}`} aria-label={`${WEEKDAYS[index]}: ${state}${moodText}`} title={`${WEEKDAYS[index]}: ${state}${moodText}`}>
                    {day.mood ? <MoodFace mood={day.mood} size={28} /> : <span aria-hidden="true" className="text-xs text-ink-faint">{day.answer === "yes" ? "Y" : day.answer === "no" ? "N" : "·"}</span>}
                  </span>
                  <span className="text-[10px] text-ink-faint">{WEEKDAYS[index]}</span>
                  <span className="text-[9px] uppercase tracking-wide text-ink-faint">{day.answer === "yes" ? "use" : day.answer === "no" ? "no use" : "open"}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-ink-faint" aria-label="Chart legend">
            <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-accent/70 bg-accent/10" aria-hidden="true" /> Use logged</span>
            <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-accent/35 bg-accent/20" aria-hidden="true" /> No use logged</span>
            <span>Open = no check-in</span>
          </div>
        </section>

        {summary.moodDifference ? (
          <p className="mt-5 rounded-xl border border-line/70 px-4 py-3 text-sm leading-relaxed text-ink-soft">
            Your mood ratings averaged {summary.moodDifference.useAverage} on use days and {summary.moodDifference.noUseAverage} on days without use ({summary.moodDifference.useN} and {summary.moodDifference.noUseN} ratings). That’s a description of the days you logged, not a cause.
          </p>
        ) : (
          <p className="mt-5 text-xs leading-relaxed text-ink-faint">Mood comparisons appear only when there are at least three ratings in each group. No comparison is made from a small sample.</p>
        )}

        {goal ? (
          <section className="mt-5 rounded-2xl border border-line bg-bg/50 p-4" aria-label="Weekly goal progress">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Your thing</p>
            <p className="mt-2 text-base text-ink">You wanted to {goal.text}. You checked it off {summary.goalDone} of {goal.target} {goal.target === 1 ? "time" : "times"} so far.</p>
            <p className="mt-1 text-xs text-ink-faint">A direction, not a grade. Only you know what it means.</p>
          </section>
        ) : null}

        <p className="mt-5 text-xs leading-relaxed text-ink-faint">{summary.caveat}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/patterns" onClick={onClose} className="min-h-11 rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-ink">Past weeks</Link>
          <Link href="/fix" onClick={onClose} className="min-h-11 rounded-full border border-line px-5 py-3 text-sm text-ink">Open Fix</Link>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">Fix won’t see this log automatically. Share only what you choose to type.</p>
      </section>
    </div>
  );
}
