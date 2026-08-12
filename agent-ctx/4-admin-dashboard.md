# Task 4 — Admin Dashboard Component (Agent: BloxForge Admin)

## Summary
Created `/home/z/my-project/src/components/bloxforge/admin-dashboard.tsx` — a `"use client"` admin dashboard that renders at `#admin`. It matches the existing emerald-on-dark-slate design language from `landing.tsx` / `pricing.tsx` (Bricolage Grotesque `font-display`, framer-motion entrance animations, `bg-radial-brand` background, `glow-brand`/emerald accents, shadcn/ui).

## What was built

### Auth guard
- On mount, fetches `GET /api/usage` and checks `isAdmin`.
- Three states: `loading` (centered `Loader2` spinner + "Checking admin access…"), `denied` (centered "Access denied" card with rose icon + "Back to home" button calling `window.location.hash = ""`), `ok` (renders the dashboard).

### Header
- Eyebrow `BloxForge AI · Internal` (emerald mono caps), gradient headline "Admin Dashboard", subtitle, and an outline "Back to home" button (`window.location.hash = ""`).
- Entrance: `motion.div` fade+rise.

### Tabs (shadcn `Tabs`)
3 triggers each with a Lucide icon: Overview / Users / API Keys.

### Tab 1 — Overview
- Fetches `GET /api/admin/stats` on mount.
- 4 stat cards (Total users, Messages today, Conversations, Active API keys) in a `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. Each: emerald-tinted icon tile, big `font-display text-3xl font-bold text-emerald-400` number, label, hint line, soft emerald corner glow, staggered motion entrance.
- "Plan breakdown" card with Free/Pro/Studio rows — each row has label, `count · pct` mono readout, and a `motion.div`-animated bar whose width is proportional to the plan's share (emerald gradient for Free/Pro, amber gradient for Studio to match the badge color system).
- Refresh button + error empty-state.

### Tab 2 — Users
- Fetches `GET /api/admin/users` on mount.
- Search `Input` (with `Search` icon) filters client-side by email/name.
- shadcn `Table` with columns: User (email + name), Plan (badge: Free=gray, Pro=emerald, Studio=amber), Role (admin=emerald+Crown, user=gray), Credits (`+N bonus` emerald + `N used today` muted), Conversations count, Actions.
- Actions per row:
  - `Select` (Free/Pro/Studio) → `PATCH /api/admin/users/[id]` with `{ plan }`.
  - "Grant credits" `Popover` (emerald `Gift` icon) with number `Input` + Grant button → `PATCH` with `{ extraCredits }`. Helper text clarifies it sets the total. Pre-fills with current value.
  - "Reset usage" ghost button (`RotateCcw`) → `PATCH` with `{ resetUsage: true }`.
  - "Delete" (`Trash2`) in an `AlertDialog` confirm → `DELETE /api/admin/users/[id]`. Disabled when `role === "admin"` (prevents admin deletion).
- After every mutation: refetch users list + `toast.success`/`toast.error`. A `busyId` state disables the row's controls during the request and the Select auto-reverts to the server value on failure (because we refetch).
- Footer: "Showing X of Y users."

### Tab 3 — API Keys
- Fetches `GET /api/admin/api-keys` on mount.
- "Add API key" form `Card` (emerald border) at top with a 3-column grid: Label, Provider (`Select`: nvidia / custom / openai / openrouter / groq / together), Base URL (default `https://integrate.api.nvidia.com/v1`, mono), API Key (password), Model override (optional, mono), Priority (number, default 0). Submit → `POST /api/admin/api-keys`. On success: reset form, refetch, toast.
- Existing keys `Table`: label (+ created date), provider badge (color-coded per provider), baseUrl (mono, truncated, `title` tooltip), masked key (emerald mono), model (mono truncated or `—`), priority (centered mono), active `Switch` → `PATCH /api/admin/api-keys/[id]` with `{ active }` (optimistic update + revert on error), delete button in `AlertDialog` confirm → `DELETE`.
- Note `Card` at the bottom with an `Info` icon explaining: keys are used in priority order (highest first), any OpenAI-compatible endpoint works, the highest-priority active key overrides `NVIDIA_API_KEY`.

## Props
None — `export function AdminDashboard()`. It fetches everything itself.

## Technical notes
- `"use client"` component. No new API routes or pages; only this file created.
- All fetches use `cache: "no-store"` and go through a `jsonOrThrow` helper that surfaces server error messages.
- Errors handled gracefully with `toast.error`.
- Fully responsive: single-column on mobile, multi-column grids at `sm`/`lg`; `Table` is wrapped in the default `overflow-x-auto` container so it scrolls horizontally on narrow screens.
- Uses `font-display`, `bg-radial-brand`, emerald gradient text, and the same `motion` entrance pattern (`opacity 0→1, y 16→0`) as `landing.tsx` / `pricing.tsx`.
- Lint clean (`bun run lint` passes with no errors).

## Files touched
- Created: `/home/z/my-project/src/components/bloxforge/admin-dashboard.tsx`
- Appended: Task ID 4 section to `/home/z/my-project/worklog.md`
