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
  40, plus 56 for the desktop hero only. All in `rem`, so browser text-size
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
a 740×360 landscape phone. The 1120 site measure means 1600 and 1920 gain
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
