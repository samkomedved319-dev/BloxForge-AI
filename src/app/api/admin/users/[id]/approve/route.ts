import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "admin") return null;
  return user;
}

/** Approve or reject a beta user. PATCH { approved: boolean } */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.approved !== "boolean") {
    return NextResponse.json({ error: "approved boolean required" }, { status: 400 });
  }
  const updated = await db.user.update({
    where: { id },
    data: { approved: body.approved },
    select: { id: true, email: true, name: true, approved: true, role: true },
  });
  return NextResponse.json({ ok: true, user: updated });
}
