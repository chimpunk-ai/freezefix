"use client";

import { useEffect, useState } from "react";
import HelpScreen, { ContactButton } from "@/components/HelpScreen";
import VoiceRecorder from "@/components/VoiceRecorder";
import ScreenshotPicker from "@/components/ScreenshotPicker";
import SiteFooter from "@/components/SiteFooter";
import Paywall from "@/components/Paywall";
import { SAFETY_BUTTONS, keywordCheck, type HelpScreen as HelpScreenId, type RiskLevel, type RiskResult } from "@/lib/risk";
import { MOMENTS, type MomentId } from "@/lib/prompt";
import { detectRegion } from "@/lib/country";
import { resourcesFor, VERIFIED_COUNTRIES } from "@/lib/resources";
import type { Move } from "@/lib/moves";

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
  | "paywall";

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

const MOMENT_EMOJI: Record<MomentId, string> = { people: "👀", alone: "🌀", task: "🧱", reply: "💬" };

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
  const [acked, setAcked] = useState<HelpScreenId[]>([]);
  const [voiceText, setVoiceText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [inputNote, setInputNote] = useState<string | null>(null);
  const [consentTicked, setConsentTicked] = useState(false);
  const [paywallFrom, setPaywallFrom] = useState<"feedback" | "session">("session");
  const [settingsNote, setSettingsNote] = useState<string | null>(null);
  const [wins, setWins] = useState(0);
  const [thawing, setThawing] = useState(false);
  const [features, setFeatures] = useState({ ai: false, voice: false, screenshot: false });

  // Which optional inputs are switched on (voice needs a transcription key, screenshots need the AI).
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((f) => setFeatures({ ai: !!f.ai, voice: !!f.voice, screenshot: !!f.screenshot }))
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
    try {
      setAcked(JSON.parse(get("session", K_ACK) || "[]"));
    } catch {
      setAcked([]);
    }

    const blockUntil = Number(get("local", K_BLOCK) || 0);
    if (blockUntil > Date.now()) {
      setStep("blocked");
    } else if (get("local", K_ADULT) === "yes") {
      setStep("home");
    } else {
      setStep("gate");
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
  const showHelpCard = sessionLevel >= 1 && step !== "help" && step !== "blocked" && step !== "gate";

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
          className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-frost"
          aria-label="FreezeFix home"
        >
          freezefix
        </button>
        {step !== "loading-app" && !(step === "help" && help?.screen === "emergency") && (
          <button
            onClick={() => showHelp("emergency", step === "blocked" ? null : step === "help" ? help?.returnTo ?? "home" : step)}
            className="rounded-full bg-chip px-4 py-2 text-sm font-semibold text-ink"
          >
            Emergency
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
                  setStep("home");
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
          <div className="flex flex-1 flex-col justify-between gap-10">
            <div className="flex flex-col gap-3 pt-4">
              <h1 className="text-[4.25rem] font-extrabold leading-[0.9] text-ink">Frozen?</h1>
              <p className="max-w-[22ch] text-xl leading-snug text-ink-soft">One tiny move. Under a minute. No lectures.</p>
              {wins > 0 && (
                <p className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-chip px-3 py-1.5 text-sm font-semibold text-glow">
                  ✦ You&apos;ve unfrozen {wins} {wins === 1 ? "time" : "times"}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  buzz(25);
                  setThawing(true);
                  const go = () => {
                    setThawing(false);
                    resetFlow();
                    setStep(get("local", K_CONSENT) ? "moment" : "consent");
                  };
                  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
                  if (reduce) go();
                  else setTimeout(go, 450);
                }}
                className={`ice w-full rounded-[2rem] px-6 py-9 font-[family-name:var(--font-display)] text-3xl font-extrabold ${thawing ? "thawing" : ""}`}
              >
                Unfreeze me
              </button>
              <p className="text-center text-sm text-ink-faint">Can&apos;t change you. Still got you.</p>
            </div>
            <div className="flex flex-col gap-4">
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
                    setStep("check");
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
          <Screen title="Quick check first" subtitle="Tap anything that's true right now.">
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
                className="mt-2 rounded-3xl bg-accent px-5 py-5 text-xl font-bold text-accent-ink transition active:scale-[0.98]"
              >
                None of these, keep going
              </button>
            </div>
          </Screen>
        )}

        {step === "words" && (
          <Screen title="Say it in a few words" subtitle="Tap one, type, or both.">
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
            <div className="mt-1 flex justify-between text-xs text-ink-faint">
              <span>Any language is fine, Hinglish too.</span>
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
            {helped && (
              <p className="reward mb-4 font-[family-name:var(--font-display)] text-6xl font-extrabold text-glow" aria-label="Plus half a percent">
                +0.5%
              </p>
            )}
            <p className="text-lg text-ink-soft">
              {helped ? "That's your 0.5% today. Small moves count." : "Not every move lands. Want to try a different one?"}
            </p>
            <div className="mt-6 flex flex-col gap-3">
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
          </Screen>
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
          <Screen title="Before we start">
            <div className="flex flex-col gap-4 text-lg text-ink-soft">
              <p>
                To suggest your next steps, FreezeFix needs to use what you share in a session, like how you&apos;re feeling and
                whether you&apos;ve used cannabis. That&apos;s health information, so we need your OK.
              </p>
              <ul className="list-disc space-y-1 pl-5 text-base">
                <li>We use it only to suggest your moves and show help when you need it.</li>
                <li>It&apos;s processed by our AI provider for us, never sold, never used for ads.</li>
                <li>Session text isn&apos;t stored after your moves are shown.</li>
              </ul>
              <label className="mt-2 flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-card p-4 text-base text-ink">
                <input
                  type="checkbox"
                  checked={consentTicked}
                  onChange={(e) => setConsentTicked(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
                />
                <span>I agree FreezeFix can use the health information I share to give me suggestions, as explained in the Privacy Policy.</span>
              </label>
              <a href="/privacy" target="_blank" className="text-base text-accent underline underline-offset-4">
                Read the Privacy Policy
              </a>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <button
                disabled={!consentTicked}
                onClick={() => {
                  set("local", K_CONSENT, new Date().toISOString().slice(0, 10));
                  setStep("moment");
                }}
                className="w-full rounded-3xl bg-accent px-5 py-5 text-xl font-bold text-accent-ink transition disabled:opacity-40"
              >
                Continue
              </button>
              <GhostButton onClick={() => setStep("consent-declined")}>Not now</GhostButton>
            </div>
          </Screen>
        )}

        {step === "consent-declined" && (
          <Screen title="No problem">
            <p className="text-lg text-ink-soft">
              Without your OK, FreezeFix can&apos;t suggest moves. Help is always here though, free, with the Emergency button up top.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <BigButton onClick={() => setStep("consent")}>I&apos;ve changed my mind</BigButton>
              <GhostButton onClick={() => setStep("home")}>Back to home</GhostButton>
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
              <BigButton onClick={() => setStep("gate")}>Start fresh</BigButton>
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
        {showHelpCard && step !== "home" && res.crisis[0] && (
          <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-line p-4">
            <p className="text-sm text-ink-soft">If it gets heavier, talk to someone now, free:</p>
            <ContactButton contact={res.crisis[0]} />
          </div>
        )}
        {showHelpCard && step === "home" && sessionLevel >= 3 && res.crisis[0] && (
          <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-line p-4">
            <p className="text-sm text-ink-soft">You don&apos;t have to carry this alone. Free, right now:</p>
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

