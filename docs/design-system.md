# Fix — layout and design-system notes

Tokens live in `app/globals.css` (`@theme`). This file records the decisions
that aren't visible in a token: why the measures are what they are, how each
route composes at each width, and what to check before calling a layout done.

## Palette, type, motion

- Warm black `#12100E` ground; sage `#9CAF88` for anything that matters;
  amber `#F0A868` only for the signposts a tired person needs at 11pm (primary
  CTA, the one button on the Sunday card, section numbers); terracotta
  `#D8927A` for safety and nothing else.
- Inter for UI, Newsreader for display lines. Scale 12 / 14 / 16 / 20 / 28 /
  40. The landing hero is the one exception at 44px on `lg`: its text column
  is ~560px at the 1120 site measure and each sentence is 23 characters, so
  44 is the largest size that keeps one sentence per line (56 forced three
  or four uneven lines, which is why the `--text-56` token is unused). All in `rem`, so browser text-size
  settings scale the whole page (WCAG 1.4.4).
- Three animations and one loop, all in `globals.css`; `prefers-reduced-motion`
  collapses every one of them to zero. Motion never carries information.
- The landing adds one quiet entrance: sections below the fold fade up 10px
  once as they scroll in (`components/Reveal.tsx`, `[data-reveal]`). The
  hidden state only exists after the client marks the document ready, so
  first paint, no-JS, crawlers and print always get the whole page; reduced
  motion never gets the ready mark. Not used inside the app.
- No photography. The only pictures on the landing are the app's own
  interface — the Sunday card, the log, the week grid, the shelf — rendered
  from the same components and sample data the app uses.
- Lowercase voice everywhere, including kickers. No tracked-out all-caps labels.

## The three measures

| Token | Width | Used for |
| --- | --- | --- |
| `--container-app` | 560px | the log, onboarding, settings, the mirror sheet — a phone-shaped ritual that should feel the same on a laptop |
| `--container-read` | 680px | legal body copy (~70ch at 16px), the help page |
| `--container-site` | 1120px | landing, plans, the app's two-column shell — composed, never stretched |

Gutters: 20px (`px-5`) → 32px at `sm` → 40px at `lg`. Nothing reads edge to edge.

## Breakpoints and what changes

Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.

| Route | < 640 | 640–1023 | ≥ 1024 |
| --- | --- | --- | --- |
| `/` landing | one column; card under the headline; the shelf is a horizontal snap row, one card at a time with the next peeking | same, larger type; boundary cards 2-up from `md` | hero is two columns (words 1.15fr, real card 0.85fr, card ≤ 480px on a faint second card); the three steps sit 3-up, each with its interface fragment; the shelf is three compact cards 3-up; Fix + "what this isn't" 2-up; "where your words go" is two cards with an arrow between; price band 2-up |
| `/app` log | one column, 560 | one column, 560 | two columns: log 560 + sticky rail ≤ 400 (this week's grid, last card, plan line); whole thing centred in 1120 |
| `/app/weeks` shelf | one column | cards 2-up from `md` | one column ≤ 720 (reading, not browsing) |
| `/app/settings` | one column | one column | form 560 + plan/data card in a right column |
| `/plans` | plan cards stacked | plan cards 2-up from `md` | copy + cards 1fr, included-list aside ≤ 360 |
| `/privacy` `/terms` `/refunds` | compact section index under the title | same | sticky section index 220px left, text 680 right |
| `/help` | 680 read measure at every width — the number is the layout | | |
| mirror / Fix sheets | bottom sheet | centred dialog from `md`, all corners rounded | same |

Checked widths: 320, 375, 390, 430, 768, 1024, 1280, 1440, 1600, 1920, and
a 740×360 landscape phone. Reduced-motion must also zero `animation-delay`,
not just duration: the week grid's per-cell stagger otherwise leaves cells
invisible for up to 660ms under `prefers-reduced-motion`. The 1120 site measure means 1600 and 1920 gain
margin, not stretch; the hero card stays ≤ 520px so the week grid never
grows past the size it has in the app.

## Rules that aren't tokens

- Hover changes a border or a text colour only. Selected states use the
  sage/amber fill. Focus is a 2px sage ring, offset 3px. The three never look
  alike.
- Primary touch controls are ≥ 44px tall (`min-h-11`, `min-h-12`). The 40px
  mood faces on the log are an accepted exception: five across a 320px
  screen, each still ≥ 44px wide.
- A missing log day is a dot, never a "no". Every grid says so in text.
- No numbers that drift (user counts, ratings). No testimonials we didn't
  collect. The only "proof" on the landing is interface pulled from the app.
- One `main#main` per route; the skip link is the first focusable element.

## Product screens on the landing (12 Nov 2026)

- `components/PhoneFrame.tsx` is a CSS-only device frame: a 390×844 logical
  screen scaled to a given width. Content is `inert` + `aria-hidden` with the
  frame as `role="img"`, so real app components can be shown without being
  operable or touching storage. Captions size themselves with
  `phoneOuterWidth()`.
- `components/AppScreens.tsx` shows the real `LogScreen`, `PatternCard` and
  `WeeksView` with the sample log. Phone widths: 260 below `lg` (snap
  scroller), 280 at `lg` (3 × 280 + 2 × 48 fits the 1024 measure), 300 at `xl`.
- `components/RitualDemo.tsx` plays the real `LogScreen` through a scripted
  night via its `demo` prop (no storage writes, mic never opens). User-started,
  silent, ~9 s; under reduced motion it jumps to the end. The phone fits its
  card (ResizeObserver), max 300.
- The app icon is the wordmark's atom: a serif `f` (Lora outline, closest
  installed to Newsreader) with the sage dot, on warm black. SVG for browsers,
  PNG 180/192/512 for iOS and Android installers, a maskable variant with the
  mark inside the 80 % safe zone. Source of the mark is `public/icon.svg`.
