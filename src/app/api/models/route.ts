import { NextResponse } from "next/server";
import { NVIDIA_MODELS, DEFAULT_MODEL } from "@/lib/models";
import { getNvidiaKey } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const hasNvidiaKey = Boolean(getNvidiaKey());
  return NextResponse.json({
    models: NVIDIA_MODELS,
    defaultModel: DEFAULT_MODEL,
    engine: hasNvidiaKey ? "nvidia" : "zai-demo",
    nvidiaConfigured: hasNvidiaKey,
  });
}
