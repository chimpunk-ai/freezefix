import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import StubScreen from "@/components/StubScreen";

export const metadata: Metadata = {
  title: "Craving SOS",
  description:
    "A short, started-by-you pause for a cannabis craving. You choose what happens next — pause, change the scene, contact someone, or write it down.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Craving SOS is a non-emergency, user-started coping surface. It must never be
// confused with the real crisis path at /help, which is a tap away from every page
// in the shell. The stub text makes the distinction clear.
export default function Page() {
  return (
    <AppShell showNav={false}>
      <StubScreen
        kicker="Craving SOS · not a medical emergency"
        title="A short pause, started by you."
        description="This isn't a medical emergency flow — if something is wrong with your body or you might act on thoughts of hurting yourself, use Get help now at the top of every page. For a cannabis craving, this page will offer a timed pause, a scene change, a message to someone, or a page to write what's pulling at you. Everything stays on this device."
        cta={{ href: "/app", label: "Open Fix" }}
        secondary={{ href: "/help", label: "Get help now — for urgent situations" }}
      />
    </AppShell>
  );
}
