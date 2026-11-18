"use client";

import { useEffect, useState } from "react";
import { MOMENT_TAG_LABEL, recentMoments, type Moment } from "@/lib/moments";

// A compact strip on the Sunday card that acknowledges the moments the user
// added this week, without turning the card into a timeline.
//
// Shape:
//   - Zero moments → the strip is hidden (no empty-state noise).
//   - 1+ moments → "N moments this week" + up to three newest previews
//     with timestamp, tag and a truncated text. Tapping any preview isn't
//     interactive on purpose; the moments are already known to the user.
//     Fix is the surface where you ASK about them.

export default function MomentsThisWeek({ className = "" }: { className?: string }) {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMoments(recentMoments(7));
  }, []);

  if (!mounted || moments.length === 0) return null;

  // Newest first; keep the top three for preview.
  const sorted = [...moments].sort((a, b) => b.at - a.at);
  const previews = sorted.slice(0, 3);

  return (
    <aside
      className={`rounded-sheet border border-line bg-card/70 p-4 md:p-5 ${className}`.trim()}
      aria-label="moments this week"
    >
      <div className="flex items-baseline justify-between">
        <p className="text-11 uppercase tracking-[0.14em] text-ink-faint">moments this week</p>
        <p className="text-12 text-ink-faint tabular-nums">{moments.length}</p>
      </div>
      <ul className="mt-3 space-y-2">
        {previews.map((m) => {
          const d = new Date(m.at);
          const when = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }).toLowerCase();
          return (
            <li key={m.at} className="flex items-start gap-3 text-13 text-ink-soft">
              <span className="w-16 shrink-0 text-ink-faint tabular-nums">{when}</span>
              <span className="min-w-0 flex-1">
                <span className="mr-1 inline-block rounded-pill border border-line/70 px-1.5 text-10 text-ink-faint">
                  {MOMENT_TAG_LABEL[m.tag]}
                </span>
                <span className="text-ink">{m.text.length > 120 ? `${m.text.slice(0, 120).trim()}…` : m.text}</span>
              </span>
            </li>
          );
        })}
      </ul>
      {moments.length > previews.length ? (
        <p className="mt-2 text-12 text-ink-faint">
          {moments.length - previews.length} more. ask fix about them in the sheet below.
        </p>
      ) : null}
    </aside>
  );
}
