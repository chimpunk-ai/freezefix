// The daily log (lib/entry.ts). This is the data model everything else in
// the app is built on — weekStats, the companion's level/streak math, Fix's
// context — so a bug in readEntries()'s validation (which is the only
// thing standing between a corrupted localStorage value and a crash
// somewhere downstream) or in saveEntry()'s trimming/dedup would propagate
// everywhere silently. No automated coverage until now.
//
// Run: npm run test:entry

import {
  addDays,
  clearEntries,
  dayFromISO,
  getEntry,
  isWeekend,
  lastDays,
  MAX_TRIGGERS,
  orderedTriggers,
  readEntries,
  removeEntry,
  saveEntry,
  TRIGGERS,
  todayISO,
  weekdayShort,
  writeEntries,
  type Entries,
} from "../lib/entry";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });

// A minimal localStorage polyfill, same pattern as scripts/test-chime.ts /
// test-onboarding.ts, so saveEntry/readEntries/removeEntry/clearEntries
// exercise their real logic instead of the no-window fallback.
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

// -- no-window: must never throw, must behave as "forgets gracefully" ---------

unmountWindow();
check("no-window-readEntries-empty", Object.keys(readEntries()).length === 0);
check("no-window-lastDays-returns-shape", lastDays(3).length === 3 && lastDays(3).every((d) => d.entry === undefined));
let threwNoWindow = false;
try {
  writeEntries({});
  saveEntry({ smoked: false, mood: 3, triggers: [] });
  clearEntries();
} catch {
  threwNoWindow = true;
}
check("no-window-writes-do-not-throw", !threwNoWindow);

// -- addDays / todayISO / dayFromISO -------------------------------------------

check("addDays-forward", addDays("2026-02-27", 2) === "2026-03-01");
check("addDays-backward", addDays("2026-03-01", -2) === "2026-02-27");
check("addDays-year-rollover", addDays("2026-12-31", 1) === "2027-01-01");
check("addDays-leap-day", addDays("2028-02-28", 1) === "2028-02-29", "2028 is a leap year");
check("addDays-zero-is-identity", addDays("2026-06-15", 0) === "2026-06-15");
check("dayFromISO-roundtrips", todayISO(dayFromISO("2026-07-04")) === "2026-07-04");

// -- weekdayShort / isWeekend ---------------------------------------------------

check("weekdayShort-known-sunday", weekdayShort("2026-11-01") === "sun", "2026-11-01 is a Sunday");
check("weekdayShort-known-monday", weekdayShort("2026-11-02") === "mon");
check("isWeekend-sunday", isWeekend("2026-11-01") === true);
check("isWeekend-saturday", isWeekend("2026-11-07") === true, "2026-11-07 is a Saturday");
check("isWeekend-wednesday", isWeekend("2026-11-04") === false);

// -- orderedTriggers -------------------------------------------------------------

{
  check("orderedTriggers-no-preference-returns-canonical", orderedTriggers(undefined).join(",") === TRIGGERS.join(","));
  check("orderedTriggers-empty-array-returns-canonical", orderedTriggers([]).join(",") === TRIGGERS.join(","));
  const preferred = orderedTriggers(["bored", "alone"]);
  check("orderedTriggers-preferred-come-first", preferred[0] === "bored" && preferred[1] === "alone");
  check("orderedTriggers-every-trigger-present-exactly-once", preferred.length === TRIGGERS.length && new Set(preferred).size === TRIGGERS.length);
  // Garbage/unknown values in the preference list must be dropped, not crash.
  const withJunk = orderedTriggers(["bored", "not-a-real-trigger" as never, "bored"]);
  check("orderedTriggers-drops-unknown-and-dupes", withJunk[0] === "bored" && withJunk.length === TRIGGERS.length);
}

// -- saveEntry / readEntries / getEntry / removeEntry (with window mounted) ---

