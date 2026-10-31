import type { Metadata } from "next";
import HomeDashboard from "@/components/HomeDashboard";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Your daily FreezeFix home — check in, see your last seven days, pick a goal, and get to the one thing that might help right now. Nothing is sent anywhere.",
  robots: { index: false, follow: false },
};

// Reads only localStorage, so there is nothing useful to prerender on the server; the
// first paint would be a stale empty state. Forcing dynamic also sidesteps the Next 16
// Turbopack prerender quirks we have hit on this app.
export const dynamic = "force-dynamic";

export default function Page() {
  return <HomeDashboard />;
}
