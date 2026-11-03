import type { Metadata } from "next";
import Landing from "@/components/Landing";
import { LANDING_COPY } from "@/lib/landing-copy";

// French landing page. Added 3 November 2026 for audit P3.11. Sophie
// (Paris, 24, French-first) now sees the same product in French with
// an honest disclosure that the chat is still English and the French
// chat is coming.

const SITE_URL = "https://getfreezefix.com";
const copy = LANDING_COPY.fr;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: copy.metaTitle,
  description: copy.metaDescription,
  openGraph: {
    title: copy.metaTitle,
    description: copy.metaDescription,
    url: `${SITE_URL}/fr`,
    locale: "fr_FR",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/fr`,
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
  return <Landing locale="fr" />;
}
