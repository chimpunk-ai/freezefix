"use client";

import { useEffect, useState } from "react";

// The install instructions, split by platform because the gestures are
// genuinely different and a single "add to home screen" paragraph helps nobody.
//
// Defaults to the platform the visitor is actually on, so most people never
// have to choose. The other tab stays visible for anyone installing for someone
// else, or reading this on a laptop before picking up their phone.

type Platform = "iphone" | "android" | "desktop";

const STEPS: Record<Platform, { title: string; body: string }[]> = {
  iphone: [
    { title: "Open this page in Safari", body: "Chrome and Firefox on iPhone can't add to the Home Screen. Safari can." },
    { title: "Tap the Share button", body: "The square with the arrow pointing up, in the bar at the bottom." },
    { title: "Scroll down, tap Add to Home Screen", body: "You may need to scroll past the first row of actions." },
    { title: "Tap Add", body: "Fix appears on your Home Screen and opens full screen, with no browser bars." },
  ],
  android: [
    { title: "Open this page in Chrome", body: "Samsung Internet works too. The steps are the same." },
    { title: "Tap the three dots", body: "Top right corner of the browser." },
    { title: "Tap Install app", body: "On some phones it says Add to Home screen. Either one works." },
    { title: "Confirm", body: "Fix appears in your app drawer and on your Home Screen like any other app." },
  ],
  desktop: [
    { title: "Look for the install icon", body: "A small screen-with-arrow icon at the right end of the address bar." },
    { title: "Click Install", body: "In Chrome or Edge. In Safari on Mac, use File, then Add to Dock." },
    { title: "It opens in its own window", body: "No tabs, no address bar. Same account-free app." },
  ],
};

export default function InstallGuide() {
  const [platform, setPlatform] = useState<Platform>("android");

  useEffect(() => {
    const ua = window.navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) setPlatform("iphone");
    else if (/android/i.test(ua)) setPlatform("android");
    else setPlatform("desktop");
  }, []);

  const steps = STEPS[platform];

  return (
    <div>
      <div className="flex gap-2" role="tablist" aria-label="Choose your phone">
        {(["iphone", "android", "desktop"] as Platform[]).map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={platform === p}
            onClick={() => setPlatform(p)}
            className={`rounded-full px-4 py-2 text-base font-semibold capitalize transition-colors ${
              platform === p
                ? "bg-accent text-accent-ink"
                : "border border-line text-ink-soft hover:text-ink"
            }`}
          >
            {p === "iphone" ? "iPhone" : p === "android" ? "Android" : "Desktop"}
          </button>
        ))}
      </div>

      <ol className="mt-5 space-y-3">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-4 rounded-[1.75rem] border border-line bg-card p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-base font-bold text-ink">
              {i + 1}
            </span>
            <div>
              <p className="text-lg font-semibold leading-snug text-ink">{step.title}</p>
              <p className="mt-1 text-base leading-relaxed text-ink-soft">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-[1.75rem] border border-line bg-card p-5">
        <p className="text-lg font-semibold leading-snug text-ink">What installing actually changes</p>
        <ul className="mt-3 space-y-2 text-base leading-relaxed text-ink-soft">
          <li>It opens full screen, with no address bar, from its own icon.</li>
          <li>It works offline for the pages you&apos;ve already opened.</li>
          <li>Your log stays on the device. There is no account, so there is nothing to sign in to.</li>
        </ul>
      </div>

      <div className="mt-3 rounded-[1.75rem] border border-line bg-card p-5">
        <p className="text-lg font-semibold leading-snug text-ink">What it can&apos;t do, honestly</p>
        <ul className="mt-3 space-y-2 text-base leading-relaxed text-ink-soft">
          <li>
            <span className="text-ink">iPhone reminders</span> need iOS 16.4 or newer, and only work
            once Fix is on your Home Screen. Safari tabs can&apos;t receive them.
          </li>
          <li>
            <span className="text-ink">The evening nudge</span> arrives when you open the app, or
            while it&apos;s open that evening. It isn&apos;t a server push, because no server holds
            your schedule.
          </li>
          <li>
            <span className="text-ink">Voice notes</span> use your microphone, and only after you
            hold the button. Nothing records in the background.
          </li>
          <li>
            <span className="text-ink">The camera</span> is never used. Fix doesn&apos;t ask for it,
            so there&apos;s no photo feature to find.
          </li>
        </ul>
      </div>

      <a
        href="/app"
        className="mt-6 block rounded-2xl bg-accent px-5 py-4 text-center text-base font-bold text-accent-ink"
      >
        Open tonight&apos;s log
      </a>
    </div>
  );
}
