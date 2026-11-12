import Link from "next/link";
import type { ReactNode } from "react";
import { MoodFace } from "@/components/MoodFace";
import { PatternCard, WeekGrid } from "@/components/PatternCard";
import Reveal from "@/components/Reveal";
import RitualDemo from "@/components/RitualDemo";
import AppScreens from "@/components/AppScreens";
import TryFix from "@/components/TryFix";
import Faq, { faqItems } from "@/components/Faq";
import { Container, Kicker, Main, SiteHeader } from "@/components/Shell";
import SiteFooter from "@/components/SiteFooter";
import { TrustBadge } from "@/components/TrustBadge";
import { MOOD_LABEL, TRIGGER_LABEL } from "@/lib/entry";
import { goalSentence, weekStats } from "@/lib/pattern";
import { plansFor, TRIAL_DAYS } from "@/lib/plans";
import { SAMPLE_END, SAMPLE_GOAL, sampleEntries } from "@/lib/sample";

// The front door. One idea, three steps, one real card, a shelf, a boundary.
//
// On a phone it reads top to bottom. On a laptop the headline and the
// Sunday card sit side by side, because the card is the product and the
// only honest proof we have; everything else on the page is interface
// pulled from the app itself, not illustration. No scenario cards, no
// founder pitch, no waitlist, no countdown, no photographs of anyone.
//
// Motion: the week grid in the hero draws itself (the app's own animation),
// and sections below the fold fade up once as they arrive (Reveal.tsx).
// Both collapse to nothing under prefers-reduced-motion.

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
      <Reveal />

      <Main>
        {/* Hero: words left, the real card right. */}
        <section aria-labelledby="hero-heading" className="overflow-x-clip">
          <Container className="grid items-center gap-12 pb-8 pt-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 lg:pb-16 lg:pt-12">
            <div>
              {/* One sentence per line. The text column is ~560px at the 1120
                  site measure, and each sentence is 23 characters, so 44px is
                  the largest size that keeps "you don't have to quit." on one
                  line in Newsreader with room to spare; 56 forced three or
                  four uneven lines. text-wrap: balance is off here for the
                  same reason. */}
              <h1
                id="hero-heading"
                className="font-display text-28 leading-[1.1] text-ink [text-wrap:initial] sm:text-40 lg:text-[2.75rem] lg:leading-[1.08]"
              >
                <span className="block">you don&rsquo;t have to quit.</span>
                <span className="block">you just have to notice.</span>
              </h1>
              <p className="mt-5 max-w-[46ch] text-16 leading-[1.5] text-ink sm:text-20 sm:leading-[1.35]">
                a private nightly check-in for people who smoke weed. we don&rsquo;t make you quit —
                we show you what your week actually looks like, what it touches, and leave the small
                next step to you. if there is one.
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
              <p className="mt-4 text-14 text-ink-faint">
                or{" "}
                <TryFix className="inline min-h-0 underline decoration-line underline-offset-4 hover:text-ink-soft">
                  ask fix about a sample week
                </TryFix>{" "}
                before you type a name.
              </p>
              <div className="mt-6 max-w-[420px]">
                <TrustBadge />
              </div>
            </div>

            <figure className="ff-stack relative mt-4 lg:mt-0 lg:w-full lg:max-w-[480px] lg:justify-self-end">
              <Kicker>what sunday looks like</Kicker>
              <div className="ff-hero-card mt-3 rounded-sheet shadow-[0_32px_80px_-40px_rgba(156,175,136,0.35)]">
                <PatternCard name="nico" stats={sample} dimmed />
              </div>
              <figcaption className="mt-3 text-12 text-ink-faint">
                a sample week from a sample log, not a mockup of something we haven&rsquo;t built.
              </figcaption>
            </figure>
          </Container>
        </section>

        {/* How it works: the ritual, playable, beside the three steps it leads to.
            On a laptop the phone sits left and the steps stack right, so the
            eye goes demo → reflect → notice → choose. */}
        <section aria-labelledby="how-heading" className="mt-6 border-t border-line lg:mt-10">
          <Container className="pt-10 lg:pt-14">
            <div data-reveal className="max-w-[52ch]">
              <Kicker tone="faint">how it works</Kicker>
              <h2 id="how-heading" className="mt-2 font-display text-28 text-ink lg:text-40">
                reflect. notice. choose.
              </h2>
              <p className="mt-3 text-14 text-ink-soft lg:text-16">
                nine seconds a night, one card a week, one small thing that&rsquo;s yours. press play
                and watch a whole night go by.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-10 lg:mt-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start lg:gap-16">
              <div data-reveal className="rounded-sheet border border-line bg-card/60 px-5 py-7 sm:px-8 lg:sticky lg:top-6">
                <RitualDemo />
              </div>
              <ol className="grid gap-8 lg:gap-10">
                <Step
                  n="1"
                  verb="reflect"
                  title="the log"
                  body="yes or no. one face. up to three chips. nine seconds, at bedtime, in the dark. a few words if you want them — typed, or spoken once voice notes are switched on."
                >
                  <LogPreview />
                </Step>
                <Step
                  n="2"
                  verb="notice"
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
                  verb="choose"
                  title="your thing"
                  body="one small thing you'd like to do more of. run twice. call your brother back. the card notices whether you did, and says so without a party. what you do next is yours."
                >
                  <GoalPreview />
                </Step>
              </ol>
            </div>
          </Container>
        </section>

        {/* The app, screen by screen: three real screens in phone frames. */}
        <AppScreens />

        {/* Fix, and what this isn't. Two columns on a laptop. */}
        <section aria-labelledby="fix-heading" className="mt-16 lg:mt-24">
          <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div data-reveal className="rounded-sheet border border-signpost/25 bg-signpost/[0.04] p-6 lg:p-8">
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
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                <TryFix className={cta}>ask it yourself</TryFix>
                <p className="text-12 text-ink-faint">
                  the real fix, about nico&rsquo;s sample week. five questions a day, same as the app.
                </p>
              </div>
            </div>

            <div data-reveal className="lg:self-center">
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

        {/* Where your words go. Drawn from the privacy policy, not from the pitch. */}
        <section aria-labelledby="boundary-heading" className="mt-16 lg:mt-24">
          <Container>
            <div data-reveal className="max-w-[52ch]">
              <Kicker tone="faint">privacy</Kicker>
              <h2 id="boundary-heading" className="mt-2 font-display text-28 text-ink lg:text-40">
                where your words go.
              </h2>
              <p className="mt-3 text-14 text-ink-soft lg:text-16">
                no account, no email, no phone number. a name you make up is the whole sign-in. the
                line between your phone and us is drawn below, and the{" "}
                <Link href="/privacy" className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink-faint">
                  privacy page
                </Link>{" "}
                says the same thing in full.
              </p>
            </div>
            <div data-reveal className="mt-8 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch md:gap-0">
              <BoundaryCard
                tone="phone"
                title="stays on this phone"
                lines={[
                  "every night you log — yes or no, the face, the chips, the note",
                  "the sunday card and the shelf, worked out on the phone itself",
                  "the name you made up, your bedtime, your one thing",
                  "whether you wanted the sunday chime",
                ]}
                foot="nothing syncs, nothing uploads, nothing is in a backup we hold. clear your browser data and it's gone — there is no copy to recover."
              />
              <div aria-hidden className="hidden items-center md:flex">
                <div className="relative mx-2 h-px w-10 bg-line">
                  <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-r border-t border-ink-faint" />
                </div>
              </div>
              <BoundaryCard
                tone="away"
                title="leaves only when you ask fix"
                lines={[
                  "the last seven nights of taps and the first 160 characters of any note",
                  "your question and the last few lines of that chat (the opener can include your made-up name), your one thing, and a two-letter country code",
                  "read by our AI provider (Anthropic) to write the reply, not to train on, and deleted on their side within 30 days",
                  "we keep no copy of the question or the answer — only a daily count, hashed",
                ]}
                foot="voice notes are switched off today. payments aren't switched on. when either changes, it says so here first."
              />
            </div>
          </Container>
        </section>

        {/* The questions people ask before they type a name. */}
        <Faq paymentsOn={paymentsOn} />
        <script
          type="application/ld+json"
          // FAQPage structured data: the same questions and answers the section renders.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqItems(paymentsOn).map((it) => ({
                "@type": "Question",
                name: it.q,
                acceptedAnswer: { "@type": "Answer", text: it.a },
              })),
            }),
          }}
        />

        {/* Early access, honestly: no reviews exist yet, so none are shown. */}
        <section aria-labelledby="early-heading" className="mt-16 lg:mt-24">
          <Container>
            <div data-reveal className="grid gap-6 rounded-sheet border border-line p-6 lg:grid-cols-2 lg:gap-16 lg:p-10">
              <div>
                <Kicker tone="faint">early access</Kicker>
                <h2 id="early-heading" className="mt-2 font-display text-28 leading-tight text-ink lg:text-40">
                  no reviews yet. on purpose.
                </h2>
              </div>
              <div className="text-14 text-ink-soft lg:text-16">
                <p>
                  fix is new. when real people have used it for a few weeks, their words go here &mdash;
                  unedited, the good and the off. until then we&rsquo;d rather show you the app than
                  quote someone we made up.
                </p>
                <p className="mt-3">
                  the screens above are the real thing with a sample log in them. the quickest way to
                  know if it&rsquo;s for you is a week of your own.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* The price, honestly. The copy changes with whether a checkout exists. */}
        <section aria-labelledby="price-heading" className="mt-16 lg:mt-24">
          <Container>
            <div data-reveal className="grid gap-6 rounded-sheet border border-line bg-card/70 p-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-12 lg:p-10">
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

