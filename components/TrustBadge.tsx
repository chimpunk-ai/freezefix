// The one reusable visual trust signal. A small shield + three short promises.
//
// The vision names the trust story as a competitive moat against Reframe
// (whose May 2026 breach exposed drinking answers tied to real identity) and
// Quittr (whose onboarding takes card details on day one). Repeating the
// text three times across the app in prose only buries the point. One
// consistent, visible badge on the three surfaces where the user is about
// to commit to something — the landing hero, the pricing page after the
// plan pick, and the onboarding preview — makes it a design element rather
// than fine print.
//
// Dark-first styling matches the warm-black / sage / signpost palette:
// neutral border, soft sage tint, sage check marks. No animation. Static
// text only — no claims tied to numbers that might drift.
//
// This component takes no props. If you need a different surface, compose
// the three lines yourself rather than parameterise a security claim —
// you shouldn't be able to typo your way to a wrong promise.

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckDot() {
  return (
    <span aria-hidden className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent/80" />
  );
}

export function TrustBadge() {
  return (
    <div className="rounded-card border border-accent/25 bg-accent/[0.05] px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-[2px] text-accent" aria-hidden>
          <ShieldIcon />
        </span>
        <div className="min-w-0">
          <p className="text-12 font-medium uppercase tracking-[0.14em] text-accent">
            what&rsquo;s not required
          </p>
          <ul className="mt-2 space-y-1 text-14 text-ink-soft">
            {[
              "no card to start the free week",
              "no email, no phone, no password",
              "cancel in one tap — no retention gauntlet",
            ].map((line) => (
              <li key={line} className="flex items-center gap-2">
                <CheckDot />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
