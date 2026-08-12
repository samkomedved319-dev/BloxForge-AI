"use client";

import { motion } from "framer-motion";
import {
  Download,
  Check,
  Copy,
  Terminal,
  Plug,
  RefreshCw,
  FileCode2,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const INSTALL_COMMANDS = {
  windows: "%localappdata%\\Roblox\\Plugins",
  mac: "~/Documents/Roblox/Plugins",
};

const FEATURES = [
  {
    icon: Plug,
    title: "Pure connector",
    desc: "No chat UI inside Studio. The AI chat stays in your browser — the plugin just bridges the two.",
  },
  {
    icon: RefreshCw,
    title: "Live script sync",
    desc: "Select a script in Studio and the web app sees it instantly as context. Toggle sharing with one click.",
  },
  {
    icon: FileCode2,
    title: "One-click insert",
    desc: "Click “Insert in Studio” on any generated code block — a new Script appears in ServerScriptService.",
  },
  {
    icon: ShieldCheck,
    title: "Pair in seconds",
    desc: "Get a 6-character pairing code from the web app, paste it into the plugin, click Connect. Done.",
  },
];

export function PluginPage({
  onBack,
  onLaunch,
}: {
  onBack: () => void;
  onLaunch: () => void;
}) {
  const [os, setOs] = useState<"windows" | "mac">("windows");
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    window.location.href = "/api/plugin/download";
  };

  const copyPath = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMANDS[os]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="bg-radial-brand pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-4 py-16">
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to home
          </button>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="mb-4 gap-2 border-violet-500/30 bg-violet-500/10 text-violet-300"
              >
                <Plug className="size-3" /> v1.0.0 · Free & Open
              </Badge>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
                BloxForge Connector for{" "}
                <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Roblox Studio
                </span>
              </h1>
              <p className="mt-4 text-muted-foreground">
                A lightweight bridge that links your Studio session to the
                BloxForge web app. The AI chat stays in your browser — the
                plugin syncs your selected script and inserts generated Luau
                with one click.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={handleDownload}
                  className="h-12 gap-2 bg-primary px-6 text-primary-foreground hover:bg-primary/90 glow-brand"
                >
                  <Download className="size-4" />
                  Download BloxForgeAI.lua
                </Button>
                <a
                  href="https://create.roblox.com/store/asset/100772789550446/BloxForgeAI"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button
                    size="lg"
                    className="h-12 gap-2 bg-[#00A2FF] px-6 text-white hover:bg-[#0090E0]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 4c1.5 0 2.5 1 2.5 2.5S13.5 11 12 11s-2.5-1-2.5-2.5S10.5 6 12 6zm0 12c-2 0-3.8-1-5-2.5.1-1.5 3-2.5 5-2.5s4.9 1 5 2.5C15.8 17 14 18 12 18z" />
                    </svg>
                    Get from Roblox Store
                  </Button>
                </a>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onLaunch}
                  className="h-12 gap-2 border-border bg-card/50 hover:bg-accent"
                >
                  <Terminal className="size-4" />
                  Try the web app
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                {["~24 KB", "Zero dependencies", "MIT licensed", "HttpService"].map(
                  (t) => (
                    <span key={t} className="flex items-center gap-1.5">
                      <Check className="size-3.5 text-violet-400" />
                      {t}
                    </span>
                  ),
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Card className="overflow-hidden border-border/60 bg-[oklch(0.14_0.012_250)] shadow-2xl">
                <div className="flex items-center gap-2 border-b border-border/60 bg-[oklch(0.17_0.012_250)] px-3 py-2">
                  <Logo size={22} />
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    Studio Connector
                  </span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  <code>
                    <span className="text-slate-500">{`--[[`}</span>
                    {"\n"}
                    <span className="text-slate-500">{`  BloxForge AI — Studio Connector`}</span>
                    {"\n"}
                    <span className="text-slate-500">{`  A pure bridge to the web app. No chat UI.`}</span>
                    {"\n"}
                    <span className="text-slate-500">{`--]]`}</span>
                    {"\n\n"}
                    <span className="text-violet-400">local</span> Http ={" "}
                    <span className="text-sky-300">game</span>:GetService(
                    <span className="text-violet-300">"HttpService"</span>)
                    {"\n"}
                    <span className="text-violet-400">local</span> Selection ={" "}
                    <span className="text-sky-300">game</span>:GetService(
                    <span className="text-violet-300">"Selection"</span>)
                    {"\n\n"}
                    <span className="text-slate-500">{`-- heartbeat: report selected script +`}</span>
                    {"\n"}
                    <span className="text-slate-500">{`-- receive "insert this code" commands ✨`}</span>
                    {"\n"}
                    <span className="text-violet-400">while</span> connected{" "}
                    <span className="text-violet-400">do</span>
                    {"\n"}
                    {"  "}Http:PostAsync(url, ctx)
                    {"\n"}
                    {"  "}task.wait(3)
                    {"\n"}
                    <span className="text-violet-400">end</span>
                  </code>
                </pre>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="border-border/60 bg-card p-5"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Installation */}
      <section className="border-t border-border/50 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight">
            Install in 60 seconds
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            Two ways to install. No build tools, no dependencies.
          </p>

          {/* Easiest: Roblox Store */}
          <div className="mt-8 rounded-xl border border-[#00A2FF]/30 bg-[#00A2FF]/5 p-5 text-center">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[#00A2FF]">
              Easiest method
            </p>
            <p className="text-sm text-muted-foreground">
              Install directly from the Roblox Creator Store — it auto-installs
              to Studio with one click.
            </p>
            <a
              href="https://create.roblox.com/store/asset/100772789550446/BloxForgeAI"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#00A2FF] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0090E0]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 4c1.5 0 2.5 1 2.5 2.5S13.5 11 12 11s-2.5-1-2.5-2.5S10.5 6 12 6zm0 12c-2 0-3.8-1-5-2.5.1-1.5 3-2.5 5-2.5s4.9 1 5 2.5C15.8 17 14 18 12 18z" />
              </svg>
              Install from Roblox Store
            </a>
          </div>

          {/* Manual install */}
          <div className="mt-6">
            <p className="mb-4 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Or install manually
            </p>
            <div className="space-y-5">
              <InstallStep
                n={1}
                title="Download the connector"
                desc="Save BloxForgeAI.lua from the button above."
              />
              <InstallStep
                n={2}
                title="Move it to your Studio Plugins folder"
                desc="Pick your OS and copy the path below."
            >
              <div className="mt-3 rounded-xl border border-border bg-card p-3">
                <div className="mb-2 flex gap-2">
                  {(["windows", "mac"] as const).map((o) => (
                    <button
                      key={o}
                      onClick={() => setOs(o)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                        os === o
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {o === "windows" ? "Windows" : "macOS"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-2">
                  <code className="overflow-x-auto font-mono text-xs text-violet-300">
                    {INSTALL_COMMANDS[os]}
                  </code>
                  <button
                    onClick={copyPath}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    {copied ? (
                      <Check className="size-4 text-violet-400" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </InstallStep>
            <InstallStep
              n={3}
              title="Pair with the web app"
              desc="In the web app, click “Connect Studio” and copy the server URL + pairing code. In the Studio plugin, paste both and click Connect. The AI chat stays in your browser — the plugin just syncs your selected script and inserts generated code."
            />
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-sm font-semibold text-amber-300">
              ⚠ Important: the server URL must be HTTPS
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Roblox HttpService blocks plain HTTP (except to localhost from
              Studio on the same machine). Use the HTTPS URL of your deployed
              BloxForge app. The web app’s “Connect Studio” dialog shows the
              exact URL to copy. If the plugin can’t connect, check the Studio
              Output window for{" "}
              <code className="rounded bg-white/10 px-1 font-mono">
                [BloxForge Connector]
              </code>{" "}
              messages.
            </p>
          </div>

          <div className="mt-10 rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-violet-400" />
              <div className="text-sm">
                <p className="font-semibold">Deploying your own server?</p>
                <p className="mt-1 text-muted-foreground">
                  The plugin talks to a BloxForge web app endpoint (
                  <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs text-violet-300">
                    /api/plugin/ask
                  </code>
                  ) which forwards requests to NVIDIA NIM. Run this Next.js app
                  anywhere, set <code className="font-mono text-xs">NVIDIA_API_KEY</code>, and point the plugin at it.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={handleDownload}
                className="h-12 gap-2 bg-primary px-8 text-primary-foreground hover:bg-primary/90"
              >
                <Download className="size-4" />
                Download BloxForgeAI.lua
              </Button>
              <a
                href="https://create.roblox.com/store/asset/100772789550446/BloxForgeAI"
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  size="lg"
                  className="h-12 gap-2 bg-[#00A2FF] px-6 text-white hover:bg-[#0090E0]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 4c1.5 0 2.5 1 2.5 2.5S13.5 11 12 11s-2.5-1-2.5-2.5S10.5 6 12 6zm0 12c-2 0-3.8-1-5-2.5.1-1.5 3-2.5 5-2.5s4.9 1 5 2.5C15.8 17 14 18 12 18z" />
                  </svg>
                  Get from Roblox Store
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InstallStep({
  n,
  title,
  desc,
  children,
}: {
  n: number;
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 font-display text-lg font-bold text-violet-400">
        {n}
      </div>
      <div className="flex-1 pb-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
        {children}
      </div>
    </div>
  );
}
