import Link from "next/link";
import type { ReactNode } from "react";
import { HelpChip, Wordmark } from "@/components/Brand";

// Layout primitives shared by every public route, so the site reads as one
// piece at every width. Three measures and nothing else:
//   app  560px — the log, the mirror, settings (a phone-shaped ritual)
//   read 680px — legal body copy (~70ch)
//   site 1120px — landing, plans, help, composed on desktop
// Gutters grow with the viewport: 20 / 32 / 40px.

export type Measure = "app" | "read" | "site";

const MEASURE: Record<Measure, string> = {
  app: "max-w-app",
  read: "max-w-read",
  site: "max-w-site",
};

export function Container({
  measure = "site",
  className = "",
  children,
}: {
  measure?: Measure;
  className?: string;
  children: ReactNode;
}) {
  return <div className={`mx-auto w-full px-5 sm:px-8 lg:px-10 ${MEASURE[measure]} ${className}`.trim()}>{children}</div>;
}

/** The first focusable element on every route. See .ff-skip in globals.css. */
export function SkipLink() {
  return (
    <a href="#main" className="ff-skip">
      skip to main content
    </a>
  );
}

/** The landmark the skip link jumps to. Every route has exactly one. */
export function Main({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className={`outline-none ${className}`.trim()}>
      {children}
    </main>
  );
}

type NavItem = { href: string; label: string };

const PUBLIC_NAV: NavItem[] = [
  { href: "/plans", label: "what it costs" },
  { href: "/privacy", label: "privacy" },
];

/**
 * One header for the public routes. Wordmark left; quiet links and the one
 * terracotta help chip right. Not sticky: a sticky bar on a phone steals the
 * line of text a tired reader is on, and nothing here is urgent enough to
 * follow them down the page except the help chip, which every page repeats
 * in its footer.
 */
export function SiteHeader({
  measure = "site",
  nav = PUBLIC_NAV,
  cta,
}: {
  measure?: Measure;
  nav?: NavItem[];
  /** Optional primary action on the right (e.g. "open the app"). */
  cta?: NavItem;
}) {
  return (
    <header className="w-full">
      <Container measure={measure} className="flex items-center justify-between gap-4 py-5">
        <Wordmark />
        <nav aria-label="site" className="flex items-center gap-2 sm:gap-4">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="hidden min-h-11 items-center px-1 text-14 text-ink-faint no-underline hover:text-ink sm:inline-flex"
            >
              {n.label}
            </Link>
          ))}
          {cta ? (
            <Link
              href={cta.href}
              className="hidden min-h-11 items-center rounded-pill border border-line px-4 text-14 text-ink no-underline hover:border-ink-faint md:inline-flex"
            >
              {cta.label}
            </Link>
          ) : null}
          <HelpChip compact />
        </nav>
      </Container>
    </header>
  );
}

/** Small sage line above a section heading. Lowercase, like everything else here. */
export function Kicker({ children, tone = "signpost" }: { children: ReactNode; tone?: "signpost" | "faint" }) {
  return (
    <p className={`text-14 ${tone === "signpost" ? "text-signpost" : "text-ink-faint"}`}>{children}</p>
  );
}
