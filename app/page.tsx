import type { Metadata } from "next";
import Landing from "@/components/Landing";
import { paymentsOn } from "@/lib/plans";

const SITE_URL = "https://getfreezefix.com";

// The public front door. The app itself lives at /app.
export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/` },
};

export default function Page() {
  // Read on the server, where the payment secrets live, so the price copy can
  // never promise a trial that ends while nothing can be charged.
  return <Landing paymentsOn={paymentsOn()} />;
}
