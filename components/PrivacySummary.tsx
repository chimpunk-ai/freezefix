// A classy, honest at-a-glance summary that sits above the full Privacy Policy on /privacy.
// Reads as "the one-page map" that the Emergent reference prototype offered, while keeping
// the full legal policy intact underneath. Nothing on this card is a replacement for the
// policy — the policy wins on anything that disagrees, and the Setup & Legal review still
// owns the policy copy.
export default function PrivacySummary() {
  return (
    <section
      aria-labelledby="privacy-summary-heading"
      className="mb-10 rounded-[1.5rem] border border-line bg-card p-6 shadow-[0_14px_32px_-24px_rgba(175,215,182,0.35)]"
    >
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">At a glance</p>
      <h2
        id="privacy-summary-heading"
        className="mt-2 font-serif text-2xl text-ink"
        style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
      >
        What stays on this device, and what gets sent.
      </h2>
      <p className="mt-3 max-w-[55ch] text-sm leading-relaxed text-ink-soft">
        A plain-language map of how data actually moves. The full policy below is the
        authoritative version; this card is here so you can tell at a glance.
      </p>
      <ul className="mt-5 flex flex-col divide-y divide-line/70">
        <Row
          what="Chat messages"
          where="Sent to the AI provider to generate a reply."
          detail="Not stored by FreezeFix. The provider's own retention is covered in the policy below."
        />
        <Row
          what="Wins log, moments, scenario history"
          where="This browser's local storage."
          detail="Never uploaded. Delete one from the Wins screen, or clear everything in Settings."
        />
        <Row
          what="Patterns page"
          where="Computed on this device, from the data above."
          detail="Nothing new is written and nothing is sent anywhere when you open it."
        />
        <Row
          what="Theme, name, onboarding answers"
          where="This browser's local storage."
          detail="Used only to greet you and keep the look you picked."
        />
        <Row
          what="Anonymous counts"
          where="A privacy-first database in the EU."
          detail="Risk level, country code, timestamps and whether a move helped — never the words you wrote."
        />
        <Row
          what="Daily rate limits"
          where="A hashed, salted device cookie and IP."
          detail="Rows are deleted after two days. No raw identifiers are stored."
        />
        <Row
          what="Payments (when enabled)"
          where="Our payment provider (merchant of record)."
          detail="FreezeFix never sees your full card number. Receipts and VAT are the provider's."
        />
        <Row
          what="Voice & photos (when enabled)"
          where="Processed to generate a reply, then discarded."
          detail="Not stored by FreezeFix. The provider's lifecycle is in the policy below."
        />
      </ul>
      <p className="mt-5 text-xs leading-relaxed text-ink-faint">
        FreezeFix is adults-only (18+) and does not sell data, run ads, or share with anyone
        outside the vendors named in the policy. Crisis help is always free and never behind
        a paywall.
      </p>
    </section>
  );
}

function Row({ what, where, detail }: { what: string; where: string; detail: string }) {
  return (
    <li className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[1fr_1.4fr] sm:gap-6">
      <div>
        <p className="text-sm font-semibold text-ink">{what}</p>
        <p className="text-sm text-ink-soft">{where}</p>
      </div>
      <p className="text-sm leading-relaxed text-ink-soft">{detail}</p>
    </li>
  );
}
