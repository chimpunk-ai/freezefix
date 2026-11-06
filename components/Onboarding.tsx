"use client";

import { useState } from "react";
import Link from "next/link";
import { MoodFace } from "@/components/MoodFace";
import { BEDTIMES, GOAL_EXAMPLES, bedtimeLabel, patchProfile, type Goal, type Profile } from "@/lib/profile";
import { todayISO } from "@/lib/entry";

// Five small screens. No email, no password, no phone number: a pet-name, a
// bedtime, and one thing they'd like to do more of. The seven free days start
// when this finishes.

export default function Onboarding({ onDone }: { onDone: (p: Profile) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [bedtime, setBedtime] = useState<number>(23);
  const [goalText, setGoalText] = useState("");
  const [target, setTarget] = useState(2);
  const [underage, setUnderage] = useState(false);

  function finish() {
    const goal: Goal | null = goalText.trim()
      ? { text: goalText.trim().slice(0, 80), target, madeAt: todayISO() }
      : null;
    const p = patchProfile({
      name: name.trim().slice(0, 24),
      bedtime,
      goal,
      ageOk: true,
      onboarded: true,
      trialStart: todayISO(),
    });
    void fetch("/api/trial/start", { method: "POST" }).catch(() => {});
    onDone(p);
  }

  const steps = 4;

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

  return (
    <div className="mx-auto flex min-h-[78vh] w-full max-w-[560px] flex-col justify-center px-5 py-10">
      <div className="mb-8 flex gap-1.5" aria-hidden>
        {Array.from({ length: steps }).map((_, i) => (
          <span
            key={i}
            className={["h-1 flex-1 rounded-pill", i <= step ? "bg-accent" : "bg-line"].join(" ")}
          />
        ))}
      </div>

      {step === 0 ? (
        <section className="ff-rise">
          <h1 className="font-display text-28 text-ink">this is for adults.</h1>
          <p className="mt-3 text-16 text-ink-soft">are you 18 or over?</p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="ff-chip flex-1 rounded-pill bg-accent px-5 py-3 text-16 font-medium text-bg"
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
            no account, no email, no phone number. a name you make up is the whole sign-up.
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
            className="mt-6 w-full rounded-card border border-line bg-card px-4 py-4 font-display text-20 text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mt-6 w-full rounded-pill bg-accent px-6 py-3 text-16 font-medium text-bg"
          >
            next
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="ff-rise">
          <h1 className="font-display text-28 text-ink">when do you usually go to bed?</h1>
          <p className="mt-2 text-14 text-ink-faint">one quiet ping, around then. that&rsquo;s the only one.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {BEDTIMES.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setBedtime(h)}
                aria-pressed={bedtime === h}
                className={[
                  "ff-chip rounded-pill border px-4 py-2 text-14",
                  bedtime === h
                    ? "border-accent/50 bg-accent/15 text-accent"
                    : "border-line bg-card text-ink-soft",
                ].join(" ")}
              >
                {bedtimeLabel(h)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep(3)}
            className="mt-6 w-full rounded-pill bg-accent px-6 py-3 text-16 font-medium text-bg"
          >
            next
          </button>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="ff-rise">
          <h1 className="font-display text-28 text-ink">one small thing you&rsquo;d like to do more of?</h1>
          <p className="mt-2 text-14 text-ink-faint">
            this is yours. nothing happens if you skip it, and nothing happens if you don&rsquo;t do it.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {GOAL_EXAMPLES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoalText(g)}
                aria-pressed={goalText === g}
                className={[
                  "ff-chip rounded-pill border px-3 py-1.5 text-12",
                  goalText === g
                    ? "border-accent/50 bg-accent/15 text-accent"
                    : "border-line bg-card text-ink-soft",
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
            className="mt-4 w-full rounded-card border border-line bg-card px-4 py-3 text-14 text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none"
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
                  target === n
                    ? "border-accent/50 bg-accent/15 text-accent"
                    : "border-line bg-card text-ink-soft",
                ].join(" ")}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={finish}
            className="mt-7 w-full rounded-pill bg-accent px-6 py-3 text-16 font-medium text-bg"
          >
            start the week
          </button>
          <p className="mt-3 text-center text-12 text-ink-faint">seven days free. no card.</p>
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
