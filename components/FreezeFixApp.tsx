"use client";

import { useEffect, useState } from "react";
import HelpScreen, { ContactButton } from "@/components/HelpScreen";
import VoiceRecorder from "@/components/VoiceRecorder";
import ScreenshotPicker from "@/components/ScreenshotPicker";
import SiteFooter from "@/components/SiteFooter";
import Paywall from "@/components/Paywall";
import TrustedMessage from "@/components/TrustedMessage";
import WinCard from "@/components/WinCard";
import Chat from "@/components/Chat";
import Onboarding from "@/components/Onboarding";
import Breathe from "@/components/Breathe";
import Wins from "@/components/Wins";
import InstallPrompt from "@/components/InstallPrompt";
import { addWin } from "@/lib/wins";
import FactCard from "@/components/FactCard";
import Suggest from "@/components/Suggest";

import { greeting, readableMemory, memoryOn, setMemoryOn, forgetAll, noteVisit, type MemoryLine } from "@/lib/memory";
import { SAFETY_BUTTONS, keywordCheck, type HelpScreen as HelpScreenId, type RiskLevel, type RiskResult } from "@/lib/risk";
import { MOMENTS, type MomentId } from "@/lib/prompt";
import { detectRegion } from "@/lib/country";
import { resourcesFor, VERIFIED_COUNTRIES } from "@/lib/resources";
import type { Move } from "@/lib/moves";
import { scenariosFor, checkInLine, SCENARIOS, type Scenario } from "@/lib/scenarios";

type Step =
  | "loading-app"
  | "gate"
  | "blocked"
  | "home"
  | "moment"
  | "check"
  | "words"
  | "thinking"
  | "moves"
  | "doing"
  | "thanks"
  | "error"
  | "help"
  | "consent"
  | "consent-declined"
  | "settings"
  | "delete-confirm"
  | "deleted"
  | "paywall"
  | "trusted"
  | "wincard"
  | "chat"
  | "onboarding"
  | "breathe"
  | "wins"
  | "savewin"
  | "memory";

// Browser storage keys. Nothing here leaves the phone.
const K_ADULT = "ff_adult"; // "yes" once the 18+ gate is passed
const K_ADULT_DATE = "ff_adult_date"; // date the age was confirmed (never a birth date)
const K_CONSENT = "ff_health_consent"; // date the health-data consent box was ticked
const K_BLOCK = "ff_block_until"; // under-18 answer blocks this device for 24h
const K_REGION = "ff_region"; // country picked in the switcher
const K_LEVEL = "ff_session_level"; // highest risk level this session (sessionStorage)
const K_MIXED = "ff_session_mixed"; // user told us they mixed substances this session
const K_ACK = "ff_session_ack"; // urgent help screens the user has seen and tapped "Back" on

const DAY_MS = 24 * 60 * 60 * 1000;

const K_WINS = "ff_wins"; // how many times a move helped (stays on the phone)
const K_VISITS = "ff_visits"; // used only to rotate the fact on the home screen
const K_RECENT = "ff_recent_scenarios"; // scenario cards they actually use, most recent first
const K_ONBOARDED = "ff_onboarded"; // the four questions have been asked once

const MOMENT_EMOJI: Record<MomentId, string> = { people: "👤", alone: "🍃", task: "⏳", reply: "💌" };

// One-tap phrases so nobody has to type when they're frozen (lazy-friendly).
const QUICK_PICKS: Record<MomentId, string[]> = {
  people: ["everyone's looking at me", "I said something weird", "can't join in", "want to leave"],
  alone: ["can't stop overthinking", "replaying what I said", "feel on edge", "it's all too much"],
  task: ["can't start", "keep scrolling instead", "it's too big", "deadline's close"],
  reply: ["don't know what to say", "it's been hours", "scared how it'll sound", "left them on read"],
};

// A tiny buzz on Android when a big button is tapped. iPhones ignore it.
function buzz(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* ignore */
  }
}

const PLACEHOLDERS: Record<MomentId, string> = {
  people: "e.g. at a mate's place, everyone's talking and I think they're looking at me",
  alone: "e.g. can't stop replaying what I said earlier",
  task: "e.g. need to email my manager and I just keep staring at it",
  reply: "e.g. she messaged 3 hours ago and I don't know what to say",
};

