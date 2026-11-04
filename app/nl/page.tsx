import type { Metadata } from "next";
import Landing from "@/components/Landing";
import { LANDING_COPY } from "@/lib/landing-copy";

// Dutch landing page. Added 3 November 2026 for audit P3.11. Lars
// (Amsterdam, 25, English-fluent but reads NL marketing better) now
// sees the same product in Dutch with an honest disclosure that the
// chat is still English and NL is coming.

const SITE_URL = "https://getfreezefix.com";
const copy = LANDING_COPY.nl;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: copy.metaTitle,
  description: copy.metaDescription,
  openGraph: {
    title: copy.metaTitle,
    description: copy.metaDescription,
    url: `${SITE_URL}/nl`,
    locale: "nl_NL",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/nl`,
    languages: {
      en: `${SITE_URL}/`,
      "de-DE": `${SITE_URL}/de`,
      "fr-FR": `${SITE_URL}/fr`,
      "nl-NL": `${SITE_URL}/nl`,
      "es-ES": `${SITE_URL}/es`,
      "it-IT": `${SITE_URL}/it`,
      "x-default": `${SITE_URL}/`,
    },
  },
};

export default function Page() {
  return <Landing locale="nl" />;
}
