"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import WaitlistCapture from "@/components/WaitlistCapture";
import { LANDING_COPY, pickLandingLocale, type Locale } from "@/lib/landing-copy";
import { PRICING_COPY, PRICING_CURRENCY_LABELS, currencyKey } from "@/lib/pricing-copy";
import { detectRegion } from "@/lib/country";

type Props = { locale?: Locale };

export default function Pricing({ locale: initialLocale = "en" }: Props) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [region, setRegion] = useState("US");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const detected = detectRegion();
    setRegion(detected);
    setLocale(pickLandingLocale(detected));
  }, []);

  const copy = PRICING_COPY[locale];
  const currency = PRICING_CURRENCY_LABELS[currencyKey(region)];
  const yearlyPrice = currency.yearly;
  const monthlyPrice = currency.monthly;
  const subhead = copy.subhead.replaceAll("{yearly}", yearlyPrice).replaceAll("{monthly}", monthlyPrice);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-16">
      <header className="flex items-center justify-between gap-4 py-5">
        <Link href={locale === "en" ? "/" : `/${locale}`} aria-label="Fix home" className="flex items-center gap-2.5">
          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-serif text-lg italic text-accent-ink" style={{ fontFamily: "var(--font-display)" }}>f</span>
          <span className="font-serif text-xl text-ink" style={{ fontFamily: "var(--font-display)" }}>Fix</span>
        </Link>
        <Link href="/help" className="flex min-h-[44px] items-center gap-2 rounded-full border border-frost/60 px-4 py-2 text-sm text-frost transition hover:border-frost hover:bg-frost/10">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-frost" />
          {LANDING_COPY[locale].getHelpNow}
        </Link>
      </header>

      <section className="flex flex-col gap-5 py-9 md:py-14">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">{copy.kicker}</p>
        <h1 className="max-w-[20ch] text-[clamp(2.4rem,7vw,4rem)] leading-[1.05] text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}>
          {copy.headlineLine1}<br />
          <span className="text-accent">{copy.headlineLine2}</span>
        </h1>
        <p className="max-w-[60ch] text-lg leading-relaxed text-ink-soft">{subhead}</p>
      </section>

      <section aria-labelledby="planned-offer-heading" className="rounded-[1.5rem] border border-line bg-card p-5 sm:rounded-[1.75rem] sm:p-8">
        <p className="inline-flex rounded-full border border-line bg-bg/60 px-3 py-1.5 text-xs font-medium text-ink-soft">{copy.plannedLabel}</p>
        <h2 id="planned-offer-heading" className="sr-only">{copy.plannedLabel}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-accent/30 bg-bg/45 p-5 sm:p-6">
            <h3 className="text-base font-medium text-ink">{copy.yearlyLabel}</h3>
            <p className="mt-3 text-3xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
              {copy.yearlyPriceFormat.replace("{price}", yearlyPrice)}
            </p>
            <p className="mt-1 text-sm text-ink-faint">
              {copy.yearlyEquivalentFormat.replace("{price}", currency.yearlyPerMonth)}
            </p>
          </article>
          <article className="rounded-2xl border border-line bg-bg/45 p-5 sm:p-6">
            <h3 className="text-base font-medium text-ink">{copy.monthlyLabel}</h3>
            <p className="mt-3 text-3xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
              {copy.monthlyPriceFormat.replace("{price}", monthlyPrice)}
            </p>
          </article>
        </div>
        <div className="mt-5 rounded-xl border border-line px-4 py-4">
          <p className="text-sm font-medium text-ink">{copy.trialLabel}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{copy.trialBody}</p>
        </div>

        <div className="mt-6 border-t border-line pt-6">
          <h3 className="text-xl text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>{copy.availabilityHeading}</h3>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink-soft">{copy.availabilityBody}</p>
          <div className="mt-5">
            <WaitlistCapture source="pricing" variant="full" locale={locale} />
          </div>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="mt-14">
        <h2 id="features-heading" className="text-[clamp(1.5rem,3.5vw,2rem)] text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>{copy.featureHeading}</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {copy.features.map((feature) => (
            <li key={feature} className="flex gap-3 rounded-2xl border border-line bg-card p-4 text-sm leading-relaxed text-ink-soft">
              <span aria-hidden="true" className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="trust-heading" className="mt-14 rounded-[1.5rem] border border-line bg-card p-5 sm:p-7">
        <h2 id="trust-heading" className="text-xl text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>{copy.trustHeading}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {copy.trustBullets.map((bullet) => (
            <li key={bullet} className="rounded-xl border border-line/70 bg-bg/40 p-4 text-sm leading-relaxed text-ink-soft">{bullet}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq-heading" className="mt-14">
        <h2 id="faq-heading" className="text-[clamp(1.5rem,3.5vw,2rem)] text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>{copy.faqHeading}</h2>
        <ul className="mt-5 flex flex-col gap-3">
          {copy.faqs.map((faq, index) => {
            const open = openFaq === index;
            const answer = faq.a
              .replaceAll("{yearly}", yearlyPrice)
              .replaceAll("{monthly}", monthlyPrice);
            return (
              <li key={faq.q} className="rounded-2xl border border-line bg-card">
                <button type="button" onClick={() => setOpenFaq(open ? null : index)} aria-expanded={open} className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="text-base text-ink">{faq.q}</span>
                  <span aria-hidden="true" className={`text-ink-soft transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
                </button>
                {open ? <div className="border-t border-line px-5 py-4 text-sm leading-relaxed text-ink-soft">{answer}</div> : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-14">
        <Link href={locale === "en" ? "/" : `/${locale}`} className="text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline">← {copy.backToHome}</Link>
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}
