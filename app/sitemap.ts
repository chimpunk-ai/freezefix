import type { MetadataRoute } from "next";

// The public pages Google should discover. /app is deliberately absent: it is a
// private tool, not content, and nothing in it is indexable anyway.

const SITE_URL = "https://getfreezefix.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly"): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "weekly"),
    page("/plans", 0.8, "monthly"),
    page("/help", 0.9, "monthly"),
    page("/privacy", 0.4, "monthly"),
    page("/terms", 0.4, "monthly"),
    page("/refunds", 0.3, "monthly"),
  ];
}
