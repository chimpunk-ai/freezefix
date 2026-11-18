// The six strongest myths people hold that stop them looking at their own
// weeks. Trimmed from eleven in Nov 2026: the five removed items (obsess,
// willpower, quit-or-carry-on, bad-week-blame, honesty) either overlapped with
// the ones kept or sat on the edge of the subject rather than at the centre.
// Every item here is still about the LOOKING — judgement, privacy, the habit
// of noticing, what the app does and doesn't do — and never a claim about
// cannabis pharmacology, doses or health outcomes. The product vision rules
// those out; this file keeps us on that side of the line.
//
// Used in two places: the landing accordion (components/MythsSection.tsx) and
// the once-a-day reframe card at the top of the log (components/DailyReframe.tsx).
// The long-form Markdown version still lives in lib/myths.ts for /myths.

export type MythItem = {
  myth: string;    // what people believe
  reality: string; // the gentle-not-preachy reply
};

export function mythItems(): MythItem[] {
  return [
    {
      myth: "if i'm not quitting, there's no point tracking.",
      reality:
        "noticing is its own thing. most people who look at a pattern change something small — or decide they're fine — without needing a plan.",
    },
    {
      myth: "an app like this is going to judge me.",
      reality:
        "fix has no counter, no clean days, no relapse, no red. a night you smoked shows as a leaf, not a mark. the word “should” doesn't appear in anything fix says.",
    },
    {
      myth: "if i miss a few nights the whole thing is ruined.",
      reality:
        "a missed night is a dot. it's never counted as a no, and there's no catch-up quiz. three logged nights is already a pattern the card can speak to.",
    },
    {
      myth: "weed isn't a problem for me, so this isn't for me.",
      reality:
        "fix isn't for people with a problem. it's for people with a pattern — which is everyone who does anything regularly. a card saying “steady” is a complete answer.",
    },
    {
      myth: "an app with my smoking history is a leak waiting to happen.",
      reality:
        "there is nothing to leak from us. no account, no email, no server copy of the log — it lives in your browser on your device.",
    },
    {
      myth: "the ai is going to lecture me or play therapist.",
      reality:
        "fix is a chart that answers from your log. it quotes your own numbers, ends on a statement rather than a question, and stops after five a day. it won't diagnose and never messages you first.",
    },
  ];
}
