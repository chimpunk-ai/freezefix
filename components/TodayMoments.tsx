"use client";

import { useEffect, useState } from "react";
import {
  deleteMoment,
  momentsForDay,
  MOMENT_TAG_LABEL,
  type Moment,
} from "@/lib/moments";
import { todayISO } from "@/lib/entry";

// Shows the moments the user has added today, newest first, under the "add a
// moment" button on the log screen. Each row has a tiny time, the tag, the
// text, and an "undo" button that removes it.
//
// Why a separate "undo" (not "delete"):
//   - People tap "add a moment" fast. Mistypes happen. "Undo" is friendlier
//     than "delete", and the action is identical: the moment is gone.
//   - No modal, no confirmation. A moment is a quick capture; a one-tap
//     remove matches the one-tap add. If someone needs to clear all history,
//     that's forget-everything in settings, not a many-step moments wipe.
//
// Only shows today's moments on purpose. The week view (WeekInsights) shows
// a count across the week; a full moments timeline on the log would compete
// with the three-tap ritual for attention, which is not what the log is for.
//
// Lives inside LogScreen. Hidden if there are zero moments today — an empty
// list reads as 'this feature is broken' to a new user.

type Props = {
  // Bumped whenever the parent adds a moment; a simple number is enough to
  // force a re-read from storage without plumbing the moment through props.
  refreshKey?: number;
  className?: string;
};

function hhmm(at: number): string {
  const d = new Date(at);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function TodayMoments({ refreshKey = 0, className = "" }: Props) {
  const [items, setItems] = useState<Moment[]>([]);

  useEffect(() => {
    setItems(momentsForDay(todayISO()));
    // Also react to storage changes from another tab (edge case: PWA open on
    // two tabs). Cheap listener; deregistered on unmount.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ff_moments" || e.key === null) {
        setItems(momentsForDay(todayISO()));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshKey]);

  if (!items.length) return null;

  function undo(id: string) {
    if (deleteMoment(id)) {
      setItems(momentsForDay(todayISO()));
    }
  }

  // Newest first in the display, but momentsForDay returns oldest first, so
  // we reverse here rather than in storage (storage order matches add order,
  // which is the right invariant for other callers).
  const reversed = [...items].reverse();

  return (
    <ul className={`mt-4 space-y-2 ${className}`.trim()} aria-label="today's moments">
      {reversed.map((m) => (
        <li
          key={m.id}
          className="flex items-start gap-3 rounded-card border border-line bg-card/50 px-3 py-2.5"
        >
          <div className="mt-[2px] flex shrink-0 flex-col items-center text-11 text-ink-faint">
            <span className="font-mono tabular-nums">{hhmm(m.at)}</span>
            <span className="mt-0.5 rounded-pill border border-line/70 px-1.5 text-10 text-ink-soft">
              {MOMENT_TAG_LABEL[m.tag]}
            </span>
          </div>
          <p className="min-w-0 flex-1 text-14 leading-relaxed text-ink">
            {m.text}
          </p>
          <button
            type="button"
            onClick={() => undo(m.id)}
            aria-label={`undo moment from ${hhmm(m.at)}`}
            className="min-h-9 shrink-0 self-center rounded-pill px-2 text-12 text-ink-faint underline decoration-line underline-offset-4 hover:text-ink-soft"
          >
            undo
          </button>
        </li>
      ))}
    </ul>
  );
}
