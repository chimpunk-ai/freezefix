// Legal pages. SOURCE: Setup & Legal's FreezeFix Legal Pack (draft v1, 15 Oct 2026, with
// Safety & Trust's review applied in T30). PB filled the [bracketed] items on 16 Oct 2026
// (AI provider and retention from HQ T24; database region; merchant named at checkout).
// Good enough to launch; a lawyer reviews at 10 paying users (founder decision).
// Any wording change goes through Setup & Legal first.

// Bumped 2 November 2026: Terms Section 5 and the Refunds page rewritten to
// honestly state that no paid plan, trial, or payment flow is active today —
// stops the previous version (which advertised a $9.99/$39.99 "FreezeFix Plus"
// that does not exist) from creating UK CPUTR 2008 / EU UCPD 2005/29/EC
// unfair-commercial-practice exposure. Privacy data-table rows for Account
// details, Payment details and Payment provider updated to match. The dormant
// payment code (components/Paywall.tsx, lib/plans.ts, /api/paywall, Paddle
// webhook) is untouched: it is gated by paymentsOn() which stays off, so it is
// unreachable until payments are turned back on and the copy here is updated
// in the same change.
export const LAST_UPDATED = "2 November 2026";

export const PRIVACY = `
# FreezeFix Privacy Policy

Last updated: ${LAST_UPDATED}

## The short version

- FreezeFix helps adults 18+ get unstuck when they freeze after using cannabis. It is not therapy, medical advice or an emergency service.
- You can use the core flow without an account. We collect as little as we can.
- Your notes stay on your phone. What you type goes to our AI to get your moves and isn't stored.
- We never sell your data, never use it for ads, and never share it without your clear consent.
- You can delete everything in one tap: Settings → Delete everything.

## 1. Who we are

FreezeFix is run by Abhay Rawat, a sole trader based in India, trading as FreezeFix ("we", "us"). We decide how your data is used, so we are the **data controller** (UK and EU law) and **data fiduciary** (India).

Contact for anything about your data: **privacy@getfreezefix.com**.

## 2. What we collect and why

| What | Examples | Why we use it | Legal basis (UK/EU) |
| --- | --- | --- | --- |
| Age confirmation | You confirm you are 18 or over | To keep FreezeFix adults-only | Legal obligation; legitimate interests |
| Session details (health data) | The moment you pick (around people, alone and spiralling, stuck on a task, can't reply), what you type in the chat, an optional voice note, and an optional image you choose to share | To work out your next steps and to show crisis help when you need it | **Your explicit consent** (you tick a box before your first session) |
| Feedback | "Did it help?" thumbs up or down, which move you picked | To learn which moves help and improve them | Your explicit consent |
| Account details | Not collected — FreezeFix is anonymous. No email address, no sign-in. If a paid plan launches, this row will describe what it uses then | Not applicable | Not applicable |
| Payment details | Not collected — no payment flow exists on this site today. If a paid plan launches, our chosen payment provider will handle card details; we will never see them | Not applicable | Not applicable |
| Technical data | IP address, device and browser type, error logs | To keep the service secure and working | Legitimate interests |
| Messages to us | Emails to hello@, privacy@ or safety@ | To reply and help you | Legitimate interests |
| Safety counts | When the safety check shows crisis help: the risk level, time and country only, never your words | To count safety incidents and improve crisis help | Legitimate interests; protecting your vital interests |

**Health data.** What you share in a session can reveal your mental health and substance use. The law treats this as special (sensitive) data. We only process it with your explicit consent, and you can withdraw consent at any time in Settings. Withdrawing stops future sessions; it does not undo what was lawful before.

**Images you choose to share.** You can attach a chat screenshot, or a photo of a place or object, if it helps explain what's going on. Our AI reads it once to pull out the text or a short description, and that is all it is used for. We never store the image, and it is deleted from our AI provider as described below. We refuse images of people, ID documents, bank or card details, and sexual images, and we do not describe a refused image back to you.

**Voice notes.** Most browsers turn your voice into text on your own device, so the audio never reaches us at all. Where your browser can't do that, the audio goes once to our transcription provider and is not stored by us. Only the text is used.

**Never collected:** contacts, precise location, camera or microphone access without you starting it, or data from anyone under 18.

## 3. How the AI part works

To work out your next steps, what you type, any voice transcript and any image you attach are sent to our AI model provider, Anthropic (the Claude API), which processes them for us under contract. Anthropic does not use this data to train its models and deletes it within 30 days. If Anthropic's automated safety systems flag a message as breaking its usage policy, Anthropic may keep that message for up to 2 years.

The AI suggests ideas; it does not make decisions about you with legal or similarly significant effects. Its suggestions can be wrong. Use your own judgment, and get real help if you are unsafe.

**Safety check.** If you tell us about chest pain, trouble breathing, mixing substances, hearing or seeing things others don't, someone collapsing, or thoughts of hurting yourself, the app shows emergency and crisis contacts straight away. This help is always free.

## 4. Who we share data with

We never sell your data or share it for advertising. We only use trusted service providers who process data for us under contract, and only as much as they need:

| Provider | What they do for us | Where |
| --- | --- | --- |
| Cloudflare | Hosting, security, domain | Global network |
| Supabase | Database for anonymous counts, and accounts when paid plans start | EU (Frankfurt, Germany) |
| Anthropic | Generates your 3 moves | USA |
| Resend | Sends account and reminder emails | USA |
| Zoho Mail | Our support inbox | India |
| **No payment provider is active today.** If a paid plan launches, this row will name the provider we use then (likely Paddle as merchant of record), what they do, and where they operate | — | — |

We may also share data if the law requires it, to protect someone's life in an emergency, or if FreezeFix is sold (you would be told first). Anything else needs your explicit consent.

## 5. International transfers

We are based in India and our providers operate in several countries, including the USA. When data leaves the UK or EU, we use legal safeguards such as the European Commission's Standard Contractual Clauses and the UK International Data Transfer Addendum.

## 6. How long we keep data

| Data | How long |
| --- | --- |
| Chat messages, voice notes and images | Not stored by FreezeFix at all. Our AI provider deletes them within 30 days (see section 3). Notes you save stay on your phone |
| Feedback ("Did it help?") | 24 months, not linked to your name |
| Account details | Not applicable today (no account is created). If a paid plan launches, we will keep account details until you delete your account, or 12 months after your last sign-in |
| Payment and tax records | Not applicable today (no payments are taken). If a paid plan launches, we will keep payment and tax records as long as tax law requires |
| Security logs | 30 days at most |

**Delete everything:** Settings → Delete everything removes anything FreezeFix holds about you on this device and asks our providers to delete it too. There is no account to delete today; if a paid plan launches, payment records we must keep by law are kept, then deleted.

## 7. Security

Data is encrypted in transit and at rest, access is limited to the founder, and we use two-factor authentication on every admin account. No system is perfectly secure. If a breach puts you at risk, we will tell you and the regulators as the law requires.

## 8. Your rights

Email **privacy@getfreezefix.com**. We reply within one month (UK/EU) or the time your local law sets, and we may need to confirm it is really you.

**UK and EU.** You can access, correct, delete or download your data, object to or restrict our use of it, and withdraw consent at any time. You can complain to the UK Information Commissioner's Office ([ico.org.uk](https://ico.org.uk)) or your local EU data protection authority.

**USA: consumer health data (Washington and similar states).** Under Washington's My Health My Data Act and similar state laws, session details are consumer health data. We collect them only with your opt-in consent, and we ask separately before ever sharing them beyond the providers in section 4. You can confirm what we hold, see the third parties we shared it with, withdraw consent and ask us to delete it. We do not sell consumer health data.

**India.** Under the Digital Personal Data Protection Act 2023, you can access a summary of your data, correct or erase it, withdraw consent as easily as you gave it, nominate someone to act for you, and complain to the Data Protection Board of India.

## 9. Adults only

FreezeFix is for people aged 18 and over. We do not knowingly collect data from anyone under 18. If we learn we have, we delete it.

## 10. Cookies

We use only cookies needed to run the service and keep you signed in. We don't use advertising or tracking cookies.

## 11. Changes

If we change this policy in a way that matters, we will tell you in the app or by email before it takes effect.

## 12. Contact

Privacy questions: **privacy@getfreezefix.com**. Safety concerns: **safety@getfreezefix.com**. If you are in danger now, call your local emergency number.
`;

