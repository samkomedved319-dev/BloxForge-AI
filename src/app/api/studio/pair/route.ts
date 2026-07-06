import { NextResponse } from "next/server";
import { studioStore } from "@/lib/studio-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Web app requests a new pairing code. */
export async function POST() {
  const { code } = studioStore.pair();
  return NextResponse.json({ ok: true, code });
}
