import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPlan, PERSONALITIES } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Personal dashboard data for the signed-in user. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
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
  const effectiveLimit =
    isAdmin || plan.dailyCreditLimit === -1
      ? -1
      : plan.dailyCreditLimit + (user.extraCredits || 0);

  const [totalConversations, totalMessages, recentConversations, messagesLast7] =
    await Promise.all([
      db.conversation.count({ where: { userId: user.id } }),
      db.message.count({
        where: { conversation: { userId: user.id }, role: "user" },
      }),
      db.conversation.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          model: true,
          mode: true,
          updatedAt: true,
          _count: { select: { messages: true } },
        },
      }),
      db.message.groupBy({
        by: ["createdAt"],
        where: {
          conversation: { userId: user.id },
          role: "user",
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        _count: true,
        orderBy: { createdAt: "asc" },
      }),
    ]);

  // Build a 7-day usage bucket
  const days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: 0 });
  }
  for (const m of messagesLast7) {
    const key = m.createdAt.toISOString().slice(0, 10);
    const day = days.find((d) => d.date === key);
    if (day) day.count += m._count;
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      role: user.role,
      createdAt: user.createdAt,
    },
    stats: {
      totalConversations,
      totalMessages,
      usageToday: usageCount,
      limit: effectiveLimit,
      extraCredits: user.extraCredits || 0,
      isAdmin,
    },
    usage7d: days,
    recentConversations,
    plan: {
      id: plan.id,
      label: plan.label,
      features: plan.features,
      allowedPersonalities: isAdmin
        ? PERSONALITIES.map((p) => p.id)
        : plan.allowedPersonalities,
    },
  });
}
