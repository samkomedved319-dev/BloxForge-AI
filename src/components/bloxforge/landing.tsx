"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Code2,
  Layout,
  Boxes,
  Clapperboard,
  RefreshCw,
  Gamepad2,
  Download,
  Box,
  Cpu,
  MessageSquare,
  Wand2,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Counter, Reveal } from "./motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Static content                                                     */
/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    icon: Code2,
    title: "AI Script Gen",
    desc: "Describe a system — get clean, idiomatic Luau ModuleScripts, LocalScripts and Scripts ready to drop into Studio.",
  },
  {
    icon: Layout,
    title: "GUI Builder",
    desc: "Generate full UI hierarchies with frames, gradients and tweens. One prompt, an entire menu system.",
  },
  {
    icon: Boxes,
    title: "3D Models",
    desc: "Spawn, scale and parent parts, meshes and unions procedurally. Build worlds from a single sentence.",
  },
  {
    icon: Clapperboard,
    title: "Animations",
    desc: "Author KeyframeSequences, rigs and motor-6D choreography for characters and cutscenes — no plugin hunt.",
  },
  {
    icon: RefreshCw,
    title: "Auto-Sync to Studio",
    desc: "The BloxForge plugin streams code straight into a new Script instance. No copy-paste. No context switch.",
  },
  {
    icon: Gamepad2,
    title: "Game Templates",
    desc: "Start from a fully-wired genre base — shooter, obby, simulator — then ask the AI to make it yours.",
  },
];

const TEMPLATES = [
  { emoji: "🔫", name: "Shooter", tag: "FPS / TPS", accent: "from-rose-500/30 to-red-500/10" },
  { emoji: "🌈", name: "Obby", tag: "Platformer", accent: "from-violet-500/30 to-fuchsia-500/10" },
  { emoji: "📈", name: "Simulator", tag: "Incremental", accent: "from-amber-500/30 to-orange-500/10" },
  { emoji: "💰", name: "Tycoon", tag: "Builder", accent: "from-emerald-500/30 to-teal-500/10" },
  { emoji: "🚜", name: "Farm", tag: "Cozy", accent: "from-lime-500/30 to-green-500/10" },
  { emoji: "🐾", name: "Pets", tag: "Collection", accent: "from-cyan-500/30 to-sky-500/10" },
  { emoji: "🛏️", name: "Bedwars", tag: "PvP", accent: "from-indigo-500/30 to-violet-500/10" },
  { emoji: "🔪", name: "Murder Mystery", tag: "Social Deduction", accent: "from-purple-500/30 to-pink-500/10" },
];

const STEPS = [
  {
    icon: MessageSquare,
    title: "Describe",
    desc: "Tell BloxForge what you want in plain English. “A round-based team shooter with a buy menu” — anything.",
  },
  {
    icon: Wand2,
    title: "AI Builds",
    desc: "NVIDIA Nemotron 70B writes the systems, the remotes, the GUI and the data layer. Review, regenerate, refine.",
  },
  {
    icon: RefreshCw,
    title: "Syncs to Studio",
    desc: "Hit insert. The plugin drops the code into a fresh Script. Run, playtest, ship — all inside Studio.",
  },
];

