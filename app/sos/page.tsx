import type { Metadata } from "next";
import Sos from "@/components/Sos";

export const metadata: Metadata = {
  title: "Craving SOS",
  description:
    "A short, started-by-you pause for a cannabis craving. You choose what happens next — pause, change the scene, contact someone, or write it down.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Craving SOS is a non-emergency, user-started coping surface. It must never be
// confused with the real crisis path at /help, which is a tap away from every page.
export default function Page() {
  return <Sos />;
}
