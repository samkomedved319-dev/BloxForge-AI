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

/**
 * Fetch the list of available models from an OpenAI-compatible /models endpoint.
 * Body: { baseUrl, apiKey }  (for testing a new key before saving)
 *  OR    { keyId }           (for testing an existing saved key)
 *
 * Returns: { ok, models: [{ id, label }] }
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  let baseUrl: string;
  let apiKey: string;

  if (body.keyId) {
    const key = await db.apiKey.findUnique({ where: { id: body.keyId } });
    if (!key) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }
    baseUrl = key.baseUrl;
    apiKey = key.key;
  } else {
    baseUrl = body.baseUrl || "https://integrate.api.nvidia.com/v1";
    apiKey = body.apiKey || "";
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 },
      );
    }
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: `Provider returned ${res.status}: ${text.slice(0, 200)}` },
        { status: 200 },
      );
    }
    const data = await res.json();
    // OpenAI-compatible format: { data: [{ id: "model-name", ... }] }
    const rawModels = Array.isArray(data?.data) ? data.data : Array.isArray(data?.models) ? data.models : [];
    const models = rawModels
      .map((m: any) => ({
        id: m.id || m.name || String(m),
        label: m.id || m.name || String(m),
      }))
      .filter((m: any) => m.id)
      .sort((a: any, b: any) => a.id.localeCompare(b.id));
    return NextResponse.json({ ok: true, models });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ ok: false, error: msg });
  }
}
