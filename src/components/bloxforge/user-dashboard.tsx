"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Sparkles,
  TrendingUp,
  Zap,
  Crown,
  Plus,
  Clock,
  Loader2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DashboardData {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    name?: string | null;
    plan: string;
    role: string;
    createdAt: string;
  };
  stats?: {
    totalConversations: number;
    totalMessages: number;
    usageToday: number;
    limit: number;
    extraCredits: number;
    isAdmin: boolean;
  };
  usage7d?: { date: string; count: number }[];
  recentConversations?: {
    id: string;
    title: string;
    model: string;
    mode: string;
    updatedAt: string;
    _count: { messages: number };
  }[];
  plan?: { id: string; label: string; features: string[] };
}

export function UserDashboard({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      const d = await res.json();
      setData(d);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-violet-400" />
      </main>
    );
  }

  if (!data?.authenticated) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <Card className="max-w-md p-8 text-center">
          <Shield className="mx-auto mb-3 size-10 text-muted-foreground" />
          <h2 className="font-display text-xl font-bold">Sign in required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to view your dashboard.
          </p>
          <Button onClick={onBack} className="mt-4 gap-2">
            <ArrowLeft className="size-4" /> Back to home
          </Button>
        </Card>
      </main>
    );
  }

  const s = data.stats!;
  const usagePct =
    s.limit === -1 ? 0 : Math.min(100, (s.usageToday / s.limit) * 100);

  return (
    <main className="flex-1">
      <div className="bg-radial-brand pointer-events-none absolute inset-x-0 top-0 h-64 opacity-40" />
      <div className="relative mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back, {data.user?.name || data.user?.email?.split("@")[0]}.
            </p>
          </div>
          <div className="flex gap-2">
            {data.user?.role === "admin" && (
              <Button
                variant="outline"
                onClick={() => (window.location.hash = "admin")}
                className="gap-2 border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
              >
                <Shield className="size-4" /> Admin
              </Button>
            )}
            <Button
              onClick={() => (window.location.hash = "app")}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-4" /> New session
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={MessageSquare}
            label="Conversations"
            value={s.totalConversations}
            delay={0}
          />
          <StatCard
            icon={Send}
            label="Credits used"
            value={s.totalMessages}
            delay={0.06}
          />
          <StatCard
            icon={Zap}
            label="Today's usage"
            value={s.usageToday}
            suffix={s.limit === -1 ? " ∞" : ` / ${s.limit}`}
            delay={0.12}
          />
          <StatCard
            icon={Crown}
            label="Plan"
            value={data.plan?.label || "Free"}
            delay={0.18}
            isText
          />
        </div>

        {/* Usage + 7-day chart */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="border-border/60 bg-card p-5 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold">Today's usage</h3>
              {s.limit === -1 ? (
                <Badge className="gap-1 bg-violet-500/15 text-violet-300 hover:bg-violet-500/20">
                  <Sparkles className="size-3" /> Unlimited
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {s.usageToday} / {s.limit}
                </span>
              )}
            </div>
            {s.limit !== -1 ? (
              <>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {Math.max(0, s.limit - s.usageToday)} credits remaining today
                  {s.extraCredits > 0 && (
                    <span className="text-violet-400">
                      {" "}· +{s.extraCredits} bonus credits
                    </span>
                  )}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                {data.user?.role === "admin"
                  ? "Admin accounts have unlimited credits."
                  : "Your plan includes unlimited credits."}
              </p>
            )}
            {(data.plan?.id === "free" || data.user?.role !== "admin") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.hash = "pricing")}
                className="mt-4 w-full gap-1.5 border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
              >
                <Crown className="size-3.5" /> Upgrade for more credits
              </Button>
            )}
          </Card>

          <Card className="border-border/60 bg-card p-5 lg:col-span-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-violet-400" />
              <h3 className="font-display font-bold">Last 7 days</h3>
            </div>
            <UsageChart data={data.usage7d || []} />
          </Card>
        </div>

        {/* Recent sessions */}
        <div className="mt-4">
          <Card className="border-border/60 bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display font-bold">Recent sessions</h3>
              {(data.recentConversations?.length || 0) > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (window.location.hash = "app")}
                  className="text-xs"
                >
                  View all
                </Button>
              )}
            </div>
            {(data.recentConversations || []).length === 0 ? (
              <div className="py-10 text-center">
                <MessageSquare className="mx-auto mb-3 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No sessions yet. Start your first forge session.
                </p>
                <Button
                  onClick={() => (window.location.hash = "app")}
                  className="mt-4 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Sparkles className="size-4" /> Launch BloxForge AI
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {data.recentConversations!.map((c, i) => (
                  <motion.button
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => (window.location.hash = "app")}
                    className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition hover:border-border hover:bg-accent/40"
                  >
                    <MessageSquare className="size-4 shrink-0 text-muted-foreground group-hover:text-violet-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.title}</p>
                      <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="capitalize">{c.model}</span>
                        <span>·</span>
                        <span>{c._count.messages} msgs</span>
                        <span>·</span>
                        <Clock className="size-3" />
                        {timeAgo(c.updatedAt)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 capitalize text-[10px]"
                    >
                      {c.mode}
                    </Badge>
                  </motion.button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  delay,
  isText,
}: {
  icon: any;
  label: string;
  value: number | string;
  suffix?: string;
  delay: number;
  isText?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-border/60 bg-card p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <Icon className="size-4 text-violet-400" />
        </div>
        <p className="mt-2 font-display text-2xl font-extrabold tracking-tight">
          {isText ? value : value.toLocaleString()}
          {suffix && (
            <span className="text-sm font-medium text-muted-foreground">
              {suffix}
            </span>
          )}
        </p>
      </Card>
    </motion.div>
  );
}

function UsageChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="mt-4 flex h-32 items-end justify-between gap-1.5">
      {data.map((d, i) => {
        const h = (d.count / max) * 100;
        const isToday = i === data.length - 1;
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full flex-1 items-end">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(4, h)}%` }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                className={cn(
                  "w-full rounded-t-md",
                  isToday
                    ? "bg-gradient-to-t from-violet-500 to-violet-400"
                    : "bg-violet-500/30",
                )}
                title={`${d.count} messages`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {new Date(d.date).toLocaleDateString("en", { weekday: "short" }).charAt(0)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
