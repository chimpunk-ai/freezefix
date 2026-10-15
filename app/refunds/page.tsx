import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { REFUNDS } from "@/lib/legal";

export const metadata: Metadata = { title: "Cancellations and refunds · FreezeFix" };

export default function Page() {
  return <LegalShell source={REFUNDS} />;
}
