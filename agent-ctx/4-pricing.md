# Task 4 — Pricing Page Component (Agent: BloxForge Pricing)

## Summary
Created `/home/z/my-project/src/components/bloxforge/pricing.tsx` — a full pricing view matching the landing.tsx design language (dark slate + emerald accents, Bricolage Grotesque `font-display`, framer-motion entrance animations, SectionHeading helper, `bg-radial-brand` + `bg-grid` background decoration).

## What was built
- **PricingHero**: hero header with eyebrow badge, gradient headline "Pick your forge", and a segmented-control billing toggle (Monthly / Annual) with a "Save 25%" badge. Trust line below: "No credit card required for Free · Cancel anytime · Not affiliated with Roblox Corporation".
- **PricingTiers**: 3 cards (Free $0, Pro $12/$9, Studio $39/$31). Pro is highlighted with `lg:scale-105`, emerald border (`border-emerald-500/40`), and `glow-brand`. Each card: icon, badge, price (updates from toggle), CTA button (all call `onLaunch`), and feature checklist with emerald check icons.
- **FAQ**: shadcn `Accordion` (single/collapsible) with the 5 specified Q&As, wrapped in a Card, plus a "Still have questions? Talk to us" footer.
- **PricingCTA**: emerald-gradient band with "Ready to forge?" heading, primary `Launch BloxForge AI` (onLaunch) + outline `Get the plugin` (onGetPlugin) buttons — mirrors landing.tsx CTA styling.

## Props
```tsx
onLaunch: () => void;       // navigate to #app
onGetPlugin: () => void;    // navigate to #plugin
```

## Technical notes
- `"use client"` (uses `useState` for billing toggle).
- No new routes/pages; only this file.
- Uses shadcn `Button`, `Card`, `Badge`, `Accordion` from `src/components/ui/`.
- Imports `motion` from `framer-motion`, `cn` from `@/lib/utils`, Lucide icons.
- Responsive: single-column on mobile, 3-column grid on `lg`.
- Lint clean (`bun run lint` passes).
