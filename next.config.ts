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
  // Surfaces retired when the product was rebuilt around the log, the mirror and
  // the goal. Old links keep working: the help page and the front door survive.
  async redirects() {
    return [
      { source: "/sos", destination: "/help", permanent: false },
      {
        source: "/:path(de|fr|nl|home|journal|patterns|program|scenarios|settings|tools|fix|greened-out|too-high-what-to-do|zu-high-was-tun|future-plan)",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

// Lets `npm run dev` use Cloudflare features locally.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
