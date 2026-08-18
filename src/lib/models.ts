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
    id: "swift",
    label: "BloxForge AI",
    model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    vendor: "NVIDIA Nemotron",
    tier: "code",
    tagline: "Best for scripts, GUI, 3D models & animations.",
    badge: "Recommended",
    speed: 3,
    strength: "Everything — scripts, GUI, 3D, animations",
  },
  {
    id: "thoughtful",
    label: "Reasoning",
    model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    vendor: "NVIDIA Nemotron",
    tier: "reasoning",
    tagline: "Deep thinking for complex game architecture.",
    badge: "Deep",
    speed: 1,
    strength: "Architecture, systems design, debugging",
  },
  {
    id: "bloxforge-luau",
    label: "BloxForge Pro",
    model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    vendor: "NVIDIA Nemotron",
    tier: "code",
    tagline: "Advanced mode with web search & deep thinking.",
    badge: "Pro",
    speed: 2,
    strength: "Web search, deep thinking, Dev mode",
    beta: true,
    studioOnly: true,
  },
];

export const MODES: Mode[] = [
  {
    id: "low",
    label: "Low",
    description: "Fast & minimal. Quick answers, minimal code.",
    promptModifier: "Be fast and minimal. Give short answers with just the essential code. No explanations unless asked.",
  },
  {
    id: "default",
    label: "Default",
    description: "Balanced code + explanation. Good for everyday tasks.",
    promptModifier: "",
  },
  {
    id: "medium",
    label: "Medium",
    description: "More detailed code with comments and types.",
    promptModifier: "Write detailed code with inline comments, full type annotations, and brief explanations of key decisions.",
  },
  {
    id: "high",
    label: "High",
    description: "Production quality. Error handling, edge cases, full types.",
    promptModifier: "Write production-quality code. Include full error handling, edge case handling, complete type annotations, input validation, and performance optimizations. Add detailed comments explaining complex logic.",
    bloxforgeOnly: true,
    useWebSearch: true,
  },
  {
    id: "max",
    label: "Max",
    description: "Maximum detail. Full architecture, documentation, tests.",
    promptModifier: "Write maximum quality code. Include full architecture documentation, complete type system, error recovery, performance profiling comments, edge case tests, and usage examples. Think through every possible scenario.",
    bloxforgeOnly: true,
    useWebSearch: true,
    useDeepThinking: true,
  },
  {
    id: "ultracode",
    label: "UltraCode",
    description: "Ultra mode. Deep thinking + web search + maximum output.",
    promptModifier: "ULTRA MODE. Use deep chain-of-thought reasoning, web search for current best practices, and produce the most complete, production-ready code possible. Include: full type system, error handling, edge cases, performance optimization, security considerations, documentation, usage examples, and alternative approaches. This is the highest quality mode.",
    bloxforgeOnly: true,
    useWebSearch: true,
    useDeepThinking: true,
  },
];

export const DEFAULT_PERSONALITY_ID = "swift";
export const DEFAULT_MODE_ID = "default";

// ── Slash commands (CLI-style /commands) ──────────────────────────────────

