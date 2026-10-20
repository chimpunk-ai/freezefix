"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChatDemo from "@/components/ChatDemo";
import SiteFooter from "@/components/SiteFooter";
import { SCENARIOS } from "@/lib/scenarios";
import { plansFor, TRIAL_DAYS } from "@/lib/plans";
import { detectRegion } from "@/lib/country";
import FactCard from "@/components/FactCard";
import Suggest from "@/components/Suggest";
import { LoopArt, StartArt, RoomArt } from "@/components/Art";

const SOUND_FAMILIAR = [
  { emoji: "😶‍🌫️", text: "I smoked and now everything feels a bit overwhelming." },
  { emoji: "🔁", text: "I keep replaying what I said yesterday." },
  { emoji: "👥", text: "I feel uncomfortable around people right now." },
  { emoji: "🧊", text: "I can't get myself to start this task." },
  { emoji: "💬", text: "I need to reply to someone but I'm overthinking it." },
  { emoji: "🌀", text: "I have too much on my mind and don't know where to start." },
];

// The public front door. Everything here is honest: no invented reviews, no download counts,
// no testimonials. The only "proof" offered is the product itself, playing in a phone frame.

const STEPS = [
  {
    n: "01",
    title: "Say what's going on",
    body: "Type it, say it, or paste the message you can't answer. No forms, no mood sliders, no questions you have to get through first.",
  },
  {
    n: "02",
    title: "Get a reply that sounds human",
    body: "One or two lines, like a mate texting back. It listens before it suggests anything, and it never lectures you about what you've taken.",
  },
  {
    n: "03",
    title: "Do one small thing",
    body: "One move you can do from where you're sitting. Or the actual words to send. Or nothing at all, if you just wanted to talk.",
  },
];

export default function Landing() {
  const [returning, setReturning] = useState(false);
  const [region, setRegion] = useState("");

  useEffect(() => {
    setRegion(detectRegion());
    try {
      setReturning(window.localStorage.getItem("ff_adult") === "yes");
    } catch {
      /* storage can be blocked; they just see the first-time wording */
    }
  }, []);

  const plans = plansFor(region);
  const cta = returning ? "Open FreezeFix" : "Start free";

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-16">
      <header className="flex items-center justify-between py-5">
        <span className="text-lg font-extrabold tracking-tight text-ink">freezefix</span>
        <nav className="flex items-center gap-3 text-sm text-ink-soft sm:gap-5">
          <a href="#how" className="hidden hover:text-ink sm:block">
            How it works
          </a>
          <a href="#pricing" className="hidden hover:text-ink sm:block">
            Pricing
          </a>
          {/* Crisis route is reachable from here without the 18+ gate, sign-up or payment.
              Quiet styling so it isn't a scare button; always visible so it's never buried. */}
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
              href="/app"
              className="flex items-start gap-3 rounded-[1.75rem] border border-line bg-card p-5 transition hover:border-accent active:scale-[0.97]"
            >
              <span className="mt-0.5 text-2xl" aria-hidden="true">{s.emoji}</span>
              <span className="text-base leading-snug text-ink">{s.text}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Is this normal? Facts, because "am I the only one" is the actual question. */}
      <section className="ff-rise py-12">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Is this normal?</h2>
        <p className="mt-2 max-w-[48ch] text-lg text-ink-soft">
          Short answer, usually yes. These rotate, and they&apos;re in the app too.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <FactCard />
          <FactCard everyMs={15000} />
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

      {/* Real scenario cards, same ones as in the app, each opening that conversation */}
      <section className="py-12">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Start where you are</h2>
        <p className="mt-2 max-w-[48ch] text-lg text-ink-soft">
          Tap one and the chat opens already knowing the situation. These are the same cards you get inside.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SCENARIOS.map((s) => (
            <Link
              key={s.id}
              href={`/app?s=${s.id}`}
              className="flex min-h-[8.5rem] flex-col justify-between rounded-[1.75rem] border border-line bg-card p-4 transition active:scale-[0.97]"
            >
              <span className="text-3xl" aria-hidden="true">
                {s.emoji}
              </span>
              <span>
                <span className="block text-base font-semibold leading-tight text-ink">{s.label}</span>
                <span className="mt-0.5 block text-sm leading-snug text-ink-faint">{s.blurb}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Privacy, which is the actual reason to use this over a general assistant */}
      <section className="py-12">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Nothing tied to you</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              t: "No account",
              b: "No email, no password, no name unless you want to give Fix one. You open it and start talking.",
            },
            {
              t: "Memory stays on your phone",
              b: "What Fix knows about you and the people in your life is stored on your device, not our servers. You can read all of it and delete any line.",
            },
            {
              t: "We don't keep what you type",
              b: "Messages go to our AI provider to write the reply, and they keep them 30 days. We store counts, never content.",
            },
          ].map((c) => (
            <div key={c.t} className="rounded-[1.75rem] border border-line bg-card p-6">
              <h3 className="text-xl font-bold leading-tight text-ink">{c.t}</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">{c.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-6 py-12">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Pricing</h2>
        <p className="mt-2 text-lg text-ink-soft">
          First conversation free, no card. Then a {TRIAL_DAYS}-day trial.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[plans.yearly, plans.monthly].map((p) => (
            <div
              key={p.id}
              className={`rounded-[1.75rem] border p-6 ${
                p.recommended ? "border-accent bg-card" : "border-line bg-card"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-bold text-ink">{p.label}</h3>
                {p.recommended && (
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-ink">Best value</span>
                )}
              </div>
              <p className="mt-3 text-4xl font-extrabold text-ink">
                {p.price}
                <span className="text-lg font-normal text-ink-faint">/{p.per}</span>
              </p>
              {p.note && <p className="mt-1 text-base text-ink-soft">{p.note}</p>}
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-ink-faint">
          Prices shown in your local currency at checkout, with tax applied by our payment provider. Cancel any time in
          settings. Crisis help, the safety check and emergency screens are never behind a payment.
        </p>
        <Link
          href="/app"
          className="mt-6 inline-block rounded-[1.6rem] bg-accent px-7 py-4 text-lg font-bold text-accent-ink"
        >
          {cta}
        </Link>
      </section>

      {/* Asked while the product is still being finished, so the answer can still change it. */}
      <section className="ff-rise py-12">
        <Suggest />
      </section>

      {/* Honest limits */}
      <section className="py-12">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">What this isn&apos;t</h2>
        <div className="mt-5 flex flex-col gap-3 text-lg leading-relaxed text-ink-soft">
          <p>
            Fix is an AI, not a therapist, a doctor or an emergency service. It can&apos;t diagnose you and it won&apos;t
            pretend to.
          </p>
          <p>
            It won&apos;t tell you to stop. That&apos;s your call. It also won&apos;t give you advice on doses, mixing or
            buying anything.
          </p>
          <p>
            If something sounds urgent it stops the chat and shows you real numbers for where you are, free, whether or
            not you&apos;ve ever paid us a penny.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
