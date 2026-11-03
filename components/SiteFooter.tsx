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
      {/*
        Pricing-posture line added 4 November 2026 (feat/tutorial-replaces-
        illustration) after Tom (NYC, cynical) in the 15-persona audit noted
        that lib/plans.ts carries dormant prices while the landing says
        nothing about money. His line: "either a founder decided to hide
        pricing until I'm hooked, or there's a VC deck somewhere." Stating
        it out loud removes the ambiguity. The actual numbers in lib/plans.ts
        are still dormant pricing config — this line is honest about posture,
        not a commitment to a specific price. If a paid plan launches, the
        /terms + /refunds + this line get updated together in the same PR.
      */}
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
