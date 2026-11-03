import type { Metadata } from "next";
import SeoLanding from "@/components/SeoLanding";
import { pageBySlug } from "@/lib/seo-copy";

// SEO landing page — "greened out". Audit P1.7, 3 November 2026.
// UK / AU / IE slang for the same experience as /too-high-what-to-do, kept
// as its own page because the search intent is subtly different (established
// smoker having a bad time, not necessarily a first-timer who's panicking).

const SITE_URL = "https://getfreezefix.com";
const content = pageBySlug("greened-out")!;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: content.metaTitle,
  description: content.metaDescription,
  openGraph: {
    title: content.metaTitle,
    description: content.metaDescription,
    url: `${SITE_URL}/greened-out`,
    locale: "en",
    type: "article",
  },
  alternates: {
    canonical: `${SITE_URL}/greened-out`,
    languages: {
      en: `${SITE_URL}/greened-out`,
      "de-DE": `${SITE_URL}/zu-high-was-tun`,
      "x-default": `${SITE_URL}/greened-out`,
    },
  },
};

export default function Page() {
  return <SeoLanding content={content} />;
}
