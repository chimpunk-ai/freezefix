import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import WaitlistCapture from "@/components/WaitlistCapture";
import { type SeoLandingContent } from "@/lib/seo-copy";
import { LANDING_COPY } from "@/lib/landing-copy";

// Shared layout for the three SEO landing pages shipped as audit P1.7 on
// 3 November 2026. The content comes from lib/seo-copy.ts, keyed by page
// slug; this file is only layout + semantics. Same "Grove" palette as the
// main landing so a visitor who clicks through from one to the other
// doesn't feel like they left the product.
//
// Structure, top to bottom:
//   - Product-disclosure banner (one line, always visible, says what Fix is)
//   - Header with "Fix" wordmark + "Get help now" terracotta pill
//   - Hero: kicker, large H1, calm lead paragraph
//   - "What is actually happening" prose with a quiet source attribution
//   - Three numbered things to try in 10 min
//   - Red-flag list with the emergency numbers at the bottom
//   - CTA card linking to Fix / /de / waitlist
//   - Waitlist capture (same component as /, honest about the chat language)
//   - Footer
//
// Accessibility
//   The red-flag list uses role="list" so a screen reader counts the items.
//   The emergency line follows it inside the same section so the reading
//   order on a screen reader matches the visual: red flag -> what to do.

type Props = {
  content: SeoLandingContent;
};

export default function SeoLanding({ content }: Props) {
  const c = content;
  // The main landing's locale switcher strings are reused for consistency.
  const switcher = LANDING_COPY[c.locale].switchTo;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-16">
      {/* Product-disclosure banner — the first thing a cold Google visitor
          sees, so they know whose page this is and what Fix is not. */}
      <div className="mt-4 rounded-[1.25rem] border border-line/70 bg-card/60 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        {c.productDisclosure}
      </div>

      {/* Header: wordmark + Get help now + locale switcher chip */}
      <header className="flex items-center justify-between py-5">
        <Link
          href={c.locale === "de" ? "/de" : "/"}
          aria-label="GetFreezeFix home"
          className="flex items-center gap-2.5"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-serif text-lg italic text-accent-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            f
          </span>
          <span className="font-serif text-xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
            Fix
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/help"
            className="flex min-h-[44px] items-center gap-2 rounded-full border border-frost/60 px-4 py-2 text-frost transition hover:border-frost hover:bg-frost/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
            </svg>
            {LANDING_COPY[c.locale].getHelpNow}
          </Link>
          {c.hreflangAlt ? (
            <Link
              href={switcher.href}
              lang={switcher.href === "/de" ? "de" : "en"}
              className="hidden min-h-[44px] items-center rounded-full border border-line/80 px-3 py-2 text-xs uppercase tracking-wider text-ink-soft transition hover:border-line hover:text-ink sm:flex"
              aria-label={switcher.label}
            >
              {switcher.label}
            </Link>
          ) : null}
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col gap-5 py-6 md:py-10">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
          {c.kicker}
        </p>
        <h1
          className="text-[clamp(2rem,6vw,3.25rem)] leading-[1.08] text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
        >
          {c.heroH1}
        </h1>
        <p className="max-w-[52ch] text-lg leading-relaxed text-ink">
          {c.heroLead}
        </p>
      </section>

      {/* "What is actually happening" */}
      <section className="flex flex-col gap-4 border-t border-line pt-8">
        <h2 className="text-xl text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          {c.whatSection.heading}
        </h2>
        {c.whatSection.paragraphs.map((p, i) => (
          <p key={i} className="text-base leading-relaxed text-ink-soft">
            {p}
          </p>
        ))}
        <p className="text-xs text-ink-faint">{c.whatSection.cite}</p>
      </section>

      {/* Three things to try */}
      <section className="flex flex-col gap-4 border-t border-line pt-8">
        <h2 className="text-xl text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          {c.threeThings.heading}
        </h2>
        <p className="text-base leading-relaxed text-ink-soft">{c.threeThings.intro}</p>
        <ol className="mt-2 flex flex-col gap-5">
          {c.threeThings.items.map((item, i) => (
            <li key={item.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent-ink"
              >
                {i + 1}
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-base font-semibold text-ink">{item.title}</span>
                <span className="text-sm leading-relaxed text-ink-soft">{item.body}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Red flags + emergency line */}
      <section
        aria-labelledby="whentocall-h"
        className="mt-8 flex flex-col gap-4 rounded-[1.5rem] border border-frost/40 bg-frost/5 p-5 sm:p-6"
      >
        <h2
          id="whentocall-h"
          className="text-xl text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          {c.whenToCall.heading}
        </h2>
        <p className="text-base leading-relaxed text-ink">{c.whenToCall.intro}</p>
        <ul role="list" className="mt-1 flex flex-col gap-2">
          {c.whenToCall.items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-frost" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm leading-relaxed text-ink">{c.whenToCall.emergencyLine}</p>
      </section>

      {/* CTA */}
      <section className="mt-8 flex flex-col gap-3 rounded-[1.5rem] border border-line bg-card p-5 sm:p-6">
        <h2
          className="text-xl text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          {c.cta.heading}
        </h2>
        <p className="text-base leading-relaxed text-ink-soft">{c.cta.body}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <Link
            href={c.cta.primary.href}
            className="group flex min-h-[48px] items-center gap-3 rounded-full bg-accent px-6 py-3 text-base font-medium text-accent-ink shadow-[0_14px_32px_-14px_rgba(175,215,182,0.55)] transition active:scale-[0.98]"
          >
            {c.cta.primary.label}
            <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
              &rarr;
            </span>
          </Link>
          {c.cta.secondary ? (
            <Link
              href={c.cta.secondary.href}
              className="min-h-[44px] text-base text-ink-soft underline-offset-4 hover:text-ink hover:underline"
            >
              {c.cta.secondary.label}
            </Link>
          ) : null}
        </div>
      </section>

      {/* Waitlist — the SEO page is the top of our funnel, so capturing an
          email here matters more than almost anywhere else. */}
      <section className="mt-8">
        <WaitlistCapture source="home" variant="compact" locale={c.locale} />
      </section>

      <div className="mt-10">
        <SiteFooter locale={c.locale} />
      </div>
    </main>
  );
}
