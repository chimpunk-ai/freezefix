import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

// Fonts are downloaded at build time and served from our own domain, so no visitor data goes
// to Google (keeps us GDPR-friendly for UK/EU users).
const bodyFont = Sora({ subsets: ["latin"], variable: "--font-body", display: "swap", weight: ["300", "400", "600", "800"] });

export const metadata: Metadata = {
  title: "FreezeFix: one tiny move, under a minute",
  description: "Frozen after smoking? Get one safe next step in under 60 seconds. No lectures, no judgment. 18+.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1033",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={bodyFont.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
