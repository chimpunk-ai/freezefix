import type { Metadata } from "next";
import Landing from "@/components/Landing";

const SITE_URL = "https://getfreezefix.com";

// The public front door. The app itself lives at /app.
export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/` },
};

export default function Page() {
  return <Landing />;
}
