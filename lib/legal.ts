// Legal pages. SOURCE: Setup & Legal's FreezeFix Legal Pack (draft v1, 15 Oct 2026, with
// Safety & Trust's review applied in T30). PB filled the [bracketed] items on 16 Oct 2026
// (AI provider and retention from HQ T24; database region; merchant named at checkout).
// Good enough to launch; a lawyer reviews at 10 paying users (founder decision).
// Any wording change goes through Setup & Legal first.
//
// Bumped 2 November 2026: Terms Section 5 and the Refunds page rewritten to
// honestly state that no paid plan, trial, or payment flow is active today.
//
// Rewritten 11 November 2026 (fix/legal-copy-matches-shipped-product) so every
// product claim matches the code that ships on main: the product is Fix — a
// nightly log kept on the device, a weekly mirror computed on the device, a
// shelf of past weeks, and one AI question per turn inside the mirror. The
// previous text still described the retired "unfreeze me" product (moments,
// moves, screenshots, a chat), which no longer exists in this repository.
//
// Everything stated here was read from the code, not from the product brief:
//   - lib/entry.ts, lib/profile.ts, lib/mirror.ts, lib/chime-pref.ts: the six
//     localStorage keys, and that nothing in them is uploaded.
//   - components/FixSheet.tsx + lib/pattern.ts + app/api/fix/route.ts: exactly
//     what one Fix question sends (the last seven nights, the question, up to
//     the last eight turns of that conversation, a two-letter region code).
//   - app/api/transcribe/route.ts + lib/features.ts: voice is OFF unless
//     ENABLE_VOICE=true and a provider key is set; when on, audio is sent to a
//     remote transcription service and is not kept by us.
//   - lib/quota.ts + supabase/schema.sql: the HttpOnly device cookie, the
//     salted daily IP hash, the trial record, and what a Paddle webhook stores.
//   - app/api/webhooks/paddle/route.ts + lib/plans.ts: payments stay off until
//     the Paddle secrets exist (paymentsOn()).
// The waitlist, suggestions and safety-count tables exist in the schema but no
// route writes to them today, so they are not described as live. No email is
// sent by the product (there is no email to send to). Screenshots have no UI.
//
// STATUS: code-accurate draft. Still subject to Setup & Legal review before it
// is treated as final. Retention windows for Anthropic and the transcription
// provider are those providers' published API terms at the time of writing and
// need re-checking on each provider change.
export const LAST_UPDATED = "11 November 2026";

