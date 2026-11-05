// Website footer wording from the Legal Pack (tab 4, sections 5 and 6).
// The one line that is NOT legal wording is the "Help now" link, added so crisis help
// is reachable from every page without passing the 18+ gate, sign-up or payment.
//
// Localized 3 November 2026 (feat/de-landing, Europe-audit P1.5). Accepts a
// locale prop so the German landing page gets German footer copy. Every
// other caller renders "en" by default and sees no change.

import { LANDING_COPY, type Locale } from "@/lib/landing-copy";

type Props = {
  locale?: Locale;
};

export default function SiteFooter({ locale = "en" }: Props) {
  const copy = LANDING_COPY[locale];
  return (
    <footer className="flex flex-col gap-5 border-t border-line pt-8 text-sm text-ink-faint">
      <div className="flex items-center gap-2">
        <span className="text-sm font-extrabold tracking-tight text-ink-soft">freezefix</span>
      </div>
      <p className="max-w-[52ch] text-[0.85rem] leading-relaxed text-ink-soft">
        {copy.footerBlurb}
      </p>
      {/* Current offer is a launch waitlist; no trial or payment starts here. */}
      <p className="max-w-[52ch] text-[0.8rem] leading-relaxed text-ink-faint">
        {copy.footerPricingPosture}
      </p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {copy.footerLinks.map((l) => (
          <a key={l.href} href={l.href} className="text-ink-soft transition hover:text-ink">
            {l.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
