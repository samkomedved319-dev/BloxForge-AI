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
