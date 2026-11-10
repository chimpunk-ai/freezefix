"use client";

import Link from "next/link";
import { HelpChip, Wordmark } from "@/components/Brand";
import { PatternCard } from "@/components/PatternCard";
import { weekStats } from "@/lib/pattern";
import { SAMPLE_END, SAMPLE_GOAL, sampleEntries } from "@/lib/sample";

// The front door. One idea, three steps, one real card.
//
// No scenario cards, no founder pitch, no waitlist, no countdown. The visitor
// should understand the whole product before they scroll past the hero, and
// the thing they see first is the thing the product actually produces.

const sample = weekStats(sampleEntries(), SAMPLE_GOAL, SAMPLE_END);

const STEPS = [
  {
    n: "01",
    title: "the log",
    body: "yes or no. one face. up to three chips. nine seconds, at bedtime, in the dark. hold the mic if you want to say it out loud — we keep the words, throw the audio away.",
  },
  {
    n: "02",
    title: "the mirror",
    body: "sunday, 8:15pm, one notification. a card slides up and tells you what the week looked like in plain english. four nights out of seven. mostly after work. that's it. no grade.",
  },
  {
    n: "03",
    title: "your thing",
    body: "one small thing you'd like to do more of. run twice. call your brother back. the card notices whether you did, and says so without a party.",
  },
];

export default function Landing() {
  return (
    <main className="min-h-dvh">
      <header className="mx-auto flex w-full max-w-[560px] items-center justify-between px-5 pb-6 pt-5">
        <Wordmark />
        <HelpChip compact />
      </header>

      <section className="mx-auto w-full max-w-[560px] px-5">
        <h1 className="font-display text-40 leading-[1.08] text-ink">
          you don&rsquo;t have to quit.
          <br />
          you just have to notice.
        </h1>
        <p className="mt-5 max-w-[42ch] text-20 leading-[1.35] text-ink">
          a private nightly check-in for people who smoke weed. we don&rsquo;t make you quit —
          we show you what your week actually looks like, so you can decide what to do about it.
        </p>
        <p className="mt-3 max-w-[38ch] text-14 text-ink-soft">
          three taps a night. one card on sunday. no streak, no score, nobody telling you off.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/app"
            className="rounded-pill bg-signpost px-6 py-3 text-16 font-medium text-signpost-ink no-underline"
          >
            start the free week
          </Link>
          <Link href="/plans" className="text-14 text-ink-faint underline decoration-line underline-offset-4 hover:text-ink-soft">
            what it costs
          </Link>
        </div>
        <p className="mt-3 text-12 text-ink-faint">
          seven days free, no card. no email, no password — a name you pick, and that&rsquo;s it.
        </p>
      </section>

      <section className="mx-auto mt-10 w-full max-w-[560px] px-5">
        <p className="mb-2 text-12 uppercase tracking-[0.14em] text-signpost">what sunday looks like</p>
        <div className="rounded-card border border-line bg-card/60 p-2">
          <PatternCard name="nico" stats={sample} onAsk={() => {}} dimmed />
        </div>
        <p className="mt-2 text-12 text-ink-faint">
          A sample week from a sample log, not a mockup of something we haven&rsquo;t built.
        </p>
      </section>

      <section className="mx-auto mt-14 w-full max-w-[560px] px-5">
        <div className="space-y-8">
          {STEPS.map((s) => (
            <div key={s.n} className="border-t border-line pt-5">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-28 tabular-nums text-signpost">{s.n}</span>
                <h2 className="font-display text-20 text-ink">{s.title}</h2>
              </div>
              <p className="mt-2 text-14 leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-[560px] px-5">
        <div className="rounded-card border border-line bg-card px-4 py-5">
          <h2 className="font-display text-20 text-ink">and Fix, when you want a knife not a friend.</h2>
          <p className="mt-2 text-14 leading-relaxed text-ink-soft">
            inside the card there&rsquo;s one button. ask it one question about your week and it answers
            from your own log — dry, brief, and it stops. five questions a day. it never messages you
            first, never asks how you&rsquo;re feeling, and never tells you what to do.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-[560px] px-5">
        <h2 className="font-display text-20 text-ink">what this isn&rsquo;t</h2>
        <ul className="mt-3 space-y-2 text-14 text-ink-soft">
          {[
            "not a quitting app. no counter, no clean days, no relapse.",
            "not a strain tracker. nobody here cares about terpenes.",
            "not a community. no feeds, no comparison, no posting.",
            "not a therapist, a coach, or an AI girlfriend.",
            "not a place that thinks you're broken for smoking.",
          ].map((line) => (
            <li key={line} className="flex gap-3">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-14 w-full max-w-[560px] px-5">
        <div className="rounded-card border border-accent/30 bg-accent/[0.06] px-4 py-5">
          <h2 className="font-display text-28 text-ink">$39.99 a year.</h2>
          <p className="mt-1 text-14 text-ink-soft">
            or $9.99 a month if you&rsquo;d rather not commit. seven days free first, no card, and the
            whole thing is open for those seven days — log, card, shelf, Fix.
          </p>
          <Link
            href="/plans"
            className="mt-4 inline-block rounded-pill bg-accent px-5 py-2.5 text-14 font-medium text-bg no-underline"
          >
            the price, honestly
          </Link>
        </div>
      </section>

      <footer className="mx-auto mt-14 w-full max-w-[560px] px-5 pb-14">
        <div className="border-t border-line pt-5 text-12 text-ink-faint">
          <p className="max-w-[46ch]">
            everything you write stays on your phone unless you ask for a voice note to be typed out or
            you talk to Fix. no account, no email, no way for us to look you up.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/help" className="text-frost underline decoration-frost/40 underline-offset-4">
              get help now
            </Link>
            <Link href="/privacy" className="underline decoration-line underline-offset-4">
              privacy
            </Link>
            <Link href="/terms" className="underline decoration-line underline-offset-4">
              terms
            </Link>
            <Link href="/refunds" className="underline decoration-line underline-offset-4">
              refunds
            </Link>
          </div>
          <p className="mt-4">fix · 18+ · made for adults who smoke and wonder</p>
        </div>
      </footer>
    </main>
  );
}
