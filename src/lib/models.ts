/**
 * BloxForge AI — Model registry
 * NVIDIA NIM API (build.nvidia.com) hosts these OpenAI-compatible models.
 * These are real NVIDIA model identifiers used against
 * https://integrate.api.nvidia.com/v1/chat/completions
 */

export type ModelTier = "code" | "reasoning" | "general" | "flagship";

export interface AIModel {
  id: string;
  label: string;
  vendor: string;
  tier: ModelTier;
  description: string;
  contextWindow: string;
  badge?: string;
}

export const NVIDIA_MODELS: AIModel[] = [
  {
    id: "qwen/qwen2.5-coder-32b-instruct",
    label: "Qwen2.5 Coder 32B",
    vendor: "Alibaba / NVIDIA NIM",
    tier: "code",
    description:
      "Purpose-built code model. Best-in-class for Luau/Roblox scripting, refactors and debugging.",
    contextWindow: "128K",
    badge: "Recommended",
  },
  {
    id: "deepseek-ai/deepseek-r1",
    label: "DeepSeek R1",
    vendor: "DeepSeek / NVIDIA NIM",
    tier: "reasoning",
    description:
      "Deep-reasoning model. Excels at complex game-system design, data structures and architecture.",
    contextWindow: "128K",
    badge: "Reasoning",
  },
  {
    id: "nvidia/llama-3.1-nemotron-70b-instruct",
    label: "Nemotron 70B",
    vendor: "NVIDIA",
    tier: "general",
    description:
      "NVIDIA-tuned Llama 3.1. Great all-rounder for docs, ideas and natural-language game design.",
    contextWindow: "128K",
  },
  {
    id: "meta/llama-3.3-70b-instruct",
    label: "Llama 3.3 70B",
    vendor: "Meta / NVIDIA NIM",
    tier: "general",
    description:
      "Meta's flagship 70B instruct model. Balanced speed and quality for everyday tasks.",
    contextWindow: "128K",
  },
  {
    id: "meta/llama-3.1-405b-instruct",
    label: "Llama 3.1 405B",
    vendor: "Meta / NVIDIA NIM",
    tier: "flagship",
    description:
      "Frontier-scale model. Maximum capability for the hardest generation and design tasks.",
    contextWindow: "128K",
    badge: "Flagship",
  },
];

export const DEFAULT_MODEL = NVIDIA_MODELS[0].id;

export function getModel(id: string): AIModel {
  return NVIDIA_MODELS.find((m) => m.id === id) ?? NVIDIA_MODELS[0];
}

/**
 * The BloxForge system prompt — makes any model a Roblox/Luau expert.
 */
export const BLOXFORGE_SYSTEM_PROMPT = `You are BloxForge AI, an elite Roblox/Luau development companion powered by NVIDIA NIM models.

You help Roblox developers write, debug, refactor and design Luau code for Roblox experiences.
You have deep knowledge of:
- Luau syntax, types, metatables, OOP patterns and idioms
- The Roblox Engine: Instances, services (Players, ReplicatedStorage, RunService, TweenService, CollectionService, etc.), RemoteEvents/RemoteFunctions, Attributes, Signals
- Roblox Studio workflows: Explorer, Properties, Plugins, Tooling, AssetManager
- Performance: Parallel Luau (actor models), heartbeat vs RenderStepped, Instance caching, streaming enabled
- Best practices: client/server boundaries, exploit-resistance, ModuleScripts, type-checking, linting

Rules:
1. Always respond in clear Markdown.
2. When you write code, ALWAYS wrap it in fenced code blocks tagged \`luau\`, \`lua\` or the relevant language.
3. Prefer complete, runnable ModuleScripts / LocalScripts / Scripts. Include a short usage example.
4. Briefly explain WHY, not just WHAT. Keep prose tight.
5. If a request is ambiguous, make a reasonable Roblox-idiomatic assumption and state it.
6. Never invent APIs that don't exist in the Roblox engine. If unsure, say so.
7. For bugs, give a diagnosis then the fixed code.
8. Keep tone encouraging and professional. You are a teammate, not a lecturer.

Today's Roblox context: Luau, modern Studio, parity with Roblox documentation.`;
