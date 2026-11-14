"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* The nine-second nightly log, played back.
 *
 * The landing used to describe the log in prose and show a chat transcript.
 * The live site shows the thing itself: press play, and the screen walks
 * through yes → one face → two chips → save in nine seconds. Nothing is
 * saved, no microphone is opened, no request is made.
 *
 * Timings (ms from press):
 *    900  yes is tapped
 *   2100  a face lands
 *   3300  first chip lands
 *   4100  second chip lands
 *   6200  save → "saved. see you sunday."
 *
 * prefers-reduced-motion: jump straight to the finished state instead of
 * animating a ritual at somebody who asked the machine to stop moving.
 *
 * `Face` is exported because the sample Sunday card on the landing uses the
 * same five abstract faces — the brief is explicit that these are drawn, not
 * emoji, and slightly warm rather than cute.
 */

const CHIPS = [
  "after work",
  "bored",
  "couldn't sleep",
  "with friends",
  "alone",
  "after her",
];

/* Smile → flat → frown, drawn as one path per level so the five faces read
 * as one family. Level order matches the brief: great, good, okay, low, rough. */
const MOUTHS = [
  "M8 14.2q4 4.6 8 0",
  "M8.5 14.6q3.5 3 7 0",
  "M8.5 16h7",
  "M8.5 17.6q3.5-3 7 0",
  "M8 18.2q4-4.6 8 0",
];

export function Face({
  level,
  active = false,
  size = 26,
}: {
  level: number;
  active?: boolean;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle
        cx="12"
        cy="12"
        r="10.4"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity={active ? 1 : 0.42}
      />
      <circle cx="9.1" cy="9.8" r="1.05" fill="currentColor" opacity={active ? 1 : 0.65} />
      <circle cx="14.9" cy="9.8" r="1.05" fill="currentColor" opacity={active ? 1 : 0.65} />
      <path
        d={MOUTHS[level] ?? MOUTHS[2]}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Phase = "idle" | "playing" | "saved";

/* Fourteen dots: filled = a night you smoked, open = a night you didn't,
 * dash = a night you didn't open the app. No streak language anywhere. */
const DOTS: Array<boolean | null> = [
  null,
  true,
  false,
  true,
  true,
  null,
  false,
  true,
  true,
  true,
  false,
  false,
  true,
  true,
];

export default function RitualDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [smoked, setSmoked] = useState<boolean | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [chips, setChips] = useState<string[]>([]);
  const timers = useRef<number[]>([]);

  const clear = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const play = useCallback(() => {
    clear();
    setSmoked(null);
    setMood(null);
    setChips([]);

    const reduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setSmoked(true);
      setMood(1);
      setChips(["after work", "couldn't sleep"]);
      setPhase("saved");
      return;
    }

    setPhase("playing");
    const at = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, ms));
    };
    at(900, () => setSmoked(true));
    at(2100, () => setMood(1));
    at(3300, () => setChips(["after work"]));
    at(4100, () => setChips(["after work", "couldn't sleep"]));
    at(6200, () => setPhase("saved"));
  }, [clear]);

  useEffect(() => clear, [clear]);

  const playing = phase === "playing";
  const saved = phase === "saved";
  const picked = smoked === true;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={play}
          className="flex min-h-[48px] items-center gap-2.5 rounded-full border border-accent/50 bg-accent/12 px-5 py-2.5 text-sm text-ink transition hover:bg-accent/20 active:scale-[0.99]"
        >
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] text-accent-ink"
          >
            &#9654;
          </span>
          {playing
            ? "playing it back\u2026"
            : saved
              ? "play it again \u00b7 9s"
              : "play the nightly ritual \u00b7 9s"}
        </button>
        <span className="text-xs text-ink-faint">
          silent. nothing is saved. a sample night, not yours.
        </span>
      </div>

      <div
        role="group"
        aria-label="the nightly log, a sample"
        className="mt-4 rounded-[1.75rem] border border-line bg-card p-5 sm:p-6"
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-xs text-ink-faint">21:14</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            today &middot; saturday 14 november
          </span>
        </div>

        <p
          className="mt-4 text-[1.35rem] leading-tight text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          did you smoke today?
        </p>

        <div className="mt-3 flex gap-2">
          {[true, false].map((value) => {
            const on = smoked === value;
            return (
              <span
                key={String(value)}
                className={`min-h-[44px] rounded-full border px-6 py-2.5 text-sm transition-colors ${
                  on
                    ? "border-accent bg-accent/20 text-ink"
                    : "border-line text-ink-soft"
                }`}
              >
                {value ? "yes" : "no"}
              </span>
            );
          })}
        </div>

        <p className="mt-5 text-sm text-ink-soft">
          did you get to &ldquo;go for a run&rdquo; today?
        </p>
        <div className="mt-2 flex gap-2 text-xs">
          {["yes", "no", "skip"].map((label) => (
            <span
              key={label}
              className="rounded-full border border-line px-3 py-1.5 text-ink-faint"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 items-center justify-center rounded-full border text-[11px] ${
              playing ? "border-accent text-accent" : "border-line text-ink-faint"
            }`}
          >
            mic
          </span>
          <div className="leading-tight">
            <p className="text-sm text-ink-soft">hold to say something</p>
            <p className="text-[11px] text-ink-faint">
              ten seconds, if you want. it isn&rsquo;t required.
            </p>
          </div>
          <span className="ml-auto text-[11px] text-ink-faint underline underline-offset-4">
            type instead
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {CHIPS.map((chip) => {
            const on = chips.includes(chip);
            return (
              <span
                key={chip}
                className={`rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
                  on
                    ? "border-accent/60 bg-accent/15 text-ink"
                    : "border-line text-ink-faint"
                }`}
              >
                {chip}
              </span>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span
            className={`rounded-full px-6 py-2.5 text-sm transition-colors ${
              picked
                ? "bg-accent text-accent-ink"
                : "border border-line text-ink-faint"
            }`}
          >
            save
          </span>
          <span className="text-xs text-ink-soft">
            {saved ? "saved. see you sunday." : "three taps is enough."}
          </span>
        </div>

        <div className="mt-6 border-t border-line pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            the last fourteen days
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {DOTS.map((dot, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full ${
                  dot === true
                    ? "bg-accent"
                    : dot === false
                      ? "border border-accent/60"
                      : "border border-line/70"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-ink-faint">
            a filled dot is a night you smoked. an open one isn&rsquo;t.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-frost/60 px-3.5 py-1.5 text-[11px] text-frost">
            i need fix now
          </span>
          <span className="rounded-full border border-line px-3.5 py-1.5 text-[11px] text-ink-faint">
            the weeks
          </span>
        </div>
      </div>
    </div>
  );
}
