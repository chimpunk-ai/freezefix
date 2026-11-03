import type { Metadata } from "next";
import WasThatNormal from "@/components/WasThatNormal";
import { WAS_THAT_NORMAL_COPY } from "@/lib/was-that-normal-copy";

// "Was that normal?" page. Added 4 November 2026 (feat/was-that-normal)
// for Sophie (Paris, 24, post-party coffee) from the 15-persona audit.
// One route, four locales via detectRegion + pickLandingLocale (same
// pattern as /program, /for-someone-you-love).
//
// Metadata is English because the route slug is English; the in-page
// experience localizes client-side. Future SEO extension — if "c'était
// normal cannabis", "war das normal cannabis" turn out to be searched
// hard enough — can add /fr/c-etait-normal etc. without touching this
// file.

const SITE_URL = "https://getfreezefix.com";
const copy = WAS_THAT_NORMAL_COPY.en;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: copy.metaTitle,
  description: copy.metaDescription,
  openGraph: {
    title: copy.metaTitle,
    description: copy.metaDescription,
    url: `${SITE_URL}/was-that-normal`,
    locale: "en",
    type: "article",
  },
  alternates: {
    canonical: `${SITE_URL}/was-that-normal`,
  },
};

export default function Page() {
  return <WasThatNormal />;
}
