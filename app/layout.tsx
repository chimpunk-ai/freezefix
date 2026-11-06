import type { Metadata, Viewport } from "next";
import "./globals.css";

// Fonts are loaded from Google's CDN with <link> tags rather than next/font/google:
// Next 16's Turbopack build has an open regression with multiple weights + italic
// ("next/font/google queries have exactly one entry") that breaks the Cloudflare build.
// Inter: body. Newsreader: the few display lines.
const SITE_URL = "https://getfreezefix.com";
const DESCRIPTION =
  "A private pattern-mirror for people who smoke weed and wonder how it's sitting in their life. Three taps a night. One card on Sunday. No streaks, no lectures, no one telling you to quit.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fix — a mirror, not a quit app",
    template: "%s · Fix",
  },
  description: DESCRIPTION,
  applicationName: "Fix",
  authors: [{ name: "Fix" }],
  keywords: [
    "cannabis pattern tracker",
    "weed log",
    "harm reduction",
    "mindful cannabis use",
    "mood and sleep patterns",
    "private journal",
  ],
  category: "health",
  robots: { index: true, follow: true },
  alternates: {
    canonical: `${SITE_URL}/`,
    languages: {
      en: `${SITE_URL}/`,
      it: `${SITE_URL}/it`,
      es: `${SITE_URL}/es`,
      "x-default": `${SITE_URL}/`,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Fix",
    title: "Fix — a mirror, not a quit app",
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_GB",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fix. A mirror, not a quit app. Three taps a night, one card on Sunday.",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fix — a mirror, not a quit app",
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Fix" },
  other: { "format-detection": "telephone=no" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12100E",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
