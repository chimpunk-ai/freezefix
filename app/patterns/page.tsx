import type { Metadata } from "next";
import Patterns from "@/components/Patterns";

// Patterns is a reflection page that reads only localStorage — kept noindex so the
// personal, albeit anonymous, aggregate shape of a device never ends up in a search snippet.
export const metadata: Metadata = {
  title: "Patterns",
  description:
    "A quiet, private look at what keeps coming up for you in Fix. Reads only this device; nothing is sent anywhere.",
  robots: { index: false, follow: false },
};

// The page is purely client-driven (reads window.localStorage inside useEffect). There is
// no useful server-render — the first paint would always be the empty "Nothing to show yet"
// state because the server has no device storage. Skipping prerender also avoids a Next 16
// Turbopack build-time module-evaluation foot-gun on pages like this.
export const dynamic = "force-dynamic";

export default function Page() {
  return <Patterns />;
}
