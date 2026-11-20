// lib/sw-reload.ts check. Run: npm run test:sw-reload
//
// Covers the 20 Nov 2026 fix: a brand-new visitor's first-ever
// controllerchange (clients.claim() taking control for the first time) must
// never trigger a reload — only a genuine update of an already-controlled
// tab should.

import { shouldReloadOnControllerChange } from "../lib/sw-reload";

let fails = 0;
function ok(cond: boolean, msg: string) {
  if (!cond) {
    fails++;
    console.log("FAIL", msg);
  }
}

ok(
  shouldReloadOnControllerChange(false, false) === false,
  "first-ever claim (no prior controller) never reloads — this was the bug"
);
ok(
  shouldReloadOnControllerChange(true, false) === true,
  "a genuine update (tab already had a controller) does reload"
);
ok(
  shouldReloadOnControllerChange(true, true) === false,
  "never reloads twice in the same session, even on another genuine update"
);
ok(
  shouldReloadOnControllerChange(false, true) === false,
  "no prior controller still never reloads, regardless of the already-reloaded flag"
);

console.log(fails ? `${fails} failing` : "sw-reload check: 4/4 passed");
process.exit(fails ? 1 : 0);
