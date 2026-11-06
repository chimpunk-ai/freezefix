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
};

export default nextConfig;

// Lets `npm run dev` use Cloudflare features locally.
//
// Guarded on NODE_ENV: `initOpenNextCloudflareForDev()` spawns the workerd
// binary, which only ships for the Cloudflare runtime. Running it during a
// plain `next build` (Node/Docker hosting) throws
// `spawn .../workerd ENOENT` and fails the build, so it must never run there.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
