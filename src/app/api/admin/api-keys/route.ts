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

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const keys = await db.apiKey.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
  // Mask the key in the list response
  const masked = keys.map((k) => ({
    ...k,
    key: k.key ? k.key.slice(0, 6) + "••••••" + k.key.slice(-4) : "",
  }));
  return NextResponse.json({ keys: masked });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const { label, provider, baseUrl, key, model, priority } = body;
  if (!label || !key) {
    return NextResponse.json(
      { error: "Label and API key are required" },
      { status: 400 },
    );
  }
  const created = await db.apiKey.create({
    data: {
      label: String(label).slice(0, 80),
      provider: String(provider || "custom").slice(0, 30),
      baseUrl:
        String(baseUrl || "https://integrate.api.nvidia.com/v1").slice(0, 200),
      key: String(key).slice(0, 500),
      model: model ? String(model).slice(0, 120) : null,
      priority: Number(priority) || 0,
      active: true,
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}
