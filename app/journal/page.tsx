import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import StubScreen from "@/components/StubScreen";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "A private journal that stays on your phone. Note what happened — not what you plan — in your own words.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppShell>
      <StubScreen
        kicker="Journal · on this device only"
        title="Note what happened, not what you plan."
        description="A quiet place for after-use reflections, craving reflections, and anything else you'd like to look back on. Entries live in this browser only — never on a server, never used for ads, deletable one tap at a time."
        cta={{ href: "/app", label: "Open Fix" }}
      />
    </AppShell>
  );
}
