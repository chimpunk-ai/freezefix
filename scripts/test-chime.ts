// Shape + invariant checks for the sunday-card chime.
//
// What this covers:
//   - The pref reader returns "unset" for every malformed value.
//   - A yes/no answer survives a round-trip.
//   - shouldAskOptIn only fires when the pref is "unset" AND it's been
//     7+ days since we last asked (or we never asked).
//   - shouldPlayChime refuses to play when the pref isn't "yes".
//   - The notes the generator declares are the three documented ones.
//   - Nothing here touches the Web Audio API — the real play path needs
//     a browser, so it's covered by manual test, not this script.

import {
  readChimePref,
  writeChimePref,
  readLastAsked,
  stampAsked,
  shouldAskOptIn,
  shouldPlayChime,
  prefersReducedMotion,
} from "../lib/chime-pref";
import { _CHIME_NOTES } from "../lib/chime";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) =>
  results.push({ id, ok, note });

// A minimal localStorage polyfill scoped to this test run. Node 22 has no
// `window` so each helper must early-return "unset"/false in that case —
// we test the polyfill-backed path and the no-window path separately.

type Store = Map<string, string>;
function mountWindow(store: Store): void {
  const g = globalThis as unknown as {
    window: {
      localStorage: {
        getItem: (k: string) => string | null;
        setItem: (k: string, v: string) => void;
      };
      matchMedia?: (q: string) => { matches: boolean };
    };
  };
  g.window = {
    localStorage: {
      getItem: (k) => (store.has(k) ? (store.get(k) as string) : null),
      setItem: (k, v) => void store.set(k, v),
    },
  };
}
function unmountWindow(): void {
  delete (globalThis as unknown as { window?: unknown }).window;
}

// 1. With no window, reads are "unset" and writes are silent.
unmountWindow();
check("chime-no-window-read-unset", readChimePref() === "unset");
check("chime-no-window-read-lastAsked-zero", readLastAsked() === 0);
// writeChimePref should not throw without a window
let threw = false;
try {
  writeChimePref("yes");
} catch {
  threw = true;
}
check("chime-no-window-write-silent", !threw);

// 2. Round-trip: yes
{
  const store: Store = new Map();
  mountWindow(store);
  writeChimePref("yes");
  check("chime-yes-roundtrip", readChimePref() === "yes");
  check("chime-yes-should-play", shouldPlayChime(readChimePref()));
  unmountWindow();
}

// 3. Round-trip: no
{
  const store: Store = new Map();
  mountWindow(store);
  writeChimePref("no");
  check("chime-no-roundtrip", readChimePref() === "no");
  check("chime-no-should-not-play", !shouldPlayChime(readChimePref()));
  unmountWindow();
}

// 4. Malformed values collapse to "unset"
{
  const store: Store = new Map();
  store.set("ff_chime", "sure");
  mountWindow(store);
  check("chime-malformed-is-unset", readChimePref() === "unset");
  unmountWindow();
}

// 5. shouldAskOptIn logic
check("chime-ask-unset-neverasked", shouldAskOptIn("unset", 0) === true);
check(
  "chime-ask-unset-askedRecently",
  shouldAskOptIn("unset", Date.now() - 24 * 60 * 60 * 1000) === false,
);
check(
  "chime-ask-unset-asked8daysAgo",
  shouldAskOptIn("unset", Date.now() - 8 * 24 * 60 * 60 * 1000) === true,
);
check("chime-ask-yes-never", shouldAskOptIn("yes", 0) === false);
check("chime-ask-no-never", shouldAskOptIn("no", 0) === false);

// 6. stampAsked round-trips
{
  const store: Store = new Map();
  mountWindow(store);
  const t = 1_700_000_000_000;
  stampAsked(t);
  check("chime-stamp-roundtrip", readLastAsked() === t);
  unmountWindow();
}

// 7. prefersReducedMotion is false when no matchMedia exists
check("chime-prm-no-matchmedia", prefersReducedMotion() === false);

// 8. The chime uses the three documented notes
check(
  "chime-notes-count",
  _CHIME_NOTES.length === 3,
  `got ${_CHIME_NOTES.length} notes`,
);
check(
  "chime-notes-descending",
  _CHIME_NOTES[0] > _CHIME_NOTES[1] && _CHIME_NOTES[1] > _CHIME_NOTES[2],
  `notes: ${_CHIME_NOTES.join(", ")}`,
);
check(
  "chime-notes-range",
  _CHIME_NOTES.every((n) => n >= 200 && n <= 900),
  `notes: ${_CHIME_NOTES.join(", ")}`,
);

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Chime check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