function Step({ n, verb, title, body, children }: { n: string; verb: string; title: string; body: string; children: ReactNode }) {
  return (
    <li data-reveal className="grid grid-cols-[40px_1fr] content-start gap-x-4 border-t border-line pt-6">
      <span aria-hidden className="font-display text-28 leading-none text-signpost">
        {n}
      </span>
      <div>
        <p className="text-12 uppercase tracking-[0.14em] text-accent">{verb}</p>
        <h3 className="mt-1 font-display text-20 leading-tight text-ink">{title}</h3>
        <p className="mt-2 max-w-[52ch] text-14 leading-relaxed text-ink-soft">{body}</p>
        <div className="mt-4 max-w-[52ch]">{children}</div>
      </div>
    </li>
  );
}

/** A still of the nightly log: the three taps, as they look in the app. */
function LogPreview() {
  return (
    <div className="rounded-card border border-line bg-card p-4" aria-label="the mood faces and trigger chips, as they look in the app">
      <p className="text-14 text-ink-soft">then one face, and up to three chips.</p>
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

/** The goal tick from the nightly log, then the line the Sunday card makes of it. */
function GoalPreview() {
  return (
    <div className="space-y-3" aria-label="your thing, as it looks in the app">
      <div className="rounded-card border border-line bg-card p-4">
        <p className="text-14 text-ink-soft">
          did you get to &ldquo;{SAMPLE_GOAL.text}&rdquo; today?
        </p>
        <div className="mt-3 flex gap-2" aria-hidden>
          <span className="rounded-pill border border-accent/50 bg-accent/15 px-4 py-2 text-14 text-accent">yes</span>
          <span className="rounded-pill border border-line bg-card px-4 py-2 text-14 text-ink-soft">no</span>
          <span className="rounded-pill px-3 py-2 text-14 text-ink-faint">skip</span>
        </div>
      </div>
      <div className="rounded-card border border-accent/25 bg-accent/[0.07] px-4 py-3 text-14 text-ink">
        {sample.goalLine ? goalSentence(sample.goalLine) : null}
      </div>
    </div>
  );
}

function BoundaryCard({
  tone,
  title,
  lines,
  foot,
}: {
  tone: "phone" | "away";
  title: string;
  lines: string[];
  foot: string;
}) {
  const phone = tone === "phone";
  return (
    <div
      className={[
        "flex flex-col rounded-sheet border p-6",
        phone ? "border-accent/30 bg-accent/[0.06]" : "border-line bg-card/70",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span aria-hidden className={["h-2 w-2 rounded-full", phone ? "bg-accent" : "bg-signpost/80"].join(" ")} />
        <h3 className={["font-display text-20 leading-tight", phone ? "text-accent" : "text-ink"].join(" ")}>{title}</h3>
      </div>
      <ul className="mt-4 space-y-2.5 text-14 text-ink-soft">
        {lines.map((l) => (
          <li key={l} className="flex gap-3">
            <span aria-hidden className={["mt-[0.7em] h-px w-3 shrink-0", phone ? "bg-accent/70" : "bg-signpost/60"].join(" ")} />
            <span>{l}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-line/70 pt-4 text-12 leading-relaxed text-ink-faint">{foot}</p>
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
