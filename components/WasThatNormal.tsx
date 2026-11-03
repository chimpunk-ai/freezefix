"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { WAS_THAT_NORMAL_COPY } from "@/lib/was-that-normal-copy";
import { LANDING_COPY, pickLandingLocale, type Locale } from "@/lib/landing-copy";
import { detectRegion } from "@/lib/country";

// "Was that normal?" page. Added 4 November 2026 (feat/was-that-normal)
// for Sophie (Paris, 24, post-party) from the 15-persona audit. Sophie
// asked for "a door for one-off users" — explicitly NOT a crisis page
// (/too-high-what-to-do already exists for people who are high right
// now). This is for the morning-after, mildly-anxious, "was that
// normal?" audience that bounces off anything that assumes they have
// cannabis "habits."
//
// Locale is picked the same way as /program and /for-someone-you-love:
// detectRegion → pickLandingLocale. One route, four languages.

export default function WasThatNormal() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(pickLandingLocale(detectRegion()));
  }, []);

  const t = WAS_THAT_NORMAL_COPY[locale];
  const lc = LANDING_COPY[locale];

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-16">
      {/* Header */}
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
            </svg>
            {lc.getHelpNow}
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col gap-5 py-6 md:py-10">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">{t.kicker}</p>
        <h1
          className="text-[clamp(2rem,6vw,3.25rem)] leading-[1.08] text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
        >
          {t.heroH1}
        </h1>
        <p className="max-w-[54ch] text-lg leading-relaxed text-ink">{t.heroLead}</p>
      </section>

      {/* "What you felt is on every public-health page" */}
      <section className="flex flex-col gap-4 border-t border-line pt-8">
        <h2 className="text-xl text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          {t.normalHeading}
        </h2>
        {t.normalParagraphs.map((p, i) => (
          <p key={i} className="text-base leading-relaxed text-ink-soft">
            {p}
          </p>
        ))}
      </section>

      {/* "Why it felt bigger than it was" */}
      <section className="flex flex-col gap-4 border-t border-line pt-8">
        <h2 className="text-xl text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          {t.whyHeading}
        </h2>
        {t.whyParagraphs.map((p, i) => (
          <p key={i} className="text-base leading-relaxed text-ink-soft">
            {p}
          </p>
        ))}
      </section>

      {/* "What to do with this" */}
      <section className="flex flex-col gap-4 border-t border-line pt-8">
        <h2 className="text-xl text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          {t.nextHeading}
        </h2>
        {t.nextParagraphs.map((p, i) => (
          <p key={i} className="text-base leading-relaxed text-ink-soft">
            {p}
          </p>
        ))}
      </section>

      {/* Closing — soft routes forward */}
      <section className="mt-8 flex flex-col gap-4 rounded-[1.5rem] border border-line bg-card p-5 sm:p-6">
        <h2 className="text-xl text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          {t.closingHeading}
        </h2>
        <p className="text-base leading-relaxed text-ink">{t.closingLead}</p>
        <div className="mt-2 flex flex-col gap-3">
          <Link
            href={locale === "en" ? "/" : `/${locale}`}
            className="group flex flex-col gap-0.5 rounded-[1.25rem] border border-line bg-bg/40 p-4 transition hover:border-accent/60"
          >
            <span className="flex items-center gap-2 text-base font-medium text-ink">
              {t.closingToHomeLabel}
              <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
            </span>
            <span className="text-xs text-ink-soft">{t.closingToHomeCaption}</span>
          </Link>
          <Link
            href="/help"
            className="group flex flex-col gap-0.5 rounded-[1.25rem] border border-line bg-bg/40 p-4 transition hover:border-frost/60"
          >
            <span className="flex items-center gap-2 text-base font-medium text-ink">
              {t.closingToHelpLabel}
              <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
            </span>
            <span className="text-xs text-ink-soft">{t.closingToHelpCaption}</span>
          </Link>
        </div>
      </section>

      <div className="mt-10">
        <SiteFooter locale={locale} />
      </div>
    </main>
  );
}
