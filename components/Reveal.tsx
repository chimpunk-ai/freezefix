"use client";

import { useEffect } from "react";

/**
 * One quiet entrance for the landing's below-the-fold sections.
 *
 * Any element with `data-reveal` fades up 10px the first time it scrolls into
 * view, once, then never moves again. Rules that keep it honest:
 *
 * - Nothing is hidden until this effect has run and marked the document
 *   `data-reveal-ready`, so the server render, a no-JS visitor and a crawler
 *   all see the full page on first paint. Motion never carries information.
 * - `prefers-reduced-motion: reduce` opts out completely: the document is
 *   never marked ready, so the hidden state never applies.
 * - Elements already in view when the observer starts are shown on the next
 *   frame, so nothing above the fold waits for a scroll.
 *
 * Renders nothing. Mount it once per page that uses `data-reveal`.
 */
export default function Reveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!els.length) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") return;

    document.documentElement.setAttribute("data-reveal-ready", "");
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          (en.target as HTMLElement).setAttribute("data-shown", "");
          io.unobserve(en.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    els.forEach((el) => io.observe(el));
    // Print and "save as PDF" don't scroll: show everything first.
    const showAll = () => els.forEach((el) => el.setAttribute("data-shown", ""));
    window.addEventListener("beforeprint", showAll);
    return () => {
      io.disconnect();
      window.removeEventListener("beforeprint", showAll);
      document.documentElement.removeAttribute("data-reveal-ready");
    };
  }, []);
  return null;
}
