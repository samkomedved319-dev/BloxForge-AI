import { NextRequest, NextResponse } from "next/server";
import { studioStore } from "@/lib/studio-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tear down a pairing session (from either side). */
export async function POST(req: NextRequest) {
  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const code = body.code || "";
  if (code) studioStore.disconnect(code);
  return NextResponse.json({ ok: true });
}
