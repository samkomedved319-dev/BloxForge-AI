import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe, planFromPriceId, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook — handles subscription lifecycle events.
 * Configure the webhook endpoint in the Stripe Dashboard:
 *   URL: https://your-domain.com/api/stripe/webhook
 *   Events: checkout.session.completed, customer.subscription.updated,
 *           customer.subscription.deleted
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 },
    );
  }

  let event;
  try {
    event = stripe!.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const period = session.metadata?.period;

        if (userId && session.customer) {
          // Update user with Stripe customer ID + subscription info
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;

          await db.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: session.customer as string,
              stripeSubId: subId || undefined,
              stripePlan: plan || undefined,
              stripePeriod: period || undefined,
              plan: plan || "free",
              approved: true, // paying customers are auto-approved
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const customerId = sub.customer as string;

        // Map the price to a plan
        const priceId = sub.items?.data?.[0]?.price?.id;
        const planInfo = priceId ? planFromPriceId(priceId) : null;

        // Find the user by Stripe customer ID
        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          if (sub.status === "active" || sub.status === "trialing") {
            await db.user.update({
              where: { id: user.id },
              data: {
                stripeSubId: sub.id,
                stripePlan: planInfo?.plan || user.stripePlan,
                stripePeriod: planInfo?.period || user.stripePeriod,
                plan: planInfo?.plan || user.plan,
                approved: true,
              },
            });
          } else if (
            sub.status === "canceled" ||
            sub.status === "unpaid" ||
            sub.status === "incomplete_expired"
          ) {
            // Subscription ended — downgrade to free
            await db.user.update({
              where: { id: user.id },
              data: {
                plan: "free",
                stripeSubId: null,
                stripePlan: null,
                stripePeriod: null,
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = sub.customer as string;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              plan: "free",
              stripeSubId: null,
              stripePlan: null,
              stripePeriod: null,
            },
          });
        }
        break;
      }

      default:
        // Ignore other events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe/webhook] error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
