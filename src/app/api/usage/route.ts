import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPlan } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ authenticated: false });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  // Reset daily usage if date changed
  const today = todayKey();
  let usageCount = user.usageCount;
  if (user.usageDate !== today) {
    usageCount = 0;
    await db.user.update({
      where: { id: user.id },
      data: { usageDate: today, usageCount: 0 },
    });
  }

  const plan = getPlan(user.plan);
  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    },
    usage: {
      used: usageCount,
      limit: plan.dailyMessageLimit,
      remaining:
        plan.dailyMessageLimit === -1
          ? -1
          : Math.max(0, plan.dailyMessageLimit - usageCount),
      resetsAt: new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    plan: {
      id: plan.id,
      label: plan.label,
      features: plan.features,
      allowedPersonalities: plan.allowedPersonalities,
    },
  });
}
