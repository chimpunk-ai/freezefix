import type { Metadata } from "next";
import AppClient from "@/components/AppClient";

export const metadata: Metadata = {
  title: "Tonight",
  description: "Three taps. One line back. See you Sunday.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AppClient view="log" />;
}
