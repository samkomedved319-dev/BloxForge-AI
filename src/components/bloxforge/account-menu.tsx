"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  User as UserIcon,
  Zap,
  Crown,
  ChevronDown,
  Sparkles,
  Settings,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export function AccountMenu({
  onOpenAuth,
  onNavigatePricing,
}: {
  onOpenAuth: () => void;
  onNavigatePricing: () => void;
}) {
  const { isAuthenticated, user, usage, plan, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={onOpenAuth}
        className="gap-2 border-border bg-card/50 hover:bg-accent"
      >
        <UserIcon className="size-4" />
        <span className="hidden sm:inline">Sign in</span>
      </Button>
    );
  }

  const planLabel = plan?.label || "Free";
  const isFree = (user?.plan || "free") === "free";
  const used = usage?.used ?? 0;
  const limit = usage?.limit ?? 50;
  const pct = limit === -1 ? 0 : Math.min(100, (used / limit) * 100);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-2.5 py-1.5 text-sm transition hover:bg-accent"
      >
        <div className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-teal-600 text-xs font-bold text-slate-950">
          {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
        </div>
        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground transition",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            >
              {/* Header */}
              <div className="border-b border-border p-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-sm font-bold text-slate-950">
                    {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {user?.name || user?.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1",
                      isFree
                        ? "border-muted-foreground/30 text-muted-foreground"
                        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
                    )}
                  >
                    {isFree ? <Zap className="size-3" /> : <Crown className="size-3" />}
                    {planLabel} plan
                  </Badge>
                </div>
              </div>

              {/* Usage */}
              {isFree && limit !== -1 && (
                <div className="border-b border-border p-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Daily usage</span>
                    <span className="font-medium">
                      {used} / {limit}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Resets daily · {limit - used} left today
                  </p>
                </div>
              )}

              {!isFree && (
                <div className="border-b border-border p-4">
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <Sparkles className="size-3.5" />
                    Unlimited messages
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-2">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      window.location.hash = "admin";
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-emerald-400 transition hover:bg-emerald-500/10"
                  >
                    <Shield className="size-4" />
                    <span className="flex-1 font-medium">Admin Dashboard</span>
                    <span className="text-xs">→</span>
                  </button>
                )}
                {isFree && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      onNavigatePricing();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-accent"
                  >
                    <Crown className="size-4 text-emerald-400" />
                    <span className="flex-1">Upgrade plan</span>
                    <span className="text-xs text-muted-foreground">→</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setOpen(false);
                    toast.info("Settings coming soon");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  <Settings className="size-4" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                    toast.success("Signed out");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
