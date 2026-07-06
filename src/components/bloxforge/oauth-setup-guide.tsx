"use client";

import { useState } from "react";
import { ArrowLeft, Copy, Check, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function OauthSetupGuide() {
  const appOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://your-app.com";
  const callbackUrl = `${appOrigin}/api/auth/roblox/oauth/callback`;

  const fields = [
    {
      label: "Application Name",
      value: "BloxForge AI",
      note: "Up to 50 characters.",
    },
    {
      label: "Description",
      value: "NVIDIA-powered AI coding companion for Roblox/Luau developers. Generate, debug, and refactor Luau scripts with frontier AI models.",
      note: "Up to 250 characters.",
    },
    {
      label: "Entry Link",
      value: appOrigin,
      note: "Must be HTTPS. This is your app's home page.",
    },
    {
      label: "Privacy Policy URL",
      value: `${appOrigin}/#privacy`,
      note: "Must be HTTPS. We've created this page for you.",
    },
    {
      label: "Terms of Service URL",
      value: `${appOrigin}/#tos`,
      note: "Must be HTTPS. We've created this page for you.",
    },
    {
      label: "Redirect URL",
      value: callbackUrl,
      note: "Must be HTTPS. This is the exact URL Roblox redirects to after authorization. Do NOT use /app — it must be /api/auth/roblox/oauth/callback.",
      highlight: true,
    },
  ];

  const scopes = [
    { id: "openid", label: "openid", required: true, desc: "Required for OpenID Connect authentication" },
    { id: "profile", label: "profile", required: true, desc: "Access to user's profile (username, user ID)" },
  ];

  return (
    <main className="flex-1">
      <div className="bg-radial-brand pointer-events-none absolute inset-x-0 top-0 h-48 opacity-30" />
      <div className="relative mx-auto max-w-3xl px-4 py-10">
        <button
          onClick={() => (window.location.hash = "admin")}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to admin dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Badge className="mb-3 gap-1.5 bg-[#00A2FF]/15 text-[#00A2FF] hover:bg-[#00A2FF]/20">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 4c1.5 0 2.5 1 2.5 2.5S13.5 11 12 11s-2.5-1-2.5-2.5S10.5 6 12 6zm0 12c-2 0-3.8-1-5-2.5.1-1.5 3-2.5 5-2.5s4.9 1 5 2.5C15.8 17 14 18 12 18z" />
            </svg>
            Roblox OAuth2 Setup
          </Badge>

          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Roblox OAuth2 setup guide
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Copy-paste these exact values into the{" "}
            <a
              href="https://create.roblox.com/credentials"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-emerald-400 hover:underline"
            >
              Roblox Creator Hub OAuth app form <ExternalLink className="size-3" />
            </a>
            . After creating the app, copy the Client ID and Client Secret into
            your server's <code className="font-mono">.env</code> file.
          </p>
        </motion.div>

        {/* Step 1: App info */}
        <Card className="mt-8 border-border/60 bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 font-display text-sm font-bold text-emerald-400">
              1
            </span>
            <h2 className="font-display text-lg font-bold">General Information</h2>
          </div>

          <div className="space-y-4">
            {fields.map((f) => (
              <FieldRow key={f.label} {...f} />
            ))}
          </div>
        </Card>

        {/* Step 2: Permissions */}
        <Card className="mt-4 border-border/60 bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 font-display text-sm font-bold text-emerald-400">
              2
            </span>
            <h2 className="font-display text-lg font-bold">Permissions (Scopes)</h2>
          </div>

          <p className="mb-3 text-sm text-muted-foreground">
            Search for and select these scopes in the Permissions section:
          </p>

          <div className="space-y-2">
            {scopes.map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm font-medium text-foreground">
                      {s.label}
                    </code>
                    {s.required && (
                      <Badge variant="secondary" className="h-4 text-[10px] text-emerald-400">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Step 3: After creating the app */}
        <Card className="mt-4 border-border/60 bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 font-display text-sm font-bold text-emerald-400">
              3
            </span>
            <h2 className="font-display text-lg font-bold">After creating the app</h2>
          </div>

          <p className="text-sm text-muted-foreground">
            Roblox will give you a <b>Client ID</b> and <b>Client Secret</b>. Add
            these to your server's <code className="font-mono">.env</code> file:
          </p>

          <div className="mt-3 rounded-lg border border-border bg-[oklch(0.14_0.012_250)] p-4">
            <pre className="font-mono text-xs text-emerald-300">
{`ROBLOX_CLIENT_ID=your_client_id_here
ROBLOX_CLIENT_SECRET=your_client_secret_here
ROBLOX_REDIRECT_URI=${callbackUrl}`}
            </pre>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-200">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <div>
              <p className="font-medium">Important</p>
              <p className="mt-0.5 text-xs text-amber-200/80">
                The Redirect URL must <b>exactly match</b> what you entered in
                the Roblox form. If you change it on either side, sign-in will
                fail with an "invalid_state" or "redirect_uri mismatch" error.
              </p>
            </div>
          </div>

          <Button
            onClick={() => (window.location.href = "https://create.roblox.com/credentials")}
            className="mt-5 gap-2 bg-[#00A2FF] text-white hover:bg-[#0090E0]"
          >
            <ExternalLink className="size-4" />
            Open Roblox Creator Hub
          </Button>
        </Card>
      </div>
    </main>
  );
}

function FieldRow({
  label,
  value,
  note,
  highlight,
}: {
  label: string;
  value: string;
  note: string;
  highlight?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-xs font-medium text-foreground">{label}</label>
        {highlight && (
          <Badge variant="outline" className="h-5 gap-1 border-emerald-500/40 text-[10px] text-emerald-400">
            <AlertCircle className="size-2.5" /> Critical
          </Badge>
        )}
      </div>
      <div
        className={`flex items-center gap-2 rounded-lg border bg-background px-3 py-2 ${
          highlight ? "border-emerald-500/40 bg-emerald-500/5" : "border-border"
        }`}
      >
        <code className="flex-1 truncate font-mono text-xs text-foreground">
          {value}
        </code>
        <button
          onClick={copy}
          className="shrink-0 rounded-md p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-400" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>
    </div>
  );
}
