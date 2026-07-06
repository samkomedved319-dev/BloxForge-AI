/**
 * BloxForge AI — Stripe configuration
 *
 * Price IDs are configured via env vars. Create products + prices in the
 * Stripe Dashboard, then set the env vars.
 *
 * Plan hierarchy: free → pro → studio
 */

import Stripe from "stripe";

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";

export const stripe: Stripe | null = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2025-06-30.basil" as any,
      typescript: true,
    })
  : null;

export function isStripeConfigured(): boolean {
  return Boolean(STRIPE_SECRET_KEY && stripe);
}

/** Monthly price IDs (set in .env from the Stripe Dashboard). */
export const PRICES = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
    annual: process.env.STRIPE_PRICE_PRO_ANNUAL || "",
  },
  studio: {
    monthly: process.env.STRIPE_PRICE_STUDIO_MONTHLY || "",
    annual: process.env.STRIPE_PRICE_STUDIO_ANNUAL || "",
  },
} as const;

export type PlanId = "free" | "pro" | "studio";

export const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  pro: 1,
  studio: 2,
};

/** Get the Stripe price ID for a plan + billing period. */
export function getPriceId(
  plan: PlanId,
  period: "monthly" | "annual",
): string | null {
  if (plan === "free") return null;
  const p = PRICES[plan][period];
  return p || null;
}

/** Map a Stripe price ID back to a plan + period. */
export function planFromPriceId(
  priceId: string,
): { plan: PlanId; period: "monthly" | "annual" } | null {
  for (const plan of ["pro", "studio"] as PlanId[]) {
    for (const period of ["monthly", "annual"] as const) {
      if (PRICES[plan][period] === priceId) {
        return { plan, period };
      }
    }
  }
  return null;
}
