import type { Metadata } from "next";
import SettingsHub from "@/components/SettingsHub";

export const metadata: Metadata = {
  title: "Settings & more",
  description:
    "Theme, data, memory, delete-everything, and the ancillary pages (Craving SOS, Everyday tools, privacy, future-plan preview) — one place.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <SettingsHub />;
}
