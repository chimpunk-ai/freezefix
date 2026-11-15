"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// A small "install" button in the top-right of the site header.
//
// How it works per platform:
//   - Android (Chrome, Edge, etc): catches `beforeinstallprompt`, tap shows
//     the browser's own install sheet directly. No separate instruction page.
//   - iPhone / iPad Safari: iOS doesn't fire beforeinstallprompt. The button
//     opens a tiny popover with the Share → Add to Home Screen steps inline,
//     so people don't need to leave the page.
//   - Already installed (standalone display mode): the button hides.
//   - Desktop browsers that don't signal install either way: the button
//     stays visible as a link to the full /install guide. Harmless on a
//     laptop, and useful for people reading on their laptop before installing
//     on a phone.

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "android" | "ios" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  const iOS =
    /iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (iOS) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const mm = window.matchMedia("(display-mode: standalone)").matches;
    const ios = (navigator as unknown as { standalone?: boolean }).standalone === true;
    return mm || ios;
  } catch {
    return false;
  }
}

export default function HeaderInstallButton() {
  const [platform, setPlatform] = useState<Platform>("other");
  const [bip, setBip] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());

    const onBip = (e: Event) => {
      e.preventDefault();
      setBip(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setBip(null);
      setOpen(false);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (installed) return null;

  const label = "install";

  // Android with a captured install event → trigger it directly, no popover.
  if (platform === "android" && bip) {
    return (
      <button
        type="button"
        onClick={async () => {
          try {
            await bip.prompt();
            const { outcome } = await bip.userChoice;
            if (outcome === "accepted") setBip(null);
          } catch {
            /* user cancelled or browser blocked; nothing to do */
          }
        }}
        className="ff-chip inline-flex min-h-9 items-center rounded-pill bg-signpost px-3 text-13 font-medium text-signpost-ink no-underline ff-cta-shadow transition-transform hover:-translate-y-[1px]"
      >
        {label}
      </button>
    );
  }

  // iOS → open a small popover with the Share → Add to Home Screen steps.
  if (platform === "ios") {
    return (
      <div className="relative" ref={popRef}>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen((o) => !o)}
          className="ff-chip inline-flex min-h-9 items-center rounded-pill bg-signpost px-3 text-13 font-medium text-signpost-ink no-underline ff-cta-shadow transition-transform hover:-translate-y-[1px]"
        >
          {label}
        </button>
        {open ? (
          <div
            role="dialog"
            aria-label="install on iPhone"
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[300px] rounded-sheet border border-line bg-card p-4 text-13 text-ink-soft shadow-lg"
          >
            <p className="font-display text-16 text-ink">add fix to your home screen</p>
            <ol className="mt-3 space-y-2 text-ink-soft">
              <li>
                1. tap the share button in safari
                <span aria-hidden className="ml-1 inline-block text-ink-faint">(the square with an arrow)</span>
              </li>
              <li>2. scroll and tap &ldquo;add to home screen&rdquo;</li>
              <li>3. tap add. the icon lands on your home screen.</li>
            </ol>
            <p className="mt-3 text-12 text-ink-faint">
              only safari can do this on iPhone. chrome on iPhone uses safari underneath but can&rsquo;t install.{" "}
              <Link href="/install" className="text-ink-soft underline decoration-line underline-offset-4 hover:text-ink">
                full guide
              </Link>
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  // Android before the event has fired yet, or any desktop browser → link to
  // the full /install guide. Cheap and always works.
  return (
    <Link
      href="/install"
      className="ff-chip inline-flex min-h-9 items-center rounded-pill bg-signpost px-3 text-13 font-medium text-signpost-ink no-underline ff-cta-shadow transition-transform hover:-translate-y-[1px]"
    >
      {label}
    </Link>
  );
}
