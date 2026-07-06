"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Code2,
  Bug,
  Wand2,
  Cpu,
  Zap,
  Shield,
  GitBranch,
  Download,
  Terminal,
  Box,
  CheckCircle2,
  Rocket,
  Brain,
  Crown,
} from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Counter, Reveal } from "./motion";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Code2,
    title: "Instant Luau Generation",
    desc: "Describe the system you need — BloxForge ships complete, idiomatic ModuleScripts, LocalScripts and Scripts you can drop straight into Studio.",
  },
  {
    icon: Bug,
    title: "Debug & Explain",
    desc: "Paste a stack trace or a misbehaving remote event. Get a root-cause diagnosis plus the fixed code, with the why explained.",
  },
  {
    icon: Wand2,
    title: "Refactor to Patterns",
    desc: "Turn spaghetti into clean OOP with metatables, signals, and type annotations. Modern Luau best-practices baked in.",
  },
  {
    icon: Cpu,
    title: "NVIDIA Frontier Models",
    desc: "Pick from Qwen2.5-Coder 32B, DeepSeek R1, Nemotron 70B, or Llama 3.1 405B — all served via NVIDIA NIM at low latency.",
  },
  {
    icon: Shield,
    title: "Exploit-Aware",
    desc: "Suggestions respect the client/server boundary. Never trust the client — BloxForge flags insecure remote patterns for you.",
  },
  {
    icon: GitBranch,
    title: "Session Memory",
    desc: "Every forge session is saved. Jump back into a conversation, pick up context, and keep iterating across days.",
  },
];

const MODELS = [
  {
    name: "Qwen2.5 Coder 32B",
    vendor: "Alibaba / NVIDIA NIM",
    tag: "Recommended",
    desc: "Purpose-built code model. Best-in-class for Luau scripting.",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    name: "DeepSeek R1",
    vendor: "DeepSeek / NVIDIA NIM",
    tag: "Reasoning",
    desc: "Deep reasoning for complex game-system architecture.",
    accent: "from-violet-400 to-fuchsia-500",
  },
  {
    name: "Nemotron 70B",
    vendor: "NVIDIA",
    tag: "All-rounder",
    desc: "NVIDIA-tuned Llama 3.1 for docs, ideas and design.",
    accent: "from-amber-400 to-orange-500",
  },
  {
    name: "Llama 3.1 405B",
    vendor: "Meta / NVIDIA NIM",
    tag: "Flagship",
    desc: "Frontier-scale model for the hardest generation tasks.",
    accent: "from-cyan-400 to-blue-500",
  },
];

const STEPS = [
  {
    icon: Rocket,
    title: "Launch the Forge",
    desc: "Open the BloxForge AI app right here in your browser. No install required to start chatting.",
  },
  {
    icon: Cpu,
    title: "Pick your model",
    desc: "Choose the NVIDIA NIM model that fits the task — coder for scripts, R1 for reasoning, 405B for the hard stuff.",
  },
  {
    icon: Sparkles,
    title: "Forge & ship",
    desc: "Generate, copy, and paste into Studio — or install the plugin to insert code with one click.",
  },
];

const PLUGIN_STEPS = [
  {
    step: "1",
    title: "Download the plugin",
    desc: "Grab BloxForgeAI.lua — a single self-contained Luau file, no dependencies.",
  },
  {
    step: "2",
    title: "Drop it in your Plugins folder",
    desc: "Windows: %localappdata%\\Roblox\\Plugins · macOS: ~/Documents/Roblox/Plugins",
  },
  {
    step: "3",
    title: "Restart Studio & connect",
    desc: "Open the BloxForge toolbar, click ⚙, and paste your BloxForge server URL. Done.",
  },
];

export function Landing({
  onLaunch,
  onGetPlugin,
  onNavigatePricing,
}: {
  onLaunch: () => void;
  onGetPlugin: () => void;
  onNavigatePricing: () => void;
}) {
  return (
    <main className="flex-1">
      <Hero onLaunch={onLaunch} onGetPlugin={onGetPlugin} />
      <Stats />
      <Models />
      <Features />
      <BetaSection onLaunch={onLaunch} />
      <HowItWorks onLaunch={onLaunch} />
      <PluginSection onGetPlugin={onGetPlugin} onLaunch={onLaunch} />
      <PricingTeaser onNavigatePricing={onNavigatePricing} onLaunch={onLaunch} />
      <CTA onLaunch={onLaunch} />
    </main>
  );
}

