import type { Metadata } from "next";
import Pricing from "@/components/Pricing";
import { PRICING_COPY } from "@/lib/pricing-copy";

// Pricing page — the founding-member pre-sell.
//
// Added 5 November 2026 (feat/pricing-founding-member) as Stage 1 of the
// Calm-grade redesign + revenue plan. One route, locale-detected at mount
// time; the same approach the Program route uses. If the brief's follow-up
// visual-rebuild pass wants per-locale URLs (/de/pricing etc.) that's a
// cheap follow-up — the copy pack already supports every locale.

const SITE_URL = "https://getfreezefix.com";
const enCopy = PRICING_COPY.en;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: enCopy.metaTitle,
  description: enCopy.metaDescription,
  openGraph: {
    title: enCopy.metaTitle,
    description: enCopy.metaDescription,
    url: `${SITE_URL}/pricing`,
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/pricing`,
  },
};

export default function Page() {
  return <Pricing />;
}
