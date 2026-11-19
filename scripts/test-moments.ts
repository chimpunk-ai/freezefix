// Moments (lib/moments.ts): short free-form notes, separate from the nightly
// log. Has real edge-case logic -- a 20-per-day cap, a 90-day rolling prune,
// local-day bucketing off the device clock -- with zero automated coverage
// until now.
//
// Run: npm run test:moments

import {
  addMoment,
  clearMoments,
  deleteMoment,
  momentsForDay,
  MOMENT_MAX,
  MOMENTS_PER_DAY_CAP,
  readMoments,
  recentMoments,
  todayMomentsRemaining,
  type Moment,
} from "../lib/moments";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });

// -- localStorage polyfill, same pattern as test-chime.ts / test-entry.ts -----

type Store = Map<string, string>;
function mountWindow(store: Store): void {
  const g = globalThis as unknown as { window: { localStorage: { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void; removeItem: (k: string) => void } } };
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

// -- Date.now() control, so day-bucketing/pruning are deterministic -----------

const RealDateNow = Date.now.bind(Date);
let fakeNow: number | null = null;
Date.now = () => (fakeNow === null ? RealDateNow() : fakeNow);
function setNow(iso: string): void {
  fakeNow = new Date(iso).getTime();
}
function restoreNow(): void {
  fakeNow = null;
}

// -- no-window: must never throw ------------------------------------------------

unmountWindow();
check("no-window-readMoments-empty", readMoments().length === 0);
let threwNoWindow = false;
try {
  addMoment("hello");
  clearMoments();
  deleteMoment(123);
} catch {
  threwNoWindow = true;
}
check("no-window-does-not-throw", !threwNoWindow);

// -- addMoment: trimming, length cap, tag default ------------------------------

{
  const store: Store = new Map();
  mountWindow(store);
  setNow("2026-11-10T12:00:00Z");

  const m1 = addMoment("  a quiet evening  ");
  check("addMoment-trims-whitespace", m1?.text === "a quiet evening");
  check("addMoment-defaults-tag-to-note", m1?.tag === "note");
  check("addMoment-sets-day-from-now", m1?.day === "2026-11-10");

  const m2 = addMoment("flagging this one", "flag");
  check("addMoment-keeps-explicit-tag", m2?.tag === "flag");

  const long = addMoment("x".repeat(500));
  check("addMoment-caps-at-MOMENT_MAX", long?.text.length === MOMENT_MAX, String(long?.text.length));

  check("addMoment-empty-text-returns-null", addMoment("") === null);
  check("addMoment-whitespace-only-returns-null", addMoment("   ") === null);
  check("addMoment-rejected-moment-not-stored", readMoments().length === 3, String(readMoments().length));

  clearMoments();
  check("clearMoments-empties-the-log", readMoments().length === 0);
  restoreNow();
}

// -- per-day cap ----------------------------------------------------------------

{
  const store: Store = new Map();
  mountWindow(store);
  setNow("2026-11-10T08:00:00Z");

  for (let i = 0; i < MOMENTS_PER_DAY_CAP; i++) {
    const m = addMoment(`moment ${i}`);
    if (!m) check(`addMoment-cap-fill-${i}-succeeded`, false, `moment ${i} should have been accepted (cap is ${MOMENTS_PER_DAY_CAP})`);
  }
  check("addMoment-cap-fill-reaches-cap", readMoments().length === MOMENTS_PER_DAY_CAP);
  check("todayMomentsRemaining-is-zero-at-cap", todayMomentsRemaining() === 0);

  const overCap = addMoment("one too many");
  check("addMoment-refuses-past-cap", overCap === null);
  check("addMoment-refusal-does-not-grow-store", readMoments().length === MOMENTS_PER_DAY_CAP);

  // A new local day resets the per-day count even though yesterday's
  // moments are still in storage.
  setNow("2026-11-11T08:00:00Z");
  const nextDay = addMoment("a new day");
  check("addMoment-new-day-resets-cap", nextDay !== null);
  check("todayMomentsRemaining-after-new-day", todayMomentsRemaining() === MOMENTS_PER_DAY_CAP - 1, String(todayMomentsRemaining()));
  check("yesterdays-moments-still-present", momentsForDay("2026-11-10").length === MOMENTS_PER_DAY_CAP);

  clearMoments();
  restoreNow();
}

// -- 90-day rolling prune --------------------------------------------------------

{
  const store: Store = new Map();
  mountWindow(store);

  // Seed a moment 120 days before "now" directly into storage (older than
  // the 90-day keep window), plus one 10 days before "now" (inside it).
  const now = new Date("2026-11-10T12:00:00Z").getTime();
  const old: Moment = { id: "old", at: now - 120 * 24 * 60 * 60 * 1000, day: "2026-07-13", text: "old one", tag: "note" };
  const recent: Moment = { id: "recent", at: now - 10 * 24 * 60 * 60 * 1000, day: "2026-10-31", text: "recent one", tag: "note" };
  store.set("ff_moments", JSON.stringify([old, recent]));

  check("seed-both-present-before-any-write", readMoments().length === 2);

  setNow("2026-11-10T12:00:00Z");
  addMoment("triggers a prune");
  const after = readMoments();
  check("prune-drops-the-120-day-old-moment", after.find((m) => m.text === "old one") === undefined);
  check("prune-keeps-the-10-day-old-moment", after.find((m) => m.text === "recent one") !== undefined);
  check("prune-keeps-the-new-moment", after.find((m) => m.text === "triggers a prune") !== undefined);
  check("prune-total-count", after.length === 2, String(after.length));

  clearMoments();
  restoreNow();
}

// -- deleteMoment -----------------------------------------------------------------

{
  const store: Store = new Map();
  mountWindow(store);
  setNow("2026-11-10T12:00:00Z");

  const m = addMoment("delete me");
  addMoment("keep me");
  check("deleteMoment-removes-the-right-one", deleteMoment(m!.id) === true);
  check("deleteMoment-leaves-the-other", readMoments().some((x) => x.text === "keep me"));
  check("deleteMoment-gone-one-is-gone", !readMoments().some((x) => x.text === "delete me"));
  check("deleteMoment-unknown-id-returns-false", deleteMoment("not-a-real-id") === false);

  clearMoments();
  restoreNow();
}

// -- same-millisecond collision: deleting one must not delete both ----------------
// Regression test for a real bug found while writing this suite: `at` used
// to double as both React key and delete identity in the UI. Two moments
// saved with Date.now() frozen (same millisecond -- exactly what happens on
// a fast double-tap, which TodayMoments.tsx's own comments call out as a
// real scenario) had the same `at`, so deleteMoment(at) removed both. `id`
// fixes this; this test locks the fix in.

{
  const store: Store = new Map();
  mountWindow(store);
  setNow("2026-11-10T12:00:00Z"); // frozen -- both adds below get the same `at`

  const first = addMoment("first tap");
  const second = addMoment("second tap, same millisecond");
  check("collision-both-share-the-same-at", first!.at === second!.at, `${first!.at} vs ${second!.at}`);
  check("collision-ids-are-still-distinct", first!.id !== second!.id, `${first!.id} vs ${second!.id}`);

  check("collision-delete-first-only", deleteMoment(first!.id) === true);
  const remaining = readMoments();
  check("collision-second-survives-the-delete", remaining.some((x) => x.text === "second tap, same millisecond"));
  check("collision-first-is-gone", !remaining.some((x) => x.text === "first tap"));
  check("collision-exactly-one-left", remaining.length === 1, String(remaining.length));

  clearMoments();
  restoreNow();
}

// -- legacy data without `id` (stored before this field existed) ------------------

{
  const store: Store = new Map();
  mountWindow(store);

  // Two stored moments sharing an `at`, written directly (as pre-id data
  // would look), with no `id` field at all.
  store.set(
    "ff_moments",
    JSON.stringify([
      { at: 5000, day: "2026-11-05", text: "legacy one", tag: "note" },
      { at: 5000, day: "2026-11-05", text: "legacy two", tag: "note" },
    ]),
  );
  const legacy = readMoments();
  check("legacy-both-entries-load", legacy.length === 2);
  check("legacy-synthesized-ids-are-distinct", legacy[0].id !== legacy[1].id, `${legacy[0].id} vs ${legacy[1].id}`);
  check("legacy-synthesized-id-is-non-empty-string", legacy.every((m) => typeof m.id === "string" && m.id.length > 0));

  check("legacy-delete-by-synthesized-id-removes-only-one", deleteMoment(legacy[0].id) === true);
  const afterDelete = readMoments();
  check("legacy-other-legacy-entry-survives", afterDelete.length === 1 && afterDelete[0].text === "legacy two", JSON.stringify(afterDelete));

  unmountWindow();
}

// -- momentsForDay / recentMoments / todayMomentsRemaining with an explicit list --

{
  const all: Moment[] = [
    { id: "a", at: 1000, day: "2026-11-01", text: "a", tag: "note" },
    { id: "b", at: 2000, day: "2026-11-01", text: "b", tag: "good" },
    { id: "c", at: 3000, day: "2026-11-02", text: "c", tag: "hard" },
  ];
  check("momentsForDay-filters-correctly", momentsForDay("2026-11-01", all).length === 2);
  check("momentsForDay-no-match-returns-empty", momentsForDay("2000-01-01", all).length === 0);

  const now = Date.now();
  const recentList: Moment[] = [
    { id: "r1", at: now - 1 * 24 * 60 * 60 * 1000, day: "x", text: "a day ago", tag: "note" },
    { id: "r2", at: now - 10 * 24 * 60 * 60 * 1000, day: "x", text: "10 days ago", tag: "note" },
  ];
  check("recentMoments-7-days-excludes-older", recentMoments(7, recentList).length === 1);
  check("recentMoments-14-days-includes-both", recentMoments(14, recentList).length === 2);
}

// -- readMoments validation: malformed entries dropped, not crashed ---------------

{
  const store: Store = new Map();
  mountWindow(store);

  store.set(
    "ff_moments",
    JSON.stringify([
      { at: 1000, day: "2026-11-01", text: "valid", tag: "note" },
      { at: "not-a-number", day: "2026-11-01", text: "bad at", tag: "note" },
      { at: 1000, day: "2026-11-01", text: "bad tag", tag: "urgent" },
      { at: 1000, day: 5, text: "bad day type", tag: "note" },
      null,
      "just a string",
      { at: 2000, day: "2026-11-02", text: "later", tag: "flag" },
    ]),
  );
  const out = readMoments();
  check("readMoments-keeps-valid-entries", out.some((m) => m.text === "valid") && out.some((m) => m.text === "later"));
  check("readMoments-drops-bad-at-type", !out.some((m) => m.text === "bad at"));
  check("readMoments-drops-bad-tag", !out.some((m) => m.text === "bad tag"));
  check("readMoments-drops-bad-day-type", !out.some((m) => m.text === "bad day type"));
  check("readMoments-drops-null-and-string-entries", out.length === 2, String(out.length));
  check("readMoments-sorts-ascending-by-at", out[0].at <= out[1].at);

  store.set("ff_moments", "not json at all {{{");
  check("readMoments-malformed-json-returns-empty", readMoments().length === 0);

  store.set("ff_moments", JSON.stringify({ not: "an array" }));
  check("readMoments-non-array-top-level-returns-empty", readMoments().length === 0);

  unmountWindow();
}

Date.now = RealDateNow;

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Moments check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
