"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HelpScreen from "@/components/HelpScreen";
import { Container, Main } from "@/components/Shell";
import { Wordmark } from "@/components/Brand";
import SiteFooter from "@/components/SiteFooter";
import { useRegion } from "@/components/useRegion";
import type { HelpScreen as HelpScreenId } from "@/lib/risk";

// A free, unguarded route for crisis / urgent help. Reachable from every page
// without passing the 18+ gate, the set-up, a payment or any animated flow.
//
// Deliberately no site nav up here: the first thing under the wordmark is a
// phone number. Pulls the same resource lists the in-app help screen uses, so
// the numbers stay in sync; wording is from Safety Pack v1.0 §2 and §6.

const SCREEN_IDS: HelpScreenId[] = ["emergency", "crisis", "psychosis", "mixed", "doctor", "under18", "worried"];

function parseScreen(q: string | null): HelpScreenId {
  const v = (q || "").toLowerCase();
  return (SCREEN_IDS as string[]).includes(v) ? (v as HelpScreenId) : "crisis";
}

export default function HelpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const detected = useRegion();
  const [picked, setPicked] = useState<string | null>(null);
  const region = picked ?? detected;

  // No ?screen= means the visitor typed /help or tapped it in a footer: they
  // haven't disclosed anything to Fix, so the opener must not thank them for
  // doing so. The in-app crisis handoff always passes ?screen=.
  const screenParam = params.get("screen");
  const screen = parseScreen(screenParam);
  const direct = screenParam === null;

  function onBack() {
    // Go back if the user got here from inside the site; otherwise home.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  function onRegionChange(r: string) {
    setPicked(r);
    try {
      window.localStorage.setItem("ff_region", r);
    } catch {
      /* storage can be blocked; the choice just lives for this view */
    }
  }

  // The under-18 stop has no "back"; everything else does.
  const back = screen === "under18" ? undefined : onBack;

  return (
    <>
      <header>
        <Container measure="read" className="flex items-center justify-between py-5">
          <Wordmark />
          {back ? (
            <button
              type="button"
              onClick={back}
              className="inline-flex min-h-11 items-center rounded-pill border border-line px-4 text-14 text-ink hover:border-ink-faint"
            >
              back
            </button>
          ) : null}
        </Container>
      </header>
      <Main>
        <Container measure="read" className="pb-10">
          <HelpScreen screen={screen} region={region} onRegionChange={onRegionChange} onBack={back} direct={direct} />
        </Container>
        <Container measure="read" className="pb-14">
          <SiteFooter />
        </Container>
      </Main>
    </>
  );
}
