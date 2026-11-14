"use client";

import { useEffect, useState } from "react";
import { mythItems, type MythItem } from "@/lib/myth-items";

// A one-line reassurance shown once at the top of the log on each new day.
//
// What this is:
//   - A rotating "myth → reality" card from lib/myth-items.ts: the SAME
//     content the landing page's accordion shows. One new item each day the
//     user opens the app; over time they see all of them. Dismissible, and
//     muted via "don't show these".
//
// What this is NOT:
//   - A substance claim. Every item is about the *looking* — judgement,
//     privacy, the habit of noticing — not about cannabis pharmacology,
//     doses, strains or health outcomes. The product vision rules those out,
//     and so does this component. If the content ever drifts into a health
//     claim it needs cited evidence and qualified review first.
//
// Storage:
//   - `ff_reframe` = { lastDay: "YYYY-MM-DD", index: number, muted: boolean }
//     Keyed per device, cleared by forget-everything.

type Stored = { lastDay: string; index: number; muted: boolean };

const KEY = "ff_reframe";
const EMPTY: Stored = { lastDay: "", index: -1, muted: false };

function readStored(): Stored {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as Partial<Stored>;
    return {
      lastDay: typeof p.lastDay === "string" ? p.lastDay : "",
      index: Number.isInteger(p.index) ? Number(p.index) : -1,
      muted: Boolean(p.muted),
    };
  } catch {
    return EMPTY;
  }
}

function writeStored(next: Stored): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage can be blocked */
  }
}

export function clearReframePref(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Decide once, outside of an effect, what to show on this open. The function
// also advances the stored pointer so the next open sees the next item. Runs
// only in the browser (guarded by typeof window), via useState initializer so
// React doesn't re-render us before we've rendered once.
function pickReframe(items: MythItem[]): MythItem | null {
  if (typeof window === "undefined") return null;
  const now = todayISO();
  const prev = readStored();
  if (prev.muted) return null;
  if (prev.lastDay === now) return null; // already seen today
  const next = (prev.index + 1) % items.length;
  writeStored({ lastDay: now, index: next, muted: false });
  return items[next];
}

export default function DailyReframe() {
  const items = mythItems();
  // useState initializer runs once per mount, before the first paint, so
  // there is no effect-driven re-render — and nothing to upset React 19's
  // "no setState in an effect body" lint rule.
  const [shown, setShown] = useState<MythItem | null>(() => pickReframe(items));
  // Hydration safety: the server has no window, so it renders null; mark the
  // component mounted on the client so we can render the card without a
  // hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !shown) return null;

  function dismiss() {
    setShown(null);
  }

  function mute() {
    const prev = readStored();
    writeStored({ ...prev, muted: true });
    setShown(null);
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-5 mt-4 overflow-hidden rounded-card border border-line bg-card/70 lg:mx-0"
    >
      <div className="flex items-start gap-4 p-4 lg:p-5">
        <div className="min-w-0 flex-1">
          <p className="text-12 uppercase tracking-[0.14em] text-ink-faint">a reminder</p>
          <p className="mt-2 font-display text-16 leading-snug text-ink lg:text-18">
            &ldquo;{shown.myth}&rdquo;
          </p>
          <p className="mt-2 text-13 leading-relaxed text-ink-soft lg:text-14">
            <span className="text-ink">reality:</span> {shown.reality}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-12 text-ink-faint">
            <button
              type="button"
              onClick={dismiss}
              className="min-h-11 text-ink-soft underline decoration-line underline-offset-4 hover:text-ink"
            >
              got it
            </button>
            <button
              type="button"
              onClick={mute}
              className="min-h-11 underline decoration-line underline-offset-4 hover:text-ink-soft"
            >
              don&rsquo;t show these
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
