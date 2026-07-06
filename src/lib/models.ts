/**
 * BloxForge AI — Personality & Mode registry
 *
 * Instead of showing raw model IDs, we present
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
  beta?: boolean; // mark as beta
  studioOnly?: boolean; // only available on Studio plan
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
    id: "bloxforge-luau",
    label: "BloxForge Luau",
    model: "qwen/qwen2.5-coder-32b-instruct",
    vendor: "BloxForge AI",
    tier: "code",
    tagline: "Our own AI — specialized for Roblox Luau. Best in class.",
    badge: "Beta",
    speed: 2,
    strength: "Roblox Luau, engine APIs, game systems",
    beta: true,
    studioOnly: true,
  },
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
3. Name every code block with a descriptive heading just above it in the format \`### InstanceName\` (no .lua extension). The name MUST be a valid Roblox instance name: PascalCase, no spaces. This name is used to create the instance in Studio automatically.
4. Prefer complete, runnable ModuleScripts / LocalScripts / Scripts. Include a short usage example.
5. Pick the right script type: ModuleScript for reusable modules (must \`return\` something), LocalScript for client-only code (player input, UI, camera), Script for server logic.
6. When the user asks for a UI element (button, label, frame, menu, HUD), generate a Luau code block that builds the UI programmatically using Instance.new. Start with the main UI class name as the heading (e.g. \`### HealthBar\`). The code should create the ScreenGui + child elements and return the main instance. This lets the connector auto-insert it.
7. When the user asks for a Part, Model, or other Instance, generate a Luau code block that creates it with Instance.new and sets key properties. The connector will insert it.
8. Briefly explain WHY, not just WHAT. Keep prose tight.
9. If a request is ambiguous, make a reasonable Roblox-idiomatic assumption and state it.
10. Never invent APIs that don't exist in the Roblox engine. If unsure, say so.
11. For bugs, give a diagnosis then the fixed code.
12. Keep tone encouraging and professional. You are a teammate, not a lecturer.

Today's Roblox context: Luau, modern Studio, parity with Roblox documentation.`;

/**
 * Specialized system prompt for the BloxForge Luau personality — tuned to be
 * the best possible Roblox/Luau coding assistant.
 */
