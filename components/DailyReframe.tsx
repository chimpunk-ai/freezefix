"use client";

import { useEffect, useState } from "react";
import { mythItems, type MythItem } from "@/lib/myth-items";

// A single myth-vs-reality card shown once a day when the user opens the log.
//
// Why a card:
//   - A rotating line at the top of the log. Dry, not cheerful, no emoji.
//   - One a day. Same-day open shows nothing. Next day shows the next one.
//   - Dismissible per day with "got it", muted for good with "don't show these".
//   - The card never mentions weed on its chrome: lock-screen-safe, same as
//     the reminders.
//
// Where the item comes from:
//   - The card shows something the instant the log loads: a local pool pick
//     (lib/myth-items.ts), picked synchronously, no loading skeleton, no
//     network wait. "Display the reminder immediately... without
//     unnecessary delays" — a round trip to the model is not immediate.
//   - In the background, a short-lived request to /api/reframe asks for a
//     fresher, AI-written card. If it answers inside AI_RACE_TIMEOUT_MS and
//     the person hasn't already dismissed the card, the local pick is
//     quietly swapped for it. If it's slow, offline, or the model drifts,
//     the local pick just stays — it was never wrong, only a fallback.
//   - The item is cached in localStorage so the same day opens see the same
//     card, and so an offline second-open still has something to show.
//
// Why not just the local pool alone: 14 items repeat inside two weeks of
// daily opens. The model can produce fresh angles on the same bounded
// subject indefinitely, and the recent-list avoids near-duplicates — but
// it's a nice-to-have layered on top of an instant, honest fallback, never
// something the person has to wait on.
//
// Storage keys (both pinned by scripts/test-legal.ts):
//   - ff_reframe       — today's card + the mute flag
//   - ff_reframe_seen  — a small window of recent openings for the "avoid" hint

type Stored = { lastDay: string; shown: MythItem | null; muted: boolean };
type Seen = { items: string[] };

const KEY = "ff_reframe";
const SEEN_KEY = "ff_reframe_seen";
const EMPTY: Stored = { lastDay: "", shown: null, muted: false };
const EMPTY_SEEN: Seen = { items: [] };
const SEEN_WINDOW = 20;

function readStored(): Stored {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as Partial<Stored>;
    return {
      lastDay: typeof p.lastDay === "string" ? p.lastDay : "",
      shown:
        p.shown && typeof p.shown === "object" && typeof (p.shown as MythItem).myth === "string"
          ? { myth: (p.shown as MythItem).myth, reality: (p.shown as MythItem).reality }
          : null,
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

function readSeen(): Seen {
  if (typeof window === "undefined") return EMPTY_SEEN;
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    if (!raw) return EMPTY_SEEN;
    const p = JSON.parse(raw) as Partial<Seen>;
    return { items: Array.isArray(p.items) ? p.items.filter((s): s is string => typeof s === "string").slice(-SEEN_WINDOW) : [] };
  } catch {
    return EMPTY_SEEN;
  }
}

function writeSeen(next: Seen): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify({ items: next.items.slice(-SEEN_WINDOW) }));
  } catch {
    /* ignore */
  }
}

export function clearReframePref(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(SEEN_KEY);
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

function nextFromPool(seen: string[]): MythItem {
  const pool = mythItems();
  const unseen = pool.filter((p) => !seen.includes(p.myth));
  const pick = unseen.length ? unseen[Math.floor(Math.random() * unseen.length)] : pool[Math.floor(Math.random() * pool.length)];
  return pick;
}

// How long the background AI request gets to beat the instant local pick.
// Short on purpose: this is a "swap it in if it's quick" race, never a
// "wait for it" block — the card is already on screen either way.
const AI_RACE_TIMEOUT_MS = 2500;

async function fetchFreshReframe(seen: string[]): Promise<MythItem | null> {
  try {
    const res = await fetch("/api/reframe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ avoid: seen, seed: todayISO() }),
      signal: AbortSignal.timeout(AI_RACE_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<MythItem>;
    if (typeof data.myth === "string" && typeof data.reality === "string" && data.myth && data.reality) {
      return { myth: data.myth, reality: data.reality };
    }
    return null;
  } catch {
    return null; // slow, offline, or the model drifted — the local pick stands.
  }
}

type Status = "shown" | "hidden";

export default function DailyReframe() {
  const [status, setStatus] = useState<Status>("hidden");
  const [item, setItem] = useState<MythItem | null>(null);

  useEffect(() => {
    const prev = readStored();
    if (prev.muted) return;
    const today = todayISO();
    if (prev.lastDay === today && prev.shown) {
      // Already seen today — not re-shown. Settling without a card is the
      // right behaviour; opening the app a second time in one day shouldn't
      // feel like a drip feed.
      return;
    }

    // New day (or first ever open): show something the instant the log
    // loads, no network wait, no loading state — a local pool pick the
    // person hasn't seen recently.
    const seen = readSeen().items;
    const picked = nextFromPool(seen);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItem(picked);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("shown");
    writeStored({ lastDay: today, shown: picked, muted: false });
    writeSeen({ items: [...seen, picked.myth].slice(-SEEN_WINDOW) });

    // Then try a fresher, AI-written card in the background. If it beats
    // the race timeout and differs from the local pick, swap it in quietly
    // — same card slot, no re-render flash, nothing to wait on.
    let cancelled = false;
    fetchFreshReframe(seen).then((fresh) => {
      if (cancelled || !fresh || fresh.myth === picked.myth) return;
      setItem(fresh);
      writeStored({ lastDay: today, shown: fresh, muted: false });
      writeSeen({ items: [...seen, fresh.myth].slice(-SEEN_WINDOW) });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "hidden" || !item) return null;

  function dismiss() {
    setStatus("hidden");
  }

  function mute() {
    const prev = readStored();
    writeStored({ ...prev, muted: true });
    setStatus("hidden");
  }

  return (
    <aside
      role="note"
      aria-label="a quiet reminder"
      className="ff-reframe mx-5 mt-4 overflow-hidden rounded-sheet border border-line bg-card/60 lg:mx-0"
    >
      <div className="relative p-5 lg:px-7 lg:py-6">
        {/* The hairline on the left is the only ornament. It pairs with the
            Sunday mirror and the fix sheet; three places, same signature. */}
        <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[2px] rounded-full bg-accent/60" />
        <div className="min-h-[88px] pl-4 lg:pl-5">
          <p className="text-11 uppercase tracking-[0.18em] text-ink-faint">a quiet reminder</p>
          <p className="mt-2.5 font-display text-18 italic leading-snug text-ink lg:text-22">
            &ldquo;{item.myth}&rdquo;
          </p>
          <p className="mt-2.5 text-14 leading-relaxed text-ink-soft lg:text-15">
            <span className="not-italic text-ink">reality.</span> {item.reality}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-12 text-ink-faint">
            <button
              type="button"
              onClick={dismiss}
              className="min-h-9 text-ink-soft underline decoration-line underline-offset-4 hover:text-ink"
            >
              got it
            </button>
            <button
              type="button"
              onClick={mute}
              className="min-h-9 underline decoration-line underline-offset-4 hover:text-ink-soft"
            >
              don&rsquo;t show these
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
