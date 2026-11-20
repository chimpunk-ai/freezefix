// The 5-hour delayed growth reveal, plus the once-a-day cap that makes it
// mean something (tasks 19 and 17 of the 50-step plan, 20 Nov 2026).
//
// What this delays, and what it doesn't:
//   - Saving a night's log, the level/stats/streak numbers themselves, and
//     everything the Sunday mirror and the shelf show are all exactly as
//     immediate as they were before this file existed. Nothing here makes
//     any number anywhere lag or look temporarily wrong — lib/companion.ts
//     keeps computing live off the real log, same as always.
//   - What's delayed is only the little celebratory line ("fix just grew
//     — a new level.") that used to appear the instant you tapped save in
//     the log screen. It still gets shown, but 5 hours after the night was
//     first logged, not at the moment of logging — so saving a log is
//     never the trigger for an instant reward, the way a slot machine's
//     lever is. Same "no manipulative engagement loop" rule the project
//     instructions already hold everything else in this app to.
//   - The Sunday card's own growth line (PatternCard's `growthLine`,
//     diffed across the whole week) is untouched — that one only ever
//     appears once a week, at the sunday ritual, which was never an
//     instant-reward moment to begin with.
//   - "Once a day": the 5-hour clock starts at the FIRST save of a given
//     night, not reset by a later edit. lib/entry.ts's saveEntry was
//     changed alongside this file so re-saving an already-logged day
//     keeps that entry's original `at` — otherwise someone could keep the
//     reveal perpetually just out of reach by nudging the same entry
//     every few hours.
//
// One pending reveal per day, keyed the same way entries are. The message
// itself is never stored — only which day and when it's due — so if the
// day's entry changes before the reveal fires (an edit inside the
// 30-minute window, task 21), the reveal is computed fresh from whatever
// the entry actually says by then, never a stale guess from the moment it
// was first saved.

import { entriesBefore, growthMessage, growthSince, type ProfileSeed } from "./companion";
import type { Entries } from "./entry";

export const GROWTH_REVEAL_DELAY_MS = 5 * 60 * 60 * 1000; // 5 hours

export type PendingReveal = { day: string; readyAt: number };

type Store = Record<string, PendingReveal>; // keyed by day, same shape as Entries

const KEY = "ff_pending_growth";

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // storage can be blocked; the reveal just never queues, same "the app
    // still works, just forgets" rule lib/entry.ts already follows.
  }
}

/** True once GROWTH_REVEAL_DELAY_MS has actually elapsed since the day was
 *  first logged. Pure, no storage — easy to test, and reused below. */
export function isRevealDue(reveal: PendingReveal, now: number = Date.now()): boolean {
  return now >= reveal.readyAt;
}

/** Call right after saving a night's log. Queues that day's reveal for
 *  5 hours after `loggedAt` (pass the saved entry's own `.at`, never
 *  `Date.now()` directly, so an edit can't push this later — see the note
 *  on lib/entry.ts's saveEntry). A day that's already queued, or whose
 *  reveal has already been taken, is left alone: this is the once-a-day
 *  cap. Silently does nothing if `entries[day]` wasn't actually passed a
 *  real day string — callers always have one from a just-saved entry. */
export function queueGrowthReveal(day: string, loggedAt: number): void {
  const store = readStore();
  if (store[day]) return;
  store[day] = { day, readyAt: loggedAt + GROWTH_REVEAL_DELAY_MS };
  writeStore(store);
}

/**
 * The one thing any screen needs to ask: is there a grown-and-ready reveal
 * waiting, and if so, what should it say? Computes the message fresh from
 * the current entries (via entriesBefore + growthSince — the same
 * whole-day diff technique the Sunday card's own growth line already
 * uses) rather than trusting anything written at save time, which a later
 * edit could have made stale. Consumes every due reveal it finds (removes
 * it from the queue) so each is shown once, ever — call this only when
 * you're actually about to show the result, not just to peek.
 *
 * If more than one reveal happens to be due at once (the app wasn't
 * opened for a couple of days), every one of them is consumed, but only
 * the first that actually has something to say is returned — a silent
 * night still clears its own queue entry, it just never had a message.
 */
export function takeDueGrowthReveal(name: string, seed: ProfileSeed, entries: Entries, now: number = Date.now()): string | null {
  const store = readStore();
  const dueDays = Object.keys(store)
    .filter((day) => isRevealDue(store[day], now))
    .sort();
  if (dueDays.length === 0) return null;

  let message: string | null = null;
  for (const day of dueDays) {
    delete store[day];
    if (message !== null) continue; // already found one to show; still drain the rest of the queue
    const entry = entries[day];
    if (!entry) continue; // the night was deleted before its reveal ever fired — nothing to say
    const before = entriesBefore(entries, day);
    const after: Entries = { ...before, [day]: entry };
    message = growthMessage(name, growthSince(seed, before, after));
  }
  writeStore(store);
  return message;
}

/** Part of Settings -> "forget everything". */
export function clearGrowthReveals(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
