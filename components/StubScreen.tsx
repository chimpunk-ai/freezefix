import Link from "next/link";

// A classy, honest empty-state card used by every stub route created in PR A.
// Deliberately NOT fake data — the heading says what the feature does, the body says
// how to begin, and the CTA (if any) opens the one surface that is already working.
// Shape and wording follow the Grove palette and the Patterns-page empty state so the
// whole app reads as one piece once the real surfaces land in later PRs.
export default function StubScreen({
  kicker,
  title,
  description,
  cta,
  secondary,
  comingSoon = true,
  children,
}: {
  /** Short, uppercase line above the title (eg. "JOURNAL · ON THIS DEVICE ONLY"). */
  kicker: string;
  /** Serif H1 — says what the feature IS. */
  title: string;
  /** 1–3 sentences — says what the feature does and how to begin. */
  description: string;
  /** Primary action. */
  cta?: { href: string; label: string };
  /** Optional secondary action, shown underneath the primary. */
  secondary?: { href: string; label: string };
  /** Marks the surface as not-yet-built; defaults true in this PR. Set false once the
   *  real surface replaces this stub so the honesty cue disappears. */
  comingSoon?: boolean;
  /** Optional extra content (eg. links to related working surfaces). */
  children?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">{kicker}</p>
        <h1
          className="text-[clamp(1.9rem,5.6vw,2.6rem)] leading-[1.08] text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
        >
          {title}
        </h1>
        <p className="max-w-[52ch] text-base leading-relaxed text-ink-soft">{description}</p>
      </div>

      {comingSoon && (
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-line/80 bg-card px-3 py-1 text-xs uppercase tracking-wider text-ink-faint">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
          Building this now — nothing fake while it's unfinished
        </p>
      )}

      {(cta || secondary) && (
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {cta && (
            <Link
              href={cta.href}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-medium text-accent-ink"
            >
              {cta.label}
              <span aria-hidden="true">→</span>
            </Link>
          )}
          {secondary && (
            <Link
              href={secondary.href}
              className="min-h-[44px] text-base text-ink-soft underline-offset-4 hover:text-ink hover:underline"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      )}

      {children}
    </section>
  );
}
