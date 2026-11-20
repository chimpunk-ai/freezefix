import Link from "next/link";
import { PatternCard } from "@/components/PatternCard";
import Reveal from "@/components/Reveal";
import RitualDemo from "@/components/RitualDemo";
import AppScreens from "@/components/AppScreens";
import StartButton from "@/components/StartButton";
import { Container, Kicker, Main, SiteHeader } from "@/components/Shell";
import SiteFooter from "@/components/SiteFooter";
import { TrustBadge } from "@/components/TrustBadge";
import { weekStats } from "@/lib/pattern";
import { TRIAL_DAYS } from "@/lib/plans";
import { SAMPLE_END, SAMPLE_GOAL, sampleEntries } from "@/lib/sample";

// The front door, rewritten Nov 2026 for a cold visitor who should understand
// what this is in under 30 seconds and be inside doing it within a minute.
// One idea, one real card as proof, the real screens, one CTA repeated
// twice. Everything that used to explain the product in prose — what Fix
// is, what it isn't, the privacy deep-dive, FAQ, myths, "no reviews yet",
// a second pricing pitch — still exists, just not crammed onto this page:
// /faq, /myths, /privacy, /plans, /help all carry it in full. Cutting it
// from here is not cutting it from the site.
//
// Motion: the week grid in the hero draws itself (the app's own animation),
// and sections below the fold fade up once as they arrive (Reveal.tsx).
// Both collapse to nothing under prefers-reduced-motion.

const sample = weekStats(sampleEntries(), SAMPLE_GOAL, SAMPLE_END);

const cta =
  "ff-chip inline-flex min-h-12 items-center rounded-pill bg-signpost px-6 text-16 font-medium text-signpost-ink no-underline ff-cta-shadow transition-transform hover:-translate-y-[1px]";

export default function Landing({ paymentsOn }: { paymentsOn: boolean }) {
  return (
    <>
      <SiteHeader cta={{ href: "/app", label: "open the app" }} />
      <Reveal />

      {/* WebSite JSON-LD: tells Google this is a single-site product, hands it
          the brand name, and declares the search box (even though we don't have
          site search — the site IS the search, this way the rich result is
          cleaner). SoftwareApplication is deliberately omitted until we have
          real reviews to cite; schema.org rules require aggregateRating or
          an offer, and faking either is worse than no card at all. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Fix",
            alternateName: "FreezeFix",
            url: "https://getfreezefix.com",
            description:
              "A private pattern-mirror for people who smoke weed and wonder how it's sitting in their life.",
            inLanguage: "en-GB",
          }),
        }}
      />

      <Main>
        {/* Hero: words left, the real card right. One CTA. */}
        <section aria-labelledby="hero-heading" className="overflow-x-clip">
          <Container className="grid items-center gap-12 pb-8 pt-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 lg:pb-16 lg:pt-12">
            <div>
              <h1
                id="hero-heading"
                className="font-display text-28 leading-[1.1] text-ink [text-wrap:initial] sm:text-40 lg:text-[2.75rem] lg:leading-[1.08]"
              >
                <span className="block">you don&rsquo;t have to quit.</span>
                <span className="block">you just have to notice.</span>
              </h1>
              <p className="mt-5 max-w-[42ch] text-16 leading-[1.5] text-ink sm:text-20 sm:leading-[1.35]">
                three taps a night. one card on sunday. nobody telling you off.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <StartButton href="/app" className={cta}>
                  {paymentsOn ? `start ${TRIAL_DAYS} days free` : "start, it's free"}
                </StartButton>
              </div>
              {!paymentsOn && (
                <p className="mt-3 max-w-[42ch] text-13 text-ink-faint">
                  payments aren&rsquo;t switched on yet &mdash; nothing can be charged and nothing locks.
                </p>
              )}
              <p className="mt-3 max-w-[42ch] text-13 text-ink-faint">
                a missed night is a dot, not a mark. the next night you just show up.
              </p>
              <div className="mt-6 max-w-[420px]">
                <TrustBadge />
              </div>
            </div>

            <figure className="ff-stack relative mt-4 lg:mt-0 lg:w-full lg:max-w-[480px] lg:justify-self-end">
              <Kicker>what sunday looks like</Kicker>
              <div className="ff-hero-card mt-3 rounded-sheet ff-card-shadow">
                <PatternCard name="nico" stats={sample} dimmed />
              </div>
              <figcaption className="mt-3 text-12 text-ink-faint">
                a sample week from a sample log, not a mockup of something we haven&rsquo;t built.
              </figcaption>
            </figure>
          </Container>
        </section>

        {/* How it works, shown not told: the real ritual, played once. */}
        <section aria-labelledby="how-heading" className="mt-6 border-t border-line lg:mt-10">
          <Container className="pt-10 lg:pt-14">
            <div data-reveal className="max-w-[52ch]">
              <Kicker tone="faint">how it works</Kicker>
              <h2 id="how-heading" className="mt-2 font-display text-28 text-ink lg:text-40">
                reflect. notice. choose.
              </h2>
              <p className="mt-3 text-14 text-ink-soft lg:text-16">
                press play and watch a whole night go by. nine seconds, that&rsquo;s it.
              </p>
            </div>
            <div data-reveal className="mx-auto mt-8 max-w-[420px] rounded-sheet border border-line bg-card/60 px-5 py-7 sm:px-8 lg:mt-10">
              <RitualDemo />
            </div>
          </Container>
        </section>

        {/* The app, screen by screen: three real screens in phone frames. */}
        <AppScreens />

        {/* One more chance to start, for anyone who scrolled this far. */}
        <section aria-labelledby="final-cta-heading" className="mt-16 lg:mt-24">
          <Container>
            <div data-reveal className="flex flex-col items-center gap-4 rounded-sheet border border-line bg-card/70 p-8 text-center lg:p-12">
              <h2 id="final-cta-heading" className="font-display text-24 text-ink lg:text-32">
                see your own week.
              </h2>
              <p className="max-w-[42ch] text-14 text-ink-soft lg:text-16">
                no account, no email, no card. a name you make up is the whole sign-in.
              </p>
              <StartButton href="/app" className={cta}>
                {paymentsOn ? `start ${TRIAL_DAYS} days free` : "start, it's free"}
              </StartButton>
              <p className="text-12 text-ink-faint">
                questions first? <Link href="/faq" className="underline decoration-line underline-offset-4 hover:text-ink-soft">faq</Link>
                {" · "}
                <Link href="/plans" className="underline decoration-line underline-offset-4 hover:text-ink-soft">what it costs</Link>
              </p>
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
