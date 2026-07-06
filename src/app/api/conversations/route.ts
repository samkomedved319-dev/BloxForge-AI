import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const conversations = await db.conversation.findMany({
      where: userId ? { userId } : { userId: null },
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        model: true,
        mode: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });
    return NextResponse.json({ conversations });
  } catch (e) {
    console.error("[conversations] list error:", e);
    return NextResponse.json({ conversations: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { title, model, mode } = await req.json().catch(() => ({}));
    const conv = await db.conversation.create({
      data: {
        title: title || "New Forge Session",
        model: model || "swift",
        mode: mode || "normal",
        userId: session?.user?.id || null,
      },
    });
    return NextResponse.json({ conversation: conv });
  } catch (e) {
    console.error("[conversations] create error:", e);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 },
    );
  }
}
