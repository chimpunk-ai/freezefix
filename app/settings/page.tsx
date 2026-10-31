import type { Metadata } from "next";
import Link from "next/link";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Settings & more",
  description:
    "Settings, data controls, Craving SOS, Everyday tools, privacy, and the future-plan preview — one place.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Settings & more is the "More menu" from PR A's plan. Real controls (theme toggle,
// delete-everything, memory on/off) are already available INSIDE the chat flow at
// /app → settings; this page links out to them and to the ancillary stubs so the shell
// has a single discoverable place for them until a later PR extracts the controls.
const LINKS: Array<{ href: string; label: string; blurb: string; external?: boolean }> = [
  { href: "/sos", label: "Craving SOS", blurb: "A short, started-by-you pause." },
  { href: "/tools", label: "Everyday tools", blurb: "Respectful message, task unfreeze, decision pause." },
  { href: "/privacy", label: "How privacy works", blurb: "What stays on this device, and what gets sent." },
  { href: "/future-plan", label: "Future plan preview", blurb: "What might be paid one day — and what never will be." },
  { href: "/scenarios", label: "Prototype scenarios", blurb: "Founder-only test scripts. Not for general use." },
];

export default function Page() {
  return (
    <AppShell>
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Settings & more</p>
          <h1
            className="text-[clamp(1.9rem,5.6vw,2.6rem)] leading-[1.08] text-ink"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
          >
            Everything you can tune.
          </h1>
          <p className="max-w-[52ch] text-base leading-relaxed text-ink-soft">
            Theme, data, memory, and delete-everything live inside the Fix flow for now. The
            links below open the ancillary pages. A unified settings panel lands in a later
            round — nothing on this page is a placeholder for controls that already work.
          </p>
        </div>

        <ul className="flex flex-col divide-y divide-line/70 rounded-[1.5rem] border border-line bg-card">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="flex items-center justify-between gap-4 p-5 transition hover:bg-chip/40"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="text-base font-medium text-ink">{l.label}</span>
                  <span className="text-sm text-ink-soft">{l.blurb}</span>
                </span>
                <span aria-hidden="true" className="text-ink-faint">→</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 rounded-[1.5rem] border border-line bg-card p-5">
          <p className="text-sm font-medium text-ink">In-app controls (for now)</p>
          <p className="text-sm text-ink-soft">
            Theme toggle, memory on/off, delete everything on this device — open{" "}
            <Link href="/app" className="text-ink underline-offset-4 hover:underline">
              Fix
            </Link>{" "}
            and tap Settings from the home screen.
          </p>
        </div>

        <p className="text-xs text-ink-faint">
          FreezeFix is adults-only (18+) · nothing is sold or shared · crisis help is always
          free and never behind a paywall.
        </p>
      </section>
    </AppShell>
  );
}
