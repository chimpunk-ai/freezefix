import type { Metadata } from "next";
import ForSomeone from "@/components/ForSomeone";
import { FOR_SOMEONE_COPY } from "@/lib/for-someone-copy";

// "For someone you love" page. Added 4 November 2026 for Clara (Lyon, 29)
// from the 15-persona audit. Single route handles all four locales
// client-side via detectRegion + pickLandingLocale — the page is a
// supportive tool, not a content SEO play, so one URL is cleaner than
// four hreflang-paired ones. If a localized SEO push for this page
// specifically is wanted later ("aider mon copain à arrêter"),
// /fr/pour-quelqu'un, /de/jemand-geliebt etc. can be added without
// refactoring this file.

const SITE_URL = "https://getfreezefix.com";
const copy = FOR_SOMEONE_COPY.en;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: copy.metaTitle,
  description: copy.metaDescription,
  openGraph: {
    title: copy.metaTitle,
    description: copy.metaDescription,
    url: `${SITE_URL}/for-someone-you-love`,
    locale: "en",
    type: "article",
  },
  alternates: {
    canonical: `${SITE_URL}/for-someone-you-love`,
  },
};

export default function Page() {
  return <ForSomeone />;
}
