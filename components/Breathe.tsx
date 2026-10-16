"use client";

import { useEffect, useRef, useState } from "react";

// Quick Unfreeze: a guided breath, about 60 seconds.
//
// Free forever, never behind the paywall, and it needs no AI, no network and no account.
// That matters: if the API is down or someone has no signal, this still works.
//
// The pattern is 4 in, 6 out. The long out-breath is the part that settles you, so it's
// longer than the in-breath on purpose. No breath-holding: holding can make a racing heart
// feel worse, and this is built for people whose head is already going.

const IN = 4;
const OUT = 6;
const ROUNDS = 6; // 6 x 10s = one minute

type Phase = "in" | "out";

export default function Breathe({ onDone }: { onDone: () => void }) {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("in");
  const [left, setLeft] = useState(IN);
  const [round, setRound] = useState(0);
  const [reduced, setReduced] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setReduced(Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches));
  }, []);

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => {
      setLeft((n) => {
        if (n > 1) return n - 1;
        // Phase over: swap, and count a round each time an out-breath finishes.
        setPhase((p) => {
          if (p === "in") {
            setLeft(OUT);
            return "out";
          }
          setRound((r) => r + 1);
          setLeft(IN);
          return "in";
        });
        return n;
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [running]);

  useEffect(() => {
    if (round >= ROUNDS) setRunning(false);
  }, [round]);

  const finished = round >= ROUNDS;
  const seconds = phase === "in" ? IN : OUT;
  // The circle grows on the in-breath and shrinks on the out, so there's something to follow
  // without reading anything.
  const scale = running && !reduced ? (phase === "in" ? 1 : 0.55) : 0.8;

  return (
    <section className="flex min-h-0 flex-1 flex-col items-center justify-between gap-6 py-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-extrabold leading-tight text-ink">
          {finished ? "That's the minute." : running ? (phase === "in" ? "In through your nose" : "Out through your mouth") : "One minute, nothing else"}
        </h1>
        <p className="max-w-[30ch] text-base text-ink-soft">
          {finished
            ? "No need to feel different. Sitting still for a minute is the whole thing."
            : running
              ? "Follow the circle. Don't force it."
              : "Four counts in, six counts out. The long one out is the bit that works."}
        </p>
      </div>

      <div className="relative flex h-60 w-60 items-center justify-center" aria-hidden="true">
        <span
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,138,216,0.45),rgba(123,92,255,0.25)_60%,transparent_72%)]"
          style={{
            transform: `scale(${scale})`,
            transition: reduced ? "none" : `transform ${seconds}s cubic-bezier(.4,0,.3,1)`,
          }}
        />
        <span className="relative text-6xl font-extrabold tabular-nums text-ink">
          {running ? left : finished ? "✓" : ROUNDS * (IN + OUT) + "s"}
        </span>
      </div>

      {/* Spoken out so it works for anyone not watching the screen or using a reader. */}
      <p aria-live="polite" className="sr-only">
        {running ? (phase === "in" ? "Breathe in" : "Breathe out") : ""}
      </p>

      <div className="flex w-full flex-col gap-3">
        <div className="flex justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: ROUNDS }).map((_, i) => (
            <span key={i} className={`h-1.5 w-6 rounded-full ${i < round ? "bg-accent" : "bg-chip"}`} />
          ))}
        </div>

        {finished ? (
          <button
            onClick={onDone}
            className="w-full rounded-[1.75rem] bg-accent px-5 py-5 text-xl font-bold text-accent-ink transition active:scale-[0.98]"
          >
            Done
          </button>
        ) : running ? (
          <button
            onClick={() => setRunning(false)}
            className="w-full rounded-[1.75rem] border border-line px-5 py-5 text-xl font-semibold text-ink"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={() => {
              setRound(0);
              setPhase("in");
              setLeft(IN);
              setRunning(true);
            }}
            className="w-full rounded-[1.75rem] bg-accent px-5 py-5 text-xl font-bold text-accent-ink transition active:scale-[0.98]"
          >
            {round > 0 ? "Start again" : "Start"}
          </button>
        )}

        <button onClick={onDone} className="self-center text-base text-ink-soft underline underline-offset-4">
          {finished ? "Back" : "Skip this"}
        </button>
      </div>
    </section>
  );
}
