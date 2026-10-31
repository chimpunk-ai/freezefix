import type { Metadata } from "next";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Future plan preview",
  description:
    "A preview of what FreezeFix might charge for one day — and what will always be free. No price, no checkout, no subscription on this page.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Future plan preview is a static, read-once copy page. It must NEVER accidentally
// become a working checkout — payments are frozen and this page intentionally has no
// button that could be mistaken for a buy flow. Pricing lives in lib/plans.ts and is
// gated behind the paywall flow at /api/paywall; nothing here imports it.
const FREE = [
  "Get help now and the urgent safety path",
  "A basic, safe reply from Fix",
  "Key safety information",
  "Deleting your data",
  "Leaving at any time",
];

const PAID = [
  "More non-crisis sessions, under fair use",
  "Opt-in saved history and summaries of your own entries",
  "Editable plans and reminders (once notifications exist)",
  "Export",
  "Practical tools, after they have shown repeated value",
];

export default function Page() {
  return (
    <AppShell>
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Future plan preview</p>
          <h1
            className="text-[clamp(1.9rem,5.6vw,2.6rem)] leading-[1.08] text-ink"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
          >
            What might be paid one day — and what never will be.
          </h1>
          <p className="max-w-[52ch] text-base leading-relaxed text-ink-soft">
            No price, trial, checkout or subscription exists on this page. This is a preview
            for feedback. Nothing here opens a payment flow.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-[1.5rem] border border-line bg-card p-5">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Free forever</p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-ink">
              {FREE.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                  <span className="leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-[1.5rem] border border-line bg-card p-5">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Possible paid later</p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-ink">
              {PAID.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ink-faint" />
                  <span className="leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-line/80 bg-bg px-3 py-1 text-xs uppercase tracking-wider text-ink-faint">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ink-faint" />
              Not available
            </p>
          </article>
        </div>

        <p className="text-sm text-ink-soft">
          Only after it is built and privacy-reviewed. Pricing, currency, trial, cancellation,
          refunds and tax still need founder and legal review. Voice, image processing and
          adaptive memory are not part of this preview.
        </p>
      </section>
    </AppShell>
  );
}
