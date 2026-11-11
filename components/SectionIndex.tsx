"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/components/Markdown";

// Section index for long pages. Plain anchor links, so it works with no
// JavaScript, keyboard, screen readers and the browser's back button. The
// only script is the "which section am I in" highlight, which is cosmetic.
export default function SectionIndex({ headings, compact = false }: { headings: Heading[]; compact?: boolean }) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (compact || typeof IntersectionObserver === "undefined") return;
    const els = headings.map((h) => document.getElementById(h.id)).filter((e): e is HTMLElement => Boolean(e));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [headings, compact]);

  if (!headings.length) return null;

  if (compact) {
    return (
      <nav aria-label="sections" className="mb-8 rounded-card border border-line bg-card/70 px-4 py-3">
        <p className="text-12 text-ink-faint">on this page</p>
        <ol className="mt-2 columns-1 gap-x-6 text-14 sm:columns-2">
          {headings.map((h) => (
            <li key={h.id} className="break-inside-avoid">
              <a href={`#${h.id}`} className="inline-flex min-h-9 items-center text-ink-soft underline decoration-line underline-offset-4 hover:text-ink">
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="sections" className="ff-toc sticky top-8 text-14">
      <p className="text-12 text-ink-faint">on this page</p>
      <ol className="mt-3 space-y-1 border-l border-line">
        {headings.map((h) => {
          const active = current === h.id;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={active ? "true" : undefined}
                className={[
                  "-ml-px inline-flex min-h-9 items-center border-l py-1 pl-4 pr-2 no-underline",
                  active ? "border-signpost text-ink" : "border-transparent text-ink-faint hover:text-ink-soft",
                ].join(" ")}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
