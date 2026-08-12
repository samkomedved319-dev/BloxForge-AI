import { NextRequest, NextResponse } from "next/server";
import { studioStore } from "@/lib/studio-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Plugin reports the result of executing an insert command. */
export async function POST(req: NextRequest) {
  let body: { code?: string; commandId?: string; ok?: boolean; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const code = body.code || "";
  if (!code || !body.commandId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  studioStore.ack(code, body.commandId, Boolean(body.ok), body.message || "");
  return NextResponse.json({ ok: true });
}
