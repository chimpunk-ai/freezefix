"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HelpScreen from "@/components/HelpScreen";
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
    <main className="mx-auto w-full max-w-2xl px-5 py-6">
      <HelpScreen screen={screen} region={region} onRegionChange={onRegionChange} onBack={back} />
    </main>
  );
}
