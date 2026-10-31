"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import AppNav from "@/components/AppNav";

/**
 * Shared layout for the in-app surfaces (Home · Journal · Insights · Plan and the
 * ancillary pages that live in Settings: SOS, Tools, Future plan preview, Scenarios).
 *
 * Not used by /app yet — the current /app is a self-contained React state machine with
 * its own header and will be wrapped under this shell in a later PR, after its screens
 * have been split up.
 *
 * The shell is deliberately quiet:
 * - Fix wordmark on the left (same badge + Newsreader as the landing)
 * - "Get help now" terracotta pill on the right (one tap from every page, by design)
 * - Settings cog next to it, routing to /settings
 * - A bottom tab bar (AppNav) that is the main navigation on the in-app surfaces
 *
 * `showNav` can be set false by a page that wants the shell's header but not the tab
 * bar (useful for a modal-like page such as /sos). `wide` opts into a wider content
 * column; the default is 32rem to match the chat width.
 */
export default function AppShell({
  children,
  showNav = true,
  wide = false,
}: {
  children: ReactNode;
  showNav?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={`mx-auto flex min-h-dvh w-full flex-col px-5 pt-4 ${
        showNav ? "pb-28" : "pb-10"
      } ${wide ? "max-w-3xl" : "max-w-md"}`}
    >
      <header className="mb-6 flex items-center justify-between py-1">
        <Link href="/home" aria-label="GetFreezeFix home" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-serif text-lg italic text-accent-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            f
          </span>
          <span className="font-serif text-xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
            Fix
          </span>
        </Link>
        <nav aria-label="Quick help and settings" className="flex items-center gap-2">
          <Link
            href="/help"
            className="flex min-h-[40px] items-center gap-2 rounded-full border border-frost/60 px-3.5 py-1.5 text-sm text-frost transition hover:border-frost hover:bg-frost/10"
            aria-label="Get help now"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
            </svg>
            Get help now
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line/60 text-ink-soft transition hover:border-line hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      {showNav && <AppNav />}
    </div>
  );
}
