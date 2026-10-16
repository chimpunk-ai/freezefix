// Checks the scenario cards hold together: unique ids, nothing blank, the evening-only
// card survives the midnight wrap, and cards they actually use float to the top.
// Run: npm run test:scenarios

import { SCENARIOS, scenariosFor, checkInLine } from "../lib/scenarios";
const ids = new Set(SCENARIOS.map(s => s.id));
if (ids.size !== SCENARIOS.length) throw new Error("duplicate scenario id");
for (const s of SCENARIOS) {
  for (const f of ["label","blurb","emoji","context","opener"] as const) if (!s[f]) throw new Error(`${s.id} missing ${f}`);
  if (!s.chips.length) throw new Error(`${s.id} has no chips`);
  // Fix texts like a mate. An opener that runs long teaches the model the wrong length.
  if (s.opener.length > 62) throw new Error(`${s.id} opener too long (${s.opener.length}): ${s.opener}`);
  if (/\bor is it\b|, or /.test(s.opener)) throw new Error(`${s.id} opener is an either/or question`);
}
// pres card is evening-only and must survive the midnight wrap
const at = (h: number) => scenariosFor({ now: new Date(2026, 9, 16, h) }).map(s => s.id);
if (!at(23).includes("pres")) throw new Error("pres missing at 23:00");
if (!at(2).includes("pres")) throw new Error("pres missing at 02:00");
if (at(12).includes("pres")) throw new Error("pres should be hidden at midday");
// used cards float to the top
if (scenariosFor({ recent: ["start"] })[0].id !== "start") throw new Error("recent not prioritised");
for (let d = 0; d < 7; d++) if (!checkInLine(new Date(2026, 9, 11 + d))) throw new Error("no check-in line");
console.log(`Scenarios: ${SCENARIOS.length} cards, all checks passed`);
