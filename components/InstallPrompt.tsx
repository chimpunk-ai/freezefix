"use client";

import { useEffect, useState } from "react";

// "Download" for a web app, honestly. On Android, Chrome and Edge the
// browser offers a real install prompt we can trigger; on iPhone and iPad
// it is Safari's share sheet → "Add to Home Screen" and nothing can trigger
// it, so we show the two steps. Once installed (standalone display-mode)
// this renders nothing. Nothing here phones home.

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

type State = "idle" | "android" | "ios" | "installed" | "unsupported";

function detect(): State {
  if (typeof window === "undefined") return "idle";
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
  if (standalone) return "installed";
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (iOS) return "ios";
  return "unsupported"; // until beforeinstallprompt says otherwise
}

export default function InstallPrompt({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const [state, setState] = useState<State>("idle");
  const [bip, setBip] = useState<BIP | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setState(detect());
    const onBip = (e: Event) => {
      e.preventDefault();
      setBip(e as BIP);
      setState("android");
    };
    const onInstalled = () => setState("installed");
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (state === "idle" || state === "installed" || done) return null;

  const shell = compact
    ? "rounded-card border border-line bg-card p-4"
    : "rounded-sheet border border-line bg-card/60 p-5 sm:p-6";

  if (state === "android" && bip) {
    return (
      <div className={`${shell} ${className}`}>
        <p className="text-14 text-ink">put fix on your home screen.</p>
        <p className="mt-1 text-12 text-ink-faint">
          its own icon, opens full screen, works offline for the log. same app, no store, nothing extra installed.
        </p>
        <button
          type="button"
          onClick={async () => {
            try {
              await bip.prompt();
              const c = await bip.userChoice;
              if (c.outcome === "accepted") setDone(true);
            } catch {
              // the browser withdrew the prompt; nothing to say
            }
          }}
          className="mt-3 inline-flex min-h-11 items-center rounded-pill bg-signpost px-5 text-14 font-medium text-signpost-ink hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signpost focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          install fix
        </button>
      </div>
    );
  }

  if (state === "ios") {
    return (
      <div className={`${shell} ${className}`}>
        <p className="text-14 text-ink">put fix on your home screen.</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-14 text-ink-soft">
          <li>
            tap <span className="text-ink">share</span> in safari (the square with the arrow).
          </li>
          <li>
            choose <span className="text-ink">add to home screen</span>.
          </li>
        </ol>
        <p className="mt-2 text-12 text-ink-faint">
          it opens full screen with its own icon, and the sunday reminder can reach you. nothing from the app store is involved.
        </p>
      </div>
    );
  }

  // Desktop Safari/Firefox and in-app browsers: nothing to offer, so nothing shown.
  return null;
}
