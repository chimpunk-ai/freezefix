// Risk routing: the keyword check that runs IN CODE, BEFORE the AI model.
// SOURCE: FreezeFix Safety Pack v1.0, sections 1 and 5.
// Rule for doubt: if a message could be a red flag, treat it as one.
// The final level is always the HIGHER of this check and the AI model's own check.

export type RiskLevel = 0 | 1 | 2 | 3 | 4;
// 0 Normal · 1 Watch · 2 Urgent · 3 Crisis · 4 Emergency

export type HelpScreen =
  | "emergency" // R1, R2, R6, R7, R4 with plan/means/action
  | "crisis" // R4
  | "psychosis" // R5
  | "mixed" // R3
  | "doctor" // R9 repeated vomiting
  | "under18" // R8
  | "worried"; // someone ELSE in a screenshot is in crisis (Safety Pack section 9)

export type RiskResult = {
  level: RiskLevel;
  screen: HelpScreen | null;
  underage: boolean;
  cause?: Cause; // which red flag fired (used for other people's words in screenshots)
};

export type Cause = "r1" | "r2" | "r3" | "r4" | "r4plan" | "r5" | "r6" | "r7" | "r8" | "r9" | "watch";

export const NO_RISK: RiskResult = { level: 0, screen: null, underage: false };

const CANT = "(?:can'?t|cannot|can not|cant)";
const WONT = "(?:won'?t|will not|wont|doesn'?t|does not)";

