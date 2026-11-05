import { LANDING_COPY, type Locale } from "@/lib/landing-copy";

type Props = { locale: Locale };

const SAMPLE_WEEK = [true, true, false, true, false, true, false];

export default function PatternMirrorCard({ locale }: Props) {
  const copy = LANDING_COPY[locale].mirror;

  return (
    <article aria-labelledby="mirror-preview-heading" className="rounded-[1.5rem] border border-line bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.3)] sm:rounded-[1.75rem] sm:p-7">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
        {copy.kicker}
      </p>
      <h2
        id="mirror-preview-heading"
        className="mt-3 text-[clamp(1.55rem,4vw,2rem)] leading-tight text-ink"
        style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
      >
        {copy.heading}
      </h2>
      <p className="mt-3 max-w-[48ch] text-base leading-relaxed text-ink-soft">
        {copy.observation}
      </p>

      <div
        role="img"
        aria-label={copy.chartSummary}
        className="mt-6 grid grid-cols-7 gap-2"
      >
        {SAMPLE_WEEK.map((smoked, index) => (
          <div key={`${copy.weekdays[index]}-${index}`} className="flex min-w-0 flex-col items-center gap-2">
            <span className="text-[11px] text-ink-faint">{copy.weekdays[index]}</span>
            <span
              aria-hidden="true"
              className={`flex aspect-square w-full max-w-[48px] items-center justify-center rounded-xl border ${
                smoked
                  ? "border-accent/35 bg-accent/10 text-accent"
                  : "border-line bg-bg/40 text-ink-faint"
              }`}
            >
              {smoked ? <LeafMark /> : <OpenMark />}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-faint" aria-hidden="true">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          {copy.smokedLegend}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full border border-ink-faint" />
          {copy.noSmokeLegend}
        </span>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          {copy.goalLabel}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink">{copy.goalLine}</p>
      </div>
      <p className="mt-5 text-xs text-ink-faint">{copy.caption}</p>
    </article>
  );
}

function LeafMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M20 4C11 4 5 7.4 5 13.3A5.7 5.7 0 0 0 10.7 19C16.6 19 20 13 20 4Z" />
      <path d="M4 21c3.4-5.3 7.2-8.8 12-11" />
    </svg>
  );
}

function OpenMark() {
  return (
    <span className="h-2.5 w-2.5 rounded-full border border-current" />
  );
}
