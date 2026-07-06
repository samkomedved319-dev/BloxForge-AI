/**
 * BloxForge AI — AI engine
 *
 * Primary path: NVIDIA NIM API (https://integrate.api.nvidia.com/v1/chat/completions)
 *   OpenAI-compatible, real-time streaming, uses NVIDIA_API_KEY env var.
 * Fallback path: z-ai-web-dev-sdk (so the live demo works without an NVIDIA key).
 *
 * Both paths expose the same surface: a streaming chat completion over
 * Roblox/Luau-aware messages.
 */

import ZAI from "z-ai-web-dev-sdk";
import { BLOXFORGE_SYSTEM_PROMPT } from "@/lib/models";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export type EngineProvider = "nvidia" | "zai";

export interface EngineMeta {
  provider: EngineProvider;
  model: string;
  label: string;
}

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

export function getNvidiaKey(): string | undefined {
  return process.env.NVIDIA_API_KEY || process.env.NVIDIA_KEY;
}

/**
 * Stream a chat completion as a series of text deltas.
 * Yields `{ delta, meta }` chunks. The first chunk carries engine metadata.
 */
export async function* streamChat(
  opts: ChatOptions,
): AsyncGenerator<{ delta: string; meta?: EngineMeta; done?: boolean }> {
  const nvidiaKey = getNvidiaKey();

  if (nvidiaKey) {
    try {
      yield* streamNvidia(opts, nvidiaKey);
      return;
    } catch (err) {
      console.error("[bloxforge] NVIDIA stream failed, falling back:", err);
      // fall through to z-ai
    }
  }

  yield* streamZai(opts);
}

async function* streamNvidia(
  opts: ChatOptions,
  apiKey: string,
): AsyncGenerator<{ delta: string; meta?: EngineMeta; done?: boolean }> {
  yield {
    delta: "",
    meta: { provider: "nvidia", model: opts.model, label: opts.model },
  };

  const body = {
    model: opts.model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.6,
    top_p: 0.95,
    max_tokens: opts.maxTokens ?? 2048,
    stream: true,
  };

  const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(`NVIDIA API ${res.status}: ${text.slice(0, 300)}`);
  }

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
 * request the full completion then emit it in word chunks to simulate a
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
    thinking: { type: "disabled" },
  });

  const content: string = completion?.choices?.[0]?.message?.content ?? "";

  // Stream out in small chunks for a live feel.
  const chunkSize = 6;
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
