"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Check,
  Zap,
  Crown,
  Users,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type Tier = {
  id: string;
  name: string;
  badge: string;
  blurb: string;
  monthly: number | null;
  annual: number | null;
  cta: string;
  ctaVariant: "default" | "outline";
  highlight?: boolean;
  icon: typeof Sparkles;
  features: string[];
};

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    badge: "Hobby",
    blurb: "Everything you need to try BloxForge and ship your first script.",
    monthly: 0,
    annual: 0,
    cta: "Start free",
    ctaVariant: "outline",
    icon: Sparkles,
    features: [
      "5 credits / day",
      "Qwen2.5 Coder + Llama 3.3 models",
      "Saved sessions (up to 10)",
      "Community support",
      "Roblox Studio plugin",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Most popular",
    blurb: "For solo developers shipping real Roblox games with frontier models.",
    monthly: 12,
    annual: 9,
    cta: "Go Pro",
    ctaVariant: "default",
    highlight: true,
    icon: Crown,
    features: [
      "30 credits / day",
      "All NVIDIA models incl. DeepSeek R1 & Llama 405B",
      "Unlimited saved sessions",
      "Priority streaming",
      "Reference image upload",
      "Code context (select-a-script)",
      "Email support",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    badge: "Teams",
    blurb: "For studios and teams collaborating across multiple Roblox titles.",
    monthly: 39,
    annual: 31,
    cta: "Start Studio trial",
    ctaVariant: "outline",
    icon: Users,
    features: [
      "Everything in Pro",
      "Unlimited credits",
      "BloxForge Luau (Beta)",
      "Team shared sessions",
      "Custom system prompts",
      "Usage analytics",
      "Plugin white-label",
      "SSO + audit log",
      "Priority support",
    ],
  },
];

const FAQS = [
  {
    q: "Can I use BloxForge without an NVIDIA API key?",
    a: "Yes. The web app runs on a shared demo engine. Bring your own NVIDIA key for unlimited frontier-model access and the Studio plugin.",
  },
  {
    q: "Which models are included?",
    a: "Qwen2.5 Coder 32B, DeepSeek R1, Nemotron 70B, Llama 3.3 70B, and Llama 3.1 405B — all via NVIDIA NIM.",
  },
  {
    q: "Is the Roblox Studio plugin free?",
    a: "Yes, the plugin is free and open. It connects to your BloxForge server URL.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Plans are month-to-month, cancel from your account with one click.",
  },
  {
    q: "Do you store my code?",
    a: "Only the conversations you save. You can delete any session permanently at any time.",
  },
];

export function Pricing({
  onLaunch,
  onGetPlugin,
}: {
  onLaunch: () => void;
  onGetPlugin: () => void;
}) {
  const [annual, setAnnual] = useState(false);

  return (
    <main className="flex-1">
      <PricingHero
        annual={annual}
        setAnnual={setAnnual}
      />
      <PricingTiers annual={annual} onLaunch={onLaunch} />
      <FAQ />
      <PricingCTA onLaunch={onLaunch} onGetPlugin={onGetPlugin} />
    </main>
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
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {desc && <p className="mt-3 text-muted-foreground text-balance">{desc}</p>}
    </div>
  );
}

