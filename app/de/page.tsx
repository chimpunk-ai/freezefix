import type { Metadata } from "next";
import Landing from "@/components/Landing";
import { LANDING_COPY } from "@/lib/landing-copy";

// German landing page. Added 3 November 2026 (feat/de-landing, Europe-audit
// P1.5). Marcus (Berlin, 22) reads German natively; the Europe-persona audit
// showed every English-only landing page losing him in the first three
// seconds. This page is the same product, just in his language.
//
// Note: /de is intentionally NOT behind a middleware redirect from /. A
// native English speaker who flies to Berlin for a weekend shouldn't be
// forced into German by their Accept-Language header; the switcher in the
// header lets anyone flip explicitly. The hreflang metadata below is what
// tells search engines which page to serve to which region.

const SITE_URL = "https://getfreezefix.com";
const copy = LANDING_COPY.de;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: copy.metaTitle,
  description: copy.metaDescription,
  openGraph: {
    title: copy.metaTitle,
    description: copy.metaDescription,
    url: `${SITE_URL}/de`,
    locale: "de_DE",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/de`,
    languages: {
      en: `${SITE_URL}/`,
      "de-DE": `${SITE_URL}/de`,
      "fr-FR": `${SITE_URL}/fr`,
      "nl-NL": `${SITE_URL}/nl`,
      "x-default": `${SITE_URL}/`,
    },
  },
};

export default function Page() {
  return <Landing locale="de" />;
}
