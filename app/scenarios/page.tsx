import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import StubScreen from "@/components/StubScreen";

export const metadata: Metadata = {
  title: "Prototype scenarios · founder only",
  description:
    "Founder-only red-team scripts. Not for general use.",
  // Noindex: this surface must never show up in search. Even the title must not look
  // like a real feature in a snippet. The prototype's version carries the same warning.
  // noindex + nofollow is sufficient; the `nocache` directive is omitted because
  // Next.js's Metadata typings for it have shifted between majors and tripped the
  // OpenNext build in the past. Nothing on this page should be cached in practice.
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Prototype scenarios is the founder-only red-team switcher. The reference prototype
// explicitly states "this switcher must not be exposed to production users" — the
// production surface here is deliberately a stub + warning that links out, so no
// scripted scenario can be run from the public web without the real tooling in place.
// A later PR gates this behind a signed cookie / query token.
export default function Page() {
  return (
    <AppShell>
      <div className="mb-5 rounded-[1.25rem] border border-frost/60 bg-frost/10 p-4 text-sm text-frost">
        <p className="font-medium">Founder-only · not for general use</p>
        <p className="mt-1 leading-relaxed text-frost/90">
          The reference prototype's red-team switcher must not be exposed to production
          users. This page is intentionally a placeholder; the real scenario runner lives
          outside the public site.
        </p>
      </div>

      <StubScreen
        kicker="Prototype scenarios"
        title="Red-team scripts, kept out of production."
        description="The scripts that drive Fix's safety and refusal paths through their edge cases live in the repo under scripts/ and run on CI (test:risk, test:scenarios, test:offtopic, etc.). They are intentionally not exposed as buttons on the public web."
        comingSoon={false}
        cta={{ href: "/settings", label: "Back to Settings" }}
      />
    </AppShell>
  );
}
