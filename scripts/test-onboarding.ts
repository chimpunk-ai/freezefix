// Profile schema invariants for the commitment onboarding fields.
//
// What this guards against:
//   - A later refactor dropping interferesWith / smokeTime / preferredTriggers
//     from readProfile's parse, which would silently drop every answer a user
//     gave during onboarding.
//   - Old pre-field profiles (stored before this release) breaking the parser.
//   - Malformed stored values coming back as their raw type instead of being
//     narrowed (e.g. an object posing as interferesWith).
//
// Run: npm run test:onboarding

import {
  readProfile,
  writeProfile,
  INTERFERES,
  SMOKE_TIMES,
  type Profile,
} from "../lib/profile";
import { TRIGGERS, orderedTriggers, type TriggerId } from "../lib/entry";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) =>
  results.push({ id, ok, note });

type Store = Map<string, string>;
function mountWindow(store: Store): void {
  const g = globalThis as unknown as {
    window: {
      localStorage: {
        getItem: (k: string) => string | null;
        setItem: (k: string, v: string) => void;
        removeItem: (k: string) => void;
      };
    };
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

// Constants have content and the right shape.
check("OB-INTERFERES-nonempty", INTERFERES.length >= 5);
check("OB-SMOKE-TIMES-nonempty", SMOKE_TIMES.length >= 3);
// Preferred-trigger picker is drawn from the canonical entry TriggerId set,
// so the daily log can trivially consume what onboarding stored.
check("OB-TRIGGERS-nonempty", TRIGGERS.length >= 6);

// Round-trip the new fields.
{
  const store: Store = new Map();
  mountWindow(store);
  const p: Profile = {
    name: "nico",
    bedtime: 22,
    goal: { text: "go for a run", target: 2, madeAt: "2026-11-10" },
    ageOk: true,
    onboarded: true,
    trialStart: "2026-11-10",
    interferesWith: ["sleep", "the gym"],
    smokeTime: "after work",
    preferredTriggers: ["after-work", "bored", "couldnt-sleep"],
    frequency: "most days",
    triedCuttingDown: "tried, and slipped back",
  };
  writeProfile(p);
  const back = readProfile();
  check("OB-roundtrip-name", back.name === "nico");
  check("OB-roundtrip-bedtime", back.bedtime === 22);
  check(
    "OB-roundtrip-interferes",
    Array.isArray(back.interferesWith) &&
      back.interferesWith.length === 2 &&
      back.interferesWith[0] === "sleep" &&
      back.interferesWith[1] === "the gym",
    JSON.stringify(back.interferesWith),
  );
  check("OB-roundtrip-smokeTime", back.smokeTime === "after work");
  check(
    "OB-roundtrip-triggers",
    Array.isArray(back.preferredTriggers) && back.preferredTriggers.length === 3,
    JSON.stringify(back.preferredTriggers),
  );
  check("OB-roundtrip-frequency", back.frequency === "most days");
  check("OB-roundtrip-triedCuttingDown", back.triedCuttingDown === "tried, and slipped back");
  unmountWindow();
}

// frequency / triedCuttingDown are additive fields — a profile written before
// they existed must still parse, and a malformed stored value must be
// dropped rather than crash the parser (same rule as every other field).
{
  const store: Store = new Map();
  store.set(
    "ff_profile",
    JSON.stringify({
      name: "nico",
      bedtime: 22,
      goal: null,
      ageOk: true,
      onboarded: true,
      trialStart: "2026-11-10",
      frequency: { nested: "bad" }, // wrong: should be a string
      triedCuttingDown: 12345, // wrong: should be a string
    }),
  );
  mountWindow(store);
  const back = readProfile();
  check("OB-malformed-frequency-becomes-undefined", back.frequency === undefined);
  check("OB-malformed-triedCuttingDown-becomes-undefined", back.triedCuttingDown === undefined);
  unmountWindow();
}

// A pre-release profile (no new fields at all) must still parse.
{
  const store: Store = new Map();
  store.set(
    "ff_profile",
    JSON.stringify({
      name: "old-user",
      bedtime: 23,
      goal: null,
      ageOk: true,
      onboarded: true,
      trialStart: "2026-10-01",
    }),
  );
  mountWindow(store);
  const back = readProfile();
  check("OB-legacy-parses", back.name === "old-user" && back.onboarded === true);
  check("OB-legacy-no-interferes", back.interferesWith === undefined);
  check("OB-legacy-no-smokeTime", back.smokeTime === undefined);
  check("OB-legacy-no-triggers", back.preferredTriggers === undefined);
  unmountWindow();
}

// Malformed stored values are either dropped or coerced — never crash.
{
  const store: Store = new Map();
  store.set(
    "ff_profile",
    JSON.stringify({
      name: "nico",
      bedtime: 22,
      goal: null,
      ageOk: true,
      onboarded: true,
      trialStart: "2026-11-10",
      interferesWith: "sleep", // wrong: should be an array
      smokeTime: { nested: "bad" }, // wrong: should be a string
      preferredTriggers: [{ t: "after-work" }, null, "bored", "made-up-trigger"],
    }),
  );
  mountWindow(store);
  const back = readProfile();
  check("OB-malformed-interferes-becomes-undefined", back.interferesWith === undefined);
  check("OB-malformed-smokeTime-becomes-undefined", back.smokeTime === undefined);
  // Only "bored" survives — the object is not a string, null is not a
  // string, and "made-up-trigger" is a string but not a valid TriggerId.
  check(
    "OB-malformed-triggers-filtered-to-valid-ids",
    Array.isArray(back.preferredTriggers) && back.preferredTriggers.length === 1 && back.preferredTriggers[0] === "bored",
    JSON.stringify(back.preferredTriggers),
  );
  unmountWindow();
}

// interferesWith must be filtered against the canonical INTERFERES list, the
// same way preferredTriggers is filtered against TRIGGERS above. A garbage
// string that happens to be a real `string` (unlike the whole-field-wrong
// case above) used to pass straight through unfiltered.
{
  const store: Store = new Map();
  store.set(
    "ff_profile",
    JSON.stringify({
      name: "nico",
      bedtime: 22,
      goal: null,
      ageOk: true,
      onboarded: true,
      trialStart: "2026-11-10",
      interferesWith: ["sleep", "made-up-interference", "the gym", 42, null],
    }),
  );
  mountWindow(store);
  const back = readProfile();
  check(
    "OB-interferes-filtered-to-valid-options",
    Array.isArray(back.interferesWith) &&
      back.interferesWith.length === 2 &&
      back.interferesWith[0] === "sleep" &&
      back.interferesWith[1] === "the gym",
    JSON.stringify(back.interferesWith),
  );
  unmountWindow();
}

// Length caps hold on parse (defense in depth — writer already slices).
{
  const store: Store = new Map();
  store.set(
    "ff_profile",
    JSON.stringify({
      name: "nico",
      bedtime: 22,
      goal: null,
      ageOk: true,
      onboarded: true,
      trialStart: "2026-11-10",
      // Now that interferesWith is filtered against INTERFERES (fixed
      // alongside this test — see OB-interferes-filtered-to-valid-options
      // above), 50 made-up "thing-N" strings can no longer exercise the
      // slice-to-8 cap: none of them are valid options, so they'd all be
      // dropped before the slice ever runs. Repeat the real (7-item)
      // INTERFERES list enough times to clear 8 valid entries instead —
      // the cap is about count, not distinctness, same as the
      // preferredTriggers repeat just below.
      interferesWith: [...INTERFERES, ...INTERFERES],
      // Repeat the full trigger set three times — the parser must accept all
      // valid IDs (after filter), then slice to 5.
      preferredTriggers: [...TRIGGERS, ...TRIGGERS, ...TRIGGERS],
    }),
  );
  mountWindow(store);
  const back = readProfile();
  check("OB-interferes-slice-8", (back.interferesWith?.length ?? 0) === 8, JSON.stringify(back.interferesWith));
  check("OB-triggers-slice-5", (back.preferredTriggers?.length ?? 0) === 5);
  unmountWindow();
}

// A second write-then-read round-trip with an all-valid trigger set.
{
  const store: Store = new Map();
  mountWindow(store);
  const p: Profile = {
    name: "ava",
    bedtime: 23,
    goal: null,
    ageOk: true,
    onboarded: true,
    trialStart: "2026-11-10",
    preferredTriggers: ["after-her", "alone", "nothing-really"],
  };
  writeProfile(p);
  const back = readProfile();
  check(
    "OB-every-trigger-id-roundtrips",
    Array.isArray(back.preferredTriggers) &&
      back.preferredTriggers.length === 3 &&
      back.preferredTriggers.join(",") === "after-her,alone,nothing-really",
    JSON.stringify(back.preferredTriggers),
  );
  unmountWindow();
}

// --- orderedTriggers: the pure function the daily log uses --------------

// No preference → canonical order.
{
  const out = orderedTriggers(undefined);
  check("OT-no-pref-equals-canonical", out.length === TRIGGERS.length && out[0] === TRIGGERS[0]);
}
{
  const out = orderedTriggers([]);
  check("OT-empty-pref-equals-canonical", out.length === TRIGGERS.length && out[0] === TRIGGERS[0]);
}

// Preferred ones first, in picked order, then the rest.
{
  const pref: TriggerId[] = ["after-her", "bored", "alone"];
  const out = orderedTriggers(pref);
  check("OT-pref-at-front", out[0] === "after-her" && out[1] === "bored" && out[2] === "alone");
  check("OT-full-length", out.length === TRIGGERS.length);
  // Every canonical trigger still appears exactly once.
  const set = new Set(out);
  check("OT-no-duplicates", set.size === out.length);
  check(
    "OT-every-canonical-present",
    TRIGGERS.every((t) => set.has(t)),
  );
}

// Duplicate preferences are collapsed.
{
  const pref = ["bored", "bored", "after-her"] as TriggerId[];
  const out = orderedTriggers(pref);
  check("OT-duplicates-collapsed", out[0] === "bored" && out[1] === "after-her");
  check("OT-full-length-after-dedup", out.length === TRIGGERS.length);
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Onboarding profile schema check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
