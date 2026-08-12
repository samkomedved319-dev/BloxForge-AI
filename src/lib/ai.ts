/**
 * BloxForge AI — AI engine
 *
 * Primary path: NVIDIA NIM API (https://integrate.api.nvidia.com/v1/chat/completions)
 *   OpenAI-compatible, real-time streaming. Uses either the NVIDIA_API_KEY env
 *   var OR a custom API key added by an admin via the dashboard (stored in DB).
 * Fallback path: z-ai-web-dev-sdk (so the live demo works without any key).
 *
 * Any OpenAI-compatible endpoint works as a "custom" key — admins can add their
 * own NVIDIA key, Together AI, Groq, OpenRouter, OpenAI, etc. The highest-priority
 * active key wins.
 */

import ZAI from "z-ai-web-dev-sdk";
import { BLOXFORGE_SYSTEM_PROMPT } from "@/lib/models"; // re-exported below
import { db } from "@/lib/db";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  deepThinking?: boolean;
  personalityId?: string; // used to select the right API key (e.g. "groq")
}

export type EngineProvider = "nvidia" | "custom" | "zai";

export interface EngineMeta {
  provider: EngineProvider;
  model: string;
  label: string;
}

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

export function getNvidiaKey(): string | undefined {
  return process.env.NVIDIA_API_KEY || process.env.NVIDIA_KEY;
}

export interface ResolvedKey {
  provider: EngineProvider;
  baseUrl: string;
  apiKey: string;
  label: string;
  modelOverride?: string | null;
}

/**
 * Resolve the best available API key for a given personality.
 * 1. If personality is "groq", look for a Groq-specific key in the DB.
 * 2. Highest-priority active custom key from the DB (admin-configured).
 * 3. NVIDIA_API_KEY env var.
 * 4. None → fall back to z-ai demo engine.
 */
export async function resolveApiKey(personalityId?: string): Promise<ResolvedKey | null> {
  // ── Groq: look for a Groq API key ──
  if (personalityId === "groq") {
    try {
      const groqKey = await db.apiKey.findFirst({
        where: { active: true, provider: "groq" },
        orderBy: { priority: "desc" },
      });
      if (groqKey) {
        return {
          provider: "custom",
          baseUrl: groqKey.baseUrl || "https://api.groq.com/openai/v1",
          apiKey: groqKey.key,
          label: groqKey.label || "Groq",
          modelOverride: groqKey.model,
        };
      }
    } catch (e) {
      console.error("[ai] failed to load Groq key:", e);
    }
  }

  // ── Default: highest-priority active custom key ──
  try {
    const custom = await db.apiKey.findFirst({
      where: { active: true },
      orderBy: { priority: "desc" },
    });
    if (custom) {
      return {
        provider: custom.provider === "nvidia" ? "nvidia" : "custom",
        baseUrl: custom.baseUrl,
        apiKey: custom.key,
        label: custom.label,
        modelOverride: custom.model,
      };
    }
  } catch (e) {
    console.error("[ai] failed to load custom keys:", e);
  }

  const envKey = getNvidiaKey();
  if (envKey) {
    return {
      provider: "nvidia",
      baseUrl: NVIDIA_BASE_URL,
      apiKey: envKey,
      label: "NVIDIA (env)",
    };
  }
  return null;
}

/**
 * Stream a chat completion as a series of text deltas.
 * Yields `{ delta, meta }` chunks. The first chunk carries engine metadata.
 */
export async function* streamChat(
  opts: ChatOptions,
): AsyncGenerator<{ delta: string; meta?: EngineMeta; done?: boolean }> {
  // For GLM-based personalities (model starts with "glm"), always use the
  // z-ai SDK directly — it's the native GLM provider and handles it best.
  const isGlmModel = opts.model && opts.model.toLowerCase().startsWith("glm");

  if (!isGlmModel) {
    const key = await resolveApiKey(opts.personalityId);
    if (key) {
      try {
        yield* streamOpenAICompatible(opts, key);
        return;
      } catch (err) {
        console.error("[bloxforge] stream failed, falling back to z-ai:", err);
        // fall through to z-ai
      }
    }
  }

  yield* streamZai(opts);
}

/**
 * Stream from any OpenAI-compatible /chat/completions endpoint
 * (NVIDIA NIM, OpenAI, OpenRouter, Groq, Together, etc.)
 */
async function* streamOpenAICompatible(
  opts: ChatOptions,
  key: ResolvedKey,
): AsyncGenerator<{ delta: string; meta?: EngineMeta; done?: boolean }> {
  const model = key.modelOverride || opts.model;

  const body = {
    model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.6,
    top_p: 0.95,
    max_tokens: opts.maxTokens ?? 2048,
    stream: true,
  };

  // Do the fetch BEFORE yielding the meta chunk — so if it fails, the caller
  // can cleanly fall back to another engine without having already sent meta.
  const res = await fetch(`${key.baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key.apiKey}`,
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(`${key.label} API ${res.status}: ${text.slice(0, 300)}`);
  }

  // Now yield meta — the fetch succeeded, we're committed to this engine.
  yield {
    delta: "",
    meta: { provider: key.provider, model, label: `${key.label} · ${model}` },
  };

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") {
        yield { delta: "", done: true };
        return;
      }
      try {
        const json = JSON.parse(data);
        const delta: string = json?.choices?.[0]?.delta?.content ?? "";
        if (delta) yield { delta };
      } catch {
        // ignore keep-alive / partial
      }
    }
  }
  yield { delta: "", done: true };
}

/**
 * Fallback engine using z-ai-web-dev-sdk. The SDK is non-streaming, so we
 * request the full completion then emit it in small chunks to simulate a
 * smooth streaming experience for the UI.
 */
async function* streamZai(
  opts: ChatOptions,
): AsyncGenerator<{ delta: string; meta?: EngineMeta; done?: boolean }> {
  yield {
    delta: "",
    meta: {
      provider: "zai",
      model: opts.model,
      label: `${opts.model} · demo engine`,
    },
  };

  const zai = await ZAI.create();

  const completion = await zai.chat.completions.create({
    messages: opts.messages,
    thinking: { type: opts.deepThinking ? "enabled" : "disabled" },
  });

  let content: string = completion?.choices?.[0]?.message?.content ?? "";

  // If deep thinking produced reasoning tokens, strip them and keep only the
  // final answer (the content already has the final answer from the SDK).
  if (opts.deepThinking && content) {
    // Remove any <think>...</think> blocks if present
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  }

  // Stream in larger chunks for a more natural feel
  const chunkSize = 4;
  for (let i = 0; i < content.length; i += chunkSize) {
    yield { delta: content.slice(i, i + chunkSize) };
  }
  yield { delta: "", done: true };
}

/**
 * Non-streaming completion (used by the Roblox plugin HTTP API).
 */
export async function completeChat(
  opts: ChatOptions,
): Promise<{ content: string; meta: EngineMeta }> {
  let accumulated = "";
  let meta: EngineMeta = {
    provider: "zai",
    model: opts.model,
    label: opts.model,
  };

  for await (const chunk of streamChat(opts)) {
    if (chunk.meta) meta = chunk.meta;
    if (chunk.delta) accumulated += chunk.delta;
  }

  return { content: accumulated, meta };
}

export { BLOXFORGE_SYSTEM_PROMPT };
