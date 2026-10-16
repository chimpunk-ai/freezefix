"use client";

import { useEffect, useState } from "react";
import { nextFact, type Fact } from "@/lib/facts";

// "Is this normal?" cards. They rotate on their own, and tapping brings the next one.
//
// Placed where someone is already waiting rather than thrown over the conversation: nothing
// pops up mid-chat. The source is always shown, because "some app told me" is worth less
// than knowing where it came from.

export default function FactCard({ everyMs = 12000 }: { everyMs?: number }) {
  const [fact, setFact] = useState<Fact | null>(null);
  const [open, setOpen] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setFact(nextFact());
  }, []);

  useEffect(() => {
    // Someone reading the detail doesn't get it swapped out from under them.
    if (open) return;
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setFact((f) => nextFact(f?.id));
        setFading(false);
      }, 220);
    }, everyMs);
    return () => clearInterval(t);
  }, [everyMs, open]);

  if (!fact) return null;

  return (
    <button
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      className={`w-full rounded-[1.75rem] border border-line bg-card p-5 text-left transition-opacity duration-200 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <span className="text-xs uppercase tracking-widest text-ink-faint">Is this normal?</span>
      <span className="mt-2 block text-xl font-semibold leading-snug text-ink">{fact.line}</span>
      {open ? (
        <>
          <span className="mt-2 block text-base leading-relaxed text-ink-soft">{fact.body}</span>
          <span className="mt-3 block text-xs leading-relaxed text-ink-faint">{fact.source}</span>
        </>
      ) : (
        <span className="mt-1 block text-sm text-ink-faint">Tap to read why</span>
      )}
    </button>
  );
}
