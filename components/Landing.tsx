"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import WaitlistCapture from "@/components/WaitlistCapture";
import TutorialCard from "@/components/TutorialCard";
import { LANDING_COPY, type Locale } from "@/lib/landing-copy";

/* Landing page — "Grove" rebuild (2026-10-31).
 *
 * Structure follows the approved reference prototype:
 *   /welcome : header (logo + Get help now) → hero (kicker + serif headline + body +
 *   mint CTA "Open Fix" + "How privacy works" link) → example card marked
 *   "EXAMPLE / Not a live conversation" → three honest-feature cards.
 *
 * Localized 3 November 2026 (feat/de-landing, Europe-audit P1.5). Takes a
 * `locale` prop; English is the default so the existing `/` route needs no
 * change. The German `/de` route passes locale="de". All visible strings
 * live in lib/landing-copy.ts; this file only lays them out. The illustration,
 * example-step layout, header/footer structure and the three-feature grid are
 * identical across locales so a visitor who flips the switcher sees the same
 * product, just in their language.
 *
 * The route "/app" is still accountless in this phase. Phase 3 adds the
 * Supabase + Google sign-in guard; nothing about the chat / safety flow changes here.
 */

type Props = {
  locale?: Locale;
};

/* Each example-step row needs to know who's "speaking" so it picks the right
 * bubble style. Lives in code (not copy) because it's layout, not language. */
type SpeakerKind = "user" | "fix" | "none";
const SPEAKERS: SpeakerKind[] = ["user", "user", "fix", "none"];

export default function Landing({ locale = "en" }: Props) {
  const copy = LANDING_COPY[locale];
  const [returning, setReturning] = useState(false);
  useEffect(() => {
    try {
      setReturning(window.localStorage.getItem("ff_adult") === "yes");
    } catch {
      /* storage can be blocked */
    }
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-16">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between py-5">
        <Link href="/" aria-label="GetFreezeFix home" className="flex items-center gap-2.5">
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
            {copy.getHelpNow}
          </Link>
          {returning && (
            <Link
              href="/app"
              className="hidden min-h-[44px] items-center rounded-full bg-chip px-4 py-2 text-ink hover:bg-chip/80 sm:flex"
            >
              {copy.openReturning}
            </Link>
          )}
          {/* Locale switcher. On English this lists de / fr / nl as separate
              chips; on each alt locale it is just the single pivot back to
              English (so a visitor never has to navigate through French to
              reach Dutch). Extended 3 Nov 2026 for audit P3.11. */}
          {copy.languageLinks.map((link) => (
            <Link
              key={link.lang}
              href={link.href}
              lang={link.lang}
              className="hidden min-h-[44px] items-center rounded-full border border-line/80 px-3 py-2 text-xs uppercase tracking-wider text-ink-soft transition hover:border-line hover:text-ink sm:flex"
              aria-label={link.label}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="grid items-start gap-10 py-8 md:py-14 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-6">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
            {copy.kicker}
          </p>

          <h1
            className="text-[clamp(2.4rem,7vw,4rem)] leading-[1.05] text-ink"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
          >
            {copy.heroHeadlineLine1}
            <br />
            {copy.heroHeadlineLine2}
          </h1>

          <p className="max-w-[46ch] text-lg leading-relaxed text-ink-soft">
            {copy.heroBody}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-5">
            <Link
              href="/app"
              className="group flex min-h-[52px] items-center gap-3 rounded-full bg-accent px-7 py-3 text-lg font-medium text-accent-ink shadow-[0_14px_32px_-14px_rgba(175,215,182,0.55)] transition active:scale-[0.98]"
            >
              {copy.ctaOpen}
              <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>
            <Link
              href="/privacy"
              className="min-h-[44px] text-base text-ink-soft underline-offset-4 hover:text-ink hover:underline"
            >
              {copy.ctaPrivacy}
            </Link>
          </div>

          {/* Clara door (feat/for-someone-you-love, 4 Nov 2026). A small
              tertiary link under the CTA row, aimed at partners / parents /
              friends who landed here looking to help someone else. Not a
              chip — doesn't compete with "Open Fix" — but findable from the
              hero so the reader sees it before scrolling past. */}
          <Link
            href="/for-someone-you-love"
            className="-mt-2 inline-flex min-h-[32px] items-center gap-1.5 text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
          >
            {copy.ctaForSomeone}
            <span aria-hidden="true">&rarr;</span>
          </Link>

          {/* Honest note (feat/de-landing, 3 Nov 2026 — P1.5). On the German
              page this reads "Fix selbst läuft momentan auf Englisch", so
              Marcus knows the chat is still English before he taps the CTA
              — no bait and switch. English page has no note. */}
          {copy.chatIsEnglishNote && (
            <p className="mt-1 rounded-[1.25rem] border border-line/70 bg-card/60 px-4 py-3 text-sm leading-relaxed text-ink-soft">
              {copy.chatIsEnglishNote}
            </p>
          )}

          {/* Waitlist (feat/waitlist, 3 Nov 2026 — Europe-audit P1.4). Lives above
              the three-feature list because the audit showed every European
              persona landed and left without a way for us to notify them when
              DE/FR/NL localization or the paid plan ships. */}
          <div className="mt-2">
            <WaitlistCapture source="home" variant="compact" locale={locale} />
          </div>

          {/* Three honest-feature list — stacked on mobile, 3-col on desktop */}
          <ul className="mt-6 grid grid-cols-1 gap-6 border-t border-line pt-6 sm:grid-cols-3">
            {copy.features.map((f) => (
              <li key={f.title} className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-ink">{f.title}</span>
                {f.body ? (
                  <span className="text-sm leading-snug text-ink-soft">{f.body}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right-hand: tutorial + example card ──────────────────────
            Tutorial card REPLACES the old sunrise SVG + "ILLUSTRATION" badge
            placeholder (feat/tutorial-replaces-illustration, 4 Nov 2026).
            Yuki (Barcelona, UX designer, 15-persona audit): "That badge
            belongs in a Figma file, not production — ship the art or ship
            nothing." Lars (Amsterdam, engineer): "Replace the chat-bubble
            example with real pattern output — a 7-day grid — show the data
            the landing implies, not another conversation screenshot." The
            tutorial card has four steps; step 3 renders a real-looking
            7-day pattern strip, which is Lars's suggestion.
            The example conversation card below the tutorial is unchanged —
            it still shows what the chat feels like in a crisis moment. */}
        <aside aria-labelledby="example-heading" className="w-full">
          <TutorialCard locale={locale} />

          <section
            aria-labelledby="example-heading"
            className="mt-4 rounded-[1.75rem] border border-line bg-card p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="example-heading" className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
                {copy.exampleKicker}
              </h2>
              <span className="text-xs text-ink-faint">{copy.exampleSubtitle}</span>
            </div>

            <ol className="flex flex-col gap-4">
              {copy.exampleSteps.map((step, i) => {
                const speaker = SPEAKERS[i] ?? "none";
                return (
                  <li key={step.index} className="flex flex-col gap-1.5">
                    <span className="text-xs text-ink-soft">
                      {step.index} &middot; {step.label}
                    </span>
                    {step.body !== null ? (
                      <span
                        className={
                          speaker === "user"
                            ? "self-start rounded-xl bg-chip px-3.5 py-2 text-sm text-ink"
                            : "self-start rounded-xl border border-line bg-bg/40 px-3.5 py-2.5 text-sm leading-relaxed text-ink"
                        }
                      >
                        {step.body}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </section>
        </aside>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
