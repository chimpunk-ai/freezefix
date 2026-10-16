// The facts must never do the one thing this product promises not to: tell anyone off.
// Run: npm run test:facts
import { FACTS, nextFact } from "../lib/facts";

const ids = new Set(FACTS.map((f) => f.id));
if (ids.size !== FACTS.length) throw new Error("duplicate fact id");

// Words that moralise, warn, promise a cure, or belong on a leaflet about quitting.
const BANNED = /\b(quit|stop using|give up|addict|addiction|abuse|danger|dangerous|harmful|damage|risk of|should not|shouldn't|warning|cure|cures|treat|treats|disorder|illness)\b/i;

for (const f of FACTS) {
  for (const k of ["line", "body", "source"] as const) {
    if (!f[k]?.trim()) throw new Error(`${f.id}: ${k} is empty`);
  }
  if (f.line.length > 46) throw new Error(`${f.id}: line too long to read in a glance (${f.line.length})`);
  if (BANNED.test(f.line) || BANNED.test(f.body)) {
    throw new Error(`${f.id}: moralising or alarming wording — "${f.line}"`);
  }
  // No amounts, ever: the Safety Pack forbids anything that reads as dosing guidance.
  if (/\b\d+\s?(mg|g|grams?|joints?|puffs?|hits?)\b/i.test(f.body)) {
    throw new Error(`${f.id}: mentions an amount`);
  }
}

// Rotation must not hand back the one just read.
for (let i = 0; i < 300; i++) {
  if (nextFact("spotlight").id === "spotlight") throw new Error("nextFact repeated the last fact");
}

console.log(`Facts: ${FACTS.length} cards, none of them lecture anyone`);
