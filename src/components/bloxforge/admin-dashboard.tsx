"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShieldAlert,
  Loader2,
  Users as UsersIcon,
  MessageSquare,
  MessagesSquare,
  KeyRound,
  Crown,
  Search,
  Gift,
  RotateCcw,
  Trash2,
  Plus,
  Cpu,
  Sparkles,
  RefreshCw,
  Info,
  Check,
  Clock,
  X,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type Stats = {
  totalUsers: number;
  admins: number;
  planBreakdown: { free: number; pro: number; studio: number };
  messagesToday: number;
  totalConversations: number;
  activeApiKeys: number;
};

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  role: string;
  extraCredits: number;
  usageCount: number;
  usageDate: string | null;
  createdAt: string;
  approved: boolean;
  robloxUsername: string | null;
  _count: { conversations: number };
};

type ApiKeyRow = {
  id: string;
  label: string;
  provider: string;
  baseUrl: string;
  key: string; // masked
  model: string | null;
  active: boolean;
  priority: number;
  createdAt: string;
};

type ProviderOption = {
  value: string;
  label: string;
};

const PROVIDERS: ProviderOption[] = [
  { value: "nvidia", label: "NVIDIA NIM" },
  { value: "custom", label: "Custom (OpenAI-compatible)" },
  { value: "openai", label: "OpenAI" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "groq", label: "Groq" },
  { value: "together", label: "Together AI" },
];

const DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function goHome() {
  window.location.hash = "";
}

function planBadgeClass(plan: string) {
  switch (plan) {
    case "pro":
      return "border-violet-500/30 bg-violet-500/15 text-violet-300";
    case "studio":
      return "border-amber-500/30 bg-amber-500/15 text-amber-300";
    default:
      return "border-border/60 bg-muted text-muted-foreground";
  }
}

function providerBadgeClass(provider: string) {
  switch (provider) {
    case "nvidia":
      return "border-violet-500/30 bg-violet-500/15 text-violet-300";
    case "openai":
      return "border-border/60 bg-muted text-muted-foreground";
    case "openrouter":
      return "border-violet-500/30 bg-violet-500/15 text-violet-300";
    case "groq":
      return "border-rose-500/30 bg-rose-500/15 text-rose-300";
    case "together":
      return "border-cyan-500/30 bg-cyan-500/15 text-cyan-300";
    default:
      return "border-amber-500/30 bg-amber-500/15 text-amber-300";
  }
}

function providerLabel(provider: string) {
  return (
    PROVIDERS.find((p) => p.value === provider)?.label ?? provider ?? "custom"
  );
}

async function jsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any)?.error || `Request failed (${res.status})`);
  }
  return data;
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

