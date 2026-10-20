// The scripted conversations on the landing page.
//
// Written here, never generated, and never sent anywhere: the landing page must not be able
// to imply that a live conversation happened. Every word is invented. No real person's
// messages appear in any of it.
//
// Shape: each node is something Fix says plus the replies a visitor can tap. A reply either
// points at the next node or ends the demo. Keep the branches short; this is a taster, not
// a free AI.

export type DemoReply = { text: string; to?: string; end?: string };
export type DemoNode = { fix: string; replies: DemoReply[] };
export type DemoScript = { id: string; title: string; emoji: string; start: string; nodes: Record<string, DemoNode> };

export const DEMOS: DemoScript[] = [
  {
    id: "task",
    title: "Can't start",
    emoji: "⏳",
    start: "a",
    nodes: {
      a: {
        fix: "Staring at it is the hard part, weirdly. What's the thing?",
        replies: [
          { text: "essay due tomorrow", to: "b" },
          { text: "work emails", to: "c" },
        ],
      },
      b: {
        fix: "How long have you been sat with it?",
        replies: [
          { text: "since about 2", to: "d" },
          { text: "all week honestly", to: "d" },
        ],
      },
      c: {
        fix: "How many are we talking?",
        replies: [
          { text: "like forty", to: "d" },
          { text: "one scary one", to: "d" },
        ],
      },
      d: {
        fix: "Right. Don't do the thing, just open it and type one rubbish line.",
        replies: [
          { text: "that's it?", to: "e" },
          { text: "ok i can do that", to: "e" },
        ],
      },
      e: {
        fix: "That's it. Starting badly beats not starting. Go on.",
        replies: [{ text: "alright", end: "That's a whole conversation. The real one knows your name." }],
      },
    },
  },
  {
    id: "reply",
    title: "Can't reply",
    emoji: "💌",
    start: "a",
    nodes: {
      a: {
        fix: "The longer it sits the bigger it gets. Who is it?",
        replies: [
          { text: "a mate", to: "b" },
          { text: "someone i like", to: "b" },
        ],
      },
      b: {
        fix: "How long's it been?",
        replies: [
          { text: "three days", to: "c" },
          { text: "over a week", to: "c" },
        ],
      },
      c: {
        fix: "Want me to write something that doesn't explain the gap?",
        replies: [
          { text: "go on then", to: "d" },
          { text: "i should explain though", to: "e" },
        ],
      },
      d: {
        fix: '"sorry mate, phone\'s been a black hole. still on for the weekend?"',
        replies: [{ text: "that's actually fine", end: "Copy it, send it, done. Takes about forty seconds." }],
      },
      e: {
        fix: "Nobody wants the essay. They want to know you're alright.",
        replies: [{ text: "fair", end: "Copy it, send it, done. Takes about forty seconds." }],
      },
    },
  },
  {
    id: "people",
    title: "At a party",
    emoji: "🎧",
    start: "a",
    nodes: {
      a: {
        fix: "Loud ones are rough. Can you get somewhere quieter?",
        replies: [
          { text: "kitchen maybe", to: "b" },
          { text: "stuck in the middle", to: "c" },
        ],
      },
      b: {
        fix: "Go stand in it for two minutes. Nobody clocks someone getting a drink.",
        replies: [
          { text: "ok", to: "d" },
          { text: "won't it look weird", to: "c" },
        ],
      },
      c: {
        fix: "Nobody's watching you, promise. They're all in their own head too.",
        replies: [
          { text: "i know, doesn't feel like it", to: "d" },
          { text: "yeah alright", to: "d" },
        ],
      },
      d: {
        fix: "Breathe out slow, three times. Then go back in or don't. Both fine.",
        replies: [{ text: "that helped actually", end: "No lecture, no mood tracker. Just that." }],
      },
    },
  },
];
