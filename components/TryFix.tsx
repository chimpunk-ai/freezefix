"use client";

import { useState, type ReactNode } from "react";
import FixSheet from "@/components/FixSheet";
import { useRegion } from "@/components/useRegion";
import { readEntries, type Entries } from "@/lib/entry";
import { weekStats, type WeekStats } from "@/lib/pattern";
import { readProfile, type Goal } from "@/lib/profile";
import { SAMPLE_END, SAMPLE_GOAL, sampleEntries } from "@/lib/sample";

// Try Fix from the front door. It is the real Fix — same API, same voice, same
// five-a-day limit, same crisis path — asked about a week. If this device
// already has a log with at least one night in it, that week is theirs;
// otherwise it is nico's sample week, and the sheet says so. Nothing here
// writes to storage, and nothing is sent until they press send.

type Week = { name: string; stats: WeekStats; entries: Entries; goal: Goal | null; sample: boolean };

function pickWeek(): Week {
  try {
    const profile = readProfile();
    const entries = readEntries();
    if (profile?.onboarded && Object.keys(entries).length > 0) {
      return { name: profile.name, stats: weekStats(entries, profile.goal), entries, goal: profile.goal, sample: false };
    }
  } catch {
    // storage blocked (private window) — fall through to the sample
  }
  const entries = sampleEntries();
  return { name: "nico", stats: weekStats(entries, SAMPLE_GOAL, SAMPLE_END), entries, goal: SAMPLE_GOAL, sample: true };
}

export default function TryFix({ className, children }: { className?: string; children: ReactNode }) {
  const [week, setWeek] = useState<Week | null>(null);
  const region = useRegion();

  return (
    <>
      <button type="button" className={className} onClick={() => setWeek(pickWeek())}>
        {children}
      </button>
      {week ? (
        <FixSheet
          open
          onClose={() => setWeek(null)}
          name={week.name}
          stats={week.stats}
          entries={week.entries}
          goal={week.goal}
          region={region}
          onPaywall={() => setWeek(null)}
          banner={
            week.sample
              ? "you're asking about nico's sample week — a real answer from the real fix. your own week needs a log first."
              : "this is your own week, from the log on this device."
          }
        />
      ) : null}
    </>
  );
}
