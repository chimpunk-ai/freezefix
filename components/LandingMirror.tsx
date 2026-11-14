"use client";

/*
 * LandingMirror — the English front door, ported from the live
 * getfreezefix.com landing (14 Nov 2026).
 *
 * Why this file exists: the copy that is live today ("you don't have to
 * quit. you just have to notice.", the sample Sunday card, the three-step
 * loop, the shelf, the shape over time) was never committed to this repo —
 * components/Landing.tsx still carries the older "More control, one moment
 * at a time" page. Publishing this branch as-is would have replaced the
 * newer live landing with the older one. This component restores parity, so
 * a deploy of `appjet` improves getfreezefix.com instead of regressing it.
 *
 * Scope, deliberately: English "/" only. /de /fr /nl /es /it keep rendering
 * the localized components/Landing.tsx via LANDING_COPY, so nothing
 * translated is lost or broken.
 *
 * Conventions kept from the rest of the product:
 *   - tokens only (bg / card / chip / line / ink / ink-soft / ink-faint /
 *     accent / accent-ink / frost). No raw hex in here, so the light theme
 *     in app/globals.css keeps working.
 *   - 16px cards, 20px sheets, 999px pills. Six type steps.
 *   - no emojis, no streaks, no grades, no exclamation marks.
 *   - one h1 on the page (the hero). Cards use h3; the live page had four
 *     h1s, which made every h1-based selector ambiguous.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

const MOODS = ["great", "good", "okay", "low", "rough"] as const;
type Mood = (typeof MOODS)[number];

const CHIPS = ["after work", "bored", "with friends", "couldn't sleep", "after her", "nothing really"];

/* ---------------------------------------------------------------- faces */
/* Drawn, slightly abstract, warm — not emoji. Eye line + mouth curve only. */
function Face({ mood, size = 22, active = false }: { mood: Mood; size?: number; active?: boolean }) {
  const i = MOODS.indexOf(mood);
  const mouth = ["M7 15.4c1.6 2.1 4.4 2.1 6 0", "M7 15c1.6 1.3 4.4 1.3 6 0", "M7 15.2h6", "M7 16.4c1.6-1.5 4.4-1.5 6 0", "M7 17c1.6-2.2 4.4-2.2 6 0"][i];
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={active ? 1 : 0.55} />
      <circle cx="7.1" cy="8" r="1" fill="currentColor" opacity={active ? 1 : 0.7} />
      <circle cx="12.9" cy="8" r="1" fill="currentColor" opacity={active ? 1 : 0.7} />
      <path d={mouth} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------- seven-night grid */
type Night = { day: string; smoked: boolean | null; mood?: Mood; goal?: boolean };

function NightGrid({ nights }: { nights: Night[] }) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {nights.map((n) => (
        <div key={n.day} className="flex flex-col items-center gap-1.5">
          <div
            className={[
              "flex h-9 w-full items-center justify-center rounded-xl border text-[0.6rem]",
              n.smoked === true
                ? "border-accent/40 bg-accent/20 text-accent"
                : n.smoked === false
                  ? "border-line bg-chip/60 text-ink-soft"
                  : "border-dashed border-line text-ink-faint",
            ].join(" ")}
            title={n.smoked === true ? "smoked" : n.smoked === false ? "didn't" : "not logged"}
          >
            {n.smoked === true ? "•" : n.smoked === false ? "○" : "—"}
          </div>
          <span className="text-[0.55rem] uppercase tracking-wider text-ink-faint">{n.day}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- week card */
function WeekCard({
  label,
  lines,
  goal,
  nights,
  showGoalDots = false,
}: {
  label: string;
  lines: string[];
  goal: string;
  nights: Night[];
  showGoalDots?: boolean;
}) {
  return (
    <article className="rounded-[1.25rem] border border-line bg-card p-5 sm:p-6">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">{label}</p>
      <h3 className="mt-2 font-display text-xl text-ink">nico, here&rsquo;s your week</h3>
      <div className="mt-3 space-y-1.5">
        {lines.map((l) => (
          <p key={l} className="text-sm leading-relaxed text-ink-soft">
            {l}
          </p>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-ink-faint">
        {MOODS.map((m) => (
          <span key={m} className="flex items-center gap-1 text-[0.55rem] uppercase tracking-wider">
            <Face mood={m} size={14} />
            <span className="hidden sm:inline">{m}</span>
          </span>
        ))}
      </div>

      <div className="mt-4">
        <NightGrid nights={nights} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6rem] uppercase tracking-wider text-ink-faint">
        <span>• smoked</span>
        <span>○ didn&rsquo;t</span>
        <span>— not logged</span>
        {showGoalDots && <span>✓ did your thing</span>}
      </div>

      {showGoalDots && (
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {nights.map((n) => (
            <div key={n.day} className="flex h-5 items-center justify-center text-[0.65rem] text-accent">
              {n.goal ? "✓" : ""}
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-ink">{goal}</p>
      <p className="mt-2 text-sm text-ink-faint">only you know what it means.</p>
    </article>
  );
}

/* --------------------------------------------------------- ritual (9s) */
const RITUAL_STEPS = 5;

function RitualDemo() {
  const [step, setStep] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function play() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStep(1);
    for (let i = 2; i <= RITUAL_STEPS + 1; i += 1) {
      timers.current.push(setTimeout(() => setStep(i), (i - 1) * 1500));
    }
  }

  const done = step > RITUAL_STEPS;

  return (
    <div className="rounded-[1.25rem] border border-line bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">21:14</p>
        <button
          type="button"
          onClick={play}
          className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink-soft transition hover:border-accent/50 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          play the nightly ritual · 9s
        </button>
      </div>

      <p className="mt-4 text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">today · saturday 14 november</p>
      <h3 className="mt-1 font-display text-[1.4rem] text-ink">did you smoke today?</h3>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          aria-pressed={step >= 1}
          className={[
            "rounded-full px-5 py-2.5 text-sm font-medium transition",
            step >= 1 ? "bg-accent text-accent-ink" : "border border-line text-ink-soft",
          ].join(" ")}
        >
          yes
        </button>
        <button type="button" className="rounded-full border border-line px-5 py-2.5 text-sm text-ink-soft">
          no
        </button>
      </div>

      <div className={`mt-4 transition-opacity duration-500 ${step >= 2 ? "opacity-100" : "opacity-40"}`}>
        <p className="text-xs text-ink-faint">one face</p>
        <div className="mt-2 flex items-center gap-3 text-ink-soft">
          {MOODS.map((m, i) => (
            <Face key={m} mood={m} size={24} active={step >= 2 && i === 1} />
          ))}
        </div>
      </div>

      <div className={`mt-4 transition-opacity duration-500 ${step >= 3 ? "opacity-100" : "opacity-40"}`}>
        <p className="text-xs text-ink-faint">up to three chips</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CHIPS.slice(0, 4).map((c, i) => (
            <span
              key={c}
              className={[
                "rounded-full px-3 py-1.5 text-xs",
                step >= 3 && i < 2 ? "bg-chip text-ink" : "border border-line text-ink-faint",
              ].join(" ")}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className={`mt-4 transition-opacity duration-500 ${step >= 4 ? "opacity-100" : "opacity-40"}`}>
        <p className="text-xs text-ink-faint">hold to say something — ten seconds, if you want. it isn&rsquo;t required.</p>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className={["rounded-full px-5 py-2.5 text-sm font-medium", step >= 5 ? "bg-accent text-accent-ink" : "bg-chip text-ink-faint"].join(" ")}>
          save
        </span>
        <span className={`text-xs text-ink-faint transition-opacity duration-500 ${done ? "opacity-100" : "opacity-0"}`}>
          saved. see you sunday.
        </span>
      </div>

      <p className="mt-4 text-[0.7rem] leading-relaxed text-ink-faint">
        silent. nothing is saved. a sample night, not yours.
      </p>
    </div>
  );
}

/* -------------------------------------------------------- tonight screen */
function TonightScreen() {
  return (
    <div className="rounded-[1.25rem] border border-line bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">21:14</p>
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">today · saturday 14 november</p>
      </div>
      <h3 className="mt-2 font-display text-[1.4rem] text-ink">did you smoke today?</h3>
      <div className="mt-3 flex gap-2">
        <span className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink">yes</span>
        <span className="rounded-full border border-line px-5 py-2.5 text-sm text-ink-soft">no</span>
      </div>

      <p className="mt-4 text-xs text-ink-faint">did you get to &ldquo;go for a run&rdquo; today?</p>
      <div className="mt-2 flex gap-2 text-xs text-ink-soft">
        <span className="rounded-full border border-line px-3 py-1.5">yes</span>
        <span className="rounded-full border border-line px-3 py-1.5">no</span>
        <span className="rounded-full border border-line px-3 py-1.5 text-ink-faint">skip</span>
      </div>

      <p className="mt-4 rounded-xl border border-dashed border-line px-3 py-2 text-xs text-ink-faint">hold to say something</p>
      <p className="mt-1 text-[0.7rem] text-ink-faint">ten seconds, if you want. it isn&rsquo;t required.</p>
      <p className="mt-2 text-xs text-ink-soft underline decoration-line underline-offset-2">type instead</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-full bg-chip px-5 py-2.5 text-sm text-ink-faint">save</span>
        <span className="text-xs text-ink-faint">three taps is enough.</span>
      </div>

      <p className="mt-5 text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">the last fourteen days</p>
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className={[
              "h-3 rounded-full",
              i % 3 === 0 ? "bg-accent/50" : i % 3 === 1 ? "border border-line" : "bg-chip",
            ].join(" ")}
          />
        ))}
      </div>
      <p className="mt-2 text-[0.7rem] text-ink-faint">a filled dot is a night you smoked. an open one isn&rsquo;t.</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-frost/50 px-3 py-1.5 text-frost">i need fix now</span>
        <span className="rounded-full border border-line px-3 py-1.5 text-ink-soft">the weeks</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ page */
export default function LandingMirror() {
  const [fixOpen, setFixOpen] = useState(false);
  const [chime, setChime] = useState<"yes" | "no" | null>(null);

  const sampleNights: Night[] = [
    { day: "mon", smoked: true, mood: "okay", goal: false },
    { day: "tue", smoked: true, mood: "good", goal: true },
    { day: "wed", smoked: false, mood: "great", goal: false },
    { day: "thu", smoked: true, mood: "okay", goal: true },
    { day: "fri", smoked: false, mood: "good", goal: false },
    { day: "sat", smoked: true, mood: "low", goal: false },
    { day: "sun", smoked: null, mood: "good", goal: false },
  ];

  const priorNights: Night[] = [
    { day: "mon", smoked: false },
    { day: "tue", smoked: true },
    { day: "wed", smoked: true },
    { day: "thu", smoked: null },
    { day: "fri", smoked: true },
    { day: "sat", smoked: true },
    { day: "sun", smoked: null },
  ];

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm"
      >
        skip to main content
      </a>

      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link href="/" className="font-display text-xl tracking-tight text-ink">
          fix
        </Link>
        <nav className="flex items-center gap-4 text-sm text-ink-soft sm:gap-6">
          <Link href="/pricing" className="hidden transition hover:text-ink sm:inline">
            what it costs
          </Link>
          <Link href="/privacy" className="hidden transition hover:text-ink sm:inline">
            privacy
          </Link>
          <Link href="/app" className="transition hover:text-ink">
            open the app
          </Link>
          <Link
            href="/help"
            className="rounded-full border border-frost/50 px-3 py-1.5 text-xs text-frost transition hover:border-frost"
          >
            get help now
          </Link>
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-5 pb-16 sm:px-8">
        {/* ------------------------------------------------------------ hero */}
        <section className="pt-8 sm:pt-14">
          <h1
            id="hero-heading"
            className="font-display text-[1.75rem] leading-[1.1] text-ink sm:text-[2.5rem] sm:leading-[1.06] lg:text-[3rem] lg:leading-[1.04]"
          >
            you don&rsquo;t have to quit.
            <br />
            you just have to notice.
          </h1>
          <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-ink-soft">
            a private nightly check-in for people who smoke weed. we don&rsquo;t make you quit — we show you what your week
            actually looks like, what it touches, and leave the small next step to you. if there is one.
          </p>
          <p className="mt-4 max-w-[58ch] text-sm leading-relaxed text-ink-faint">
            three taps a night. one card on sunday. no streak, no score, nobody telling you off.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition hover:opacity-90"
            >
              start, it&rsquo;s free
            </Link>
            <Link href="/pricing" className="rounded-full border border-line px-6 py-3 text-sm text-ink-soft transition hover:text-ink">
              what it costs
            </Link>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => setFixOpen((v) => !v)}
              aria-expanded={fixOpen}
              className="text-sm text-ink-soft underline decoration-line underline-offset-4 transition hover:text-ink"
            >
              ask fix about a sample week
            </button>
            <span className="text-sm text-ink-faint"> before you type a name.</span>
            {fixOpen && (
              <div className="mt-3 max-w-[52ch] rounded-2xl border border-line bg-card p-4">
                <p className="text-sm leading-relaxed text-ink">
                  four nights out of seven, and three of those started with after work. the mood you picked the next
                  morning didn&rsquo;t move much either way. look, i&rsquo;m just a chart with manners — that&rsquo;s all it
                  says.
                </p>
                <p className="mt-2 text-[0.7rem] text-ink-faint">a sample week. your card is built from your log, not this one.</p>
              </div>
            )}
          </div>

          <div className="mt-10 rounded-2xl border border-line bg-card p-4 sm:p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">what&rsquo;s not required</p>
            <ul className="mt-3 grid gap-2 text-sm text-ink-soft sm:grid-cols-3">
              <li>no card to start the free week</li>
              <li>no email, no phone, no password</li>
              <li>cancel in one tap — no retention gauntlet</li>
            </ul>
          </div>
        </section>

        {/* ------------------------------------------------ sunday sample */}
        <section className="mt-16">
          <h2 className="font-display text-[1.4rem] text-ink sm:text-xl">what sunday looks like</h2>
          <div className="mt-4">
            <WeekCard
              label="26 oct – 1 nov"
              lines={[
                "you smoked on four of the seven nights this week.",
                "you tapped \u201cafter work\u201d on three of them.",
              ]}
              goal="you wanted to go for a run twice this week. you did it twice."
              nights={sampleNights}
              showGoalDots
            />
          </div>
          <p className="mt-3 text-[0.7rem] text-ink-faint">
            a sample week from a sample log, not a mockup of something we haven&rsquo;t built.
          </p>
        </section>

        {/* ------------------------------------------------------ how it works */}
        <section className="mt-16">
          <h2 className="font-display text-[1.4rem] text-ink sm:text-xl">how it works</h2>
          <p className="mt-1 font-display text-xl text-ink-soft">reflect. notice. choose.</p>
          <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-ink-soft">
            nine seconds a night, one card a week, one small thing that&rsquo;s yours. press play and watch a whole night go
            by.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <RitualDemo />
            <div className="flex flex-col gap-4">
              {[
                {
                  n: "1",
                  k: "reflect",
                  t: "the log",
                  d: "yes or no. one face. up to three chips. nine seconds, at bedtime, in the dark. a few words if you want them — typed, or spoken once voice notes are switched on.",
                },
                {
                  n: "2",
                  k: "notice",
                  t: "the mirror",
                  d: "sunday, 8:15pm, one notification. a card slides up and tells you what the week looked like in plain english. four nights out of seven. mostly after work. that's it. no grade.",
                },
                {
                  n: "3",
                  k: "choose",
                  t: "your thing",
                  d: "one small thing you'd like to do more of. run twice. call your brother back. the card notices whether you did, and says so without a party. what you do next is yours.",
                },
              ].map((s) => (
                <div key={s.n} className="rounded-2xl border border-line bg-card p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">
                    {s.n} · {s.k}
                  </p>
                  <h3 className="mt-1 font-display text-base text-ink">{s.t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ screen by screen */}
        <section className="mt-16">
          <h2 className="font-display text-[1.4rem] text-ink sm:text-xl">the app, screen by screen</h2>
          <p className="mt-1 font-display text-xl text-ink-soft">three screens. that&rsquo;s the whole thing.</p>
          <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-ink-soft">
            a log for tonight, a card on sunday, and a shelf of the sundays so far. nothing else to open.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div>
              <TonightScreen />
              <p className="mt-2 text-[0.7rem] text-ink-faint">TONIGHT — yes or no, one face, up to three chips. nine seconds.</p>
            </div>

            <div>
              <WeekCard
                label="26 oct – 1 nov"
                lines={[
                  "you smoked on four of the seven nights this week.",
                  "you tapped \u201cafter work\u201d on three of them.",
                ]}
                goal="you wanted to go for a run twice this week. you did it twice."
                nights={sampleNights}
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  href="/app"
                  className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft transition hover:text-ink"
                >
                  ask Fix about this week
                </Link>
                <span className="text-[0.7rem] text-ink-faint">want a soft chime next sunday when the card arrives?</span>
                {chime === null ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setChime("yes")}
                      className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft"
                    >
                      yes, softly
                    </button>
                    <button
                      type="button"
                      onClick={() => setChime("no")}
                      className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft"
                    >
                      no thanks
                    </button>
                  </>
                ) : (
                  <span className="text-[0.7rem] text-accent">
                    {chime === "yes" ? "noted — one chime, sunday, 8:15pm. that's all." : "no chime. the card will be here."}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[0.7rem] text-ink-faint">
                SUNDAY — one card. what the week looked like, in plain english. no grade.
              </p>
            </div>

            <div>
              <div className="rounded-[1.25rem] border border-line bg-card p-5">
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">the shelf</p>
                <h3 className="mt-2 font-display text-[1.4rem] text-ink">your weeks</h3>
                <p className="mt-1 text-sm text-ink-faint">newest first. quiet, not a feed.</p>
                <ul className="mt-4 space-y-2">
                  {[
                    { w: "26 oct – 1 nov", s: "four nights. after work ×3." },
                    { w: "19 oct – 25 oct", s: "four nights. logged five." },
                    { w: "12 oct – 18 oct", s: "three nights. a thin week." },
                  ].map((r) => (
                    <li key={r.w} className="rounded-xl border border-line px-3 py-2.5">
                      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-ink-faint">{r.w}</p>
                      <p className="mt-0.5 text-sm text-ink-soft">{r.s}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-2 text-[0.7rem] text-ink-faint">THE SHELF — the sundays so far, kept.</p>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------- shape over time */}
        <section className="mt-16">
          <h2 className="font-display text-[1.4rem] text-ink sm:text-xl">the shape over time</h2>
          <div className="mt-4 rounded-[1.25rem] border border-line bg-card p-5">
            <div className="flex items-end justify-between gap-4">
              {[
                { w: "18 oct", smoke: 3, mood: "okay" },
                { w: "25 oct", smoke: 4, mood: "good" },
                { w: "1 nov", smoke: 4, mood: "okay" },
              ].map((b) => (
                <div key={b.w} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-24 w-full items-end">
                    <div className="w-full rounded-t-lg bg-accent/40" style={{ height: `${(b.smoke / 7) * 100}%` }} />
                  </div>
                  <p className="text-[0.65rem] uppercase tracking-wider text-ink-faint">{b.w}</p>
                  <p className="text-[0.7rem] text-ink-soft">{b.mood}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line pt-3 text-[0.65rem] uppercase tracking-wider text-ink-faint">
              <span>nights smoked</span>
              <span>mood, averaged</span>
              <span>thin week</span>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ shelf */}
        <section className="mt-16">
          <h2 className="font-display text-[1.4rem] text-ink sm:text-xl">the shelf</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <WeekCard
              label="26 oct – 1 nov"
              lines={[
                "you smoked on four of the seven nights this week.",
                "you tapped \u201cafter work\u201d on three of them.",
                "the mood you logged the day after didn't move much either way.",
              ]}
              goal="you wanted to go for a run twice this week. you did it twice. last week you did it once. that's a direction."
              nights={sampleNights}
              showGoalDots
            />
            <WeekCard
              label="19 oct – 25 oct"
              lines={[
                "you logged five of the seven nights, and smoked on four of them.",
                "you tapped \u201cafter work\u201d on three of them.",
              ]}
              goal="you wanted to go for a run twice this week. you did it once. that's where it started."
              nights={priorNights}
            />
          </div>
        </section>

        {/* -------------------------------------------------------------- cta */}
        <section className="mt-16 rounded-[1.25rem] border border-line bg-card p-6">
          <h2 className="font-display text-[1.4rem] text-ink">a mirror, not a quit app.</h2>
          <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink-soft">
            if you decide to smoke less, that&rsquo;s your call. if you decide nothing changes, that&rsquo;s your call too.
            the card shows up either way.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition hover:opacity-90"
            >
              start, it&rsquo;s free
            </Link>
            <Link href="/install" className="rounded-full border border-line px-6 py-3 text-sm text-ink-soft transition hover:text-ink">
              put it on your phone
            </Link>
            <Link href="/help" className="rounded-full border border-frost/50 px-6 py-3 text-sm text-frost transition hover:border-frost">
              get help now
            </Link>
          </div>
        </section>

        <div className="mt-14">
          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
