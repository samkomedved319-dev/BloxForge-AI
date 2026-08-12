import { NextRequest, NextResponse } from "next/server";
import { studioStore } from "@/lib/studio-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Web app polls the current Studio connection state. */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") || "";
  if (!code) {
    return NextResponse.json({ ok: false, error: "Missing code" }, { status: 400 });
  }
  const state = studioStore.state(code);
  if (!state) {
    return NextResponse.json({ ok: false, error: "Unknown code" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, state });
}
