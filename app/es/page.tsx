import type { Metadata } from "next";
import Landing from "@/components/Landing";
import { LANDING_COPY } from "@/lib/landing-copy";

// Spanish landing page. Added 4 November 2026 for the 15-persona audit
// (Maria, Madrid, 28). Spanish-first copy, honest disclosure that the
// chat itself is still English and that Spanish is on the waitlist.

const SITE_URL = "https://getfreezefix.com";
const copy = LANDING_COPY.es;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: copy.metaTitle,
  description: copy.metaDescription,
  openGraph: {
    title: copy.metaTitle,
    description: copy.metaDescription,
    url: `${SITE_URL}/es`,
    locale: "es_ES",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/es`,
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
  return <Landing locale="es" />;
}