function store(kind: "local" | "session") {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}
function get(kind: "local" | "session", key: string) {
  try {
    return store(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
function set(kind: "local" | "session", key: string, value: string) {
  try {
    store(kind)?.setItem(key, value);
  } catch {
    /* storage can be blocked; the app still works for this visit */
  }
}

export default function FreezeFixApp() {
  const [step, setStep] = useState<Step>("loading-app");
  const [region, setRegion] = useState("");
  const [detected, setDetected] = useState("");
  const [moment, setMoment] = useState<MomentId>("alone");
  const [text, setText] = useState("");
  const [moves, setMoves] = useState<Move[]>([]);
  const [picked, setPicked] = useState<Move | null>(null);
  const [checkQuestion, setCheckQuestion] = useState<string | null>(null);
  const [sessionLevel, setSessionLevel] = useState<RiskLevel>(0);
  const [mixed, setMixed] = useState(false);
  const [help, setHelp] = useState<{ screen: HelpScreenId; returnTo: Step | "continue" | "words-ack" | null } | null>(null);
  const [helped, setHelped] = useState<boolean | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  // Worked out once the component is on screen, so the server and the phone can't disagree
  // about the time of day and trip a hydration error.
  const [homeScenarios, setHomeScenarios] = useState<Scenario[]>([]);
  const [checkIn, setCheckIn] = useState("");
  const [winText, setWinText] = useState("");
  /** Text from a "Sound familiar?" card, auto-sent as the first user message. */
  const [autoMessage, setAutoMessage] = useState<string | null>(null);

  function saveWin() {
    if (winText.trim()) addWin(winText, MOMENTS[moment]);
    setWinText("");
    setStep("wins");
  }

  // Where consent and onboarding hand off to: straight into the chat when they came from a
  // scenario card, otherwise the "what's going on" picker.
  function afterConsent(): Step {
    if (scenario) return features.ai ? "chat" : "words";
    return "moment";
  }

  // Remembers which cards they actually tap, so the useful ones drift to the top.
  function noteScenario(id: string) {
    let recent: string[] = [];
    try {
      recent = JSON.parse(get("local", K_RECENT) || "[]");
    } catch {
      recent = [];
    }
    set("local", K_RECENT, JSON.stringify([id, ...recent.filter((r) => r !== id)].slice(0, 6)));
  }
  const [acked, setAcked] = useState<HelpScreenId[]>([]);
  const [voiceText, setVoiceText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [inputNote, setInputNote] = useState<string | null>(null);
  const [consentTicked, setConsentTicked] = useState(false);
  const [adultTicked, setAdultTicked] = useState(false);
  const [paywallFrom, setPaywallFrom] = useState<"feedback" | "session">("session");
  const [settingsNote, setSettingsNote] = useState<string | null>(null);
  const [wins, setWins] = useState(0);
  const [thawing, setThawing] = useState(false);
  const [memLines, setMemLines] = useState<MemoryLine[]>([]);
  const [memOn, setMemOn] = useState(true);
  const [hello, setHello] = useState("");
  const [features, setFeatures] = useState({ ai: false, voice: false, screenshot: false });

  // Which optional inputs are switched on (voice needs a transcription key, screenshots need the AI).
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((f) => {
        const browserSpeech =
          typeof window !== "undefined" &&
          Boolean(
            (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
              (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
          );
        setFeatures({ ai: !!f.ai, voice: !!f.voice || browserSpeech, screenshot: !!f.screenshot });
      })
      .catch(() => {});
  }, []);

  // First load: 18+ gate, 24h block, country, session risk level.
  useEffect(() => {
    const d = detectRegion();
    setDetected(d);
    setRegion(get("local", K_REGION) || d);
    setSessionLevel((Number(get("session", K_LEVEL)) || 0) as RiskLevel);
    setMixed(get("session", K_MIXED) === "1");
    setWins(Number(get("local", K_WINS)) || 0);
    setHello(greeting());
    setMemOn(memoryOn());
    setCheckIn(checkInLine());

    // A scenario card on the landing page hands over as /app?s=<id>&msg=<text>.
    // Unknown ids are ignored rather than trusted, and the parameters are cleaned off the
    // URL afterwards so a shared link doesn't carry someone's situation around with it.
    let wanted: Scenario | null = null;
    let msgParam: string | null = null;
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("s");
      msgParam = params.get("msg");
      wanted = (id && SCENARIOS.find((x) => x.id === id)) || null;
      if (id || msgParam) window.history.replaceState({}, "", window.location.pathname);
    } catch {
      wanted = null;
    }
    // When a Sound Familiar card passes its text, auto-send it as the first user message.
    if (msgParam && wanted) setAutoMessage(msgParam);

    let recent: string[] = [];
    try {
      recent = JSON.parse(get("local", K_RECENT) || "[]");
    } catch {
      recent = [];
    }
    setHomeScenarios(scenariosFor({ recent }).slice(0, 6));
    try {
      setAcked(JSON.parse(get("session", K_ACK) || "[]"));
    } catch {
      setAcked([]);
    }

    const blockUntil = Number(get("local", K_BLOCK) || 0);
    if (blockUntil > Date.now()) {
      setStep("blocked");
    } else if (get("local", K_ADULT) === "yes") {
      // A deep-linked scenario skips the home screen, but never the consent or the
      // onboarding they haven't done yet.
      if (wanted) {
        setScenario(wanted);
        setMoment(wanted.moment);
        noteScenario(wanted.id);
        setStep(!get("local", K_CONSENT) ? "consent" : "chat");
      } else {
        setStep("home");
      }
    } else {
      // First-time visitor: the consent screen doubles as the 18+ gate (it has both the
      // age checkbox and the AI-consent checkbox). The old separate "gate" step is kept
      // only as a fallback for edge cases.
      if (wanted) {
        setScenario(wanted);
        setMoment(wanted.moment);
      }
      setStep("consent");
    }
  }, []);

  function changeRegion(r: string) {
    // "Somewhere else" keeps the device's own region so we can still show its emergency number.
    const next = r === "OTHER" && !(VERIFIED_COUNTRIES as string[]).includes(detected) ? detected || "OTHER" : r;
    setRegion(next);
    set("local", K_REGION, next);
  }

  // The highest risk level seen in a session sticks for the rest of that session.
  function raiseLevel(level: RiskLevel) {
    if (level > sessionLevel) {
      setSessionLevel(level);
      set("session", K_LEVEL, String(level));
    }
  }

  function showHelp(screen: HelpScreenId, returnTo: Step | "continue" | "words-ack" | null) {
    setHelp({ screen, returnTo });
    setStep("help");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  // Routes a risk result to its help screen. Returns true if the normal flow must stop.
  function route(r: RiskResult, ack: HelpScreenId[] = acked): boolean {
    if (r.underage) {
      blockDevice();
      return true;
    }
    if (r.level > 0) raiseLevel(r.level);
    if (r.screen === "mixed") {
      setMixed(true);
      set("session", K_MIXED, "1");
    }
    if (r.level >= 3 && r.screen) {
      // Crisis (3) / Emergency (4): no moves; back goes home with help one tap away.
      showHelp(r.screen, "home");
      return true;
    }
    if (r.level === 2 && r.screen && !ack.includes(r.screen)) {
      // Urgent (2): help first, normal flow only after "Back to FreezeFix".
      // From the safety check, back goes to the words screen; from a message, back continues to moves.
      showHelp(r.screen, step === "check" ? "words-ack" : "continue");
      return true;
    }
    return false;
  }

  function acknowledge(screen: HelpScreenId): HelpScreenId[] {
    const next = acked.includes(screen) ? acked : [...acked, screen];
    setAcked(next);
    set("session", K_ACK, JSON.stringify(next));
    return next;
  }

  function blockDevice() {
    set("local", K_BLOCK, String(Date.now() + DAY_MS));
    set("local", K_ADULT, "no");
    setStep("blocked");
  }

  function resetFlow() {
    setText("");
    setVoiceText("");
    setImage(null);
    setInputNote(null);
    setMoves([]);
    setPicked(null);
    setCheckQuestion(null);
    setHelped(null);
  }

  async function getMoves(ack: HelpScreenId[] = acked) {
    // Crisis or emergency earlier in this session: help stays first, no AI moves.
    if (sessionLevel >= 3) {
      showHelp(sessionLevel >= 4 ? "emergency" : "crisis", "home");
      return;
    }
    // Same keyword check in the browser first, so help shows instantly even offline.
    if (route(keywordCheck([text, voiceText].filter(Boolean).join("\n")), ack)) return;

    setStep("thinking");
    try {
      const res = await fetch("/api/moves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moment,
          text,
          voice: voiceText || undefined,
          image: image || undefined,
          groundingOnly: mixed || ack.includes("mixed"),
          country: region,
          acknowledged: ack,
        }),
      });
      if (!res.ok) {
        const err = ((await res.json().catch(() => ({}))) as { error?: string }).error;
        const notes: Record<string, string> = {
          not_chat: "This one's not a chat screenshot, so we can't use it. Type it in a few words instead.",
          screenshot_limit: "That's today's screenshots. You can still type or say it, and help is always here.",
          screenshot_off: "Screenshots aren't switched on yet. You can type instead.",
          bad_image: "Couldn't read that image. Try another screenshot.",
        };
        if (err && notes[err]) {
          setImage(null);
          setInputNote(notes[err]);
          setStep("words");
          return;
        }
        throw new Error(String(res.status));
      }
      const data = (await res.json()) as {
        paywall?: boolean;
        level: RiskLevel;
        screen: HelpScreenId | null;
        underage: boolean;
        checkQuestion: string | null;
        moves: Move[];
      };
      if (data.paywall) {
        // Free unfreeze used and no trial/plan yet. Safety already ran on the server.
        if (data.level > 0) raiseLevel(data.level);
        setPaywallFrom("session");
        setStep("paywall");
        return;
      }
      if (route({ level: data.level, screen: data.screen, underage: data.underage }, ack)) return;
      if (data.level > 0) raiseLevel(data.level);
      setMoves(data.moves);
      setCheckQuestion(data.checkQuestion);
      setStep("moves");
    } catch {
      setStep("error");
    }
  }

  // Settings → Delete everything. Clears this device and the anonymous device cookie.
  // (No accounts exist yet; when paid plans ship, this also deletes the account on the server.)
  async function deleteEverything() {
    // Keep an under-18 block in place so it can't be skipped by deleting.
    const block = get("local", K_BLOCK);
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
      forgetAll();
      if (block && Number(block) > Date.now()) window.localStorage.setItem(K_BLOCK, block);
    } catch {
      /* ignore */
    }
    await fetch("/api/forget", { method: "POST" }).catch(() => {});
    resetFlow();
    setSessionLevel(0);
    setMixed(false);
    setAcked([]);
    setConsentTicked(false);
    setStep("deleted");
  }

  function sendFeedback(value: boolean) {
    setHelped(value);
    buzz(value ? 30 : 12);
    if (value) {
      const next = wins + 1;
      setWins(next);
      set("local", K_WINS, String(next));
    }
    // Paywall right after a 👍 (founder decision 16 Oct). People already on a trial or plan
    // pass straight through to the thanks screen.
    if (value) {
      setPaywallFrom("feedback");
      setStep("paywall");
    } else {
      setStep("thanks");
    }
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ helped: value, moment, country: region }),
    }).catch(() => {});
  }

  const res = resourcesFor(region);
  const showHelpCard = sessionLevel >= 3 && step !== "help" && step !== "blocked" && step !== "gate";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-8 pt-4">
      {/* Top bar: brand + the Emergency link that sits on every screen, free, no login. */}
      <header className="mb-8 flex items-center justify-between">
        <button
          onClick={() => {
            if (step === "gate" || step === "blocked") return;
            resetFlow();
            setStep("home");
          }}
          className="text-lg font-semibold text-ink"
          aria-label="FreezeFix home"
        >
          freezefix
        </button>
        {step !== "loading-app" && !(step === "help" && help?.screen === "emergency") && (
          <button
            onClick={() => showHelp("emergency", step === "blocked" ? null : step === "help" ? help?.returnTo ?? "home" : step)}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
          >
            Get help
          </button>
        )}
      </header>

      <main className="flex flex-1 flex-col">
        {step === "loading-app" && <div className="flex-1" />}

        {step === "gate" && (
          <Screen title="First things first">
            <p className="text-lg text-ink-soft">FreezeFix is for adults only. Are you 18 or over?</p>
            <div className="mt-6 flex flex-col gap-3">
              <BigButton
                onClick={() => {
                  set("local", K_ADULT, "yes");
                  set("local", K_ADULT_DATE, new Date().toISOString().slice(0, 10));
                  // Honour a scenario held from a landing-page deep link so a first-time
                  // visitor who tapped a card goes straight into typing, not to the home
                  // screen with another set of cards to pick from. Mirrors the already-18+
                  // path at the top of the file (see useEffect, "deep-linked scenario").
                  if (scenario) {
                    setStep(
                      !get("local", K_CONSENT)
                        ? "consent"
                        : features.ai
                          ? "chat"
                          : "words"
                    );
                  } else {
                    setStep("home");
                  }
                }}
              >
                I&apos;m 18 or over
              </BigButton>
              <GhostButton onClick={blockDevice}>I&apos;m under 18</GhostButton>
            </div>
          </Screen>
        )}

        {step === "blocked" && (
          <HelpScreen screen="under18" region={region} onRegionChange={changeRegion} />
        )}

        {step === "home" && (
          <div className="flex flex-1 flex-col gap-6">
            <div className="flex flex-col gap-1 pt-3">
              <p className="text-lg text-ink-soft">{hello || "Hey."}</p>
              <h1 className="text-[2.6rem] font-extrabold leading-[1.05] text-ink">{checkIn || "Frozen?"}</h1>
            </div>

            {/* Always reachable, whatever else is on the screen. */}
            <button
              onClick={() => {
                buzz(25);
                setThawing(true);
                const go = () => {
                  setThawing(false);
                  resetFlow();
                  setScenario(null);
                  setStep(get("local", K_CONSENT) ? "moment" : "consent");
                };
                const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
                if (reduce) go();
                else setTimeout(go, 450);
              }}
              className={`ice w-full rounded-[2rem] px-6 py-7 font-[family-name:var(--font-display)] text-3xl font-extrabold ${thawing ? "thawing" : ""}`}
            >
              I&apos;m frozen
            </button>

            {/* Works with no AI, no signal and no account. */}
            <button
              onClick={() => {
                buzz();
                setStep("breathe");
              }}
              className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-base font-medium text-ink transition active:scale-[0.97]"
            >
              Just breathe · 1 min
            </button>

            {/* Quick-start scenario cards — personalised by recent use */}
            {homeScenarios.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-ink-soft">Or pick what fits</p>
                <div className="grid grid-cols-2 gap-2">
                  {homeScenarios.slice(0, 6).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        buzz();
                        resetFlow();
                        setScenario(s);
                        setMoment(s.moment);
                        noteScenario(s.id);
                        setStep(get("local", K_CONSENT) ? (features.ai ? "chat" : "words") : "consent");
                      }}
                      className="flex items-center gap-2.5 rounded-2xl border border-line bg-card px-3 py-3 text-left transition active:scale-[0.97]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-chip text-lg" aria-hidden="true">{s.emoji}</span>
                      <span className="text-[0.82rem] font-medium leading-snug text-ink">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <FactCard />

            <Suggest compact onRoute={(r) => route({ level: r.level, screen: r.screen, underage: r.underage })} />

            <div className="mt-auto flex flex-col gap-4 pt-2">
              {wins > 0 && (
                <button
                  onClick={() => setStep("wins")}
                  className="flex items-center justify-between rounded-2xl border border-line bg-card px-4 py-3 transition active:scale-[0.97]"
                >
                  <span className="text-sm font-medium text-ink-soft">Your wins</span>
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-bold text-accent">{wins}</span>
                </button>
              )}
              <p className="mx-auto max-w-[30ch] text-center text-sm leading-relaxed text-ink-faint">
                No account, no name. What it learns about you stays on this phone, not on our servers.
              </p>
              <button onClick={() => setStep("settings")} className="self-center text-sm text-ink-soft underline underline-offset-4">
                Privacy &amp; settings
              </button>
              <SiteFooter />
            </div>
          </div>
        )}

        {step === "moment" && (
          <Screen title="What's going on?">
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(MOMENTS) as MomentId[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    buzz();
                    setMoment(m);
                    setStep(features.ai ? "chat" : "words");
                  }}
                  className="flex aspect-square flex-col justify-between rounded-[1.75rem] border border-line bg-card p-4 text-left transition active:scale-[0.97]"
                >
                  <span className="text-4xl" aria-hidden="true">{MOMENT_EMOJI[m]}</span>
                  <span className="text-lg font-semibold leading-tight text-ink">{MOMENTS[m]}</span>
                </button>
              ))}
            </div>
          </Screen>
        )}

        {step === "check" && (
          <Screen title="Which one?" subtitle="So we get you the right help, fast.">
            <div className="flex flex-col gap-2">
              {SAFETY_BUTTONS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => route(b.result)}
                  className="rounded-2xl border border-line bg-card px-4 py-3 text-left text-base text-ink transition active:scale-[0.99]"
                >
                  {b.label}
                </button>
              ))}
              {/* "None of these" is the largest button, never pre-selected. */}
              <button
                onClick={() => setStep("words")}
                className="mt-2 rounded-[1.75rem] bg-accent px-5 py-5 text-xl font-bold text-accent-ink transition active:scale-[0.98]"
              >
                None of these
              </button>
            </div>
          </Screen>
        )}

        {step === "words" && (
          <Screen title="What's going on?" subtitle="Tap one, type it, however. Any language.">
            <div className="mb-3 flex flex-wrap gap-2">
              {QUICK_PICKS[moment].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    buzz();
                    setText((t) => (t.trim() ? `${t.trim()}, ${q}` : q).slice(0, 400));
                  }}
                  className="rounded-full bg-chip px-4 py-2 text-base text-ink transition active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 400))}
              rows={3}
              placeholder={PLACEHOLDERS[moment]}
              className="w-full resize-none rounded-2xl border border-line bg-card p-4 text-lg text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
            />
            <div className="mt-1 flex justify-end text-xs text-ink-faint">
              <span>{text.length}/400</span>
            </div>

            {voiceText && (
              <div className="mt-3 rounded-2xl border border-line bg-card p-3">
                <div className="mb-1 flex items-center justify-between text-xs text-ink-faint">
                  <span>Your voice note</span>
                  <button onClick={() => setVoiceText("")} className="underline">
                    Remove
                  </button>
                </div>
                <p className="text-base text-ink">{voiceText}</p>
              </div>
            )}

            <div className="mt-3 flex flex-col gap-3">
              {features.voice && !voiceText && (
                <VoiceRecorder onText={(t) => setVoiceText(t)} onLimit={(m) => setInputNote(m)} />
              )}
              {features.screenshot && <ScreenshotPicker image={image} onChange={(d) => { setImage(d); setInputNote(null); }} />}
            </div>

            {inputNote && <p className="mt-3 rounded-xl bg-chip px-4 py-3 text-sm text-ink-soft">{inputNote}</p>}

            <div className="mt-5 flex flex-col gap-3">
              <BigButton onClick={() => getMoves()}>Get my moves</BigButton>
              <button
                onClick={() => setStep("check")}
                className="self-center py-1 text-sm text-ink-faint underline underline-offset-4"
              >
                Something feels wrong with my body
              </button>
              {!text.trim() && !voiceText && !image && (
                <GhostButton onClick={() => getMoves()}>Skip, just give me moves</GhostButton>
              )}
            </div>
            <p className="mt-6 text-center text-xs leading-relaxed text-ink-faint">
              Your notes stay on your phone. What you type goes to our AI to get your moves and isn&apos;t stored.
              {(features.voice || features.screenshot) && " Voice notes and screenshots are handled the same way: used once, never stored."}
            </p>
          </Screen>
        )}

        {step === "thinking" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-line border-t-accent" />
            <p className="text-lg text-ink-soft">Breathe out slowly while I think…</p>
          </div>
        )}

        {step === "error" && (
          <Screen title="That didn't load">
            <p className="text-lg text-ink-soft">Give it another go. If things feel serious, the Emergency button is up top.</p>
            <div className="mt-6 flex flex-col gap-3">
              <BigButton onClick={() => getMoves()}>Try again</BigButton>
              <GhostButton onClick={() => showHelp("emergency", "error")}>Emergency help</GhostButton>
            </div>
          </Screen>
        )}

        {step === "moves" && (
          <Screen title={checkQuestion ? "First, one thing" : "Pick one move"}>
            {checkQuestion ? (
              <div className="flex flex-col gap-3">
                <p className="text-xl text-ink">{checkQuestion}</p>
                <BigButton onClick={() => setCheckQuestion(null)}>Yes, I&apos;m safe</BigButton>
                <GhostButton
                  onClick={() => {
                    raiseLevel(3);
                    showHelp("crisis", "home");
                  }}
                >
                  Not really
                </GhostButton>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {moves.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPicked(m);
                      setStep("doing");
                    }}
                    className="flex flex-col gap-1 rounded-[1.75rem] border border-line bg-card px-5 py-5 text-left transition hover:border-accent active:scale-[0.98]"
                  >
                    <span className="text-xl font-bold text-ink">{m.title}</span>
                    <span className="text-base text-ink-soft">{m.detail}</span>
                  </button>
                ))}
                <button
                  onClick={() => setStep("trusted")}
                  className="mt-1 rounded-2xl border border-line px-5 py-4 text-left text-lg font-semibold text-ink transition active:scale-[0.98]"
                >
                  Text someone, but I can&apos;t find the words
                </button>
                <p className="mt-2 text-sm leading-relaxed text-ink-faint">
                  FreezeFix gives ideas, not medical advice. If you feel unsafe, have chest pain or can&apos;t breathe, call
                  your local emergency number.
                </p>
              </div>
            )}
          </Screen>
        )}

        {step === "doing" && picked && (
          <Screen title={picked.title}>
            <p className="text-xl leading-relaxed text-ink">{picked.detail}</p>
            <p className="mt-3 text-ink-faint">Take your time. Come back when you&apos;ve done it.</p>
            <div className="mt-10 flex flex-col gap-3">
              <p className="text-center text-lg font-medium text-ink">Did it help?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => sendFeedback(true)}
                  className="rounded-[1.75rem] bg-accent py-7 text-5xl transition active:scale-95"
                  aria-label="Yes, it helped"
                >
                  👍
                </button>
                <button
                  onClick={() => sendFeedback(false)}
                  className="rounded-[1.75rem] border border-line bg-card py-7 text-5xl transition active:scale-95"
                  aria-label="No, it didn't help"
                >
                  👎
                </button>
              </div>
            </div>
          </Screen>
        )}

        {step === "thanks" && (
          <Screen title={helped ? "Nice one." : "Thanks for saying."}>

            <p className="text-lg text-ink-soft">
              {helped ? "Go easy on yourself tonight." : "Fair enough. Want to try something else?"}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {helped && <BigButton onClick={() => setStep("savewin")}>Save this one</BigButton>}
              {helped && <GhostButton onClick={() => setStep("wincard")}>Make a card for it</GhostButton>}
              {!helped && moves.length > 1 && <BigButton onClick={() => setStep("moves")}>Try another move</BigButton>}
              <GhostButton
                onClick={() => {
                  resetFlow();
                  setStep("home");
                }}
              >
                Done
              </GhostButton>
            </div>
            {/* Offered only here: something has just gone well, which is the one moment
                asking isn't an interruption. */}
            {helped && (
              <div className="mt-6">
                <InstallPrompt />
              </div>
            )}
          </Screen>
        )}

        {step === "chat" && (
          <Chat
            key={scenario?.id ?? moment}
            moment={moment}
            region={region}
            groundingOnly={mixed}
            acknowledged={acked}
            features={features}
            scenario={scenario?.id}
            opener={autoMessage ? "" : (scenario?.opener || undefined)}
            openerChips={autoMessage ? [] : (scenario?.chips || undefined)}
            initialMessage={autoMessage ?? undefined}
            onRoute={(r) => route({ level: r.level, screen: r.screen, underage: r.underage })}
            onPaywall={() => {
              setPaywallFrom("session");
              setStep("paywall");
            }}
            onTrusted={() => setStep("trusted")}
            onHelped={() => sendFeedback(true)}
          />
        )}

        {step === "breathe" && <Breathe onDone={() => setStep("home")} />}

        {step === "wins" && <Wins onBack={() => setStep("home")} onAdd={() => setStep("savewin")} />}

        {step === "savewin" && (
          <Screen title="What did you get through?">
            <p className="text-lg text-ink-soft">Your words. Short is fine.</p>
            <input
              value={winText}
              onChange={(e) => setWinText(e.target.value.slice(0, 140))}
              onKeyDown={(e) => e.key === "Enter" && saveWin()}
              placeholder="e.g. sent the message"
              autoComplete="off"
              className="mt-4 w-full rounded-2xl border border-line bg-card px-5 py-4 text-xl text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {["went anyway", "sent it", "started it", "said no"].map((s) => (
                <button key={s} onClick={() => setWinText(s)} className="rounded-full bg-chip px-4 py-2 text-base text-ink">
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <BigButton onClick={saveWin}>Save it</BigButton>
              <GhostButton onClick={() => setStep("wins")}>Skip</GhostButton>
            </div>
          </Screen>
        )}

        {step === "onboarding" && (
          <Onboarding
            onDone={() => {
              set("local", K_ONBOARDED, "yes");
              setHello(greeting());
              setStep(afterConsent());
            }}
          />
        )}

        {step === "memory" && (
          <Screen title="What Fix remembers" subtitle="All of it lives on this phone. None of it reaches us.">
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-line bg-card p-4 text-base text-ink">
              <span>Let Fix remember me</span>
              <input
                type="checkbox"
                checked={memOn}
                onChange={(e) => {
                  setMemoryOn(e.target.checked);
                  setMemOn(e.target.checked);
                  setMemLines(readableMemory());
                }}
                className="h-5 w-5 accent-[var(--color-accent)]"
              />
            </label>

            <div className="mt-4 flex flex-col gap-2">
              {memLines.length === 0 && (
                <p className="px-1 text-base text-ink-soft">
                  {memOn ? "Nothing yet. It picks things up as you chat." : "Memory's off, so Fix starts fresh every time."}
                </p>
              )}
              {memLines.map((l, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3">
                  <span className="flex-1">
                    <span className="block text-xs text-ink-faint">{l.label}</span>
                    <span className="text-base text-ink">{l.value}</span>
                  </span>
                  <button
                    onClick={() => {
                      l.clear();
                      setMemLines(readableMemory());
                    }}
                    className="shrink-0 rounded-full bg-chip px-3 py-1.5 text-sm text-ink-soft"
                  >
                    Forget
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {memLines.length > 0 && (
                <GhostButton
                  onClick={() => {
                    forgetAll();
                    setMemLines([]);
                  }}
                >
                  Forget all of it
                </GhostButton>
              )}
              <button onClick={() => setStep("settings")} className="self-center py-2 text-sm text-ink-faint underline underline-offset-4">
                Back
              </button>
            </div>
          </Screen>
        )}

        {step === "wincard" && (
          <WinCard moment={moment} wins={wins} onClose={() => setStep("thanks")} />
        )}

        {step === "trusted" && (
          <TrustedMessage
            onRoute={(screen, underage) => {
              if (underage) blockDevice();
              else {
                raiseLevel(screen === "emergency" ? 4 : 3);
                showHelp(screen, "home");
              }
            }}
            onClose={() => setStep(features.ai ? "chat" : moves.length ? "moves" : "home")}
          />
        )}

        {step === "paywall" && (
          <Paywall
            onActive={() => {
              if (paywallFrom === "session") getMoves();
              else setStep("thanks");
            }}
            onClose={() => setStep(paywallFrom === "feedback" ? "thanks" : "home")}
          />
        )}

        {step === "consent" && (
          <section className="flex flex-1 flex-col">
            {/* Minimal premium header */}
            <div className="flex flex-col items-center gap-3 pt-6 pb-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-frost/10">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-frost" aria-hidden="true">
                  <path d="M12 2L4 6v5c0 5.25 3.4 10.2 8 11.5 4.6-1.3 8-6.25 8-11.5V6L12 2z" stroke="currentColor" strokeWidth="1.8" fill="none" />
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <h1 className="text-center text-3xl font-extrabold leading-tight text-ink">Private by design</h1>
              <p className="max-w-[28ch] text-center text-base leading-relaxed text-ink-soft">
                No account. No sign-up. Everything stays on your device.
              </p>
            </div>

            {/* Clean disclosure strip */}
            <div className="mt-6 rounded-2xl border border-line bg-card">
              <div className="flex items-center gap-3 border-b border-line px-5 py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-frost/10 text-sm text-frost" aria-hidden="true">AI</span>
                <p className="text-[0.92rem] leading-snug text-ink">What you type is processed by AI to reply, then discarded</p>
              </div>
              <div className="flex items-center gap-3 border-b border-line px-5 py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-frost/10 text-sm text-frost" aria-hidden="true">18+</span>
                <p className="text-[0.92rem] leading-snug text-ink">Adults only — supportive software, not therapy</p>
              </div>
              <div className="flex items-center gap-3 px-5 py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-frost/10 text-sm text-frost" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="3" y="6.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" /><path d="M5.5 6.5V5a2.5 2.5 0 015 0v1.5" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
                </span>
                <p className="text-[0.92rem] leading-snug text-ink">No conversations stored, no personal data collected</p>
              </div>
            </div>

            {/* Compact checkboxes */}
            <div className="mt-5 flex flex-col gap-2.5">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-[0.95rem] text-ink transition active:bg-chip/50">
                <input
                  type="checkbox"
                  checked={adultTicked}
                  onChange={(e) => setAdultTicked(e.target.checked)}
                  className="h-[1.15rem] w-[1.15rem] shrink-0 rounded accent-[var(--color-frost)]"
                />
                <span>I&apos;m 18 or older</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-[0.95rem] text-ink transition active:bg-chip/50">
                <input
                  type="checkbox"
                  checked={consentTicked}
                  onChange={(e) => setConsentTicked(e.target.checked)}
                  className="h-[1.15rem] w-[1.15rem] shrink-0 rounded accent-[var(--color-frost)]"
                />
                <span>I understand Fix uses AI</span>
              </label>
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                disabled={!consentTicked || !adultTicked}
                onClick={() => {
                  set("local", K_CONSENT, new Date().toISOString().slice(0, 10));
                  set("local", K_ADULT, "yes");
                  set("local", K_ADULT_DATE, new Date().toISOString().slice(0, 10));
                  setStep(afterConsent());
                }}
                className="w-full rounded-[2rem] bg-accent px-5 py-5 text-xl font-bold text-accent-ink shadow-[0_14px_32px_-14px_rgba(227,182,116,0.6)] transition disabled:opacity-30 disabled:shadow-none active:scale-[0.98]"
              >
                Get started
              </button>
              <div className="flex items-center justify-center gap-4 pt-1">
                <a href="/privacy" target="_blank" className="text-sm text-ink-faint underline underline-offset-4">Privacy</a>
                <span className="text-ink-faint/40">·</span>
                <button onClick={() => setStep("consent-declined")} className="text-sm text-ink-faint underline underline-offset-4">Not now</button>
                <span className="text-ink-faint/40">·</span>
                <button onClick={blockDevice} className="text-sm text-ink-faint underline underline-offset-4">Under 18</button>
              </div>
            </div>

            {/* Crisis access always visible */}
            <p className="mt-auto pt-6 text-center text-xs leading-relaxed text-ink-faint">
              In crisis?{" "}
              <a href="/help" className="font-medium text-frost underline underline-offset-2">Get help</a>{" "}
              is always free, no sign-up needed.
            </p>
          </section>
        )}

        {step === "consent-declined" && (
          <Screen title="No problem">
            <p className="text-lg text-ink-soft">
              All good. Without that we can&apos;t work out your moves, but nothing else changes and you can switch it on
              any time.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <BigButton onClick={() => setStep("consent")}>I&apos;ve changed my mind</BigButton>
              <GhostButton onClick={() => {
                // If they haven't confirmed age yet, send them to the landing page instead
                if (get("local", K_ADULT) !== "yes") {
                  window.location.href = "/";
                  return;
                }
                setStep("home");
              }}>Back</GhostButton>
            </div>
          </Screen>
        )}

        {step === "settings" && (
          <Screen title="Privacy & settings">
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl border border-line bg-card p-4 text-base text-ink-soft">
                Your notes stay on your phone. What you type goes to our AI to get your moves and isn&apos;t stored.
              </div>
              {get("local", K_CONSENT) ? (
                <GhostButton
                  onClick={() => {
                    try {
                      window.localStorage.removeItem(K_CONSENT);
                    } catch {
                      /* ignore */
                    }
                    setConsentTicked(false);
                    setStep("home");
                  }}
                >
                  Withdraw consent
                </GhostButton>
              ) : (
                <p className="px-1 text-sm text-ink-faint">You haven&apos;t given consent for sessions on this device.</p>
              )}
              <GhostButton
                onClick={async () => {
                  setSettingsNote(null);
                  try {
                    const r = await fetch("/api/portal", { method: "POST" });
                    const d = (await r.json()) as { url?: string; error?: string };
                    if (d.url) window.location.href = d.url;
                    else setSettingsNote(d.error === "no_subscription" ? "There's no plan on this device." : "Couldn't open that right now. Email hello@getfreezefix.com and we'll sort it.");
                  } catch {
                    setSettingsNote("Couldn't open that right now. Email hello@getfreezefix.com and we'll sort it.");
                  }
                }}
              >
                Manage subscription
              </GhostButton>
              {settingsNote && <p className="px-1 text-sm text-ink-soft">{settingsNote}</p>}
              <GhostButton
                onClick={() => {
                  setMemLines(readableMemory());
                  setMemOn(memoryOn());
                  setStep("memory");
                }}
              >
                What Fix remembers
              </GhostButton>
              <GhostButton onClick={() => setStep("delete-confirm")}>Delete everything</GhostButton>
              <div className="mt-2 flex justify-center gap-4 text-sm text-ink-soft">
                <a href="/privacy" className="underline underline-offset-4">Privacy Policy</a>
                <a href="/terms" className="underline underline-offset-4">Terms</a>
                <a href="/refunds" className="underline underline-offset-4">Refunds</a>
              </div>
              <button onClick={() => setStep("home")} className="mt-4 self-center text-sm text-ink-faint underline underline-offset-4">
                Back
              </button>
            </div>
          </Screen>
        )}

        {step === "delete-confirm" && (
          <Screen title="Delete everything?">
            <p className="text-lg text-ink-soft">
              This removes your account, saved notes and everything we hold about you. It can&apos;t be undone. Payment records we
              must keep for tax are kept until the law lets us delete them.
            </p>
            <p className="mt-3 text-base text-ink-soft">
              Got a plan? Cancel it first in Manage subscription, or it keeps renewing.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <BigButton onClick={deleteEverything}>Delete everything</BigButton>
              <GhostButton onClick={() => setStep("settings")}>Cancel</GhostButton>
            </div>
          </Screen>
        )}

        {step === "deleted" && (
          <Screen title="Done. It's all gone.">
            <p className="text-lg text-ink-soft">Everything on this device is cleared. Take care of yourself.</p>
            <div className="mt-6">
              <BigButton onClick={() => setStep("consent")}>Start fresh</BigButton>
            </div>
          </Screen>
        )}

        {step === "help" && help && (
          <HelpScreen
            screen={help.screen}
            region={region}
            onRegionChange={changeRegion}
            onBack={
              help.returnTo
                ? () => {
                    const to = help.returnTo!;
                    const screen = help.screen;
                    setHelp(null);
                    if (to === "continue") {
                      getMoves(acknowledge(screen));
                    } else if (to === "words-ack") {
                      acknowledge(screen);
                      setStep("words");
                    } else {
                      setStep(to);
                    }
                  }
                : undefined
            }
          />
        )}

        {/* Level 1+ this session: a help card stays one tap away (Safety Pack section 5). */}
        {showHelpCard && res.crisis[0] && (
          <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-line p-4">
            <p className="text-sm text-ink-soft">Still one tap away, free, whenever:</p>
            <ContactButton contact={res.crisis[0]} />
          </div>
        )}
      </main>
    </div>
  );
}

function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col">
      <h1 className="text-[2.6rem] font-extrabold leading-[0.95] text-ink">{title}</h1>
      {subtitle && <p className="mt-2 text-lg text-ink-soft">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function BigButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-[1.75rem] bg-accent px-5 py-5 text-xl font-bold text-accent-ink shadow-[0_14px_36px_-14px_rgba(255,159,110,0.8)] transition active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

function GhostButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="w-full rounded-3xl border border-line px-5 py-4 text-lg font-medium text-ink-soft">
      {children}
    </button>
  );
}

