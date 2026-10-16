// Harmless messages must never raise a safety level: a cautious bot is repetitive and
// makes someone who came here to feel normal feel watched instead.
// Run: npm run test:offtopic

import { keywordCheck } from "../lib/risk";
const OFFTOPIC = [
  "modi ji","who do you support","arsenal lost again","tell me a joke","what's for dinner",
  "i'm starving","pizza or burger","did you watch the match","rahul gandhi","elon musk",
  "my phone died","it's raining","what time is it","do you like music","drake or kendrick",
  "my cat is annoying","i need a haircut","what's your name","are you a robot","bored at work",
  "weather is mad today","chelsea are finished","i love biryani","england lost","random thought",
  "tell me something interesting","what's 2+2","do you sleep","who made you","nothing much",
];
let bad = 0;
for (const t of OFFTOPIC) {
  const r = keywordCheck(t);
  if (r.level !== 0 || r.screen || r.underage) { console.log(`FLAGGED level=${r.level} screen=${r.screen} cause=${JSON.stringify(r.cause)} :: "${t}"`); bad++; }
}
console.log(bad === 0 ? `All ${OFFTOPIC.length} off-topic messages returned level 0` : `${bad} false alarms`);
