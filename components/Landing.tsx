"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

/* Landing page — "Grove" rebuild (2026-10-31).
 *
 * Structure follows the approved reference prototype:
 *   /welcome : header (logo + Get help now) → hero (kicker + serif headline + body +
 *   mint CTA "Open Fix" + "How privacy works" link) → example card marked
 *   "EXAMPLE / Not a live conversation" → three honest-feature cards.
 *
 * The route "/app" is still accountless in this phase. Phase 3 adds the
 * Supabase + Google sign-in guard; nothing about the chat / safety flow changes here.
 */

const FEATURES = [
  {
    title: "No judgment",
    body: "Reflect, reduce, pause, or just get through tonight.",
  },
  {
    title: "You choose your goal",
    body: "No streaks. Skip anything.",
  },
  {
    title: "Not medical or emergency care",
    body: "Fix is an AI tool and can be wrong.",
  },
];

/* The four-step sample conversation shown on the right-hand card.
 * Labelled "EXAMPLE / Not a live conversation" so there's no implication
 * that an AI reply is actually happening on the landing page. */
type ExampleStep = {
  index: string;
  label: string;
  body: string | null;
  speaker: "user" | "fix" | "none";
};
const EXAMPLE_STEPS: ExampleStep[] = [
  {
    index: "1",
    label: "Choose a situation",
    body: "I'm having a craving",
    speaker: "user",
  },
  {
    index: "2",
    label: "A few words",
    body: "I planned not to smoke tonight but I really want to.",
    speaker: "user",
  },
  {
    index: "3",
    label: "One small suggestion",
    body: "“A craving can feel urgent. You don’t have to decide your whole future right now. Would you rather create a ten-minute pause, change your setting, or write down what’s pulling you toward it?”",
    speaker: "fix",
  },
  {
    index: "4",
    label: "You choose — try it, another idea, or leave",
    body: null,
    speaker: "none",
  },
];

export default function Landing() {
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
            Get help now
          </Link>
          {returning && (
            <Link
              href="/app"
              className="hidden min-h-[44px] items-center rounded-full bg-chip px-4 py-2 text-ink hover:bg-chip/80 sm:flex"
            >
              Open
            </Link>
          )}
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="grid items-start gap-10 py-8 md:py-14 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-6">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
            GetFreezeFix &middot; for adults 18+
          </p>

          <h1
            className="text-[clamp(2.4rem,7vw,4rem)] leading-[1.05] text-ink"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
          >
            More control,
            <br />
            one moment at a time.
          </h1>

          <p className="max-w-[46ch] text-lg leading-relaxed text-ink-soft">
            A private companion for adults who want to understand their cannabis habits and find a next
            step that feels right for them.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-5">
            <Link
              href="/app"
              className="group flex min-h-[52px] items-center gap-3 rounded-full bg-accent px-7 py-3 text-lg font-medium text-accent-ink shadow-[0_14px_32px_-14px_rgba(175,215,182,0.55)] transition active:scale-[0.98]"
            >
              Open Fix
              <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>
            <Link
              href="/privacy"
              className="min-h-[44px] text-base text-ink-soft underline-offset-4 hover:text-ink hover:underline"
            >
              How privacy works
            </Link>
          </div>

          {/* Three honest-feature list — stacked on mobile, 3-col on desktop */}
          <ul className="mt-6 grid grid-cols-1 gap-6 border-t border-line pt-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-ink">{f.title}</span>
                <span className="text-sm leading-snug text-ink-soft">{f.body}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right-hand: example card ─────────────────────────────────── */}
        <aside aria-labelledby="example-heading" className="w-full">
          {/* A lightweight SVG hero placeholder — a warm sage/mint sunrise.
              Replaces the prototype's photo with licensed-free art until a
              hero photo is signed off. */}
          <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-card">
            <svg viewBox="0 0 480 300" className="h-56 w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A2F" />
                  <stop offset="60%" stopColor="#2C5A47" />
                  <stop offset="100%" stopColor="#AFD7B6" />
                </linearGradient>
                <radialGradient id="sun" cx="0.72" cy="0.68" r="0.35">
                  <stop offset="0%" stopColor="#F2E7C6" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#AFD7B6" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="480" height="300" fill="url(#skyGrad)" />
              <rect width="480" height="300" fill="url(#sun)" />
              {/* Soft rolling hills */}
              <path d="M0 230 Q 120 180, 240 215 T 480 205 L480 300 L0 300 Z" fill="#0F2A20" opacity="0.75" />
              <path d="M0 258 Q 140 220, 280 248 T 480 240 L480 300 L0 300 Z" fill="#0A1C15" opacity="0.9" />
            </svg>
            <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/35 px-3 py-1 text-[11px] uppercase tracking-wider text-ink/85 backdrop-blur">
              Illustration
            </span>
          </div>

          <section
            aria-labelledby="example-heading"
            className="mt-4 rounded-[1.75rem] border border-line bg-card p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="example-heading" className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
                Example
              </h2>
              <span className="text-xs text-ink-faint">Not a live conversation</span>
            </div>

            <ol className="flex flex-col gap-4">
              {EXAMPLE_STEPS.map((step) => (
                <li key={step.index} className="flex flex-col gap-1.5">
                  <span className="text-xs text-ink-soft">
                    {step.index} &middot; {step.label}
                  </span>
                  {step.body !== null ? (
                    <span
                      className={
                        step.speaker === "user"
                          ? "self-start rounded-xl bg-chip px-3.5 py-2 text-sm text-ink"
                          : "self-start rounded-xl border border-line bg-bg/40 px-3.5 py-2.5 text-sm leading-relaxed text-ink"
                      }
                    >
                      {step.body}
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </section>

      <SiteFooter />
    </main>
  );
}
