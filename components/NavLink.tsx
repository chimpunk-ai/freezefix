"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// A nav link that quietly marks itself as current when the URL matches.
// Sets aria-current="page" for assistive tech and merges activeClassName on
// top of the base className for the visual cue. Matches the full pathname
// so /plans doesn't light up on /plans/foo (if that ever exists).

export default function NavLink({
  href,
  className = "",
  activeClassName = "",
  children,
}: {
  href: string;
  className?: string;
  activeClassName?: string;
  children: ReactNode;
}) {
  const pathname = usePathname() || "";
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={active ? `${className} ${activeClassName}`.trim() : className}
    >
      {children}
    </Link>
  );
}
