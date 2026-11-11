// The at-a-glance map that sits above the full Privacy Policy on /privacy.
//
// Every row here is read from the code, not from the brief. If a data flow
// changes in lib/entry.ts, lib/pattern.ts, app/api/fix/route.ts,
// app/api/transcribe/route.ts or lib/quota.ts, this card changes with it.
// scripts/test-legal.ts checks that it never names a feature that no longer
// ships. The full policy underneath wins on anything that disagrees.
export default function PrivacySummary() {
  return (
    <section
      aria-labelledby="privacy-summary-heading"
      className="mb-10 rounded-sheet border border-line bg-card p-5 sm:p-6"
    >
      <p className="text-12 uppercase tracking-[0.18em] text-signpost">at a glance</p>
      <h2 id="privacy-summary-heading" className="mt-2 font-display text-28 text-ink">
        What stays on your phone, and the one thing that leaves it.
      </h2>
      <p className="mt-3 max-w-[58ch] text-14 leading-relaxed text-ink-soft">
        A plain map of how your data actually moves. The full policy below is the version that
        counts; this card is so you can tell at a glance.
      </p>
      <ul className="mt-5 flex flex-col divide-y divide-line/70">
        <Row
          what="The nightly log"
          where="This phone's local storage."
          detail="Smoked or not, one mood, up to three trigger chips, your goal tick, any words. Never uploaded, never synced, no copy anywhere."
        />
        <Row
          what="The Sunday card"
          where="Worked out on this phone, from the log above."
          detail="Opening it writes nothing new and sends nothing anywhere. The shelf of past weeks is the same log, read back."
        />
        <Row
          what="Your name, bedtime, your one thing, the chime choice"
          where="This phone's local storage."
          detail="The name is one you make up. There is no account, no email, no password."
        />
        <Row
          what="Asking Fix about your week"
          where="Our server, then our AI provider (Anthropic), only when you tap send."
          detail="Sends the last seven nights of your log, your question, and the last few messages of that conversation. Not stored by us; deleted by the provider within 30 days. A crisis keyword stops the request before the AI sees it."
        />
        <Row
          what="Voice notes"
          where="Switched off today. When on: a remote transcription provider, once."
          detail="Up to ten seconds of audio, turned into text and sent back. Audio is not kept by us. Transcription happens on the provider's servers, not in your browser."
        />
        <Row
          what="Daily limits and the free week"
          where="A database in the EU, keyed by one-way hashes."
          detail="A random device cookie and a daily hash of your IP, so Fix can be capped at five questions a day and the free week can't be restarted. No raw IDs or addresses are stored."
        />
        <Row
          what="Hosting and typefaces"
          where="Cloudflare serves the site; Google Fonts serves the two typefaces."
          detail="Both see your IP address and browser type, as any web server does. Neither is sent your log. No analytics, no trackers."
        />
        <Row
          what="Payments"
          where="Not switched on. Nothing can be charged today."
          detail="When a paid plan goes live, a payment provider (merchant of record) would handle your card and receipt; we would never see the card number."
        />
      </ul>
      <p className="mt-5 text-12 leading-relaxed text-ink-faint">
        Fix is adults-only (18+). No analytics, no ads, no tracking script. The help page is free
        and never behind a paywall.
      </p>
    </section>
  );
}

function Row({ what, where, detail }: { what: string; where: string; detail: string }) {
  return (
    <li className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[1fr_1.4fr] sm:gap-6">
      <div>
        <p className="text-14 font-medium text-ink">{what}</p>
        <p className="text-14 text-ink-soft">{where}</p>
      </div>
      <p className="text-14 leading-relaxed text-ink-soft">{detail}</p>
    </li>
  );
}
