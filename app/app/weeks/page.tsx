import type { Metadata } from "next";
import AppClient from "@/components/AppClient";

export const metadata: Metadata = {
  title: "Your weeks",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppClient view="weeks" />;
}