export function AdminDashboard() {
  const [authState, setAuthState] = useState<
    "loading" | "denied" | "ok"
  >("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/usage", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (data?.isAdmin) {
          setAuthState("ok");
        } else {
          setAuthState("denied");
        }
      } catch {
        if (!cancelled) setAuthState("denied");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (authState === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-violet-400" />
          <p className="text-sm">Checking admin access…</p>
        </div>
      </main>
    );
  }

  if (authState === "denied") {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="border-rose-500/20 bg-card p-8 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
              <ShieldAlert className="size-7" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">
              Access denied
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You need an admin account to view this dashboard. Sign in with an
              admin account and try again.
            </p>
            <Button
              onClick={goHome}
              className="mt-6 h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ArrowLeft className="size-4" />
              Back to home
            </Button>
          </Card>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-radial-brand" />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:pt-14">
        <AdminHeader />
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="h-10 bg-muted/60 p-1">
            <TabsTrigger value="overview" className="gap-1.5 px-4">
              <Sparkles className="size-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 px-4">
              <UsersIcon className="size-3.5" />
              Users
            </TabsTrigger>
            <TabsTrigger value="apikeys" className="gap-1.5 px-4">
              <KeyRound className="size-3.5" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="models" className="gap-1.5 px-4">
              <Cpu className="size-3.5" />
              Models
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="users" className="mt-6">
            <UsersTab />
          </TabsContent>
          <TabsContent value="apikeys" className="mt-6">
            <ApiKeysTab />
          </TabsContent>
          <TabsContent value="models" className="mt-6">
            <ModelsTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                             */
/* ------------------------------------------------------------------ */

function AdminHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
    >
      <div>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400">
          BloxForge AI · Internal
        </span>
        <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Admin{" "}
          <span className="bg-gradient-to-r from-violet-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">
            Dashboard
          </span>
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Manage users, plans, credits and AI provider keys.
        </p>
      </div>
      <Button
        variant="outline"
        onClick={goHome}
        className="gap-2 border-border bg-card/50 backdrop-blur hover:bg-accent"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 1 — Overview                                                   */
/* ------------------------------------------------------------------ */

function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [oauthSetup, setOauthSetup] = useState<{
    configured: boolean;
    expectedCallback: string;
    adminRobloxIds: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, oauthRes] = await Promise.all([
        fetch("/api/admin/stats", { cache: "no-store" }),
        fetch("/api/auth/roblox/setup", { cache: "no-store" }),
      ]);
      setStats(await jsonOrThrow(statsRes));
      const od = await oauthRes.json().catch(() => null);
      if (od) {
        setOauthSetup({
          configured: od.configured,
          expectedCallback: od.expectedCallback || "",
          adminRobloxIds: od.adminRobloxIds || "",
        });
      }
    } catch (e) {
      toast.error((e as Error).message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !stats) {
    return <TabLoading label="Loading stats…" />;
  }
  if (!stats) {
    return (
      <EmptyState
        title="Couldn't load stats"
        desc="There was a problem fetching admin statistics."
        onRetry={load}
      />
    );
  }

  const cards = [
    {
      label: "Total users",
      value: stats.totalUsers,
      icon: UsersIcon,
      hint: `${stats.admins} admin${stats.admins === 1 ? "" : "s"}`,
    },
    {
      label: "Messages today",
      value: stats.messagesToday,
      icon: MessageSquare,
      hint: "User messages sent",
    },
    {
      label: "Conversations",
      value: stats.totalConversations,
      icon: MessagesSquare,
      hint: "All-time sessions",
    },
    {
      label: "Active API keys",
      value: stats.activeApiKeys,
      icon: KeyRound,
      hint: "Enabled provider keys",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={load}
          disabled={loading}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Roblox OAuth setup status */}
      {oauthSetup && !oauthSetup.configured && (
        <Card className="border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
              <Info className="size-4" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-amber-300">
                Roblox OAuth not configured
              </h3>
              <p className="mt-1 text-sm text-amber-200/80">
                Users are falling back to manual profile-code verification.
                Enable secure app-permissions sign-in with the step-by-step
                guide:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => (window.location.hash = "oauth-setup")}
                  className="gap-2 bg-amber-500 text-amber-950 hover:bg-amber-400"
                >
                  Open OAuth setup guide →
                </Button>
                <a
                  href="https://create.roblox.com/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-500/10"
                >
                  Roblox Creator Hub ↗
                </a>
              </div>
              {oauthSetup.adminRobloxIds && (
                <p className="mt-2 text-[11px] text-amber-200/60">
                  Auto-admin Roblox IDs:{" "}
                  <code className="font-mono">{oauthSetup.adminRobloxIds}</code>
                </p>
              )}
            </div>
          </div>
        </Card>
      )}
      {oauthSetup?.configured && (
        <Card className="border-violet-500/30 bg-violet-500/5 p-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="size-2 rounded-full bg-violet-400" />
            <span className="font-medium text-violet-300">
              Roblox OAuth is configured
            </span>
            <span className="text-muted-foreground">
              — users can sign in with secure app permissions
            </span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          >
            <Card className="relative h-full overflow-hidden border-border/60 bg-card p-5">
              <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-violet-500/5 blur-2xl" />
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <c.icon className="size-5" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  live
                </span>
              </div>
              <div className="mt-4 font-display text-3xl font-bold text-violet-400">
                {c.value.toLocaleString()}
              </div>
              <div className="mt-1 text-sm font-medium">{c.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {c.hint}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <PlanBreakdownCard stats={stats} />
    </motion.div>
  );
}

function PlanBreakdownCard({ stats }: { stats: Stats }) {
  const { free, pro, studio } = stats.planBreakdown;
  const total = free + pro + studio || 1;
  const rows = [
    {
      label: "Free",
      count: free,
      pct: (free / total) * 100,
      bar: "from-violet-400/60 to-violet-400/40",
    },
    {
      label: "Pro",
      count: pro,
      pct: (pro / total) * 100,
      bar: "from-violet-400 to-purple-400",
    },
    {
      label: "Studio",
      count: studio,
      pct: (studio / total) * 100,
      bar: "from-amber-400 to-orange-400",
    },
  ];

  return (
    <Card className="border-border/60 bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold">Plan breakdown</h3>
          <p className="text-xs text-muted-foreground">
            Distribution of active subscriptions across all users.
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-violet-500/30 bg-violet-500/10 text-violet-300"
        >
          {free + pro + studio} total
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">{r.label}</span>
              <span className="font-mono text-muted-foreground">
                {r.count} · {Math.round(r.pct)}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${r.pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full bg-gradient-to-r",
                  r.bar,
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 2 — Users                                                      */
/* ------------------------------------------------------------------ */

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await jsonOrThrow(res);
      setUsers((data as any).users ?? []);
    } catch (e) {
      toast.error((e as Error).message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pendingCount = useMemo(
    () => users.filter((u) => u.role !== "admin" && !u.approved).length,
    [users],
  );

  const filtered = useMemo(() => {
    let result = users;
    if (showPendingOnly) {
      result = result.filter((u) => u.role !== "admin" && !u.approved);
    }
    const q = query.trim().toLowerCase();
    if (!q) return result;
    return result.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.name?.toLowerCase().includes(q) ?? false) ||
        (u.robloxUsername?.toLowerCase().includes(q) ?? false),
    );
  }, [users, query, showPendingOnly]);

  async function patchUser(
    id: string,
    body: Record<string, unknown>,
    msg: string,
  ) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await jsonOrThrow(res);
      toast.success(msg);
      await load();
    } catch (e) {
      toast.error((e as Error).message || "Update failed");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      await jsonOrThrow(res);
      toast.success("User deleted");
      await load();
    } catch (e) {
      toast.error((e as Error).message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  async function approveUser(id: string, approved: boolean) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      await jsonOrThrow(res);
      toast.success(
        approved
          ? "User approved — beta access granted"
          : "Beta access revoked",
      );
      await load();
    } catch (e) {
      toast.error((e as Error).message || "Update failed");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Beta approval summary */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 sm:p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
          <Clock className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <span className="font-display text-lg font-bold text-amber-300">
              {pendingCount}
            </span>{" "}
            <span className="font-medium">pending approval</span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {pendingCount === 0
              ? "All caught up — no users waiting for beta access."
              : "Roblox-auth users need admin approval before they can use BloxForge AI."}
          </p>
        </div>
        <Button
          variant={showPendingOnly ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 shrink-0 gap-1.5",
            showPendingOnly
              ? "bg-amber-500 text-white hover:bg-amber-500/90"
              : "border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200",
          )}
          onClick={() => setShowPendingOnly((v) => !v)}
          disabled={pendingCount === 0 && !showPendingOnly}
        >
          <Clock className="size-3.5" />
          {showPendingOnly ? "Show all users" : "Show only pending"}
        </Button>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email or name…"
            className="h-10 pl-9"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={load}
          disabled={loading}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Card className="border-border/60 bg-card p-0">
        {loading && users.length === 0 ? (
          <div className="p-6">
            <TabLoading label="Loading users…" bare />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {users.length === 0
              ? "No users yet."
              : showPendingOnly
                ? "No pending users — all caught up!"
                : "No users match your search."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="pl-4">User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Conversations</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow
                  key={u.id}
                  className="border-border/60"
                >
                  <TableCell className="pl-4">
                    <div className="flex flex-col">
                      <span className="font-medium leading-tight">
                        {u.name || u.email}
                      </span>
                      {u.name && (
                        <span className="text-xs text-muted-foreground">
                          {u.email}
                        </span>
                      )}
                      {u.robloxUsername && (
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-violet-400/90">
                          <Gamepad2 className="size-3" />
                          {u.robloxUsername}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("h-6 px-2.5 text-[11px]", planBadgeClass(u.plan))}
                    >
                      {u.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.role === "admin" ? (
                      <Badge
                        variant="outline"
                        className="h-6 gap-1 border-violet-500/30 bg-violet-500/15 px-2.5 text-[11px] text-violet-300"
                      >
                        <Crown className="size-3" />
                        Admin
                      </Badge>
                    ) : u.approved ? (
                      <Badge
                        variant="outline"
                        className="h-6 gap-1 border-violet-500/30 bg-violet-500/15 px-2.5 text-[11px] text-violet-300"
                      >
                        <Check className="size-3" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="h-6 gap-1 border-amber-500/30 bg-amber-500/15 px-2.5 text-[11px] text-amber-300"
                      >
                        <Clock className="size-3" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="font-mono text-violet-400">
                        +{u.extraCredits} bonus
                      </span>
                      <span className="text-muted-foreground">
                        {u.usageCount} used today
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {u._count?.conversations ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {u.role !== "admin" &&
                        (u.approved ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            disabled={busyId === u.id}
                            onClick={() => approveUser(u.id, false)}
                            title="Revoke beta access"
                          >
                            <X className="size-3.5" />
                            Revoke
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-8 gap-1.5 bg-violet-500 px-2.5 text-white hover:bg-violet-500/90"
                            disabled={busyId === u.id}
                            onClick={() => approveUser(u.id, true)}
                            title="Approve beta access"
                          >
                            <Check className="size-3.5" />
                            Approve
                          </Button>
                        ))}
                      <Select
                        value={u.plan}
                        disabled={busyId === u.id}
                        onValueChange={(plan) =>
                          patchUser(
                            u.id,
                            { plan },
                            `Plan set to ${plan}`,
                          )
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="h-8 w-[104px] gap-1.5 bg-card/60"
                          aria-label="Change plan"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="studio">Studio</SelectItem>
                        </SelectContent>
                      </Select>

                      <GrantCreditsButton
                        current={u.extraCredits}
                        disabled={busyId === u.id}
                        onSubmit={(n) =>
                          patchUser(
                            u.id,
                            { extraCredits: n },
                            `Granted ${n} credits`,
                          )
                        }
                      />

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                        disabled={busyId === u.id}
                        onClick={() =>
                          patchUser(
                            u.id,
                            { resetUsage: true },
                            "Daily usage reset",
                          )
                        }
                        title="Reset daily usage"
                      >
                        <RotateCcw className="size-3.5" />
                        <span className="sr-only">Reset usage</span>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 px-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-40"
                            disabled={u.role === "admin" || busyId === u.id}
                            title={
                              u.role === "admin"
                                ? "Cannot delete admin users"
                                : "Delete user"
                            }
                          >
                            <Trash2 className="size-3.5" />
                            <span className="sr-only">Delete user</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete user?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently deletes{" "}
                              <span className="font-medium text-foreground">
                                {u.email}
                              </span>{" "}
                              and removes all of their conversations. This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-white hover:bg-destructive/90"
                              onClick={() => deleteUser(u.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      <p className="px-1 text-xs text-muted-foreground">
        Showing {filtered.length} of {users.length} users
        {showPendingOnly ? " (pending only)" : ""}.
      </p>
    </motion.div>
  );
}

function GrantCreditsButton({
  current,
  disabled,
  onSubmit,
}: {
  current: number;
  disabled?: boolean;
  onSubmit: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(current));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setValue(String(current));
  }, [open, current]);

  async function submit() {
    const n = parseInt(value, 10);
    if (Number.isNaN(n) || n < 0) {
      toast.error("Enter a valid non-negative number");
      return;
    }
    setSubmitting(true);
    try {
      onSubmit(n);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300"
          disabled={disabled}
          title="Grant credits"
        >
          <Gift className="size-3.5" />
          <span className="sr-only">Grant credits</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 border-border/60 bg-popover p-4"
      >
        <div className="space-y-3">
          <div>
            <p className="font-display text-sm font-semibold">Grant credits</p>
            <p className="text-xs text-muted-foreground">
              Sets the user&apos;s total bonus daily credits (replaces current
              value of {current}).
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="credits-input" className="text-xs">
              Extra credits
            </Label>
            <Input
              id="credits-input"
              type="number"
              min={0}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={submitting}
              onClick={submit}
            >
              {submitting && <Loader2 className="size-3.5 animate-spin" />}
              Grant
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 3 — API Keys                                                   */
/* ------------------------------------------------------------------ */

function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  // form state
  const [form, setForm] = useState({
    label: "",
    provider: "nvidia",
    baseUrl: DEFAULT_BASE_URL,
    key: "",
    model: "",
    priority: "0",
  });
  const [submitting, setSubmitting] = useState(false);
  const [availableModels, setAvailableModels] = useState<
    { id: string; label: string }[]
  >([]);
  const [fetchingModels, setFetchingModels] = useState(false);

  const fetchModels = useCallback(async () => {
    if (!form.key) {
      toast.error("Enter an API key first");
      return;
    }
    setFetchingModels(true);
    try {
      const res = await fetch("/api/admin/api-keys/test-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: form.baseUrl.trim() || DEFAULT_BASE_URL,
          apiKey: form.key,
        }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.models)) {
        if (data.models.length === 0) {
          toast.info("No models returned by this provider");
        } else {
          setAvailableModels(data.models);
          toast.success(`Found ${data.models.length} models`);
        }
      } else {
        toast.error(data.error || "Failed to fetch models");
      }
    } catch {
      toast.error("Failed to fetch models");
    } finally {
      setFetchingModels(false);
    }
  }, [form.baseUrl, form.key]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/api-keys", { cache: "no-store" });
      const data = await jsonOrThrow(res);
      setKeys((data as any).keys ?? []);
    } catch (e) {
      toast.error((e as Error).message || "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateForm<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submitNew() {
    if (!form.label.trim() || !form.key.trim()) {
      toast.error("Label and API key are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: form.label.trim(),
          provider: form.provider,
          baseUrl: form.baseUrl.trim() || DEFAULT_BASE_URL,
          key: form.key.trim(),
          model: form.model.trim() || null,
          priority: Number(form.priority) || 0,
        }),
      });
      await jsonOrThrow(res);
      toast.success("API key added");
      setForm({
        label: "",
        provider: "nvidia",
        baseUrl: DEFAULT_BASE_URL,
        key: "",
        model: "",
        priority: "0",
      });
      await load();
    } catch (e) {
      toast.error((e as Error).message || "Failed to add API key");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(k: ApiKeyRow, active: boolean) {
    setBusyId(k.id);
    // optimistic update
    setKeys((prev) =>
      prev.map((x) => (x.id === k.id ? { ...x, active } : x)),
    );
    try {
      const res = await fetch(`/api/admin/api-keys/${k.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      await jsonOrThrow(res);
      toast.success(active ? "Key enabled" : "Key disabled");
    } catch (e) {
      toast.error((e as Error).message || "Update failed");
      setKeys((prev) =>
        prev.map((x) => (x.id === k.id ? { ...x, active: !active } : x)),
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteKey(k: ApiKeyRow) {
    setBusyId(k.id);
    try {
      const res = await fetch(`/api/admin/api-keys/${k.id}`, {
        method: "DELETE",
      });
      await jsonOrThrow(res);
      toast.success("API key deleted");
      await load();
    } catch (e) {
      toast.error((e as Error).message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Add form */}
      <Card className="border-violet-500/20 bg-card p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <Plus className="size-4.5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold">Add API key</h3>
            <p className="text-xs text-muted-foreground">
              Any OpenAI-compatible endpoint. Used in priority order (highest
              first).
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="ak-label" className="text-xs">
              Label
            </Label>
            <Input
              id="ak-label"
              value={form.label}
              onChange={(e) => updateForm("label", e.target.value)}
              placeholder="NVIDIA primary"
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ak-provider" className="text-xs">
              Provider
            </Label>
            <Select
              value={form.provider}
              onValueChange={(v) => {
                updateForm("provider", v);
                // Auto-set the base URL based on provider
                const urls: Record<string, string> = {
                  nvidia: "https://integrate.api.nvidia.com/v1",
                  groq: "https://api.groq.com/openai/v1",
                  openai: "https://api.openai.com/v1",
                  openrouter: "https://openrouter.ai/api/v1",
                  together: "https://api.together.xyz/v1",
                  custom: "",
                };
                if (urls[v]) updateForm("baseUrl", urls[v]);
              }}
            >
              <SelectTrigger id="ak-provider" className="h-9 w-full bg-card/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ak-baseurl" className="text-xs">
              Base URL
            </Label>
            <Input
              id="ak-baseurl"
              value={form.baseUrl}
              onChange={(e) => updateForm("baseUrl", e.target.value)}
              placeholder={DEFAULT_BASE_URL}
              className="h-9 font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ak-key" className="text-xs">
              API key
            </Label>
            <Input
              id="ak-key"
              type="password"
              value={form.key}
              onChange={(e) => updateForm("key", e.target.value)}
              placeholder="nvapi-••••••••••••"
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="ak-model" className="text-xs">
                Model to use
              </Label>
              <button
                onClick={fetchModels}
                disabled={fetchingModels}
                className="flex items-center gap-1.5 rounded-md border border-violet-500/30 px-2 py-1 text-[11px] text-violet-400 transition hover:bg-violet-500/10 disabled:opacity-50"
              >
                {fetchingModels ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Search className="size-3" />
                )}
                Fetch available models
              </button>
            </div>
            {availableModels.length > 0 ? (
              <select
                id="ak-model"
                value={form.model}
                onChange={(e) => updateForm("model", e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 font-mono text-xs focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="">— Select a model —</option>
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="ak-model"
                value={form.model}
                onChange={(e) => updateForm("model", e.target.value)}
                placeholder="Type a model ID or click 'Fetch available models'"
                className="h-9 font-mono text-xs"
              />
            )}
            <p className="text-[11px] text-muted-foreground">
              {form.model
                ? `All chat requests will use: ${form.model}`
                : "If left blank, each personality uses its default model."}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ak-priority" className="text-xs">
              Priority
            </Label>
            <Input
              id="ak-priority"
              type="number"
              value={form.priority}
              onChange={(e) => updateForm("priority", e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            onClick={submitNew}
            disabled={submitting}
            className="h-10 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Add key
          </Button>
        </div>
      </Card>

      {/* Keys list */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold">
          Active keys{" "}
          <span className="font-mono text-sm font-normal text-muted-foreground">
            ({keys.length})
          </span>
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={load}
          disabled={loading}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Card className="border-border/60 bg-card p-0">
        {loading && keys.length === 0 ? (
          <div className="p-6">
            <TabLoading label="Loading API keys…" bare />
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <KeyRound className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No API keys configured yet. Add one above to override the
              NVIDIA_API_KEY env var.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="pl-4">Label</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Base URL</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-center">Priority</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow key={k.id} className="border-border/60">
                  <TableCell className="pl-4">
                    <div className="flex flex-col">
                      <span className="font-medium leading-tight">
                        {k.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(k.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-6 px-2.5 text-[11px]",
                        providerBadgeClass(k.provider),
                      )}
                    >
                      {providerLabel(k.provider)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <span
                      className="block truncate font-mono text-xs text-muted-foreground"
                      title={k.baseUrl}
                    >
                      {k.baseUrl}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-violet-400/80">
                      {k.key || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    {k.model ? (
                      <span
                        className="block truncate font-mono text-xs"
                        title={k.model}
                      >
                        {k.model}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-mono text-sm">{k.priority}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={k.active}
                      disabled={busyId === k.id}
                      onCheckedChange={(v) => toggleActive(k, v)}
                      aria-label="Toggle active"
                    />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 px-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                          disabled={busyId === k.id}
                        >
                          <Trash2 className="size-3.5" />
                          <span className="sr-only">Delete key</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete API key?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently deletes the key{" "}
                            <span className="font-medium text-foreground">
                              {k.label}
                            </span>
                            . Any traffic using it will fall back to the next
                            priority key or the NVIDIA_API_KEY env var.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={() => deleteKey(k)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Note card */}
      <Card className="border-border/60 bg-muted/30 p-5">
        <div className="flex gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
            <Info className="size-4" />
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">How keys are used</p>
            <p>
              Keys are used in <span className="text-violet-400">priority order</span>{" "}
              (highest first). Any OpenAI-compatible endpoint works — NVIDIA
              NIM, OpenAI, OpenRouter, Groq, Together and more.
            </p>
            <p>
              The highest-priority{" "}
              <span className="text-violet-400">active</span> key overrides the{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                NVIDIA_API_KEY
              </code>{" "}
              environment variable.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                     */
/* ------------------------------------------------------------------ */

function TabLoading({ label, bare }: { label: string; bare?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 text-muted-foreground",
        bare ? "py-6" : "py-20",
      )}
    >
      <Loader2 className="size-5 animate-spin text-violet-400" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

function EmptyState({
  title,
  desc,
  onRetry,
}: {
  title: string;
  desc: string;
  onRetry: () => void;
}) {
  return (
    <Card className="border-border/60 bg-card p-10 text-center">
      <Cpu className="mx-auto mb-3 size-6 text-muted-foreground" />
      <h3 className="font-display text-base font-bold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {desc}
      </p>
      <Button
        variant="outline"
        onClick={onRetry}
        className="mt-4 gap-2 border-border bg-card/50 hover:bg-accent"
      >
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 4 — Models                                                      */
/* ------------------------------------------------------------------ */

function ModelsTab() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/models", { cache: "no-store" });
      const data = await jsonOrThrow(res);
      setModels((data as any).models ?? []);
    } catch (e) {
      toast.error((e as Error).message || "Failed to load models");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <TabLoading label="Loading models…" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold">AI Models</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            All available models. Configure API keys in the API Keys tab to change which provider is used.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={load}
          disabled={loading}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className={cn(
              "h-full border-border/60 bg-card p-5",
              m.studioOnly && "border-amber-500/30 bg-amber-500/5",
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    m.beta ? "bg-amber-500/15 text-amber-400" : "bg-violet-500/15 text-violet-400",
                  )}>
                    <Cpu className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold">{m.label}</h4>
                    <p className="font-mono text-[10px] text-muted-foreground">{m.model}</p>
                  </div>
                </div>
                {m.badge && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-5 text-[10px]",
                      m.beta ? "text-amber-400" : "text-violet-400",
                    )}
                  >
                    {m.badge}
                  </Badge>
                )}
              </div>

              <p className="mt-2 text-xs text-muted-foreground">{m.tagline}</p>

              <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Vendor</span>
                  <span className="font-medium text-foreground">{m.vendor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tier</span>
                  <span className="font-medium capitalize text-foreground">{m.tier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Strength</span>
                  <span className="font-medium text-foreground">{m.strength}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Speed</span>
                  <span className="flex gap-0.5">
                    {[1,2,3].map((s) => (
                      <span key={s} className={cn(
                        "size-1.5 rounded-full",
                        s <= m.speed ? "bg-violet-400" : "bg-muted-foreground/20",
                      )} />
                    ))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Access</span>
                  <span className={cn("font-medium", m.studioOnly ? "text-amber-400" : "text-emerald-400")}>
                    {m.studioOnly ? "Studio plan only" : "All plans"}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge className="gap-1 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Active
                </Badge>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-border/60 bg-card p-5">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-4 shrink-0 text-violet-400" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">How to change the AI model</p>
            <p className="mt-1">
              All models currently use <code className="rounded bg-white/10 px-1 font-mono text-xs text-violet-300">nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free</code> via OpenRouter.
              To use a different model, go to the <b>API Keys</b> tab and add a new key with the desired provider + model.
              The model ID set on the API key overrides the default model for all personalities.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
