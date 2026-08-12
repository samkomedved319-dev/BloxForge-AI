import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Permanently delete the signed-in user's account + all their conversations. */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  // Confirm via a header to avoid accidental deletes
  const confirm = req.headers.get("x-confirm") || "";
  if (confirm !== "DELETE-MY-ACCOUNT") {
    return NextResponse.json(
      { error: "Confirmation header required" },
      { status: 400 },
    );
  }

  // Admins cannot self-delete via this route
  const user = await db.user.findUnique({ where: { id: userId } });
  if (user?.role === "admin") {
    return NextResponse.json(
      { error: "Admin accounts cannot be self-deleted. Demote first." },
      { status: 400 },
    );
  }

  // Cascade deletes conversations + messages (per schema)
  await db.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
