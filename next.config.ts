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
  async redirects() {
    // The Fix tab in the new AppNav points at /fix; the chat flow currently lives at
    // /app and will be migrated under the shell in a later PR. Doing the redirect here
    // (rather than in a `redirect()` call inside app/fix/page.tsx) keeps it off the
    // prerender path, which has been fragile with the OpenNext Cloudflare adapter.
    return [{ source: "/fix", destination: "/app", permanent: false }];
  },
};

export default nextConfig;

// Lets `npm run dev` use Cloudflare features locally.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
