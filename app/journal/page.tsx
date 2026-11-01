import type { Metadata } from "next";
import Journal from "@/components/Journal";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "A private journal that stays on your phone. Note what happened — not what you plan — in your own words.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <Journal />;
}
