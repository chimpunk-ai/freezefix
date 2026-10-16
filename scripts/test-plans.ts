// Checks the money numbers: the right currency per region, and trial dates that are
// calculated rather than invented. Run: npm run test:plans
import { pricesFor, plansFor, trialDates, TRIAL_DAYS } from "../lib/plans";

if (pricesFor("GB").currency !== "GBP") throw new Error("UK should be priced in GBP");
if (pricesFor("gb").yearly !== "£39.99") throw new Error("region match must ignore case");
if (pricesFor("US").currency !== "USD") throw new Error("US should be priced in USD");
if (pricesFor("DE").currency !== "USD") throw new Error("unlisted regions fall back to USD");
if (pricesFor(undefined).currency !== "USD") throw new Error("no region falls back to USD");

const uk = plansFor("GB");
if (!uk.yearly.recommended || uk.monthly.recommended) throw new Error("yearly is the recommended plan");
if (!uk.yearly.note.includes("£3.33")) throw new Error("yearly must show the per-month figure");
if (!uk.yearly.note.includes("billed yearly")) throw new Error("per-month figure must say it's billed yearly");

// A 4-day trial starting today charges on day 4, and reminds the day before.
const from = new Date(2026, 0, 10);
const t = trialDates(from, 4);
if (t.endsAt.getDate() !== 14) throw new Error(`charge date wrong: ${t.endsAt.toDateString()}`);
if (!t.reminderLabel.includes("13")) throw new Error(`reminder should be the day before: ${t.reminderLabel}`);
// A same-day trial must never claim to have reminded someone in the past.
const short = trialDates(from, 1);
if (!short.reminderLabel.includes("10")) throw new Error("reminder must not fall before the start");
if (TRIAL_DAYS < 1) throw new Error("trial length must be at least a day");

console.log(`Plans: GBP/USD correct, ${TRIAL_DAYS}-day trial dates check out`);
