import { NextResponse } from "next/server";
import { getNvidiaKey } from "@/lib/ai";
import { PERSONALITIES, MODES, DEFAULT_PERSONALITY_ID, DEFAULT_MODE_ID } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const hasNvidiaKey = Boolean(getNvidiaKey());
  return NextResponse.json({
    personalities: PERSONALITIES,
    modes: MODES,
    defaultPersonality: DEFAULT_PERSONALITY_ID,
    defaultMode: DEFAULT_MODE_ID,
    engine: hasNvidiaKey ? "nvidia" : "zai-demo",
    nvidiaConfigured: hasNvidiaKey,
  });
}
