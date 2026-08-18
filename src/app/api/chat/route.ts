import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { streamChat, type ChatMessage } from "@/lib/ai";
import {
  buildSystemPrompt,
  resolveModel,
  getPersonality,
  getMode,
  getPlan,
  estimateCredits,
  shouldShowPlan,
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

  // Always fetch the LIVE user from the DB — the JWT may be stale.
  let liveUser = null;
  if (!isGuest) {
    try {
      liveUser = await db.user.findUnique({
        where: { id: session!.user.id },
        select: { id: true, plan: true, role: true, approved: true, extraCredits: true, usageCount: true, usageDate: true },
      });
    } catch {
      // DB not available (Vercel serverless) — fall back to session data
      liveUser = {
        id: session!.user.id,
        plan: (session.user as any).plan || "free",
        role: (session.user as any).role || "user",
        approved: (session.user as any).approved ?? false,
        extraCredits: 0,
        usageCount: 0,
        usageDate: null,
      } as any;
    }
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
  const currentMode = getMode(modeId);

  // BloxForge-only modes (Dev, Web Search, Deep Thinking) require the
  // bloxforge-luau personality. If a non-bloxforge personality is selected,
  // silently fall back to normal mode.
  let effectiveModeId = modeId;
  if (currentMode?.bloxforgeOnly && personalityId !== "bloxforge-luau") {
    effectiveModeId = "normal";
  }

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

  // ── Credit estimation: analyze task complexity (1-5 credits) ──
  const creditEstimate = estimateCredits({
    message: userMessage,
    hasImage: Boolean(body.image),
    hasContext: Boolean((body.context ?? "").trim()),
    mode: effectiveModeId,
  });

  // Enforce daily credit limit for signed-in non-admin users. Admins = unlimited.
  if (!isGuest && !isAdmin && liveUser) {
    const today = todayKey();
    const effectiveLimit =
      plan.dailyCreditLimit === -1 ? -1 : plan.dailyCreditLimit + (liveUser.extraCredits || 0);
    const currentUsage = liveUser.usageDate === today ? liveUser.usageCount : 0;

    if (effectiveLimit !== -1 && currentUsage + creditEstimate.cost > effectiveLimit) {
      return NextResponse.json(
        {
          error: "limit-reached",
          message: `This task costs ${creditEstimate.cost} credits but you only have ${Math.max(0, effectiveLimit - currentUsage)} remaining today (${effectiveLimit} total). Upgrade for more credits.`,
          creditsNeeded: creditEstimate.cost,
          creditsRemaining: Math.max(0, effectiveLimit - currentUsage),
        },
        { status: 429 },
      );
    }

    // Deduct credits
    if (liveUser.usageDate !== today) {
      await db.user.update({
        where: { id: liveUser.id },
        data: { usageDate: today, usageCount: creditEstimate.cost },
      });
    } else {
      await db.user.update({
        where: { id: liveUser.id },
        data: { usageCount: { increment: creditEstimate.cost } },
      });
    }
  }

  const personality = getPersonality(personalityId);
  const model = resolveModel(personalityId);
  const systemPrompt = buildSystemPrompt(effectiveModeId, personalityId);

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

  // ── Complex task plan: if the task is complex, ask the AI to present a
  // plan first and wait for user approval before generating code. ──
  const taskPlan = shouldShowPlan(userMessage);
  const planInstruction = taskPlan.needsApproval
    ? `\n\n[IMPORTANT — This is a complex task. Before writing any code, present a plan as a numbered list under a "## Plan" heading. Include: what scripts/modules you'll create, what each does, and the order of implementation. End with: "Reply 'approve' to proceed, or tell me what to change." Then STOP — do not write code until the user approves.]`
    : "";

  // ── Web search (Dev + Web Search modes, BloxForge Luau only) ──
  let searchBlock = "";
  const effectiveMode = getMode(effectiveModeId);
  if (effectiveMode?.useWebSearch && userMessage.length > 5) {
    try {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();
      const searchQuery = `Roblox Luau ${userMessage.slice(0, 200)}`;
      const searchResults = await zai.functions.invoke("web_search", {
        query: searchQuery,
        num: 5,
      });
      if (Array.isArray(searchResults) && searchResults.length > 0) {
        const formatted = searchResults
          .map(
            (r: any, i: number) =>
              `${i + 1}. ${r.name || r.title || "Untitled"}\n   URL: ${r.url || r.link || ""}\n   ${r.snippet || r.description || ""}`,
          )
          .join("\n\n");
        searchBlock = `\n\n[Web search results for "${searchQuery}"]\n${formatted}\n\nUse these search results to provide accurate, up-to-date information. Cite sources with URLs.`;
      }
    } catch (e) {
      console.error("[chat] web search failed:", e);
    }
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...prior.slice(-20),
    { role: "user", content: userMessage + contextBlock + imageBlock + searchBlock + planInstruction },
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
            creditsUsed: creditEstimate.cost,
            creditReason: creditEstimate.reason,
            isPlan: taskPlan.needsApproval,
          })}\n\n`,
        ),
      );

      try {
        for await (const chunk of streamChat({ model, messages, deepThinking: effectiveMode?.useDeepThinking, personalityId })) {
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
