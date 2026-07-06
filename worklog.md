# BloxForge AI — Build Worklog

Project: BloxForge AI — NVIDIA-powered AI coding companion for Roblox/Luau development.
Inspired by lemonade.gg. Includes a web app + downloadable Roblox Studio plugin.

Tech: Next.js 16 (App Router), TypeScript, Tailwind 4, shadcn/ui, Prisma (SQLite).
AI backend: NVIDIA API (build.nvidia.com, OpenAI-compatible) primary, z-ai-web-dev-sdk fallback so the live demo works without an NVIDIA key.

---
Task ID: 1
Agent: Orchestrator
Task: Explore project, set up Prisma schema & dependencies

Work Log:
- Explored existing Next.js scaffold, confirmed shadcn/ui components, z-ai-web-dev-sdk, react-markdown, react-syntax-highlighter, framer-motion, next-themes all installed.
- Designed product: BloxForge AI. Accent = emerald/lime on dark slate.
- Defined Prisma schema (Conversation, Message, Snippet) below.

---
Task ID: 2-7
Agent: Orchestrator
Task: Build full backend + frontend, plugin, verify end-to-end

Work Log:
- Built NVIDIA NIM streaming engine (src/lib/ai.ts) with z-ai-web-dev-sdk fallback so the live demo works without an NVIDIA key.
- Built API routes: /api/chat (SSE streaming + Prisma persistence), /api/conversations (CRUD), /api/conversations/[id], /api/models, /api/plugin/ask (Roblox HttpService endpoint), /api/plugin/download (serves BloxForgeAI.lua with attachment headers).
- Built Prisma schema (Conversation, Message, Snippet) and pushed to SQLite.
- Built emerald-on-dark-slate theme (globals.css), layout with display font + ThemeProvider (dark default).
- Built landing page (hero with code mock, NVIDIA models grid, features, 3-step how-it-works, plugin section, CTA) + sticky footer.
- Built full chat app: conversation sidebar (create/load/delete), streaming message rendering, model picker, markdown + code-block copy, empty state with example prompts, auto-scroll.
- Built Roblox Studio plugin (public/plugin/BloxForgeAI.lua, ~21KB): dockable widget, chat UI, model picker, settings dialog (API URL + model), HttpService POST to /api/plugin/ask, one-click "Insert as Script".
- Built plugin download page with OS-aware install path toggle (Windows/macOS).
- Fixed getNvidiaKey import bug, fixed lint (useSyncExternalStore for hash routing).
- Daemonized dev server (setsid double-fork) so it survives across shell commands.

Stage Summary:
- Lint clean. Dev server stable on :3000.
- Agent Browser verified: landing renders, app launches, AI streams real Luau (cooldown ModuleScript w/ types+OOP), conversations persist + reload from sidebar, plugin page + download (.lua, 21KB, correct headers), mobile + desktop responsive, zero console errors.
- Product: BloxForge AI — NVIDIA-powered Roblox/Luau coding companion + downloadable Studio plugin.

---
Task ID: 4
Agent: Pricing Page Component
Task: Build the `#pricing` view component (src/components/bloxforge/pricing.tsx)

Work Log:
- Read landing.tsx, logo.tsx, site-footer.tsx, globals.css to match the exact emerald-on-dark-slate design language, SectionHeading pattern, framer-motion entrance animations, and `bg-radial-brand`/`bg-grid`/`glow-brand` utilities.
- Built `Pricing` ("use client") component with `onLaunch` + `onGetPlugin` props, composed of 4 sub-sections:
  - PricingHero: eyebrow badge, gradient headline "Pick your forge", Monthly/Annual segmented toggle with "Save 25%" badge, trust line below.
  - PricingTiers: 3 responsive cards — Free ($0, Hobby), Pro ($12/$9, Most popular — emerald border + glow + lg:scale-105), Studio ($39/$31, Teams). Each card has icon, badge, dynamic price, CTA (all → onLaunch), feature checklist.
  - FAQ: shadcn Accordion (single/collapsible) with the 5 specified Q&As wrapped in a Card.
  - PricingCTA: emerald-gradient band "Ready to forge?" with Launch (onLaunch) + Get plugin (onGetPlugin) buttons — mirrors landing CTA.
