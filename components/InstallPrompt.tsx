"use client";

import { useEffect, useState } from "react";

// "Put this on your home screen", offered once, after something has actually gone well.
//
// Never on arrival: asking a stranger to install something before it has helped them is how
// you get dismissed forever. Dismissed means dismissed, remembered on the device.
//
// Android and desktop Chrome hand us a real install event. iOS Safari doesn't, so there it
// shows the two-tap instruction instead, which is the only way it can be done there.

const K_DISMISSED = "ff_install_dismissed";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export default function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(K_DISMISSED) === "yes") return;
    } catch {
      /* storage blocked: better to stay quiet than nag every visit */
      return;
    }

    // Already installed: nothing to offer.
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isSafari = isIos && !/crios|fxios/i.test(window.navigator.userAgent);
    if (isSafari) {
      setIos(true);
      setShow(true);
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setShow(false);
    try {
      window.localStorage.setItem(K_DISMISSED, "yes");
    } catch {
      /* ignore */
    }
  }

  if (!show) return null;

  return (
    <div className="rounded-[1.75rem] border border-line bg-card p-5">
      <p className="text-lg font-semibold leading-snug text-ink">Keep it on your home screen</p>
      <p className="mt-1 text-base leading-relaxed text-ink-soft">
        {ios ? (
          <>
            Tap <span className="text-ink">Share</span>, then{" "}
            <span className="text-ink">Add to Home Screen</span>. Opens like an app, no store, no account.
          </>
        ) : (
          "Opens like an app. No store, no account, nothing to sign up for."
        )}
      </p>
      <div className="mt-4 flex gap-2">
        {!ios && (
          <button
            onClick={async () => {
              try {
                await event?.prompt();
                await event?.userChoice;
              } catch {
                /* they closed it; either way we don't ask again */
              }
              dismiss();
            }}
            className="flex-1 rounded-2xl bg-accent px-4 py-3 text-base font-bold text-accent-ink"
          >
            Add it
          </button>
        )}
        <button onClick={dismiss} className="flex-1 rounded-2xl border border-line px-4 py-3 text-base text-ink-soft">
          No thanks
        </button>
      </div>
    </div>
  );
}
