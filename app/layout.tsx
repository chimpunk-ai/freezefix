import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";

// Fonts are downloaded at build time and served from our own domain, so no visitor data goes
// to Google (keeps us GDPR-friendly for UK/EU users).
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display-face", display: "swap", axes: ["wdth"] });
const bodyFont = Figtree({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "FreezeFix: one tiny move, under a minute",
  description: "Frozen after smoking? Get one safe next step in under 60 seconds. No lectures, no judgment. 18+.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10142a",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${bodyFont.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