const PATTERNS = {
  // R1 chest pain / heart that won't settle / fainting -> Emergency
  r1: new RegExp(
    [
      "chest (?:pain|hurts?|is hurting|feels? (?:tight|heavy|weird)|pressure|tight)",
      "(?:tight|crushing|heavy) chest",
      "chest.{0,20}(?:hurts?|hurting|pain|tight|pressure)",
      "heart attack",
      `heart(?:'s| is)? (?:\\w+ )?(?:${WONT} (?:slow|settle|stop|calm))`,
      "heart(?:'s| is)? going (?:crazy|mental|mad|1\\d\\d|2\\d\\d)",
      "heart(?:'s| is)? (?:racing|pounding|thumping|hammering)",
      "heart (?:race|pound)",
      "(?:i )?think i'?m dying",
      "arm (?:feels? )?(?:weird|numb|tingl)",
      "(?:nearly|almost|about to) (?:pass(?:ed)? out|faint(?:ed)?)",
      "\\bfaint(?:ed|ing)?\\b",
      "blacking out",
      "passed out",
    ].join("|")
  ),
  // R2 trouble breathing -> Emergency
  r2: new RegExp(
    [
      `${CANT} (?:breathe|breath|catch my breath|get (?:air|my breath))`,
      "(?:struggling|hard|trouble) (?:to )?breath(?:e|ing)",
      "throat (?:is )?(?:closing|swelling)",
      "not breathing",
    ].join("|")
  ),
  // R6 collapse / seizure / can't stay awake -> Emergency
  r6: new RegExp(
    [
      `${WONT} wake(?: up)?`,
      `${CANT} wake (?:him|her|them|up)`,
      "unconscious",
      "not responding",
      "unresponsive",
      "seizure",
      "\\bfitting\\b",
      "convuls",
      "shaking on the floor",
      "collapsed",
      `${CANT} stay awake`,
      `(?:${CANT}|barely|struggling to) keep (?:my|his|her|their) eyes open`,
    ].join("|")
  ),
  // R7 harm to others or being in danger -> Emergency
  r7: new RegExp(
    [
      "(?:want|going|gonna|about) to (?:hurt|kill|stab|attack|beat up) (?:him|her|them|someone|somebody|my|that)",
      "threaten(?:ing|ed) (?:me|to)",
      "i know where you live",
      "watch your back",
      "you'?re (?:dead|gonna die|going to die)",
      "(?:i'?ll|i will|gonna|going to) (?:find|get|hurt|kill) you",
      "(?:telling|told|tell) me to (?:hurt|kill|stab|attack)",
      "smash (?:his|her|their|someone'?s|somebody'?s|your) (?:face|head)",
      "(?:want|going|gonna) to (?:smash|batter|punch|deck|glass|knock out) (?:him|her|them|someone|somebody)",
      "(?:i'?m|i am) not safe",
      "not safe (?:here|at home)",
      "(?:i'?m|i am) in danger",
      "going to hurt me",
      "(?:someone|somebody|he|she|they|he'?s|she'?s|they'?re) (?:attacked|hit|is hurting|are hurting|hurting|beating) me",
    ].join("|")
  ),
  // R4 suicide or self-harm thoughts -> Crisis (Emergency if plan/means/action)
  r4: new RegExp(
    [
      "(?:want|wanna|wanted) to die",
      "kill my ?self",
      "\\bkms\\b",
      "unaliv",
      "\\bends? it\\b(?! (?:with|off|for now))",
      "\\bends? (?:his|her|their) (?:own )?life",
      "how (?:to|do you|would you|do i) (?:kill|end|hang|overdose)",
      "end (?:it all|my life|everything|myself)",
      "suicid",
      "hurt (?:my ?self)",
      "self[- ]?harm",
      "cut(?:ting)? (?:my ?self|my (?:arm|wrist|leg)s?)",
      "better off without me",
      "(?:don'?t|do not) want to (?:be here|live|exist|wake up|be alive)",
      "no (?:reason|point) (?:to|in) liv",
      "(?:wish|want) (?:i was|i were|to be) dead",
      "bye everyone",
      "goodbye (?:everyone|all|forever|world)",
      "this is (?:my )?goodbye",
    ].join("|")
  ),
  // R4 escalators: a plan, means, or it's happening now
  r4Plan: new RegExp(
    [
      "\\bplan\\b",
      "tonight",
      "right now",
      "\\bpills\\b",
      "\\btook\\b",
      "\\btaken\\b",
      "\\brope\\b",
      "bridge",
      "\\bjump",
      "knife",
      "overdose",
      "\\bod\\b",
      "goodbye",
      "wrote a note",
      "\\bblade",
    ].join("|")
  ),
  // Hopelessness that, with means nearby, counts as R4 with a plan (S05, S08)
  hopeless: new RegExp(
    [
      `${CANT} do (?:this|it) any ?more`,
      "what'?s the point",
      "(?:nobody|no one|noone) (?:cares|would care|would notice|would miss me)",
      "give up on everything",
      "done with (?:it all|everything|life)",
    ].join("|")
  ),
  means: /\bpills\b|\brope\b|bridge|\bjump|knife|\bblade|overdose|highest|tallest|roof|train tracks/,
  // R3 mixed with something else -> Urgent
  r3: new RegExp(
    [
      "alcohol",
      "\\bdrunk\\b",
      "booze",
      "\\bbeers?\\b",
      "\\bpints?\\b",
      "\\bcans?\\b(?: of)? (?:lager|cider|beer)",
      "\\bcider\\b",
      "\\blager\\b",
      "did (?:a|some) lines?",
      "\\ba line\\b",
      "\\bbump\\b",
      "sertraline|fluoxetine|citalopram|escitalopram|prozac|zoloft|lexapro|\\bssris?\\b|antidepressant|lithium|quetiapine|olanzapine",
      "adderall|ritalin|vyvanse|elvanse|concerta|adhd meds",
      "(?:pen|vape|cart) (?:my mate|a mate|someone|somebody|he|she|they|a guy) gave me",
      "vodka",
      "\\bwine\\b",
      "whiske?y",
      "tequila",
      "\\brum\\b",
      "(?:been|was|were|i'?ve been) drinking",
      "\\bpills?\\b",
      "xanax",
      "\\bxans?\\b",
      "benzo",
      "valium",
      "diazepam",
      "\\boxy",
      "codeine",
      "\\blean\\b",
      "tramadol",
      "prescription",
      "meds\\b",
      "medication",
      "\\bcoke\\b",
      "cocaine",
      "\\bket\\b",
      "ketamine",
      "mdma",
      "molly",
      "ecstasy",
      "\\bmandy\\b",
      "pingers",
      "\\bacid\\b",
      "\\blsd\\b",
      "shrooms",
      "mushrooms",
      "spice",
      "\\bk2\\b",
      "\\bspeed\\b",
      "\\bmeth\\b",
      "\\bcrack\\b",
      "heroin",
      "fentanyl",
      "laced",
      "pen i don'?t know",
      "tast(?:ed|es|ing) (?:weird|strange|off|wrong|chemical|funny|like chemicals)",
    ].join("|")
  ),
  // R5 signs of psychosis -> Urgent
  r5: new RegExp(
    [
      "hear(?:ing)? voices",
      "voices (?:in my head|telling|talking)",
      "seeing things",
      "see(?:ing)? (?:people|things|shapes|shadows) (?:that )?(?:aren'?t|isn'?t|nobody|no one)",
      "hallucinat",
      "hear(?:ing)? .{0,40}(?:no ?one'?s?|nobody'?s?|noones?) (?:here|there|around|in the room)",
      "(?:everything|it all|all of it) (?:feels|seems|is) like (?:a )?(?:sign|message|code)",
      "(?:haven'?t|havent|not) slept (?:in|for) (?:[3-9]|three|four|five|six|days)",
      "walls? (?:are|is) (?:moving|breathing|melting)",
      "(?:watched|watching me|listening|spying) (?:through|via|on|with) (?:my |the )?(?:phone|tv|telly|camera|laptop|wifi|devices?|walls)",
      "(?:phone|tv|telly|camera|laptop) is (?:watching|listening|recording|controlling)",
      "(?:being |am |i'?m )controlled",
      "controlling (?:me|my (?:mind|thoughts|body))",
      "(?:messages?|signs?|songs?|posts?) (?:are |is )?(?:meant|just|only) for me",
      "(?:tv|telly|radio|songs?) (?:is |are )?(?:talking to|sending|speaking to) me",
      "plotting (?:against|to)",
      "(?:they'?re|they are|everyone'?s|everyone is) in on it",
      "reading my (?:mind|thoughts)",
      "put (?:a )?(?:chip|tracker|implant)",
      `${CANT} tell what'?s real`,
      "lost track of (?:what'?s )?real",
      "nothing (?:feels|is|seems) real",
      "not real anymore",
    ].join("|")
  ),
  // R9 repeated vomiting -> Urgent
  r9: new RegExp(
    [
      "(?:throwing up|vomiting|being sick|puking) (?:all day|all night|for hours|nonstop|non-stop|since)",
      `${CANT} stop (?:throwing up|vomiting|being sick|puking)`,
      "keep (?:throwing up|vomiting|being sick|puking)",
      "only hot showers help",
    ].join("|")
  ),
  // R8 under 18 -> Stop
  r8: new RegExp(
    [
      "(?:i'?m|i am|im) (?:only )?1[0-7]\\b",
      "\\b1[0-7] (?:years? old|yo|y/o)\\b",
      "\\baged? 1[0-7]\\b",
      "\\byear (?:7|8|9|10|11|12)\\b",
      "\\b(?:6|7|8|9|10|11)th grade",
      "(?:freshman|sophomore|junior) (?:in|at) (?:high )?school",
      "\\bgcses?\\b",
      "secondary school",
      "\\bmiddle school",
      "(?:my )?(?:mum|mom|parents|dad) (?:will|might|is gonna|is going to) find out.*(?:school|teacher|class|homework)",
      "(?:school|teacher|class|homework).*(?:my )?(?:mum|mom|parents|dad) (?:will|might) find out",
      "(?:mum|mom|dad|parents) (?:will|would|is gonna|are gonna|gonna|is going to) (?:kill|murder) me.*(?:school|teacher|class|homework|exam)",
      "(?:school|teacher|class|homework|exam).*(?:mum|mom|dad|parents) (?:will|would|is gonna|are gonna|gonna) (?:kill|murder) me",
    ].join("|")
  ),
  // Level 1 Watch: vague hopelessness, very high distress, heavy edible and scared
  watch: new RegExp(
    [
      "what'?s the point",
      "overdos",
      "hopeless",
      `${CANT} (?:do|take) (?:this|it) any ?more`,
      "give up on everything",
      "edible",
      "took too much",
      "way too high",
      "too high",
      "greening",
      "heart(?:'s| is)? (?:a bit |kinda |kind of |quite |so )?fast",
      "heart(?:'s| is)? beating (?:so |really |a bit )?fast",
      "losing my mind",
      "going crazy",
      "freaking out (?:so )?bad",
    ].join("|")
  ),
} as const;


