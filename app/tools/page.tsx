import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import StubScreen from "@/components/StubScreen";

export const metadata: Metadata = {
  title: "Everyday tools",
  description:
    "Small help for real moments: a respectful message, a first step on a task, or a calm look at two options. Nothing is sent anywhere.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppShell>
      <StubScreen
        kicker="Everyday tools"
        title="Small help for real moments."
        description="A respectful message, a first step on a task, a calm look at two options. The tools are being built one at a time; nothing on this page is wired up yet. When they land, nothing you type or draft here is sent anywhere."
        cta={{ href: "/app", label: "Open Fix" }}
      />
    </AppShell>
  );
}