export const PRIVACY = `
# Fix Privacy Policy

Last updated: ${LAST_UPDATED}

## The short version

- Fix is a private pattern-mirror for adults 18+ who smoke weed. You log a night in three taps, and on Sunday one card shows you what the week looked like. It is not therapy, medical advice, a quit programme or an emergency service.
- There is no account. No email, no password, no phone number. The name you give is a name you make up, and it stays on your phone.
- Your log stays on your phone. We don't sync it, upload it or back it up anywhere. We can't read it.
- The one time something leaves your phone is when you tap "ask Fix about this week". That sends the last seven nights of your log and your question to us, and we send it to our AI provider to write the answer. Nothing is sent just by opening the app.
- We never sell your data, never use it for ads, and never share it with anyone other than the providers named below.
- You can wipe everything on your phone from Settings → "forget everything".

## 1. Who we are

Fix is run by Abhay Rawat, a sole trader based in India, trading as FreezeFix ("we", "us"). We decide how your data is used, so we are the **data controller** (UK and EU law) and **data fiduciary** (India).

Contact for anything about your data: **privacy@getfreezefix.com**.

## 2. What stays on your phone

Everything you tell the app is written to your browser's local storage on your device. We never see it:

| What | Where it lives | Sent to us? |
| --- | --- | --- |
| Age confirmation | Your phone (the "yes" you tap at the start) | No |
| The name you make up, your bedtime, the one thing you want to do more of, and the onboarding answers that shape your log | Your phone | No, except as part of a Fix question (section 3) |
| The nightly log: whether you smoked, one mood, up to three trigger chips, whether you did your thing, and any words you typed or said | Your phone | No, except as part of a Fix question (section 3) |
| Which Sunday cards you have already seen, and whether you want the Sunday chime | Your phone | No |
| The country you picked on the help page | Your phone | No |

If your browser blocks storage (for example a private window), the app still opens; it just can't remember. If you clear your browser's site data, or lose the phone, the log is gone — there is no copy anywhere else and no way to recover it. We say this plainly because it is the price of not holding your data.

**Health data.** Your log can reveal your mental health and substance use. The law treats this as special (sensitive) data. On your phone it is yours and we don't process it. We only ever process it when you choose to send a week to Fix — that tap is your consent for that one request, and you can simply not tap it. We don't ask for a blanket consent up front because we don't collect anything up front.

**Never collected:** contacts, precise location, camera, or microphone access without you pressing the button. Nothing from anyone under 18.

## 3. What happens when you ask Fix

Fix is the one button inside the Sunday card that asks our AI a question about your week. When you tap it and send a question, your phone sends us:

- the last seven nights of your log — for each night: whether you smoked, your mood out of five, the trigger chips you tapped, whether you did your thing, and up to the first 160 characters of any note;
- the question you typed, and up to the last eight messages of that same conversation (the opening line can include the name you made up);
- your one thing and how many times you did it this week and last week;
- a two-letter country code, so that if your words read like a crisis we can show you the right phone numbers.

Our server first runs a keyword safety check in code. If your message looks like an emergency or a crisis, the app stops and shows you real phone numbers for your country, and nothing is sent to the AI.

Otherwise the week and your question go to our AI model provider, **Anthropic** (the Claude API), which processes them for us under contract to write the reply. Anthropic does not use this data to train its models. Under its API terms at the time of writing it deletes the request within 30 days, except that if its automated safety systems flag a message as breaking its usage policy it may keep that message for up to 2 years.

We don't store your question or the reply. What we do keep, for the day only, is a count: a one-way hash of a random device cookie and a one-way hash of your IP address, so that Fix can be limited to five questions a day (twenty on a paid plan). The raw cookie value and the raw IP address are never stored. See section 7.

The reply is written by an AI. It only has your log to go on, it can be wrong, and it is not medical advice. It will never tell you to quit, grade your week, or diagnose you.

## 4. Voice notes

The microphone button is **switched off** in the product at the time of writing. The button is still visible; pressing it tells you so.

When we switch it on: holding the button records up to ten seconds of audio, which is sent once to our transcription provider and turned into text. The audio is not kept by us. The provider keeps it only as long as its API terms allow for abuse monitoring (currently up to 30 days), then deletes it. The text comes back to your phone and is stored in that night's log, where you can read it, change it or delete it. Transcription happens on the provider's servers, not inside your browser. We will update this section with the provider's name before the feature is switched on.

## 5. The free week and payments

The app starts a seven-day free week when you finish setting it up. To stop a browser being able to restart that clock, our server keeps a record of the start date against a one-way hash of your device cookie. No name, no email, no IP.

**No payment is taken today.** The price shown in the app is the price we intend to charge after the free week once payments are switched on. Until then nothing can be charged and the free week does not end. If a paid plan goes live, our payment provider (we intend to use Paddle, as merchant of record) will collect your email and card details for the receipt and the subscription; we will never see your card number. We would store only: a one-way hash of your device cookie, the subscription and customer IDs the provider gives us, the plan, its status and when the current period ends. We will update this policy before the first payment is taken.

## 6. Who we share data with

We never sell your data or share it for advertising. We only use service providers who process data for us under contract, and only as much as they need:

| Provider | What they do for us | Where |
| --- | --- | --- |
| Cloudflare | Hosts the site and the server that handles a Fix question | Global network |
| Anthropic | Writes the Fix reply from the week you send (section 3) | USA |
| Supabase | A database holding the daily-limit counts, the free-week start record and, if payments go live, subscription status — all keyed by one-way hashes | EU (Frankfurt, Germany) |
| Transcription provider (not yet switched on) | Turns a voice note into text (section 4) | To be named before voice is switched on |
| Paddle (not yet switched on) | Would take payments and handle VAT and receipts as merchant of record | — |
| Zoho Mail | Our support inbox, if you write to us | India |

We may also share data if the law requires it, to protect someone's life in an emergency, or if the business is sold (you would be told first). Anything else needs your explicit consent.

## 7. Cookies and technical data

We don't use analytics or advertising cookies, and there is no tracking script on the site.

- **A device cookie** (\`ff_did\`): a random identifier set by our server the first time your phone talks to it. It can't be read by page scripts. It is used only to count daily Fix questions, to record the start of the free week, and, if payments go live, to recognise a subscription. It holds nothing about you.
- **A fallback counter** (\`ff_q\`): only when our database is unavailable, a two-day cookie holds the day's count so limits still work.
- **Server logs**: Cloudflare, which hosts us, sees the IP address, device and browser type of each request to keep the service secure and working, as any website host does. We keep error logs for at most 30 days. We do not write your log, your question or the reply to any log.

## 8. International transfers

We are based in India and our providers operate in several countries, including the USA. When data leaves the UK or EU, we use legal safeguards such as the European Commission's Standard Contractual Clauses and the UK International Data Transfer Addendum.

## 9. How long we keep data

| Data | How long |
| --- | --- |
| Your log, name and settings | On your phone, for as long as you keep them. We hold no copy. |
| A Fix question and its reply | Not stored by us. Our AI provider deletes it within 30 days (section 3). |
| Voice audio (when switched on) | Not stored by us. Our transcription provider deletes it within its abuse-monitoring window (section 4). |
| Daily-limit counts | Rows older than two days are deleted automatically. |
| Free-week start record | A hash and a date, kept while the service runs. |
| Subscription record (if payments go live) | Kept while the subscription exists and as long as tax law then requires. |
| Server and error logs | 30 days at most. |

**Forget everything:** Settings → "forget everything" removes the log, your name, your settings and the help-page country choice from this device. It cannot reach the device cookie, which holds nothing about you, and it cannot recall a week you already sent to Fix — our provider deletes that on its own schedule, above. To remove the cookie, clear this site's data in your browser.

## 10. Security

Data is encrypted in transit. Everything you log is held only on your device, so the main thing protecting it is your device: anyone who can unlock your phone and open the browser can open the app. Server-side we hold only hashes and counts, access is limited to the founder, and we use two-factor authentication on every admin account. No system is perfectly secure. If a breach puts you at risk, we will tell you and the regulators as the law requires.

## 11. Your rights

Email **privacy@getfreezefix.com**. We reply within one month (UK/EU) or the time your local law sets. Because we hold nothing that identifies you, we may not be able to find anything about you — most of what we could help with, you can do yourself from Settings.

**UK and EU.** You can access, correct, delete or download your data, object to or restrict our use of it, and withdraw consent at any time. You can complain to the UK Information Commissioner's Office ([ico.org.uk](https://ico.org.uk)) or your local EU data protection authority.

**USA: consumer health data (Washington and similar states).** Under Washington's My Health My Data Act and similar state laws, a week you send to Fix is consumer health data. We process it only on your tap, and we ask separately before ever sharing it beyond the providers in section 6. You can confirm what we hold, see the third parties we shared it with, withdraw consent and ask us to delete it. We do not sell consumer health data.

**India.** Under the Digital Personal Data Protection Act 2023, you can access a summary of your data, correct or erase it, withdraw consent as easily as you gave it, nominate someone to act for you, and complain to the Data Protection Board of India.

## 12. Adults only

Fix is for people aged 18 and over, or the age of adulthood where you live if that is higher. We do not knowingly collect data from anyone under 18. If we learn we have, we delete it.

## 13. Changes

If we change this policy in a way that matters, we will tell you in the app before it takes effect. We can't email you — we don't have your email.

## 14. Contact

Privacy questions: **privacy@getfreezefix.com**. Safety concerns: **safety@getfreezefix.com**. If you are in danger now, call your local emergency number.
`;

