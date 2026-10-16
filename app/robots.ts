import type { MetadataRoute } from "next";

// Private beta: nothing indexed until the founder says go.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
