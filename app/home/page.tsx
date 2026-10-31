import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import StubScreen from "@/components/StubScreen";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Your daily FreezeFix home — check in, see your last seven days, pick a goal, and get to the one thing that might help right now.",
  robots: { index: false, follow: false },
};

// Home is purely client-state (localStorage check-ins, goals, journal counts). The
// surface rendered in PR B replaces this stub; the route and nav slot land first.
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppShell>
      <StubScreen
        kicker="Home · on this device only"
        title="Your calm, honest home."
        description="The daily check-in, your last seven days, your goal, and the one thing that might help right now will land here. Nothing is sent anywhere; everything on this page is yours and stays on this phone."
        cta={{ href: "/app", label: "Open Fix" }}
        secondary={{ href: "/patterns", label: "See what's already here · Insights" }}
      >
        <p className="mt-2 text-sm text-ink-faint">
          Already working for you: the Fix chat, Patterns, Privacy, Help.
        </p>
      </StubScreen>
    </AppShell>
  );
}
