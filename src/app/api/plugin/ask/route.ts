import { NextRequest, NextResponse } from "next/server";
import { completeChat, type ChatMessage } from "@/lib/ai";
import { BLOXFORGE_SYSTEM_PROMPT, DEFAULT_MODEL } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint consumed by the BloxForge Roblox Studio plugin via HttpService.
 * Roblox HttpService only supports POST and JSON, so this route returns a
 * single JSON payload (no streaming).
 */
export async function POST(req: NextRequest) {
  let body: {
    message?: string;
    model?: string;
    history?: ChatMessage[];
    context?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ ok: false, error: "Empty message" }, { status: 400 });
  }

  const model = body.model || DEFAULT_MODEL;
  const history: ChatMessage[] = Array.isArray(body.history)
    ? body.history.filter(
        (m) => m && (m.role === "user" || m.role === "assistant") && m.content,
      )
    : [];

  const context = (body.context ?? "").trim();
  const contextBlock = context
    ? `\n\n[Studio context — selected script]\n\`\`\`luau\n${context.slice(0, 8000)}\n\`\`\``
    : "";

  const messages: ChatMessage[] = [
    { role: "system", content: BLOXFORGE_SYSTEM_PROMPT },
    ...history.slice(-16),
    { role: "user", content: message + contextBlock },
  ];

  try {
    const { content, meta } = await completeChat({
      model,
      messages,
      temperature: 0.5,
      maxTokens: 2048,
    });

    return NextResponse.json({
      ok: true,
      reply: content,
      model: meta.label,
      provider: meta.provider,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: "BloxForge AI Plugin API",
    description:
      "POST { message, model?, history?, context? } to receive an AI reply.",
    models: "GET /api/models",
  });
}
