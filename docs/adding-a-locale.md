# Adding a new locale

_Living checklist for adding a first-class locale to FreezeFix. Last expanded 5 November 2026 (Stage 2 of the Calm-grade redesign). Keep it short; keep it accurate._

FreezeFix currently ships `en`, `de`, `fr`, `nl`, `es`, `it`. Adding one more locale is six small touches and one route. None of them touch payments.

The example below uses **Swedish (`sv`)** because SE is already in the crisis-resource directory and so the Stage-1 safety work is already done — a new locale that isn't yet in `lib/resources.ts` needs that one added first (see "Crisis resources" at the end of this doc).

## 1. Type + list

`lib/landing-copy.ts`:

```ts
export type Locale = "en" | "de" | "fr" | "nl" | "es" | "it" | "sv";

export const LOCALES: Locale[] = ["en", "de", "fr", "nl", "es", "it", "sv"];
```

Add a region rule to `pickLandingLocale(region)` in the same file:

```ts
  if (r === "SE") return "sv";
```

## 2. Copy blocks

Append a native-first block to the `LANDING_COPY` record in `lib/landing-copy.ts`. Mirror the shape of the `fr` or `nl` block above — every key is required. Do not DeepL from English; write it in the target language's natural product-page register.

Repeat for every copy pack:
- `lib/program-copy.ts` — `PROGRAM_COPY[sv]`
- `lib/reflections-copy.ts` — `REFLECTIONS_COPY[sv]`
- `lib/pricing-copy.ts` — `PRICING_COPY[sv]`

Add `sv` to the `EN_STOPWORDS` map and the `for (const loc of [...])` loop in each matching test file:
- `scripts/test-landing-copy.ts`
- `scripts/test-pricing-copy.ts`

## 3. The English switcher chip

In `LANDING_COPY.en`, extend `languageLinks` with the new locale so visitors on `/` can switch:

```ts
languageLinks: [
  { href: "/de", label: "Auf Deutsch", lang: "de" },
  { href: "/fr", label: "En français", lang: "fr" },
  { href: "/nl", label: "In het Nederlands", lang: "nl" },
  { href: "/es", label: "En español", lang: "es" },
  { href: "/it", label: "In italiano", lang: "it" },
  { href: "/sv", label: "På svenska", lang: "sv" },
],
```

Bump the EN count check in `scripts/test-landing-copy.ts` (search `languageLinks.length`).

## 4. The route

```bash
mkdir -p app/sv
```

Copy `app/fr/page.tsx` to `app/sv/page.tsx` and change every `fr` to `sv` and every `fr_FR` to `sv_SE`. Then add `sv-SE` to the `languages` map in every locale route's `metadata.alternates` — that's the hreflang mesh, and skipping one locale confuses Google.

## 5. Sitemap

Append a block to `app/sitemap.ts` mirroring the `/de` / `/fr` / `/nl` / `/es` / `/it` entries, at priority `0.9` and weekly change frequency.

## 6. Crisis resources

If the country is not already in `lib/resources.ts`, add its block before shipping the locale. Verify every phone number against a primary directory (ministry of health, national mental-health service, or `findahelpline.com`) and cite the source inline in the file header, next to the dated line we keep for every country added. Never ship a locale without a crisis block — the "Get help now" chip must land on real native lines.

## 7. Test

```bash
npm run test:landing-copy
npm run test:pricing-copy
npm run test:resources
npm run test:program
npm run test:reflections
```

All five must pass. The landing copy test specifically enforces that no field in the new locale's block accidentally leaks English stop-words ("the", "please", etc.); if it fires, the copy needs a rewrite, not the test.

## Promise that holds across every locale

- Crisis help is always one tap away and always free.
- The chat still answers in English until the chat-side system prompt is updated for that locale (Stage 5 in the plan doc). Keep the honest `chatIsEnglishNote` loud on every new locale page.
- Nothing about billing or the `/pricing` page's founding-member price changes per locale — the currency bucket in `lib/pricing-copy.ts` (`currencyKey(region)`) is the only locale-adjacent price knob.
