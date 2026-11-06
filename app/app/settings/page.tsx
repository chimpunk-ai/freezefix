import type { Metadata } from "next";
import AppClient from "@/components/AppClient";

export const metadata: Metadata = {
  title: "You",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppClient view="settings" />;
}
