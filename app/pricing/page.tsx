import type { Metadata } from "next";
import Pricing from "@/components/Pricing";
import { PRICING_COPY } from "@/lib/pricing-copy";

// Pricing page — one clearly labelled planned launch offer and a waitlist.
// No checkout or trial begins from this route while the new product is in development.

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
