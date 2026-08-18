"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Send,
  Trash2,
  MessageSquare,
  Loader2,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Code2,
  Bug,
  BookOpen,
  Wand2,
  Copy,
  Check,
  Lock,
  Zap,
  FileCode2,
  Clock,
  ImageIcon,
  Layout,
  Box,
  Play,
} from "lucide-react";
import { Logo } from "./logo";
import { Markdown } from "./markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { PersonalityPicker } from "./personality-picker";
import { useAuth } from "./use-auth";
import {
  useStudioConnection,
  StudioConnectDialog,
  StudioBadge,
  ConnectStudioButton,
} from "./studio-connector";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  extractCodeBlocks,
  isInsertable,
  deriveInstance,
} from "@/lib/luau-naming";

type Role = "user" | "assistant";
interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  personality?: string;
  mode?: string;
  creditsUsed?: number;
  creditReason?: string;
  isPlan?: boolean;
}
interface ConversationSummary {
  id: string;
  title: string;
  model: string; // personality id
  mode: string;
  updatedAt: string;
  _count: { messages: number };
}

const EXAMPLES = [
  {
    icon: Code2,
    title: "Generate a ModuleScript",
    prompt:
      "Create a Luau ModuleScript for a reusable cooldown system with a :Start(duration) method that returns a promise-like object resolving when the cooldown finishes.",
  },
  {
    icon: Bug,
    title: "Debug my script",
    prompt:
      "My RemoteEvent fires on the server but the client never receives it. Here's the setup — what are the most common causes and how do I fix it?",
  },
  {
    icon: Wand2,
    title: "Refactor to OOP",
    prompt:
      "Refactor this into a clean OOP class using metatables: a simple enemy with health, TakeDamage, and Die methods, plus a .Died signal.",
  },
  {
    icon: BookOpen,
    title: "Explain a concept",
    prompt:
      "Explain the difference between BindableEvents, BindableFunctions, RemoteEvents and RemoteFunctions — when should I use each?",
  },
];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function ChatApp({
  onExit,
  onOpenAuth,
  onNavigatePricing,
}: {
  onExit: () => void;
  onOpenAuth: () => void;
  onNavigatePricing: () => void;
}) {
  const { isAuthenticated, user, usage, plan, refreshUsage, isApproved, isAdmin } = useAuth();
  const studio = useStudioConnection();
  const [studioDialogOpen, setStudioDialogOpen] = useState(false);
  const [includeStudioContext, setIncludeStudioContext] = useState(true);
  const [autoInsert, setAutoInsert] = useState(true); // ON by default — always insert when Studio connected
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [personality, setPersonality] = useState(() => {
    if (typeof window === "undefined") return "swift";
    return localStorage.getItem("bloxforge:defaultPersonality") || "swift";
  });
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") return "normal";
    return localStorage.getItem("bloxforge:defaultMode") || "normal";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);
  const [showLimitBanner, setShowLimitBanner] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const allowedPersonalities = plan?.allowedPersonalities || ["swift", "balanced"];

  // Insert generated code into Studio via the connector.
  // The Markdown component derives an instanceName + instanceType from the
  // code + the AI's heading. In demo mode the simulated heartbeat drains the
  // command and shows a confirmation toast; in real mode the plugin drains it.
  const handleInsertCode = useCallback(
    async (
      code: string,
      language: string,
      instanceType: "Script" | "LocalScript" | "ModuleScript" | "Part" | "Model",
      instanceName: string,
      parent: string,
    ) => {
      const result = await studio.insertCode(code, {
        title: instanceName,
        language,
        instanceType,
        instanceName,
        parent,
      });
      if (result.ok) {
        if (studio.mode === "demo") {
          toast.success(`Sent to Studio (demo)`, {
            description: `${instanceType} "${instanceName}" → ${parent}`,
          });
        } else {
          toast.success(`Sent to Roblox Studio`, {
            description: `${instanceType} "${instanceName}" → ${parent}`,
          });
        }
      }
    },
    [studio],
  );

  // ── Image attachment handling ──
  const handleImageSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        toast.error("Image must be under 4MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleImagePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageSelect(file);
            e.preventDefault();
            break;
          }
        }
      }
    },
    [handleImageSelect],
  );

  // Load conversations
  const refreshConversations = useCallback(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations, isAuthenticated]);

  // Auto-scroll on new content
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const loadConversation = useCallback(async (id: string) => {
    setLoadingConv(true);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      const data = await res.json();
      const conv = data.conversation;
      if (conv) {
        setActiveId(conv.id);
        setPersonality(conv.model || "swift");
        setMode(conv.mode || "normal");
        setMessages(
          (conv.messages || [])
            .filter(
              (m: { role: string }) => m.role === "user" || m.role === "assistant",
            )
            .map((m: { id: string; role: Role; content: string }) => ({
              id: m.id,
              role: m.role,
              content: m.content,
            })),
        );
        setSidebarOpen(false);
      }
    } catch {
      toast.error("Failed to load conversation");
    } finally {
      setLoadingConv(false);
    }
  }, []);

  const newChat = useCallback(() => {
    setActiveId(null);
    setMessages([]);
    setInput("");
    setSidebarOpen(false);
  }, []);

  const deleteConversation = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await fetch(`/api/conversations/${id}`, { method: "DELETE" });
        if (activeId === id) newChat();
        refreshConversations();
        toast.success("Conversation deleted");
      } catch {
        toast.error("Failed to delete");
      }
    },
    [activeId, newChat, refreshConversations],
  );

  const send = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || streaming) return;

      // Check free-tier limit
      if (
        usage &&
        usage.limit !== -1 &&
        usage.remaining !== -1 &&
        usage.remaining <= 0
      ) {
        setShowLimitBanner(true);
        toast.error("Daily limit reached", {
          description: "Upgrade to Pro for 30 credits/day.",
          action: { label: "Upgrade", onClick: onNavigatePricing },
        });
        return;
      }

      const userMsg: ChatMessage = { id: uid(), role: "user", content };
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: "",
        personality,
        mode,
      };
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setAttachedImage(null);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;
      let accumulatedContent = ""; // tracks the full AI response for auto-insert

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            personality,
            mode,
            history,
            conversationId: activeId,
            context:
              studio.isConnected && includeStudioContext && studio.context
                ? studio.context.source
                : undefined,
            image: attachedImage || undefined,
          }),
          signal: controller.signal,
        });

        if (res.status === 429) {
          const data = await res.json();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: `⚠ ${data.message}` }
                : m,
            ),
          );
          setShowLimitBanner(true);
          refreshUsage();
          return;
        }

        if (res.status === 403) {
          const data = await res.json();
          if (data.error === "not-approved") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? { ...m, content: `⏳ ${data.message}` }
                  : m,
              ),
            );
            toast.error("Pending beta approval", {
              description: "An admin needs to approve your account first.",
            });
            refreshUsage();
            return;
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: `⚠ ${data.message}` }
                : m,
            ),
          );
          toast.info("Sign in to unlock this model", {
            action: { label: "Sign in", onClick: onOpenAuth },
          });
          return;
        }

        if (!res.ok || !res.body) throw new Error("Request failed");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data) continue;
            try {
              const evt = JSON.parse(data);
              if (evt.type === "delta" && evt.delta) {
                accumulatedContent += evt.delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: m.content + evt.delta }
                      : m,
                  ),
                );
              } else if (evt.type === "meta") {
                if (evt.conversationId && !activeId) {
                  setActiveId(evt.conversationId);
                }
                // Store credit cost on the assistant message
                if (evt.creditsUsed) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsg.id
                        ? {
                            ...m,
                            creditsUsed: evt.creditsUsed,
                            creditReason: evt.creditReason,
                            isPlan: evt.isPlan,
                          }
                        : m,
                    ),
                  );
                }
              } else if (evt.type === "error") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: `⚠ ${evt.error}` }
                      : m,
                  ),
                );
                toast.error(evt.error);
              }
            } catch {
              /* ignore */
            }
          }
        }
        refreshConversations();
        refreshUsage();

        // ── Auto-insert: if Studio is connected + autoInsert is on, parse
        // the AI response for code blocks and insert each one automatically.
        if (autoInsert && studio.isConnected && accumulatedContent && !accumulatedContent.includes("## Plan")) {
          const blocks = extractCodeBlocks(accumulatedContent);
          const insertable = blocks.filter((b) => isInsertable(b.language));
          if (insertable.length > 0) {
            toast.info(`Auto-inserting ${insertable.length} item${insertable.length > 1 ? "s" : ""} into Studio…`);
            for (const block of insertable) {
              const heading = block.heading || "";
              const cleanHeading = heading.replace(/\.luau?$/i, "").replace(/[.:]$/, "").trim();
              const derived = deriveInstance(block.code, cleanHeading);
              const result = await studio.insertCode(block.code, {
                title: derived.instanceName,
                language: block.language,
                instanceType: derived.instanceType,
                instanceName: derived.instanceName,
                parent: derived.parent,
              });
              if (result.ok) {
                toast.success(`Auto-inserted: ${derived.instanceName}`, {
                  description: `${derived.instanceType} → ${derived.parent}`,
                });
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: `⚠ Connection error: ${(err as Error).message}` }
                : m,
            ),
          );
          toast.error("Connection error");
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [
      input,
      streaming,
      messages,
      personality,
      mode,
      activeId,
      refreshConversations,
      refreshUsage,
      usage,
      onNavigatePricing,
      onOpenAuth,
      studio,
      includeStudioContext,
      autoInsert,
      attachedImage,
    ],
  );

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ top: "3.5rem" }}
      >
        <div className="flex items-center justify-between p-3">
          <Button
            onClick={newChat}
            className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" /> New Forge Session
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-4">
            {conversations.length === 0 ? (
              <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                No sessions yet. Start forging.
              </p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => loadConversation(c.id)}
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                    activeId === c.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <MessageSquare className="size-3.5 shrink-0 opacity-60" />
                  <span className="flex-1 truncate">{c.title}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => deleteConversation(c.id, e)}
                    className="opacity-0 transition group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5 hover:text-destructive" />
                  </span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Usage / Upgrade card */}
        {!isAuthenticated ? (
          <div className="m-3 rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-transparent p-3.5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4 text-violet-400" />
              Create a free account
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Save sessions, unlock all 5 models & get 5 credits/day.
            </p>
            <Button
              size="sm"
              onClick={onOpenAuth}
              className="mt-2.5 w-full gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign up free
            </Button>
          </div>
        ) : user?.plan === "free" ? (
          <div className="m-3 rounded-xl border border-border bg-card p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Today's usage</span>
              <span className="font-medium">
                {usage?.used ?? 0}
                {usage?.limit !== -1 ? ` / ${usage?.limit ?? 50}` : ""}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500 transition-all"
                style={{
                  width: `${usage && usage.limit !== -1 ? Math.min(100, (usage.used / usage.limit) * 100) : 0}%`,
                }}
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onNavigatePricing}
              className="mt-2.5 w-full gap-1.5 border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
            >
              <Zap className="size-3.5" /> Upgrade to Pro
            </Button>
          </div>
        ) : null}
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          style={{ top: "3.5rem" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Top bar — MODEL / MODE personality pickers */}
        <header className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
            <PersonalityPicker
              personalityId={personality}
              modeId={mode}
              onPersonalityChange={setPersonality}
              onModeChange={setMode}
              allowedPersonalities={allowedPersonalities}
              isAdmin={isAdmin}
            />
          </div>
          <div className="flex items-center gap-2">
            {studio.isConnected ? (
              <>
                <StudioBadge
                  context={studio.context}
                  mode={studio.mode}
                  onClick={() => setStudioDialogOpen(true)}
                />
                {/* Auto-insert toggle — only visible when Studio is connected */}
                <button
                  onClick={() => setAutoInsert((v) => !v)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                    autoInsert
                      ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                  title={
                    autoInsert
                      ? "Auto-insert is ON — AI code is sent to Studio automatically"
                      : "Auto-insert is OFF — click to enable automatic insertion"
                  }
                >
                  <Zap className={cn("size-3.5", autoInsert && "text-violet-400")} />
                  <span className="hidden sm:inline">Auto-insert</span>
                </button>
              </>
            ) : (
              <ConnectStudioButton onClick={() => setStudioDialogOpen(true)} />
            )}
            <Badge
              variant="outline"
              className="gap-1.5 border-violet-500/30 bg-violet-500/10 text-violet-400"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-violet-400" />
              Live
            </Badge>
          </div>
        </header>

        {/* Beta pending-approval banner */}
        {isAuthenticated && !isApproved && (
          <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5">
            <div className="mx-auto flex max-w-3xl items-center gap-2 text-sm">
              <Clock className="size-4 shrink-0 text-amber-400" />
              <span className="flex-1 text-amber-200">
                <b>Beta:</b> Your account is pending admin approval. You can browse
                but can't chat yet.
              </span>
            </div>
          </div>
        )}

        {/* Limit banner */}
        <AnimatePresence>
          {showLimitBanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-amber-500/20 bg-amber-500/10"
            >
              <div className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <Lock className="size-4 shrink-0 text-amber-400" />
                <span className="flex-1 text-amber-200">
                  You've reached your daily credit limit. Upgrade to Pro for
                  30 credits/day and all NVIDIA models.
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowLimitBanner(false);
                    onNavigatePricing();
                  }}
                  className="gap-1.5 bg-amber-500 text-amber-950 hover:bg-amber-400"
                >
                  <Zap className="size-3.5" /> Upgrade
                </Button>
                <button
                  onClick={() => setShowLimitBanner(false)}
                  className="text-amber-400/60 hover:text-amber-400"
                >
                  <X className="size-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <EmptyState onPick={(p) => send(p)} />
          ) : (
            <div className="mx-auto max-w-3xl px-4 py-6">
              {messages.map((m, i) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  streaming={streaming && i === messages.length - 1}
                  studioConnected={studio.isConnected}
                  onInsertCode={handleInsertCode}
                />
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 py-3">
            {/* Studio context chip */}
            {studio.isConnected && studio.context && (
              <div className="mb-2 flex items-center gap-2">
                <button
                  onClick={() => setIncludeStudioContext((v) => !v)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition",
                    includeStudioContext
                      ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                  title={
                    includeStudioContext
                      ? "Including this script as context — click to exclude"
                      : "Not including this script — click to include"
                  }
                >
                  <FileCode2 className="size-3.5" />
                  <span className="max-w-[200px] truncate font-medium">
                    {studio.context.scriptName}
                  </span>
                  <span className="font-mono text-[10px] opacity-70">
                    {studio.context.lineCount}L
                  </span>
                  {includeStudioContext ? (
                    <Check className="size-3 text-violet-400" />
                  ) : (
                    <Plus className="size-3" />
                  )}
                </button>
                <span className="text-[10px] text-muted-foreground">
                  {includeStudioContext ? "Shared as context" : "Click to share"}
                </span>
              </div>
            )}
            <div
              className="relative rounded-2xl border border-border bg-card focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/20"
              onPaste={handleImagePaste}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleImageSelect(file);
              }}
            >
              {/* Image preview */}
              {attachedImage && (
                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                  <img
                    src={attachedImage}
                    alt="Reference"
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium">Reference image attached</p>
                    <p className="text-[11px] text-muted-foreground">
                      AI will analyze this and recreate it in Roblox
                    </p>
                  </div>
                  <button
                    onClick={() => setAttachedImage(null)}
                    className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={
                  attachedImage
                    ? "Describe what to build from the image…"
                    : "Ask BloxForge to build, fix, or explain Luau…"
                }
                className="min-h-[56px] max-h-[200px] resize-none border-0 bg-transparent px-4 py-3.5 pr-20 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={2}
                disabled={streaming}
              />
              {/* Image upload button */}
              <label className="absolute bottom-3 right-14 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageSelect(file);
                    e.target.value = "";
                  }}
                />
                <div className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition hover:bg-white/10 hover:text-foreground">
                  <ImageIcon className="size-4" />
                </div>
              </label>
              <div className="absolute bottom-2.5 right-2.5">
                {streaming ? (
                  <Button
                    size="icon"
                    onClick={stop}
                    className="size-9 rounded-xl bg-destructive text-white hover:bg-destructive/90"
                  >
                    <Loader2 className="size-4 animate-spin" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    onClick={() => send()}
                    disabled={!input.trim()}
                    className="size-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                  >
                    <Send className="size-4" />
                  </Button>
                )}
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              BloxForge AI can make mistakes. Verify generated Luau before
              shipping. Powered by NVIDIA NIM.
            </p>
          </div>
        </div>
      </div>

      <StudioConnectDialog
        open={studioDialogOpen}
        onClose={() => setStudioDialogOpen(false)}
        pairingCode={studio.pairingCode}
        state={studio.state}
        mode={studio.mode}
        connecting={studio.connecting}
        onPair={studio.pair}
        onDisconnect={studio.disconnect}
        onSimulate={studio.simulate}
      />
    </div>
  );
}

