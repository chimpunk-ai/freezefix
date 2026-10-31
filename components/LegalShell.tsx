import Link from "next/link";
import Markdown from "@/components/Markdown";
import SiteFooter from "@/components/SiteFooter";
import type { ReactNode } from "react";

// Shell for the long-form legal pages (privacy, terms, refunds). The header mirrors
// the landing page so the whole site reads as one piece: round "f" badge in mint,
// "Fix" wordmark in Newsreader, a "Get help now" link that keeps crisis help within
// one tap of any page. The `aboveContent` slot lets a specific page (e.g. /privacy)
// prepend a classy summary panel without duplicating the whole shell.
export default function LegalShell({
  source,
  aboveContent,
}: {
  source: string;
  aboveContent?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 pb-10 pt-4">
      <header className="mb-8 flex items-center justify-between py-2">
        <Link href="/" aria-label="GetFreezeFix home" className="flex items-center gap-2.5">
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
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/help"
            className="flex min-h-[40px] items-center gap-2 rounded-full border border-frost/60 px-4 py-1.5 text-frost transition hover:border-frost hover:bg-frost/10"
          >
            Get help now
          </Link>
          <Link
            href="/"
            className="hidden min-h-[40px] items-center rounded-full bg-chip px-4 py-1.5 text-ink transition hover:bg-chip/80 sm:flex"
          >
            Back
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        {aboveContent}
        <Markdown source={source} />
      </main>
      <div className="mt-12">
        <SiteFooter />
      </div>
    </div>
  );
}
