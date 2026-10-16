"use client";

import { useEffect, useRef, useState } from "react";

// A scripted conversation that plays inside a phone frame on the landing page.
//
// It is NOT the live AI and must never look like it is: the label above it says so, and no
// network call happens here. The bubbles are the same shapes and colours as the real chat,
// so what a visitor sees is what they get. The script is invented, not anyone's real words.

type Line = { who: "fix" | "you"; text: string };

const SCRIPTS: { title: string; lines: Line[] }[] = [
  {
    title: "Can't start",
    lines: [
      { who: "fix", text: "Staring at it is the hard part, weirdly. What's the thing?" },
      { who: "you", text: "essay due tomorrow, been scrolling since 2" },
      { who: "fix", text: "Four hours of scrolling. What's the title meant to be?" },
      { who: "you", text: "haven't even got that far" },
      { who: "fix", text: "Then that's the whole job. Open a doc and type a rubbish one." },
    ],
  },
  {
    title: "Can't reply",
    lines: [
      { who: "fix", text: "The longer it sits the bigger it gets. Who is it?" },
      { who: "you", text: "mate asked if im coming sat, 3 days ago" },
      { who: "fix", text: "Three days is nothing, promise. Want me to write something?" },
      { who: "you", text: "go on" },
      { who: "fix", text: '"sorry mate phone\'s been a black hole. still on for sat?"' },
    ],
  },
  {
    title: "At a party",
    lines: [
      { who: "fix", text: "Loud ones are rough. Can you get somewhere quieter?" },
      { who: "you", text: "kitchen maybe" },
      { who: "fix", text: "Go stand in it for two minutes. Nobody will clock it." },
      { who: "you", text: "ok that actually helped" },
      { who: "fix", text: "Good. Go and enjoy your night." },
    ],
  },
];

const TYPING_MS = 850;
const READ_MS = 1500;

export default function ChatDemo() {
  const [script, setScript] = useState(0);
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const [paused, setPaused] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    // Someone who asked for less motion gets the finished conversation, not an animation.
    if (reduced.current) {
      setShown(SCRIPTS[0].lines.length);
      setPaused(true);
    }
  }, []);

  const lines = SCRIPTS[script].lines;

  useEffect(() => {
    if (paused) return;
    if (shown >= lines.length) {
      // Hold the finished conversation for a beat, then move to the next one.
      const t = setTimeout(() => {
        setScript((s) => (s + 1) % SCRIPTS.length);
        setShown(0);
      }, 2600);
      return () => clearTimeout(t);
    }
    const next = lines[shown];
    if (next.who === "fix") {
      setTyping(true);
      const t = setTimeout(() => {
        setTyping(false);
        setShown((n) => n + 1);
      }, TYPING_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((n) => n + 1), READ_MS);
    return () => clearTimeout(t);
  }, [shown, script, paused, lines]);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: reduced.current ? "auto" : "smooth" });
  }, [shown, typing]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-xs uppercase tracking-widest text-ink-faint">
        Example conversation &middot; not a real person
      </p>

      {/* Phone frame */}
      <div className="mx-auto w-full max-w-[21rem] rounded-[2.5rem] border border-line bg-[rgba(10,4,28,0.55)] p-3 shadow-2xl backdrop-blur">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-sm font-semibold text-ink">freezefix</span>
          <span className="text-[0.65rem] text-ink-faint">{SCRIPTS[script].title}</span>
        </div>
        <div ref={box} className="flex h-[19rem] flex-col gap-2 overflow-hidden px-1 pb-1">
          {lines.slice(0, shown).map((l, i) => (
            <div
              key={`${script}-${i}`}
              className={
                l.who === "fix"
                  ? "max-w-[85%] animate-[fade_240ms_ease-out] self-start rounded-[1.2rem] rounded-bl-md bg-card px-3.5 py-2.5 text-[0.95rem] leading-snug text-ink"
                  : "max-w-[85%] animate-[fade_240ms_ease-out] self-end rounded-[1.2rem] rounded-br-md bg-accent px-3.5 py-2.5 text-[0.95rem] leading-snug text-accent-ink"
              }
            >
              {l.text}
            </div>
          ))}
          {typing && (
            <div className="flex max-w-[85%] self-start gap-1.5 rounded-[1.2rem] rounded-bl-md bg-card px-3.5 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {SCRIPTS.map((s, i) => (
          <button
            key={s.title}
            onClick={() => {
              setScript(i);
              setShown(0);
              setPaused(false);
            }}
            aria-label={`Play the "${s.title}" example`}
            aria-current={i === script}
            className={`rounded-full px-3 py-1.5 text-xs transition ${
              i === script ? "bg-accent text-accent-ink" : "bg-chip text-ink-soft"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>
    </div>
  );
}
