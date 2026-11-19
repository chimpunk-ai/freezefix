"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MoodFace } from "@/components/MoodFace";
import { TrustBadge } from "@/components/TrustBadge";
import { useRegion } from "@/components/useRegion";
import {
  BEDTIMES,
  CUT_DOWN_HISTORY,
  FREQUENCIES,
  GOAL_EXAMPLES,
  INTERFERES,
  SMOKE_TIMES,
  bedtimeLabel,
  patchProfile,
  type Goal,
  type Profile,
} from "@/lib/profile";
import { TRIGGERS, TRIGGER_LABEL, todayISO, type TriggerId } from "@/lib/entry";
import { buildBehaviourProfile } from "@/lib/behaviour-profile";
import { companionFor, traitFor, DEFAULT_COMPANION_NAME, STAGE_LABEL } from "@/lib/companion";
import { CompanionAvatar } from "@/components/CompanionAvatar";
import { plansFor, TRIAL_DAYS, type PlanId } from "@/lib/plans";

// Twelve small screens. No email, no password, no phone number: a pet-name,
// what weed is quietly interfering with, when they usually smoke, how often,
// what they've tried before, the trigger chips they want pre-filled in their
// log, a bedtime, a small goal, a plain explanation of what the product
// actually is, a real behaviour profile built from their own five answers
// (the wow moment — see lib/behaviour-profile.ts), and then the price. The
// seven free days start when they tap through the price screen.
//
// This is the commitment onboarding the research doc asked for
// (claude/Competitor_Research_Reframe_CalAI_2026-11.md): long enough that
// users have done the work of a customer before the paywall arrives, honest
// enough that none of the screens fake data, a progress bar, or a "scanning…"
// moment. Updated 19 Nov 2026: moved the paywall to right after the
// behaviour-profile reveal instead of at the very end with no pricing
// shown — the founder's call, modelled on Cal AI's "wow moment before the
// paywall" pattern. It still only *starts the free trial* when tapped
// (finish(), unchanged) rather than charging anything — payments are
// frozen and off, so this is the pricing screen's placement changing, not
// the billing behaviour.

// Spoken by the progress bar. Required steps gate "next"; optional ones don't.
const STEP_NAMES = [
  "are you an adult",
  "a name",
  "what weed is in the way of",
  "when you usually smoke",
  "how often",
  "what you've tried",
  "your trigger chips",
  "your bedtime",
  "one small thing",
  "what this is",
  "your profile & companion",
  "what it costs",
] as const;
const STEP_OPTIONAL = new Set([7, 8]);

const SMOKE_TIME_LABEL: Record<string, string> = {
  "after work": "evenings, mostly after work",
  "the evening": "evenings generally",
  "late night": "late nights",
  "weekends only": "weekends, not weekdays",
  "varies, honestly": "no particular time",
};

/** One line of the behaviour-profile card: a quiet label and the sentence. */
function ProfileLine({ label, children }: { label: string; children: string }) {
  return (
    <p className="text-14 text-ink-soft">
      <span className="text-12 uppercase tracking-[0.1em] text-ink-faint">{label}: </span>
      {children}
    </p>
  );
}