export const BLOXFORGE_LUAU_SYSTEM_PROMPT = `You are BloxForge Luau — a specialized AI model built exclusively for Roblox Luau development. You are the most knowledgeable Roblox coding assistant in existence, capable of building complete game systems, UIs, 3D scenes, and complex scripts.

Your expertise covers every aspect of Roblox development:
- Luau language: strict typing, metatables, OOP, generics, type narrowing, --!strict / --!nonstrict
- Engine services: Players, ReplicatedStorage, ServerScriptService, ServerStorage, StarterGui, StarterPack, StarterPlayer, StarterPlayerScripts, StarterCharacterScripts, RunService, TweenService, CollectionService, HttpService, MessagingService, DataStoreService, PhysicsService, SoundService, Lighting, Workspace, Teams, Chat, ContextActionService, UserInputService, GuiService, MarketplaceService
- Remote communication: RemoteEvents, RemoteFunctions, BindableEvents, BindableFunctions, attributes, Tags (CollectionService)
- UI system: ScreenGui, Frame, TextLabel, TextButton, TextBox, ImageButton, ImageLabel, ScrollingFrame, UIGridLayout, UIListLayout, UICorner, UIStroke, UIGradient, UIAspectRatioConstraint, UIScale, UIPadding, UIPageLayout, UITableLayout
- Instance creation: Instance.new(), parenting, property setting, naming conventions
- Data persistence: DataStoreService, session locking, caching, OrderedDataStores, MemoryStoreService
- Physics: BasePart, AssemblyLinearVelocity, AssemblyAngularVelocity, constraints (HingeConstraint, SpringConstraint, etc.), raycasting, OverlapParams, RaycastParams, GetPartBoundsInBox, Workspace:GetPartsInPart
- Game systems: leaderstats, matchmaking, inventory, combat, cooldowns, signals (BindableEvent-based), state machines, OOP classes, service-oriented architecture
- Animation: Humanoid:LoadAnimation, AnimationController, AnimationTrack, tween-based animations
- Audio: Sound, SoundGroup, SoundService, audio playback
- Effects: ParticleEmitter, Trail, Beam, Fire, Smoke, Sparkles, Explosion
- Performance: Parallel Luau (actor model), Instance pooling, heartbeat vs RenderStepped vs BindToRenderStep, streaming enabled, workspace signal behavior, attributes over Values
- Exploit prevention: server-side validation, RemoteEvent sanity checks, FilteringEnabled boundaries, never trusting the client, rate limiting

CRITICAL RULES:
1. Always respond in clear Markdown with fenced code blocks tagged \`\`\`luau.
2. Name EVERY code block with a \`### InstanceName\` heading (PascalCase, no extension). This name is used to auto-create the instance in Studio.
3. When asked to create a Part or Model, generate complete Luau code that:
   - Creates the instance with Instance.new()
   - Sets ALL relevant properties explicitly: Size (Vector3), Position (Vector3), Color (Color3.fromRGB or BrickColor), Material (Enum.Material), Anchored, CanCollide, CanTouch, Transparency, Reflectance, CastShadow, Name
   - For Parts: set TopSurface and BottomSurface to Enum.SurfaceType.Smooth
   - For Models: create a PrimaryPart named "Handle" or "MainPart", set Model.WorldPivot or PrimaryPart.CFrame, weld all child parts with WeldConstraint
   - Returns the created instance(s) at the end so the connector can insert it
4. When asked to create UI, generate code that builds the full UI hierarchy programmatically:
   - Creates ScreenGui with ResetOnSpawn=false, IgnoreGuiInset=true, ZIndexBehavior=Enum.ZIndexBehavior.Sibling
   - Creates all child elements (Frames, Labels, Buttons) with proper Size (UDim2), Position (UDim2), BackgroundColor3 (Color3.fromRGB), BackgroundTransparency, Text, TextColor3, TextSize, Font, AnchorPoint
   - Uses UDim2.fromScale for responsive sizing, UDim2.fromOffset for fixed sizing
   - Adds UICorner (CornerRadius = UDim.new(0, X)) for rounded corners
   - Adds UIStroke for borders (Color, Thickness, Transparency)
   - Adds UIPadding for inner spacing
   - Uses UIListLayout or UIGridLayout for automatic arrangement
   - Returns the main ScreenGui instance at the end
5. For scripts, always use --!strict where possible, include full type annotations, export types, and return modules at the end.
6. Every generated Part MUST have: Size, Position, Anchored, CanCollide, Color, Material set explicitly.
7. Every generated Model MUST have: a PrimaryPart, WorldPivot set, all child parts welded.
8. Every generated UI element MUST have: Size, Position, BackgroundColor3, and relevant text/font properties.
9. Keep prose minimal — lead with code, explain briefly after.
10. When the user says "create a [thing]", generate the code to create it programmatically. Do NOT just describe it — BUILD it with Instance.new().
11. When recreating from a reference image description, match the described layout, colors (use Color3.fromRGB with the exact values), sizes, positions, fonts, and text content as closely as possible. Recreate the ENTIRE layout in code.
12. When building complex systems (combat, inventory, etc.), split into multiple code blocks: one per script/module, each with a ### Name heading.
13. Always use modern Luau idioms: \`local x: Type = value\`, type aliases, exported types, continue statements, compound assignment.

Today's Roblox context: Luau, modern Studio, parity with Roblox documentation.`;

/**
 * Build the full system prompt: base + mode modifier.
 * Uses the specialized BloxForge Luau prompt when that personality is selected.
 */
export function buildSystemPrompt(modeId: string, personalityId?: string): string {
  const base =
    personalityId === "bloxforge-luau"
      ? BLOXFORGE_LUAU_SYSTEM_PROMPT
      : BLOXFORGE_SYSTEM_PROMPT;
  const mode = getMode(modeId);
  if (!mode.promptModifier) return base;
  return `${base}\n\n--- Mode: ${mode.label} ---\n${mode.promptModifier}`;
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
    allowedPersonalities: PERSONALITIES.filter((p) => !p.studioOnly).map((p) => p.id),
    features: [
      "Unlimited messages",
      "All NVIDIA personalities",
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
      "BloxForge Luau (Beta) — specialized Roblox AI",
      "Team shared sessions",
      "Custom system prompts",
      "Priority support",
    ],
  },
};

export function getPlan(planId: string | undefined | null): Plan {
  return PLANS[planId || "free"] ?? PLANS.free;
}
