import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPlan, PERSONALITIES } from "@/lib/models";

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

  const isAdmin = user.role === "admin";
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
  // Admins: unlimited. Otherwise: plan limit + admin-granted extra credits.
  const effectiveLimit =
    isAdmin || plan.dailyCreditLimit === -1
      ? -1
      : plan.dailyCreditLimit + (user.extraCredits || 0);

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      role: user.role,
      approved: user.approved,
      robloxUsername: user.robloxUsername,
    },
    usage: {
      used: usageCount,
      limit: effectiveLimit,
      remaining:
        effectiveLimit === -1 ? -1 : Math.max(0, effectiveLimit - usageCount),
      extraCredits: user.extraCredits || 0,
      resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    plan: {
      id: plan.id,
      label: plan.label,
      features: plan.features,
      allowedPersonalities: isAdmin
        ? PERSONALITIES.map((p) => p.id)
        : plan.allowedPersonalities,
    },
    isAdmin,
    isApproved: isAdmin || user.approved,
  });
}