export default function Onboarding({ onDone }: { onDone: (p: Profile) => void }) {
  const [step, setStep] = useState(0);
  const [underage, setUnderage] = useState(false);

  // Collected values.
  const [name, setName] = useState("");
  const [interferesWith, setInterferesWith] = useState<string[]>([]);
  const [smokeTime, setSmokeTime] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("");
  const [triedCuttingDown, setTriedCuttingDown] = useState<string>("");
  const [preferredTriggers, setPreferredTriggers] = useState<TriggerId[]>([]);
  const [bedtime, setBedtime] = useState<number>(23);
  const [goalText, setGoalText] = useState("");
  const [target, setTarget] = useState(2);
  const [plan, setPlan] = useState<PlanId>("yearly");
  const [companionName, setCompanionName] = useState("");
  const region = useRegion();

  // age → name → interferes → smokeTime → frequency → cut-down history →
  // triggers → bedtime → goal → what-this-is → behaviour profile → pricing
  const steps = 12;

  const goal: Goal | null = useMemo(
    () => (goalText.trim() ? { text: goalText.trim().slice(0, 80), target, madeAt: todayISO() } : null),
    [goalText, target]
  );

  function finish() {
    const p = patchProfile({
      name: name.trim().slice(0, 24),
      bedtime,
      goal,
      ageOk: true,
      onboarded: true,
      trialStart: todayISO(),
      interferesWith: interferesWith.length ? interferesWith : undefined,
      smokeTime: smokeTime || undefined,
      preferredTriggers: preferredTriggers.length ? preferredTriggers : undefined,
      frequency: frequency || undefined,
      triedCuttingDown: triedCuttingDown || undefined,
      companionName: companionName.trim().slice(0, 24) || undefined,
      showCompanion: true,
    });
    void fetch("/api/trial/start", { method: "POST" }).catch(() => {});
    onDone(p);
  }

  function toggle<T extends string>(list: T[], value: T, setter: (v: T[]) => void, max: number) {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else if (list.length < max) {
      setter([...list, value]);
    }
  }

  // Suggested goal examples prioritise ones that connect to the user's
  // "interferes with" answers. If they said "the gym", surface the run goal
  // first. Honest nudge, not a trick.
  const suggestedGoals = useMemo(() => {
    const priority: Record<string, string> = {
      "the gym": "go for a run",
      "sleep": "not snooze my alarm more than once",
      "someone close": "call my brother back",
      "my focus": "finish a chapter of a book",
      "money": "make a proper dinner on a weeknight",
    };
    const first: string[] = [];
    for (const k of interferesWith) {
      const g = priority[k];
      if (g && !first.includes(g)) first.push(g);
    }
    const rest = GOAL_EXAMPLES.filter((g) => !first.includes(g));
    return [...first, ...rest];
  }, [interferesWith]);

  const profile = useMemo(
    () =>
      buildBehaviourProfile({
        name,
        interferesWith,
        smokeTime,
        preferredTriggers,
        frequency,
        triedCuttingDown,
        goal,
      }),
    [name, interferesWith, smokeTime, preferredTriggers, frequency, triedCuttingDown, goal]
  );

  const plans = useMemo(() => plansFor(region), [region]);

  if (underage) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[560px] flex-col justify-center px-5">
        <h1 className="font-display text-28 text-ink">not yet.</h1>
        <p className="mt-3 text-16 text-ink-soft">
          this one&rsquo;s for adults. if weed is making things hard right now, the help page has real
          people who will talk to you, whatever your age.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/help" className="rounded-pill border border-frost/40 bg-frost/10 px-4 py-2 text-14 text-frost">
            get help now
          </Link>
          <button
            type="button"
            onClick={() => setUnderage(false)}
            className="rounded-pill border border-line px-4 py-2 text-14 text-ink-soft"
          >
            back
          </button>
        </div>
      </div>
    );
  }

  const primaryBtn =
    "ff-chip w-full rounded-pill bg-signpost px-6 py-3 text-16 font-medium text-signpost-ink ff-cta-shadow transition-transform hover:-translate-y-[1px] disabled:opacity-50 disabled:hover:translate-y-0";
  const chipActive = "border-signpost/60 bg-signpost/15 text-signpost";
  const chipInactive = "border-line bg-card text-ink-soft";

  return (
    <div className="mx-auto flex min-h-[78vh] w-full max-w-[560px] flex-col justify-center px-5 py-10">
      <div
        className="mb-8 flex gap-1"
        role="progressbar"
        aria-label="set-up progress"
        aria-valuemin={1}
        aria-valuemax={steps}
        aria-valuenow={step + 1}
        aria-valuetext={`step ${step + 1} of ${steps}${STEP_NAMES[step] ? `: ${STEP_NAMES[step]}` : ""}`}
      >
        {Array.from({ length: steps }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            className={["h-1 flex-1 rounded-pill", i <= step ? "bg-signpost" : "bg-line"].join(" ")}
          />
        ))}
      </div>
      <p className="ff-sr" aria-live="polite">
        step {step + 1} of {steps}. {STEP_OPTIONAL.has(step) ? "optional." : ""}
      </p>

      {step === 0 ? (
        <section className="ff-rise">
          <h1 className="font-display text-28 text-ink">this is for adults.</h1>
          <p className="mt-3 text-16 text-ink-soft">are you 18 or over, and an adult where you live?</p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="ff-chip flex-1 rounded-pill bg-signpost px-5 py-3 text-16 font-medium text-signpost-ink ff-cta-shadow"
            >
              yes
            </button>
            <button
              type="button"
              onClick={() => setUnderage(true)}
              className="ff-chip flex-1 rounded-pill border border-line px-5 py-3 text-16 text-ink-soft"
            >
              no
            </button>
          </div>
          <p className="mt-6 text-12 text-ink-faint">
            no account is created. no email, no phone number. a name you make up is all we ask.
          </p>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="ff-rise">
          <h1 className="font-display text-28 text-ink">what should the mirror call you?</h1>
          <p className="mt-2 text-14 text-ink-faint">anything. it never leaves this phone.</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 24))}
            placeholder="nico"
            autoFocus
            className="mt-6 w-full rounded-card border border-line bg-card px-4 py-4 font-display text-20 text-ink placeholder:text-ink-faint focus:border-signpost/50 focus:outline-none"
          />
          <button type="button" onClick={() => setStep(2)} className={`mt-6 ${primaryBtn}`}>
            next
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="ff-rise">
          <h1 className="font-display text-28 text-ink">what&rsquo;s weed quietly in the way of?</h1>
          <p className="mt-2 text-14 text-ink-faint">pick up to three. we use this to shape the mirror, nothing else.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {INTERFERES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggle(interferesWith, t, setInterferesWith, 3)}
                aria-pressed={interferesWith.includes(t)}
                className={[
                  "ff-chip rounded-pill border px-3 py-2 text-14",
                  interferesWith.includes(t) ? chipActive : chipInactive,
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setStep(3)} className={`mt-7 ${primaryBtn}`} disabled={interferesWith.length === 0}>
            {interferesWith.length === 0 ? "pick at least one" : "next"}
          </button>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="ff-rise">
          <h1 className="font-display text-28 text-ink">when do you usually smoke?</h1>
          <p className="mt-2 text-14 text-ink-faint">one answer. shapes what tonight&rsquo;s log looks like.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {SMOKE_TIMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSmokeTime(t)}
                aria-pressed={smokeTime === t}
                className={[
                  "ff-chip rounded-pill border px-3 py-2 text-14",
                  smokeTime === t ? chipActive : chipInactive,
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setStep(4)} className={`mt-7 ${primaryBtn}`} disabled={!smokeTime}>
            {smokeTime ? "next" : "pick one"}
          </button>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="ff-rise">
          <h1 className="font-display text-28 text-ink">how often, honestly?</h1>
          <p className="mt-2 text-14 text-ink-faint">no judgment either way. this is just for your own profile.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                aria-pressed={frequency === f}
                className={[
                  "ff-chip rounded-pill border px-3 py-2 text-14",
                  frequency === f ? chipActive : chipInactive,
                ].join(" ")}
              >
                {f}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setStep(5)} className={`mt-7 ${primaryBtn}`} disabled={!frequency}>
            {frequency ? "next" : "pick one"}
          </button>
        </section>
      ) : null}

      {step === 5 ? (
        <section className="ff-rise">
          <h1 className="font-display text-28 text-ink">have you tried cutting down before?</h1>
          <p className="mt-2 text-14 text-ink-faint">whatever happened, it&rsquo;s not held against you here.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {CUT_DOWN_HISTORY.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setTriedCuttingDown(h)}
                aria-pressed={triedCuttingDown === h}
                className={[
                  "ff-chip rounded-pill border px-3 py-2 text-14",
                  triedCuttingDown === h ? chipActive : chipInactive,
                ].join(" ")}
              >
                {h}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setStep(6)} className={`mt-7 ${primaryBtn}`} disabled={!triedCuttingDown}>
            {triedCuttingDown ? "next" : "pick one"}
          </button>
        </section>
      ) : null}

      {step === 6 ? (
        <section className="ff-rise">
          <h1 className="font-display text-28 text-ink">which chips should the log have for you?</h1>
          <p className="mt-2 text-14 text-ink-faint">up to five. these appear as one-tap triggers on the nightly log.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {TRIGGERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggle(preferredTriggers, t, setPreferredTriggers, 5)}
                aria-pressed={preferredTriggers.includes(t)}
                className={[
                  "ff-chip rounded-pill border px-3 py-2 text-14",
                  preferredTriggers.includes(t) ? chipActive : chipInactive,
                ].join(" ")}
              >
                {TRIGGER_LABEL[t]}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setStep(7)} className={`mt-7 ${primaryBtn}`} disabled={preferredTriggers.length === 0}>
            {preferredTriggers.length === 0 ? "pick at least one" : "next"}
          </button>
        </section>
      ) : null}

      {step === 7 ? (
        <section className="ff-rise">
          <h1 className="font-display text-28 text-ink">when do you usually go to bed?</h1>
          <p className="mt-2 text-14 text-ink-faint">one quiet ping on sunday, around then. that&rsquo;s the only one. optional.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {BEDTIMES.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setBedtime(h)}
                aria-pressed={bedtime === h}
                className={[
                  "ff-chip rounded-pill border px-4 py-2 text-14",
                  bedtime === h ? chipActive : chipInactive,
                ].join(" ")}
              >
                {bedtimeLabel(h)}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setStep(8)} className={`mt-7 ${primaryBtn}`}>
            next
          </button>
        </section>
      ) : null}

      {step === 8 ? (
        <section className="ff-rise">
          <h1 className="font-display text-28 text-ink">one small thing you&rsquo;d like to do more of?</h1>
          <p className="mt-2 text-14 text-ink-faint">
            this is yours. nothing happens if you skip it, and nothing happens if you don&rsquo;t do it.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {suggestedGoals.slice(0, 6).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoalText(g)}
                aria-pressed={goalText === g}
                className={[
                  "ff-chip rounded-pill border px-3 py-1.5 text-12",
                  goalText === g ? chipActive : chipInactive,
                ].join(" ")}
              >
                {g}
              </button>
            ))}
          </div>
          <input
            value={goalText}
            onChange={(e) => setGoalText(e.target.value.slice(0, 80))}
            placeholder="or write your own"
            className="mt-4 w-full rounded-card border border-line bg-card px-4 py-3 text-14 text-ink placeholder:text-ink-faint focus:border-signpost/50 focus:outline-none"
          />
          <p className="mt-5 text-14 text-ink-soft">how many times a week?</p>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTarget(n)}
                aria-pressed={target === n}
                className={[
                  "ff-chip h-10 w-10 rounded-full border text-14",
                  target === n ? chipActive : chipInactive,
                ].join(" ")}
              >
                {n}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setStep(9)} className={`mt-7 ${primaryBtn}`}>
            next
          </button>
        </section>
      ) : null}

      {step === 9 ? (
        <section className="ff-rise">
          <h1 className="font-display text-28 text-ink">before you start.</h1>
          <p className="mt-4 text-16 text-ink">
            this is a mirror, not a quit app. nobody here tells you what to do.
          </p>
          <ul className="mt-4 space-y-3 text-14 text-ink-soft">
            {[
              "your log stays on this phone. we can't look you up.",
              smokeTime
                ? `we think you'll smoke ${SMOKE_TIME_LABEL[smokeTime] ?? smokeTime}. we don't check.`
                : "we don't check what you log — it's for you, not us.",
              "sunday evening, one soft ping, one card. that's the only notification.",
              "seven days free. no card. no email. no password.",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden className="mt-[0.75em] h-px w-3 shrink-0 bg-signpost/70" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          {/* One honest line about the one thing that DOES leave the phone —
              only on your own tap, never automatically. Says no more than
              lib/legal.ts §3 already discloses; this just surfaces it here,
              at the point it first matters, instead of only on /privacy. */}
          <p className="mt-5 text-12 text-ink-faint">
            if you ask Fix about your week, that week and your question go to our AI provider
            (Anthropic) to write the reply — only when you tap ask, never on their own. voice notes
            are typed out on your phone and never leave it.{" "}
            <Link href="/privacy" className="underline decoration-line underline-offset-4">
              full detail
            </Link>
            .
          </p>
          <button type="button" onClick={() => setStep(10)} className={`mt-8 ${primaryBtn}`}>
            see your profile
          </button>
        </section>
      ) : null}

      {step === 10 ? (
        <section className="ff-rise">
          {/* Same order as before: the profile data (what they just told us,
              in their own words) is the headline, exactly as it was. The
              avatar is added AFTER it, inside the existing "meet your
              companion" box — nothing here is removed or demoted, the
              drawing is just new. */}
          <p className="text-12 uppercase tracking-[0.18em] text-signpost">built from what you just told us</p>
          <h1 className="mt-2 font-display text-28 text-ink">
            {name.trim() ? `${name.trim()}'s` : "your"} cannabis behaviour profile.
          </h1>
          <p className="mt-2 text-14 text-ink-faint">
            not a diagnosis, not a guess — just your own five answers, reflected back in one place.
          </p>
          <article className="mt-5 space-y-3 rounded-sheet border border-line bg-card p-6">
            <ProfileLine label="trigger">{profile.triggerLine}</ProfileLine>
            <ProfileLine label="frequency">{profile.frequencyLine}</ProfileLine>
            <ProfileLine label="timing">{profile.timingLine}</ProfileLine>
            {profile.interferesLine ? <ProfileLine label="what it's in the way of">{profile.interferesLine}</ProfileLine> : null}
            {profile.historyLine ? <ProfileLine label="history">{profile.historyLine}</ProfileLine> : null}
            {profile.goalLine ? <ProfileLine label="your thing">{profile.goalLine}</ProfileLine> : null}
          </article>
          <p className="mt-5 text-14 text-ink-soft">
            this is month one. the mirror starts measuring for real the first night you log — this is just
            what you told it before that.
          </p>

          <div className="mt-6 flex flex-col items-center rounded-sheet border border-line bg-card px-6 py-8 text-center">
            <CompanionAvatar stage="seed" size={104} className="text-ink" />
            <p className="mt-2 text-12 uppercase tracking-[0.18em] text-signpost">give it a name</p>
            <h2 className="mt-2 font-display text-20 text-ink">meet your companion.</h2>
            <p className="mt-2 max-w-[32ch] text-14 text-ink-soft">
              it levels up when you log a night — never when you do or don&rsquo;t smoke. a gap in the log
              never costs you anything you&rsquo;ve already earned. ({traitFor({ smokeTime, frequency, triedCuttingDown })})
            </p>
            <input
              value={companionName}
              onChange={(e) => setCompanionName(e.target.value.slice(0, 24))}
              placeholder={DEFAULT_COMPANION_NAME}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              aria-label="give your companion a name"
              className="mt-4 w-full max-w-[22ch] rounded-card border border-line bg-bg px-4 py-3 text-center font-display text-16 text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none"
            />
            <p className="mt-3 text-12 text-ink-faint">
              {(() => {
                const c = companionFor(companionName, {});
                return `${c.name} starts as ${STAGE_LABEL[c.stage]} — level ${c.level}. you can rename it or turn it off any time in settings.`;
              })()}
            </p>
          </div>

          <button type="button" onClick={() => setStep(11)} className={`mt-6 ${primaryBtn}`}>
            see what it costs
          </button>
        </section>
      ) : null}

      {step === 11 ? (
        <section className="ff-rise">
          <h1 className="font-display text-28 text-ink">one price. seven days free first.</h1>
          <p className="mt-2 text-14 text-ink-soft">
            no card to start. the free week opens the whole thing — log, sunday card, shelf, fix.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="billing">
            {(["yearly", "monthly"] as PlanId[]).map((id) => {
              const p = plans[id];
              const selected = plan === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPlan(id)}
                  className={[
                    "ff-chip flex min-h-11 w-full flex-col rounded-sheet border p-4 text-left",
                    selected ? "border-accent/60 bg-accent/[0.07]" : "border-line bg-card hover:border-ink-faint",
                  ].join(" ")}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-14 text-ink">{p.label}</span>
                    <span
                      aria-hidden
                      className={["h-4 w-4 rounded-full border", selected ? "border-accent bg-accent" : "border-ink-faint"].join(" ")}
                    />
                  </span>
                  <span className="mt-3 block font-display text-28 leading-none text-ink">{p.price}</span>
                  <span className="mt-2 block text-12 text-ink-faint">{p.note}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-12 text-ink-faint">
            {TRIAL_DAYS} days free, then {plans[plan].price} a {plans[plan].per}. payments aren&rsquo;t switched
            on yet, so right now nothing can actually be charged — this is the price it will be.
          </p>

          <div className="mt-6">
            <TrustBadge />
          </div>

          <button type="button" onClick={finish} className={`mt-6 ${primaryBtn}`}>
            start {TRIAL_DAYS} days free
          </button>
        </section>
      ) : null}

      {step > 0 ? (
        <div className="mt-8 flex items-center justify-between">
          <button type="button" onClick={() => setStep((s) => s - 1)} className="text-14 text-ink-faint hover:text-ink-soft">
            back
          </button>
          <span className="inline-flex items-center gap-1.5 text-12 text-ink-faint">
            <MoodFace mood={3} size={16} /> your log stays on this phone
          </span>
        </div>
      ) : null}
    </div>
  );
}
