"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChatDemo from "@/components/ChatDemo";
import FactCard from "@/components/FactCard";
import Suggest from "@/components/Suggest";
import SiteFooter from "@/components/SiteFooter";

// The six situation cards from the prototype, each mapping to an existing scenario.
const SITUATIONS = [
  {
    id: "overwhelmed",
    icon: "🍃",
    title: "Stuck after a smoke",
    subtitle: "Everything feels too much right now",
  },
  {
    id: "loop",
    icon: "💭",
    title: "Overthinking",
    subtitle: "Same thought on repeat, can’t switch off",
  },
  {
    id: "awkward",
    icon: "👤",
    title: "Social discomfort",
    subtitle: "Everyone else seems fine but you",
  },
  {
    id: "start",
    icon: "⏳",
    title: "Can’t start a task",
    subtitle: "Been staring at it, can’t begin",
  },
  {
    id: "reply",
    icon: "💌",
    title: "Can’t reply",
    subtitle: "The message has been sitting there",
  },
  {
    id: "tomorrow",
    icon: "🌅",
    title: "Too much for tomorrow",
    subtitle: "Need to make it smaller",
  },
];

const SOUND_FAMILIAR = [
  { emoji: "🍃", text: "I smoked and now everything feels a bit overwhelming.", scenario: "overwhelmed" },
  { emoji: "💭", text: "I keep replaying what I said yesterday.", scenario: "said" },
  { emoji: "👤", text: "I feel uncomfortable around people right now.", scenario: "awkward" },
  { emoji: "⏳", text: "I can’t get myself to start this task.", scenario: "start" },
  { emoji: "💌", text: "I need to reply to someone but I’m overthinking it.", scenario: "reply" },
  { emoji: "🧠", text: "I have too much on my mind and don’t know where to start.", scenario: "loop" },
];

const STEPS = [
  {
    n: "01",
    title: "Say what’s happening",
    body: "Pick a situation or type it messily. You don’t need to describe it perfectly.",
  },
  {
    n: "02",
    title: "Get one small step",
    body: "Fix replies briefly with a single action you can usually try in a minute or two.",
  },
  {
    n: "03",
    title: "Leave whenever",
    body: "Try it, ask for another idea, draft a message — or close the tab. No streaks, no guilt.",
  },
];