function MessageBubble({
  message,
  streaming,
  studioConnected,
  onInsertCode,
}: {
  message: ChatMessage;
  streaming: boolean;
  studioConnected?: boolean;
  onInsertCode?: (code: string, language: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group mb-6"
    >
      <div className="mb-1.5 flex items-center gap-2">
        {isUser ? (
          <div className="flex size-6 items-center justify-center rounded-md bg-secondary text-[11px] font-semibold text-secondary-foreground">
            You
          </div>
        ) : (
          <div className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-400 to-purple-700 text-[11px] font-bold text-slate-950">
            BF
          </div>
        )}
        <span className="text-xs font-medium text-muted-foreground">
          {isUser ? "You" : "BloxForge AI"}
        </span>
        {!isUser && message.personality && (
          <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] capitalize text-violet-400">
            {message.personality}
          </span>
        )}
        {!isUser && message.mode && message.mode !== "normal" && (
          <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] capitalize text-muted-foreground">
            {message.mode}
          </span>
        )}
        {!isUser && message.creditsUsed && (
          <span
            className="flex items-center gap-0.5 rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-400"
            title={message.creditReason || "Credit cost"}
          >
            <Zap className="size-2.5" />
            {message.creditsUsed} credit{message.creditsUsed > 1 ? "s" : ""}
          </span>
        )}
        {!isUser && message.content && (
          <button
            onClick={copy}
            className="ml-auto opacity-0 transition group-hover:opacity-100"
          >
            {copied ? (
              <Check className="size-3.5 text-violet-400" />
            ) : (
              <Copy className="size-3.5 text-muted-foreground hover:text-foreground" />
            )}
          </button>
        )}
      </div>
      <div className={cn("pl-8", isUser && "text-foreground")}>
        {isUser ? (
          <div className="whitespace-pre-wrap rounded-lg bg-secondary/50 px-3.5 py-2.5 text-[14px]">
            {message.content}
          </div>
        ) : message.content ? (
          <Markdown
            content={message.content}
            studioConnected={studioConnected}
            onInsertCode={onInsertCode}
          />
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-3.5 animate-pulse text-violet-400" />
            Forging…
          </div>
        )}
        {/* Plan approval buttons — shown when the message contains a plan */}
        {!isUser && message.content && message.content.includes("## Plan") && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/5 p-3">
            <Check className="size-4 text-violet-400" />
            <span className="flex-1 text-sm text-violet-300">
              Review the plan above, then:
            </span>
            <Button
              size="sm"
              onClick={() => {
                // Send "approve" as the next message
                const input = document.querySelector("textarea") as HTMLTextAreaElement;
                if (input) {
                  input.value = "approve";
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                  setTimeout(() => {
                    const sendBtn = document.querySelector('button[class*="bg-primary"][class*="size-9"]') as HTMLButtonElement;
                    if (sendBtn) sendBtn.click();
                  }, 100);
                }
              }}
              className="gap-1.5 bg-violet-500 text-slate-950 hover:bg-violet-400"
            >
              <Check className="size-3.5" />
              Approve & proceed
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  const [activeTab, setActiveTab] = useState("script");

  const projectTypes = [
    { id: "script", label: "Scripts", icon: Code2 },
    { id: "gui", label: "GUI", icon: Layout },
    { id: "3d", label: "3D Models", icon: Box },
    { id: "animation", label: "Animations", icon: Play },
  ];

  const gameTemplates = [
    { emoji: "🔫", label: "Shooter", prompt: "Create a shooter game with shooting mechanics, health system, and score tracking" },
    { emoji: "🧩", label: "Obby", prompt: "Create an obstacle course (obby) with checkpoints, kill bricks, and a finish line" },
    { emoji: "⚙️", label: "Simulator", prompt: "Create a simulator game with clicking mechanics, upgrades, and stats" },
    { emoji: "🏭", label: "Tycoon", prompt: "Create a tycoon game with droppers, upgraders, and money system" },
    { emoji: "🌾", label: "Farm", prompt: "Create a farming game with planting, growing, and harvesting mechanics" },
    { emoji: "🐾", label: "Pets", prompt: "Create a pet collection game with pet hatching, stats, and inventory" },
    { emoji: "🛏️", label: "Bedwars", prompt: "Create a bedwars game with bed protection, resource gathering, and team combat" },
    { emoji: "🔪", label: "Murder Mystery", prompt: "Create a murder mystery game with roles (innocent, sheriff, murderer) and round system" },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 18 }}
        className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-xl shadow-violet-500/30"
      >
        <Sparkles className="size-7 text-white" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl font-bold tracking-tight"
      >
        Build the game only you can imagine
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-1.5 text-sm text-muted-foreground"
      >
        Scripts, GUI, 3D models, animations — powered by NVIDIA Nemotron AI.
      </motion.p>

      {/* Project type tabs */}
      <div className="mt-6 flex gap-1.5 rounded-xl border border-border bg-card p-1">
        {projectTypes.map((pt) => (
          <button
            key={pt.id}
            onClick={() => setActiveTab(pt.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
              activeTab === pt.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <pt.icon className="size-3.5" />
            {pt.label}
          </button>
        ))}
      </div>

      {/* Quick examples for current tab */}
      <div className="mt-4 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {activeTab === "script" && EXAMPLES.map((ex, i) => (
          <motion.button
            key={ex.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            onClick={() => onPick(ex.prompt)}
            className="group flex items-start gap-2.5 rounded-xl border border-border bg-card p-3.5 text-left transition hover:border-violet-500/40 hover:bg-accent/40"
          >
            <ex.icon className="mt-0.5 size-4 shrink-0 text-violet-400" />
            <div>
              <p className="text-sm font-medium">{ex.title}</p>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{ex.prompt}</p>
            </div>
          </motion.button>
        ))}
        {activeTab === "gui" && [
          { title: "Shop UI", prompt: "Create a modern shop GUI with item cards, buy buttons, and a currency display" },
          { title: "Health Bar", prompt: "Create a health bar UI with smooth gradient fill and rounded corners" },
          { title: "Main Menu", prompt: "Create a main menu GUI with Play, Settings, and Quit buttons" },
          { title: "Inventory", prompt: "Create an inventory GUI with a grid layout of item slots" },
        ].map((ex, i) => (
          <motion.button
            key={ex.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            onClick={() => onPick(ex.prompt)}
            className="group flex items-start gap-2.5 rounded-xl border border-border bg-card p-3.5 text-left transition hover:border-violet-500/40 hover:bg-accent/40"
          >
            <Layout className="mt-0.5 size-4 shrink-0 text-violet-400" />
            <div>
              <p className="text-sm font-medium">{ex.title}</p>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{ex.prompt}</p>
            </div>
          </motion.button>
        ))}
        {activeTab === "3d" && [
          { title: "Brick Wall", prompt: "Create a red brick wall part with proper material and surface types" },
          { title: "Tree Model", prompt: "Create a tree model with a brown trunk part and green leaves part, welded together" },
          { title: "Platform", prompt: "Create a circular platform part with neon material and blue color" },
          { title: "House Model", prompt: "Create a simple house model with 4 walls, a floor, and a roof part" },
        ].map((ex, i) => (
          <motion.button
            key={ex.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            onClick={() => onPick(ex.prompt)}
            className="group flex items-start gap-2.5 rounded-xl border border-border bg-card p-3.5 text-left transition hover:border-violet-500/40 hover:bg-accent/40"
          >
            <Box className="mt-0.5 size-4 shrink-0 text-violet-400" />
            <div>
              <p className="text-sm font-medium">{ex.title}</p>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{ex.prompt}</p>
            </div>
          </motion.button>
        ))}
        {activeTab === "animation" && [
          { title: "Door Animation", prompt: "Create a smooth door opening animation using TweenService with CFrame rotation" },
          { title: "Fade In", prompt: "Create a GUI fade-in animation using TweenService on BackgroundTransparency" },
          { title: "Bounce Effect", prompt: "Create a bounce effect on a part using TweenService with Elastic easing" },
          { title: "Walk Cycle", prompt: "Create a procedural walk cycle animation using TweenService on Motor6D joints" },
        ].map((ex, i) => (
          <motion.button
            key={ex.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            onClick={() => onPick(ex.prompt)}
            className="group flex items-start gap-2.5 rounded-xl border border-border bg-card p-3.5 text-left transition hover:border-violet-500/40 hover:bg-accent/40"
          >
            <Play className="mt-0.5 size-4 shrink-0 text-violet-400" />
            <div>
              <p className="text-sm font-medium">{ex.title}</p>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{ex.prompt}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Game templates */}
      <div className="mt-6 w-full">
        <p className="mb-2.5 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Or start with a game template
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {gameTemplates.map((g, i) => (
            <motion.button
              key={g.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.03 }}
              onClick={() => onPick(g.prompt)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium transition hover:border-violet-500/40 hover:bg-accent/40"
            >
              <span>{g.emoji}</span>
              {g.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
