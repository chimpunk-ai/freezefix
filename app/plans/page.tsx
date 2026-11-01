import type { Metadata } from "next";
import UserPlans from "@/components/UserPlans";

export const metadata: Metadata = {
  title: "Plan",
  description:
    "One tiny if–then plan for tomorrow. No reminders, no streaks, no pressure. Stays on this device.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// This route is the USER'S plans / goals (the "Tomorrow Loop" from the reference
// prototype). It is NOT the paid subscription plans in `lib/plans.ts`, which stay
// frozen and live under /api/paywall. Separate concepts, same word.
export default function Page() {
  return <UserPlans />;
}
