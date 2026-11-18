// Server-rendered emergency block for /help. Always in the initial HTML so a
// person in crisis sees working phone numbers even if JavaScript never runs
// (patchy 3G, battery saver, hostile proxy, VoiceOver before hydration).
//
// Three tiers, in order of urgency:
//   1. Right now — emergency numbers (112 globally, plus UK/US/Canada/India
//      regional emergency numbers; these are universal enough to serve a reader
//      whose country we don't yet know).
//   2. Talk to someone 24/7 — country-agnostic suicide / crisis lines with a
//      note on the region-picker below.
//   3. Ready to talk, not in crisis — the non-crisis tier the addiction
//      medicine audit flagged as missing: SAMHSA (US), SMART Recovery (global),
//      Talk to Frank (UK). This is the "mirror → therapist" rung the site
//      didn't have.
//
// Also surfaces a worried-about-someone-else fast-path (teen caregiver audit
// found no path for a child of a substance user), and the parent/guardian
// mailbox for under-18 removals (mum audit).
//
// This block collapses to a muted panel when JavaScript hydrates and the
// client HelpPage below takes over (via the `js-hide` class driven by a tiny
// inline script in the header). The hiding is purely cosmetic so the richer
// client experience owns the primary visual real estate once it's live.

import Link from "next/link";

const HIDE_WHEN_HYDRATED_SCRIPT =
  "document.documentElement.classList.add('js');";

type Line = { label: string; display: string; href: string; note?: string };

const EMERGENCY: Line[] = [
  { label: "Europe & India", display: "112", href: "tel:112", note: "works everywhere in the EU, UK and India" },
  { label: "United States & Canada", display: "911", href: "tel:911" },
  { label: "United Kingdom", display: "999", href: "tel:999" },
  { label: "Australia", display: "000", href: "tel:000" },
];

const CRISIS: Line[] = [
  { label: "988 Suicide & Crisis Lifeline (US & Canada)", display: "988", href: "tel:988", note: "24/7, free" },
  { label: "Samaritans (UK & Ireland)", display: "116 123", href: "tel:116123", note: "24/7, free from any phone" },
  { label: "iCall (India)", display: "+91 9152987821", href: "tel:+919152987821", note: "Mon-Sat 8am-10pm, free" },
  { label: "Lifeline (Australia)", display: "13 11 14", href: "tel:131114", note: "24/7, free" },
];

const NON_CRISIS: Line[] = [
  { label: "SAMHSA National Helpline (US)", display: "1-800-662-4357", href: "tel:18006624357", note: "24/7 referrals for substance use" },
  { label: "SMART Recovery (global, online meetings)", display: "smartrecovery.org", href: "https://www.smartrecovery.org/" },
  { label: "Talk to Frank (UK)", display: "0300 123 6600", href: "tel:03001236600", note: "24/7, drug questions, may show on your bill" },
  { label: "MotherToBaby (US, pregnancy & meds)", display: "1-866-626-6847", href: "tel:18666266847", note: "Mon-Fri 8am-5pm PT, free" },
];

const FAMILY: Line[] = [
  { label: "Al-Anon / Alateen (family of substance users)", display: "al-anon.org", href: "https://al-anon.org/" },
  { label: "NACoA (US, children of substance users)", display: "1-888-554-2627", href: "tel:18885542627" },
  { label: "Childhelp (US, child welfare)", display: "1-800-422-4453", href: "tel:18004224453", note: "24/7, free" },
];

function LineGroup({ title, note, lines }: { title: string; note?: string; lines: Line[] }) {
  return (
    <div className="mt-6 first:mt-0">
      <h2 className="font-display text-18 text-ink lg:text-20">{title}</h2>
      {note ? <p className="mt-1 text-13 text-ink-soft">{note}</p> : null}
      <ul className="mt-3 flex flex-col divide-y divide-line">
        {lines.map((l) => (
          <li key={l.label} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0 text-14 text-ink">
              <div className="truncate">{l.label}</div>
              {l.note ? <div className="mt-0.5 text-12 text-ink-faint">{l.note}</div> : null}
            </div>
            <a
              href={l.href}
              className="shrink-0 rounded-pill border border-line bg-card px-3 py-1.5 text-13 font-medium text-ink no-underline hover:border-ink-faint"
            >
              {l.display}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HelpFallback() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: HIDE_WHEN_HYDRATED_SCRIPT }} />
      <noscript>
        <style>{`[data-help-fallback]{display:block !important;}`}</style>
      </noscript>
      <div
        data-help-fallback
        className="mx-auto max-w-[720px] px-5 py-6 lg:py-10"
      >
        <div className="rounded-sheet border border-line bg-card/70 p-5 lg:p-7">
          <p className="text-12 uppercase tracking-[0.18em] text-signpost">help now</p>
          <h1 className="mt-2 font-display text-28 leading-tight text-ink lg:text-36">
            if you&rsquo;re in crisis, call someone now.
          </h1>
          <p className="mt-3 max-w-[58ch] text-14 text-ink-soft lg:text-16">
            every number here is free to call and goes to a real person. fix has no account and
            keeps no copy of this page view. the full help page with your country&rsquo;s own lines
            loads just below.
          </p>

          <LineGroup
            title="Right now, if you&rsquo;re in immediate danger"
            lines={EMERGENCY}
          />
          <LineGroup
            title="Talk to someone, 24/7"
            note="These are the biggest English-speaking crisis lines. The region picker below has more."
            lines={CRISIS}
          />
          <LineGroup
            title="Ready to talk about use, but not in crisis"
            note="Substance-use helplines, referral services and recovery groups."
            lines={NON_CRISIS}
          />
          <LineGroup
            title="Worried about someone else"
            note={"A friend, partner, child or parent. Also use these if you grew up around substance use."}
            lines={FAMILY}
          />

          <p className="mt-6 text-12 text-ink-faint">
            parent or guardian removing a minor&rsquo;s log: email{" "}
            <a href="mailto:hello@getfreezefix.com?subject=under-18" className="text-ink-soft underline decoration-line underline-offset-4 hover:text-ink">
              hello@getfreezefix.com
            </a>
            {" "}with &ldquo;under-18&rdquo; in the subject.{" "}
            <Link href="/" className="text-ink-soft underline decoration-line underline-offset-4 hover:text-ink">
              back to fix
            </Link>
          </p>
        </div>
      </div>
      {/* When JavaScript hydrates, the client HelpPage takes over and this block
          hides itself to avoid duplication. The class name is added by the
          inline script above; the CSS rule lives in app/globals.css. */}
    </>
  );
}
