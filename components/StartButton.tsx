"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// The landing page's "start" CTA, asked for (Nov 2026) to feel "like a game
// is about to start" when pressed — not a loading spinner, not a delay
// before the app opens, just a quick charge-up flourish (a light sweep +
// a brightness pulse, ~380ms) before the real navigation fires. It's still
// an <a href> under the hood (SSR'd by next/link, so middle-click, cmd/
// ctrl-click, no-JS and crawlers all still get a plain working link — this
// only intercepts a plain left click), and it respects
// prefers-reduced-motion by skipping the flourish and navigating at once,
// the same restraint as every other one-shot animation in globals.css
// (ff-rise, ff-companion-rise, ff-pulse).
//
// Kept under half a second on purpose: the founder's own target is "using
// it within a minute," so this is a flourish on top of instant navigation,
// never a gate in front of it.
const CHARGE_MS = 380;

export default function StartButton({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [charging, setCharging] = useState(false);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let the browser handle anything that isn't a plain left-click-to-navigate
    // (new tab, new window, "open in background", etc.) exactly as a normal link would.
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (charging) {
      e.preventDefault();
      return;
    }
    const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return; // plain Link navigation, no flourish, no delay
    e.preventDefault();
    setCharging(true);
    window.setTimeout(() => router.push(href), CHARGE_MS);
  };

  return (
    <Link href={href} onClick={onClick} data-charging={charging || undefined} className={`ff-charge ${className}`}>
      {children}
    </Link>
  );
}