- Used framer-motion `initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}}` for all section entrances. Used `cn()` for conditional highlight classes. Lint clean. No new routes/pages/files other than the component.

Stage Summary:
- Pricing view ready to render at `#pricing` via the same hash-routing pattern as landing/plugin.
- Work record saved at /agent-ctx/4-pricing.md.

---
Task ID: 5-8
Agent: Orchestrator
Task: Add authentication, pricing, animations, MODEL/MODE personality dropdowns (from reference image), release-ready polish

Work Log:
- Prisma: added User model (email, passwordHash, plan, daily usage tracking) + userId on Conversation + mode field. Pushed to SQLite.
- Installed bcryptjs for password hashing.
- Built personality/mode system (src/lib/models.ts rewrite): 5 friendly personalities (Thoughtful→DeepSeek R1, Swift→Qwen Coder, Balanced→Llama 3.3, Flagship→Llama 405B, Nemotron) + 5 response modes (Normal, Concise, Explain, Refactor, Debug). Matches the lemonade.gg-style MODEL/MODE dropdowns from the reference image.
- Built NextAuth backend: credentials provider (JWT sessions), /api/auth/[...nextauth], /api/auth/signup, /api/usage (daily limit tracking). Conversations now scoped by user.
- Rewrote /api/chat to use personality+mode, enforce free-tier daily limits (50/day) and model gating (guests limited to Swift+Balanced).
- Updated /api/plugin/ask to accept personality+mode.
- Delegated pricing page to subagent (full Free/Pro/Studio tiers, monthly/annual toggle, FAQ accordion).
- Built auth frontend: SessionProvider (in theme-provider), AuthModal (login/signup with email+GitHub), AccountMenu (avatar dropdown with usage bar + upgrade), useAuth hook.
- Built PersonalityPicker component: two dropdowns (MODEL + MODE) with personality cards (speed dots, vendor, badges, Pro locks) and mode descriptions — exactly the reference image UX.
- Rewrote ChatApp: personality/mode pickers, usage sidebar card, limit banner, animated message bubbles, upgrade prompts.
- Built animation utilities (motion.tsx): Reveal, Stagger, Counter (animated number), FloatingOrbs.
- Added Stats section (animated counters) + PricingTeaser section to landing.
- Updated SiteHeader: Pricing nav, AccountMenu, auth modal trigger.
- Updated page.tsx: 4 views (landing/app/plugin/pricing), auth modal wiring, hash routing.
- Set NEXTAUTH_SECRET in .env.

Stage Summary:
- Lint clean. Dev server stable on :3000.
- Agent Browser verified: landing (with Sign in + Pricing nav), pricing page (3 tiers, annual toggle, FAQ), app with MODEL/MODE dropdowns showing all 5 personalities (Pro models locked for free), auth signup flow (created account, avatar appeared, usage tracking "1/50"), AI streamed complete Luau cooldown ModuleScript as signed-in user, conversation saved to sidebar, account menu with usage bar + upgrade. Zero console errors.
- Release-ready: authentication, pricing, personality/mode system, animations, usage limits, all wired.

---
Task ID: 9-13
Agent: Orchestrator
Task: Convert the Roblox plugin into a pure connector (no chat) — web app stays the AI chat, plugin just syncs Studio context + inserts code

