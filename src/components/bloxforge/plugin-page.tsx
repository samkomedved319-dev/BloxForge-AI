"use client";

import { motion } from "framer-motion";
import {
  Download,
  Check,
  Copy,
  Terminal,
  Box,
  Cpu,
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
    icon: Box,
    title: "Studio toolbar widget",
    desc: "A dockable chat panel right next to your Explorer.",
  },
  {
    icon: Cpu,
    title: "All 5 NVIDIA models",
    desc: "Switch between Qwen Coder, DeepSeek R1, Nemotron & Llama.",
  },
  {
    icon: FileCode2,
    title: "One-click insert",
    desc: "Generated Luau drops straight into a new Script in ServerScriptService.",
  },
  {
    icon: ShieldCheck,
    title: "Context-aware",
    desc: "Select a script and the AI sees it — fix in place, no copy-paste.",
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
                className="mb-4 gap-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              >
                <Box className="size-3" /> v1.0.0 · Free & Open
              </Badge>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
                BloxForge AI for{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Roblox Studio
                </span>
              </h1>
              <p className="mt-4 text-muted-foreground">
                A single Luau plugin file that brings NVIDIA-powered AI into
                your Studio workflow. Chat, generate, and insert Luau with one
                click — no leaving Studio.
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
                      <Check className="size-3.5 text-emerald-400" />
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
                    Studio Plugin
                  </span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  <code>
                    <span className="text-slate-500">{`--[[`}</span>
                    {"\n"}
                    <span className="text-slate-500">{`  BloxForge AI — Studio Plugin`}</span>
                    {"\n"}
                    <span className="text-slate-500">{`  NVIDIA-powered Luau companion`}</span>
                    {"\n"}
                    <span className="text-slate-500">{`--]]`}</span>
                    {"\n\n"}
                    <span className="text-violet-400">local</span> Plugin ={" "}
                    <span className="text-sky-300">plugin</span>
                    {"\n"}
                    <span className="text-violet-400">local</span> Http ={" "}
                    <span className="text-sky-300">game</span>:GetService(
                    <span className="text-emerald-300">"HttpService"</span>)
                    {"\n\n"}
                    <span className="text-violet-400">local</span> gui ={" "}
                    Plugin:CreateDockWidgetPluginGui(
                    <span className="text-emerald-300">"BloxForgeAI"</span>, info)
                    {"\n"}
                    <span className="text-slate-500">{`-- ... chat UI, model picker,`}</span>
                    {"\n"}
                    <span className="text-slate-500">{`-- ... one-click code insert ✨`}</span>
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
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
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
            Three steps. No build tools, no dependencies.
          </p>

          <div className="mt-10 space-y-5">
            <InstallStep
              n={1}
              title="Download the plugin"
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
                  <code className="overflow-x-auto font-mono text-xs text-emerald-300">
                    {INSTALL_COMMANDS[os]}
                  </code>
                  <button
                    onClick={copyPath}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    {copied ? (
                      <Check className="size-4 text-emerald-400" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </InstallStep>
            <InstallStep
              n={3}
              title="Restart Studio & connect"
              desc="Open the BloxForge toolbar button, click ⚙, and paste your BloxForge server URL. Enable HttpService if prompted."
            />
          </div>

          <div className="mt-10 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-400" />
              <div className="text-sm">
                <p className="font-semibold">Deploying your own server?</p>
                <p className="mt-1 text-muted-foreground">
                  The plugin talks to a BloxForge web app endpoint (
                  <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs text-emerald-300">
                    /api/plugin/ask
                  </code>
                  ) which forwards requests to NVIDIA NIM. Run this Next.js app
                  anywhere, set <code className="font-mono text-xs">NVIDIA_API_KEY</code>, and point the plugin at it.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              size="lg"
              onClick={handleDownload}
              className="h-12 gap-2 bg-primary px-8 text-primary-foreground hover:bg-primary/90"
            >
              <Download className="size-4" />
              Download BloxForgeAI.lua
            </Button>
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
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 font-display text-lg font-bold text-emerald-400">
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
