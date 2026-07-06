# Task ID: 4-beta — Beta Approval UI (Admin Dashboard Users tab)

**Agent:** Beta Approval UI
**File touched:** `src/components/bloxforge/admin-dashboard.tsx` (only)
**No API routes or pages modified.**

## Context
App is now in beta mode. Users have an `approved` boolean. New Roblox-auth users
start `approved: false`. Admins must approve them before they can use BloxForge AI.

API changes consumed:
- `GET /api/admin/users` now returns each user with `approved: boolean` and
  `robloxUsername: string | null`.
- `PATCH /api/admin/users/[id]/approve` body `{ approved: boolean }`.

## What was added to the Users tab

### 1. Type update
`AdminUser` extended with:
- `approved: boolean`
- `robloxUsername: string | null`

### 2. New imports (lucide-react)
`Check`, `Clock`, `X`, `Gamepad2`.

### 3. Beta approval summary banner (top of Users tab)
Amber-tinted card with a `Clock` icon tile, headline
`"{pendingCount} pending approval"`, contextual sub-message, and a toggle
button: "Show only pending" <-> "Show all users". Button is disabled when there
are zero pending users AND the filter is off. Uses `cn()` for conditional
amber styling (solid when active, outline/amber-tinted when inactive).

### 4. Status column (replaces the old Role column)
Per-row badge:
- admin -> emerald "Admin" + Crown
- non-admin approved -> emerald "Approved" + Check
- non-admin pending -> amber "Pending" + Clock

### 5. Roblox username in the User cell
When `robloxUsername` is present, a third line renders below name/email:
emoji-style "RobloxUser123" -- `Gamepad2` icon (emerald) + username.

### 6. Approve / Revoke buttons (Actions cell, non-admins only)
- Pending users -> solid emerald "Approve" button with Check icon ->
  `PATCH /api/admin/users/[id]/approve` `{ approved: true }`.
- Approved users -> ghost "Revoke" button with X icon ->
  `PATCH /api/admin/users/[id]/approve` `{ approved: false }`.
- Admins: button omitted entirely (they're always approved).
- Buttons placed as the FIRST action (before the plan Select) so the primary
  beta action is most prominent.
- Row-locked via existing `busyId` pattern during the request.

### 7. Supporting changes
- `pendingCount` memo counts non-admin users with `approved === false`.
- `filtered` memo now: (a) optionally restricts to pending when
  `showPendingOnly`, (b) includes `robloxUsername` in the search match.
- `approveUser(id, approved)` helper -- PATCHes the approve endpoint, toasts
  success ("User approved -- beta access granted" / "Beta access revoked"),
  refetches the list.
- Empty-state message differentiates "No pending users -- all caught up!" when
  in pending-only mode.
- Footer count appends "(pending only)" when filter is active.

## Design conformance
- Matches existing emerald-on-dark-slate theme (emerald for approved/admin,
  amber for pending to match the existing "studio plan" amber accent).
- shadcn `Button` + `Badge` only -- no custom primitives.
- `toast` from `sonner`; `cn()` from `@/lib/utils`.
- `framer-motion` entrance animation on the parent `motion.div` preserved.
- Responsive: summary banner wraps on mobile (`flex-wrap`), table scrolls
  horizontally on small screens (existing behavior).

## Lint
`bun run lint` -- clean, no errors.
