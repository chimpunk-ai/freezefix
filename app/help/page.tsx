import { Suspense } from "react";
import type { Metadata } from "next";
import HelpPage from "@/components/HelpPage";

// Help / crisis route. Reachable from the landing nav and from the footer without
// passing the 18+ gate, sign-up, payment or any animated flow.

export const metadata: Metadata = {
  title: "Help now — FreezeFix",
  description: "Real phone numbers and chat lines for urgent help. Free, no sign-up, no account.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HelpPage />
    </Suspense>
  );
}