Work Log:
- Built in-memory studio-store (src/lib/studio-store.ts): pairing codes, heartbeat, context, insert queue, ack results, stale-session cleanup. Singleton via globalThis.
- Built 6 API routes: /api/studio/pair, /heartbeat, /state, /insert, /ack, /disconnect.
- Updated /api/chat to accept optional `context` (Studio script source) appended to the user message.
- Rewrote public/plugin/BloxForgeAI.lua as a pure connector (~19KB): minimal dockable UI (server URL + pairing code inputs → connect/disconnect), heartbeat loop every 3s reporting selected script, Selection.SelectionChanged → immediate context POST, drains insert commands → creates Script in ServerScriptService + acks. NO chat UI.
- Built studio-connector.tsx: useStudioConnection hook (pair/poll/insert/disconnect), StudioConnectDialog (pairing code display + 3-step instructions + connected state with script info), StudioBadge (header green pulse), ConnectStudioButton.
- Updated markdown.tsx: code blocks now show "Insert in Studio" button (emerald) alongside Copy when studioConnected + language is luau/lua. Optimistic "Sending…→Sent" states.
- Updated chat-app.tsx: integrated useStudioConnection, added Connect Studio button/badge to header, context chip near composer (toggleable include), wired handleInsertCode → studio.insertCode, passed studioConnected + onInsertCode to MessageBubble → Markdown.
- Updated plugin-page.tsx: renamed to "BloxForge Connector", new features (Pure connector, Live script sync, One-click insert, Pair in seconds), updated code preview + install steps, fixed Sync→RefreshCw icon.
- Fixed insert route field-name collision (pairing code vs Luau code both named `code` → renamed to pairingCode).

Stage Summary:
- Lint clean. Dev server stable.
- Agent Browser verified end-to-end: web app generates pairing code → simulated plugin heartbeats with that code → web app detects "Studio connected" + shows script name → dialog closes → header shows green Studio badge → context chip appears near composer → AI generates Luau code block → "Insert in Studio" button appears on code block (alongside Copy) → clicking it sends insert command through the API pipeline.
- curl verified the full connector API flow: pair → heartbeat(context) → state(connected+script) → insert(commandId) → heartbeat(drains command with correct title/language/code) → ack.
- Plugin download serves the new 19KB connector file. 77 connector refs, ~0 chat refs in the plugin code.

---
Task ID: 14-18
Agent: Orchestrator
Task: Fix "plugin won't connect to Studio" — diagnose and fix connection issues

Work Log:
- Root cause: the connect dialog didn't show the server URL (user didn't know what to paste into the plugin), and the plugin's URL parsing was fragile (trailing slashes, /api/studio suffix, etc. broke it).
- Fixed studio-connector.tsx: dialog now auto-detects window.location.origin and displays it as "② BloxForge server URL (paste in plugin)" with a copy button. Added "Simulate connection" button (sends heartbeats with a fake DemoScript.lua context so the full flow including code insertion works without the real plugin). Added "Not connecting?" troubleshooting panel with 4 key tips (URL match, HTTPS requirement, Output window, code expiry).
- Added simulate()/stopSimulate() to useStudioConnection hook with a background heartbeat interval (simRef).
- Rewrote plugin doConnect() with robust normalizeApiUrl(): trims whitespace, strips fragments, trailing slashes, pre-existing /api/studio and /api suffixes. Logs the exact URL used + a 4-point checklist on failure.
- Added a visible errorLabel in the plugin UI (red text) so users see connection errors without opening the Output window.
- Changed plugin DEFAULT_API_URL to empty (forces the user to enter the real URL instead of leaving the placeholder).
- Updated plugin-page.tsx install steps + added an amber "⚠ server URL must be HTTPS" warning box explaining Roblox HttpService blocks plain HTTP.

Stage Summary:
- Lint clean. Server stable.
- Agent Browser verified: dialog shows server URL + copy, Simulate button instantly connects (shows "Studio connected" + DemoScript.lua), full flow works (badge → context chip → AI response → "Insert in Studio" button → click → "Sent" + toast "Sent to Roblox Studio").
- The user can now: (1) see the exact server URL to paste, (2) test without the real plugin via Simulate, (3) read clear error messages in both the plugin UI and the dialog's troubleshooting panel.
