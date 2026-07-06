import { NextRequest, NextResponse } from "next/server";
import { streamChat, type ChatMessage } from "@/lib/ai";
import { BLOXFORGE_SYSTEM_PROMPT, DEFAULT_MODEL } from "@/lib/models";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  message: string;
  model?: string;
  history?: ChatMessage[];
  conversationId?: string;
  title?: string;
}

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const userMessage = (body.message ?? "").trim();
  if (!userMessage) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const model = body.model || DEFAULT_MODEL;
  const prior: ChatMessage[] = Array.isArray(body.history)
    ? body.history.filter(
        (m) => m && (m.role === "user" || m.role === "assistant") && m.content,
      )
    : [];

  const messages: ChatMessage[] = [
    { role: "system", content: BLOXFORGE_SYSTEM_PROMPT },
    ...prior.slice(-20),
    { role: "user", content: userMessage },
  ];

  // Persist conversation + user message (best-effort)
  let conversationId = body.conversationId;
  try {
    if (!conversationId) {
      const title =
        body.title || userMessage.slice(0, 48) + (userMessage.length > 48 ? "…" : "");
      const conv = await db.conversation.create({
        data: { title, model },
      });
      conversationId = conv.id;
    }
    await db.message.create({
      data: { conversationId, role: "user", content: userMessage },
    });
  } catch (e) {
    console.error("[chat] persistence error:", e);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let assistantContent = "";
      let meta: { provider: string; model: string; label: string } | undefined;

      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "meta",
            conversationId,
            model,
          })}\n\n`,
        ),
      );

      try {
        for await (const chunk of streamChat({ model, messages })) {
          if (chunk.meta) meta = chunk.meta;
          if (chunk.delta) {
            assistantContent += chunk.delta;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "delta",
                  delta: chunk.delta,
                })}\n\n`,
              ),
            );
          }
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "done",
              meta,
              conversationId,
            })}\n\n`,
          ),
        );

        if (conversationId && assistantContent) {
          try {
            await db.message.create({
              data: {
                conversationId,
                role: "assistant",
                content: assistantContent,
                model,
              },
            });
            await db.conversation.update({
              where: { id: conversationId },
              data: { updatedAt: new Date(), model },
            });
          } catch (e) {
            console.error("[chat] assistant persistence error:", e);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: message })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