function Hero({
  onLaunch,
  onGetPlugin,
}: {
  onLaunch: () => void;
  onGetPlugin: () => void;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-radial-brand pointer-events-none absolute inset-0" />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-24 left-1/4 size-72 rounded-full bg-emerald-500/20 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -top-16 right-1/4 size-72 rounded-full bg-teal-500/15 blur-3xl animate-blob [animation-delay:4s]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge
            variant="outline"
            className="mx-auto mb-6 gap-2 border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-300"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />
            BETA · Request access · Sign in with Roblox
          </Badge>

          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-6xl">
            The AI coding companion for{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Roblox developers
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground text-balance sm:text-lg">
            BloxForge AI generates, debugs and refactors Luau using NVIDIA
            frontier models — and ships a free Studio plugin that drops the
            code straight into your game.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={onLaunch}
              className="h-12 gap-2 bg-primary px-7 text-base text-primary-foreground hover:bg-primary/90 glow-brand"
            >
              <Sparkles className="size-4" />
              Launch BloxForge AI
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onGetPlugin}
              className="h-12 gap-2 border-border bg-card/50 px-7 text-base backdrop-blur hover:bg-accent"
            >
              <Download className="size-4" />
              Get the Studio Plugin
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {[
              "5 NVIDIA models",
              "No sign-up to try",
              "Streaming responses",
              "Saved sessions",
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-400" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Code preview mock */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mx-auto mt-14 max-w-4xl"
        >
          <div className="absolute -inset-x-8 -top-6 bottom-0 rounded-3xl bg-gradient-to-b from-emerald-500/20 to-transparent blur-2xl" />
          <Card className="relative overflow-hidden border-border/60 bg-[oklch(0.14_0.012_250)] shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border/60 bg-[oklch(0.17_0.012_250)] px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="size-3 rounded-full bg-red-500/70" />
                <span className="size-3 rounded-full bg-amber-500/70" />
                <span className="size-3 rounded-full bg-emerald-500/70" />
              </div>
              <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                BloxForge AI — cooldown.lua
              </span>
              <Badge className="ml-auto h-5 gap-1 bg-emerald-500/15 px-2 text-[10px] text-emerald-300 hover:bg-emerald-500/20">
                <Cpu className="size-2.5" /> Qwen2.5-Coder
              </Badge>
            </div>
            <pre className="overflow-x-auto p-5 text-[12.5px] leading-relaxed">
              <code className="font-mono">
                <span className="text-violet-400">--!strict</span>
                {"\n"}
                <span className="text-violet-400">local</span>{" "}
                <span className="text-sky-300">TweenService</span> ={" "}
                <span className="text-sky-300">game</span>:GetService(
                <span className="text-emerald-300">"TweenService"</span>)
                {"\n\n"}
                <span className="text-violet-400">local</span>{" "}
                <span className="text-amber-300">Cooldown</span> = {}
                {"\n"}
                <span className="text-amber-300">Cooldown</span>.__index ={" "}
                <span className="text-amber-300">Cooldown</span>
                {"\n\n"}
                <span className="text-violet-400">function</span>{" "}
                <span className="text-amber-300">Cooldown</span>.new(duration:{" "}
                <span className="text-teal-300">number</span>)
                {"\n"}
                {"  "}
                <span className="text-violet-400">return</span> setmetatable({"{"}{"\n"}
                {"    "}remaining = duration,{"\n"}
                {"  "}, <span className="text-amber-300">Cooldown</span>)
                {"\n"}
                <span className="text-violet-400">end</span>
                {"\n\n"}
                <span className="text-slate-500">
                  -- BloxForge generated ✓ ready to ship
                </span>
              </code>
            </pre>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {desc && <p className="mt-3 text-muted-foreground text-balance">{desc}</p>}
    </div>
  );
}

function Models() {
  return (
    <section className="relative border-t border-border/50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="The best models, one forge"
          title="Frontier NVIDIA models, your call"
          desc="Switch models mid-session. Each is hosted on NVIDIA NIM and tuned for a different kind of Roblox work."
        />
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODELS.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card className="group h-full overflow-hidden border-border/60 bg-card p-5 transition hover:border-emerald-500/40">
                <div
                  className={cn(
                    "mb-4 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-slate-950 shadow-lg",
                    m.accent,
                  )}
                >
                  <Brain className="size-5" />
                </div>
                <Badge
                  variant="secondary"
                  className="mb-2 h-5 bg-emerald-500/10 text-[10px] text-emerald-300"
                >
                  {m.tag}
                </Badge>
                <h3 className="font-display text-lg font-bold">{m.name}</h3>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  {m.vendor}
                </p>
                <p className="mt-2.5 text-sm text-muted-foreground">{m.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="relative border-t border-border/50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Everything you need"
          title="Built for Roblox, not just code"
          desc="BloxForge knows the engine: services, remotes, attributes, parallel Luau, and the difference between a LocalScript and a Script."
        />
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Card className="group h-full border-border/60 bg-card p-6 transition hover:border-emerald-500/30 hover:bg-accent/20">
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition group-hover:bg-emerald-500/20">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section className="relative border-t border-border/50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="From idea to instance"
          title="Three steps to shipping"
        />
        <div className="relative mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent md:block" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 mb-5 flex size-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-background shadow-lg shadow-emerald-500/10">
                <s.icon className="size-6 text-emerald-400" />
                <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button
            size="lg"
            onClick={onLaunch}
            className="h-12 gap-2 bg-primary px-7 text-base text-primary-foreground hover:bg-primary/90"
          >
            <Zap className="size-4" />
            Start forging now
          </Button>
        </div>
      </div>
    </section>
  );
}

function PluginSection({
  onGetPlugin,
  onLaunch,
}: {
  onGetPlugin: () => void;
  onLaunch: () => void;
}) {
  return (
    <section className="relative overflow-hidden border-t border-border/50 py-20">
      <div className="pointer-events-none absolute right-0 top-1/2 size-96 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge
              variant="outline"
              className="mb-4 gap-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            >
              <Box className="size-3" /> Roblox Studio Plugin
            </Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Forge inside Studio,
              <br />
              insert with one click
            </h2>
            <p className="mt-4 text-muted-foreground">
              The BloxForge AI plugin lives in your Studio toolbar. Chat with
              the AI, then drop generated Luau straight into a new Script — no
              copy-paste, no context switching.
            </p>

            <div className="mt-6 space-y-4">
              {PLUGIN_STEPS.map((s) => (
                <div key={s.step} className="flex gap-3.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 font-mono text-sm font-bold text-emerald-400">
                    {s.step}
                  </div>
                  <div>
                    <h4 className="font-medium">{s.title}</h4>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={onGetPlugin}
                className="h-12 gap-2 bg-primary px-6 text-primary-foreground hover:bg-primary/90"
              >
                <Download className="size-4" />
                Download plugin (.lua)
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
                  Roblox Store
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
          </div>

          {/* Plugin preview mock */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden border-border/60 bg-[oklch(0.14_0.012_250)] shadow-2xl">
              <div className="flex items-center gap-2 border-b border-border/60 bg-[oklch(0.17_0.012_250)] px-3 py-2">
                <Logo size={22} />
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  DockWidget
                </span>
              </div>
              <div className="space-y-3 p-4">
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-secondary px-3 py-2 text-xs">
                  Create a cooldown module with a :Reset() method
                </div>
                <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                  <span className="font-bold text-emerald-400">
                    BloxForge AI
                  </span>
                  <p className="mt-1 text-muted-foreground">
                    Generated a ModuleScript with :Start, :Reset and a .Finished
                    signal. Ready to insert 👇
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                    <Zap className="size-3" /> Code block ready
                  </div>
                  <pre className="font-mono text-[10.5px] leading-relaxed text-muted-foreground">
                    <code>{`local Cooldown = {}
Cooldown.__index = Cooldown

function Cooldown.new(d)
  return setmetatable({ ...`}</code>
                  </pre>
                  <div className="mt-2 flex justify-end">
                    <span className="rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-bold text-slate-950">
                      Insert as Script
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CTA({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section className="relative border-t border-border/50 py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]" />
          <div className="relative">
            <Sparkles className="mx-auto mb-4 size-8 text-emerald-400" />
            <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Stop writing boilerplate.
              <br />
              Start forging experiences.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Free to try. No sign-up. NVIDIA-powered. The fastest path from
              idea to a shipping Roblox game.
            </p>
            <Button
              size="lg"
              onClick={onLaunch}
              className="mt-8 h-12 gap-2 bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90 glow-brand"
            >
              <Sparkles className="size-4" />
              Launch BloxForge AI
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: 5, suffix: "", label: "NVIDIA frontier models" },
    { value: 128, suffix: "K", label: "Context window per model" },
    { value: 50, suffix: "+", label: "Luau patterns known" },
    { value: 1, suffix: "", label: "Click to insert code" },
  ];
  return (
    <section className="border-t border-border/50 py-14">
      <div className="mx-auto max-w-5xl px-4">
        <Reveal>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-extrabold tracking-tight text-emerald-400 sm:text-4xl">
                  <Counter to={s.value} />
                  {s.suffix}
                </div>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PricingTeaser({
  onNavigatePricing,
  onLaunch,
}: {
  onNavigatePricing: () => void;
  onLaunch: () => void;
}) {
  const tiers = [
    { name: "Free", price: "$0", blurb: "50 msgs/day, 2 models", highlight: false },
    { name: "Pro", price: "$9", blurb: "Unlimited, all 5 models", highlight: true },
    { name: "Studio", price: "$31", blurb: "Teams & custom prompts", highlight: false },
  ];
  return (
    <section className="relative border-t border-border/50 py-20">
      <div className="bg-radial-brand pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto max-w-5xl px-4">
        <SectionHeading
          eyebrow="Simple pricing"
          title="Free to start, scale when ready"
          desc="Start on Free forever. Upgrade for unlimited messages and frontier models."
        />
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <Card
                className={cn(
                  "relative h-full overflow-hidden p-6 text-center transition",
                  t.highlight
                    ? "border-emerald-500/40 bg-accent/20 glow-brand"
                    : "border-border/60 bg-card hover:border-emerald-500/20",
                )}
              >
                {t.highlight && (
                  <Badge className="absolute right-4 top-4 gap-1 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20">
                    <Crown className="size-3" /> Popular
                  </Badge>
                )}
                <h3 className="font-display text-lg font-bold">{t.name}</h3>
                <div className="mt-2 flex items-baseline justify-center gap-1">
                  <span className="font-display text-4xl font-extrabold">
                    {t.price}
                  </span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t.blurb}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={onNavigatePricing}
            className="gap-2 border-border bg-card/50 hover:bg-accent"
          >
            Compare plans
            <ArrowRight className="size-4" />
          </Button>
          <Button
            onClick={onLaunch}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="size-4" />
            Start free
          </Button>
        </div>
      </div>
    </section>
  );
}

function BetaSection({ onLaunch }: { onLaunch: () => void }) {
  const steps = [
    {
      n: "1",
      title: "Sign in with Roblox",
      desc: "Use secure Roblox OAuth2 to verify your identity. No passwords, no fake accounts — just your real Roblox account.",
    },
    {
      n: "2",
      title: "Wait for approval",
      desc: "BloxForge is in closed beta. After signing in, an admin reviews and approves your account (usually within a few hours).",
    },
    {
      n: "3",
      title: "Start forging",
      desc: "Once approved, you get full access to NVIDIA-powered AI, all 5 personalities, saved sessions, and the Studio connector.",
    },
  ];

  return (
    <section className="relative overflow-hidden border-t border-border/50 py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 size-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-4">
        <div className="text-center">
          <Badge
            variant="outline"
            className="mb-4 gap-2 border-amber-500/40 bg-amber-500/10 text-amber-300"
          >
            <Sparkles className="size-3" /> Closed Beta
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            BloxForge AI is in beta
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground text-balance">
            We're rolling out access gradually to keep the experience great.
            Here's how to get in.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <Card className="h-full border-border/60 bg-card p-6">
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-amber-500/15 font-display text-lg font-bold text-amber-400">
                  {s.n}
                </div>
                <h3 className="font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={onLaunch}
            className="h-12 gap-2 bg-primary px-7 text-base text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="size-4" />
            Request beta access
          </Button>
          <span className="text-xs text-muted-foreground">
            Free during beta · No credit card · Roblox account required
          </span>
        </div>
      </div>
    </section>
  );
}
