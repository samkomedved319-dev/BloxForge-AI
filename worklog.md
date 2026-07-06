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
