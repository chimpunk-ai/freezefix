import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

const principles = [
  {
    title: "Lazy by design",
    body: "The daily log should take seconds, not become another journal to maintain. The weekly mirror should be legible in a glance and skippable when life is busy. The interface earns attention by asking for very little of it.",
  },
  {
    title: "No streaks that shame",
    body: "A use day is a note, not a reset. There is no abstinence counter, broken-streak warning, public score, or guilt message. Missed days remain open rather than being recast as failures.",
  },
  {
    title: "Pet-name, not profile",
    body: "The core loop is designed to work without an account, email address, phone number, or social sign-in. The chosen name and daily log stay in browser storage on the device. The launch-list email is a separate, optional request for updates.",
  },
  {
    title: "Harm reduction, not abstinence",
    body: "Fix does not assume cannabis is either good or bad, and does not choose a goal for the person. The mirror describes what was recorded; the person decides what, if anything, they want to change.",
  },
  {
    title: "The person is not the problem",
    body: "A regular cannabis user is a whole adult, not a diagnosis waiting to happen. Copy, data displays, and interactions should respect their time, privacy, choices, and intelligence.",
  },
];

const boundaries = [
  "A quitting or abstinence app",
  "A recovery community, feed, or social leaderboard",
  "A therapist, coach, companion, or crisis service",
  "A strain, dosage, dealer, or dispensary tracker",
  "A medical device, diagnosis tool, or clinical-outcome claim",
  "A sleep or meditation content library",
];

