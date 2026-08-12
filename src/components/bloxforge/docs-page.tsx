"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  Rocket,
  Box,
  Plug,
  Shield,
  Database,
  Key,
  Cpu,
  Code2,
  HelpCircle,
  FileText,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DocId =
  | "intro"
  | "getting-started"
  | "web-app"
  | "plugin"
  | "connector"
  | "roblox-auth"
  | "admin"
  | "api-keys"
  | "api-reference"
  | "privacy"
  | "tos"
  | "faq";

interface DocSection {
  id: DocId;
  title: string;
  icon: any;
  category: string;
}

const SECTIONS: DocSection[] = [
  { id: "intro", title: "Introduction", icon: BookOpen, category: "Overview" },
  { id: "getting-started", title: "Getting Started", icon: Rocket, category: "Overview" },
  { id: "faq", title: "FAQ", icon: HelpCircle, category: "Overview" },

  { id: "web-app", title: "Web App Guide", icon: Code2, category: "Using BloxForge" },
  { id: "plugin", title: "Studio Plugin", icon: Box, category: "Using BloxForge" },
  { id: "connector", title: "Studio Connector", icon: Plug, category: "Using BloxForge" },

  { id: "roblox-auth", title: "Roblox Authentication", icon: Shield, category: "Setup" },
  { id: "api-keys", title: "Custom API Keys", icon: Key, category: "Setup" },
  { id: "admin", title: "Admin Dashboard", icon: Database, category: "Setup" },

  { id: "api-reference", title: "API Reference", icon: Cpu, category: "Reference" },
  { id: "privacy", title: "Privacy Policy", icon: Lock, category: "Reference" },
  { id: "tos", title: "Terms of Service", icon: FileText, category: "Reference" },
];

