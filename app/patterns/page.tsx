import type { Metadata } from "next";
import Insights from "@/components/Insights";

// Insights (routed from the "Insights" tab in the bottom nav). Reads only this
// device's localStorage — check-ins, journal entries, wins log — and derives a small
// honest set of patterns. Each card has a "Why am I seeing this?" explainer and can
// be hidden. Nothing is sent anywhere; nothing is written back to any store.
//
// Kept noindex so the personal, albeit anonymous, aggregate shape of a device never
// ends up in a search snippet.
export const metadata: Metadata = {
  title: "Insights",
  description:
    "A quiet, private look at what keeps coming up for you in Fix — from your check-ins and journal entries. Reads only this device; nothing is sent anywhere.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <Insights />;
}
