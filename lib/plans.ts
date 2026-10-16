// Plans. Every number a visitor sees is set here, not scattered through the components,
// so changing a price or the trial length is one edit in one file.
//
// These strings are for DISPLAY ONLY. The amount actually charged comes from the price set
// in the payment provider's dashboard, and the provider applies local currency and VAT at
// checkout. If the two ever disagree, the provider wins and this file is wrong.

export const TRIAL_DAYS = Number(process.env.TRIAL_DAYS) || 4;

type Prices = { currency: string; yearly: string; monthly: string; yearlyPerMonth: string };

// Keyed by the region the browser reports. Anywhere not listed falls back to USD, and the
// provider still charges in the visitor's own currency.
const PRICES: Record<string, Prices> = {
  GB: { currency: "GBP", yearly: "£39.99", monthly: "£9.99", yearlyPerMonth: "£3.33" },
  US: { currency: "USD", yearly: "$39.99", monthly: "$9.99", yearlyPerMonth: "$3.33" },
};
const FALLBACK: Prices = PRICES.US;

export function pricesFor(region?: string): Prices {
  return PRICES[(region || "").toUpperCase()] ?? FALLBACK;
}

export function plansFor(region?: string) {
  const p = pricesFor(region);
  return {
    yearly: {
      id: "yearly" as const,
      label: "Yearly",
      price: p.yearly,
      per: "year",
      perMonth: p.yearlyPerMonth,
      note: `${p.yearlyPerMonth} a month, billed yearly`,
      recommended: true,
    },
    monthly: {
      id: "monthly" as const,
      label: "Monthly",
      price: p.monthly,
      per: "month",
      perMonth: p.monthly,
      note: "",
      recommended: false,
    },
  };
}

export type PlanId = "yearly" | "monthly";

/** Kept so existing screens carry on working; new code should call plansFor(region). */
export const PLANS = plansFor("US");

// The dates the paywall shows. Worked out from today so nothing is ever a made-up countdown.
export function trialDates(from = new Date(), days = TRIAL_DAYS) {
  const ends = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  // The reminder lands the day before the charge, or the same day on a very short trial.
  const reminder = new Date(ends.getTime() - 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "long" });
  return {
    days,
    startsLabel: "Today",
    reminderLabel: fmt(reminder < from ? from : reminder),
    chargeLabel: fmt(ends),
    endsAt: ends,
  };
}

// Public checkout settings (safe to send to the browser; no secrets).
export function checkoutConfig() {
  return {
    provider: "paddle" as const,
    environment: process.env.PADDLE_ENV === "production" ? "production" : "sandbox",
    clientToken: process.env.PADDLE_CLIENT_TOKEN || "",
    prices: {
      yearly: process.env.PADDLE_PRICE_YEARLY || "",
      monthly: process.env.PADDLE_PRICE_MONTHLY || "",
    },
  };
}

export function paymentsOn(): boolean {
  const c = checkoutConfig();
  return Boolean(c.clientToken && c.prices.yearly && c.prices.monthly);
}
