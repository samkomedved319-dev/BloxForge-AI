import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe, getPriceId, isStripeConfigured, type PlanId } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Create a Stripe Checkout Session for upgrading to Pro or Studio.
 * Body: { plan: "pro" | "studio", period: "monthly" | "annual" }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error: "stripe-not-configured",
        message:
          "Stripe is not configured. Set STRIPE_SECRET_KEY and price IDs in .env",
      },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const plan = body.plan as PlanId;
  const period = (body.period as "monthly" | "annual") || "monthly";

  if (plan !== "pro" && plan !== "studio") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = getPriceId(plan, period);
  if (!priceId) {
    return NextResponse.json(
      {
        error: "stripe-not-configured",
        message: `No Stripe price configured for ${plan} ${period}. Set STRIPE_PRICE_${plan.toUpperCase()}_${period.toUpperCase()} in .env`,
      },
      { status: 503 },
    );
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const appOrigin =
    process.env.NEXTAUTH_URL ||
    (req.nextUrl.origin.startsWith("http")
      ? req.nextUrl.origin
      : `https://${req.nextUrl.host}`);

  try {
    // If the user already has a Stripe customer ID, reuse it
    let customerId = user.stripeCustomerId || undefined;

    // Create a checkout session
    const checkoutSession = await stripe!.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      ...(customerId ? { customer: customerId } : {}),
      customer_email: customerId ? undefined : user.email,
      metadata: {
        userId: user.id,
        plan,
        period,
      },
      success_url: `${appOrigin}/#billing-success`,
      cancel_url: `${appOrigin}/#pricing`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { userId: user.id, plan, period },
      },
    });

    return NextResponse.json({ ok: true, url: checkoutSession.url });
  } catch (err) {
    console.error("[stripe/checkout] error:", err);
    const msg = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
