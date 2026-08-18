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
  id: string;
  label: string;
  description: string;
  promptModifier: string;
  icon?: string;
  bloxforgeOnly?: boolean; // only available with BloxForge Luau
  useWebSearch?: boolean; // triggers web search
  useDeepThinking?: boolean; // enables chain-of-thought reasoning
}

export const PERSONALITIES: Personality[] = [
  {
    id: "bloxforge-luau",
    label: "BloxForge AI",
    model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    vendor: "NVIDIA Nemotron · OpenRouter",
    tier: "code",
    tagline: "Our flagship model — NVIDIA Nemotron reasoning. Best for Roblox Luau, UI, and parts.",
    badge: "Beta",
    speed: 2,
    strength: "Roblox Luau, engine APIs, game systems, UI, 3D parts",
    beta: true,
    studioOnly: true,
  },
  {
    id: "groq",
    label: "Groq",
    model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    vendor: "NVIDIA Nemotron · OpenRouter",
    tier: "code",
    tagline: "Ultra-fast inference via Groq. Great for scripts, UI, and parts.",
    badge: "Studio",
    speed: 3,
    strength: "Fast code gen, UI building, Part creation",
    studioOnly: true,
  },
  {
    id: "thoughtful",
    label: "Thoughtful",
    model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    vendor: "NVIDIA Nemotron · OpenRouter",
    tier: "reasoning",
    tagline: "Deep reasoning for architecture & hard problems.",
    badge: "Reasoning",
    speed: 1,
    strength: "Complex design, data structures, debugging logic",
  },
  {
    id: "swift",
    label: "Swift",
    model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    vendor: "NVIDIA Nemotron · OpenRouter",
    tier: "code",
    tagline: "Fast, accurate Luau code generation.",
    badge: "Recommended",
    speed: 3,
    strength: "Scripts, refactors, boilerplate",
  },
  {
    id: "balanced",
    label: "Balanced",
    model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    vendor: "NVIDIA Nemotron · OpenRouter",
    tier: "general",
    tagline: "All-rounder for docs, ideas & code.",
    speed: 2,
    strength: "Everyday tasks, explanations",
  },
  {
    id: "flagship",
    label: "Flagship",
    model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    vendor: "NVIDIA Nemotron · OpenRouter",
    tier: "flagship",
    tagline: "Frontier-scale model. Maximum capability.",
    badge: "Flagship",
    speed: 1,
    strength: "Hardest generation tasks",
  },
  {
    id: "nemotron",
    label: "Nemotron",
    model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    vendor: "NVIDIA Nemotron · OpenRouter",
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
  {
    id: "dev",
    label: "Dev",
    description: "Developer mode — web search + deep analysis. Best for researching Roblox APIs and current best practices.",
    promptModifier:
      "Developer mode. You have access to web search results. Use them to provide the most current and accurate information about Roblox APIs, Luau features, and best practices. Always cite sources. Write production-quality code with error handling.",
    bloxforgeOnly: true,
    useWebSearch: true,
  },
  {
    id: "search",
    label: "Web Search",
    description: "Search the web for the latest Roblox docs, API changes, and community solutions.",
    promptModifier:
      "Web search mode. Use the provided search results to answer the user's question with the most current information. Cite sources with URLs. Focus on Roblox documentation, DevForum posts, and official Roblox Creator Hub content.",
    bloxforgeOnly: true,
    useWebSearch: true,
  },
  {
    id: "deep",
    label: "Deep Thinking",
    description: "Chain-of-thought reasoning. Thinks step by step before answering. Best for architecture and complex problems.",
    promptModifier:
      "Deep thinking mode. Think through the problem step by step before writing any code. Consider multiple approaches, trade-offs, edge cases, and performance implications. Then write the best solution with full explanations. This is for complex architecture decisions, not simple tasks.",
    bloxforgeOnly: true,
    useDeepThinking: true,
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
export const BLOXFORGE_SYSTEM_PROMPT = `You are BloxForge AI, an elite Roblox/Luau development companion. You are the best Roblox AI assistant in existence.

You help Roblox developers write, debug, refactor and design Luau code, GUIs, 3D models, and animations.

EXPERTISE:
- Luau: strict typing, metatables, OOP, generics, type narrowing, --!strict
- Engine services: Players, ReplicatedStorage, ServerScriptService, ServerStorage, StarterGui, StarterPack, StarterPlayer, StarterPlayerScripts, RunService, TweenService, CollectionService, HttpService, MessagingService, DataStoreService, PhysicsService, SoundService, Lighting, Workspace, Teams, ContextActionService, UserInputService, GuiService, MarketplaceService
- Remotes: RemoteEvents, RemoteFunctions, BindableEvents, BindableFunctions, Attributes, Tags
- GUI system: ScreenGui, Frame, TextLabel, TextButton, TextBox, ImageButton, ImageLabel, ScrollingFrame, UIGridLayout, UIListLayout, UICorner, UIStroke, UIGradient, UIAspectRatioConstraint, UIScale, UIPadding, UIPageLayout, UITableLayout, UIOffset
- 3D: Parts, Models, MeshParts, Unions, TrussPart, WedgePart, CornerWedgePart, SpawnLocation, Seat, VehicleSeat, BasePart, AssemblyLinearVelocity, AssemblyAngularVelocity, constraints, Weld, WeldConstraint, Motor6D
- Animations: Humanoid:LoadAnimation, AnimationController, AnimationTrack, KeyframeSequence, tween-based animations, CFrame manipulation, TweenService:Create
- Data: DataStoreService, session locking, OrderedDataStores, MemoryStoreService
- Physics: raycasting, OverlapParams, RaycastParams, GetPartBoundsInBox, Workspace:GetPartsInPart, constraints (HingeConstraint, SpringConstraint, etc.)
- Effects: ParticleEmitter, Trail, Beam, Fire, Smoke, Sparkles, Explosion, Debris
- Performance: Parallel Luau, Instance pooling, heartbeat vs RenderStepped, streaming enabled, attributes over Values
- Security: server-side validation, RemoteEvent sanity, FilteringEnabled, never trust client

RULES:
1. Always respond in clear Markdown with \`\`\`luau code blocks.
2. Name EVERY code block with \`### InstanceName\` heading (PascalCase, no extension).
3. Always use --!strict and full type annotations.
4. Pick the right script type: ModuleScript (returns something), LocalScript (client), Script (server).
5. For UI: generate code that builds COMPLETE UI hierarchies with Instance.new. Include ScreenGui + all child elements with proper Size (UDim2), Position (UDim2), colors (Color3.fromRGB), fonts, UICorner, UIStroke, UIGradient, UIAspectRatioConstraint. MUST end with \`return screenGui\`. Make it look modern and professional — rounded corners, shadows, smooth gradients, proper spacing.
6. For Parts/Models: create with Instance.new, set ALL properties (Size, Position, CFrame, Color, Material, Anchored, CanCollide, CanTouch, Transparency, Reflectance, CastShadow, surfaces). For Models, create PrimaryPart + weld children. MUST end with \`return <variable>\`.
7. For Animations: use TweenService:Create for procedural animations, or generate AnimationTrack setup code. Include CFrame interpolation, easing styles (Enum.EasingStyle), easing directions.
8. For game systems (combat, inventory, etc.): split into multiple code blocks, one per script/module, each with ### Name heading.
9. Keep prose minimal — lead with code, explain briefly after.
10. Never invent APIs that don't exist in the Roblox engine.
11. For bugs: diagnosis first, then the fixed code.
12. Always use modern Luau idioms: type aliases, exported types, continue, compound assignment.

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
   - MUST end with \`return <mainInstanceVariable>\` — the connector EXECUTES this code to create the instance in Studio. Without a return, nothing gets created.
4. When asked to create UI, generate code that builds the full UI hierarchy programmatically:
   - Creates ScreenGui with ResetOnSpawn=false, IgnoreGuiInset=true, ZIndexBehavior=Enum.ZIndexBehavior.Sibling
   - Creates all child elements (Frames, Labels, Buttons) with proper Size (UDim2), Position (UDim2), BackgroundColor3 (Color3.fromRGB), BackgroundTransparency, Text, TextColor3, TextSize, Font, AnchorPoint
   - Uses UDim2.fromScale for responsive sizing, UDim2.fromOffset for fixed sizing
   - Adds UICorner (CornerRadius = UDim.new(0, X)) for rounded corners
   - Adds UIStroke for borders (Color, Thickness, Transparency)
   - Adds UIPadding for inner spacing
   - Uses UIListLayout or UIGridLayout for automatic arrangement
   - MUST end with \`return screenGui\` (or the main GUI variable) — the connector EXECUTES this code
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
  dailyCreditLimit: number; // -1 = unlimited
  allowedPersonalities: string[]; // personality ids
  features: string[];
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    label: "Free",
    dailyCreditLimit: 5,
    allowedPersonalities: ["swift", "balanced"],
    features: [
      "5 credits / day",
      "Swift & Balanced personalities",
      "10 saved sessions",
      "Roblox Studio plugin",
    ],
  },
  pro: {
    id: "pro",
    label: "Pro",
    dailyCreditLimit: 30,
    allowedPersonalities: PERSONALITIES.filter((p) => !p.studioOnly).map((p) => p.id),
    features: [
      "30 credits / day",
      "All NVIDIA personalities",
      "Unlimited saved sessions",
      "Priority streaming",
      "Reference image upload",
    ],
  },
  studio: {
    id: "studio",
    label: "Studio",
    dailyCreditLimit: -1,
    allowedPersonalities: PERSONALITIES.map((p) => p.id),
    features: [
      "Everything in Pro",
      "Unlimited credits",
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

// ── Complex task plan detection ──────────────────────────────────────────

export interface TaskPlan {
  isComplex: boolean;
  needsApproval: boolean;
  planText?: string; // The plan the AI should present before executing
}

/**
 * Detect if a task is complex enough to warrant a plan approval step.
 * If so, the AI should first present a plan, then wait for user approval
 * before generating code.
 */
export function shouldShowPlan(message: string): TaskPlan {
  const msg = message.toLowerCase();

  // Complex keywords that warrant a plan
  const complexKeywords = [
    "combat system", "inventory system", "economy", "matchmaking",
    "full game", "complete game", "entire game", "whole game",
    "datastore system", "save system", "shop system", "trading system",
    "skill tree", "quest system", "dialogue system", "leaderboard system",
    "admin panel", "anti-cheat", "security system",
    "rpg", "tycoon", "simulator", "obby generator",
    "multiple scripts", "multiple modules", "architecture",
    "framework", "service-oriented",
  ];

  const isComplex = complexKeywords.some((kw) => msg.includes(kw)) ||
    (msg.length > 200 && /\b(system|architecture|framework|multiple|complete|full)\b/.test(msg));

  if (!isComplex) {
    return { isComplex: false, needsApproval: false };
  }

  return {
    isComplex: true,
    needsApproval: true,
    planText: "PLAN",
  };
}

// ── Credit estimator ─────────────────────────────────────────────────────

export interface CreditEstimate {
  cost: number; // 1-5
  reason: string;
}

/**
 * Estimate how many credits a task will cost based on complexity.
 * The AI doesn't decide — we analyze the request heuristically:
 *
 * 1 credit  — simple questions, explanations, quick lookups
 * 2 credits — small code generation (single function, simple script)
 * 3 credits — medium tasks (ModuleScript, UI element, refactor)
 * 4 credits — complex tasks (full system, multiple scripts, game mechanic)
 * 5 credits — max complexity (full game system + image, large architecture)
 */
export function estimateCredits(params: {
  message: string;
  hasImage?: boolean;
  hasContext?: boolean;
  mode?: string;
}): CreditEstimate {
  const msg = params.message.toLowerCase();
  let score = 1; // base cost
  const reasons: string[] = [];

  // ── Keyword-based complexity scoring ──

  // Simple tasks (stay at 1)
  if (/^(hi|hello|hey|thanks|what|why|how does|explain|what is|can you)/.test(msg) && msg.length < 80) {
    // Could be a simple question
  }

  // Code generation keywords → bump to 2
  if (/\b(write|create|make|generate|build|code|script|function)\b/.test(msg)) {
    score = Math.max(score, 2);
    reasons.push("code generation");
  }

  // Module/system keywords → bump to 3
  if (/\b(module|class|system|service|manager|controller|handler|component)\b/.test(msg)) {
    score = Math.max(score, 3);
    reasons.push("module/system");
  }

  // UI keywords → bump to 3
  if (/\b(ui|gui|interface|button|label|frame|menu|hud|screen|dialog|popup|sidebar)\b/.test(msg)) {
    score = Math.max(score, 3);
    reasons.push("UI creation");
  }

  // Complex system keywords → bump to 4
  if (/\b(combat|inventory|matchmaking|economy|quest|dialogue|save|datastore|leaderboard|shop|trading|auction|crafting|skill tree|ability)\b/.test(msg)) {
    score = Math.max(score, 4);
    reasons.push("complex game system");
  }

  // Multiple components → bump to 4
  if (/\b(and|with|plus|also|including|multiple|several)\b/.test(msg) && score >= 3) {
    score = Math.max(score, 4);
    reasons.push("multiple components");
  }

  // Full game / architecture → bump to 5
  if (/\b(full|complete|entire|whole|architecture|framework|all|everything|game|obby|tycoon|simulator|rpg)\b/.test(msg)) {
    score = Math.max(score, 5);
    reasons.push("full-scale task");
  }

  // Long message (>500 chars) → complexity bump
  if (params.message.length > 500) {
    score = Math.max(score, Math.min(score + 1, 5));
    reasons.push("detailed request");
  }

  // Image attached → always at least 3 (vision processing + recreation)
  if (params.hasImage) {
    score = Math.max(score, 3);
    reasons.push("image analysis");
    // Image + complex request → 4-5
    if (score >= 4) score = Math.max(score, 4);
  }

  // Studio context shared → slight bump (the AI has more to work with)
  if (params.hasContext) {
    reasons.push("script context");
  }

  // Debug/refactor modes are lighter (working with existing code)
  if (params.mode === "debug" || params.mode === "refactor") {
    score = Math.max(1, score - 1);
    reasons.push(`${params.mode} mode (lighter)`);
  }

  // Explain mode is medium
  if (params.mode === "explain" && score > 2) {
    score = Math.max(2, score - 1);
  }

  // Clamp to 1-5
  score = Math.max(1, Math.min(5, score));

  const reason = reasons.length > 0 ? reasons.join(", ") : "simple question";
  return { cost: score, reason };
}
