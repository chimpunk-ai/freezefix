"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DEMOS, type DemoReply } from "@/lib/demo";

// An interactive taster: the visitor taps their own replies and the scripted conversation
// branches. It is NOT the live AI and must never look like it. Nothing here touches the
// network, the label above says it's an example, and every line is invented.

type Bubble = { who: "fix" | "you"; text: string };

const TYPING_MS = 700;

export default function ChatDemo() {
  const [pick, setPick] = useState(0);
  const demo = DEMOS[pick];

  const [node, setNode] = useState(demo.start);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [typing, setTyping] = useState(false);
  const [ending, setEnding] = useState<string | null>(null);
  const box = useRef<HTMLDivElement | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Start, and restart whenever they switch scenario.
  useEffect(() => {
    setNode(demo.start);
    setBubbles([]);
    setEnding(null);
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setBubbles([{ who: "fix", text: demo.nodes[demo.start].fix }]);
    }, reduced.current ? 0 : TYPING_MS);
    return () => clearTimeout(t);
  }, [demo]);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: reduced.current ? "auto" : "smooth" });
  }, [bubbles, typing, ending]);

  function choose(r: DemoReply) {
    setBubbles((b) => [...b, { who: "you", text: r.text }]);
    if (r.end) {
      setEnding(r.end);
      return;
    }
    if (!r.to) return;
    setTyping(true);
    setTimeout(
      () => {
        setTyping(false);
        setNode(r.to!);
        setBubbles((b) => [...b, { who: "fix", text: demo.nodes[r.to!].fix }]);
      },
      reduced.current ? 0 : TYPING_MS
    );
  }

  function restart() {
    setNode(demo.start);
    setEnding(null);
    setBubbles([{ who: "fix", text: demo.nodes[demo.start].fix }]);
  }

  const replies = demo.nodes[node]?.replies ?? [];
  const canTap = !typing && !ending && bubbles.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-xs uppercase tracking-widest text-ink-faint">
        Try it &middot; example conversation, not a real person
      </p>

      <div className="mx-auto w-full max-w-[21rem] rounded-[2.5rem] border border-line bg-[rgba(10,4,28,0.55)] p-3 shadow-2xl backdrop-blur">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-sm font-semibold text-ink">freezefix</span>
          <span className="text-[0.65rem] text-ink-faint">{demo.title}</span>
        </div>

        <div ref={box} className="flex h-[17rem] flex-col gap-2 overflow-y-auto px-1 pb-1">
          {bubbles.map((b, i) => (
            <div
              key={i}
              className={
                b.who === "fix"
                  ? "max-w-[85%] animate-[fade_240ms_ease-out] self-start rounded-[1.2rem] rounded-bl-md bg-card px-3.5 py-2.5 text-[0.95rem] leading-snug text-ink"
                  : "max-w-[85%] animate-[fade_240ms_ease-out] self-end rounded-[1.2rem] rounded-br-md bg-accent px-3.5 py-2.5 text-[0.95rem] leading-snug text-accent-ink"
              }
            >
              {b.text}
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

        {/* Their turn */}
        <div className="min-h-[5.5rem] px-1 pt-2">
          {ending ? (
            <div className="flex flex-col gap-2">
              <p className="text-center text-[0.8rem] leading-snug text-ink-soft">{ending}</p>
              <div className="flex gap-2">
                <button onClick={restart} className="flex-1 rounded-full bg-chip px-3 py-2.5 text-sm text-ink">
                  Again
                </button>
                <Link
                  href="/app"
                  className="flex-1 rounded-full bg-accent px-3 py-2.5 text-center text-sm font-bold text-accent-ink"
                >
                  Try the real one
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {replies.map((r) => (
                <button
                  key={r.text}
                  disabled={!canTap}
                  onClick={() => choose(r)}
                  className="rounded-full bg-chip px-3.5 py-2 text-sm text-ink transition active:scale-95 disabled:opacity-40"
                >
                  {r.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {DEMOS.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setPick(i)}
            aria-current={i === pick}
            className={`rounded-full px-3 py-1.5 text-xs transition ${
              i === pick ? "bg-accent text-accent-ink" : "bg-chip text-ink-soft"
            }`}
          >
            <span aria-hidden="true">{d.emoji}</span> {d.title}
          </button>
        ))}
      </div>
    </div>
  );
}
