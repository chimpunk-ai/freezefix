// Structured myths used by the landing page accordion AND by the rotating
// reminder card the app shows at open-time. The long-form Markdown version
// still lives in lib/myths.ts for the /myths page; these two are kept in
// step by scripts/test-legal.ts (if changed there, this file is wrong).
//
// Every item is about the LOOKING — judgement, privacy, the habit of noticing,
// what the app does and doesn't do. Nothing here is a claim about cannabis
// pharmacology, health outcomes, doses or strains. The product's vision rules
// those out; any future substance claim needs cited evidence and qualified
// review first.

export type MythItem = {
  myth: string;    // what people believe
  reality: string; // the gentle-not-preachy reply
};

export function mythItems(): MythItem[] {
  return [
    {
      myth: "if i'm not quitting, there's no point tracking.",
      reality:
        "noticing is its own thing. most people who look at a pattern change something small — or decide they're fine — without needing a plan. you don't need a destination to read a map.",
    },
    {
      myth: "an app like this is going to judge me.",
      reality:
        "fix has no counter, no clean days, no relapse, no red. a night you smoked shows as a leaf, not a mark against you. the word “should” doesn't appear in anything fix says.",
    },
    {
      myth: "if i miss a few nights the whole thing is ruined.",
      reality:
        "a missed night is a dot. it's never counted as a no, it never breaks anything, and there's no catch-up quiz. three logged nights is already a pattern the card can speak to.",
    },
    {
      myth: "tracking will make me obsess about it.",
      reality:
        "nine seconds a night, one card a week. nothing pings you daily. there is nothing to check between sundays — on purpose.",
    },
    {
      myth: "you need willpower to change a habit.",
      reality:
        "habits tend to follow cues — when, where, what just happened — more than strength of character. that's why the log asks about the chip, not about resolve.",
    },
    {
      myth: "weed isn't a problem for me, so this isn't for me.",
      reality:
        "fix isn't for people with a problem. it's for people with a pattern — which is everyone who does anything regularly. a card saying “things look steady” is a complete answer.",
    },
    {
      myth: "an app with my smoking history is a leak waiting to happen.",
      reality:
        "there is nothing to leak from us. no account, no email, no server copy of the log — it lives in your browser on your device.",
    },
    {
      myth: "it's either quit, or carry on exactly as i am.",
      reality:
        "there's a lot in between — or no change at all is a real answer the card won't argue with. if the week was what you wanted it to be, “steady” is the whole answer.",
    },
    {
      myth: "the ai is going to lecture me or play therapist.",
      reality:
        "fix is a chart with manners. it quotes your own numbers back, ends on a statement rather than a question, and stops after five a day. it won't diagnose and never messages you first.",
    },
    {
      myth: "i felt worse this week, so it must be the weed.",
      reality:
        "the card only says a mood pattern out loud when there's enough on both sides — smoked nights and not — to support it. one bad week isn't a trend.",
    },
    {
      myth: "a mood tracker only works if i'm honest with myself, and i'm not always.",
      reality:
        "the faces aren't a test. you tap the nearest one. over a few weeks the shape appears anyway, because the small untruths average out and the big pattern doesn't.",
    },
  ];
}
