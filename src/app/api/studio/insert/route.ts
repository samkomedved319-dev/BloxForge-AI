import { NextRequest, NextResponse } from "next/server";
import { studioStore } from "@/lib/studio-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Web app → plugin: enqueue an insert command.
 * Body: { code, title, language, code }
 */
export async function POST(req: NextRequest) {
  let body: {
    pairingCode?: string;
    title?: string;
    language?: string;
    code?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const pairingCode = body.pairingCode || "";
  const insertCode = (body.code || "").trim();
  if (!pairingCode || !insertCode) {
    return NextResponse.json(
      { ok: false, error: "pairingCode and code are required" },
      { status: 400 },
    );
  }

  const result = studioStore.insert(pairingCode, {
    title: (body.title || "BloxForge Script").slice(0, 80),
    language: (body.language || "luau").slice(0, 20),
    code: insertCode.slice(0, 100_000),
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true, commandId: result.commandId });
}
