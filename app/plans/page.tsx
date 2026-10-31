import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import StubScreen from "@/components/StubScreen";

export const metadata: Metadata = {
  title: "Plan",
  description:
    "One tiny if–then plan for tomorrow. No reminders, no streaks, no pressure. Stays on this device.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// This route is the USER'S plans / goals (as in: "if I notice a craving after dinner,
// I can pause for ten minutes and decide again") — the "Tomorrow Loop" from the
// reference prototype. It is NOT the paid subscription plans in `lib/plans.ts`, which
// stay frozen and live under /api/paywall. Separate concepts, same word; the two must
// not be conflated in code or copy.
export default function Page() {
  return (
    <AppShell>
      <StubScreen
        kicker="Plan · on this device only"
        title="One tiny plan for tomorrow."
        description="Write a single if–then for tomorrow — only if you'd like one. No reminders, no streaks, no scoreboard. Lives in this browser; nothing is scheduled or sent anywhere."
        cta={{ href: "/app", label: "Open Fix" }}
      />
    </AppShell>
  );
}
