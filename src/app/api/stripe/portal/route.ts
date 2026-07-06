import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Create a Stripe Customer Portal session so the user can manage their
 * subscription (update card, change plan, cancel).
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.stripeCustomerId) {
    return NextResponse.json(
      { error: "No active subscription found" },
      { status: 404 },
    );
  }

  const appOrigin =
    process.env.NEXTAUTH_URL ||
    (req.nextUrl.origin.startsWith("http")
      ? req.nextUrl.origin
      : `https://${req.nextUrl.host}`);

  try {
    const portalSession = await stripe!.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appOrigin}/#settings`,
    });

    return NextResponse.json({ ok: true, url: portalSession.url });
  } catch (err) {
    console.error("[stripe/portal] error:", err);
    const msg = err instanceof Error ? err.message : "Portal failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