export interface SlashCommand {
  id: string;
  command: string;
  label: string;
  description: string;
  promptPrefix: string;
  icon: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "script",
    command: "/script",
    label: "Script",
    description: "Generate a Luau script or module",
    promptPrefix: "Generate a Roblox Luau script.",
    icon: "Code2",
  },
  {
    id: "gui",
    command: "/gui",
    label: "GUI",
    description: "Build a complete UI with ScreenGui, Frames, Buttons",
    promptPrefix: "Generate a Roblox GUI using Instance.new. Build the full ScreenGui hierarchy with Frames, TextLabels, TextButtons, UICorner, UIStroke, UIGradient. End with return screenGui.",
    icon: "Layout",
  },
  {
    id: "3d",
    command: "/3d",
    label: "3D Model",
    description: "Create Parts, Models, welded assemblies",
    promptPrefix: "Generate Luau code that creates a 3D model using Instance.new('Part') or Instance.new('Model'). Set Size, Position, Color, Material, Anchored, CanCollide. For Models, create a PrimaryPart and weld children. End with return <variable>.",
    icon: "Box",
  },
  {
    id: "animation",
    command: "/anim",
    label: "Animation",
    description: "TweenService animations, CFrame interpolation",
    promptPrefix: "Generate Luau code for a Roblox animation using TweenService:Create or AnimationTrack. Include CFrame interpolation, easing styles (Enum.EasingStyle.Quad, Enum.EasingDirection.Out). Make it smooth and professional.",
    icon: "Play",
  },
  {
    id: "uilibrary",
    command: "/ui-library",
    label: "UI Library",
    description: "Browse pre-built UI templates",
    promptPrefix: "",
    icon: "Library",
  },
  {
    id: "mechanics",
    command: "/mechanics",
    label: "Mechanic Library",
    description: "Browse pre-built game mechanics",
    promptPrefix: "",
    icon: "Wrench",
  },
];

// ── UI Library templates ────────────────────────────────────────────────────

export interface UITemplate {
  id: string;
  label: string;
  emoji: string;
  description: string;
  prompt: string;
}

export const UI_LIBRARY: UITemplate[] = [
  { id: "shop", label: "Shop UI", emoji: "🛒", description: "Item grid + buy buttons + currency", prompt: "Create a modern shop GUI with a grid of item cards, buy buttons, and a currency display at the top. Use UICorner for rounded corners and UIGradient for a premium look. End with return screenGui." },
  { id: "healthbar", label: "Health Bar", emoji: "❤️", description: "Smooth gradient health bar", prompt: "Create a health bar UI with a smooth gradient fill (green to red), rounded corners, and health text. Position it at the top center of the screen. End with return screenGui." },
  { id: "mainmenu", label: "Main Menu", emoji: "🎮", description: "Play / Settings / Quit buttons", prompt: "Create a main menu GUI with a title, Play button, Settings button, and Quit button. Use a dark background with violet accents and rounded corners. End with return screenGui." },
  { id: "inventory", label: "Inventory", emoji: "🎒", description: "Grid layout item slots", prompt: "Create an inventory GUI with a UIGridLayout of item slots, a sidebar with player stats, and a close button. Each slot should have a UICorner and UIStroke. End with return screenGui." },
  { id: "chat", label: "Chat Box", emoji: "💬", description: "Custom chat UI", prompt: "Create a custom chat GUI with a scrolling message list, text input at the bottom, and a send button. Use UICorner and semi-transparent background. End with return screenGui." },
  { id: "settings", label: "Settings Panel", emoji: "⚙️", description: "Sliders + toggles + tabs", prompt: "Create a settings panel GUI with tabs (Audio, Graphics, Gameplay), sliders for volume, toggles for options, and a save button. Use UICorner for a modern look. End with return screenGui." },
  { id: "notification", label: "Notification", emoji: "🔔", description: "Toast notification popup", prompt: "Create a notification toast GUI that slides in from the right, shows a title and message, then fades out after 3 seconds using TweenService. End with return screenGui." },
  { id: "loading", label: "Loading Screen", emoji: "⏳", description: "Animated loading screen", prompt: "Create a loading screen GUI with a logo, animated progress bar (using TweenService), and loading text. Full screen with a dark background and violet accents. End with return screenGui." },
  { id: "leaderboard", label: "Leaderboard", emoji: "🏆", description: "Top players list", prompt: "Create a leaderboard GUI with a sorted list of top players, their ranks, names, and scores. Use UIListLayout for the list and UICorner for each row. End with return screenGui." },
  { id: "minimap", label: "Minimap", emoji: "🗺️", description: "Corner minimap", prompt: "Create a minimap GUI in the top-right corner with a circular border, player dot, and a semi-transparent background. End with return screenGui." },
];

// ── Mechanic Library templates ──────────────────────────────────────────────

