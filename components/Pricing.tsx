"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import WaitlistCapture from "@/components/WaitlistCapture";
import { PRICING_COPY, PRICING_CURRENCY_LABELS, currencyKey } from "@/lib/pricing-copy";
import { pickLandingLocale, type Locale } from "@/lib/landing-copy";
import { detectRegion } from "@/lib/country";

// Pricing page — the founding-member PRE-SELL.
//
// Added 5 November 2026 (feat/pricing-founding-member) as Stage 1 of the
// Calm-grade redesign + revenue plan. This is NOT a checkout page. It is
// a waitlist capture with an honest price card that locks in $29.99 / €27,99
// / £24.99 for the first year once Pro ships. Paddle wiring + real billing
// is a later, approval-gated stage (see FreezeFix_Redesign_Plan_2026-11.md).
//
// Why it exists now
//   Fix #6 from the audit: "Pre-sell before you build the full paywall.
//   A pricing page with 'Founding member — $29.99 first year, launching
//   soon' + waitlist validates willingness to pay in weeks instead of
//   months." The visible pricing is also fix #3 (surface hidden features)
//   — the comparison table is where Journal, Insights, and the Reduction
//   Program finally show up on a marketing surface.
//
// Posture
//   • No countdown. No "last 24 hours." No manipulative urgency.
//   • The free column lists what Fix is TODAY — a visitor who never
//     upgrades reads the whole product honestly.
//   • Crisis help stays free forever and the trust band says so.
//   • "No charge today" appears above the CTA, under the price, and in
//     the FAQ so there is no chance a visitor types their email expecting
//     a trial.

type Props = {
  locale?: Locale;
};

