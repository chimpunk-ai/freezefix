import type { Metadata } from "next";
import Landing from "@/components/Landing";

const SITE_URL = "https://getfreezefix.com";

// Metadata override (added 3 Nov 2026, feat/de-landing — Europe-audit P1.5).
// Adds the hreflang alternates so Google serves /de to German-locale
// searchers and / to everyone else, and canonicals /. Title/description are
// inherited from app/layout.tsx.
export const metadata: Metadata = {
  alternates: {
    canonical: `${SITE_URL}/`,
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

// The public front door. The app itself lives at /app.
export default function Page() {
  return <Landing />;
}
