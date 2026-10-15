// Plans (founder decision 16 Oct). Prices are set in the payment provider's dashboard;
// these are only for display. The 4-day trial is set on both prices in the provider.
export const PLANS = {
  yearly: { id: "yearly", label: "Yearly", price: "$39.99", per: "year", perMonth: "$3.33", note: "Save 67%" },
  monthly: { id: "monthly", label: "Monthly", price: "$9.99", per: "month", perMonth: "$9.99", note: "" },
} as const;

export type PlanId = keyof typeof PLANS;

export const TRIAL_DAYS = 4;

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
