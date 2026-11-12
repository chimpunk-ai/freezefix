"use client";

import { useEffect, useRef, useState } from "react";
import LogScreen, { type LogDemoState } from "@/components/LogScreen";
import PhoneFrame from "@/components/PhoneFrame";
import { SAMPLE_GOAL } from "@/lib/sample";
import type { Profile } from "@/lib/profile";

// The nightly ritual, played once, in real time, in the real log.
//
// Nothing here is a video: it is the LogScreen component with a scripted
// state, inside a phone frame, moved along by timers. Silent. Nothing is
// saved. The user presses play; it never starts on its own. Under reduced
// motion the script skips to the end, because a nine-second sequence of
// state changes is motion whether or not anything slides.

const sampleProfile: Profile = {
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

type Step = { at: number; state: LogDemoState; caption: string };

const IDLE: LogDemoState = { smoked: null, mood: null, triggers: [], goalDone: undefined, saved: false };

// Total runtime ≈ 9s, which is the product's own "under ten seconds" claim.
const STEPS: Step[] = [
  { at: 0, state: IDLE, caption: "the whole ritual, in real time." },
  { at: 1200, state: { ...IDLE, smoked: true }, caption: "one tap: yes." },
  { at: 3000, state: { ...IDLE, smoked: true, mood: 3 }, caption: "one face. tonight’s a flat one." },
  {
    at: 4800,
    state: { ...IDLE, smoked: true, mood: 3, triggers: ["after-work"] },
    caption: "one chip. after work, like most tuesdays.",
  },
  {
    at: 6600,
    state: { ...IDLE, smoked: true, mood: 3, triggers: ["after-work"], goalDone: true },
    caption: "and the one thing you chose: done.",
  },
  {
    at: 8400,
    state: { smoked: true, mood: 3, triggers: ["after-work"], goalDone: true, saved: true },
    caption: "saved. see you sunday. that’s it.",
  },
];

const REDUCED_CAPTION = "saved. see you sunday. (motion is reduced on this device, so here’s the end.)";

// Same pill as the landing page's primary action, so the demo's one control
// reads as part of the page rather than a player chrome.
const PLAY_BTN =
  "ff-chip inline-flex min-h-12 items-center rounded-pill bg-signpost px-6 text-16 font-medium text-signpost-ink shadow-[0_8px_24px_-12px_rgba(240,168,104,0.6)] transition-transform hover:-translate-y-[1px] aria-disabled:cursor-default aria-disabled:opacity-70 aria-disabled:hover:translate-y-0";

const noop = () => {};

export default function RitualDemo() {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [caption, setCaption] = useState(STEPS[0].caption);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  function play() {
    if (phase === "playing") return;
    clearTimers();

    const reduced =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setStep(STEPS.length - 1);
      setCaption(REDUCED_CAPTION);
      setPhase("done");
      return;
    }

    setStep(0);
    setCaption(STEPS[0].caption);
    setPhase("playing");
    STEPS.forEach((s, i) => {
      if (i === 0) return;
      timers.current.push(
        window.setTimeout(() => {
          setStep(i);
          setCaption(s.caption);
          if (i === STEPS.length - 1) setPhase("done");
        }, s.at),
      );
    });
  }

  const state = STEPS[step].state;
  const label = phase === "idle" ? "play the nightly ritual · 9s" : phase === "playing" ? "playing…" : "play it again";

  return (
    <div role="group" aria-label="demo of the nightly log" className="flex flex-col items-center">
      <PhoneFrame label="the nightly log, a sample night" width={300}>
        <div className="px-5 pt-4">
          <LogScreen
            profile={sampleProfile}
            entries={{}}
            demo={state}
            onSaved={noop}
            onOpenFix={noop}
            onOpenMirror={noop}
            mirrorReady={false}
          />
        </div>
      </PhoneFrame>

      <div className="mt-5 flex items-center gap-2" aria-hidden>
        {STEPS.map((s, i) => (
          <span
            key={s.at}
            className={[
              "h-1.5 w-1.5 rounded-full transition-colors",
              i <= step && phase !== "idle" ? "bg-accent" : "bg-line",
            ].join(" ")}
          />
        ))}
      </div>

      <p className="mt-3 min-h-[1.5rem] text-center text-14 text-ink-soft" aria-live="polite">
        {caption}
      </p>

      <button
        type="button"
        onClick={play}
        aria-disabled={phase === "playing"}
        className={`${PLAY_BTN} mt-4`}
      >
        {label}
      </button>
      <p className="mt-3 text-center text-12 text-ink-faint">silent. nothing is saved. a sample night, not yours.</p>
    </div>
  );
}