const REFUNDS_SECTION = `
**There is nothing to refund today.** Fix does not take payments on this website or in any app at the moment. The app shows a seven-day free week and the price we intend to charge after it, so nothing surprises you later; but until payments are switched on, the free week does not end and nothing can be charged. No card is asked for.

If a paid plan goes live, this page will be updated **before** the first payment is taken to describe exactly how to cancel, how refunds work in the UK, the EU and elsewhere, and how long you have under local law to change your mind. The intent is one tap to cancel from inside the app, with no phone call and no retention offer.

Nothing in these terms takes away refund or consumer rights you have under the law where you live.
`;

export const TERMS = `
# Fix Terms of Use

Last updated: ${LAST_UPDATED}

These terms are an agreement between you and Abhay Rawat, trading as FreezeFix ("Fix", "we", "us"). By using Fix at getfreezefix.com or in our apps, you agree to them. Please also read our [Privacy Policy](/privacy).

## 1. Fix is a mirror, not medical help

Fix shows you what your own log says: which nights you smoked, the mood you logged, the triggers you tapped, and whether you did the one thing you chose. It is **not** therapy, counselling, diagnosis, medical advice, a treatment or quit programme, or an emergency service. It does not replace a doctor, therapist or crisis line, and it never tells you whether to smoke or to stop.

**If you're in danger, have chest pain, can't breathe, someone has collapsed, or you might act on thoughts of hurting yourself, call your local emergency number now** (999 UK, 911 US, 112 in the EU and India). The help page at [/help](/help) is free, needs no sign-up, and is never behind the age gate or a paywall.

We never encourage drug use.

## 2. You must be an adult

Fix is only for adults aged 18 or over (or the age of adulthood where you live, if higher). By using it you confirm you meet this age. Fix has no accounts, so there is nothing to close; if we learn that someone under 18 has used it, we will delete anything we hold.

## 3. Using Fix safely and fairly

You agree not to:

- use Fix to harm, harass or threaten anyone;
- try to hack, overload, copy or reverse-engineer the service, or scrape it with bots;
- use the AI to produce illegal content, or try to make it give dangerous instructions;
- resell or share a paid plan, if one exists.

We may suspend or block access if you break these rules or put others at risk. The help page stays available to everyone.

## 4. The AI inside the mirror

The replies you get from the "ask Fix about this week" button are written by an AI model from the log you send it. They can be unhelpful, wrong, or not right for your situation. They describe your log; they are not advice. You decide what any of it means, and you are responsible for what you do. Never act on anything that feels unsafe.

## 5. Free today, paid plans may come later

**Everything on getfreezefix.com is free right now and does not ask for a card.** The log, the Sunday card, the shelf of past weeks, Fix and the help page are open to use without paying anything, without creating an account, and without entering payment details.

**What the app shows.** The app starts a seven-day "free week" when you finish setting it up, and shows the price we intend to charge after it — currently $39.99 a year or $9.99 a month, in your local currency where we know it. We show this so the price is never a surprise. **Until payments are switched on, the free week does not end and no one can be charged.** No subscription, checkout or card capture exists on this site today.

**If a paid plan goes live** — the exact price, the trial length, the merchant of record, the automatic-renewal rules, the price-change notice and the cancellation flow will all be published here **before** the first payment is taken. Nothing applies retroactively to anyone who used Fix for free before that date. Your log stays on your phone whether or not you ever pay; a paid plan would unlock features, never hold your data hostage.

## 6. Cancelling and refunds
${REFUNDS_SECTION}
## 7. Your content

What you log stays yours and stays on your phone. When you send a week to Fix, you let us process it only to write that reply, as described in the Privacy Policy. Don't share anything you don't have the right to share.

## 8. Our content

The Fix and FreezeFix names, the logo, the app and its content belong to us. You may use the app for your own personal, non-commercial use. Please don't copy or sell it.

## 9. Our responsibility to you

We work to keep Fix available and safe, but we provide it "as is" and can't promise it will always work or always help. Your log lives only on your device, so we can't restore it if the device or the browser's data is lost. To the extent the law allows:

- we are not responsible for decisions you make or actions you take based on what the mirror or Fix shows you;
- we are not responsible for losses we could not reasonably foresee, including loss of a log kept only on your device;
- our total liability to you is limited to the amount you paid us in the 12 months before the claim, or $50 if you paid nothing.

Nothing in these terms limits liability that can't legally be limited, such as for death or personal injury caused by our negligence, or for fraud, or your statutory consumer rights.

## 10. Ending your use

You can stop using Fix at any time, and wipe it from your phone from Settings → "forget everything". There is no account to delete. We may suspend or end access if you break these terms or if we stop offering the service; if we ever close a paid plan, we refund the unused part.

## 11. Changes to these terms

We may update these terms. If a change matters, we'll tell you in the app at least 14 days before it applies. If you don't agree, you can stop using Fix before then.

## 12. Law and disputes

These terms are governed by the laws of India, and disputes go to the courts of Dehradun, Uttarakhand. If you are a consumer in the UK, EU or US, you also keep the protection of the mandatory laws of where you live and can bring a claim in your local courts. Please email us first; most problems can be fixed quickly.

## 13. Contact

hello@getfreezefix.com (general and billing) · privacy@getfreezefix.com (your data) · safety@getfreezefix.com (safety concerns).
`;

export const REFUNDS = `
# Cancellations and refunds

Last updated: ${LAST_UPDATED}

This is section 6 of our [Terms of Use](/terms).
${REFUNDS_SECTION}
Questions about a payment: **hello@getfreezefix.com**.
`;
