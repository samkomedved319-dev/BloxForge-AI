import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Delete all of the signed-in user's conversations (keeps the account). */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await db.conversation.deleteMany({
    where: { userId: session.user.id },
  });
  return NextResponse.json({ ok: true, deleted: result.count });
}
