import Link from "next/link";

/** The wordmark: one syllable, lowercase, nothing clever around it. */
export function Wordmark({ href = "/", label = "fix" }: { href?: string; label?: string }) {
  return (
    <Link href={href} className="inline-flex items-baseline gap-1.5 no-underline">
      <span className="font-display text-28 leading-none text-ink">{label}</span>
      <span aria-hidden className="mb-1 h-1.5 w-1.5 rounded-full bg-accent" />
    </Link>
  );
}

/**
 * The one terracotta thing in the product. It sits on every screen, including
 * the age gate, and it is never used for anything but safety.
 */
export function HelpChip({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/help"
      className="ff-chip inline-flex items-center gap-2 rounded-pill border border-frost/40 bg-frost/10 px-3 py-1.5 text-12 font-medium text-frost no-underline hover:bg-frost/15"
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-frost" />
      {compact ? "help" : "get help now"}
    </Link>
  );
}

export function QuietLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-14 text-ink-faint underline decoration-line underline-offset-4 hover:text-ink-soft">
      {children}
    </Link>
  );
}
