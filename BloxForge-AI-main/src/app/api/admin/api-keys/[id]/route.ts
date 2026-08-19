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
  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.priority === "number") data.priority = body.priority;
  if (body.label) data.label = String(body.label).slice(0, 80);
  if (body.model !== undefined) data.model = body.model ? String(body.model).slice(0, 120) : null;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }
  await db.apiKey.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
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
  await db.apiKey.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
