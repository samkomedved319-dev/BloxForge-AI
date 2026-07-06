import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const admin = await db.user.findUnique({ where: { id: session.user.id } });
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const [totalUsers, admins, freeUsers, proUsers, studioUsers, messagesToday, totalConversations, activeApiKeys] =
    await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "admin" } }),
      db.user.count({ where: { plan: "free" } }),
      db.user.count({ where: { plan: "pro" } }),
      db.user.count({ where: { plan: "studio" } }),
      db.message.count({
        where: {
          role: "user",
          createdAt: { gte: new Date(today) },
        },
      }),
      db.conversation.count(),
      db.apiKey.count({ where: { active: true } }),
    ]);

  return NextResponse.json({
    totalUsers,
    admins,
    planBreakdown: { free: freeUsers, pro: proUsers, studio: studioUsers },
    messagesToday,
    totalConversations,
    activeApiKeys,
  });
}
