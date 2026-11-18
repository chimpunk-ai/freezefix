import { Suspense } from "react";
import type { Metadata } from "next";
import HelpFallback from "@/components/HelpFallback";
import HelpPage from "@/components/HelpPage";

// Help / crisis route. Reachable from the landing nav and from the footer without
// passing the 18+ gate, sign-up, payment or any animated flow.
//
// Why the fallback block above the client page:
//   The interactive region picker, back button and country-switcher all need
//   client JavaScript. On patchy 3G, battery-saver, hostile proxy or blocked JS
//   the client component never hydrates, and a person in crisis would see a
//   blank page. HelpFallback renders server-side and always paints a set of
//   working `tel:` links covering the main English-speaking emergency numbers
//   plus one country-agnostic crisis line, so there is always something
//   callable in the initial HTML. The client HelpPage renders below and
//   replaces this with the richer region-aware experience once JavaScript is
//   up. That's how a help page should never be a blank rectangle.
//
// Source for the numbers in HelpFallback: lib/resources.ts (the single source
// of truth for every number on the site; the fallback copies them, it doesn't
// invent them).

export const metadata: Metadata = {
  title: "Help now",
  description: "Real phone numbers and chat lines for urgent help. Free, no sign-up, no account.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <HelpFallback />
      <Suspense fallback={null}>
        <HelpPage />
      </Suspense>
    </>
  );
}
