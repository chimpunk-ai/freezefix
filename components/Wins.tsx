"use client";

import { useEffect, useState } from "react";
import { allWins, removeWin, thisWeek, type Win, type WeekSummary } from "@/lib/wins";

// The wins screen and the weekly card. Plain language, no scores, no streaks, no graphs
// of someone's worst week. If there's nothing logged yet, it says so honestly rather than
// showing a fake example.

export default function Wins({ onBack, onAdd }: { onBack: () => void; onAdd: () => void }) {
  const [wins, setWins] = useState<Win[]>([]);
  const [week, setWeek] = useState<WeekSummary | null>(null);

  useEffect(() => {
    setWins(allWins());
    setWeek(thisWeek());
  }, []);

  function drop(i: number) {
    removeWin(i);
    setWins(allWins());
    setWeek(thisWeek());
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-3xl font-extrabold text-ink">Stuff you got through</h1>
      </div>

      {week && (
        <div className="rounded-[1.75rem] border border-line bg-card p-5">
          <p className="text-sm uppercase tracking-widest text-ink-faint">Your week</p>
          <p className="mt-2 text-xl leading-snug text-ink">
            {week.count === 1
              ? "One thing you got through this week."
              : `${week.count} things you got through, across ${week.days} ${week.days === 1 ? "day" : "days"}.`}
          </p>
          {week.topMoment && (
            <p className="mt-2 text-base leading-relaxed text-ink-soft">
              Mostly {week.topMoment.toLowerCase()}. Worth knowing about yourself.
            </p>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto">
        {wins.length === 0 ? (
          <div className="rounded-[1.75rem] border border-line border-dashed bg-card p-6 text-center">
            <p className="text-lg leading-relaxed text-ink-soft">Nothing here yet.</p>
            <p className="mt-2 text-base leading-relaxed text-ink-faint">
              When something works, save it. Sent the message, went anyway, started the thing. Small counts.
            </p>
          </div>
        ) : (
          wins.map((w, i) => (
            <div key={`${w.day}-${i}`} className="flex items-start gap-3 rounded-2xl border border-line bg-card p-4">
              <span className="mt-0.5 text-lg" aria-hidden="true">
                ✓
              </span>
              <span className="flex-1">
                <span className="block text-lg leading-snug text-ink">{w.text}</span>
                <span className="mt-0.5 block text-sm text-ink-faint">{friendlyDay(w.day)}</span>
              </span>
              <button
                onClick={() => drop(i)}
                aria-label={`Delete: ${w.text}`}
                className="shrink-0 rounded-full bg-chip px-3 py-1.5 text-sm text-ink-soft"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onAdd}
          className="w-full rounded-[1.75rem] bg-accent px-5 py-4 text-lg font-bold text-accent-ink transition active:scale-[0.98]"
        >
          Add one
        </button>
        <button onClick={onBack} className="self-center text-base text-ink-soft underline underline-offset-4">
          Back
        </button>
        <p className="text-center text-sm leading-relaxed text-ink-faint">
          All of this stays on your phone. We never see it.
        </p>
      </div>
    </section>
  );
}

function friendlyDay(day: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (day === today) return "Today";
  if (day === yesterday) return "Yesterday";
  // Parsed as UTC noon so a timezone can't shift the date a day either way.
  return new Date(`${day}T12:00:00Z`).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
