import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const conversations = await db.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        model: true,
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
    const { title, model } = await req.json().catch(() => ({}));
    const conv = await db.conversation.create({
      data: {
        title: title || "New Forge Session",
        model: model || "qwen/qwen2.5-coder-32b-instruct",
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
