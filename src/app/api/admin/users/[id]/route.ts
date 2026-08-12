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

  const data: any = {};
  if (body.plan && ["free", "pro", "studio"].includes(body.plan)) {
    data.plan = body.plan;
  }
  if (body.role && ["user", "admin"].includes(body.role)) {
    data.role = body.role;
  }
  if (typeof body.extraCredits === "number" && body.extraCredits >= 0) {
    data.extraCredits = body.extraCredits;
  }
  if (typeof body.resetUsage === "boolean" && body.resetUsage) {
    data.usageCount = 0;
    data.usageDate = new Date().toISOString().slice(0, 10);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      role: true,
      extraCredits: true,
      usageCount: true,
      usageDate: true,
    },
  });
  return NextResponse.json({ ok: true, user: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  // Prevent self-deletion
  if (id === admin.id) {
    return NextResponse.json(
      { error: "You cannot delete your own admin account" },
      { status: 400 },
    );
  }
  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
