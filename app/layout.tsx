import type { Metadata, Viewport } from "next";
import "./globals.css";

// Fonts are loaded via Google's CDN with <link> tags in the head below rather
// than next/font/google. Reason: Next.js 16's default Turbopack build has an
// open regression with next/font/google when multiple weights + italic are
// requested ("next/font/google queries have exactly one entry"), which breaks
// the Cloudflare Workers production build. The CDN approach is a short-term
// unblocker; when the upstream fix lands we can move back to next/font/google
// and self-hosted font files. preconnect keeps the perf cost tiny.
//
// Body: Plus Jakarta Sans — clean, humanist sans, matches reference prototype.
// Display: Newsreader — elegant Google-licensed serif for headlines.

const SITE_URL = "https://getfreezefix.com";
const DESCRIPTION =
  "FreezeFix is the mate for when a smoke leaves you frozen — too self-conscious to be in the room, stuck on a task, can't reply, can't start. One safe next step in under 60 seconds. No lectures, no judgment. Adults 18+. Crisis help is always free.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FreezeFix — the mate for when a smoke leaves you frozen",
    template: "%s · FreezeFix",
  },
  description: DESCRIPTION,
  applicationName: "FreezeFix",
  authors: [{ name: "FreezeFix" }],
  // A short keyword list helps older crawlers and some chat-link previews pick a sensible category.
  // Deliberately avoids anything that could be read as encouraging use.
  keywords: [
    "anxiety support",
    "overthinking help",
    "task avoidance",
    "paranoia support",
    "self-care for adults",
    "mental health support app",
    "harm-reduction support",
    "stuck replying",
    "AI mate",
    "18+ wellbeing",
  ],
  category: "health",
  // Now that the web beta is live, allow search engines to index the public pages. The /app
  // and /help routes keep working either way. If a page needs to stay unlisted it can set its
  // own `robots: { index: false }` in its own metadata.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    siteName: "FreezeFix",
    title: "FreezeFix — the mate for when a smoke leaves you frozen",
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_GB",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FreezeFix — the mate for when a smoke leaves you frozen. One safe next step in under 60 seconds.",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FreezeFix — the mate for when a smoke leaves you frozen",
    description: DESCRIPTION,
    site: "@getfreezefix",
    creator: "@getfreezefix",
    images: ["/og-image.png"],
  },
  // Add-to-home-screen, so it sits on the phone like an app and opens straight into /app.
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "FreezeFix" },
  // Help search engines verify the publisher without needing a second site. 'Organization'
  // (not a MedicalBusiness or HealthClinic) because FreezeFix is a software product, not a
  // clinical service — same wording as the Terms "FreezeFix is not therapy, medical advice
  // or an emergency service".
  other: {
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Both dark and light theme-color values so the browser chrome adapts.
  // The inline script below picks the right one before first paint.
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0F1F1A" },   /* Grove deep green */
    { media: "(prefers-color-scheme: light)", color: "#F4F8F5" },  /* Grove cream */
  ],
  viewportFit: "cover",
};

// Minimal, honest structured data. No invented stats, no ratings, no "proven to work",
// no fake founder bio. Just: who publishes it, what it is, how it is accessed.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#org`,
      name: "FreezeFix",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      email: "hello@getfreezefix.com",
      sameAs: [SITE_URL],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#site`,
      url: SITE_URL,
      name: "FreezeFix",
      inLanguage: "en-GB",
      publisher: { "@id": `${SITE_URL}#org` },
    },
    {
      "@type": "SoftwareApplication",
      name: "FreezeFix",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web, iOS add-to-home-screen",
      description: DESCRIPTION,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}#org` },
      // Deliberately omitting offers / aggregateRating. We will not display a star rating
      // we do not have, and payment copy is handled separately from this metadata.
      audience: {
        "@type": "PeopleAudience",
        suggestedMinAge: 18,
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts: Plus Jakarta Sans (body) + Newsreader (serif).
            See the comment at the top of this file for why we use the CDN here.
            preconnect to both hosts first so DNS + TLS happen alongside HTML parse. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Newsreader:ital,wght@0,300..500;1,300..500&display=swap"
        />
        {/* Prevent flash of wrong theme: read localStorage before first paint.
            Sets data-theme on <html> and updates the theme-color meta tag. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("ff_theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="light"?"#F4F8F5":"#0F1F1A")}}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
