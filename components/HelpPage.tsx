"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import HelpScreen from "@/components/HelpScreen";
import SiteFooter from "@/components/SiteFooter";
import { detectRegion } from "@/lib/country";
import type { HelpScreen as HelpScreenId } from "@/lib/risk";

// A free, unguarded route for crisis / urgent help. Reachable from the landing-page
// nav and from the footer, so no one in a crisis has to pass the 18+ gate, a sign-up,
// a payment or any animated flow before seeing a real phone number.
//
// Pulls the same resource lists the in-app help screen uses, so the numbers stay in
// sync; wording is from Safety Pack v1.0 §2 and §6 (via components/HelpScreen.tsx).

const SCREEN_IDS: HelpScreenId[] = [
  "emergency",
  "crisis",
  "psychosis",
  "mixed",
  "doctor",
  "under18",
  "worried",
];

function parseScreen(q: string | null): HelpScreenId {
  const v = (q || "").toLowerCase();
  return (SCREEN_IDS as string[]).includes(v) ? (v as HelpScreenId) : "crisis";
}

export default function HelpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [region, setRegion] = useState("");

  useEffect(() => {
    setRegion(detectRegion());
  }, []);

  const screen = parseScreen(params.get("screen"));

  function onBack() {
    // Go back if the user got here from inside the site; otherwise home.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  function onRegionChange(r: string) {
    setRegion(r);
    try {
      window.localStorage.setItem("ff_region", r);
    } catch {
      /* storage can be blocked; the choice just lives for this view */
    }
  }

  // The under-18 stop has no "back"; everything else does.
  const back = screen === "under18" ? undefined : onBack;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 pb-10 pt-4">
      {/* Unified site header — same Fix wordmark + Back pill as the legal pages.
          The crisis content below is intentionally the first thing in <main>, not
          preceded by anything that would delay reading a phone number. */}
      <header className="mb-6 flex items-center justify-between py-2">
        <Link href="/" aria-label="GetFreezeFix home" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-serif text-lg italic text-accent-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            f
          </span>
          <span className="font-serif text-xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
            Fix
          </span>
        </Link>
        {/* Only screens that aren't the under-18 hard stop get a Back pill. */}
        {back && (
          <button
            type="button"
            onClick={back}
            className="min-h-[40px] rounded-full bg-chip px-4 py-1.5 text-sm text-ink transition hover:bg-chip/80"
          >
            Back
          </button>
        )}
      </header>
      <main className="flex-1">
        <HelpScreen screen={screen} region={region} onRegionChange={onRegionChange} onBack={back} />
      </main>
      <div className="mt-12">
        <SiteFooter />
      </div>
    </div>
  );
}
