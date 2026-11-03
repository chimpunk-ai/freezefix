import type { Metadata } from "next";
import SeoLanding from "@/components/SeoLanding";
import { pageBySlug } from "@/lib/seo-copy";

// SEO landing page — "too high what to do". Audit P1.7, 3 November 2026.
// Targets the exact search phrase a panicking young adult types into Google
// at 2am. Pair page in German: /zu-high-was-tun.

const SITE_URL = "https://getfreezefix.com";
const content = pageBySlug("too-high-what-to-do")!;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: content.metaTitle,
  description: content.metaDescription,
  openGraph: {
    title: content.metaTitle,
    description: content.metaDescription,
    url: `${SITE_URL}/too-high-what-to-do`,
    locale: "en",
    type: "article",
  },
  alternates: {
    canonical: `${SITE_URL}/too-high-what-to-do`,
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