export function DocsPage() {
  const [active, setActive] = useState<DocId>("intro");
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return SECTIONS;
    const q = query.toLowerCase();
    return SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  }, [query]);

  const categories = useMemo(() => {
    const map = new Map<string, DocSection[]>();
    for (const s of filtered) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const activeSection = SECTIONS.find((s) => s.id === active)!;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ top: "3.5rem" }}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold">Documentation</span>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search docs…"
                className="h-9 pl-9 text-sm"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            {categories.map(([cat, items]) => (
              <div key={cat} className="mb-4">
                <p className="mb-1.5 px-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {cat}
                </p>
                <div className="space-y-0.5">
                  {items.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActive(s.id);
                        setSidebarOpen(false);
                        window.scrollTo({ top: 0 });
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition",
                        active === s.id
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                      )}
                    >
                      <s.icon className="size-4 shrink-0" />
                      <span className="flex-1">{s.title}</span>
                      {active === s.id && (
                        <ChevronRight className="size-3.5 text-violet-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-border p-3">
            <button
              onClick={() => (window.location.hash = "")}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to home
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          style={{ top: "3.5rem" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
          <span className="font-display font-bold">{activeSection.title}</span>
        </div>

        <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <activeSection.icon className="size-5" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {activeSection.category}
                </p>
                <h1 className="font-display text-2xl font-extrabold tracking-tight">
                  {activeSection.title}
                </h1>
              </div>
            </div>

            <DocContent id={active} />

            {/* Prev/Next nav */}
            <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
              {(() => {
                const idx = SECTIONS.findIndex((s) => s.id === active);
                const prev = idx > 0 ? SECTIONS[idx - 1] : null;
                const next = idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : null;
                return (
                  <>
                    {prev ? (
                      <button
                        onClick={() => {
                          setActive(prev.id);
                          window.scrollTo({ top: 0 });
                        }}
                        className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                      >
                        <ChevronRight className="size-4 rotate-180" />
                        <span>
                          <span className="block text-[10px] uppercase">Previous</span>
                          {prev.title}
                        </span>
                      </button>
                    ) : (
                      <span />
                    )}
                    {next ? (
                      <button
                        onClick={() => {
                          setActive(next.id);
                          window.scrollTo({ top: 0 });
                        }}
                        className="flex items-center gap-2 text-right text-sm text-muted-foreground transition hover:text-foreground"
                      >
                        <span>
                          <span className="block text-[10px] uppercase">Next</span>
                          {next.title}
                        </span>
                        <ChevronRight className="size-4" />
                      </button>
                    ) : (
                      <span />
                    )}
                  </>
                );
              })()}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function DocContent({ id }: { id: DocId }) {
  switch (id) {
    case "intro":
      return <IntroDoc />;
    case "getting-started":
      return <GettingStartedDoc />;
    case "web-app":
      return <WebAppDoc />;
    case "plugin":
      return <PluginDoc />;
    case "connector":
      return <ConnectorDoc />;
    case "roblox-auth":
      return <RobloxAuthDoc />;
    case "admin":
      return <AdminDoc />;
    case "api-keys":
      return <ApiKeysDoc />;
    case "api-reference":
      return <ApiReferenceDoc />;
    case "privacy":
      return <PrivacyDoc />;
    case "tos":
      return <TosDoc />;
    case "faq":
      return <FaqDoc />;
    default:
      return null;
  }
}

/* ─── Shared doc components ─── */

function P({ children }: { children: React.ReactNode }) {
  return <p className="my-3 text-[14px] leading-relaxed text-foreground/90">{children}</p>;
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-8 mb-3 font-display text-xl font-bold tracking-tight">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 mb-2 font-display text-base font-semibold">{children}</h3>
  );
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="my-3 list-disc space-y-1.5 pl-5 text-[14px] text-foreground/90">{children}</ul>;
}

function OL({ children }: { children: React.ReactNode }) {
  return <ol className="my-3 list-decimal space-y-1.5 pl-5 text-[14px] text-foreground/90">{children}</ol>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12.5px] text-violet-300">
      {children}
    </code>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="my-4 overflow-x-auto rounded-xl border border-border bg-[oklch(0.14_0.012_250)] p-4 text-[12.5px] leading-relaxed">
      <code className="font-mono text-foreground/90">{children}</code>
    </pre>
  );
}

function Callout({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "warn" | "tip";
  title: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-violet-500/30 bg-violet-500/5 text-violet-200",
    warn: "border-amber-500/30 bg-amber-500/5 text-amber-200",
    tip: "border-violet-500/30 bg-violet-500/5 text-violet-200",
  };
  return (
    <div className={cn("my-4 rounded-lg border p-4", styles[type])}>
      <p className="mb-1 font-semibold">{title}</p>
      <div className="text-sm opacity-90">{children}</div>
    </div>
  );
}

/* ─── Doc sections ─── */

function IntroDoc() {
  return (
    <div>
      <P>
        <b>BloxForge AI</b> is an NVIDIA-powered AI coding companion for Roblox
        developers. It generates, debugs, and refactors Luau code using frontier
        language models — and ships with a free Roblox Studio connector plugin
        that drops generated code straight into your game.
      </P>

      <P>
        This documentation covers everything you need to set up, use, and
        administer BloxForge AI — from installing the Studio plugin to
        configuring Roblox OAuth2 and managing custom API keys.
      </P>

      <H2>What's included</H2>
      <UL>
        <li><b>Web app</b> — a full chat interface with streaming AI responses, saved conversations, 5 AI personalities, and 5 response modes.</li>
        <li><b>Roblox Studio plugin</b> — a lightweight connector that syncs your selected script as context and inserts generated code with one click.</li>
        <li><b>Admin dashboard</b> — manage users, approve beta access, add custom AI API keys, and view platform stats.</li>
        <li><b>Roblox OAuth2</b> — secure sign-in using Roblox's official app-permissions flow.</li>
        <li><b>Beta mode</b> — new users require admin approval before they can chat.</li>
      </UL>

      <H2>Who is this for?</H2>
      <UL>
        <li><b>Roblox developers</b> who want AI help writing Luau, debugging remote events, and refactoring to OOP.</li>
        <li><b>Server admins</b> deploying BloxForge for their team or community.</li>
        <li><b>Self-hosters</b> running the app on their own infrastructure with their own NVIDIA API key.</li>
      </UL>

      <Callout type="tip" title="Quick start">
        New here? Read <b>Getting Started</b> next — it covers signing in with
        Roblox, your first AI chat, and installing the Studio plugin in under 5
        minutes.
      </Callout>
    </div>
  );
}

function GettingStartedDoc() {
  return (
    <div>
      <H2>1. Sign in with Roblox</H2>
      <P>
        BloxForge uses Roblox OAuth2 for authentication. Click <Code>Sign in</Code>{" "}
        in the top-right, then <Code>Continue with Roblox</Code>. You'll be
        redirected to Roblox to approve access — BloxForge only sees your
        username and user ID, never your password.
      </P>
      <Callout type="warn" title="Beta access">
        BloxForge is in closed beta. After signing in, your account needs admin
        approval before you can chat. An admin will see your pending request in
        the admin dashboard and can approve it with one click.
      </Callout>

      <H2>2. Pick a personality & mode</H2>
      <P>
        Once approved, launch the app. In the chat header you'll see two
        dropdowns:
      </P>
      <UL>
        <li><b>MODEL</b> — choose an AI personality: <Code>Swift</Code> (fast code gen), <Code>Thoughtful</Code> (deep reasoning), <Code>Balanced</Code>, <Code>Flagship</Code> (405B), or <Code>Nemotron</Code>.</li>
        <li><b>MODE</b> — choose a response style: <Code>Normal</Code>, <Code>Concise</Code>, <Code>Explain</Code>, <Code>Refactor</Code>, or <Code>Debug</Code>.</li>
      </UL>

      <H2>3. Send your first message</H2>
      <P>
        Type a request in the composer (e.g. "Create a cooldown ModuleScript")
        and press Enter. The AI streams its response in real-time. Code blocks
        have copy buttons.
      </P>

      <H2>4. Install the Studio plugin (optional)</H2>
      <P>
        To insert generated code directly into Roblox Studio:
      </P>
      <OL>
        <li>Go to the <button onClick={() => (window.location.hash = "plugin")} className="text-violet-400 hover:underline">Plugin page</button> and download <Code>BloxForgeAI.lua</Code>.</li>
        <li>Move it to your Studio Plugins folder (Windows: <Code>%localappdata%\Roblox\Plugins</Code>, macOS: <Code>~/Documents/Roblox/Plugins</Code>).</li>
        <li>Restart Roblox Studio.</li>
        <li>In the web app, click <Code>Connect Studio</Code> to get a pairing code.</li>
        <li>In Studio, open the BloxForge toolbar button, paste your server URL + pairing code, and click Connect.</li>
      </OL>

      <H2>5. Insert code into Studio</H2>
      <P>
        When Studio is connected, every Luau code block in the AI's response
        gets an <Code>Insert in Studio</Code> button. Click it, choose the
        instance type (ModuleScript, Script, LocalScript, Part, Model), and the
        code appears in Studio within seconds.
      </P>
    </div>
  );
}

function WebAppDoc() {
  return (
    <div>
      <H2>Overview</H2>
      <P>
        The web app is the primary interface for chatting with BloxForge AI.
        It runs in any modern browser and requires no installation.
      </P>

      <H2>Chat interface</H2>
      <H3>Personalities (MODEL dropdown)</H3>
      <P>
        Each personality maps to a real NVIDIA NIM model:
      </P>
      <UL>
        <li><b>Swift</b> → Qwen2.5 Coder 32B — fast, accurate Luau generation (recommended)</li>
        <li><b>Thoughtful</b> → DeepSeek R1 — deep reasoning for architecture & hard problems</li>
        <li><b>Balanced</b> → Llama 3.3 70B — all-rounder for docs, ideas & code</li>
        <li><b>Flagship</b> → Llama 3.1 405B — frontier-scale, maximum capability</li>
        <li><b>Nemotron</b> → NVIDIA Nemotron 70B — NVIDIA-tuned for natural design</li>
      </UL>

      <H3>Response modes (MODE dropdown)</H3>
      <UL>
        <li><b>Normal</b> — balanced answers with code and explanation</li>
        <li><b>Concise</b> — short, code-first answers, minimal prose</li>
        <li><b>Explain</b> — teaching mode, walks through the why step by step</li>
        <li><b>Refactor</b> — improves existing code structure, preserves behavior</li>
        <li><b>Debug</b> — diagnoses issues and ships the fix</li>
      </UL>

      <H2>Saved sessions</H2>
      <P>
        Every conversation is automatically saved. Click <Code>New Forge
        Session</Code> to start fresh, or click any session in the sidebar to
        resume it. Sessions are scoped to your account.
      </P>

      <H2>Usage limits</H2>
      <P>
        Free accounts get 50 AI messages per day. Pro and Studio plans are
        unlimited. Admins can grant bonus credits to any user from the admin
        dashboard.
      </P>

      <H2>Studio context</H2>
      <P>
        When the Studio connector is active, a context chip appears near the
        composer showing the currently-selected script. Toggle it to include or
        exclude the script's source as context for the AI.
      </P>
    </div>
  );
}

function PluginDoc() {
  return (
    <div>
      <H2>Overview</H2>
      <P>
        The BloxForge Studio plugin is a <b>pure connector</b> — no chat UI
        inside Studio. It does two things: reports your selected script to the
        web app as context, and receives "insert this code" commands that create
        instances in your game.
      </P>

      <H2>Installation</H2>
      <OL>
        <li>Download <Code>BloxForgeAI.lua</Code> from the <button onClick={() => (window.location.hash = "plugin")} className="text-violet-400 hover:underline">Plugin page</button>.</li>
        <li>Move the file to your Studio Plugins folder:
          <UL>
            <li><b>Windows:</b> <Code>%localappdata%\Roblox\Plugins</Code></li>
            <li><b>macOS:</b> <Code>~/Documents/Roblox/Plugins</Code></li>
          </UL>
        </li>
        <li>Restart Roblox Studio.</li>
        <li>Look for the <b>BloxForge Connector</b> button in the Plugins toolbar.</li>
      </OL>

      <H2>Connecting</H2>
      <OL>
        <li>In the web app, click <Code>Connect Studio</Code> in the chat header.</li>
        <li>Copy the pairing code (e.g. <Code>ABC-123</Code>) and the server URL.</li>
        <li>In Studio, open the BloxForge toolbar button.</li>
        <li>Paste the server URL and pairing code into the plugin.</li>
        <li>Click <Code>Connect</Code>.</li>
      </OL>

      <Callout type="info" title="HTTPS required">
        Roblox HttpService requires HTTPS. Localhost (<Code>http://…</Code>) only
        works from Studio on the same machine running the dev server. For
        production, deploy the app with a valid SSL certificate.
      </Callout>

      <H2>Test insert</H2>
      <P>
        Once connected, click <Code>Test insert</Code> in the plugin to verify
        it can create instances. This creates a sample ModuleScript in
        ServerScriptService — if it appears, the plugin is working correctly.
      </P>

      <H2>How it works</H2>
      <P>
        The plugin sends a heartbeat every 3 seconds with your selected
        script's source. When you click <Code>Insert in Studio</Code> on the web
        app, the insert command is queued. The next heartbeat drains it and
        creates the instance (Script, LocalScript, ModuleScript, Part, or
        Model) with the AI-derived name in the correct service.
      </P>
    </div>
  );
}

function ConnectorDoc() {
  return (
    <div>
      <H2>Architecture</H2>
      <P>
        The connector is a lightweight bridge between Roblox Studio and the
        BloxForge web app. The AI chat lives in the browser; the plugin just
        syncs context and inserts code.
      </P>

      <Pre>{`┌─────────────────┐     heartbeat      ┌──────────────────┐
│  Roblox Studio  │ ──────────────────▶ │  BloxForge Server │
│  (plugin)       │ ◀────────────────── │  (in-memory store) │
│                 │   insert commands   │                    │
└─────────────────┘                     └────────┬───────────┘
                                                 │ poll (2s)
                                                 ▼
                                        ┌──────────────────┐
                                        │  Web app (browser)│
                                        │  - AI chat        │
                                        │  - pairing dialog │
                                        │  - insert button  │
                                        └──────────────────┘`}</Pre>

      <H2>Pairing flow</H2>
      <OL>
        <li>Web app requests a pairing code via <Code>POST /api/studio/pair</Code>.</li>
        <li>Plugin sends heartbeats to <Code>POST /api/studio/heartbeat</Code> with the code + selected script context.</li>
        <li>Web app polls <Code>GET /api/studio/state?code=…</Code> every 2 seconds to detect the connection.</li>
        <li>Once connected, the web app shows a green badge and the context chip.</li>
      </OL>

      <H2>Insert flow</H2>
      <OL>
        <li>User clicks "Insert in Studio" on a code block.</li>
        <li>Web app calls <Code>POST /api/studio/insert</Code> with the code + instance type + name + parent.</li>
        <li>Server queues the command in the session's pending inserts.</li>
        <li>Plugin's next heartbeat drains the command and creates the instance.</li>
        <li>Plugin acks the result via <Code>POST /api/studio/ack</Code>.</li>
      </OL>

      <H2>Demo mode</H2>
      <P>
        If you can't run Roblox Studio (e.g. in a sandbox), click <Code>Try
        without Studio (demo)</Code> in the pairing dialog. This simulates the
        plugin from the browser so you can test the full insert flow. Demo mode
        is clearly labeled with an amber badge.
      </P>
    </div>
  );
}

function RobloxAuthDoc() {
  const appOrigin = typeof window !== "undefined" ? window.location.origin : "https://your-app.com";
  return (
    <div>
      <H2>Overview</H2>
      <P>
        BloxForge uses Roblox's official OAuth2 (OpenID Connect) flow for secure
        authentication. Users sign in by approving BloxForge in Roblox's own
        consent screen — no passwords are ever shared.
      </P>

      <H2>Setup guide</H2>
      <P>
        A full copy-paste setup guide is available at{" "}
        <button
          onClick={() => (window.location.hash = "oauth-setup")}
          className="text-violet-400 hover:underline"
        >
          #oauth-setup
        </button>
        . Here's the summary:
      </P>

      <H3>1. Register an OAuth2 app</H3>
      <OL>
        <li>Go to <a href="https://create.roblox.com/credentials" target="_blank" rel="noreferrer" className="text-violet-400 hover:underline">create.roblox.com/credentials</a>.</li>
        <li>Set the Application Name to <Code>BloxForge AI</Code>.</li>
        <li>Set the Entry Link to <Code>{appOrigin}</Code>.</li>
        <li>Set the Privacy Policy URL to <Code>{appOrigin}/#privacy</Code>.</li>
        <li>Set the Terms of Service URL to <Code>{appOrigin}/#tos</Code>.</li>
        <li>Set the Redirect URL to <Code>{appOrigin}/api/auth/roblox/oauth/callback</Code>.</li>
        <li>Select scopes: <Code>openid</Code> and <Code>profile</Code>.</li>
      </OL>

      <H3>2. Set environment variables</H3>
      <Pre>{`ROBLOX_CLIENT_ID=your_client_id
ROBLOX_CLIENT_SECRET=your_client_secret
ROBLOX_REDIRECT_URI=${appOrigin}/api/auth/roblox/oauth/callback`}</Pre>

      <H3>3. Restart the server</H3>
      <P>
        The auth modal will now show a blue <Code>Continue with Roblox</Code>{" "}
        button. When not configured, it gracefully falls back to manual
        profile-code verification.
      </P>

      <H2>Auto-promote admins</H2>
      <P>
        To make a Roblox user an admin automatically on sign-in, add their
        Roblox user ID to <Code>ADMIN_ROBLOX_IDS</Code>:
      </P>
      <Pre>{`ADMIN_ROBLOX_IDS=123456789,987654321`}</Pre>
      <P>
        These users are promoted to <Code>admin</Code> role, set to the{" "}
        <Code>studio</Code> plan, and auto-approved (bypassing beta wait).
      </P>

      <Callout type="warn" title="Redirect URL must match exactly">
        The Redirect URL in the Roblox form must <b>exactly match</b> the{" "}
        <Code>ROBLOX_REDIRECT_URI</Code> env var. Any difference (trailing
        slash, path) will cause an "invalid redirect_uri" error.
      </Callout>

      <H2>Manual fallback</H2>
      <P>
        If OAuth isn't configured, users can still sign in by entering their
        Roblox username. BloxForge generates a one-time code (e.g.{" "}
        <Code>BF-ABCD1234</Code>) that the user adds to their Roblox profile
        description. The verify endpoint checks for the code, then creates the
        account. This is less convenient but works without any OAuth setup.
      </P>
    </div>
  );
}

function AdminDoc() {
  return (
    <div>
      <H2>Overview</H2>
      <P>
        The admin dashboard (<Code>#admin</Code>) is available to users with
        the <Code>admin</Code> role. It has three tabs: Overview, Users, and
        API Keys.
      </P>

      <H2>Accessing the dashboard</H2>
      <P>
        Admins see an <Code>Admin Dashboard</Code> link in their account menu
        (click your avatar). You can also navigate to{" "}
        <Code>#admin</Code> directly.
      </P>

      <H2>Overview tab</H2>
      <P>
        Shows platform stats: total users, messages today, conversations, active
        API keys, and plan breakdown. If Roblox OAuth isn't configured, an amber
        setup banner appears with a link to the OAuth setup guide.
      </P>

      <H2>Users tab</H2>
      <H3>Beta approval</H3>
      <P>
        New Roblox-auth users start as <Code>approved: false</Code> (pending).
        The Users tab shows a "X pending approval" banner with a "Show only
        pending" filter. Click <Code>Approve</Code> to let a user chat, or{" "}
        <Code>Revoke</Code> to block them.
      </P>

      <H3>Managing users</H3>
      <UL>
        <li><b>Change plan</b> — upgrade Free → Pro → Studio via the dropdown.</li>
        <li><b>Grant credits</b> — add bonus daily messages on top of the plan limit.</li>
        <li><b>Reset usage</b> — clears today's message count.</li>
        <li><b>Delete user</b> — permanently removes the account + conversations. Admin accounts are protected.</li>
      </UL>

      <H2>API Keys tab</H2>
      <P>
        Add custom OpenAI-compatible API keys (NVIDIA NIM, OpenAI, OpenRouter,
        Groq, Together, etc.). See{" "}
        <button onClick={() => (window.location.hash = "api-keys")} className="text-violet-400 hover:underline">
          Custom API Keys
        </button>{" "}
        for details.
      </P>

      <H2>Admin sign-in</H2>
      <P>
        Admin accounts can sign in via two methods:
      </P>
      <UL>
        <li><b>Roblox OAuth2</b> — if their Roblox user ID is in <Code>ADMIN_ROBLOX_IDS</Code>.</li>
        <li><b>Email + password</b> — via the "Admin sign in →" link in the auth modal. Only works for accounts with <Code>role: admin</Code>.</li>
      </UL>
      <P>
        To create the initial admin account, run:
      </P>
      <Pre>{`bun run scripts/seed-admin.ts`}</Pre>
      <P>
        Configure the admin email/password via <Code>ADMIN_EMAIL</Code> and{" "}
        <Code>ADMIN_PASSWORD</Code> env vars (defaults are in the script).
      </P>
    </div>
  );
}

function ApiKeysDoc() {
  return (
    <div>
      <H2>Overview</H2>
      <P>
        BloxForge supports any OpenAI-compatible API provider. Admins can add
        custom API keys in the admin dashboard → API Keys tab. The
        highest-priority active key is used for all AI requests.
      </P>

      <H2>Adding a key</H2>
      <OL>
        <li>Go to <Code>#admin</Code> → API Keys tab.</li>
        <li>Fill in the form: Label, Provider, Base URL, API Key, Priority.</li>
        <li>Click <Code>Fetch available models</Code> to see what models the provider offers.</li>
        <li>Select a model from the dropdown (or type a model ID manually).</li>
        <li>Click <Code>Add key</Code>.</li>
      </OL>

      <H2>Supported providers</H2>
      <UL>
        <li><b>NVIDIA NIM</b> — <Code>https://integrate.api.nvidia.com/v1</Code></li>
        <li><b>OpenAI</b> — <Code>https://api.openai.com/v1</Code></li>
        <li><b>OpenRouter</b> — <Code>https://openrouter.ai/api/v1</Code></li>
        <li><b>Groq</b> — <Code>https://api.groq.com/openai/v1</Code></li>
        <li><b>Together AI</b> — <Code>https://api.together.xyz/v1</Code></li>
        <li>Any other OpenAI-compatible endpoint.</li>
      </UL>

      <H2>Priority order</H2>
      <P>
        Keys are used in priority order (highest first). If the top-priority key
        fails, the next one is tried. If no custom keys are active, the app
        falls back to the <Code>NVIDIA_API_KEY</Code> env var, then to the
        built-in demo engine.
      </P>

      <Callout type="tip" title="Model override">
        When you select a model on an API key, all AI requests use that model
        regardless of which personality the user picks. Leave it blank to let
        each personality use its default model.
      </Callout>

      <H2>Security</H2>
      <P>
        API keys are stored in the database. In the admin UI, keys are masked
        (e.g. <Code>nvapi-••••••cdef</Code>). Keys are never exposed to the
        client — all AI requests go through the server.
      </P>
    </div>
  );
}

function ApiReferenceDoc() {
  return (
    <div>
      <H2>AI chat</H2>
      <H3>POST /api/chat</H3>
      <P>Stream a chat completion as Server-Sent Events.</P>
      <Pre>{`POST /api/chat
Content-Type: application/json

{
  "message": "Create a cooldown module",
  "personality": "swift",
  "mode": "normal",
  "history": [{ "role": "user", "content": "..." }],
  "conversationId": "optional-existing-id",
  "context": "optional studio script source"
}`}</Pre>
      <P>Returns <Code>text/event-stream</Code> with delta events.</P>

      <H2>Studio connector</H2>
      <H3>POST /api/studio/pair</H3>
      <P>Returns <Code>{`{ "ok": true, "code": "ABC-123" }`}</Code>.</P>

      <H3>POST /api/studio/heartbeat</H3>
      <Pre>{`{ "code": "ABC-123", "context": { "scriptName": "...", "scriptPath": "...", "source": "...", "lineCount": 42, "updatedAt": 123 } }`}</Pre>
      <P>Returns pending insert commands.</P>

      <H3>POST /api/studio/insert</H3>
      <Pre>{`{ "pairingCode": "ABC-123", "title": "Cooldown", "language": "luau", "code": "...", "instanceType": "ModuleScript", "instanceName": "CooldownSystem", "parent": "ServerScriptService" }`}</Pre>

      <H3>GET /api/studio/state?code=ABC-123</H3>
      <P>Returns connection state + context + insert results.</P>

      <H2>Roblox auth</H2>
      <H3>GET /api/auth/roblox/oauth/start</H3>
      <P>Redirects to Roblox authorize endpoint.</P>

      <H3>GET /api/auth/roblox/oauth/callback</H3>
      <P>OAuth callback — exchanges code, fetches userinfo, redirects with token.</P>

      <H3>POST /api/auth/roblox/start</H3>
      <P>Manual fallback: looks up Roblox user, generates verification code.</P>

      <H3>POST /api/auth/roblox/verify</H3>
      <P>Manual fallback: checks Roblox profile for code, creates account.</P>

      <H2>Admin</H2>
      <H3>GET /api/admin/stats</H3>
      <P>Platform statistics (admin only).</P>

      <H3>GET /api/admin/users</H3>
      <P>List all users (admin only).</P>

      <H3>PATCH /api/admin/users/{"{id}"}</H3>
      <P>Update user plan, role, extraCredits, or reset usage.</P>

      <H3>PATCH /api/admin/users/{"{id}"}/approve</H3>
      <Pre>{`{ "approved": true }`}</Pre>

      <H3>POST /api/admin/api-keys / DELETE /api/admin/api-keys/{"{id}"}</H3>
      <P>Manage custom API keys.</P>
    </div>
  );
}

function PrivacyDoc() {
  return (
    <div>
      <P className="text-sm text-muted-foreground">Last updated: July 2025</P>
      <H2>1. Overview</H2>
      <P>
        BloxForge AI operates a web application and Roblox Studio plugin that
        provides AI-powered Luau code generation. This policy explains what data
        we collect and how we use it.
      </P>
      <H2>2. Roblox account data</H2>
      <P>
        We use Roblox OAuth2 with <Code>openid</Code> and <Code>profile</Code>{" "}
        scopes. We receive your Roblox user ID and username only — never your
        password. You can revoke access anytime from your Roblox account
        settings.
      </P>
      <H2>3. Conversations</H2>
      <P>
        Your messages and AI responses are stored so you can revisit sessions.
        Delete any conversation from your dashboard, or delete your account to
        remove everything.
      </P>
      <H2>4. Studio connector</H2>
      <P>
        The plugin sends your selected script's name and source only while
        connected. No other Studio data is transmitted.
      </P>
      <H2>5. AI provider</H2>
      <P>
        Message content is sent to NVIDIA NIM (or a configured custom provider)
        for processing. The provider's privacy policy applies to data they
        process.
      </P>
      <H2>6. Cookies</H2>
      <P>
        We use an HTTP-only session cookie for authentication. No tracking or
        advertising cookies.
      </P>
      <H2>7. Contact</H2>
      <P>
        Questions? Email <a href="mailto:support@bloxforge.ai" className="text-violet-400 hover:underline">support@bloxforge.ai</a>.
      </P>
      <Callout type="info" title="Full policy">
        This is a summary. The full Privacy Policy is at{" "}
        <button onClick={() => (window.location.hash = "privacy")} className="text-violet-400 hover:underline">
          #privacy
        </button>
        .
      </Callout>
    </div>
  );
}

function TosDoc() {
  return (
    <div>
      <P className="text-sm text-muted-foreground">Last updated: July 2025</P>
      <H2>1. Acceptance</H2>
      <P>By using BloxForge AI, you agree to these Terms of Service.</P>
      <H2>2. Beta access</H2>
      <P>
        The service is in beta. Access requires admin approval. The service may
        be modified or discontinued at any time.
      </P>
      <H2>3. Your account</H2>
      <P>
        You must sign in with your own Roblox account. You are responsible for
        all activity under your account.
      </P>
      <H2>4. Generated content</H2>
      <P>
        AI-generated code is provided "as is" without warranty. You are
        responsible for reviewing and testing all generated code before
        shipping.
      </P>
      <H2>5. Contact</H2>
      <P>
        Questions? Email <a href="mailto:support@bloxforge.ai" className="text-violet-400 hover:underline">support@bloxforge.ai</a>.
      </P>
      <Callout type="info" title="Full terms">
        This is a summary. The full Terms of Service is at{" "}
        <button onClick={() => (window.location.hash = "tos")} className="text-violet-400 hover:underline">
          #tos
        </button>
        .
      </Callout>
    </div>
  );
}

function FaqDoc() {
  return (
    <div>
      <H2>General</H2>

      <H3>Is BloxForge free?</H3>
      <P>
        Yes, during beta. Free accounts get 50 messages/day. Pro and Studio
        plans will be available after beta.
      </P>

      <H3>Do I need a Roblox account?</H3>
      <P>
        Yes. BloxForge uses Roblox OAuth2 for authentication. You sign in with
        your Roblox account — no separate password.
      </P>

      <H3>Is BloxForge affiliated with Roblox?</H3>
      <P>
        No. BloxForge is an independent tool. Roblox is a trademark of Roblox
        Corporation.
      </P>

      <H2>AI & models</H2>

      <H3>Which AI models are used?</H3>
      <P>
        BloxForge uses NVIDIA NIM models: Qwen2.5 Coder 32B, DeepSeek R1,
        Nemotron 70B, Llama 3.3 70B, and Llama 3.1 405B. Admins can also add
        custom OpenAI-compatible providers.
      </P>

      <H3>Can I use my own API key?</H3>
      <P>
        If you're an admin, yes — add it in the admin dashboard → API Keys tab.
        Regular users use the server's configured key.
      </P>

      <H3>Are my conversations private?</H3>
      <P>
        Your conversations are stored on the server and only visible to you
        (and server admins). Message content is sent to the AI provider for
        processing. You can delete any conversation at any time.
      </P>

      <H2>Studio plugin</H2>

      <H3>Does the plugin work on Mac?</H3>
      <P>
        Yes. The plugin works on both Windows and macOS. The Plugins folder
        location differs (see the Plugin page for paths).
      </P>

      <H3>Why won't it connect?</H3>
      <P>
        Common causes: wrong server URL (must be HTTPS, no trailing slash), the
        server isn't reachable from your machine, or the pairing code expired
        (10-minute timeout). Check Studio's Output window for{" "}
        <Code>[BloxForge Connector]</Code> error messages.
      </P>

      <H3>Why doesn't "Insert in Studio" work?</H3>
      <P>
        Click <Code>Test insert</Code> in the plugin first. If that works, the
        issue is with the web app's insert command. If it fails, the error
        shows in the plugin's insert log.
      </P>

      <H2>Beta</H2>

      <H3>Why can't I chat?</H3>
      <P>
        If you see a "pending beta approval" banner, an admin needs to approve
        your account. Wait for approval or contact an admin.
      </P>

      <H3>How do I become an admin?</H3>
      <P>
        An existing admin must add your Roblox user ID to{" "}
        <Code>ADMIN_ROBLOX_IDS</Code> in the server's environment, or manually
        set your role to <Code>admin</Code> in the database.
      </P>
    </div>
  );
}
