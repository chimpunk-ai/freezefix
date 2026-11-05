"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import WaitlistCapture from "@/components/WaitlistCapture";
import TutorialCard from "@/components/TutorialCard";
import { LANDING_COPY, type Locale } from "@/lib/landing-copy";
import { LANDING_SECTIONS } from "@/lib/landing-sections-copy";
import { PRICING_CURRENCY_LABELS, currencyKey } from "@/lib/pricing-copy";
import { detectRegion } from "@/lib/country";

/* Landing page — "Calm" rebuild (2026-11-05, Stage 3 of the Calm-grade
 * redesign). The hero + example + tutorial + waitlist + feature cards from
 * the Grove rebuild are preserved (they work and the copy is reviewed);
 * this pass adds six new sections and a glass sticky nav on top, per the
 * brief:
 *
 *   • glass sticky nav (brief: "glassmorphism on nav only")
 *   • 6 scenario cards (the "what Fix is for" moments — fix #3)
 *   • pricing teaser — free vs pro + founding-member tag → /pricing
 *   • privacy band — 3 bullets on the no-account / on-device posture
 *   • social-proof honest-empty state ("no fake testimonials")
 *   • FAQ accordion
 *   • footer carries an "Adults 18+" badge
 *
 * Every string is in lib/landing-copy.ts or lib/landing-sections-copy.ts;
 * the component only lays them out. Payments untouched — the pricing
 * teaser links to the already-live /pricing pre-sell page.
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
  const sections = LANDING_SECTIONS[locale];
  const [returning, setReturning] = useState(false);
  const [region, setRegion] = useState<string>("US");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  useEffect(() => {
    try {
      setReturning(window.localStorage.getItem("ff_adult") === "yes");
    } catch {
      /* storage can be blocked */
    }
    setRegion(detectRegion());
  }, []);

  // Currency for the pricing teaser. Display-only; the real charge is set
  // by Paddle at checkout time when billing ships. Source of truth is
  // lib/pricing-copy.ts's PRICING_CURRENCY_LABELS, same as /pricing.
  const currency = PRICING_CURRENCY_LABELS[currencyKey(region)];

  return (
    <>
      {/* ── Sticky glass nav — brief: "glassmorphism on nav only" ──────
       *  The ONE header, glass-backgrounded, sticks at the top. Carries:
       *  brand mark / Pricing link / Get help now / Open (returning users)
       *  / locale switcher chips. The in-flow header the Grove rebuild
       *  shipped has been retired; the glass nav is the single place to
       *  change header chrome. */}
      <div className="sticky top-0 z-30 ff-glass">
        <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-y-2 px-5 py-3">
          <Link
            href={locale === "en" ? "/" : `/${locale}`}
            aria-label="GetFreezeFix home"
            className="flex items-center gap-2.5"
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-base italic text-accent-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              f
            </span>
            <span className="text-base text-ink" style={{ fontFamily: "var(--font-display)" }}>
              Fix
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/pricing"
              className="hidden min-h-[40px] items-center rounded-full px-3 py-2 text-ink-soft transition hover:text-ink sm:inline-flex"
            >
              {locale === "en" ? "Pricing" : locale === "de" ? "Preise" : locale === "fr" ? "Prix" : locale === "nl" ? "Prijzen" : locale === "es" ? "Precios" : "Prezzi"}
            </Link>
            <Link
              href="/help"
              className="flex min-h-[40px] items-center gap-2 rounded-full border border-frost/60 px-3 py-2 text-sm text-frost transition hover:border-frost hover:bg-frost/10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
              {copy.getHelpNow}
            </Link>
            {returning ? (
              <Link
                href="/app"
                className="hidden min-h-[40px] items-center rounded-full bg-chip px-4 text-sm text-ink transition hover:bg-chip/80 sm:inline-flex"
              >
                {copy.openReturning}
              </Link>
            ) : (
              <Link
                href="/app"
                className="hidden min-h-[40px] items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-ink transition hover:bg-glow sm:inline-flex"
              >
                {copy.ctaOpen}
              </Link>
            )}
            {copy.languageLinks.map((link) => (
              <Link
                key={link.lang}
                href={link.href}
                lang={link.lang}
                className="hidden min-h-[40px] items-center rounded-full border border-line px-2.5 py-2 text-xs uppercase tracking-wider text-ink-soft transition hover:border-ink-soft hover:text-ink md:inline-flex"
                aria-label={link.label}
              >
                {link.lang}
              </Link>
            ))}
          </nav>
        </header>
      </div>

      <main className="mx-auto w-full max-w-6xl px-5 pb-16">

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

      {/* ── Scenarios (fix #3 — surface hidden features through the lens
       *  of the moments they're for) ─────────────────────────────────── */}
      <section
        aria-labelledby="scenarios-heading"
        className="mt-20 flex flex-col gap-6 md:mt-24"
      >
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
            {sections.scenarios.kicker}
          </p>
          <h2
            id="scenarios-heading"
            className="max-w-[20ch] text-[clamp(1.75rem,4.5vw,2.5rem)] leading-[1.1] text-ink"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            {sections.scenarios.heading}
          </h2>
          <p className="max-w-[60ch] text-base leading-relaxed text-ink-soft">
            {sections.scenarios.body}
          </p>
        </div>
        <ul className="ff-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.scenarios.cards.map((card) => (
            <li
              key={card.title}
              className="flex flex-col gap-2 rounded-[1rem] border border-line bg-card p-5 transition hover:border-ink-soft/40"
            >
              <h3 className="text-base font-medium text-ink">{card.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{card.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Pricing teaser → /pricing ─────────────────────────────────── */}
      <section
        aria-labelledby="pricing-teaser-heading"
        className="mt-20 flex flex-col gap-6 md:mt-24"
      >
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
            {sections.pricingTeaser.kicker}
          </p>
          <h2
            id="pricing-teaser-heading"
            className="max-w-[20ch] text-[clamp(1.75rem,4.5vw,2.5rem)] leading-[1.1] text-ink"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            {sections.pricingTeaser.heading}
          </h2>
          <p className="max-w-[60ch] text-base leading-relaxed text-ink-soft">
            {sections.pricingTeaser.body}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Free card */}
          <div className="flex flex-col gap-4 rounded-[1rem] border border-line bg-card p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-medium text-ink">{sections.pricingTeaser.freeLabel}</h3>
              <span className="text-lg text-ink">{sections.pricingTeaser.freePrice}</span>
            </div>
            <ul className="flex flex-col gap-2 text-sm leading-relaxed text-ink-soft">
              {sections.pricingTeaser.freeBullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro card — highlighted border and founding tag */}
          <div className="relative flex flex-col gap-4 rounded-[1rem] border border-accent/50 bg-card p-6 shadow-[0_14px_32px_-14px_rgba(156,175,136,0.25)]">
            <span className="absolute -top-2.5 left-5 rounded-full bg-accent px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-accent-ink">
              {sections.pricingTeaser.foundingTag.replace("$29.99", currency.founding).replace("€27,99", currency.founding).replace("27,99 €", currency.founding)}
            </span>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-medium text-ink">{sections.pricingTeaser.proLabel}</h3>
              <div className="text-right">
                <div className="text-lg text-ink">
                  {sections.pricingTeaser.proPrice.replace("$39.99", currency.pro).replace("€39,99", currency.pro).replace("39,99 €", currency.pro)}
                </div>
                <div className="text-xs text-ink-faint">
                  {sections.pricingTeaser.proPerMonth.replace("$3.33", currency.proPerMonth).replace("€3,33", currency.proPerMonth).replace("3,33 €", currency.proPerMonth)}
                </div>
              </div>
            </div>
            <ul className="flex flex-col gap-2 text-sm leading-relaxed text-ink-soft">
              {sections.pricingTeaser.proBullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Link
          href="/pricing"
          className="inline-flex min-h-[44px] w-fit items-center rounded-full border border-line px-4 py-2 text-sm text-ink transition hover:border-ink-soft"
        >
          {sections.pricingTeaser.ctaLabel}
        </Link>
      </section>

      {/* ── Privacy band ──────────────────────────────────────────────── */}
      <section
        aria-labelledby="privacy-heading"
        className="mt-20 rounded-[1.25rem] border border-line bg-card p-6 sm:p-8 md:mt-24"
      >
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
            {sections.privacyBand.kicker}
          </p>
          <h2
            id="privacy-heading"
            className="max-w-[24ch] text-[clamp(1.5rem,3.5vw,2rem)] leading-[1.1] text-ink"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            {sections.privacyBand.heading}
          </h2>
        </div>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {sections.privacyBand.bullets.map((b, i) => (
            <li
              key={i}
              className="rounded-[1rem] border border-line/70 bg-bg/40 p-4 text-sm leading-relaxed text-ink-soft"
            >
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Social proof (honest empty state — "be the first") ────────── */}
      <section
        aria-labelledby="proof-heading"
        className="mt-20 flex flex-col gap-4 rounded-[1rem] border border-dashed border-line bg-card/50 p-6 sm:p-8 md:mt-24"
      >
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
          {sections.socialProof.kicker}
        </p>
        <h2
          id="proof-heading"
          className="max-w-[24ch] text-[clamp(1.5rem,3.5vw,2rem)] leading-[1.1] text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          {sections.socialProof.heading}
        </h2>
        <p className="max-w-[60ch] text-base leading-relaxed text-ink-soft">
          {sections.socialProof.body}
        </p>
        <p className="text-sm text-ink-faint">{sections.socialProof.emptyLabel}</p>
      </section>

      {/* ── FAQ accordion ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="faq-heading"
        className="mt-20 flex flex-col gap-5 md:mt-24"
      >
        <h2
          id="faq-heading"
          className="max-w-[24ch] text-[clamp(1.5rem,3.5vw,2rem)] leading-[1.1] text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          {sections.faq.heading}
        </h2>
        <ul className="flex flex-col gap-3">
          {sections.faq.items.map((item, i) => {
            const open = openFaq === i;
            return (
              <li key={i} className="rounded-[1rem] border border-line bg-card">
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : i)}
                  aria-expanded={open}
                  className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-base text-ink">{item.q}</span>
                  <span
                    aria-hidden="true"
                    className={`text-ink-soft transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </button>
                {open ? (
                  <div className="border-t border-line px-5 py-4 text-sm leading-relaxed text-ink-soft">
                    {item.a}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── 18+ badge, one line above the footer ─────────────────────── */}
      <div className="mt-16 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-faint">
        <span
          aria-hidden="true"
          className="flex h-5 w-5 items-center justify-center rounded-full border border-ink-faint text-[0.6rem] font-medium"
        >
          18+
        </span>
        <span>{sections.ageBadge}</span>
      </div>

      <SiteFooter locale={locale} />
    </main>
    </>
  );
}
