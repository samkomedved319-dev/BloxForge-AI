"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Trash2,
  Loader2,
  Check,
  Save,
  AlertTriangle,
  Shield,
  RefreshCw,
  Sun,
  Moon,
  Crown,
  LogOut,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export function Settings({ onBack }: { onBack: () => void }) {
  const { user, plan, isAdmin, refreshUsage } = useAuth();
  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [defaultPersonality, setDefaultPersonality] = useState("swift");
  const [defaultMode, setDefaultMode] = useState("normal");

  // Load saved preferences from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = localStorage.getItem("bloxforge:defaultPersonality");
    const m = localStorage.getItem("bloxforge:defaultMode");
    if (p) setDefaultPersonality(p);
    if (m) setDefaultMode(m);
  }, []);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const saveProfile = useCallback(async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Profile saved");
        refreshUsage();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSavingProfile(false);
    }
  }, [name, refreshUsage]);

  const resetSessions = useCallback(async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/account/reset-sessions", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        toast.success(`Deleted ${data.deleted} conversation${data.deleted === 1 ? "" : "s"}`);
      } else {
        toast.error("Failed to reset sessions");
      }
    } catch {
      toast.error("Failed to reset sessions");
    } finally {
      setResetting(false);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "x-confirm": "DELETE-MY-ACCOUNT" },
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Account deleted");
        signOut({ callbackUrl: "/" });
      } else {
        toast.error(data.error || "Failed to delete account");
      }
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  }, []);

  const savePrefs = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("bloxforge:defaultPersonality", defaultPersonality);
    localStorage.setItem("bloxforge:defaultMode", defaultMode);
    toast.success("Preferences saved");
  }, [defaultPersonality, defaultMode]);

  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <Card className="max-w-md p-8 text-center">
          <Shield className="mx-auto mb-3 size-10 text-muted-foreground" />
          <h2 className="font-display text-xl font-bold">Sign in required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage your settings.
          </p>
          <Button onClick={onBack} className="mt-4 gap-2">
            <ArrowLeft className="size-4" /> Back to home
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="bg-radial-brand pointer-events-none absolute inset-x-0 top-0 h-64 opacity-40" />
      <div className="relative mx-auto max-w-3xl px-4 py-10">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, preferences, and account.
        </p>

        <div className="mt-8 space-y-4">
          {/* Profile */}
          <Section icon={UserIcon} title="Profile" desc="Your display name and account info.">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">
                  Display name
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="flex-1 text-sm">{user.email}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {plan?.label || "Free"}
                  </Badge>
                  {isAdmin && (
                    <Badge className="gap-1 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20">
                      <Shield className="size-3" /> Admin
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Email cannot be changed. Contact support to transfer accounts.
                </p>
              </div>
              <Button
                onClick={saveProfile}
                disabled={savingProfile}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {savingProfile ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save profile
              </Button>
            </div>
          </Section>

          {/* Preferences */}
          <Section
            icon={Crown}
            title="Default preferences"
            desc="Set your preferred AI personality and response mode. Used when you start a new session."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Default personality</Label>
                  <select
                    value={defaultPersonality}
                    onChange={(e) => setDefaultPersonality(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="swift">Swift (Qwen Coder)</option>
                    <option value="thoughtful">Thoughtful (DeepSeek R1)</option>
                    <option value="balanced">Balanced (Llama 3.3)</option>
                    <option value="flagship">Flagship (Llama 405B)</option>
                    <option value="nemotron">Nemotron (NVIDIA)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Default mode</Label>
                  <select
                    value={defaultMode}
                    onChange={(e) => setDefaultMode(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="normal">Normal</option>
                    <option value="concise">Concise</option>
                    <option value="explain">Explain</option>
                    <option value="refactor">Refactor</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>
              </div>
              <Button
                onClick={savePrefs}
                variant="outline"
                className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                <Check className="size-4" /> Save preferences
              </Button>
            </div>
          </Section>

          {/* Plan */}
          <Section icon={Crown} title="Plan & billing" desc="Your current subscription, credits, and billing.">
            <BillingSection plan={plan} isAdmin={isAdmin} />
          </Section>

          {/* Danger zone */}
          <Section
            icon={AlertTriangle}
            title="Danger zone"
            desc="Irreversible actions. Proceed with caution."
            danger
          >
            <div className="space-y-3">
              <div className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Reset all sessions</p>
                  <p className="text-xs text-muted-foreground">
                    Delete every saved conversation. Your account stays.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={resetting}
                      className="gap-2 border-border hover:border-amber-500/40 hover:text-amber-400"
                    >
                      {resetting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <RefreshCw className="size-4" />
                      )}
                      Reset sessions
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset all sessions?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently deletes every conversation and message
                        you've saved. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={resetSessions}
                        className="bg-amber-500 text-amber-950 hover:bg-amber-400"
                      >
                        Yes, delete everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-destructive">
                    Delete account
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Permanently remove your account and all data.
                    {isAdmin && " Admin accounts must be demoted first."}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={deleting || isAdmin}
                      className="gap-2"
                    >
                      {deleting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      Delete account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete your account permanently?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes your account, all conversations, and all
                        messages. There is no recovery. Type your email to
                        confirm is not required — just click confirm.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteAccount}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        I understand, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    toast.success("Signed out");
                  }}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="size-4" /> Sign out
                </Button>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}

function Section({
  icon: Icon,
  title,
  desc,
  children,
  danger,
}: {
  icon: any;
  title: string;
  desc: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className={
          danger
            ? "border-destructive/20 bg-card p-5"
            : "border-border/60 bg-card p-5"
        }
      >
        <div className="mb-4 flex items-start gap-3">
          <div
            className={
              danger
                ? "flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive"
                : "flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400"
            }
          >
            <Icon className="size-4" />
          </div>
          <div>
            <h3 className="font-display font-bold">{title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
          </div>
        </div>
        {children}
      </Card>
    </motion.div>
  );
}

function BillingSection({
  plan,
  isAdmin,
}: {
  plan: any;
  isAdmin: boolean;
}) {
  const [billing, setBilling] = useState<{
    stripeConfigured: boolean;
    hasSubscription: boolean;
    plan: string;
    stripePlan: string | null;
    stripePeriod: string | null;
    canManage: boolean;
  } | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/stripe/billing", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setBilling(d))
      .catch(() => setBilling(null));
  }, []);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to open billing portal");
      }
    } catch {
      toast.error("Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
        <div>
          <p className="font-display font-bold">
            {plan?.label || "Free"} plan
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isAdmin
              ? "Admin — unlimited messages, all personalities."
              : billing?.hasSubscription
                ? `Stripe subscription · ${billing.stripePeriod || "monthly"}`
                : plan?.features?.[0] || "Basic access"}
          </p>
        </div>
        {!isAdmin && plan?.id === "free" && (
          <Button
            onClick={() => (window.location.hash = "pricing")}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Crown className="size-4" /> Upgrade
          </Button>
        )}
      </div>

      {/* Stripe billing management */}
      {billing?.hasSubscription && billing.canManage && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-emerald-400" />
            <div>
              <p className="text-sm font-medium">Stripe subscription active</p>
              <p className="text-xs text-muted-foreground">
                Manage your card, invoices, or cancel anytime
              </p>
            </div>
          </div>
          <Button
            onClick={openPortal}
            disabled={portalLoading}
            variant="outline"
            className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            {portalLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ExternalLink className="size-4" />
            )}
            Manage billing
          </Button>
        </div>
      )}

      {!billing?.stripeConfigured && (
        <p className="text-[11px] text-muted-foreground">
          Stripe billing is not configured. Contact an admin to upgrade.
        </p>
      )}
    </div>
  );
}
