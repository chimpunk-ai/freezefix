import { Container } from "@/components/Shell";
import { TRIAL_DAYS, pricesFor } from "@/lib/plans";

// The six questions people most actually ask before they try the app. Trimmed
// from nine in Nov 2026 after a user audit found the earlier list long enough
// to read like a terms page. The three dropped items (miss-a-night, bad-place,
// who-is-this-for) are answered on the landing above the fold, on /help, and
// by myths-&-reality below respectively — so losing them here doesn't lose
// coverage, it just shortens the scroll.
//
// If any answer here ever disagrees with /privacy or /terms, those pages win
// and this file is wrong.

export type FaqItem = { q: string; a: string };

export function faqItems(paymentsOn: boolean): FaqItem[] {
  const p = pricesFor("US");
  return [
    {
      q: "is this a quit app?",
      a: "no. fix doesn’t ask you to stop, count clean days, or reset anything when you smoke. it shows your week and leaves the next step to you — including no step at all.",
    },
    {
      q: "who can see my log?",
      a: "nobody. it’s stored in your browser on this device, not on a server. no account to log in to, nothing on our side to look up. the one time anything leaves is when you press send to ask fix a question.",
    },
    {
      q: "what does fix actually get when i ask it something?",
      a: "the last seven nights of taps, your question, the last few lines of chat, your made-up name, and a two-letter country code. that goes to our ai provider (anthropic) to write the reply, isn’t used to train anything, and is deleted on their side within 30 days. we keep no copy.",
    },
    {
      q: "does it cost anything?",
      a: paymentsOn
        ? `${TRIAL_DAYS} days free, no card. then ${p.yearly} a year or ${p.monthly} a month. cancel in one tap from settings; your log stays on your device either way.`
        : `right now the whole thing is free while we finish the payments side — nothing can be charged and nothing locks. the plan is ${p.yearly} a year or ${p.monthly} a month, with ${TRIAL_DAYS} days free and no card.`,
    },
    {
      q: "no account — really? what’s the catch?",
      a: "a name you make up is the whole sign-in. no email, no phone, no password. the catch is the honest one: if you clear this browser’s site data or lose the phone, the log is gone. there’s no copy anywhere.",
    },
    {
      q: "can i delete everything?",
      a: "yes — settings → forget everything wipes the log, your name and your settings from this device. the only thing it can’t reach is a week you already sent to fix; our provider deletes that on its own 30-day schedule.",
    },
  ];
}

export default function Faq({ paymentsOn }: { paymentsOn: boolean }) {
  const items = faqItems(paymentsOn);
  return (
    <section aria-labelledby="faq-heading" className="mt-16 lg:mt-24">
      <Container className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div data-reveal>
          <p className="text-12 uppercase tracking-[0.14em] text-ink-faint">before you type a name</p>
          <h2 id="faq-heading" className="mt-2 font-display text-28 text-ink lg:text-40">
            the questions people ask first.
          </h2>
          <p className="mt-3 max-w-[40ch] text-14 text-ink-soft lg:text-16">
            short answers. the long ones are on the{" "}
            <a href="/privacy" className="underline decoration-line underline-offset-4 hover:text-ink">privacy page</a> and
            the <a href="/terms" className="underline decoration-line underline-offset-4 hover:text-ink">terms</a>, and
            they say the same thing. the beliefs people <em>hold</em> that aren&rsquo;t true are{" "}
            <a href="#myths" className="underline decoration-line underline-offset-4 hover:text-ink">right below</a>.
          </p>
        </div>
        <div data-reveal className="mt-8 divide-y divide-line border-y border-line lg:mt-0">
          {items.map((it) => (
            <details key={it.q} className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-4 text-16 text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="font-display text-20">{it.q}</span>
                <span
                  aria-hidden
                  className="shrink-0 text-ink-faint transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[62ch] pb-5 text-14 leading-relaxed text-ink-soft lg:text-16">{it.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