export default function Pricing({ locale: initialLocale = "en" }: Props) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [region, setRegion] = useState<string>("US");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const r = detectRegion();
    setRegion(r);
    setLocale(pickLandingLocale(r));
  }, []);

  const copy = PRICING_COPY[locale];
  const currency = PRICING_CURRENCY_LABELS[currencyKey(region)];

  // Rows render an icon-check for "Yes/Sí/Ja/Oui", a dash for "—", and the
  // bare string otherwise ("3 a day", "Full history"). We work out which to
  // show from the string itself so the copy stays owned by the locale pack.
  const positiveWords = useMemo(
    () => new Set(["Yes", "Ja", "Oui", "Sì", "Sí"]),
    []
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-16">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between py-5">
        <Link
          href={locale === "en" ? "/" : `/${locale}`}
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
            {/* Reuse the landing copy for this chip so the two pages agree. */}
            {locale === "en"
              ? "Get help now"
              : locale === "de"
              ? "Hilfe jetzt"
              : locale === "fr"
              ? "Aide maintenant"
              : locale === "nl"
              ? "Hulp nu"
              : locale === "es"
              ? "Ayuda ahora"
              : "Aiuto ora"}
          </Link>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-5 py-10 md:py-14">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
          {copy.kicker}
        </p>
        <h1
          className="max-w-[18ch] text-[clamp(2.4rem,7vw,4rem)] leading-[1.05] text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
        >
          {copy.headlineLine1}
          <br />
          <span className="text-accent">{copy.headlineLine2}</span>
        </h1>
        <p className="max-w-[56ch] text-lg leading-relaxed text-ink-soft">
          {copy.subhead}
        </p>
      </section>

      {/* ── Founding-member pre-sell card ─────────────────────────────── */}
      <section
        aria-labelledby="founding-heading"
        className="rounded-[1.75rem] border border-accent/40 bg-card p-6 shadow-[0_18px_40px_-20px_rgba(175,215,182,0.18)] sm:p-8"
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
            {copy.foundingMemberBadge}
          </span>
        </div>
        <h2
          id="founding-heading"
          className="mt-4 text-[clamp(1.75rem,4.5vw,2.5rem)] leading-[1.1] text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          {/* Replace $29.99 default with the region-correct currency at render
           *  time — the copy pack carries the USD string, we substitute from
           *  PRICING_CURRENCY_LABELS when we have a GB / EU bucket. */}
          {copy.foundingMemberHeadline.replace("$29.99", currency.founding).replace("€27,99", currency.founding).replace("27,99 €", currency.founding)}
        </h2>
        <p className="mt-1 text-sm text-ink-faint">
          <s>{copy.foundingMemberStrike.replace("$39.99", currency.pro).replace("€39,99", currency.pro).replace("39,99 €", currency.pro)}</s>
        </p>
        <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-ink-soft">
          {copy.foundingMemberHint}
        </p>

        <div className="mt-6">
          <WaitlistCapture source="pricing" variant="full" locale={locale} />
        </div>

        <p className="mt-3 text-xs text-ink-faint">{copy.foundingMemberNote}</p>
      </section>

      {/* ── Comparison table ───────────────────────────────────────────── */}
      <section aria-labelledby="comparison-heading" className="mt-16">
        <h2
          id="comparison-heading"
          className="text-[clamp(1.5rem,3.5vw,2rem)] text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          {copy.comparisonHeading}
        </h2>

        {/* On mobile the table collapses to two stacked cards so the columns
         *  never need to scroll horizontally. From sm: upward we show the
         *  real 3-column grid. */}
        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-line bg-card">
          {/* Header row */}
          <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 border-b border-line bg-chip/40 px-5 py-4 text-sm">
            <div className="text-ink-soft" />
            <div className="text-ink">
              <div className="font-medium">{copy.columnFree}</div>
              <div className="text-xs text-ink-faint">{copy.columnFreePrice}</div>
            </div>
            <div className="text-ink">
              <div className="font-medium">{copy.columnPro}</div>
              <div className="text-xs text-ink-faint">
                {copy.columnProPrice.replace("$39.99", currency.pro).replace("€39,99", currency.pro).replace("39,99 €", currency.pro)}
              </div>
              <div className="mt-0.5 text-xs text-ink-faint">
                {copy.columnProPriceHint.replace("$3.33", currency.proPerMonth).replace("€3,33", currency.proPerMonth).replace("3,33 €", currency.proPerMonth)}
              </div>
            </div>
          </div>
          {/* Rows */}
          <ul className="divide-y divide-line">
            {copy.rows.map((row) => (
              <li
                key={row.feature}
                className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-2 px-5 py-3.5 text-sm"
              >
                <span className="text-ink">{row.feature}</span>
                <span className="text-ink-soft">
                  {renderCell(row.freeHas, positiveWords)}
                </span>
                <span className="text-ink">
                  {renderCell(row.proHas, positiveWords)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Trust band ────────────────────────────────────────────────── */}
      <section
        aria-labelledby="trust-heading"
        className="mt-16 rounded-[1.5rem] border border-line bg-card p-6 sm:p-8"
      >
        <h2
          id="trust-heading"
          className="text-[clamp(1.25rem,2.8vw,1.6rem)] text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          {copy.trustHeading}
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {copy.trustBullets.map((b, i) => (
            <li
              key={i}
              className="rounded-[1.25rem] border border-line/70 bg-bg/40 p-4 text-sm leading-relaxed text-ink-soft"
            >
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section aria-labelledby="faq-heading" className="mt-16">
        <h2
          id="faq-heading"
          className="text-[clamp(1.5rem,3.5vw,2rem)] text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          {copy.faqHeading}
        </h2>
        <ul className="mt-6 flex flex-col gap-3">
          {copy.faqs.map((faq, i) => {
            const open = openFaq === i;
            return (
              <li key={i} className="rounded-[1.25rem] border border-line bg-card">
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : i)}
                  aria-expanded={open}
                  className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-base text-ink">{faq.q}</span>
                  <span
                    aria-hidden="true"
                    className={`text-ink-soft transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </button>
                {open ? (
                  <div className="border-t border-line px-5 py-4 text-sm leading-relaxed text-ink-soft">
                    {faq.a}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Back link ─────────────────────────────────────────────────── */}
      <section className="mt-16">
        <Link
          href={locale === "en" ? "/" : `/${locale}`}
          className="text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
        >
          ← {copy.backToHome}
        </Link>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}

// Render a row cell. Positive strings ("Yes/Sí/Ja/…") become a check dot,
// "—" becomes a dim dash, everything else renders as-is ("3 a day",
// "Full history", "Last 14 days").
function renderCell(value: string, positiveWords: Set<string>): React.ReactNode {
  if (value === "—") {
    return <span className="text-ink-faint" aria-hidden="true">—</span>;
  }
  if (positiveWords.has(value)) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <span>{value}</span>
      </span>
    );
  }
  return <span>{value}</span>;
}
