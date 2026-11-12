"use client";

import { WeeksView } from "@/components/AppClient";
import LogScreen from "@/components/LogScreen";
import { PatternCard } from "@/components/PatternCard";
import PhoneFrame from "@/components/PhoneFrame";
import { Container, Kicker } from "@/components/Shell";
import { recentWeeks, weekStats } from "@/lib/pattern";
import type { Profile } from "@/lib/profile";
import { SAMPLE_END, SAMPLE_GOAL, sampleEntries, sampleShelfEntries } from "@/lib/sample";

// The app, screen by screen. Three phones, each showing a real component from
// the app filled with the sample log — the same components a user gets, not
// mockups. The frames are inert: a picture of the app, labelled as one.

const SAMPLE_PROFILE: Profile = {
  name: "nico",
  bedtime: 23,
  goal: SAMPLE_GOAL,
  ageOk: true,
  onboarded: true,
  trialStart: "2026-10-26",
  interferesWith: ["sleep", "the gym"],
  smokeTime: "after work",
  preferredTriggers: ["after-work", "couldnt-sleep", "bored"],
};

const noop = () => {};

type Screen = { key: string; label: string; title: string; caption: string; node: React.ReactNode };

function screens(): Screen[] {
  const entries = sampleEntries();
  const sunday = weekStats(entries, SAMPLE_GOAL, SAMPLE_END);
  const shelf = recentWeeks(sampleShelfEntries(), SAMPLE_GOAL, 3, SAMPLE_END);
  return [
    {
      key: "tonight",
      label: "the nightly log, as it looks in the app: did you smoke today, one of five faces, trigger chips, a tick for your goal",
      title: "tonight",
      caption: "yes or no, one face, up to three chips. nine seconds.",
      node: (
        <LogScreen
          profile={SAMPLE_PROFILE}
          entries={{}}
          onSaved={noop}
          onOpenFix={noop}
          onOpenMirror={noop}
          mirrorReady={false}
        />
      ),
    },
    {
      key: "sunday",
      label: "the sunday card, as it looks in the app: one sentence about the week, seven nights in a row, the goal line, and the ask-Fix button",
      title: "sunday",
      caption: "one card. what the week looked like, in plain english. no grade.",
      node: (
        <div className="px-5 pt-4">
          <PatternCard name="nico" stats={sunday} onAsk={noop} />
        </div>
      ),
    },
    {
      key: "shelf",
      label: "the shelf, as it looks in the app: past sunday cards, newest first",
      title: "the shelf",
      caption: "every sunday card is kept, up to twelve weeks. by week six, it's a bookshelf.",
      node: (
        <div className="pt-2">
          <WeeksView weeks={shelf} name="nico" onAsk={noop} />
        </div>
      ),
    },
  ];
}

export default function AppScreens() {
  const list = screens();
  return (
    <section aria-labelledby="screens-heading" className="py-16 lg:py-24">
      <Container>
        <div data-reveal className="max-w-[52ch]">
          <Kicker>
            <span className="text-12 uppercase tracking-[0.14em] text-signpost">the app, screen by screen</span>
          </Kicker>
          <h2 id="screens-heading" className="mt-3 font-display text-28 text-ink lg:text-40">
            three screens. that&rsquo;s the whole thing.
          </h2>
          <p className="mt-3 text-16 text-ink-soft">
            a log for tonight, a card on sunday, and a shelf of the sundays so far. nothing else to open.
          </p>
        </div>

        {/* lg: three phones in a row. Below: a snap scroller, one phone per
            swipe, with padding so the first and last can sit centred. */}
        <ul
          data-reveal
          className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[calc(50vw-130px-1.25rem)] pb-4 [scrollbar-width:none] sm:px-[calc(50vw-130px-2rem)] lg:justify-center lg:gap-14 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {list.map((s) => (
            <li key={s.key} className="flex w-[260px] shrink-0 snap-center flex-col items-center lg:w-auto">
              <PhoneFrame label={s.label} width={260} className="lg:hidden">
                {s.node}
              </PhoneFrame>
              <PhoneFrame label={s.label} width={300} className="hidden lg:block">
                {s.node}
              </PhoneFrame>
              <p className="mt-4 w-full text-12 uppercase tracking-[0.14em] text-ink-faint lg:w-[320px]">{s.title}</p>
              <p className="mt-1 w-full text-14 text-ink-soft lg:w-[320px]">{s.caption}</p>
            </li>
          ))}
        </ul>

        <p data-reveal className="mt-8 text-12 text-ink-faint">
          real screens from the real app, filled with a sample log — not mockups.
        </p>
      </Container>
    </section>
  );
}
