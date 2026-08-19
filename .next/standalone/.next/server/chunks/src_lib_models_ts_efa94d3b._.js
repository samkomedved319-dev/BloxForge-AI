module.exports=[93520,e=>{"use strict";let t=[{id:"swift",label:"BloxForge AI",model:"nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",vendor:"NVIDIA Nemotron",tier:"code",tagline:"Best for scripts, GUI, 3D models & animations.",badge:"Recommended",speed:3,strength:"Everything — scripts, GUI, 3D, animations"},{id:"thoughtful",label:"Reasoning",model:"nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",vendor:"NVIDIA Nemotron",tier:"reasoning",tagline:"Deep thinking for complex game architecture.",badge:"Deep",speed:1,strength:"Architecture, systems design, debugging"},{id:"bloxforge-luau",label:"BloxForge Pro",model:"nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",vendor:"NVIDIA Nemotron",tier:"code",tagline:"Advanced mode with web search & deep thinking.",badge:"Pro",speed:2,strength:"Web search, deep thinking, Dev mode",beta:!0,studioOnly:!0}],a=[{id:"low",label:"Low",description:"Fast & minimal. Quick answers, minimal code.",promptModifier:"Be fast and minimal. Give short answers with just the essential code. No explanations unless asked."},{id:"default",label:"Default",description:"Balanced code + explanation. Good for everyday tasks.",promptModifier:""},{id:"medium",label:"Medium",description:"More detailed code with comments and types.",promptModifier:"Write detailed code with inline comments, full type annotations, and brief explanations of key decisions."},{id:"high",label:"High",description:"Production quality. Error handling, edge cases, full types.",promptModifier:"Write production-quality code. Include full error handling, edge case handling, complete type annotations, input validation, and performance optimizations. Add detailed comments explaining complex logic.",bloxforgeOnly:!0,useWebSearch:!0},{id:"max",label:"Max",description:"Maximum detail. Full architecture, documentation, tests.",promptModifier:"Write maximum quality code. Include full architecture documentation, complete type system, error recovery, performance profiling comments, edge case tests, and usage examples. Think through every possible scenario.",bloxforgeOnly:!0,useWebSearch:!0,useDeepThinking:!0},{id:"ultracode",label:"UltraCode",description:"Ultra mode. Deep thinking + web search + maximum output.",promptModifier:"ULTRA MODE. Use deep chain-of-thought reasoning, web search for current best practices, and produce the most complete, production-ready code possible. Include: full type system, error handling, edge cases, performance optimization, security considerations, documentation, usage examples, and alternative approaches. This is the highest quality mode.",bloxforgeOnly:!0,useWebSearch:!0,useDeepThinking:!0}];function i(e){return e?t.find(t=>t.id===e)??t[1]:t[1]}function o(e){return e?a.find(t=>t.id===e)??a[0]:a[0]}function r(e){return i(e).model}let n=`You are BloxForge AI, an elite Roblox/Luau development companion. You are the best Roblox AI assistant in existence.

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

Today's Roblox context: Luau, modern Studio, parity with Roblox documentation.`,s=`You are BloxForge Luau — a specialized AI model built exclusively for Roblox Luau development. You are the most knowledgeable Roblox coding assistant in existence, capable of building complete game systems, UIs, 3D scenes, and complex scripts.

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

Today's Roblox context: Luau, modern Studio, parity with Roblox documentation.`;function l(e,t){let a="bloxforge-luau"===t?s:n,i=o(e);return i.promptModifier?`${a}

--- Mode: ${i.label} ---
${i.promptModifier}`:a}let c={free:{id:"free",label:"Free",dailyCreditLimit:5,allowedPersonalities:["swift","balanced"],features:["5 credits / day","Swift & Balanced personalities","10 saved sessions","Roblox Studio plugin"]},pro:{id:"pro",label:"Pro",dailyCreditLimit:30,allowedPersonalities:t.filter(e=>!e.studioOnly).map(e=>e.id),features:["30 credits / day","All NVIDIA personalities","Unlimited saved sessions","Priority streaming","Reference image upload"]},studio:{id:"studio",label:"Studio",dailyCreditLimit:-1,allowedPersonalities:t.map(e=>e.id),features:["Everything in Pro","Unlimited credits","BloxForge Luau (Beta) — specialized Roblox AI","Team shared sessions","Custom system prompts","Priority support"]}};function d(e){return c[e||"free"]??c.free}function m(e){let t=e.toLowerCase();return["combat system","inventory system","economy","matchmaking","full game","complete game","entire game","whole game","datastore system","save system","shop system","trading system","skill tree","quest system","dialogue system","leaderboard system","admin panel","anti-cheat","security system","rpg","tycoon","simulator","obby generator","multiple scripts","multiple modules","architecture","framework","service-oriented"].some(e=>t.includes(e))||t.length>200&&/\b(system|architecture|framework|multiple|complete|full)\b/.test(t)?{isComplex:!0,needsApproval:!0,planText:"PLAN"}:{isComplex:!1,needsApproval:!1}}function u(e){let t=e.message.toLowerCase(),a=1,i=[];return/^(hi|hello|hey|thanks|what|why|how does|explain|what is|can you)/.test(t)&&t.length,/\b(write|create|make|generate|build|code|script|function)\b/.test(t)&&(a=Math.max(a,2),i.push("code generation")),/\b(module|class|system|service|manager|controller|handler|component)\b/.test(t)&&(a=Math.max(a,3),i.push("module/system")),/\b(ui|gui|interface|button|label|frame|menu|hud|screen|dialog|popup|sidebar)\b/.test(t)&&(a=Math.max(a,3),i.push("UI creation")),/\b(combat|inventory|matchmaking|economy|quest|dialogue|save|datastore|leaderboard|shop|trading|auction|crafting|skill tree|ability)\b/.test(t)&&(a=Math.max(a,4),i.push("complex game system")),/\b(and|with|plus|also|including|multiple|several)\b/.test(t)&&a>=3&&(a=Math.max(a,4),i.push("multiple components")),/\b(full|complete|entire|whole|architecture|framework|all|everything|game|obby|tycoon|simulator|rpg)\b/.test(t)&&(a=Math.max(a,5),i.push("full-scale task")),e.message.length>500&&(a=Math.max(a,Math.min(a+1,5)),i.push("detailed request")),e.hasImage&&(a=Math.max(a,3),i.push("image analysis"),a>=4&&(a=Math.max(a,4))),e.hasContext&&i.push("script context"),("debug"===e.mode||"refactor"===e.mode)&&(a=Math.max(1,a-1),i.push(`${e.mode} mode (lighter)`)),"explain"===e.mode&&a>2&&(a=Math.max(2,a-1)),{cost:a=Math.max(1,Math.min(5,a)),reason:i.length>0?i.join(", "):"simple question"}}e.s(["BLOXFORGE_SYSTEM_PROMPT",0,n,"DEFAULT_MODE_ID",0,"default","DEFAULT_PERSONALITY_ID",0,"swift","MODES",0,a,"PERSONALITIES",0,t,"PROJECT_TYPES",0,[{id:"script",label:"Scripts",icon:"Code2",promptPrefix:"Generate a Roblox Luau script."},{id:"gui",label:"GUI",icon:"Layout",promptPrefix:"Generate a Roblox GUI using Instance.new. Build the full ScreenGui hierarchy with Frames, TextLabels, TextButtons, UICorner, UIStroke, UIGradient. End with return screenGui."},{id:"3d",label:"3D Models",icon:"Box",promptPrefix:"Generate Luau code that creates a 3D model using Instance.new('Part') or Instance.new('Model'). Set Size, Position, Color, Material, Anchored, CanCollide. For Models, create a PrimaryPart and weld children. End with return <variable>."},{id:"animation",label:"Animations",icon:"Play",promptPrefix:"Generate Luau code for a Roblox animation using TweenService:Create or AnimationTrack. Include CFrame interpolation, easing styles (Enum.EasingStyle.Quad, Enum.EasingDirection.Out). Make it smooth and professional."}],"buildSystemPrompt",()=>l,"estimateCredits",()=>u,"getMode",()=>o,"getPersonality",()=>i,"getPlan",()=>d,"resolveModel",()=>r,"shouldShowPlan",()=>m])}];

//# sourceMappingURL=src_lib_models_ts_efa94d3b._.js.map