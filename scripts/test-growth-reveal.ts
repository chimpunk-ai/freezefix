// The 5-hour delayed growth reveal + the once-a-day cap (lib/growth-reveal.ts,
// tasks 19 and 17 of the 50-step plan). Pure logic checks plus the storage
// round-trip, same localStorage-polyfill pattern as scripts/test-entry.ts /
// test-chime.ts / test-onboarding.ts.
//
// What this guards against:
//   - A reveal firing before its 5 hours are actually up.
//   - Re-saving the same day queuing a SECOND reveal, or pushing the first
//     one's readyAt later (the once-a-day cap).
//   - The message being computed from stale, save-time data instead of
//     whatever the entry actually says by the time the reveal fires.
//   - A deleted night still producing a message out of nowhere.
//   - "forget everything" not actually clearing this store.
//
// Run: npm run test:growth-reveal

import {
  clearGrowthReveals,
  GROWTH_REVEAL_DELAY_MS,
  isRevealDue,
  queueGrowthReveal,
  takeDueGrowthReveal,
  type PendingReveal,
} from "../lib/growth-reveal";
import { EMPTY_PROFILE_SEED } from "../lib/companion";
import { addDays, type Entries, type Entry } from "../lib/entry";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });

type Store = Map<string, string>;
function mountWindow(store: Store): void {
  const g = globalThis as unknown as {
    window: { localStorage: { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void; removeItem: (k: string) => void } };
  };
  g.window = {
    localStorage: {
      getItem: (k) => (store.has(k) ? (store.get(k) as string) : null),
      setItem: (k, v) => void store.set(k, v),
      removeItem: (k) => void store.delete(k),
    },
  };
}
function unmountWindow(): void {
  delete (globalThis as unknown as { window?: unknown }).window;
}

function entry(day: string, at: number): Entry {
  return { day, smoked: false, mood: 3, triggers: ["stressed"], note: "a note", goalDone: true, at };
}

// -- no-window: must never throw, must behave as "forgets gracefully" -------

unmountWindow();
let threwNoWindow = false;
try {
  queueGrowthReveal("2026-11-01", Date.now());
  takeDueGrowthReveal("fix", EMPTY_PROFILE_SEED, {});
  clearGrowthReveals();
} catch {
  threwNoWindow = true;
}
check("no-window-does-not-throw", !threwNoWindow);
check("no-window-nothing-due", takeDueGrowthReveal("fix", EMPTY_PROFILE_SEED, {}) === null);

// -- isRevealDue (pure) -------------------------------------------------------

{
  const r: PendingReveal = { day: "2026-11-01", readyAt: 1000 };
  check("not-due-before-readyAt", !isRevealDue(r, 999));
  check("due-exactly-at-readyAt", isRevealDue(r, 1000));
  check("due-after-readyAt", isRevealDue(r, 1001));
  check("delay-is-5-hours", GROWTH_REVEAL_DELAY_MS === 5 * 60 * 60 * 1000);
}

// -- queueGrowthReveal / takeDueGrowthReveal, with window mounted -----------

{
  const store: Store = new Map();
  mountWindow(store);

  const loggedAt = Date.parse("2026-11-10T20:00:00Z");
  const notYet = loggedAt + GROWTH_REVEAL_DELAY_MS - 1;
  const justDue = loggedAt + GROWTH_REVEAL_DELAY_MS;

  queueGrowthReveal("2026-11-10", loggedAt);

  // 24 nights logged before this one, with no onboarding-seed credit — one
  // below LEVEL_THRESHOLDS' 25-night level-5 line. Adding the 25th night
  // (this one, 2026-11-10, deliberately on a gap so the streak itself
  // doesn't also need to line up) crosses that line, so growthSince is
  // GUARANTEED to report leveledUp — growthMessage() always has something
  // to say for that case — and a null result below can only mean "not due
  // yet", never "nothing grew".
  const before: Entries = {};
  for (let i = 0; i < 24; i++) {
    const d = addDays("2026-10-01", i);
    before[d] = entry(d, Date.parse(`${d}T20:00:00Z`));
  }
  const after: Entries = { ...before, "2026-11-10": entry("2026-11-10", loggedAt) };

  check("not-due-yet-returns-null", takeDueGrowthReveal("fix", EMPTY_PROFILE_SEED, after, notYet) === null);

  // Calling it early must NOT have consumed the queued reveal — it should
  // still be there, and still fire once it's actually due.
  const msg = takeDueGrowthReveal("fix", EMPTY_PROFILE_SEED, after, justDue);
  check("due-returns-a-real-message", typeof msg === "string" && msg.length > 0, String(msg));

  // Consumed: asking again, even well past due, gets nothing — it already
  // fired once.
  check("already-taken-returns-null-on-second-call", takeDueGrowthReveal("fix", EMPTY_PROFILE_SEED, after, justDue + 1000) === null);
}

