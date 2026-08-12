"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Lock,
  Clock,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GateData {
  authenticated: boolean;
  isAdmin?: boolean;
  isApproved?: boolean;
}

type GateState = "loading" | "guest" | "pending" | "approved";

export function AppGate({
  onOpenAuth,
  onNavigatePricing,
  onApproved,
}: {
  onOpenAuth: () => void;
  onNavigatePricing: () => void;
  onApproved: () => void;
}) {
  const [state, setState] = useState<GateState>("loading");

  useEffect(() => {
    fetch("/api/usage", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.authenticated) {
          setState("guest");
        } else if (d.isAdmin || d.isApproved) {
          setState("approved");
        } else {
          setState("pending");
        }
      })
      .catch(() => setState("guest"));
  }, []);

  // When approved, call onApproved to mount the ChatApp
  useEffect(() => {
    if (state === "approved") {
      onApproved();
    }
  }, [state, onApproved]);

  if (state === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (state === "approved") {
    // The parent will render ChatApp via onApproved callback
    return null;
  }

  if (state === "guest") {
    return <BetaAccessScreen onOpenAuth={onOpenAuth} />;
  }

  return <PendingScreen onNavigatePricing={onNavigatePricing} />;
}

function BetaAccessScreen({ onOpenAuth }: { onOpenAuth: () => void }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden border-border/60 bg-card p-8 text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl shadow-amber-500/30">
            <Lock className="size-8 text-slate-950" />
          </div>

          <Badge
            variant="outline"
            className="mb-3 gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-300"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />
            Closed Beta
          </Badge>

          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            BloxForge AI is in beta
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Access is currently limited to approved beta users and admins.
            Sign in with your Roblox account to request access.
          </p>

          <div className="mt-6 space-y-3 text-left">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-sm font-bold text-violet-400">
                1
              </div>
              <div>
                <p className="text-sm font-medium">Sign in with Roblox</p>
                <p className="text-xs text-muted-foreground">
                  Verify your identity through Roblox's secure OAuth
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-sm font-bold text-violet-400">
                2
              </div>
              <div>
                <p className="text-sm font-medium">Wait for approval</p>
                <p className="text-xs text-muted-foreground">
                  An admin reviews and approves your account
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-sm font-bold text-violet-400">
                3
              </div>
              <div>
                <p className="text-sm font-medium">Start forging</p>
                <p className="text-xs text-muted-foreground">
                  Full access to AI, all personalities, and the Studio plugin
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={onOpenAuth}
            className="mt-6 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="size-4" />
            Sign in with Roblox
            <ArrowRight className="size-4" />
          </Button>

          <p className="mt-4 text-[11px] text-muted-foreground">
            Free during beta · No credit card · Roblox account required
          </p>
        </Card>
      </motion.div>
    </main>
  );
}

function PendingScreen({
  onNavigatePricing,
}: {
  onNavigatePricing: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden border-amber-500/30 bg-card p-8 text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-amber-500/15">
            <Clock className="size-8 text-amber-400" />
          </div>

          <Badge
            variant="outline"
            className="mb-3 gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-300"
          >
            <Shield className="size-3" />
            Pending Approval
          </Badge>

          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            Your account is pending
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You're signed in, but an admin needs to approve your account before
            you can use BloxForge AI. This usually happens within a few hours.
          </p>

          <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-left">
            <p className="text-sm font-medium text-amber-300">
              What happens next?
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-amber-200/80">
              <li>• An admin sees your pending request in the admin dashboard</li>
              <li>• Once approved, you get instant access — no re-login needed</li>
              <li>• You'll be able to chat with the AI and use the Studio plugin</li>
            </ul>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={onNavigatePricing}
              className="w-full gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              Upgrade for instant access
              <ArrowRight className="size-4" />
            </Button>
            <a
              href="https://discord.gg/jrerzH5Bm"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" />
              </svg>
              Ask in Discord for faster approval
            </a>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}