const REFUNDS_SECTION = `
**There is nothing to refund today.** FreezeFix does not take payments on this website or in any app at the moment. Everything on getfreezefix.com — the chat with Fix, the home check-in, the journal, the plans, the insights, crisis help — is free and does not ask for a card.

If a paid plan launches in the future, this page will be updated **before** the first payment is taken to describe exactly how to cancel, how refunds work in the UK, the EU and elsewhere, and how long you have under local law to change your mind.

Nothing in these terms takes away refund or consumer rights you have under the law where you live.
`;

export const TERMS = `
# FreezeFix Terms of Use

Last updated: ${LAST_UPDATED}

These terms are an agreement between you and Abhay Rawat, trading as FreezeFix ("FreezeFix", "we", "us"). By using FreezeFix at getfreezefix.com or in our apps, you agree to them. Please also read our [Privacy Policy](/privacy).

## 1. FreezeFix is not medical help

FreezeFix gives short, practical suggestions to help you get unstuck. It is **not** therapy, counselling, diagnosis, medical advice, a treatment or quit programme, or an emergency service. It does not replace a doctor, therapist or crisis line.

**If you're in danger, have chest pain, can't breathe, someone has collapsed, or you might act on thoughts of hurting yourself, call your local emergency number now** (999 UK, 911 US, 112 in the EU and India). If you've mixed substances or are struggling, the app shows free help contacts. Crisis contacts in the app are always free.

We never encourage drug use. If you have used something other than cannabis, the app will point you to real help instead of giving moves.

## 2. You must be 18 or over

FreezeFix is only for adults aged 18 or over (or the age of adulthood where you live, if higher). By using it you confirm you meet this age. We may close accounts we believe belong to someone under 18.

## 3. Using FreezeFix safely and fairly

You agree not to:

- use FreezeFix to harm, harass or threaten anyone;
- share other people's private details you don't have the right to share;
- try to hack, overload, copy or reverse-engineer the service, or scrape it with bots;
- use the AI to produce illegal content, or try to make it give dangerous instructions;
- resell or share a paid account.

We may suspend or close access if you break these rules or put others at risk. Crisis contacts stay available to everyone.

## 4. AI suggestions

The moves you see are created by an AI model. They can be unhelpful, wrong or not right for your situation. You choose whether to follow a suggestion, and you are responsible for that choice. Never follow a suggestion that feels unsafe.

## 5. Free today, paid plans may come later

**Everything on getfreezefix.com is free right now and does not ask for a card.** The chat with Fix, the home check-in, the journal, the plans, the insights, crisis help and every other surface are open to use without paying anything, without creating an account, and without entering payment details.

**There is no "FreezeFix Plus" to buy today.** No price, no trial, no subscription, no checkout, no card capture exists on this site. Anything you may have read elsewhere about a $9.99 monthly or $39.99 yearly plan was a draft of a possible future product. Those terms are not in force and no one can be charged.

**If a paid plan launches in the future** — tiered features, prices, trial length, the merchant of record, the automatic-renewal rules, the price-change notice and the cancellation flow will all be published here **before** the first payment is taken. Nothing retroactively applies to people who used FreezeFix for free before that date.

See the public [future plan preview](/future-plan) for the current thinking on what might one day be paid and what will always be free. That page is not a sales page, has no "buy" button, and nothing on it is a commitment.

## 6. Cancelling and refunds
${REFUNDS_SECTION}
## 7. Your content

What you type or say stays yours. You let us process it only to run FreezeFix for you, as described in the Privacy Policy. Don't share anything you don't have the right to share.

## 8. Our content

The FreezeFix name, logo, app and its content belong to us. You may use the app for your own personal, non-commercial use. Please don't copy or sell it.

## 9. Our responsibility to you

We work to keep FreezeFix available and safe, but we provide it "as is" and can't promise it will always work or always help. To the extent the law allows:

- we are not responsible for decisions you make or actions you take based on a suggestion;
- we are not responsible for losses we could not reasonably foresee;
- our total liability to you is limited to the amount you paid us in the 12 months before the claim, or $50 if you paid nothing.

Nothing in these terms limits liability that can't legally be limited, such as for death or personal injury caused by our negligence, or for fraud, or your statutory consumer rights.

## 10. Ending your use

You can stop using FreezeFix and delete your account at any time (Settings → Delete everything). We may suspend or end your access if you break these terms or if we stop offering the service; if we close a paid plan, we refund the unused part.

## 11. Changes to these terms

We may update these terms. If a change matters, we'll tell you in the app or by email at least 14 days before it applies. If you don't agree, you can cancel before then.

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