export interface MechanicTemplate {
  id: string;
  label: string;
  emoji: string;
  description: string;
  prompt: string;
}

export const MECHANIC_LIBRARY: MechanicTemplate[] = [
  { id: "cooldown", label: "Cooldown System", emoji: "⏱️", description: "Reusable cooldown with promises", prompt: "Create a cooldown system ModuleScript with :Start(duration), :Reset(), :IsOnCooldown(), and a promise-like :Then() callback. Use os.clock() for timing. End with return Cooldown." },
  { id: "inventory", label: "Inventory System", emoji: "🎒", description: "Add/remove/stack items", prompt: "Create an inventory system ModuleScript with :AddItem(id, amount), :RemoveItem(id, amount), :GetItem(id), :GetAll(). Use a dictionary for storage. Include type annotations. End with return Inventory." },
  { id: "combat", label: "Combat System", emoji: "⚔️", description: "Damage, health, death signals", prompt: "Create a combat system ModuleScript with :TakeDamage(amount), :Heal(amount), :SetHealth(value), :GetHealth(), :IsDead(), and HealthChanged/Died BindableEvents. End with return CombatSystem." },
  { id: "datastore", label: "DataStore Save", emoji: "💾", description: "Save/load player data", prompt: "Create a DataStore ModuleScript that saves and loads player data. Include :Save(player, data), :Load(player), retry logic, session locking, and auto-save on PlayerRemoving. End with return DataStoreManager." },
  { id: "remote", label: "Remote Event System", emoji: "📡", description: "Type-safe remote events", prompt: "Create a type-safe RemoteEvent system ModuleScript that creates and manages RemoteEvents in ReplicatedStorage. Include :FireClient(player, ...), :FireAllClients(...), :OnClientEvent(callback), :OnServerEvent(callback). End with return RemoteManager." },
  { id: "pathfinding", label: "Pathfinding", emoji: "🤖", description: "NPC navigation system", prompt: "Create an NPC pathfinding ModuleScript using PathfindingService. Include :MoveTo(targetPosition), :Stop(), :OnReached(callback), with obstacle avoidance. End with return Pathfinder." },
  { id: "daynight", label: "Day/Night Cycle", emoji: "🌅", description: "Smooth lighting cycle", prompt: "Create a day/night cycle Script that smoothly transitions Lighting.ClockTime using TweenService. Include configurable speed, sunrise/sunset colors, and FogEnd changes. " },
  { id: "economy", label: "Economy System", emoji: "💰", description: "Currency + transactions", prompt: "Create an economy system ModuleScript with :AddCash(player, amount), :RemoveCash(player, amount), :GetCash(player), :Transfer(fromPlayer, toPlayer, amount), and transaction logging. End with return Economy." },
  { id: "round", label: "Round System", emoji: "🔄", description: "Game round timer + states", prompt: "Create a round system ModuleScript with :StartRound(duration), :EndRound(), :GetTimeRemaining(), :GetCurrentState() (Waiting/Playing/Ended), and RoundStarted/RoundEnded BindableEvents. End with return RoundSystem." },
  { id: "leaderboard-sys", label: "Leaderboard System", emoji: "📊", description: "Sorted player rankings", prompt: "Create a leaderboard system ModuleScript that tracks player scores, sorts them, and provides :UpdateScore(player, score), :GetTopPlayers(count), :GetRank(player). End with return LeaderboardSystem." },
  { id: "dialogue", label: "Dialogue System", emoji: "💬", description: "NPC dialogue tree", prompt: "Create a dialogue system ModuleScript with :StartDialogue(npcId), :NextLine(), :ChooseOption(optionId), :EndDialogue(), and a dialogue tree data structure. End with return DialogueSystem." },
  { id: "quest", label: "Quest System", emoji: "📜", description: "Track + complete quests", prompt: "Create a quest system ModuleScript with :StartQuest(questId), :UpdateObjective(questId, objectiveId, progress), :CompleteQuest(questId), :GetActiveQuests(), and quest reward distribution. End with return QuestSystem." },
];

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
