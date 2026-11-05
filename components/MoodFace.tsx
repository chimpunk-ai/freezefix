"use client";

import type { Mood } from "@/lib/checkins";

const LABELS: Record<Mood, string> = {
  1: "Rough",
  2: "Low",
  3: "In the middle",
  4: "Pretty good",
  5: "Good",
};

export function MoodFace({
  mood,
  selected = false,
  onClick,
  size = 34,
}: {
  mood: Mood;
  selected?: boolean;
  onClick?: () => void;
  size?: number;
}) {
  const mouth = {
    1: "M24 36 Q32 29 40 36",
    2: "M24 35 Q32 31 40 35",
    3: "M24 34 H40",
    4: "M24 32 Q32 38 40 32",
    5: "M24 30 Q32 39 40 30",
  }[mood];
  const face = (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="2" opacity="0.75" />
      <circle cx="24" cy="25" r="2" fill="currentColor" />
      <circle cx="40" cy="25" r="2" fill="currentColor" />
      <path d={mouth} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );

  if (!onClick) return <span title={LABELS[mood]} aria-label={LABELS[mood]}>{face}</span>;
  return (
    <button
      type="button"
      aria-label={LABELS[mood]}
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-14 min-w-14 flex-col items-center justify-center gap-1 rounded-2xl border px-1.5 py-2 text-ink transition-colors ${
        selected ? "border-accent bg-accent/15 text-accent" : "border-line bg-bg hover:border-ink-soft"
      }`}
    >
      {face}
      <span className="text-[10px] leading-none text-ink-soft">{LABELS[mood]}</span>
    </button>
  );
}
