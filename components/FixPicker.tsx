"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";

// /fix — the situation picker. The prototype's /fix had a "Sample / Live AI" toggle
// over a chat; here, Live AI is wired in production (lib/ai.ts) so there is no sample
// mode to switch to. A quiet banner acknowledges Fix is AI and can be wrong.
//
// Each chip routes to a surface that already works today:
//   • Craving goes to /sos — a timed pause, four options, no AI call needed.
//   • The other six open the real chat at /app with a scenario deep-link where one
//     fits, so the first reply lands in the right place. No chat UI is duplicated.

type Chip = {
  label: string;
  /** Where the chip takes you. Each is a real surface already in production. */
  href: string;
  /** Short line beside the label so people choose with intent. */
  hint?: string;
};

// /app reads a scenario via the ?s=<id> query (components/FreezeFixApp.tsx), where <id>
// is a value from lib/scenarios.ts. Chips below use that param — do not change it to
// ?scenario= without updating the chat flow.
const CHIPS: Chip[] = [
  {
    label: "I feel unsettled after smoking",
    href: "/app?s=overwhelmed",
    hint: "Everything feels a bit too much — Fix starts there.",
  },
  {
    label: "I'm having a craving",
    href: "/sos",
    hint: "Opens Craving SOS — a short, started-by-you pause.",
  },
  {
    label: "I used more than I meant to",
    href: "/app?s=talk",
    hint: "Open chat. No judgement; one small next step.",
  },
  {
    label: "I'm overthinking a conversation",
    href: "/app?s=loop",
    hint: "The replay loop — Fix meets it where it is.",
  },
  {
    label: "I can't start a task",
    href: "/app?s=start",
    hint: "A tiny way in. Nothing dramatic.",
  },
  {
    label: "I want to make a small change",
    href: "/plans",
    hint: "Opens Plan — one tiny if–then for tomorrow.",
  },
  {
    label: "Something else",
    href: "/app",
    hint: "Open chat with no scenario — tell Fix in your own words.",
  },
];

export default function FixPicker() {
  return (
    <AppShell>
      <section className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Fix · what's happening?</p>
        <h1
          className="text-[clamp(1.9rem,5.6vw,2.6rem)] leading-tight text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
        >
          Pick what fits — Fix meets you there.
        </h1>
        <p className="max-w-[52ch] text-base leading-relaxed text-ink-soft">
          Fix is an AI tool. It can be wrong, and it is not a person, therapist, doctor or
          emergency service. For urgent help, use Get help now at the top of every page.
        </p>
      </section>

      {/* Chips — each routes to a real surface. */}
      <section className="mt-5 flex flex-col gap-3">
        {CHIPS.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group flex items-start gap-3 rounded-[1.25rem] border border-line bg-card p-4 transition hover:border-ink-soft active:scale-[0.99]"
          >
            <span aria-hidden="true" className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-chip text-ink-soft">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-base font-medium text-ink">{c.label}</span>
              {c.hint && <span className="text-xs leading-relaxed text-ink-soft">{c.hint}</span>}
            </span>
          </Link>
        ))}
      </section>

      {/* Quiet trust strip at the bottom — mirrors the honest banners the prototype used
          over its Sample / Live-AI toggle. */}
      <section className="mt-6 rounded-[1.25rem] border border-line/70 bg-card/60 p-4 text-xs leading-relaxed text-ink-soft">
        <p>
          Live AI · nothing you type is sold, used for ads, or kept by FreezeFix. Messages are
          sent to the AI provider only to generate a reply. See{" "}
          <Link href="/privacy" className="text-ink underline-offset-4 hover:underline">
            how privacy works
          </Link>
          .
        </p>
      </section>
    </AppShell>
  );
}
