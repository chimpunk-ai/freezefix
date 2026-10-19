import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

// Fonts are downloaded at build time and served from our own domain, so no visitor data goes
// to Google (keeps us GDPR-friendly for UK/EU users).
const bodyFont = Sora({ subsets: ["latin"], variable: "--font-body", display: "swap", weight: ["300", "400", "600", "800"] });

export const metadata: Metadata = {
  title: "FreezeFix: one tiny move, under a minute",
  description: "Frozen after smoking? Get one safe next step in under 60 seconds. No lectures, no judgment. 18+.",
  // Private beta: keep it out of search until the founder says go.
  robots: { index: false, follow: false, nocache: true },
  // Add-to-home-screen, so it sits on the phone like an app and opens straight into /app.
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "FreezeFix" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e1a16",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={bodyFont.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
