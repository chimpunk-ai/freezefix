import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import PrivacySummary from "@/components/PrivacySummary";
import { PRIVACY } from "@/lib/legal";

// The root layout's title template appends "· FreezeFix", so this value must NOT
// repeat the brand name — otherwise the browser tab reads "Privacy Policy · FreezeFix · FreezeFix".
export const metadata: Metadata = { title: "Privacy Policy" };

export default function Page() {
  return <LegalShell source={PRIVACY} aboveContent={<PrivacySummary />} />;
}
