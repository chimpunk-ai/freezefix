"use client";

import { useEffect, useRef, useState } from "react";
import { plansFor, TRIAL_DAYS, trialDates, type PlanId } from "@/lib/plans";
import { detectRegion } from "@/lib/country";

// Paywall (founder decision 16 Oct): shown after the first 👍, or when someone who has used
// their free unfreeze starts another. Yearly is the default. Never shown on a help screen.
// Wording of the legal line: Setup & Legal's Legal Pack, tab 4 section 4.

type Checkout = {
  environment: "sandbox" | "production";
  clientToken: string;
  prices: Record<PlanId, string>;
};

type PaddleGlobal = {
  Environment: { set: (env: string) => void };
  Initialize: (opts: { token: string; eventCallback?: (e: { name?: string }) => void }) => void;
  Checkout: {
    open: (opts: {
      items: { priceId: string; quantity: number }[];
      customData?: Record<string, string>;
      settings?: Record<string, unknown>;
    }) => void;
  };
};

declare global {
  interface Window {
    Paddle?: PaddleGlobal;
  }
}

type Props = {
  onActive: () => void; // trial or plan is now active
  onClose: () => void; // "Not now"
};

function loadPaddle(): Promise<PaddleGlobal> {
  return new Promise((resolve, reject) => {
    if (window.Paddle) return resolve(window.Paddle);
    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.async = true;
    s.onload = () => (window.Paddle ? resolve(window.Paddle) : reject(new Error("no paddle")));
    s.onerror = () => reject(new Error("load failed"));
    document.head.appendChild(s);
  });
}

export default function Paywall({ onActive, onClose }: Props) {
  const [plan, setPlan] = useState<PlanId>("yearly");
  const [region, setRegion] = useState("");
  useEffect(() => setRegion(detectRegion()), []);
  const PLANS = plansFor(region);
  // Real dates, worked out from today. Never a countdown, never a date we made up.
  const dates = trialDates();
  const [state, setState] = useState<"loading" | "ready" | "off" | "opening" | "confirming" | "error">("loading");
  const cfg = useRef<{ ref: string; checkout: Checkout } | null>(null);
  const initialised = useRef(false);

  useEffect(() => {
    fetch("/api/paywall", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.active) return onActive();
        cfg.current = { ref: d.ref, checkout: d.checkout };
        setState(d.paymentsOn ? "ready" : "off");
      })
      .catch(() => setState("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After checkout, Paddle tells our server (webhook). Wait for it, up to ~30 seconds.
  async function confirm() {
    setState("confirming");
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const d = await (await fetch("/api/paywall", { cache: "no-store" })).json();
        if (d.active) return onActive();
      } catch {
        /* keep trying */
      }
    }
    setState("error");
  }

  async function start() {
    const c = cfg.current;
    if (!c) return;
    setState("opening");
    try {
      const paddle = await loadPaddle();
      if (!initialised.current) {
        if (c.checkout.environment === "sandbox") paddle.Environment.set("sandbox");
        paddle.Initialize({
          token: c.checkout.clientToken,
          eventCallback: (e) => {
            if (e.name === "checkout.completed") confirm();
            if (e.name === "checkout.closed") setState((s) => (s === "confirming" ? s : "ready"));
          },
        });
        initialised.current = true;
      }
      paddle.Checkout.open({
        items: [{ priceId: c.checkout.prices[plan], quantity: 1 }],
        customData: { ref: c.ref },
        settings: { displayMode: "overlay", theme: "dark", locale: "en", allowLogout: false },
      });
      setState("ready");
    } catch {
      setState("error");
    }
  }

  return (
    <section className="flex flex-col">
      <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink">Keep FreezeFix in your pocket</h1>
      <p className="mt-2 text-lg text-ink-soft">Try FreezeFix Plus free for {TRIAL_DAYS} days.</p>

      <ul className="mt-5 flex flex-col gap-2 text-base text-ink">
        <li>✓ Unfreeze any time, day or night</li>
        <li>✓ Moves in your language, Hinglish too</li>
        <li>✓ Crisis help stays free for everyone, always</li>
      </ul>

      {/* Exactly what happens and when, in dates rather than promises. */}
      <ol className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-card p-5">
        <li className="flex gap-3">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
          <span className="text-base leading-snug text-ink">
            <span className="font-semibold">{dates.startsLabel}</span> — full access, nothing charged.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-chip" />
          <span className="text-base leading-snug text-ink-soft">
            <span className="font-semibold text-ink">{dates.reminderLabel}</span> — we email you before anything happens.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-chip" />
          <span className="text-base leading-snug text-ink-soft">
            <span className="font-semibold text-ink">{dates.chargeLabel}</span> — first payment, unless you cancelled.
          </span>
        </li>
      </ol>

      <div className="mt-6 flex flex-col gap-3" role="radiogroup" aria-label="Choose a plan">
        {(Object.keys(PLANS) as PlanId[]).map((id) => {
          const p = PLANS[id];
          const on = plan === id;
          return (
            <button
              key={id}
              role="radio"
              aria-checked={on}
              onClick={() => setPlan(id)}
              className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition ${
                on ? "border-accent bg-card" : "border-line"
              }`}
            >
              <span className="flex flex-col">
                <span className="text-lg font-semibold text-ink">
                  {p.label} {p.note && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-ink">{p.note}</span>}
                </span>
                <span className="text-sm text-ink-soft">
                  {p.price} a {p.per}
                  {id === "yearly" ? ` · that's ${p.perMonth} a month` : ""}
                </span>
              </span>
              <span className={`h-5 w-5 rounded-full border-2 ${on ? "border-accent bg-accent" : "border-line"}`} />
            </button>
          );
        })}
      </div>

      <button
        onClick={start}
        disabled={state !== "ready"}
        className="mt-6 w-full rounded-3xl bg-accent px-5 py-5 text-xl font-bold text-accent-ink transition active:scale-[0.98] disabled:opacity-50"
      >
        {state === "off"
          ? "Plans open very soon"
          : state === "confirming"
          ? "Setting you up…"
          : state === "loading" || state === "opening"
          ? "One sec…"
          : `Start ${TRIAL_DAYS} days free`}
      </button>

      <p className="mt-3 text-center text-xs leading-relaxed text-ink-faint">
        By starting your free trial you agree to the{" "}
        <a href="/terms" target="_blank" className="underline">Terms of Use</a> and confirm you are 18 or over. Your plan renews
        automatically at {PLANS.monthly.price} a month (or {PLANS.yearly.price} a year) after the trial until you cancel in
        Settings. Your local currency and tax are applied at checkout.{" "}
        <a href="/privacy" target="_blank" className="underline">Privacy Policy</a>
      </p>

      {state === "error" && (
        <p className="mt-3 rounded-xl bg-chip px-4 py-3 text-sm text-ink-soft">
          That didn&apos;t go through. Try again in a moment. If you already paid, it can take a minute to show up.
        </p>
      )}

      <button onClick={onClose} className="mt-6 self-center py-2 text-sm text-ink-faint underline underline-offset-4">
        Not now
      </button>
    </section>
  );
}
