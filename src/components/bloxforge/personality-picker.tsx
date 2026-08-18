"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Sparkles, Gauge, Zap, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PERSONALITIES,
  MODES,
  type Personality,
  type Mode,
} from "@/lib/models";

function speedDots(speed: 1 | 2 | 3) {
  return (
    <span className="flex items-center gap-0.5" title={`Speed ${speed}/3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "size-1 rounded-full",
            i <= speed ? "bg-violet-400" : "bg-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
}

export function PersonalityPicker({
  personalityId,
  modeId,
  onPersonalityChange,
  onModeChange,
  allowedPersonalities,
  isAdmin,
  activeModelLabel,
}: {
  personalityId: string;
  modeId: string;
  onPersonalityChange: (id: string) => void;
  onModeChange: (id: string) => void;
  allowedPersonalities?: string[];
  isAdmin?: boolean;
  activeModelLabel?: string;
}) {
  const allowed = allowedPersonalities || PERSONALITIES.map((p) => p.id);
  const currentPersonality =
    PERSONALITIES.find((p) => p.id === personalityId) ?? PERSONALITIES[1];
  const currentMode = MODES.find((m) => m.id === modeId) ?? MODES[0];

  // Short model name for display (e.g. "nemotron-3-nano-omni" from full ID)
  const shortModelName = (model: string) => {
    const parts = model.split("/");
    const last = parts[parts.length - 1] || model;
    return last.replace(":free", "").replace(/-/g, " ");
  };

  return (
    <div className="flex items-center gap-2">
      <Dropdown
        label="MODEL"
        value={shortModelName(currentPersonality.model)}
        icon={<Sparkles className="size-3.5 text-violet-400" />}
      >
        {(close) => (
          <div className="min-w-[300px] p-1.5">
            <p className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              AI Models
            </p>
            {PERSONALITIES.map((p) => {
              const isAllowed = allowed.includes(p.id);
              return (
                <button
                  key={p.id}
                  disabled={!isAllowed}
                  onClick={() => {
                    onPersonalityChange(p.id);
                    close();
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition",
                    isAllowed
                      ? "hover:bg-accent"
                      : "cursor-not-allowed opacity-50",
                    p.id === personalityId && "bg-accent/60",
                  )}
                >
                  <div className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                    p.beta
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-violet-500/10 text-violet-400",
                  )}>
                    {p.beta ? (
                      <Sparkles className="size-3.5" />
                    ) : p.tier === "reasoning" ? (
                      <Brain className="size-3.5" />
                    ) : p.speed === 3 ? (
                      <Zap className="size-3.5" />
                    ) : (
                      <Gauge className="size-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{shortModelName(p.model)}</span>
                      {p.badge && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "h-4 px-1.5 text-[10px]",
                            p.beta ? "text-amber-400" : "text-violet-400",
                          )}
                        >
                          {p.badge}
                        </Badge>
                      )}
                      {!isAllowed && (
                        <Badge
                          variant="outline"
                          className="h-4 px-1.5 text-[10px] text-amber-400"
                        >
                          {p.studioOnly ? "Studio" : "Pro"}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                      {p.tagline}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {speedDots(p.speed)}
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {p.vendor.split(" / ")[0]}
                      </span>
                      {isAdmin && (
                        <span className="font-mono text-[9px] text-violet-400/60">
                          {p.model}
                        </span>
                      )}
                    </div>
                  </div>
                  {p.id === personalityId && (
                    <Check className="mt-1 size-4 shrink-0 text-violet-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </Dropdown>

      <Dropdown
        label="MODE"
        value={currentMode.label}
        icon={<Gauge className="size-3.5 text-violet-400" />}
      >
        {(close) => (
          <div className="min-w-[240px] p-1.5">
            <p className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Response style
            </p>
            {MODES.map((m) => {
              // BloxForge-only modes are only shown when BloxForge Luau is
              // selected (or always shown but greyed out if not selected)
              const isBloxforgeMode = m.bloxforgeOnly;
              const isBloxforgePersonality = personalityId === "bloxforge-luau";
              const isLocked = isBloxforgeMode && !isBloxforgePersonality;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onModeChange(m.id);
                    close();
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition",
                    isLocked
                      ? "cursor-not-allowed opacity-40"
                      : "hover:bg-accent",
                    m.id === modeId && "bg-accent/60",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{m.label}</span>
                      {isBloxforgeMode && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "h-4 px-1.5 text-[10px]",
                            isLocked
                              ? "text-muted-foreground"
                              : "text-amber-400",
                          )}
                        >
                          {isLocked ? "BloxForge only" : "BloxForge"}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {m.description}
                    </p>
                  </div>
                  {m.id === modeId && (
                    <Check className="mt-0.5 size-4 shrink-0 text-violet-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </Dropdown>
    </div>
  );
}

function Dropdown({
  label,
  value,
  icon,
  children,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 transition hover:border-violet-500/30 hover:bg-accent/40"
      >
        <span className="hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
          {label}
        </span>
        {icon}
        <span className="text-sm font-medium">{value}</span>
        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground transition",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