{
  const store: Store = new Map();
  mountWindow(store);

  saveEntry({ day: "2026-11-01", smoked: true, mood: 3, triggers: ["bored", "alone"] });
  const e = getEntry("2026-11-01");
  check("saveEntry-roundtrips-basic-fields", e?.smoked === true && e?.mood === 3);
  check("saveEntry-sets-at-timestamp", typeof e?.at === "number" && e!.at > 0);

  // Re-saving (editing) an already-logged day must keep its ORIGINAL `at`,
  // not bump it to the edit's own time — lib/growth-reveal.ts's 5-hour
  // delayed reveal anchors to this timestamp, and the once-a-day cap it
  // depends on only holds if an edit can't push the clock later.
  const firstAt = e!.at;
  saveEntry({ day: "2026-11-01", smoked: false, mood: 4, triggers: [] });
  check("saveEntry-edit-keeps-original-at", getEntry("2026-11-01")?.at === firstAt);
  check("saveEntry-edit-still-updates-other-fields", getEntry("2026-11-01")?.smoked === false && getEntry("2026-11-01")?.mood === 4);
  // An explicit `at` (tests, or a future import/restore feature) still wins.
  saveEntry({ day: "2026-11-01", smoked: false, mood: 4, triggers: [], at: 12345 });
  check("saveEntry-explicit-at-overrides", getEntry("2026-11-01")?.at === 12345);

  // Dedup + cap triggers at MAX_TRIGGERS, same order preserved.
  saveEntry({ day: "2026-11-02", smoked: false, mood: 4, triggers: ["bored", "bored", "alone", "stressed", "with-friends"] });
  const capped = getEntry("2026-11-02");
  check("saveEntry-dedups-triggers", capped?.triggers.filter((t) => t === "bored").length === 1, JSON.stringify(capped?.triggers));
  check("saveEntry-caps-at-max-triggers", capped?.triggers.length === MAX_TRIGGERS, JSON.stringify(capped?.triggers));

  // Note trimming/truncation.
  saveEntry({ day: "2026-11-03", smoked: true, mood: 2, triggers: [], note: "  padded with spaces  " });
  check("saveEntry-trims-note", getEntry("2026-11-03")?.note === "padded with spaces");
  saveEntry({ day: "2026-11-04", smoked: true, mood: 2, triggers: [], note: "x".repeat(600) });
  check("saveEntry-caps-note-length", (getEntry("2026-11-04")?.note?.length ?? 0) <= 500, String(getEntry("2026-11-04")?.note?.length));
  saveEntry({ day: "2026-11-05", smoked: true, mood: 2, triggers: [], note: "" });
  check("saveEntry-empty-note-becomes-undefined", getEntry("2026-11-05")?.note === undefined);

  // goalDone: present only when explicitly a boolean; absent when the day
  // has no goal attached at all.
  saveEntry({ day: "2026-11-06", smoked: false, mood: 5, triggers: [], goalDone: true });
  check("saveEntry-goalDone-true-kept", getEntry("2026-11-06")?.goalDone === true);
  saveEntry({ day: "2026-11-07", smoked: false, mood: 5, triggers: [] });
  check("saveEntry-no-goalDone-is-undefined", getEntry("2026-11-07")?.goalDone === undefined);

  // Saving the same day twice overwrites rather than merging/duplicating.
  saveEntry({ day: "2026-11-01", smoked: false, mood: 1, triggers: [] });
  check("saveEntry-same-day-overwrites", getEntry("2026-11-01")?.smoked === false && getEntry("2026-11-01")?.mood === 1);

  // Default day is today when not supplied.
  saveEntry({ smoked: true, mood: 3, triggers: [] });
  check("saveEntry-defaults-to-today", getEntry(todayISO()) !== undefined);

  check("getEntry-missing-day-is-undefined", getEntry("1999-01-01") === undefined);

  removeEntry("2026-11-02");
  check("removeEntry-removes-it", getEntry("2026-11-02") === undefined);
  check("removeEntry-leaves-others", getEntry("2026-11-01") !== undefined);

  clearEntries();
  check("clearEntries-empties-the-log", Object.keys(readEntries()).length === 0);

  unmountWindow();
}

// -- readEntries validation: malformed stored data must be dropped, not crash --

{
  const store: Store = new Map();
  mountWindow(store);

  store.set(
    "ff_entries",
    JSON.stringify({
      "2026-11-01": { smoked: true, mood: 3, triggers: ["bored"], at: 1000 }, // valid
      "not-a-date": { smoked: true, mood: 3, triggers: [], at: 1000 }, // bad key format
      "2026-11-02": { smoked: "yes", mood: 3, triggers: [], at: 1000 }, // smoked not boolean
      "2026-11-03": { smoked: true, mood: 9, triggers: [], at: 1000 }, // mood out of range
      "2026-11-04": { smoked: true, mood: 3, triggers: "not-an-array", at: 1000 }, // triggers wrong type -- kept, triggers default to []
      "2026-11-05": null, // null entry
      "2026-11-06": "a string, not an object", // wrong type entirely
      "2026-11-07": { smoked: true, mood: 3, triggers: ["bored", "not-real", "bored", "alone"], at: 1000 }, // junk + dupe triggers
    }),
  );
  const out = readEntries();
  check("readEntries-keeps-valid-entry", out["2026-11-01"]?.smoked === true);
  check("readEntries-drops-bad-date-key", out["not-a-date"] === undefined);
  check("readEntries-drops-non-boolean-smoked", out["2026-11-02"] === undefined);
  check("readEntries-drops-out-of-range-mood", out["2026-11-03"] === undefined);
  check(
    "readEntries-wrong-type-triggers-defaults-to-empty-not-dropped",
    out["2026-11-04"] !== undefined && out["2026-11-04"].triggers.length === 0,
    "cleanTriggers() gracefully defaults a non-array to [] rather than failing the whole entry -- matches the file's own forgive-and-forget design",
  );
  check("readEntries-drops-null-entry", out["2026-11-05"] === undefined);
  check("readEntries-drops-non-object-entry", out["2026-11-06"] === undefined);
  check("readEntries-cleans-junk-triggers-on-otherwise-valid-entry", out["2026-11-07"]?.triggers.join(",") === "bored,alone", JSON.stringify(out["2026-11-07"]));
  check("readEntries-total-kept-count", Object.keys(out).length === 3, `kept: ${Object.keys(out).join(",")}`);

  store.set("ff_entries", "{not valid json");
  check("readEntries-malformed-json-returns-empty", Object.keys(readEntries()).length === 0);

  store.set("ff_entries", JSON.stringify([1, 2, 3]));
  check("readEntries-non-object-top-level-returns-empty", Object.keys(readEntries()).length === 0);

  unmountWindow();
}

// -- lastDays -------------------------------------------------------------------

{
  const store: Store = new Map();
  mountWindow(store);
  const now = new Date(2026, 10, 10); // 10 Nov 2026
  saveEntry({ day: "2026-11-10", smoked: true, mood: 3, triggers: [] });
  saveEntry({ day: "2026-11-08", smoked: false, mood: 4, triggers: [] });
  const days = lastDays(5, now);
  check("lastDays-returns-n-entries", days.length === 5);
  check("lastDays-oldest-first", days[0].day === "2026-11-06" && days[4].day === "2026-11-10", JSON.stringify(days.map((d) => d.day)));
  check("lastDays-fills-gaps-with-undefined", days.find((d) => d.day === "2026-11-09")?.entry === undefined);
  check("lastDays-surfaces-the-real-entry", days.find((d) => d.day === "2026-11-10")?.entry?.smoked === true);
  unmountWindow();
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Entry log check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