// Hindi (Devanagari) and Hinglish (Hindi in English letters) red flags.
// DRAFT starter list by PB, 16 Oct 2026. Safety & Trust must review and extend it (HQ T31)
// before Hinglish is promoted. Same levels as the English list above.
const HI = {
  r1: new RegExp(
    [
      "(?:seene|chhati|chhaati|chest) (?:me|mein|main) .{0,20}(?:dard|pain|bhaari|jakdan|pressure)",
      "dil (?:bahut )?(?:zor se |tez )?(?:dhadak|dhak dhak).{0,20}(?:ruk nahi|band nahi|kam nahi)",
      "dil ka daura",
      "dil (?:bahut |bohot |boht |itna |kaafi )?(?:tez|tej|zor se) (?:hai|chal|dhadak|ho)",
      "dil ruk (?:jayega|jaega|raha)",
      "heart attack aa",
      "दिल बहुत तेज़",
      "दिल बहुत तेज",
      "बेहोश होने",
      "behosh (?:ho(?:ne)? wala|hone laga|ho raha|ho rahi)",
      "सीने में दर्द",
      "छाती में दर्द",
      "दिल का दौरा",
    ].join("|")
  ),
  r2: new RegExp(
    [
      "saa?ns? (?:nahi|nahin|nai) (?:aa|le|ho) (?:rahi|raha|pa)",
      "saa?ns? (?:lene me|lene mein) (?:dikkat|problem|takleef)",
      "dam ghut",
      "साँस नहीं",
      "सांस नहीं",
      "दम घुट",
    ].join("|")
  ),
  r6: new RegExp(
    [
      "\\bbehosh\\b",
      "hosh (?:nahi|nahin|me nahi)",
      "(?:uth|jaag) (?:nahi|nahin) (?:raha|rahi)",
      "daure? pad",
      "बेहोश",
      "होश नहीं",
    ].join("|")
  ),
  r7: new RegExp(
    [
      "(?:maar|mar) (?:dunga|dungi|daalunga|daalungi|dalunga)",
      "jaan se (?:maar|mar)",
      "(?:dhamki|dhamka) (?:de|di|rahe|raha)",
      "(?:main|mai|me) (?:safe|surakshit) (?:nahi|nahin) (?:hoon|hu|hun)",
      "ghar (?:pe|par|me|mein) safe (?:nahi|nahin)",
      "dhamki de (?:raha|rahi|rahe)",
      "जान से मार",
      "मार दूंगा",
      "धमकी",
    ].join("|")
  ),
  r4: new RegExp(
    [
      "marna chaht?(?:a|i) (?:hoon|hu|hun)",
      "\\bmarna hai\\b",
      "mar (?:jana|jaana) hai",
      "suicide kar (?:lunga|lungi|loon|lu)",
      "mere bina sab khush",
      "khud ko hurt (?:kiya|kar)",
      "haath kaat",
      "mar ?(?:jana|jaana|jaun|jaaun|jaunga|jaungi|jaaunga) chaht?",
      "mar jaunga|mar jaungi|mar jaaun",
      "khud ?kushi",
      "aatm ?hatya|atm ?hatya",
      "suicide kar",
      "jeen?e? ka (?:mann|man|mood) nahi",
      "jeena nahi (?:chaht|hai)",
      "zindagi (?:khatam|khtm) kar",
      "(?:khud|apne aap) ko (?:khatam|khtm|maar|hurt|nuksaan|nuksan|kaat)",
      "sab (?:khatam|khtm) kar (?:du|doon|dunga)",
      "मरना चाहता",
      "मरना चाहती",
      "आत्महत्या",
      "खुदकुशी",
      "जीना नहीं",
      "खुद को (?:खत्म|मार|नुकसान)",
      "ज़िंदगी खत्म",
      "जिंदगी खत्म",
    ].join("|")
  ),
  r4Plan: new RegExp(["aaj raat", "abhi", "goliyan|goliyaan|goli", "rassi", "pul se", "kood", "chaku|chaaku", "आज रात", "अभी", "गोली", "रस्सी"].join("|")),
  r3: new RegExp(
    [
      "daaru|\\bdaru\\b",
      "sharaab|sharab",
      "\\bpeg\\b",
      "(?:goli|goliyan|tablet|pills) (?:li|le li|khayi|kha li|khaayi)",
      "nasha (?:aur|bhi)",
      "peg (?:laga|maar)",
      "kuch aur bhi (?:liya|le liya|khaya)",
      "(?:coke|md|mdma|molly) ke saath",
      "daaru ke saath|daru ke saath",
      "शराब",
      "दारू",
      "गोली",
    ].join("|")
  ),
  r5: new RegExp(
    [
      "aa?wa?a?z(?:ein|en|e)? (?:sun|aa rahi|aa rahe|keh rahi|bol rahi)",
      "(?:kuch|log) dikh (?:raha|rahe|rahi) jo (?:hai hi nahi|nahi hai|koi nahi)",
      "(?:phone|tv|camera) (?:se )?(?:control|dekh) (?:kar rahe|kar raha|rahe hain)",
      "sab (?:mere|mujhe) (?:khilaf|against) (?:saazish|plan|plot)",
      "saazish",
      "koi (?:mujhe )?control kar (?:raha|rahi|rahe)",
      "(?:cheezein|cheeze|log) dikh (?:rahi|rahe) (?:hai |hain )?jo (?:hai hi nahi|hain hi nahi)",
      "(?:tv|phone) (?:mujhe )?message bhej (?:raha|rahi)",
      "कोई कंट्रोल कर",
      "आवाज़ें सुनाई",
      "आवाज़ें सुन",
      "आवाजें सुन",
      "साज़िश",
    ].join("|")
  ),
  r9: new RegExp(
    [
      "(?:ulti|ultee|ultiyan|ultiyaan) (?:ruk nahi|band nahi|subah se|ghanton se|baar baar)",
      "(?:subah|kal raat|raat) se ulti",
      "ulti.{0,30}(?:ruk|band) (?:hi )?(?:nahi|nhi)",
      "उल्टी",
    ].join("|")
  ),
  r8: new RegExp(
    [
      "(?:main|mai|meri umar|meri age|age) 1[0-7] (?:saal|sal|ka|ki|hai|hoon|hu)",
      "\\bclass (?:8|9|10|11|12)(?:th)?\\b",
      "school (?:mein|me) (?:hoon|hu|hun|padhta|padhti)",
      "१[०-७] साल",
      "स्कूल में",
      "\\b(?:8|9|10|11)(?:th|vi|vin|veen) (?:class|kaksha|me|mein)",
      "board (?:exam|pariksha)",
      "(?:mummy|papa|mumma|ammi|abbu) ko pata chal.{0,40}(?:school|tuition|coaching|class)",
      "(?:school|tuition|coaching).{0,40}(?:mummy|papa|mumma|ammi|abbu) ko pata",
    ].join("|")
  ),
  hopeless: new RegExp(["kya fayda|koi fayda nahi|kya matlab hai (?:jeene|zindagi)", "thak gaya (?:hoon|hu) (?:zindagi|sab)", "kisi ko (?:fark|farak) nahi"].join("|")),
  // Idioms like "mar gaya yaar" (dying of embarrassment) are Watch, never crisis (Safety Pack 9).
  watch: new RegExp(
    ["kya fayda", "bahut (?:zyada )?high", "edible", "pagal ho (?:raha|gaya|jaunga)", "mar gaya yaar", "dimaa?g kharab", "kuch samajh nahi aa raha"].join("|")
  ),
} as const;

