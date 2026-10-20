"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChatDemo from "@/components/ChatDemo";
import FactCard from "@/components/FactCard";
import Suggest from "@/components/Suggest";
import SiteFooter from "@/components/SiteFooter";

const SOUND_FAMILIAR = [
  { emoji: "😶‍🌫️", text: "I smoked and now everything feels a bit overwhelming.", scenario: "overwhelmed" },
  { emoji: "🔁", text: "I keep replaying what I said yesterday.", scenario: "said" },
  { emoji: "👥", text: "I feel uncomfortable around people right now.", scenario: "awkward" },
  { emoji: "🧊", text: "I can't get myself to start this task.", scenario: "start" },
  { emoji: "💬", text: "I need to reply to someone but I'm overthinking it.", scenario: "reply" },
  { emoji: "🌀", text: "I have too much on my mind and don't know where to start.", scenario: "loop" },
];

const STEPS = [
  {
    n: "01",
    title: "Say what's happening",
    body: "Pick a situation or type it messily. You don't need to describe it perfectly.",
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

  useEffect(() => {
    try {
      setReturning(window.localStorage.getItem("ff_adult") === "yes");
    } catch {
      /* storage can be blocked */
    }
  }, []);

  const cta = returning ? "Open FreezeFix" : "Start free";

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-16">
      <header className="flex items-center justify-between py-5">
        <span className="text-lg font-extrabold tracking-tight text-ink">freezefix</span>
        <nav className="flex items-center gap-3 text-sm text-ink-soft sm:gap-5">
          <a href="#how" className="hidden hover:text-ink sm:block">
            How it works
          </a>
          {/* Crisis route is reachable from here without the 18+ gate, sign-up or payment. */}
          <Link
            href="/help"
            className="rounded-full border border-line px-3 py-1.5 text-ink-soft hover:text-ink"
          >
            Help now
          </Link>
          <Link href="/app" className="rounded-full bg-chip px-4 py-2 text-ink hover:bg-chip/80">
            Open
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="grid items-center gap-10 py-10 md:grid-cols-2 md:py-16">
        <div className="flex flex-col gap-6">
          <h1 className="text-[2.9rem] font-extrabold leading-[0.95] text-ink sm:text-[4.25rem]">
            Frozen
            <br />
            after a smoke?
          </h1>
          <p className="max-w-[34ch] text-xl leading-snug text-ink-soft">
            You had a smoke and now your head&apos;s going. Can&apos;t start, can&apos;t reply, can&apos;t be in the
            room. FreezeFix is the mate who gets it and doesn&apos;t make it a thing.
          </p>
          <p className="max-w-[36ch] text-lg leading-relaxed text-ink-faint">
            We&apos;re not here to tell you to stop. That&apos;s your call and we can&apos;t change it anyway. We
            can help with the bit afterwards.
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="rounded-[1.6rem] bg-accent px-7 py-4 text-lg font-bold text-accent-ink shadow-[0_14px_32px_-14px_rgba(227,182,116,0.6)] transition active:scale-[0.98]"
            >
              {cta}
            </Link>
            <a
              href="#how"
              className="rounded-[1.6rem] border border-line px-7 py-4 text-lg font-semibold text-ink transition hover:border-ink-soft active:scale-[0.98]"
            >
              See how it works
            </a>
          </div>
          <p className="text-sm leading-relaxed text-ink-faint">
            18+. First conversation free, no card.{" "}
            <Link href="/help" className="text-ink-soft underline underline-offset-4 hover:text-ink">
              Crisis help is always free.
            </Link>
          </p>
        </div>
        <ChatDemo />
      </section>

      {/* Sound familiar? — quick-hit scenario cards that link straight to the app */}
      <section className="ff-rise py-12">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Sound familiar?</h2>
        <p className="mt-2 max-w-[48ch] text-lg text-ink-soft">
          Tap one. Fix already knows where you&apos;re at.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SOUND_FAMILIAR.map((s) => (
            <Link
              key={s.text}
              href={`/app?s=${s.scenario}&msg=${encodeURIComponent(s.text)}`}
              className="flex items-start gap-3 rounded-[1.75rem] border border-line bg-card p-5 transition hover:border-accent active:scale-[0.97]"
            >
              <span className="mt-0.5 text-2xl" aria-hidden="true">{s.emoji}</span>
              <span className="text-base leading-snug text-ink">{s.text}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-6 py-12">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">How it works</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-[1.75rem] border border-line bg-card p-6">
              <span className="text-sm font-bold tracking-widest text-accent">{s.n}</span>
              <h3 className="mt-3 text-xl font-bold leading-tight text-ink">{s.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Is this normal? — rotating myth-busting facts */}
      <section className="py-12">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Is this normal?</h2>
        <p className="mt-2 max-w-[48ch] text-lg text-ink-soft">
          Things people who smoke think that aren&apos;t true. Tap to flip.
        </p>
        <div className="mt-6">
          <FactCard everyMs={8000} />
        </div>
      </section>

      {/* Honest limits */}
      <section className="py-12">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
          Supportive software,
          <br />
          honest about its limits.
        </h2>
        <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
          Fix isn&apos;t a therapist, doctor or emergency service, and never diagnoses. If things feel unsafe,
          it will point you to real people — use{" "}
          <Link href="/help" className="font-medium text-ink underline underline-offset-4 hover:text-accent">
            Get help
          </Link>{" "}
          at the top any time. And it will never tell you it&apos;s fine to drive after a smoke.
        </p>
      </section>

      {/* Feedback */}
      <section className="py-12">
        <Suggest compact />
      </section>

      <SiteFooter />
    </main>
  );
}
