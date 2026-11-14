"use client";

import { useEffect } from "react";

// Registers the service worker. Until 14 Nov 2026 public/sw.js existed but
// nothing registered it, so the offline shell, the install prompt on
// Android/desktop and Web Push had no foundation. Mounted once from the
// root layout; renders nothing.
//
// Update policy: when a new worker is waiting we tell it to skip waiting and
// reload once on controllerchange, so a redeploy reaches an open tab on its
// next navigation rather than two visits later. Journal data lives in
// localStorage, not the cache, so a reload never touches it.

const KEY = "ff_sw_reloaded";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    let reloaded = false;
    const onControllerChange = () => {
      if (reloaded) return;
      try {
        if (sessionStorage.getItem(KEY) === "1") return; // one reload per session, never a loop
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
