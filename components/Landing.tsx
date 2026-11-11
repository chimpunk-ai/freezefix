import Link from "next/link";
import type { ReactNode } from "react";
import { MoodFace } from "@/components/MoodFace";
import { PatternCard, WeekGrid } from "@/components/PatternCard";
import { Container, Kicker, Main, SiteHeader } from "@/components/Shell";
import SiteFooter from "@/components/SiteFooter";
import { TrustBadge } from "@/components/TrustBadge";
import { MOOD_LABEL, TRIGGER_LABEL } from "@/lib/entry";
import { goalSentence, weekStats } from "@/lib/pattern";
import { plansFor, TRIAL_DAYS } from "@/lib/plans";
import { SAMPLE_END, SAMPLE_GOAL, sampleEntries } from "@/lib/sample";

// The front door. One idea, three steps, one real card.
//
// On a phone it reads top to bottom. On a laptop the headline and the
// Sunday card sit side by side, because the card is the product and the
// only honest proof we have; everything else on the page is interface
// pulled from the app itself, not illustration. No scenario cards, no
// founder pitch, no waitlist, no countdown.

const sample = weekStats(sampleEntries(), SAMPLE_GOAL, SAMPLE_END);
const prices = plansFor("US");

const cta =
  "ff-chip inline-flex min-h-12 items-center rounded-pill bg-signpost px-6 text-16 font-medium text-signpost-ink no-underline shadow-[0_8px_24px_-12px_rgba(240,168,104,0.6)] transition-transform hover:-translate-y-[1px]";
const quiet =
  "inline-flex min-h-12 items-center rounded-pill border border-line px-5 text-14 text-ink-soft no-underline hover:border-ink-faint hover:text-ink";

