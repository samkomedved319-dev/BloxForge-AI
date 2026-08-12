import { NextResponse } from "next/server";
import { isStripeConfigured, PRICES } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public Stripe config status (no secrets exposed). */
export async function GET() {
  return NextResponse.json({
    configured: isStripeConfigured(),
    hasProMonthly: Boolean(PRICES.pro.monthly),
    hasProAnnual: Boolean(PRICES.pro.annual),
    hasStudioMonthly: Boolean(PRICES.studio.monthly),
    hasStudioAnnual: Boolean(PRICES.studio.annual),
  });
}
