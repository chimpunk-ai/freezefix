import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
        ],
      },
    ];
  },
  // No redirects() here on purpose: the OpenNext Cloudflare adapter's build has been
  // fragile when prerender encounters top-level redirect config. The AppNav's "Fix" tab
  // links directly to /app instead, which is where the chat flow lives today.
};

export default nextConfig;

// Lets `npm run dev` use Cloudflare features locally.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