type PatternKey = keyof typeof HI;
function hit(key: PatternKey, t: string): boolean {
  return (PATTERNS as Record<string, RegExp>)[key].test(t) || HI[key].test(t);
}

function normalise(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[‘’ʼ`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// Returns the highest risk found in one message.
export function keywordCheck(text: string): RiskResult {
  const t = normalise(text);
  if (!t) return NO_RISK;

  const hits: RiskResult[] = [];

  if (hit("r8", t)) hits.push({ level: 4, screen: "under18", underage: true, cause: "r8" });
  for (const c of ["r1", "r2", "r6", "r7"] as const) {
    if (hit(c, t)) hits.push({ level: 4, screen: "emergency", underage: false, cause: c });
  }
  if (hit("r4", t)) {
    hits.push(
      hit("r4Plan", t)
        ? { level: 4, screen: "emergency", underage: false, cause: "r4plan" }
        : { level: 3, screen: "crisis", underage: false, cause: "r4" }
    );
  }
  if (hit("hopeless", t) && (PATTERNS.means.test(t) || HI.r4Plan.test(t))) {
    hits.push({ level: 4, screen: "emergency", underage: false, cause: "r4plan" });
  }
  if (hit("r5", t)) hits.push({ level: 2, screen: "psychosis", underage: false, cause: "r5" });
  if (hit("r3", t)) hits.push({ level: 2, screen: "mixed", underage: false, cause: "r3" });
  if (hit("r9", t)) hits.push({ level: 2, screen: "doctor", underage: false, cause: "r9" });
  if (hit("watch", t)) hits.push({ level: 1, screen: null, underage: false, cause: "watch" });

  return highest(hits);
}

// Risk in OTHER people's words (from a screenshot). Safety Pack section 9:
// a friend in crisis -> "Worried about someone" screen (emergency number first at level 4);
// a friend collapsed / can't breathe / took something -> Emergency; a threat -> Emergency.
// Another person's age never triggers the under-18 stop.
export function othersCheck(text: string): RiskResult {
  const t = normalise(text);
  if (!t) return NO_RISK;
  const hits: RiskResult[] = [];
  for (const c of ["r1", "r2", "r6", "r7"] as const) {
    if (hit(c, t)) hits.push({ level: 4, screen: "emergency", underage: false, cause: c });
  }
  if (hit("r3", t)) hits.push({ level: 4, screen: "emergency", underage: false, cause: "r3" });
  if (hit("r4", t) || (hit("hopeless", t) && (PATTERNS.means.test(t) || HI.r4Plan.test(t)))) {
    const plan = hit("r4Plan", t) || PATTERNS.means.test(t);
    hits.push({ level: plan ? 4 : 3, screen: "worried", underage: false, cause: plan ? "r4plan" : "r4" });
  }
  if (hit("r5", t) || hit("r9", t)) hits.push({ level: 2, screen: "worried", underage: false, cause: hit("r5", t) ? "r5" : "r9" });
  return highest(hits);
}

// Picks the most serious result. Under-18 always wins (no AI chat for under-18s).
export function highest(results: RiskResult[]): RiskResult {
  let best: RiskResult = NO_RISK;
  for (const r of results) {
    if (r.underage) return r;
    if (r.level > best.level) best = r;
    // Same level: emergency screen beats others; crisis beats psychosis/mixed/doctor.
    else if (r.level === best.level && rank(r.screen) > rank(best.screen)) best = r;
  }
  return best;
}

function rank(s: HelpScreen | null): number {
  switch (s) {
    case "under18":
      return 6;
    case "emergency":
      return 5;
    case "worried":
      return 4;
    case "crisis":
      return 4;
    case "psychosis":
      return 3;
    case "mixed":
      return 2;
    case "doctor":
      return 1;
    default:
      return 0;
  }
}

// Maps a one-tap safety-check button to its help screen (Safety Pack section 2).
export const SAFETY_BUTTONS: { id: string; label: string; result: RiskResult }[] = [
  { id: "chest", label: "Chest pain or my heart won't settle", result: { level: 4, screen: "emergency", underage: false } },
  { id: "breathe", label: "I can't breathe properly", result: { level: 4, screen: "emergency", underage: false } },
  { id: "mixed", label: "I've also had alcohol, pills or something else", result: { level: 2, screen: "mixed", underage: false } },
  { id: "selfharm", label: "I'm thinking about hurting myself or ending my life", result: { level: 3, screen: "crisis", underage: false } },
  { id: "psychosis", label: "Hearing or seeing things others don't, or feeling controlled", result: { level: 2, screen: "psychosis", underage: false } },
  { id: "collapse", label: "Someone's collapsed or won't wake up", result: { level: 4, screen: "emergency", underage: false } },
];
