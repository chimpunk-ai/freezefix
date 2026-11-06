import type { Mood } from "@/lib/entry";

// Five drawn faces, not emoji. Slightly abstract, warm, one line of ink each.
// The mouth is the only thing that changes, which is all a face needs.

const MOUTH: Record<Mood, string> = {
  1: "M8.6 17.4c1.1-1.5 2.4-2.2 3.4-2.2s2.3.7 3.4 2.2",
  2: "M8.9 16.9c1.1-1 2.3-1.4 3.1-1.4s2 .4 3.1 1.4",
  3: "M9 16.6h6",
  4: "M8.9 15.9c1.1 1 2.3 1.4 3.1 1.4s2-.4 3.1-1.4",
  5: "M8.6 15.2c1.1 1.6 2.4 2.3 3.4 2.3s2.3-.7 3.4-2.3",
};

export function MoodFace({
  mood,
  size = 28,
  tone = "currentColor",
  filled = false,
}: {
  mood: Mood;
  size?: number;
  tone?: string;
  filled?: boolean;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <circle cx="12" cy="12" r="9.25" stroke={tone} strokeWidth="1.4" fill={filled ? tone : "none"} fillOpacity={filled ? 0.12 : 0} />
      <circle cx="9.1" cy="10.2" r="1.05" fill={tone} />
      <circle cx="14.9" cy="10.2" r="1.05" fill={tone} />
      <path d={MOUTH[mood]} stroke={tone} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
