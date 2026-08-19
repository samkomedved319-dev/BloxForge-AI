import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Returns the user's Stripe billing status + whether Stripe is configured. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ authenticated: false });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      stripeCustomerId: true,
      stripeSubId: true,
      stripePlan: true,
      stripePeriod: true,
    },
  });

  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    stripeConfigured: isStripeConfigured(),
    hasSubscription: Boolean(user.stripeSubId),
    plan: user.plan,
    stripePlan: user.stripePlan,
    stripePeriod: user.stripePeriod,
    canManage: Boolean(user.stripeCustomerId),
  });
}
