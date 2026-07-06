/**
 * BloxForge AI — Personality & Mode registry
 *
 * Inspired by lemonade.gg: instead of showing raw model IDs, we present
 * friendly "personalities" (MODEL dropdown) and response "modes" (MODE dropdown).
 * This mirrors the reference UI: MODEL: "Thoughtful" + MODE: "Normal".
 *
 * Each personality maps to a real NVIDIA NIM model id. Each mode appends a
 * modifier to the system prompt.
 */

export type ModelTier = "code" | "reasoning" | "general" | "flagship";

export interface Personality {
  id: string; // short id used in the DB + API (e.g. "thoughtful")
  label: string; // friendly name shown in MODEL dropdown (e.g. "Thoughtful")
  model: string; // real NVIDIA NIM model id
  vendor: string;
  tier: ModelTier;
  tagline: string; // one-line description
  badge?: string;
  speed: 1 | 2 | 3; // 1 = slow/deep, 3 = fast
  strength: string;
}

export interface Mode {
  id: string; // "normal" | "concise" | ...
  label: string; // "Normal" | "Concise" | ...
  description: string;
  promptModifier: string; // appended to system prompt
  icon?: string;
}

export const PERSONALITIES: Personality[] = [
  {
    id: "thoughtful",
    label: "Thoughtful",
    model: "deepseek-ai/deepseek-r1",
    vendor: "DeepSeek / NVIDIA NIM",
    tier: "reasoning",
    tagline: "Deep reasoning for architecture & hard problems.",
    badge: "Reasoning",
    speed: 1,
    strength: "Complex design, data structures, debugging logic",
  },
  {
    id: "swift",
    label: "Swift",
    model: "qwen/qwen2.5-coder-32b-instruct",
    vendor: "Alibaba / NVIDIA NIM",
    tier: "code",
    tagline: "Fast, accurate Luau code generation.",
    badge: "Recommended",
    speed: 3,
    strength: "Scripts, refactors, boilerplate",
  },
  {
    id: "balanced",
    label: "Balanced",
    model: "meta/llama-3.3-70b-instruct",
    vendor: "Meta / NVIDIA NIM",
    tier: "general",
    tagline: "All-rounder for docs, ideas & code.",
    speed: 2,
    strength: "Everyday tasks, explanations",
  },
  {
    id: "flagship",
    label: "Flagship",
    model: "meta/llama-3.1-405b-instruct",
    vendor: "Meta / NVIDIA NIM",
    tier: "flagship",
    tagline: "Frontier-scale model. Maximum capability.",
    badge: "Flagship",
    speed: 1,
    strength: "Hardest generation tasks",
  },
  {
    id: "nemotron",
    label: "Nemotron",
    model: "nvidia/llama-3.1-nemotron-70b-instruct",
    vendor: "NVIDIA",
    tier: "general",
    tagline: "NVIDIA-tuned for natural game design.",
    speed: 2,
    strength: "Natural language, design docs",
  },
];

export const MODES: Mode[] = [
  {
    id: "normal",
    label: "Normal",
    description: "Balanced answers with code and explanation.",
    promptModifier: "",
  },
  {
    id: "concise",
    label: "Concise",
    description: "Short, code-first answers. Minimal prose.",
    promptModifier:
      "Be concise. Lead with the code. Keep prose to one or two sentences. Skip preamble.",
  },
  {
    id: "explain",
    label: "Explain",
    description: "Teaching mode. Walk through the why step by step.",
    promptModifier:
      "Act as a patient teacher. Explain your reasoning step by step. Add inline comments to code. Summarize key takeaways at the end.",
  },
  {
    id: "refactor",
    label: "Refactor",
    description: "Focus on improving existing code structure.",
    promptModifier:
      "Focus on refactoring. Preserve behavior. Improve naming, structure, types, and performance. Briefly note what you changed and why.",
  },
  {
    id: "debug",
    label: "Debug",
    description: "Diagnose issues and ship the fix.",
    promptModifier:
      "Focus on debugging. First give a short root-cause diagnosis, then the minimal fix as code. Call out any related risks.",
  },
];

export const DEFAULT_PERSONALITY_ID = "swift";
export const DEFAULT_MODE_ID = "normal";

export function getPersonality(id: string | undefined | null): Personality {
  if (!id) return PERSONALITIES[1]; // swift
  return PERSONALITIES.find((p) => p.id === id) ?? PERSONALITIES[1];
}

export function getMode(id: string | undefined | null): Mode {
  if (!id) return MODES[0];
  return MODES.find((m) => m.id === id) ?? MODES[0];
}

/**
 * Personality → model id resolution (for the AI engine).
 */
export function resolveModel(personalityId: string): string {
  return getPersonality(personalityId).model;
}

/**
 * The BloxForge base system prompt — makes any model a Roblox/Luau expert.
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
3. Name every code block with a descriptive heading just above it in the format \`### ScriptName.lua\` (or \`### PartName\` for instance suggestions). The name MUST be a valid Roblox instance name: PascalCase, no spaces, no extension in the actual name. This name is used to create the instance in Studio.
4. Prefer complete, runnable ModuleScripts / LocalScripts / Scripts. Include a short usage example.
5. Pick the right script type for the job: ModuleScript for reusable modules (must \`return\` something), LocalScript for client-only code (player input, UI, camera), Script for server logic. The heading + code together should make the type obvious.
6. When the user asks to create a Part, Model, or other Instance (not a script), describe its name, class, parent, and key properties in a short Luau-style block or a clear list — the connector can create named instances.
7. Briefly explain WHY, not just WHAT. Keep prose tight.
8. If a request is ambiguous, make a reasonable Roblox-idiomatic assumption and state it.
9. Never invent APIs that don't exist in the Roblox engine. If unsure, say so.
10. For bugs, give a diagnosis then the fixed code.
11. Keep tone encouraging and professional. You are a teammate, not a lecturer.

Today's Roblox context: Luau, modern Studio, parity with Roblox documentation.`;

/**
 * Build the full system prompt: base + mode modifier.
 */
export function buildSystemPrompt(modeId: string): string {
  const mode = getMode(modeId);
  if (!mode.promptModifier) return BLOXFORGE_SYSTEM_PROMPT;
  return `${BLOXFORGE_SYSTEM_PROMPT}\n\n--- Mode: ${mode.label} ---\n${mode.promptModifier}`;
}

// ── Plan limits ──────────────────────────────────────────────────────────

export interface Plan {
  id: "free" | "pro" | "studio";
  label: string;
  dailyMessageLimit: number; // -1 = unlimited
  allowedPersonalities: string[]; // personality ids
  features: string[];
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    label: "Free",
    dailyMessageLimit: 50,
    allowedPersonalities: ["swift", "balanced"],
    features: [
      "50 AI messages / day",
      "Swift & Balanced personalities",
      "10 saved sessions",
      "Roblox Studio plugin",
    ],
  },
  pro: {
    id: "pro",
    label: "Pro",
    dailyMessageLimit: -1,
    allowedPersonalities: PERSONALITIES.map((p) => p.id),
    features: [
      "Unlimited messages",
      "All 5 NVIDIA personalities",
      "Unlimited saved sessions",
      "Priority streaming",
    ],
  },
  studio: {
    id: "studio",
    label: "Studio",
    dailyMessageLimit: -1,
    allowedPersonalities: PERSONALITIES.map((p) => p.id),
    features: [
      "Everything in Pro",
      "Team shared sessions",
      "Custom system prompts",
      "Priority support",
    ],
  },
};

export function getPlan(planId: string | undefined | null): Plan {
  return PLANS[planId || "free"] ?? PLANS.free;
}
