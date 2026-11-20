// The Sunday card's "a person/topic that keeps coming up" callout
// (lib/week-themes.ts, task 39/step 23 of the 50-step plan, 20 Nov 2026).
// Pure arithmetic on note text, no model -- but word-frequency logic has
// plenty of edge cases (stopwords, case, punctuation, date-range bounds,
// distinct-nights-not-raw-count, ties) worth locking down.
//
// Run: npm run test:week-themes

import { recurringTheme } from "../lib/week-themes";
import { addDays, type Entries, type Entry } from "../lib/entry";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });

function entry(day: string, note?: string): Entry {
  return { day, smoked: false, mood: 3, triggers: [], note, at: Date.parse(`${day}T20:00:00Z`) };
}

function week(notes: Record<string, string | undefined>, start = "2026-11-02"): { entries: Entries; start: string; end: string } {
  const entries: Entries = {};
  let end = start;
  for (const [day, note] of Object.entries(notes)) {
    entries[day] = entry(day, note);
    if (day > end) end = day;
  }
  return { entries, start, end };
}

// -- basic detection ----------------------------------------------------------

{
  const { entries, start, end } = week({
    "2026-11-02": "saw sarah again today, it was fine",
    "2026-11-03": "no sarah drama tonight, quiet one",
    "2026-11-04": "just a normal day, nothing much",
    "2026-11-05": "sarah called, long talk about work",
  });
  const t = recurringTheme(entries, start, end);
  check("detects-a-recurring-name", t?.word === "sarah", JSON.stringify(t));
  check("counts-distinct-nights-not-occurrences", t?.nights === 3, JSON.stringify(t));
}

// -- below threshold: two nights isn't "keeps coming up" ----------------------

{
  const { entries, start, end } = week({
    "2026-11-02": "mentioned the exam once",
    "2026-11-03": "exam is still looming",
    "2026-11-04": "nothing notable",
  });
  check("two-nights-does-not-count", recurringTheme(entries, start, end) === null);
}

// -- a single rambly note repeating a word many times is still one night -----

{
  const { entries, start, end } = week({
    "2026-11-02": "work work work, all i did today was work, thinking about work",
    "2026-11-03": "quiet day",
    "2026-11-04": "quiet again",
  });
  check("one-night-repeated-word-does-not-count", recurringTheme(entries, start, end) === null);
}

// -- case and punctuation insensitive -----------------------------------------

{
  const { entries, start, end } = week({
    "2026-11-02": "Work was rough.",
    "2026-11-03": "WORK again, ugh!",
    "2026-11-04": "work, work -- can't escape it",
  });
  const t = recurringTheme(entries, start, end);
  check("case-and-punctuation-insensitive", t?.word === "work" && t.nights === 3, JSON.stringify(t));
}

// -- stopwords never surface, however often they repeat -----------------------

{
  const { entries, start, end } = week({
    "2026-11-02": "today was today, just today",
    "2026-11-03": "today again, really just today",
    "2026-11-04": "today today today",
  });
  check("stopwords-never-surface", recurringTheme(entries, start, end) === null);
}

// -- short words below the minimum length are dropped --------------------------

{
  const { entries, start, end } = week({
    "2026-11-02": "it was ok, met up",
    "2026-11-03": "ok day, met up again",
    "2026-11-04": "ok, met up once more",
  });
  // "ok" (2 letters) is filtered; "met" and "up" -- "up" is a stopword, "met"
  // (3 letters) is NOT a stopword and should surface.
  const t = recurringTheme(entries, start, end);
  check("short-word-filtered-longer-one-survives", t?.word === "met", JSON.stringify(t));
}

// -- mood/trigger-ish words are NOT filtered (real signal, not noise) ---------

{
  const { entries, start, end } = week({
    "2026-11-02": "felt stressed about the move",
    "2026-11-03": "stressed again, same reason",
    "2026-11-04": "still stressed honestly",
  });
  const t = recurringTheme(entries, start, end);
  check("mood-words-are-not-stopwords", t?.word === "stressed", JSON.stringify(t));
}

// -- date-range bounds are respected -------------------------------------------

{
  const entries: Entries = {
    "2026-10-20": entry("2026-10-20", "sarah sarah sarah"), // well before the window
    "2026-11-02": entry("2026-11-02", "sarah came up"),
    "2026-11-03": entry("2026-11-03", "sarah again"),
    "2026-11-10": entry("2026-11-10", "sarah once more"), // after the window
  };
  check("nights-outside-the-window-are-excluded", recurringTheme(entries, "2026-11-02", "2026-11-08") === null);
}

{
  const entries: Entries = {
    "2026-11-02": entry("2026-11-02", "sarah came up"),
    "2026-11-03": entry("2026-11-03", "sarah again"),
    "2026-11-04": entry("2026-11-04", "sarah once more"),
  };
  check("window-bounds-are-inclusive", recurringTheme(entries, "2026-11-02", "2026-11-04")?.word === "sarah");
}

// -- empty / missing notes never throw and never count ------------------------

{
  const entries: Entries = {
    "2026-11-02": entry("2026-11-02"), // no note at all
    "2026-11-03": entry("2026-11-03", ""),
    "2026-11-04": entry("2026-11-04", "   "),
  };
  let threw = false;
  let result: ReturnType<typeof recurringTheme> = null;
  try {
    result = recurringTheme(entries, "2026-11-02", "2026-11-04");
  } catch {
    threw = true;
  }
  check("empty-and-missing-notes-do-not-throw", !threw);
  check("empty-and-missing-notes-produce-no-theme", result === null);
}

{
  check("fully-empty-week-returns-null", recurringTheme({}, "2026-11-02", "2026-11-08") === null);
}

// -- ties break on whichever word was said first, deterministically ----------

{
  const { entries, start, end } = week({
    "2026-11-02": "exam exam prep",
    "2026-11-03": "more exam talk",
    "2026-11-04": "sarah mentioned it",
    "2026-11-05": "sarah again, and exam too",
    "2026-11-06": "sarah one more time",
  });
  // "exam" appears on 11-02, 11-03, 11-05 (3 nights); "sarah" on 11-04,
  // 11-05, 11-06 (3 nights). Tied at 3 -- "exam" was said first (11-02 vs
  // 11-04), so it should win, and the result should be stable.
  const t1 = recurringTheme(entries, start, end);
  const t2 = recurringTheme(entries, start, end);
  check("tie-breaks-on-earliest-first-mention", t1?.word === "exam", JSON.stringify(t1));
  check("result-is-deterministic-across-calls", t1?.word === t2?.word && t1?.nights === t2?.nights);
}

// -- a genuinely full week with no recurring note content is honestly null ----

{
  const { entries, start, end } = week({
    "2026-11-02": "quiet night",
    "2026-11-03": "another quiet one",
    "2026-11-04": "same as usual",
    "2026-11-05": "nothing to report",
    "2026-11-06": "uneventful",
    "2026-11-07": "pretty standard day",
    "2026-11-08": "closing the week out calm",
  });
  check("no-fabricated-theme-when-nothing-recurs", recurringTheme(entries, start, end) === null);
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Week-themes check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
