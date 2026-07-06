import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { streamChat, type ChatMessage } from "@/lib/ai";
import {
  buildSystemPrompt,
  resolveModel,
  getPersonality,
  getMode,
  getPlan,
  PERSONALITIES,
  MODES,
  DEFAULT_PERSONALITY_ID,
  DEFAULT_MODE_ID,
} from "@/lib/models";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  message: string;
  personality?: string;
  mode?: string;
  history?: ChatMessage[];
  conversationId?: string;
  title?: string;
  context?: string;
  image?: string; // base64 data URL of a reference image
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  return NextResponse.json({
    personalities: PERSONALITIES,
    modes: MODES,
    defaultPersonality: DEFAULT_PERSONALITY_ID,
    defaultMode: DEFAULT_MODE_ID,
  });
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

  // ── Auth + usage limits ──────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  const isGuest = !session?.user?.id;

  // Always fetch the LIVE user from the DB — the JWT may be stale (e.g. an
  // admin just approved the user, but their JWT still says approved=false).
  let liveUser = null;
  if (!isGuest) {
    liveUser = await db.user.findUnique({
      where: { id: session!.user.id },
      select: { id: true, plan: true, role: true, approved: true, extraCredits: true, usageCount: true, usageDate: true },
    });
    // If the user was deleted, treat as guest
    if (!liveUser) {
      return NextResponse.json({ error: "Account not found" }, { status: 401 });
    }
  }

  const plan = getPlan(liveUser?.plan || session?.user?.plan);
  const isAdmin = liveUser?.role === "admin";
  const isApproved = isAdmin || liveUser?.approved === true;
  // Admins unlock everything regardless of plan
  const allowedPersonalities = isAdmin
    ? PERSONALITIES.map((p) => p.id)
    : plan.allowedPersonalities;

  const personalityId = body.personality || DEFAULT_PERSONALITY_ID;
  const modeId = body.mode || DEFAULT_MODE_ID;

  // Beta: signed-in but unapproved users cannot chat
  if (!isGuest && !isApproved) {
    return NextResponse.json(
      {
        error: "not-approved",
        message:
          "Your account is pending beta approval. An admin will approve you shortly.",
      },
      { status: 403 },
    );
  }

  // Guest check: guests can only use the free-tier personalities
  if (isGuest && !allowedPersonalities.includes(personalityId)) {
    return NextResponse.json(
      {
        error: "free-personality",
        message:
          "This personality requires a free account. Sign in with Roblox to unlock all models.",
      },
      { status: 403 },
    );
  }

  // Enforce daily limit for signed-in non-admin users. Admins = unlimited.
  if (!isGuest && !isAdmin && liveUser) {
    const today = todayKey();
    // effective limit = plan limit + admin-granted extra credits
    const effectiveLimit =
      plan.dailyMessageLimit === -1 ? -1 : plan.dailyMessageLimit + (liveUser.extraCredits || 0);
    if (liveUser.usageDate !== today) {
      await db.user.update({
        where: { id: liveUser.id },
        data: { usageDate: today, usageCount: 1 },
      });
    } else {
      if (effectiveLimit !== -1 && liveUser.usageCount >= effectiveLimit) {
        return NextResponse.json(
          {
            error: "limit-reached",
            message: `You've reached your daily limit of ${effectiveLimit} messages. Upgrade for unlimited.`,
          },
          { status: 429 },
        );
      }
      await db.user.update({
        where: { id: liveUser.id },
        data: { usageCount: { increment: 1 } },
      });
    }
  }

  const personality = getPersonality(personalityId);
  const model = resolveModel(personalityId);
  const systemPrompt = buildSystemPrompt(modeId, personalityId);

  const prior: ChatMessage[] = Array.isArray(body.history)
    ? body.history.filter(
        (m) => m && (m.role === "user" || m.role === "assistant") && m.content,
      )
    : [];

  // Optional Studio context: the currently-selected script in Roblox Studio,
  // forwarded by the web app when the connector is active.
  const studioContext = (body.context ?? "").trim();
  const contextBlock = studioContext
    ? `\n\n[Studio context — currently selected script]\n\`\`\`luau\n${studioContext.slice(0, 8000)}\n\`\`\``
    : "";

  // Optional reference image — use z-ai vision to describe it, then feed the
  // description to the AI so it can build based on what the user showed.
  let imageDescription = "";
  if (body.image && body.image.startsWith("data:")) {
    try {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();
      const visionRes = await zai.chat.completions.createVision({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "You are helping a Roblox developer. Describe this reference image in detail for the purpose of recreating it in Roblox Studio. Focus on: layout, colors (give RGB values), sizes, positions, UI element types (TextLabel, TextButton, Frame, ImageLabel), fonts, text content, and any 3D parts/models visible. Be specific and structured. Keep it under 300 words.",
              },
              { type: "image_url", image_url: { url: body.image } },
            ],
          },
        ],
        thinking: { type: "disabled" },
      });
      imageDescription =
        visionRes?.choices?.[0]?.message?.content ?? "";
    } catch (e) {
      console.error("[chat] image vision failed:", e);
    }
  }

  const imageBlock = imageDescription
    ? `\n\n[Reference image description]\n${imageDescription}\n\nRecreate this in Roblox based on the description above. Generate complete Luau code that builds it.`
    : "";

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...prior.slice(-20),
    { role: "user", content: userMessage + contextBlock + imageBlock },
  ];

  // ── Persist conversation + user message ──────────────────────────────
  let conversationId = body.conversationId;
  try {
    if (!conversationId) {
      const title =
        body.title ||
        userMessage.slice(0, 48) + (userMessage.length > 48 ? "…" : "");
      const conv = await db.conversation.create({
        data: {
          title,
          model: personalityId,
          mode: modeId,
          userId: session?.user?.id || null,
        },
      });
      conversationId = conv.id;
    }
    await db.message.create({
      data: {
        conversationId,
        role: "user",
        content: userMessage,
        mode: modeId,
      },
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
            personality: personalityId,
            personalityLabel: personality.label,
            model,
            mode: modeId,
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
              personality: personalityId,
              mode: modeId,
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
                mode: modeId,
              },
            });
            await db.conversation.update({
              where: { id: conversationId },
              data: { updatedAt: new Date(), model: personalityId, mode: modeId },
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