export default function Landing({ paymentsOn }: { paymentsOn: boolean }) {
  return (
    <>
      <SiteHeader cta={{ href: "/app", label: "open the app" }} />

      <Main>
        {/* Hero: words left, the real card right. */}
        <section aria-labelledby="hero-heading">
          <Container className="grid items-center gap-10 pb-6 pt-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:pb-12 lg:pt-10">
            <div className="max-w-[46ch]">
              <h1 id="hero-heading" className="font-display text-28 leading-[1.08] text-ink sm:text-40 lg:text-56">
                you don&rsquo;t have to quit.
                <br />
                you just have to notice.
              </h1>
              <p className="mt-5 text-16 leading-[1.5] text-ink sm:text-20 sm:leading-[1.35]">
                a private nightly check-in for people who smoke weed. we don&rsquo;t make you quit —
                we show you what your week actually looks like, so you can decide what to do about it.
              </p>
              <p className="mt-3 max-w-[38ch] text-14 text-ink-soft">
                three taps a night. one card on sunday. no streak, no score, nobody telling you off.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/app" className={cta}>
                  {paymentsOn ? `start ${TRIAL_DAYS} days free` : "start, it's free"}
                </Link>
                <Link href="/plans" className={quiet}>
                  what it costs
                </Link>
              </div>
              <div className="mt-6 max-w-[420px]">
                <TrustBadge />
              </div>
            </div>

            <figure className="lg:justify-self-end lg:w-full lg:max-w-[520px]">
              <Kicker>what sunday looks like</Kicker>
              <div className="mt-3 rounded-sheet shadow-[0_32px_80px_-40px_rgba(156,175,136,0.35)]">
                <PatternCard name="nico" stats={sample} dimmed />
              </div>
              <figcaption className="mt-3 text-12 text-ink-faint">
                a sample week from a sample log, not a mockup of something we haven&rsquo;t built.
              </figcaption>
            </figure>
          </Container>
        </section>

        {/* How it works: three steps, each with the piece of interface it describes. */}
        <section aria-labelledby="how-heading" className="mt-10 border-t border-line lg:mt-16">
          <Container className="pt-10 lg:pt-14">
            <h2 id="how-heading" className="font-display text-28 text-ink lg:text-40">
              the whole app, in order.
            </h2>
            <ol className="mt-8 grid gap-10 lg:grid-cols-3 lg:gap-8">
              <Step
                n="1"
                title="the log"
                body="yes or no. one face. up to three chips. nine seconds, at bedtime, in the dark. hold the mic if you want to say it out loud — we keep the words, throw the audio away."
              >
                <LogPreview />
              </Step>
              <Step
                n="2"
                title="the mirror"
                body="sunday, 8:15pm, one notification. a card slides up and tells you what the week looked like in plain english. four nights out of seven. mostly after work. that's it. no grade."
              >
                <div className="rounded-card border border-line bg-card p-4">
                  <p className="text-14 text-ink-soft">{sample.sentences[0]}</p>
                  <div className="mt-3">
                    <WeekGrid stats={sample} />
                  </div>
                </div>
              </Step>
              <Step
                n="3"
                title="your thing"
                body="one small thing you'd like to do more of. run twice. call your brother back. the card notices whether you did, and says so without a party."
              >
                <div className="rounded-card border border-accent/25 bg-accent/[0.07] px-4 py-3 text-14 text-ink">
                  {sample.goalLine ? goalSentence(sample.goalLine) : null}
                </div>
              </Step>
            </ol>
          </Container>
        </section>

        {/* Fix, and what this isn't. Two columns on a laptop. */}
        <section aria-labelledby="fix-heading" className="mt-16 lg:mt-24">
          <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="rounded-sheet border border-signpost/25 bg-signpost/[0.04] p-6 lg:p-8">
              <div className="flex items-center gap-2">
                <span aria-hidden className="h-[10px] w-[10px] rounded-full bg-signpost/80" />
                <Kicker>fix</Kicker>
              </div>
              <h2 id="fix-heading" className="mt-2 font-display text-20 leading-tight text-ink lg:text-28">
                when you want a knife, not a friend.
              </h2>
              <p className="mt-3 text-14 leading-relaxed text-ink-soft lg:text-16">
                inside the card there&rsquo;s one button. ask it one question about your week and it
                answers from your own log — dry, brief, and it stops. five questions a day. it never
                messages you first, never asks how you&rsquo;re feeling, and never tells you what to do.
              </p>
              <div className="mt-5 space-y-2">
                <Bubble who="you">why did i smoke so much this week?</Bubble>
                <Bubble who="fix">
                  the log doesn&rsquo;t say why, it says when. four nights, three of them you tapped
                  &ldquo;after work&rdquo;. that&rsquo;s the shape. what it means is yours.
                </Bubble>
              </div>
            </div>

            <div className="lg:pt-2">
              <h2 className="font-display text-20 text-ink lg:text-28">what this isn&rsquo;t</h2>
              <ul className="mt-4 space-y-3 text-14 text-ink-soft lg:text-16">
                {[
                  "not a quitting app. no counter, no clean days, no relapse.",
                  "not a strain tracker. nobody here cares about terpenes.",
                  "not a community. no feeds, no comparison, no posting.",
                  "not a therapist, a coach, or an AI girlfriend.",
                  "not a place that thinks you're broken for smoking.",
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <span aria-hidden className="mt-[0.75em] h-px w-3 shrink-0 bg-signpost/70" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        {/* The price, honestly. The copy changes with whether a checkout exists. */}
        <section aria-labelledby="price-heading" className="mt-16 lg:mt-24">
          <Container>
            <div className="grid gap-6 rounded-sheet border border-line bg-card/70 p-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-12 lg:p-10">
              <div>
                <Kicker>{paymentsOn ? "the price" : "the price, when it arrives"}</Kicker>
                <h2 id="price-heading" className="mt-2 font-display text-28 leading-tight text-ink lg:text-40">
                  {prices.yearly.price} a year.
                </h2>
                <p className="mt-2 max-w-[36ch] text-14 text-ink-soft lg:text-16">
                  or {prices.monthly.price} a month if you&rsquo;d rather not commit.{" "}
                  {paymentsOn
                    ? `${TRIAL_DAYS} days free first, no card, and the whole thing is open for those days — log, card, shelf, fix.`
                    : "right now the whole thing is free while we finish the payments side. nothing can be charged, and nothing locks."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <Link href="/plans" className={cta}>
                  the price, honestly
                </Link>
                <Link href="/help" className={quiet}>
                  the help page is free forever
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <Container className="mt-16 pb-14 lg:mt-24">
          <SiteFooter />
        </Container>
      </Main>
    </>
  );
}

function Step({ n, title, body, children }: { n: string; title: string; body: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[40px_1fr] gap-x-4 border-t border-line pt-6 lg:grid-cols-1 lg:gap-x-0 lg:border-t-0 lg:pt-0">
      <span aria-hidden className="font-display text-28 leading-none text-signpost lg:text-40">
        {n}
      </span>
      <div className="lg:mt-3">
        <h3 className="font-display text-20 leading-tight text-ink">{title}</h3>
        <p className="mt-2 text-14 leading-relaxed text-ink-soft">{body}</p>
        <div className="mt-4">{children}</div>
      </div>
    </li>
  );
}

/** A still of the nightly log: the three taps, as they look in the app. */
function LogPreview() {
  return (
    <div className="rounded-card border border-line bg-card p-4" aria-label="the nightly log, as it looks in the app">
      <p className="font-display text-20 text-ink">did you smoke today?</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="col-span-2 flex h-11 items-center justify-center rounded-card border border-accent bg-accent/15 text-14 font-medium text-accent">
          yes
        </div>
        <div className="flex h-11 items-center justify-center rounded-card border border-line text-14 text-ink-soft">no</div>
      </div>
      <div className="mt-3 flex justify-between" aria-hidden>
        {([1, 2, 3, 4, 5] as const).map((m) => (
          <span key={m} className={m === 3 ? "text-accent" : "text-ink-faint"} title={MOOD_LABEL[m]}>
            <MoodFace mood={m} size={22} filled={m === 3} />
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(["after-work", "bored", "couldnt-sleep"] as const).map((t, i) => (
          <span
            key={t}
            className={[
              "rounded-pill border px-2.5 py-1 text-12",
              i === 0 ? "border-accent/50 bg-accent/15 text-accent" : "border-line text-ink-soft",
            ].join(" ")}
          >
            {TRIGGER_LABEL[t]}
          </span>
        ))}
      </div>
    </div>
  );
}

function Bubble({ who, children }: { who: "you" | "fix"; children: ReactNode }) {
  return (
    <p
      className={[
        "max-w-[92%] rounded-card px-4 py-3 text-14",
        who === "fix" ? "bg-card text-ink-soft" : "ml-auto bg-accent/15 text-ink",
      ].join(" ")}
    >
      <span className="ff-sr">{who}: </span>
      {children}
    </p>
  );
}
