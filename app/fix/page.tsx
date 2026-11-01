import type { Metadata } from "next";
import FixPicker from "@/components/FixPicker";

export const metadata: Metadata = {
  title: "Fix",
  description:
    "Pick what fits and Fix meets you there — a craving, after smoking, a loop, a stuck task. Live AI, not a person; crisis help is always free.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// The Fix tab now lands on the situation picker rather than redirecting straight to
// /app. Picking any chip routes to the surface already working for that situation —
// /app for chat, /sos for cravings, /plans for a small change. No chat UI is
// duplicated; the real safety path at /app is unchanged.
export default function Page() {
  return <FixPicker />;
}
