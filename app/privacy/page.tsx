import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import PrivacySummary from "@/components/PrivacySummary";
import { PRIVACY } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy Policy · FreezeFix" };

export default function Page() {
  return <LegalShell source={PRIVACY} aboveContent={<PrivacySummary />} />;
}
