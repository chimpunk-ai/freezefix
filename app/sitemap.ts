import type { MetadataRoute } from "next";

// Lists the public pages Google should discover. The chat app at /app is intentionally
// left out: it is an interactive tool, not content, and anyone looking for it will find
// it from the landing page.

const SITE_URL = "https://getfreezefix.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      // German landing (added 3 Nov 2026, feat/de-landing — Europe-audit P1.5).
      // Lower priority than / because the chat behind the CTA is still English
      // for now, but same change frequency so Google re-indexes together.
      url: `${SITE_URL}/de`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      // French landing (added 3 Nov 2026, feat/fr-nl-locales — audit P3.11).
      url: `${SITE_URL}/fr`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      // Dutch landing (added 3 Nov 2026, feat/fr-nl-locales — audit P3.11).
      url: `${SITE_URL}/nl`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      // Spanish landing (added 4 Nov 2026, feat/es-it-locales — 15-persona audit).
      url: `${SITE_URL}/es`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      // Italian landing (added 4 Nov 2026, feat/es-it-locales — 15-persona audit).
      url: `${SITE_URL}/it`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      // SEO landing pages (added 3 Nov 2026, feat/seo-landing-pages — audit
      // P1.7). Prioritised below / and /de because they're funnels INTO the
      // product, not the product itself. monthly change-frequency because
      // the clinical copy should not drift often; when it does it is a
      // deliberate update, not a trickle.
      url: `${SITE_URL}/too-high-what-to-do`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/zu-high-was-tun`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/greened-out`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      // Planned launch pricing and email waitlist; no payment action is available here.
      url: `${SITE_URL}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/product`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/help`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/refunds`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
