"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import WaitlistCapture from "@/components/WaitlistCapture";
import PatternMirrorCard from "@/components/PatternMirrorCard";
import { LANDING_COPY, type Locale } from "@/lib/landing-copy";

type Props = { locale?: Locale };

export default function Landing({ locale = "en" }: Props) {
  const copy = LANDING_COPY[locale];
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    try {
      setReturning(window.localStorage.getItem("ff_adult") === "yes");
    } catch {
      // Storage can be blocked; the homepage still works without it.
    }
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-16">
      <header className="flex items-center justify-between gap-4 py-5">
        <Link href={locale === "en" ? "/" : `/${locale}`} aria-label="Fix home" className="flex items-center gap-2.5">
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
        <nav aria-label="Main navigation" className="flex items-center gap-2 text-sm sm:gap-3">
          <Link
            href="/help"
            className="flex min-h-[44px] items-center gap-2 rounded-full border border-frost/60 px-3 py-2 text-frost transition hover:border-frost hover:bg-frost/10 sm:px-4"
          >
            <HelpIcon />
            <span>{copy.getHelpNow}</span>
          </Link>
          {returning ? (
            <Link
              href="/home"
              className="hidden min-h-[44px] items-center rounded-full bg-chip px-4 py-2 text-ink hover:bg-chip/80 sm:flex"
            >
              {copy.openReturning}
            </Link>
          ) : null}
          {copy.languageLinks.map((link) => (
            <Link
              key={link.lang}
              href={link.href}
              lang={link.lang}
              aria-label={link.label}
              className="hidden min-h-[44px] items-center rounded-full border border-line/80 px-3 py-2 text-xs uppercase tracking-wider text-ink-soft transition hover:border-line hover:text-ink sm:flex"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="grid items-center gap-9 py-8 md:gap-12 md:py-14 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col gap-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
            {copy.kicker}
          </p>
          <h1
            className="max-w-[15ch] text-[clamp(2.5rem,7vw,4.25rem)] leading-[1.04] text-ink"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.02em" }}
          >
            {copy.heroHeadlineLine1}
            <br />
            <span className="text-accent">{copy.heroHeadlineLine2}</span>
          </h1>
          <p className="max-w-[46ch] text-lg leading-relaxed text-ink-soft">
            {copy.heroBody}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-5">
            <Link
              href="#waitlist"
              className="group flex min-h-[52px] items-center gap-3 rounded-full bg-accent px-7 py-3 text-base font-medium text-accent-ink shadow-[0_14px_32px_-14px_rgba(156,175,136,0.5)] transition active:scale-[0.98]"
            >
              {copy.ctaWaitlist}
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
          <p className="max-w-[54ch] text-sm leading-relaxed text-ink-faint">
            {copy.releaseNote}
          </p>

          <div id="waitlist" className="mt-2 scroll-mt-8">
            <WaitlistCapture source="home" variant="compact" locale={locale} />
          </div>

          <ul className="mt-3 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
            {copy.features.map((feature) => (
              <li key={feature.title} className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-ink">{feature.title}</span>
                <span className="text-sm leading-snug text-ink-soft">{feature.body}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full">
          <PatternMirrorCard locale={locale} />
        </div>
      </section>

      <section aria-labelledby="loop-heading" className="border-t border-line pt-10 md:pt-14">
        <div className="max-w-2xl">
          <h2
            id="loop-heading"
            className="text-[clamp(1.8rem,4vw,2.5rem)] leading-tight text-ink"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            {copy.loopHeading}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-soft">{copy.loopIntro}</p>
        </div>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {copy.loopSteps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-line bg-card p-5 sm:p-6">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
                0{index + 1}
              </span>
              <h3 className="mt-3 text-lg font-medium text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}

function HelpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
    </svg>
  );
}