export default function ProductPlanPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-16">
      <header className="flex items-center justify-between gap-4 py-5">
        <Link href="/" aria-label="Fix home" className="flex items-center gap-2.5">
          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-serif text-lg italic text-accent-ink" style={{ fontFamily: "var(--font-display)" }}>f</span>
          <span className="font-serif text-xl text-ink" style={{ fontFamily: "var(--font-display)" }}>Fix</span>
        </Link>
        <Link href="/help" className="flex min-h-11 items-center rounded-full border border-frost/60 px-4 text-sm text-frost">Get help now</Link>
      </header>

      <section className="grid gap-8 border-b border-line py-10 md:grid-cols-[1.1fr_0.9fr] md:items-end md:py-16">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Product brief · current status, plainly</p>
          <h1 className="mt-4 max-w-[14ch] text-[clamp(2.6rem,7vw,4.8rem)] leading-[1.02] text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>A private mirror, not a verdict.</h1>
          <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-ink-soft">Fix is being built for adults who use cannabis and want to notice how it fits into their week—without being told they must quit, diagnosed, or turned into a streak.</p>
        </div>
        <aside className="rounded-[1.25rem] border border-accent/30 bg-card p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">A transparent status note</p>
          <p className="mt-3 text-sm leading-relaxed text-ink">This code version includes the device-local daily log and a manually opened weekly mirror. Sunday notifications, the mirror-grounded Fix chat, paid checkout, and cross-device sync are not active. The public waitlist does not start a trial or charge you.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/home" className="inline-flex min-h-10 items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-ink">Open daily log</Link>
            <Link href="/pricing" className="inline-flex min-h-10 items-center rounded-full border border-line px-4 text-sm text-ink">Planned pricing</Link>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 border-b border-line py-10 md:grid-cols-[0.7fr_1.3fr] md:py-14">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">The person</p>
          <h2 className="mt-3 text-3xl leading-tight text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>Not in crisis. Just curious.</h2>
        </div>
        <div className="flex flex-col gap-4 text-base leading-relaxed text-ink-soft">
          <p>Someone may be doing fine on paper and still have a quiet question: is cannabis affecting my sleep, mood, relationships, plans, or the things I keep putting off? They are not necessarily looking for a recovery program or a reason to quit. They want a way to pay attention without making it a whole thing.</p>
          <p>Most habit tools lean toward abstinence counters or enthusiast tracking. Fix takes a third shape: a few plain daily notes, followed by a gentle reflection on the week. If the person decides to change something, the decision belongs to them. If they do not, the mirror is still theirs.</p>
        </div>
      </section>

      <section className="border-b border-line py-10 md:py-14" aria-labelledby="loop-title">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">The product · three things</p>
        <h2 id="loop-title" className="mt-3 max-w-[20ch] text-3xl leading-tight text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>The log. The mirror. Your goal.</h2>
        <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-ink-soft">Everything else should support these three parts. The day-to-day ritual leaves a small trail; once a week, the person can look at the shape of it; and a personal goal gives that pattern a human context without turning it into an obligation.</p>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.25rem] border border-line bg-card p-5"><p className="font-mono text-xs text-ink-faint">01 · LOG</p><h3 className="mt-3 text-xl text-ink" style={{ fontFamily: "var(--font-display)" }}>A few taps, then out.</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">Use yes/no, one of five drawn mood faces, and up to three optional context chips. An optional short speech note can add words when a tap is not enough. No paragraph is required.</p></article>
          <article className="rounded-[1.25rem] border border-line bg-card p-5"><p className="font-mono text-xs text-ink-faint">02 · MIRROR</p><h3 className="mt-3 text-xl text-ink" style={{ fontFamily: "var(--font-display)" }}>One honest week.</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">A seven-day card describes only the check-ins that exist. It can show counts, recurring context, and mood observations only when enough data supports a comparison. Blank days remain blank.</p></article>
          <article className="rounded-[1.25rem] border border-line bg-card p-5"><p className="font-mono text-xs text-ink-faint">03 · YOUR GOAL</p><h3 className="mt-3 text-xl text-ink" style={{ fontFamily: "var(--font-display)" }}>A direction you name.</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">Choose one small thing you would like to do more—run, cook, read, or call someone. A quiet optional tap records progress. It is not a promise, pass/fail test, or abstinence target.</p></article>
        </div>
      </section>

      <section className="grid gap-8 border-b border-line py-10 md:grid-cols-[0.72fr_1.28fr] md:py-14">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">01 · The daily loop</p>
          <h2 className="mt-3 text-3xl leading-tight text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>Tonight, in under ten seconds.</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">The log is the home screen. No feed to scroll before the useful thing appears.</p>
        </div>
        <div className="rounded-[1.25rem] border border-line bg-card p-5 sm:p-7">
          <ol className="flex flex-col gap-4">
            {[
              ["01", "Did you use cannabis today?", "Yes or no. A use day is a note, not a relapse."],
              ["02", "How did today feel?", "Choose one of five warm, hand-drawn mood faces. No emoji, no clinical label."],
              ["03", "What was around it?", "If you used, choose up to three optional context chips: after work, after someone, bored, couldn’t sleep, with friends, alone, or something else."],
              ["04", "Did you do your thing?", "A single optional yes/no for the small goal you chose. Skip it whenever you like."],
              ["05", "Anything to add?", "An optional voice note is capped at ten seconds. Speech recognition is browser-provided; FreezeFix stores the transcript locally, not a recording."],
              ["06", "Save and leave.", "The check-in remains on this device. A fourteen-day row gives a quiet view of recent dots—no streak, reset, or reward loop."],
            ].map(([number, title, body]) => <li key={number} className="grid grid-cols-[2.5rem_1fr] gap-3"><span className="font-mono text-xs text-ink-faint">{number}</span><div><h3 className="text-sm font-medium text-ink">{title}</h3><p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p></div></li>)}
          </ol>
          <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">Notifications are not enabled in this build. No bedtime reminders or Sunday push notifications are sent. The weekly mirror can be opened on demand.</p>
        </div>
      </section>

      <section className="grid gap-8 border-b border-line py-10 md:grid-cols-[0.72fr_1.28fr] md:py-14">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">02 · The weekly mirror</p>
          <h2 className="mt-3 text-3xl leading-tight text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>A card that shows the shape.</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">Open it on Sunday evening if you like. It should take less than a minute to read, or a little longer if you choose to reflect.</p>
        </div>
        <div className="rounded-[1.25rem] border border-line bg-card p-5 sm:p-7">
          <div className="rounded-xl border border-accent/25 bg-bg p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Illustrative only · not real user data</p>
            <p className="mt-3 text-lg text-ink" style={{ fontFamily: "var(--font-display)" }}>Nico, here’s your week.</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">You logged use on four of the days you checked in. “After work” appeared on three of those days. Only you know what that means.</p>
            <div className="mt-4 grid grid-cols-7 gap-1.5" aria-hidden="true">
              {["use", "use", "open", "no use", "open", "use", "no use"].map((state, i) => <span key={i} className={`flex h-10 items-center justify-center rounded-lg border text-[9px] ${state === "use" ? "border-accent/70 bg-accent/10 text-ink" : state === "no use" ? "border-accent/40 bg-accent/25 text-ink" : "border-line text-ink-faint"}`}>{["M", "T", "W", "T", "F", "S", "S"][i]}</span>)}
            </div>
            <p className="mt-4 border-t border-line pt-3 text-xs text-ink-soft">Your thing: run twice. You checked it off once. A direction, not a grade.</p>
          </div>
          <ul className="mt-5 grid gap-3 text-sm leading-relaxed text-ink-soft">
            <li><strong className="font-medium text-ink">Seven local days.</strong> A small grid marks use, no use, and no check-in. Mood faces and chosen context make the picture more personal.</li>
            <li><strong className="font-medium text-ink">Careful language.</strong> The mirror says “you logged” and “appeared together,” not “caused,” “because,” or “you should.” It is descriptive, not diagnostic.</li>
            <li><strong className="font-medium text-ink">Minimum evidence.</strong> A mood comparison is withheld unless there are at least three ratings in each group. With sparse data, the card says there is not enough yet.</li>
            <li><strong className="font-medium text-ink">Sundays past.</strong> Saved weeks form a quiet, on-device archive. It is not a public feed and is not shareable in this build.</li>
          </ul>
          <p className="mt-5 rounded-xl border border-line/70 p-3 text-xs leading-relaxed text-ink-faint">The current log records mood on the same day as the check-in. It does not yet collect a separate next-morning mood, so no next-morning comparison is claimed.</p>
        </div>
      </section>

      <section className="grid gap-8 border-b border-line py-10 md:grid-cols-[0.72fr_1.28fr] md:py-14">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">03 · Fix, beside the mirror</p>
          <h2 className="mt-3 text-3xl leading-tight text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>A tool, not a companion.</h2>
        </div>
        <div className="flex flex-col gap-4 text-sm leading-relaxed text-ink-soft">
          <p>The intended Fix is a user-initiated, brief way to ask one question about a week: a day, a context, a mood, or a goal. It should ground answers only in information the person explicitly chooses to share. It should end with a useful statement rather than pulling them into an endless conversation.</p>
          <p>Fix does not initiate messages, ask for dependency, diagnose, recommend strains or doses, or replace a person. It is not a therapist, friend, or crisis line. If someone needs urgent help, the app should step aside and make human, country-specific help easy to reach. Safety support remains free and available without a paid plan.</p>
          <p className="rounded-xl border border-line bg-card p-4 text-xs">Current status: the existing Fix chat is a separate legacy tool and is not yet grounded in the new daily log. It does not receive this local log automatically. Treat the mirror-grounded question flow and its five-turn free cap as planned until they are implemented and tested.</p>
        </div>
      </section>

      <section className="grid gap-8 border-b border-line py-10 md:grid-cols-[0.72fr_1.28fr] md:py-14">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Privacy · in plain language</p>
          <h2 className="mt-3 text-3xl leading-tight text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>Your log stays here.</h2>
        </div>
        <div className="rounded-[1.25rem] border border-line bg-card p-5 sm:p-7">
          <dl className="divide-y divide-line/70">
            {[
              ["Daily check-ins and goals", "Browser local storage on this device. Not uploaded or synced by the log."],
              ["Nickname", "Stored locally to personalize your mirror. No signup profile is created."],
              ["Optional daily voice note", "Browser speech service may process audio. FreezeFix stores the transcript locally, not an audio recording."],
              ["Fix chat", "Separate and user-started. Text or files submitted there go to the configured AI provider; the local log is not attached automatically."],
              ["Launch updates", "Optional email signup, separate from the app. Joining is not an account, trial, or payment authorization."],
              ["Delete", "Settings clears local app data. This cannot recall content already sent to an AI provider or remove a separate waitlist email; contact privacy@getfreezefix.com for those requests."],
            ].map(([term, definition]) => <div key={term} className="grid gap-1 py-3 sm:grid-cols-[0.75fr_1.25fr] sm:gap-5"><dt className="text-sm font-medium text-ink">{term}</dt><dd className="text-sm leading-relaxed text-ink-soft">{definition}</dd></div>)}
          </dl>
          <Link href="/privacy" className="mt-4 inline-flex min-h-10 items-center text-sm text-ink underline underline-offset-4">Read the full Privacy Policy</Link>
        </div>
      </section>

      <section className="border-b border-line py-10 md:py-14">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">The feel</p>
        <h2 className="mt-3 max-w-[18ch] text-3xl leading-tight text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>Quiet, warm, almost boring on purpose.</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Warm black", "#12100E · easier on the eyes late at night than pure black."],
            ["Soft sage", "#9CAF88 · reserved for the meaningful tap and selected state."],
            ["Two type voices", "Inter for clear interface text; Newsreader for a few human, editorial moments."],
            ["Three motions, not a show", "A gentle breathing cue, the mirror arriving, and one quiet goal pulse. Reduced-motion preferences are respected."],
          ].map(([title, text]) => <article key={title} className="rounded-xl border border-line bg-card p-4"><h3 className="text-sm font-medium text-ink">{title}</h3><p className="mt-2 text-xs leading-relaxed text-ink-soft">{text}</p></article>)}
        </div>
        <p className="mt-5 text-sm leading-relaxed text-ink-soft">The product voice is brief and specific: “Saved. See you Sunday.” No exclamation marks, no pep talks, no wellness-brand performance. Terracotta is reserved for the persistent Get help now control.</p>
      </section>

      <section className="grid gap-8 border-b border-line py-10 md:grid-cols-[0.72fr_1.28fr] md:py-14">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Pricing · honest status</p>
          <h2 className="mt-3 text-3xl leading-tight text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>One plan, when it is ready.</h2>
        </div>
        <div className="flex flex-col gap-4 text-sm leading-relaxed text-ink-soft">
          <p>The supplied brief proposes one paid plan, a seven-day full-access trial with no card at the start, and monthly or annual billing. The prices shown on the pricing page are intended launch prices, not a discount or a live offer. No trial, subscription, or payment begins today.</p>
          <p>Payment, renewal, tax, cancellation, and trial-conversion details must be implemented and reviewed before checkout is enabled. No payment flow should go live until the user sees the exact terms before consenting.</p>
          <Link href="/pricing" className="inline-flex min-h-11 w-fit items-center rounded-full border border-line px-4 text-sm text-ink">See planned pricing →</Link>
        </div>
      </section>

      <section className="border-b border-line py-10 md:py-14">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Launch focus</p>
        <h2 className="mt-3 max-w-[18ch] text-3xl leading-tight text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>Italy and Spain first. English elsewhere.</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <article className="rounded-[1.25rem] border border-line bg-card p-5"><h3 className="text-lg text-ink" style={{ fontFamily: "var(--font-display)" }}>First: the right product</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">The launch focus is adults in Italy and Spain, with the Italian and Spanish experiences treated as first-class product copy—not merely machine-translated labels. English is the fallback for other markets. Crisis resources remain localized wherever supported.</p></article>
          <article className="rounded-[1.25rem] border border-line bg-card p-5"><h3 className="text-lg text-ink" style={{ fontFamily: "var(--font-display)" }}>Then: thoughtful distribution</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">The distribution idea is small creator trials with honest, consent-based feedback. No fabricated testimonials, no forced promotional claims, and no public user data. Any creator post or user-shared card must be voluntary and privacy-safe.</p></article>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink-faint">Current status: the public site has six localized landing pages. The redesigned in-app flow is still English-first; Italian and Spanish end-to-end product QA is required before describing the product as launched in those markets.</p>
      </section>

      <section className="py-10 md:py-14">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">What Fix will not become</p>
        <h2 className="mt-3 max-w-[18ch] text-3xl leading-tight text-ink" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>The boundaries are part of the product.</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boundaries.map((boundary) => <li key={boundary} className="rounded-xl border border-line bg-card p-4 text-sm leading-relaxed text-ink-soft">{boundary}</li>)}
        </ul>
        <p className="mt-5 max-w-[70ch] text-base leading-relaxed text-ink">The one promise beneath the feature list is simple: <strong className="font-medium">the person is not the problem.</strong> A mirror does not tell someone what to change. It shows what was logged, clearly and gently, and leaves the next decision with them.</p>
      </section>

      <section className="rounded-[1.5rem] border border-accent/30 bg-card p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Try the current build</p>
        <h2 className="mt-3 text-2xl text-ink" style={{ fontFamily: "var(--font-display)" }}>A few taps. Your own week.</h2>
        <p className="mt-2 max-w-[55ch] text-sm leading-relaxed text-ink-soft">The local log and manually opened weekly mirror are available for testing. Notifications, AI interpretation of the mirror, trial billing, and sync are not active.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/home" className="inline-flex min-h-12 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-ink">Open the daily log</Link>
          <Link href="/patterns" className="inline-flex min-h-12 items-center rounded-full border border-line px-6 text-sm text-ink">Open weekly mirror</Link>
          <Link href="/help" className="inline-flex min-h-12 items-center rounded-full border border-frost/60 px-6 text-sm text-frost">Get help now</Link>
        </div>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}
