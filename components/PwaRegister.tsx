"use client";

import { useEffect } from "react";
import { shouldReloadOnControllerChange } from "@/lib/sw-reload";

// Registers the service worker. Until 14 Nov 2026 public/sw.js existed but
// nothing registered it, so the offline shell, the install prompt on
// Android/desktop and Web Push had no foundation. Mounted once from the
// root layout; renders nothing.
//
// Update policy: when a new worker is waiting we tell it to skip waiting and
// reload once on controllerchange, so a redeploy reaches an open tab on its
// next navigation rather than two visits later. Journal data lives in
// localStorage, not the cache, so a reload never touches it.
//
// Fixed 20 Nov 2026: sw.js's activate handler calls clients.claim(), which
// fires controllerchange on EVERY first-ever visit too — going from no
// controller to one, not from an old worker to a new one. The reload logic
// below used to treat that the same as a genuine update and force a reload
// moments after the very first page a brand-new visitor ever saw (reported
// as onboarding's first screen "appearing twice" — it wasn't a render bug,
// it was a real, silent, unconditional page reload). Now we only reload when
// this tab already had a controller before this registration call — i.e.
// an update actually replacing something that was running — never on the
// first claim, which has nothing stale to replace.

const KEY = "ff_sw_reloaded";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloaded = false;
    const onControllerChange = () => {
      let alreadyReloadedThisSession = false;
      try {
        alreadyReloadedThisSession = sessionStorage.getItem(KEY) === "1";
      } catch {
        // storage blocked: treat as not-yet-reloaded, same as before
      }
      if (!shouldReloadOnControllerChange(hadController, reloaded || alreadyReloadedThisSession)) return;
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        // storage blocked; still reload once
      }
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        const promote = (w: ServiceWorker | null) => {
          if (!w) return;
          w.addEventListener("statechange", () => {
            if (w.state === "installed" && navigator.serviceWorker.controller) w.postMessage({ type: "SKIP_WAITING" });
          });
        };
        promote(reg.installing);
        reg.addEventListener("updatefound", () => promote(reg.installing));
        if (reg.waiting && navigator.serviceWorker.controller) reg.waiting.postMessage({ type: "SKIP_WAITING" });
      })
      .catch(() => {
        // The app works without it; nothing to tell the user.
      });

    return () => navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, []);
  return null;
}
