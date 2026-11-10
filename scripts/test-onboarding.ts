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
  TRIGGER_CHOICES,
  type Profile,
} from "../lib/profile";

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
check("OB-TRIGGER-CHOICES-nonempty", TRIGGER_CHOICES.length >= 6);

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
    preferredTriggers: ["after work", "bored", "couldn't sleep"],
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
      preferredTriggers: [{ t: "after work" }, null, "bored"], // mixed
    }),
  );
  mountWindow(store);
  const back = readProfile();
  check("OB-malformed-interferes-becomes-undefined", back.interferesWith === undefined);
  check("OB-malformed-smokeTime-becomes-undefined", back.smokeTime === undefined);
  check(
    "OB-malformed-triggers-filtered-to-strings",
    Array.isArray(back.preferredTriggers) && back.preferredTriggers.length === 1 && back.preferredTriggers[0] === "bored",
    JSON.stringify(back.preferredTriggers),
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
      interferesWith: Array.from({ length: 50 }).map((_, i) => `thing-${i}`),
      preferredTriggers: Array.from({ length: 50 }).map((_, i) => `trig-${i}`),
    }),
  );
  mountWindow(store);
  const back = readProfile();
  check("OB-interferes-slice-8", (back.interferesWith?.length ?? 0) === 8);
  check("OB-triggers-slice-5", (back.preferredTriggers?.length ?? 0) === 5);
  unmountWindow();
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Onboarding profile schema check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