const STATS = [
  { value: 10, suffix: "K+", label: "Games Built", format: (v: number) => Math.round(v).toString() },
  { value: 500, suffix: "K+", label: "Creators", format: (v: number) => Math.round(v).toString() },
  { value: 100, suffix: "%", label: "NVIDIA AI", format: (v: number) => Math.round(v).toString() },
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

/* ------------------------------------------------------------------ */
/* Landing                                                            */
/* ------------------------------------------------------------------ */

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
      <Features />
      <Templates />
      <HowItWorks onLaunch={onLaunch} />
      <PluginSection onGetPlugin={onGetPlugin} onLaunch={onLaunch} />
      <PricingTeaser onNavigatePricing={onNavigatePricing} onLaunch={onLaunch} />
      <CTA onLaunch={onLaunch} />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */

function Hero({
  onLaunch,
  onGetPlugin,
}: {
  onLaunch: () => void;
  onGetPlugin: () => void;
}) {
  return (
    <section className="relative overflow-hidden">
      {/* Background layers */}
      <div className="bg-radial-brand pointer-events-none absolute inset-0" />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(60%_55%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-32 left-1/4 size-[28rem] rounded-full bg-violet-600/25 blur-[120px] animate-blob" />
      <div className="pointer-events-none absolute -top-24 right-1/4 size-[26rem] rounded-full bg-fuchsia-600/20 blur-[120px] animate-blob [animation-delay:4s]" />
      <div className="pointer-events-none absolute top-32 left-1/2 size-[22rem] -translate-x-1/2 rounded-full bg-purple-500/10 blur-[120px] animate-blob [animation-delay:8s]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:pt-28 lg:pt-32">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center lg:justify-start"
            >
              <Badge
                variant="outline"
                className="mb-6 gap-2 border-violet-500/40 bg-violet-500/10 px-3 py-1 text-violet-300"
              >
                <span className="size-1.5 animate-pulse rounded-full bg-violet-400" />
                Powered by NVIDIA Nemotron 70B
              </Badge>
            </motion.div>

            <h1 className="font-display text-[2.5rem] font-extrabold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-[4.25rem]">
              Build the game{" "}
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">
                only you can imagine
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground text-balance sm:text-lg lg:mx-0">
              BloxForge AI turns plain-English prompts into clean Luau,
              full GUIs, and wired-up game systems — powered by NVIDIA
              Nemotron. Then syncs everything straight into Roblox Studio.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button
                size="lg"
                onClick={onLaunch}
                className="h-13 gap-2 bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90 glow-brand"
              >
                <Sparkles className="size-4" />
                Start Building
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onGetPlugin}
                className="h-13 gap-2 border-border bg-card/40 px-7 text-base backdrop-blur hover:bg-accent"
              >
                <Download className="size-4" />
                Get Plugin
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start">
              {[
                "NVIDIA Nemotron AI",
                "No sign-up to try",
                "Streaming responses",
                "Studio auto-sync",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-violet-400" />
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right: floating code card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-violet-500/30 via-fuchsia-500/15 to-transparent blur-2xl" />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Card className="relative overflow-hidden border-border/60 bg-[oklch(0.13_0.018_280)] shadow-2xl shadow-violet-950/40">
                <div className="flex items-center gap-2 border-b border-border/60 bg-[oklch(0.16_0.02_280)] px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <span className="size-3 rounded-full bg-red-500/70" />
                    <span className="size-3 rounded-full bg-amber-500/70" />
                    <span className="size-3 rounded-full bg-violet-500/70" />
                  </div>
                  <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                    BloxForge AI · round_manager.lua
                  </span>
                  <Badge className="ml-auto h-5 gap-1 bg-violet-500/15 px-2 text-[10px] text-violet-300 hover:bg-violet-500/20">
                    <Cpu className="size-2.5" /> Nemotron 70B
                  </Badge>
                </div>
                <pre className="overflow-x-auto p-5 text-[12.5px] leading-relaxed">
                  <code className="font-mono">
                    <span className="text-violet-400">--!strict</span>
                    {"\n"}
                    <span className="text-violet-400">local</span>{" "}
                    <span className="text-sky-300">RoundManager</span> = {}
                    {"\n"}
                    <span className="text-sky-300">RoundManager</span>.__index ={" "}
                    <span className="text-sky-300">RoundManager</span>
                    {"\n\n"}
                    <span className="text-violet-400">function</span>{" "}
                    <span className="text-sky-300">RoundManager</span>.
                    <span className="text-amber-300">start</span>(players:{" "}
                    <span className="text-teal-300">{`{Player}`}</span>)
                    {"\n"}
                    {"  "}
                    <span className="text-violet-400">local</span> state ={" "}
                    <span className="text-violet-400">{`{`}</span> active ={" "}
                    <span className="text-amber-300">true</span>, score ={" "}
                    <span className="text-amber-300">0</span>{" "}
                    <span className="text-violet-400">{`}`}</span>
                    {"\n"}
                    {"  "}
                    <span className="text-slate-500">
                      -- BloxForge generated ✓ shipped to Studio
                    </span>
                    {"\n"}
                    {"  "}
                    <span className="text-violet-400">return</span> setmetatable(
                    <span className="text-violet-400">{`{`}</span> state{" "}
                    <span className="text-violet-400">{`}`}</span>,{" "}
                    <span className="text-sky-300">RoundManager</span>)
                    {"\n"}
                    <span className="text-violet-400">end</span>
                  </code>
                </pre>
                <div className="border-t border-border/60 bg-[oklch(0.16_0.02_280)] px-4 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      streaming · 0.42s · 248 tokens
                    </span>
                    <span className="flex items-center gap-1.5 rounded-md bg-violet-500/15 px-2 py-1 text-[10px] font-bold text-violet-300">
                      <Zap className="size-2.5" /> Insert as Script
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section heading helper                                             */
/* ------------------------------------------------------------------ */

function SectionHeading({
  eyebrow,
  title,
  desc,
  className,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-violet-400">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {desc && (
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-balance">
          {desc}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stats                                                              */
/* ------------------------------------------------------------------ */

function Stats() {
  return (
    <section className="relative border-y border-border/50 bg-card/20 py-12 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <div className="text-center">
                <div className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                  <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">
                    <Counter to={s.value} format={s.format} />
                    {s.suffix}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Features                                                           */
/* ------------------------------------------------------------------ */

function Features() {
  return (
    <section className="relative py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 size-[40rem] -translate-x-1/2 rounded-full bg-violet-600/5 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Capabilities"
          title="Everything you need to ship a Roblox game"
          desc="BloxForge knows the engine inside-out: services, remotes, attributes, parallel Luau, GUIs, rigs and more."
        />
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="group relative h-full overflow-hidden border-border/60 bg-card/60 p-6 backdrop-blur transition hover:border-violet-500/40 hover:bg-accent/20">
                <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-violet-500/0 blur-2xl transition-all duration-500 group-hover:bg-violet-500/15" />
                <div className="relative mb-5 flex size-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300 transition group-hover:scale-110 group-hover:border-violet-500/40 group-hover:bg-violet-500/20">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
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

/* ------------------------------------------------------------------ */
/* Game templates — horizontal scroll                                 */
/* ------------------------------------------------------------------ */

function Templates() {
  return (
    <section className="relative border-t border-border/50 py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Game Templates"
            title="Start from a genre, not a blank canvas"
            desc="Pre-wired genre bases. Pick one, prompt the AI to make it yours, ship in minutes."
            className="mx-0 text-left"
          />
          <Badge
            variant="outline"
            className="hidden gap-1.5 border-violet-500/30 bg-violet-500/10 text-violet-300 sm:inline-flex"
          >
            <Gamepad2 className="size-3" /> 8 templates · more coming
          </Badge>
        </div>

        <div
          className="mt-12 flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin] snap-x snap-mandatory"
          style={{ scrollbarWidth: "thin" }}
        >
          {TEMPLATES.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="snap-start"
            >
              <Card className="group relative h-56 w-64 shrink-0 cursor-pointer overflow-hidden border-border/60 bg-card/60 p-5 backdrop-blur transition hover:border-violet-500/40 hover:bg-accent/20">
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity group-hover:opacity-100",
                    t.accent,
                  )}
                />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="text-5xl drop-shadow-lg transition-transform duration-500 group-hover:scale-110">
                    {t.emoji}
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">
                      {t.tag}
                    </span>
                    <h3 className="font-display text-xl font-bold">{t.name}</h3>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground transition group-hover:text-violet-300">
                      Use template
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                       */
/* ------------------------------------------------------------------ */

function HowItWorks({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section className="relative border-t border-border/50 py-24">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="How it works"
          title="From idea to instance in three steps"
        />
        <div className="relative mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent md:block" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 mb-5 flex size-18 items-center justify-center rounded-2xl border border-violet-500/30 bg-background shadow-lg shadow-violet-500/10">
                <s.icon className="size-6 text-violet-400" />
                <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-primary font-display text-xs font-bold text-primary-foreground shadow-lg shadow-violet-500/30">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Button
            size="lg"
            onClick={onLaunch}
            className="h-12 gap-2 bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90 glow-brand"
          >
            <Zap className="size-4" />
            Try it now
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Plugin section                                                     */
/* ------------------------------------------------------------------ */

function PluginSection({
  onGetPlugin,
  onLaunch,
}: {
  onGetPlugin: () => void;
  onLaunch: () => void;
}) {
  return (
    <section className="relative overflow-hidden border-t border-border/50 py-24">
      <div className="pointer-events-none absolute right-0 top-1/2 size-[30rem] -translate-y-1/2 rounded-full bg-violet-500/10 blur-[120px]" />
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <Badge
              variant="outline"
              className="mb-4 gap-2 border-violet-500/30 bg-violet-500/10 text-violet-300"
            >
              <Box className="size-3" /> Roblox Studio Plugin
            </Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Forge inside Studio,
              <br />
              <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                insert with one click
              </span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              The BloxForge AI plugin lives in your Studio toolbar. Chat with
              the AI, then drop generated Luau straight into a new Script — no
              copy-paste, no context switching.
            </p>

            <div className="mt-6 space-y-4">
              {PLUGIN_STEPS.map((s) => (
                <div key={s.step} className="flex gap-3.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 font-mono text-sm font-bold text-violet-400">
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
                <Code2 className="size-4" />
                Try the web app
              </Button>
            </div>
          </Reveal>

          {/* Plugin preview mock */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-violet-500/20 to-transparent blur-2xl" />
            <Card className="overflow-hidden border-border/60 bg-[oklch(0.13_0.018_280)] shadow-2xl shadow-violet-950/40">
              <div className="flex items-center gap-2 border-b border-border/60 bg-[oklch(0.16_0.02_280)] px-3 py-2">
                <Logo size={22} />
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  DockWidgetPluginGui
                </span>
              </div>
              <div className="space-y-3 p-4">
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-secondary px-3 py-2 text-xs">
                  Build a round-based team shooter with a buy menu
                </div>
                <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-violet-500/10 px-3 py-2 text-xs">
                  <span className="font-bold text-violet-400">BloxForge AI</span>
                  <p className="mt-1 text-muted-foreground">
                    Spun up RoundManager, TeamService, a BuyMenu GUI and 6
                    weapons. Ready to insert 👇
                  </p>
                </div>
                <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-violet-400">
                    <Zap className="size-3" /> 4 files ready
                  </div>
                  <pre className="font-mono text-[10.5px] leading-relaxed text-muted-foreground">
                    <code>{`local RoundManager = {}
RoundManager.__index = RoundManager

function RoundManager.start(players)
  return setmetatable({ active = true`}</code>
                  </pre>
                  <div className="mt-2 flex justify-end">
                    <span className="rounded-md bg-violet-500 px-2 py-1 text-[10px] font-bold text-slate-950">
                      Insert all as Scripts
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

/* ------------------------------------------------------------------ */
/* Pricing teaser                                                     */
/* ------------------------------------------------------------------ */

function PricingTeaser({
  onNavigatePricing,
  onLaunch,
}: {
  onNavigatePricing: () => void;
  onLaunch: () => void;
}) {
  const tiers = [
    { name: "Free", price: "$0", blurb: "5 credits/day, 2 models", highlight: false },
    { name: "Pro", price: "$9", blurb: "30 credits/day, all 5 models", highlight: true },
    { name: "Studio", price: "$31", blurb: "Unlimited credits + Beta AI", highlight: false },
  ];
  return (
    <section className="relative border-t border-border/50 py-24">
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
                    ? "border-violet-500/40 bg-accent/20 glow-brand"
                    : "border-border/60 bg-card/60 backdrop-blur hover:border-violet-500/20",
                )}
              >
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

/* ------------------------------------------------------------------ */
/* CTA                                                                */
/* ------------------------------------------------------------------ */

function CTA({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section className="relative border-t border-border/50 py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="relative overflow-hidden rounded-[2rem] border border-violet-500/30 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-purple-600/20 p-10 text-center shadow-2xl shadow-violet-950/40 sm:p-16">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]" />
          <div className="pointer-events-none absolute -left-12 top-0 size-72 rounded-full bg-violet-500/30 blur-[100px] animate-blob" />
          <div className="pointer-events-none absolute -right-12 bottom-0 size-72 rounded-full bg-fuchsia-500/20 blur-[100px] animate-blob [animation-delay:4s]" />
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 backdrop-blur"
            >
              <Sparkles className="size-7 text-violet-300" />
            </motion.div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              Stop writing boilerplate.
              <br />
              <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                Start forging experiences.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Free to try. No sign-up. NVIDIA-powered. The fastest path from
              idea to a shipping Roblox game.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={onLaunch}
                className="h-13 gap-2 bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90 glow-brand"
              >
                <Sparkles className="size-4" />
                Start Building
                <ArrowRight className="size-4" />
              </Button>
              <a
                href="https://discord.gg/jrerzH5Bm"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-13 items-center gap-2 rounded-xl border border-[#5865F2]/40 bg-[#5865F2]/10 px-6 text-sm font-semibold text-[#5865F2] transition hover:bg-[#5865F2]/20"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" />
                </svg>
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
