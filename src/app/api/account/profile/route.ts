import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Update the signed-in user's profile (name) + preferences. */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const data: any = {};

  if (typeof body.name === "string") {
    data.name = body.name.trim().slice(0, 80) || null;
  }
  // Preferences stored as JSON-ish on the user row would need a column;
  // for now we keep prefs client-side in localStorage, but allow clearing.
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, email: true, name: true, plan: true, role: true },
  });
  return NextResponse.json({ ok: true, user: updated });
}
