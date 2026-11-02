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
