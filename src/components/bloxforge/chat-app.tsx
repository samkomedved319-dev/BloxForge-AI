"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  Send,
  Trash2,
  MessageSquare,
  Loader2,
  Sparkles,
  Cpu,
  ChevronDown,
  Menu,
  X,
  Code2,
  Bug,
  BookOpen,
  Wand2,
  Copy,
  Check,
} from "lucide-react";
import { Logo } from "./logo";
import { Markdown } from "./markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Role = "user" | "assistant";
interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  model?: string;
}
interface ConversationSummary {
  id: string;
  title: string;
  model: string;
  updatedAt: string;
  _count: { messages: number };
}
interface AIModel {
  id: string;
  label: string;
  vendor: string;
  tier: string;
  description: string;
  contextWindow: string;
  badge?: string;
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

export function ChatApp({ onExit }: { onExit: () => void }) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);
  const [model, setModel] = useState("qwen/qwen2.5-coder-32b-instruct");
  const [engineLabel, setEngineLabel] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load models
  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((d) => {
        if (d.models) {
          setModels(d.models);
          setModel(d.defaultModel);
        }
        setEngineLabel(
          d.engine === "nvidia"
            ? "NVIDIA NIM"
            : d.engine === "zai-demo"
              ? "Demo Engine"
              : "AI",
        );
      })
      .catch(() => {});
  }, []);

  // Load conversations
  const refreshConversations = useCallback(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

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
        setModel(conv.model);
        setMessages(
          (conv.messages || [])
            .filter((m: { role: string; content: string }) => m.role === "user" || m.role === "assistant")
            .map((m: { id: string; role: Role; content: string; model?: string }) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              model: m.model,
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

      const userMsg: ChatMessage = { id: uid(), role: "user", content };
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: "",
        model,
      };
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            model,
            history,
            conversationId: activeId,
          }),
          signal: controller.signal,
        });

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
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: m.content + evt.delta }
                      : m,
                  ),
                );
              } else if (evt.type === "meta" && evt.conversationId && !activeId) {
                setActiveId(evt.conversationId);
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
    [input, streaming, messages, model, activeId, refreshConversations],
  );

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const activeModel = models.find((m) => m.id === model);

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

        <div className="border-t border-border p-3">
          <button
            onClick={onExit}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
          >
            <Logo size={24} />
          </button>
        </div>
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
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
            <ModelPicker
              models={models}
              value={model}
              onChange={setModel}
              activeModel={activeModel}
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
              {engineLabel}
            </Badge>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <EmptyState onPick={(p) => send(p)} />
          ) : (
            <div className="mx-auto max-w-3xl px-4 py-6">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} streaming={streaming} />
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <div className="relative rounded-2xl border border-border bg-card focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask BloxForge to build, fix, or explain Luau…"
                className="min-h-[56px] max-h-[200px] resize-none border-0 bg-transparent px-4 py-3.5 pr-14 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={2}
                disabled={streaming}
              />
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
    </div>
  );
}

function ModelPicker({
  models,
  value,
  onChange,
  activeModel,
}: {
  models: AIModel[];
  value: string;
  onChange: (v: string) => void;
  activeModel?: AIModel;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[210px] gap-2 border-border bg-card text-sm sm:w-[260px]">
        <Cpu className="size-3.5 text-emerald-400" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="w-[320px]">
        {models.map((m) => (
          <SelectItem key={m.id} value={m.id} className="py-2">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="font-medium">{m.label}</span>
                {m.badge && (
                  <Badge
                    variant="secondary"
                    className="h-4 px-1.5 text-[10px] text-emerald-400"
                  >
                    {m.badge}
                  </Badge>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {m.vendor} · {m.contextWindow}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MessageBubble({
  message,
  streaming,
}: {
  message: ChatMessage;
  streaming: boolean;
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
    <div className="group mb-6">
      <div className="mb-1.5 flex items-center gap-2">
        {isUser ? (
          <div className="flex size-6 items-center justify-center rounded-md bg-secondary text-[11px] font-semibold text-secondary-foreground">
            You
          </div>
        ) : (
          <div className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-teal-600 text-[11px] font-bold text-slate-950">
            BF
          </div>
        )}
        <span className="text-xs font-medium text-muted-foreground">
          {isUser ? "You" : "BloxForge AI"}
        </span>
        {!isUser && message.model && (
          <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {message.model.split("/").pop()}
          </span>
        )}
        {!isUser && message.content && (
          <button
            onClick={copy}
            className="ml-auto opacity-0 transition group-hover:opacity-100"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-400" />
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
          <Markdown content={message.content} />
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-3.5 animate-pulse text-emerald-400" />
            Forging…
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-xl shadow-emerald-500/30">
        <Sparkles className="size-8 text-slate-950" />
      </div>
      <h2 className="font-display text-2xl font-bold tracking-tight">
        What are we forging today?
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Ask anything about Roblox & Luau. Generate scripts, debug remote
        events, refactor to OOP — powered by NVIDIA frontier models.
      </p>
      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.title}
            onClick={() => onPick(ex.prompt)}
            className="group flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4 text-left transition hover:border-emerald-500/40 hover:bg-accent/40"
          >
            <div className="flex items-center gap-2">
              <ex.icon className="size-4 text-emerald-400" />
              <span className="text-sm font-medium">{ex.title}</span>
            </div>
            <span className="line-clamp-2 text-xs text-muted-foreground">
              {ex.prompt}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
