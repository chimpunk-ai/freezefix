"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HelpChip, Wordmark } from "@/components/Brand";
import { useRegion } from "@/components/useRegion";
import { plansFor, TRIAL_DAYS, trialDates, type PlanId } from "@/lib/plans";

// One price, one trial, one page. Yearly is the default and the honest one.
// When Paddle isn't configured the button becomes a launch list instead of a
// fake checkout — the price shown is always the real price.

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

export default function PlansPage() {
  const region = useRegion();
  const [plan, setPlan] = useState<PlanId>("yearly");
  const [state, setState] = useState<"loading" | "ready" | "off" | "opening" | "confirming" | "active" | "error">(
    "loading"
  );
  const cfg = useRef<{ ref: string; checkout: Checkout } | null>(null);
  const initialised = useRef(false);

  useEffect(() => {
    fetch("/api/paywall", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.active) {
          setState("active");
          return;
        }
        cfg.current = { ref: d.ref, checkout: d.checkout };
        setState(d.paymentsOn ? "ready" : "off");
      })
      .catch(() => setState("error"));
  }, []);

  const plans = plansFor(region);
  const dates = trialDates();

  async function confirm() {
    setState("confirming");
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const d = await (await fetch("/api/paywall", { cache: "no-store" })).json();
        if (d.active) {
          setState("active");
          return;
        }
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
    <main className="min-h-dvh">
      <header className="mx-auto flex w-full max-w-[560px] items-center justify-between px-5 pb-4 pt-5">
        <Wordmark />
        <HelpChip compact />
      </header>

      <section className="mx-auto w-full max-w-[560px] px-5 pb-16">
        <h1 className="font-display text-40 leading-tight text-ink">one price. one week free.</h1>
        <p className="mt-3 text-16 text-ink-soft">
          everything is in the free week: the log, the Sunday card, the shelf, Fix. no card to start.
          no trial that quietly turns into a charge.
        </p>

        <div className="mt-7 space-y-3">
          {(["yearly", "monthly"] as PlanId[]).map((id) => {
            const p = plans[id];
            const selected = plan === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setPlan(id)}
                aria-pressed={selected}
                className={[
                  "flex w-full items-baseline justify-between rounded-card border px-4 py-4 text-left",
                  selected ? "border-accent/60 bg-accent/[0.07]" : "border-line bg-card",
                ].join(" ")}
              >
                <span>
                  <span className="block text-16 text-ink">{p.label}</span>
                  <span className="mt-1 block text-12 text-ink-faint">{p.note}</span>
                </span>
                <span className="text-right">
                  <span className="block font-display text-28 leading-none text-ink">{p.price}</span>
                  <span className="mt-1 block text-12 text-ink-faint">a {p.per}</span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-12 text-ink-faint">
          {TRIAL_DAYS} days free, from {dates.startsLabel.toLowerCase()} to {dates.chargeLabel}. cancel in
          the app or in the receipt email; no phone call, no retention gauntlet.
        </p>

        {state === "active" ? (
          <div className="mt-6 rounded-card border border-accent/30 bg-accent/[0.07] px-4 py-4">
            <p className="text-14 text-ink">this phone already has it.</p>
            <Link href="/app" className="mt-2 inline-block text-14 text-accent underline decoration-accent/40 underline-offset-4">
              back to tonight
            </Link>
          </div>
        ) : state === "off" ? (
          <div className="mt-6">
            <Link
              href="/app"
              className="block w-full rounded-pill bg-accent px-6 py-3 text-center text-16 font-medium text-bg no-underline"
            >
              start the free week
            </Link>
            <p className="mt-3 text-12 text-ink-faint">
              payments aren&rsquo;t switched on yet, so nothing can be charged. the free week is real,
              and the price above is the price it will be.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <button
              type="button"
              onClick={start}
              disabled={state === "loading" || state === "opening" || state === "confirming"}
              className="w-full rounded-pill bg-accent px-6 py-3 text-16 font-medium text-bg disabled:opacity-60"
            >
              {state === "confirming"
                ? "waiting for the receipt…"
                : state === "opening"
                  ? "opening checkout…"
                  : `start ${TRIAL_DAYS} days free`}
            </button>
            {state === "error" ? (
              <p className="mt-3 text-12 text-frost">
                the checkout didn&rsquo;t open. nothing was charged. try again, or write to us and we&rsquo;ll
                sort it out.
              </p>
            ) : null}
          </div>
        )}

        <div className="mt-10 space-y-4 text-14 text-ink-soft">
          <p>
            <span className="text-ink">what you get:</span> the nightly log, the Sunday mirror, the shelf
            of past weeks, and Fix — five questions a day on the free week and on the paid plan, more if
            you write to us and ask.
          </p>
          <p>
            <span className="text-ink">what you don&rsquo;t get:</span> a streak, a leaderboard, a
            community feed, a coach, or an email asking why you left. we don&rsquo;t have your email.
          </p>
          <p>
            the help page is free forever, with or without a plan.{" "}
            <Link href="/help" className="text-frost underline decoration-frost/40 underline-offset-4">
              get help now
            </Link>
          </p>
        </div>

        <p className="mt-8 text-12 text-ink-faint">
          prices shown in your local currency where we know it; the payment provider applies VAT and the
          exact amount at checkout.{" "}
          <Link href="/refunds" className="underline decoration-line underline-offset-4">
            refunds
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="underline decoration-line underline-offset-4">
            terms
          </Link>
        </p>
      </section>
    </main>
  );
}
