import type { Metadata } from "next";
import SeoLanding from "@/components/SeoLanding";
import { pageBySlug } from "@/lib/seo-copy";

// SEO landing page — "zu high was tun". Audit P1.7, 3 November 2026.
// German search phrase for the Marcus / DE/AT/CH audience. Pair page in
// English: /too-high-what-to-do.

const SITE_URL = "https://getfreezefix.com";
const content = pageBySlug("zu-high-was-tun")!;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: content.metaTitle,
  description: content.metaDescription,
  openGraph: {
    title: content.metaTitle,
    description: content.metaDescription,
    url: `${SITE_URL}/zu-high-was-tun`,
    locale: "de_DE",
    type: "article",
  },
  alternates: {
    canonical: `${SITE_URL}/zu-high-was-tun`,
    languages: {
      en: `${SITE_URL}/too-high-what-to-do`,
      "de-DE": `${SITE_URL}/zu-high-was-tun`,
      "x-default": `${SITE_URL}/too-high-what-to-do`,
    },
  },
};

export default function Page() {
  return <SeoLanding content={content} />;
}