export default function Landing() {
  const [returning, setReturning] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");

  useEffect(() => {
    try {
      setReturning(window.localStorage.getItem("ff_adult") === "yes");
    } catch {
      /* storage can be blocked */
    }
  }, []);

  // Build the CTA link based on selection + optional free text
  function ctaHref(): string {
    if (selected) {
      const parts = [`/app?s=${selected}`];
      const msg = freeText.trim() || SITUATIONS.find((s) => s.id === selected)?.subtitle || "";
      if (msg) parts.push(`msg=${encodeURIComponent(msg)}`);
      return parts.join("&");
    }
    if (freeText.trim()) {
      // Free text only, no card selected — use "talk" scenario as general entry
      return `/app?s=talk&msg=${encodeURIComponent(freeText.trim())}`;
    }
    return "/app";
  }

  const canGo = selected || freeText.trim();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-16">
      {/* Header */}
      <header className="flex items-center justify-between py-5">
        <span className="text-lg font-extrabold tracking-tight text-ink">freezefix</span>
        <nav className="flex items-center gap-3 text-sm text-ink-soft sm:gap-5">
          <a href="/privacy" className="hidden hover:text-ink sm:block">
            Privacy
          </a>
          <Link
            href="/help"
            className="rounded-full border border-line px-3 py-1.5 text-ink-soft hover:text-ink"
          >
            Get help
          </Link>
          {returning && (
            <Link href="/app" className="rounded-full bg-chip px-4 py-2 text-ink hover:bg-chip/80">
              Open
            </Link>
          )}
        </nav>
      </header>

      {/* Hero section with situation cards + chat demo */}
      <section className="grid items-start gap-10 py-8 md:py-14 lg:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-6">
          {/* Kicker */}
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-frost">
            A private companion for stuck moments
          </p>

          {/* Hero headline */}
          <h1 className="text-[2.5rem] font-extrabold leading-[1.05] text-ink sm:text-[3.5rem]">
            When your mind feels stuck,{" "}
            <em className="not-italic text-frost" style={{ fontStyle: "italic" }}>
              find your next move
            </em>
          </h1>

          <p className="max-w-[46ch] text-lg leading-relaxed text-ink-soft">
            Pick a situation. Fix gives you one small, doable next step — not a lecture, not a plan.
            Just the bit that actually helps right now.
          </p>

          {/* Six situation cards — 3×2 grid */}
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SITUATIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(selected === s.id ? null : s.id)}
                aria-pressed={selected === s.id}
                className={`flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition active:scale-[0.97] ${
                  selected === s.id
                    ? "border-frost bg-frost/10 ring-1 ring-frost/30"
                    : "border-line bg-card hover:border-ink-faint"
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-chip text-xl" aria-hidden="true">{s.icon}</span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.95rem] font-semibold leading-snug text-ink">{s.title}</span>
                  <span className="text-[0.8rem] leading-snug text-ink-soft">{s.subtitle}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Free text input */}
          <div className="mt-1">
            <label htmlFor="free-text" className="mb-2 block text-sm text-ink-soft">
              Or just say what&apos;s on your mind, in your own words...
            </label>
            <textarea
              id="free-text"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value.slice(0, 400))}
              rows={2}
              placeholder="e.g. smoked an hour ago and can’t stop thinking about what I said at dinner..."
              className="w-full resize-none rounded-2xl border border-line bg-card px-4 py-3.5 text-base text-ink placeholder:text-ink-faint focus:border-frost focus:outline-none"
            />
          </div>

          {/* CTA button */}
          <div className="flex flex-col items-start gap-2">
            <Link
              href={ctaHref()}
              aria-disabled={!canGo}
              className={`rounded-[1.6rem] px-8 py-4 text-lg font-bold transition active:scale-[0.98] ${
                canGo
                  ? "bg-accent text-accent-ink shadow-[0_14px_32px_-14px_rgba(227,182,116,0.6)]"
                  : "pointer-events-none bg-accent/40 text-accent-ink/60"
              }`}
            >
              Find my next move &rarr;
            </Link>
            <span className="text-xs font-medium uppercase tracking-widest text-ink-faint">
              Private &middot; No account
            </span>
          </div>

          {/* Privacy reassurance row */}
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-frost" aria-hidden="true">
                <path d="M8 1.5L3 4v3.5c0 3.2 2.1 6.2 5 7 2.9-.8 5-3.8 5-7V4L8 1.5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              18+ only
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-frost" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M5.5 8.5l2 2 3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              No account needed
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-frost" aria-hidden="true">
                <rect x="3" y="6.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M5.5 6.5V5a2.5 2.5 0 015 0v1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              AI processes, doesn&apos;t store
            </span>
          </div>
        </div>

        {/* Chat demo on the right (desktop), below on mobile */}
        <div className="hidden lg:block lg:w-[22rem] lg:pt-8">
          <ChatDemo />
        </div>
      </section>

      {/* Mobile chat demo — shown below the hero on small screens */}
      <div className="lg:hidden">
        <ChatDemo />
      </div>

      {/* How it works */}
      <section id="how" className="scroll-mt-6 py-14">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">How it works</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-[1.75rem] border border-line bg-card p-6">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-sm font-bold text-accent">{s.n}</span>
              <h3 className="mt-3 text-xl font-bold leading-tight text-ink">{s.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sound familiar? */}
      <section className="ff-rise py-14">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Sound familiar?</h2>
        <p className="mt-2 max-w-[48ch] text-lg text-ink-soft">
          Tap one. Fix already knows where you&apos;re at.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SOUND_FAMILIAR.map((s) => (
            <Link
              key={s.text}
              href={`/app?s=${s.scenario}&msg=${encodeURIComponent(s.text)}`}
              className="flex items-center gap-3.5 rounded-[1.75rem] border border-line bg-card px-5 py-4 transition hover:border-accent active:scale-[0.97]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-chip text-xl" aria-hidden="true">{s.emoji}</span>
              <span className="text-[0.95rem] leading-snug text-ink">{s.text}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Is this normal? */}
      <section className="py-14">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Is this normal?</h2>
        <p className="mt-2 max-w-[48ch] text-lg text-ink-soft">
          Things people who smoke think that aren&apos;t true. Tap to flip.
        </p>
        <div className="mt-6">
          <FactCard everyMs={8000} />
        </div>
      </section>

      {/* Honest limits */}
      <section className="py-14">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
          Supportive software,
          <br />
          honest about its limits.
        </h2>
        <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
          Fix isn&apos;t a therapist, doctor or emergency service, and never diagnoses. If things feel unsafe,
          it will point you to real people &mdash; use{" "}
          <Link href="/help" className="font-medium text-ink underline underline-offset-4 hover:text-accent">
            Get help
          </Link>{" "}
          at the top any time. And it will never tell you it&apos;s fine to drive after a smoke.
        </p>
      </section>

      {/* Feedback */}
      <section className="py-14">
        <Suggest compact />
      </section>

      <SiteFooter />
    </main>
  );
}