function PricingHero({
  annual,
  setAnnual,
}: {
  annual: boolean;
  setAnnual: (v: boolean) => void;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-radial-brand pointer-events-none absolute inset-0" />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-24 left-1/4 size-72 rounded-full bg-violet-500/20 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -top-16 right-1/4 size-72 rounded-full bg-teal-500/15 blur-3xl animate-blob [animation-delay:4s]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-16 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge
            variant="outline"
            className="mx-auto mb-6 gap-2 border-violet-500/30 bg-violet-500/10 px-3 py-1 text-violet-300"
          >
            <Zap className="size-3" /> Simple, developer-first pricing
          </Badge>

          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-6xl">
            Pick your{" "}
            <span className="bg-gradient-to-r from-violet-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">
              forge
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground text-balance sm:text-lg">
            Start free with NVIDIA-powered Luau generation. Upgrade when you
            need frontier models, unlimited sessions, and team tooling.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="relative inline-flex items-center rounded-full border border-border/60 bg-card/60 p-1 backdrop-blur">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={cn(
                  "relative z-10 rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
                  !annual
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={cn(
                  "relative z-10 flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
                  annual
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Annual
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    annual
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-violet-500/15 text-violet-300",
                  )}
                >
                  Save 25%
                </span>
              </button>
            </div>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            No credit card required for Free · Cancel anytime · Not affiliated
            with Roblox Corporation
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function PricingTiers({
  annual,
  onLaunch,
}: {
  annual: boolean;
  onLaunch: () => void;
}) {
  const [stripeStatus, setStripeStatus] = useState<{
    configured: boolean;
    hasProMonthly: boolean;
    hasStudioMonthly: boolean;
  } | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stripe/status")
      .then((r) => r.json())
      .then((d) => setStripeStatus(d))
      .catch(() => setStripeStatus(null));
  }, []);

  const handleCheckout = async (plan: "pro" | "studio") => {
    setCheckingOut(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, period: annual ? "annual" : "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === "stripe-not-configured") {
        // Stripe not configured — fall back to launching the app
        toast.info("Stripe not configured", {
          description: "Contact an admin to upgrade your plan.",
        });
        onLaunch();
      } else {
        toast.error(data.error || data.message || "Checkout failed");
      }
    } catch {
      toast.error("Checkout failed");
    } finally {
      setCheckingOut(null);
    }
  };

  const handleTierClick = (tierId: string) => {
    if (tierId === "free") {
      onLaunch();
    } else if (tierId === "pro") {
      handleCheckout("pro");
    } else if (tierId === "studio") {
      handleCheckout("studio");
    }
  };
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={cn(
                "flex",
                tier.highlight && "lg:scale-105 lg:-my-2",
              )}
            >
              <Card
                className={cn(
                  "relative flex h-full w-full flex-col gap-0 overflow-hidden border-border/60 bg-card p-6 transition",
                  tier.highlight
                    ? "border-violet-500/40 glow-brand"
                    : "hover:border-violet-500/30",
                )}
              >
                {tier.highlight && (
                  <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />
                )}

                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                    <tier.icon className="size-5" />
                  </div>
                  <Badge
                    variant={tier.highlight ? "default" : "secondary"}
                    className={cn(
                      "h-6 px-2.5 text-[11px]",
                      tier.highlight
                        ? "bg-primary text-primary-foreground"
                        : "bg-violet-500/10 text-violet-300",
                    )}
                  >
                    {tier.highlight && (
                      <Sparkles className="size-3" />
                    )}
                    {tier.badge}
                  </Badge>
                </div>

                <h3 className="mt-5 font-display text-2xl font-bold tracking-tight">
                  {tier.name}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {tier.blurb}
                </p>

                <div className="mt-6 flex items-end gap-1.5">
                  <span className="font-display text-5xl font-extrabold tracking-tight">
                    ${annual ? tier.annual : tier.monthly}
                  </span>
                  <span className="mb-1.5 text-sm text-muted-foreground">
                    {tier.monthly === 0 ? "/ forever" : "/ mo"}
                  </span>
                </div>
                <p className="mt-1 h-4 font-mono text-[11px] text-violet-400">
                  {tier.monthly === 0
                    ? "No card required"
                    : annual
                      ? `billed annually ($${tier.annual! * 12}/yr)`
                      : "billed monthly"}
                </p>

                <Button
                  size="lg"
                  variant={tier.ctaVariant}
                  onClick={() => handleTierClick(tier.id)}
                  disabled={checkingOut === tier.id}
                  className={cn(
                    "mt-6 h-11 gap-2",
                    tier.ctaVariant === "default"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border bg-card/50 hover:bg-accent",
                  )}
                >
                  {checkingOut === tier.id ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Redirecting…
                    </>
                  ) : (
                    <>
                      {tier.cta}
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>

                <div className="mt-7 border-t border-border/60 pt-5">
                  <ul className="space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <span
                          className={cn(
                            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                            tier.highlight
                              ? "bg-violet-500 text-slate-950"
                              : "bg-violet-500/15 text-violet-400",
                          )}
                        >
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="relative border-t border-border/50 py-20">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeading
          eyebrow="Good to know"
          title="Frequently asked questions"
          desc="Everything you need to know about plans, models, and the Studio plugin."
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-12"
        >
          <Card className="border-border/60 bg-card p-2 sm:p-4">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`item-${i}`}
                  className="border-border/60 px-2 sm:px-3"
                >
                  <AccordionTrigger className="font-display text-base font-semibold hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-violet-400" />
          Still have questions?{" "}
          <button
            type="button"
            className="font-medium text-violet-400 underline-offset-4 hover:underline"
          >
            Talk to us
          </button>
        </div>
      </div>
    </section>
  );
}

function PricingCTA({
  onLaunch,
  onGetPlugin,
}: {
  onLaunch: () => void;
  onGetPlugin: () => void;
}) {
  return (
    <section className="relative border-t border-border/50 py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-teal-500/5 to-transparent p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]" />
          <div className="relative">
            <Sparkles className="mx-auto mb-4 size-8 text-violet-400" />
            <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Ready to forge?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Launch BloxForge AI in your browser — no install, no sign-up. Or
              grab the Studio plugin and forge right inside Roblox.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={onLaunch}
                className="h-12 gap-2 bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90 glow-brand"
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
                Get the plugin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
