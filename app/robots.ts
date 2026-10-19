import type { MetadataRoute } from "next";

// The web beta is live. Allow search engines to crawl the public pages so the site
// stops showing up as "No information is available for this page" in Google.
// Internal API routes and the app itself are not interesting content for search; the
// landing, legal pages and the public /help page are.
//
// If a page needs to stay out of search, it can set its own `robots: { index: false }`
// in its own metadata (per-page override wins over this file for indexing).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep crawlers out of API endpoints and internal/preview routes. These are
        // either machine-only JSON (/api/*), or asset bundles that aren't content.
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: "https://getfreezefix.com/sitemap.xml",
    host: "https://getfreezefix.com",
  };
}