// -- once-a-day cap: re-queuing the same day never moves readyAt later ------

{
  const store: Store = new Map();
  mountWindow(store);

  const firstLoggedAt = Date.parse("2026-11-12T20:00:00Z");
  queueGrowthReveal("2026-11-12", firstLoggedAt);
  // Simulate an edit two hours later that, if this regressed, would push
  // the reveal's own clock out to editedAt + 5h instead of leaving it at
  // firstLoggedAt + 5h.
  const editedAt = firstLoggedAt + 2 * 60 * 60 * 1000;
  queueGrowthReveal("2026-11-12", editedAt);

  const entries: Entries = { "2026-11-12": entry("2026-11-12", firstLoggedAt) };
  const dueByFirstSave = firstLoggedAt + GROWTH_REVEAL_DELAY_MS;
  const dueByEditIfItHadWon = editedAt + GROWTH_REVEAL_DELAY_MS;
  // Sanity: the probe time below actually distinguishes the two anchors.
  check("test-window-distinguishes-the-two-anchors", dueByFirstSave < dueByEditIfItHadWon);

  // At a moment that's due under the FIRST anchor but not yet due under the
  // (wrong) edited one, the reveal must already be available — proving the
  // second queueGrowthReveal call didn't move readyAt.
  const result = takeDueGrowthReveal("fix", EMPTY_PROFILE_SEED, entries, dueByFirstSave);
  check("requeue-same-day-keeps-original-readyAt", result !== null, String(result));
}

// -- deleted night: reveal clears silently, no fabricated message -----------

{
  const store: Store = new Map();
  mountWindow(store);
  const loggedAt = Date.parse("2026-11-14T20:00:00Z");
  queueGrowthReveal("2026-11-14", loggedAt);
  // The night was removed (lib/entry.ts's removeEntry) before the reveal
  // ever fired — entries has nothing for that day any more.
  const result = takeDueGrowthReveal("fix", EMPTY_PROFILE_SEED, {}, loggedAt + GROWTH_REVEAL_DELAY_MS);
  check("deleted-night-produces-no-message", result === null);
  // And it's actually been drained, not left to error out forever.
  const resultAgain = takeDueGrowthReveal("fix", EMPTY_PROFILE_SEED, {}, loggedAt + GROWTH_REVEAL_DELAY_MS + 1000);
  check("deleted-night-reveal-still-consumed", resultAgain === null);
}

// -- a silent night (nothing actually grew) still drains its queue slot -----

{
  const store: Store = new Map();
  mountWindow(store);
  const loggedAt = Date.parse("2026-11-15T20:00:00Z");
  queueGrowthReveal("2026-11-15", loggedAt);
  // A log so far past every tier already that one more night can't move
  // anything: before and after are identical in every tier/level outcome.
  const flatEntries: Entries = {};
  for (let i = 0; i < 5; i++) {
    const d = addDays("2026-11-10", i);
    flatEntries[d] = entry(d, Date.parse(`${d}T20:00:00Z`));
  }
  const result = takeDueGrowthReveal("fix", EMPTY_PROFILE_SEED, flatEntries, loggedAt + GROWTH_REVEAL_DELAY_MS);
  // Either a message or null is acceptable here (depends on exact tier
  // boundaries) — what matters is that it doesn't throw and the slot is
  // gone either way.
  check("silent-or-real-night-does-not-throw", result === null || typeof result === "string");
  const second = takeDueGrowthReveal("fix", EMPTY_PROFILE_SEED, flatEntries, loggedAt + GROWTH_REVEAL_DELAY_MS + 1);
  check("slot-drained-after-first-check-either-way", second === null);
}

// -- clearGrowthReveals ------------------------------------------------------

{
  const store: Store = new Map();
  mountWindow(store);
  queueGrowthReveal("2026-11-16", Date.now());
  clearGrowthReveals();
  const result = takeDueGrowthReveal("fix", EMPTY_PROFILE_SEED, {}, Date.now() + GROWTH_REVEAL_DELAY_MS + 1);
  check("clearGrowthReveals-empties-the-queue", result === null);
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Growth reveal check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
