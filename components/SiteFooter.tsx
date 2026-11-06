// Footer. Legal links, the free help page, and nothing that sells.

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="flex flex-col gap-4 border-t border-line pt-8 text-12 text-ink-faint">
      <Link href="/" className="inline-flex items-baseline gap-1.5 no-underline">
        <span className="font-display text-20 leading-none text-ink">fix</span>
        <span aria-hidden className="mb-1 h-1.5 w-1.5 rounded-full bg-accent" />
      </Link>
      <p className="max-w-[52ch] leading-relaxed">
        a private pattern-mirror for people who smoke and wonder. everything you write stays on your
        phone. no account, no email, nothing on our side to look up.
      </p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link href="/help" className="text-frost underline decoration-frost/40 underline-offset-4">
          get help now
        </Link>
        <Link href="/plans" className="hover:text-ink-soft">
          pricing
        </Link>
        <Link href="/privacy" className="hover:text-ink-soft">
          privacy
        </Link>
        <Link href="/terms" className="hover:text-ink-soft">
          terms
        </Link>
        <Link href="/refunds" className="hover:text-ink-soft">
          refunds
        </Link>
      </div>
    </footer>
  );
}
