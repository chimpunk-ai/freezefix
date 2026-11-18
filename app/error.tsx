"use client";

import Link from "next/link";
import { useEffect } from "react";

// Route-level error boundary. Catches any uncaught render error inside a page
// (not a layout — that's global-error.tsx). Keeps a calm surface and the
// help route reachable even when the page itself blew up.
//
// We deliberately don't surface the error message to the user: half the time
// it's a hydration race or a browser-extension injection, and showing a stack
// trace to a person who came here feeling fragile is not what they need.
// The error object is console-logged in prod so Cloudflare captures it.

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof console !== "undefined") console.error("page render error:", error);
  }, [error]);

  return (
    <main className="min-h-dvh bg-bg text-ink">
      <div className="mx-auto max-w-[640px] px-5 py-10">
        <p className="text-12 uppercase tracking-[0.18em] text-ink-faint">something broke</p>
        <h1 className="mt-2 font-display text-32 leading-tight text-ink lg:text-40">
          this page didn&rsquo;t open.
        </h1>
        <p className="mt-4 max-w-[52ch] text-16 leading-relaxed text-ink-soft">
          nothing you did. the page tried to load and something went wrong on our side. your
          log is safe on your device either way.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="ff-chip inline-flex min-h-11 items-center rounded-pill bg-signpost px-5 text-14 font-medium text-signpost-ink ff-cta-shadow hover:-translate-y-[1px]"
          >
            try again
          </button>
          <Link
            href="/"
            className="ff-chip inline-flex min-h-11 items-center rounded-pill border border-line px-4 text-14 text-ink no-underline hover:border-ink-faint"
          >
            front door
          </Link>
          <Link
            href="/help"
            className="ff-chip inline-flex min-h-11 items-center rounded-pill border border-line px-4 text-14 text-ink no-underline hover:border-ink-faint"
          >
            get help now
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-6 text-12 text-ink-faint">
            reference: <span className="font-mono">{error.digest}</span>
          </p>
        ) : null}
      </div>
    </main>
  );
}
