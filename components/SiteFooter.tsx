// Footer. Legal links, the free help page, and nothing that sells.
// Two columns from md: the promise on the left, the links on the right.

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS = [
  { href: "/plans", label: "what it costs" },
  { href: "/myths", label: "myths & reality" },
  { href: "/privacy", label: "privacy" },
  { href: "/terms", label: "terms" },
  { href: "/refunds", label: "refunds" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line pt-8 text-12 text-ink-faint">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start md:gap-12">
        <div>
          <Link href="/" className="inline-flex items-baseline gap-1.5 no-underline">
            <span className="font-display text-20 leading-none text-ink">fix</span>
            <span aria-hidden className="mb-1 h-1.5 w-1.5 rounded-full bg-accent" />
          </Link>
          <p className="mt-3 max-w-[52ch] text-14 leading-relaxed text-ink-soft">
            a private pattern-mirror for people who smoke and wonder. everything you write stays on
            your phone. no account, no email, nothing on our side to look up.
          </p>
          <p className="mt-4">fix · 18+ · made for adults who smoke and wonder</p>
          <ThemeToggle compact className="mt-5" />
        </div>
        <nav aria-label="footer" className="flex flex-wrap items-center gap-x-5 gap-y-3 md:flex-col md:items-end md:gap-y-2">
          <Link
            href="/help"
            className="inline-flex min-h-11 items-center rounded-pill border border-frost/40 bg-frost/[0.08] px-3 text-12 font-medium text-frost no-underline hover:bg-frost/[0.12]"
          >
            get help now
          </Link>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="inline-flex min-h-11 items-center hover:text-ink-soft md:min-h-0">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
