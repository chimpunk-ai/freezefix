"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { FOR_SOMEONE_COPY } from "@/lib/for-someone-copy";
import { LANDING_COPY, pickLandingLocale, type Locale } from "@/lib/landing-copy";
import { detectRegion } from "@/lib/country";

// "For someone you love" page. Added 4 November 2026
// (feat/for-someone-you-love) for Clara (Lyon, 29, physiotherapist) from
// the 15-persona audit. She wanted a page addressed to HER — a supporter,
// not a user — with a forward-friendly message she could send without it
// feeling like a smuggled reproach. This is that page.
//
// Localised via the same pickLandingLocale path used by /program and the
// SEO landings — DE/AT/CH visitors see German, FR/LU/BE see French,
// NL sees Dutch, everyone else English. Each locale's copy is locale-first.
//
// The forward-message block has a copy-to-clipboard button so a reader
// doesn't have to select 300 characters of text by hand on a phone.

export default function ForSomeone() {
  const [locale, setLocale] = useState<Locale>("en");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    setLocale(pickLandingLocale(detectRegion()));
  }, []);

  const t = FOR_SOMEONE_COPY[locale];
  const lc = LANDING_COPY[locale];

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(t.forwardMessage);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2200);
    } catch {
      // Clipboard permission can be denied, especially in iOS cross-origin
      // contexts. Fall through silently — the user can select the text
      // themselves. Showing an error here would add noise without helping.
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-16">
      {/* Header: wordmark + Help now */}
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

      {/* Who this is for */}
      <section className="flex flex-col gap-4 border-t border-line pt-8">
        <h2 className="text-xl text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          {t.whoHeading}
        </h2>
        {t.whoParagraphs.map((p, i) => (
          <p key={i} className="text-base leading-relaxed text-ink-soft">
            {p}
          </p>
        ))}
      </section>

      {/* How to talk about it */}
      <section className="flex flex-col gap-4 border-t border-line pt-8">
        <h2 className="text-xl text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          {t.howHeading}
        </h2>
        <p className="text-base leading-relaxed text-ink-soft">{t.howIntro}</p>
        <ul className="mt-2 flex flex-col gap-3">
          {t.howBullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-base leading-relaxed text-ink">
              <span
                aria-hidden="true"
                className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs text-accent-ink"
              >
                &#43;
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* What not to do — styled in the frost accent so it reads as "the warning section" without being alarming */}
      <section
        aria-labelledby="not-h"
        className="mt-8 flex flex-col gap-4 rounded-[1.5rem] border border-frost/40 bg-frost/5 p-5 sm:p-6"
      >
        <h2
          id="not-h"
          className="text-xl text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          {t.notHeading}
        </h2>
        <p className="text-base leading-relaxed text-ink">{t.notIntro}</p>
        <ul role="list" className="mt-1 flex flex-col gap-3">
          {t.notBullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-base leading-relaxed text-ink">
              <span aria-hidden="true" className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-frost/20 text-xs text-frost">
                &minus;
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Forward message */}
      <section className="mt-8 flex flex-col gap-4 rounded-[1.5rem] border border-line bg-card p-5 sm:p-6">
        <h2 className="text-xl text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          {t.forwardHeading}
        </h2>
        <p className="text-base leading-relaxed text-ink-soft">{t.forwardIntro}</p>
        <blockquote className="mt-1 rounded-[1.25rem] border border-line bg-bg/40 p-4 text-base leading-relaxed text-ink">
          {t.forwardMessage}
        </blockquote>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onCopy}
            className="min-h-[44px] rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition active:scale-[0.98]"
          >
            {copyState === "copied" ? t.forwardCopiedLabel : t.forwardCopyLabel}
          </button>
          <Link
            href={locale === "en" ? "/" : `/${locale}`}
            className="min-h-[44px] text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
          >
            {t.backHome}
          </Link>
        </div>
      </section>

      <div className="mt-10">
        <SiteFooter locale={locale} />
      </div>
    </main>
  );
}
