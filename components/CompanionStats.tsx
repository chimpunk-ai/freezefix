import type { Stat, StatKey } from "@/lib/companion";

// The five attribute meters (lib/companion.ts). Two sizes:
//   - "full": onboarding's reveal — bigger, with a caption slot per stat so
//     the original six onboarding answers still show up somewhere, just
//     attached to the attribute they seeded instead of sitting in a bullet
//     list.
//   - "compact": the in-app badge — same five bars, no captions, small
//     enough to sit under one line of text.
//
// Every bar only ever fills from the left; there is no "lost" state. See
// lib/companion.ts's comment on statsFor for why that's safe to promise.

// Compact's five columns are too narrow for the full words — "awareness"
// and "self-understanding" were truncating into an unreadable "AWARENE…"
// and wrapping into a two-line overflow. Fixed four-letter codes fit every
// column without truncation or wrapping; the full word is still one tap/
// hover away via the wrapper's `title`.
const SHORT_LABEL: Record<StatKey, string> = {
  awareness: "awar",
  mindfulness: "mind",
  consistency: "cons",
  resilience: "resi",
  selfUnderstanding: "self",
};

export function CompanionStats({
  stats,
  captions,
  variant = "full",
}: {
  stats: Stat[];
  /** Extra lines to show under a specific stat's meter (full variant only). */
  captions?: Partial<Record<StatKey, string[]>>;
  variant?: "full" | "compact";
}) {
  if (variant === "compact") {
    return (
      <div className="mt-3 grid grid-cols-5 gap-2" aria-label="companion stats">
        {stats.map((s) => (
          <div key={s.key} className="min-w-0" title={`${s.label}: ${s.tier}/${s.maxTier}`}>
            <div className="flex h-1.5 gap-[2px]">
              {Array.from({ length: s.maxTier }).map((_, i) => (
                <span
                  key={i}
                  aria-hidden
                  className={`h-full flex-1 rounded-full ${i < s.tier ? "bg-accent" : "bg-line"}`}
                />
              ))}
            </div>
            <p className="mt-1 text-center text-[10px] uppercase tracking-wide text-ink-faint">{SHORT_LABEL[s.key]}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-4" aria-label="companion stats">
      {stats.map((s) => {
        const lines = captions?.[s.key];
        return (
          <div key={s.key}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-13 text-ink">{s.label}</span>
              <span className="shrink-0 text-11 text-ink-faint">{s.tier}/{s.maxTier}</span>
            </div>
            <div className="mt-1.5 flex h-1.5 gap-1">
              {Array.from({ length: s.maxTier }).map((_, i) => (
                <span
                  key={i}
                  aria-hidden
                  className={`h-full flex-1 rounded-full transition-colors ${i < s.tier ? "bg-accent" : "bg-line"}`}
                />
              ))}
            </div>
            <p className="mt-1.5 text-12 text-ink-faint">
              {lines && lines.length ? lines.join(" ") : s.blurb}
            </p>
          </div>
        );
      })}
    </div>
  );
}
