import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ conversation });
  } catch (e) {
    console.error("[conversation] get error:", e);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await db.conversation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[conversation] delete error:", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { title } = await req.json().catch(() => ({}));
    const updated = await db.conversation.update({
      where: { id },
      data: { title },
    });
    return NextResponse.json({ conversation: updated });
  } catch (e) {
    console.error("[conversation] patch error:", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
