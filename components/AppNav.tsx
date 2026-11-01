"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Persistent bottom tab bar for the in-app surfaces (Home · Journal · Fix · Insights · Plan).
// Mirrors the reference prototype's shape so the whole app reads as one piece.
//
// All SVG icons use proper React camelCase attribute names (strokeWidth, strokeLinecap,
// strokeLinejoin) rather than a lowercase props object spread via {...stroke}. Turbopack
// in Next 16 rejects the lowercase form during build even though tsc accepts it.

type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** The large, highlighted center tab. The prototype treats "Fix" as the hero. */
  hero?: boolean;
  /** The exact pathname match activates the tab; subpaths activate too (startsWith). */
  match?: (pathname: string) => boolean;
};

const ITEMS: Item[] = [
  {
    href: "/home",
    label: "Home",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    href: "/journal",
    label: "Journal",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z" />
        <path d="M5 17a3 3 0 0 1 3-3h11" />
      </svg>
    ),
  },
  {
    // Fix tab lands on the situation picker at /fix; each chip there routes to the
    // real surface for that situation (/app for chat, /sos for cravings, /plans for
    // "I want to make a small change"). The tab stays active on /app too so the
    // nav still highlights Fix when a user is deep in the chat.
    href: "/fix",
    label: "Fix",
    hero: true,
    match: (p) => p.startsWith("/fix") || p.startsWith("/app"),
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4L12 3z" />
        <path d="M18 16l.9 2.2L21 19l-2.1.8L18 22l-.9-2.2L15 19l2.1-.8L18 16z" />
      </svg>
    ),
  },
  {
    href: "/patterns",
    label: "Insights",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 18V7" />
        <path d="M10 18V11" />
        <path d="M16 18V9" />
        <path d="M4 18h18" />
      </svg>
    ),
  },
  {
    href: "/plans",
    label: "Plan",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="6" width="16" height="14" rx="2.5" />
        <path d="M4 10h16" />
        <path d="M9 4v3M15 4v3" />
      </svg>
    ),
  },
];

function isActive(item: Item, pathname: string): boolean {
  if (item.match) return item.match(pathname);
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function AppNav() {
  const pathname = usePathname() || "/";
  return (
    <nav
      aria-label="App navigation"
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-bg/85 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md items-end justify-between px-4 pt-2">
        {ITEMS.map((item) => {
          const active = isActive(item, pathname);
          if (item.hero) {
            return (
              <li key={item.href} className="relative -mt-6 flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full shadow-[0_10px_28px_-10px_rgba(175,215,182,0.55)] transition active:scale-[0.96] ${
                    active ? "bg-accent text-accent-ink" : "bg-chip text-ink"
                  }`}
                >
                  {item.icon}
                </Link>
                <span
                  className={`mt-1 block text-center text-[11px] ${
                    active ? "text-ink" : "text-ink-faint"
                  }`}
                >
                  {item.label}
                </span>
              </li>
            );
          }
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[52px] flex-col items-center justify-center gap-1 py-1 transition ${
                  active ? "text-ink" : "text-ink-faint hover:text-ink-soft"
                }`}
              >
                {item.icon}
                <span className="text-[11px] leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
