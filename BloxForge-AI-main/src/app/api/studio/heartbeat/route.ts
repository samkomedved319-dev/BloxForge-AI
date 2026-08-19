import { NextRequest, NextResponse } from "next/server";
import { studioStore, type StudioContext } from "@/lib/studio-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Plugin heartbeat. Called every ~3 seconds.
 * Body: { code, context? }
 * Returns: { ok, commands: [{ id, title, language, code }] }
 */
export async function POST(req: NextRequest) {
  let body: { code?: string; context?: StudioContext | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, commands: [] }, { status: 400 });
  }

  const code = body.code || "";
  if (!code) {
    return NextResponse.json({ ok: false, commands: [] }, { status: 400 });
  }

  const result = studioStore.heartbeat(code, body.context ?? undefined);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "Unknown pairing code", commands: [] },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, commands: result.commands });
}
