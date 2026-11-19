import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    // Content Security Policy. Conservative but matches the actual loads:
    //   - script: self + Google Fonts' stylesheet loader at fonts.googleapis.com
    //     is a stylesheet, not script. The only external script source is
    //     jsDelivr, which lib/transcribe.ts imports Whisper from at runtime.
    //     'wasm-unsafe-eval' is needed because WebAssembly.compileStreaming
    //     runs user-fetched WASM; without it, voice notes break.
    //     'unsafe-eval' is ALSO needed, separately: lib/transcribe.ts builds
    //     a bundler-proof dynamic import with `new Function("u", "return
    //     import(u)")`, and the Function constructor is gated by
    //     'unsafe-eval' no matter what string it's given — this is not the
    //     same check as 'wasm-unsafe-eval'. Without it, calling that
    //     constructor throws an EvalError. Added 19 Nov 2026 after that
    //     throw took down the whole site: the call used to happen at
    //     module load time, so any page whose bundle included
    //     lib/transcribe.ts (landing included, via a shared chunk) crashed
    //     on load, not just the voice-note flow. The module-scope call is
    //     now deferred to inside loadPipeline() (see lib/transcribe.ts), so
    //     a page that never touches voice notes won't trip this even
    //     without the directive — but recording one still needs it, so it
    //     stays. Follow-up: a nonce-based CSP would let us drop this.
    //   - style: self + inline (Tailwind inlines critical styles) + Google
    //     Fonts' CSS at fonts.googleapis.com.
    //   - font: Google Fonts' font files at fonts.gstatic.com.
    //   - img: self + data: (inline SVGs) + blob: (Export-your-log download).
    //   - connect: self + jsDelivr + Hugging Face hub (model weights for
    //     the Whisper download). Anthropic and Supabase are reached from the
    //     Worker, not from the browser — no need to list them here.
    //   - worker + manifest: self.
    //   - frame-ancestors: already covered by X-Frame-Options; repeated here
    //     for completeness in modern browsers that prefer CSP.
    //   - base-uri: self, so a hijacked <base> can't rewrite relative URLs.
    //   - form-action: self.
    //   - object-src: none.
    // 'unsafe-inline' on script-src is unavoidable today because the theme
    // bootstrap and /help fallback use inline <script> tags for before-paint
    // behaviour. A nonce-based CSP is the next step; tracked for a follow-up.
    //
    // static.cloudflareinsights.com / cloudflareinsights.com: Cloudflare's
    // own Web Analytics beacon, auto-injected at the edge for this zone —
    // nothing in this repo loads it. Without these two entries it was
    // blocked outright (console error on every single page load); added
    // 19 Nov 2026 rather than leaving Cloudflare's own first-party
    // analytics broken.
    const CSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://cdn.jsdelivr.net https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://cdn.jsdelivr.net https://huggingface.co https://*.huggingface.co https://*.hf.co https://cloudflareinsights.com",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "DENY" },
          // Microphone is self (for on-device Whisper). Everything else off.
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()" },
          // HSTS. One year, include subdomains, preload-ready. Cloudflare
          // already serves HTTPS for the apex and www; this tells the browser
          // to insist on it from now on.
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: CSP },
          // Cross-origin isolation. Fix is a first-party site; nothing of
          // ours is embedded elsewhere and nothing third-party is embedded
          // here, so same-origin / require-corp are safe.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
      // Service worker must be served with no cache so an updated sw.js
      // actually reaches the device. Cloudflare's default would hold it.
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      // Icons and the manifest can be cached for a day; they change rarely.
      // Includes favicon.ico in case a legacy agent requests it even though
      // our icon set is linked by rel="icon" in the head.
      {
        source: "/:f(manifest.webmanifest|icon.*|apple-touch-icon.*|favicon.ico)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      // Open Graph image + offline shell + any other static image in /public.
      // One hour at the edge is enough for og-image (we change it rarely);
      // the offline page is only served from the SW in practice but we cache
      // its origin fetch too for the rare case the SW hasn't installed.
      {
        source: "/:f(og-image.png|offline.html)",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
      // robots.txt and sitemap.xml: Google and other crawlers hit these
      // frequently. A 10-minute cache cuts a lot of pointless origin hits.
      {
        source: "/:f(robots.txt|sitemap.xml)",
        headers: [{ key: "Cache-Control", value: "public, max-age=600" }],
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

// Lets `npm run dev` use Cloudflare features locally. Dev only: calling this
// during a production build tries to spawn the workerd binary, which is not
// part of a plain Node deployment image.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
