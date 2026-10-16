import { addWin, allWins, removeWin, thisWeek, clearWins } from "../lib/wins";
// The wins log is device-only, so these run against a stand-in for localStorage.
// Checks the ordering, the delete-by-displayed-index flip, and the weekly summary.
// Run: npm run test:wins
const store = new Map<string, string>();
(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
};

addWin("sent the message", "Can't reply");
addWin("went to the thing", "Around people");
addWin("started the essay", "Stuck on a task");

const list = allWins();
if (list.length !== 3) throw new Error(`expected 3 wins, got ${list.length}`);
if (list[0].text !== "started the essay") throw new Error("newest should be first");

// Deleting uses the index the screen shows, which is the reverse of storage order.
removeWin(0);
const after = allWins();
if (after.some((w) => w.text === "started the essay")) throw new Error("deleted the wrong win");
if (after.length !== 2) throw new Error("delete removed more than one");

addWin("x".repeat(300));
if (allWins()[0].text.length !== 140) throw new Error("long entries must be trimmed");
removeWin(0);

addWin("");
if (allWins().length !== 2) throw new Error("blank entries must be ignored");

const week = thisWeek();
if (!week) throw new Error("this week should have wins in it");
if (week.count !== 2) throw new Error(`week count wrong: ${week.count}`);
// Two different moments, one each: that is not a pattern and must not be reported as one.
if (week.topMoment) throw new Error("a single occurrence is not a pattern");

addWin("replied again", "Can't reply");
if (thisWeek()?.topMoment !== "Can't reply") throw new Error("repeated moment should surface");

clearWins();
if (allWins().length) throw new Error("clear should empty the log");
if (thisWeek()) throw new Error("empty log should have no weekly card");

console.log("Wins: order, delete, limits and the weekly card all behave");
