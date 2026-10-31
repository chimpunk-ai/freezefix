import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { TERMS } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms of Use" };

export default function Page() {
  return <LegalShell source={TERMS} />;
}
