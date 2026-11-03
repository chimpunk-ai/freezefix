import { LANDING_COPY, type Locale } from "@/lib/landing-copy";

// Tutorial card for the landing hero's right column.
//
// Shipped 4 November 2026 (feat/tutorial-replaces-illustration) after the
// 15-persona audit. Replaces the sunrise SVG + "ILLUSTRATION" placeholder
// badge that Yuki (Barcelona, UX designer) and Lars (Amsterdam, engineer)
// both called out as unfinished-looking production content. Lars's
// specific suggestion was to show the data the landing implies — a real
// 7-day pattern strip — instead of another chat screenshot. Step 3 of
// this card is exactly that.
//
// The card walks the long-term loop: open Fix in a tough moment → jot a
// line in Journal → watch Patterns build → set a Reduction Plan. The
// user explicitly asked for a tutorial about Patterns, Journal, and using
// the app for the long run. These four steps are that tutorial.
//
// Design notes
//   - No photos, no stock art. The product rule "do not use a photo of a
//     real person" and the broader honesty principle rule out illustration
//     that could be mistaken for a user.
//   - Icons are inline SVGs, each a quiet line drawing matching the Grove
//     palette. No external image requests, no CDN.
//   - Step 3 renders a real-looking 7-day heat strip in the same visual
//     language as /patterns and /program's progress strip (bg-accent for
//     "went well", bg-frost for "mixed", bg-ink-faint for "tough day").
//     The data is static example data, labelled "Example" so no visitor
//     mistakes it for their own.
//   - Localized via LANDING_COPY[locale].tutorial. Four locales covered
//     today (en/de/fr/nl); adding more is a single object literal in
//     lib/landing-copy.ts.
//
// Accessibility
//   The ordered list uses semantic <ol>, each step is a <li>, the heading
//   is a proper <h2>. The pattern strip is decorative (aria-hidden) and
//   carries a caption below so a screen reader gets the summary rather
//   than seven abstract divs.

type Props = {
  locale: Locale;
};

export default function TutorialCard({ locale }: Props) {
  const t = LANDING_COPY[locale].tutorial;

  return (
    <section
      aria-labelledby="tutorial-h"
      className="rounded-[1.75rem] border border-line bg-card p-5 sm:p-6"
    >
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
        {t.kicker}
      </p>
      <h2
        id="tutorial-h"
        className="mt-2 text-xl text-ink"
        style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
      >
        {t.heading}
      </h2>

      <ol className="mt-5 flex flex-col gap-5">
        {t.steps.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <StepIcon index={i} />
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-sm font-semibold text-ink">{step.title}</span>
              <span className="text-sm leading-relaxed text-ink-soft">{step.body}</span>
              {i === 2 ? <PatternStrip caption={t.patternsExampleCaption} /> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ───────────────────────── icons ─────────────────────────
// Four quiet line drawings, one per step. Kept inline so there's no
// network cost and the whole landing stays a single HTML payload.
function StepIcon({ index }: { index: number }) {
  const base =
    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-ink";
  return (
    <span aria-hidden="true" className={base}>
      {index === 0 ? (
        // Chat bubble — step 1, Open Fix
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18 L4 7 Q 4 5 6 5 L18 5 Q 20 5 20 7 L 20 15 Q 20 17 18 17 L 10 17 L 6 20 L 6 17 L 6 17 Z" />
        </svg>
      ) : index === 1 ? (
        // Pen + paper — step 2, Journal
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 20 L5 5 Q 5 4 6 4 L15 4 L19 8 L19 20 Q 19 21 18 21 L 6 21 Q 5 21 5 20 Z" />
          <path d="M8 11 L16 11 M8 15 L13 15" />
        </svg>
      ) : index === 2 ? (
        // Grid of small cells — step 3, Patterns (the icon echoes the pattern strip rendered below)
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="4" y="6" width="4" height="4" rx="1" />
          <rect x="10" y="6" width="4" height="4" rx="1" />
          <rect x="16" y="6" width="4" height="4" rx="1" />
          <rect x="4" y="14" width="4" height="4" rx="1" />
          <rect x="10" y="14" width="4" height="4" rx="1" />
          <rect x="16" y="14" width="4" height="4" rx="1" />
        </svg>
      ) : (
        // Calendar with progress — step 4, Reduction Plan
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="6" width="16" height="14" rx="2" />
          <path d="M4 10 L20 10" />
          <path d="M8 4 L8 7 M16 4 L16 7" />
          <circle cx="9" cy="14" r="1" fill="currentColor" />
          <circle cx="12" cy="14" r="1" fill="currentColor" />
          <circle cx="15" cy="14" r="1" fill="currentColor" />
        </svg>
      )}
    </span>
  );
}

// ───────────────────────── pattern strip ─────────────────────────
// A real-looking 7-day heat strip in the same visual language as the
// /program progress strip and /patterns insights, so the landing shows the
// data product rather than describing it. The data is static example data,
// carefully picked so no "pattern" could be interpreted as a user's own.
//
// Shape (7 cells, Mon → Sun): well, well, mixed, tough, mixed, well, well.
// Reads as "mostly fine, a hard mid-week, settled by the weekend" — the
// kind of shape anyone who logs their own week recognises.
const EXAMPLE_SHAPE: Array<"well" | "mixed" | "tough" | "none"> = [
  "well",
  "well",
  "mixed",
  "tough",
  "mixed",
  "well",
  "well",
];

function PatternStrip({ caption }: { caption: string }) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
        aria-hidden="true"
      >
        {EXAMPLE_SHAPE.map((state, i) => (
          <div
            key={i}
            className={`aspect-square rounded-md ${
              state === "well"
                ? "bg-accent/70"
                : state === "mixed"
                ? "bg-frost/60"
                : state === "tough"
                ? "bg-ink-faint/50"
                : "bg-bg/50 border border-line"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-ink-faint">{caption}</p>
    </div>
  );
}
