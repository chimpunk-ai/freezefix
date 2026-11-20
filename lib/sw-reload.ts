// The decision behind PwaRegister's controllerchange handler, pulled out so
// it's testable without a DOM/service-worker environment.
//
// sw.js's activate handler calls clients.claim(), which fires
// controllerchange on every first-ever visit too (no controller -> one),
// not just on a genuine update (old worker -> new worker). Reloading on the
// first case forces every brand-new visitor through an unconditional page
// reload moments after their very first paint, which is a real bug, not a
// cosmetic one — it was reported as onboarding's first screen "appearing
// twice." We only want to reload when this tab already had a controller
// before registering (something stale is actually being replaced), and
// only once per session even then.
export function shouldReloadOnControllerChange(hadController: boolean, alreadyReloadedThisSession: boolean): boolean {
  if (!hadController) return false; // first-ever claim: nothing stale to recover from
  if (alreadyReloadedThisSession) return false; // never loop
  return true;
}
