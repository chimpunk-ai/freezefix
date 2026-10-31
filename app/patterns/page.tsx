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

export default function Page() {
  return <Patterns />;
}
