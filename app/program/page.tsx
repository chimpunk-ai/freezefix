import type { Metadata } from "next";
import Program from "@/components/Program";
import { PROGRAM_COPY } from "@/lib/program-copy";

// The Reduction Program. Audit P2.8, 3 November 2026.
//
// Single route, both locales. The <Program /> component detects the user's
// region on mount (same path as /de and the SEO landings use) and picks
// English or German copy — a stateful self-guided experience like this
// doesn't benefit from the SEO-focused separate /program/de split that the
// reading-only pages use. If future audit items need localized SEO for the
// program itself, that's a separate PR adding /program/de with hreflang.
//
// Metadata is English on purpose: Google's SERP for "cannabis reduction
// plan" is predominantly English-language searching regardless of the
// visitor's actual browser locale, so an English title is the right default
// for the canonical URL. The in-page experience adapts after the user has
// clicked through.

const SITE_URL = "https://getfreezefix.com";
const copy = PROGRAM_COPY.en;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: copy.metaTitle,
  description: copy.metaDescription,
  openGraph: {
    title: copy.metaTitle,
    description: copy.metaDescription,
    url: `${SITE_URL}/program`,
    locale: "en",
    type: "article",
  },
  alternates: {
    canonical: `${SITE_URL}/program`,
  },
};

export default function Page() {
  return <Program />;
}
