import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { MYTHS } from "@/lib/myths";

export const metadata: Metadata = {
  title: "Myths & reality",
  description:
    "The things people believe about looking at their own weed use that stop them looking — and what's actually true. Not medical advice; about the noticing, not the chemistry.",
  alternates: { canonical: "https://getfreezefix.com/myths" },
};

export default function Page() {
  return <LegalShell source={MYTHS} />;
}
