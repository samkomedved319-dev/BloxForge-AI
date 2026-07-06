"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Sparkles,
  AlertCircle,
  Check,
  ExternalLink,
  RefreshCw,
  Copy,
} from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Step = "username" | "verify" | "signing-in" | "admin";

export function AuthModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [robloxUserId, setRobloxUserId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const startVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = username.trim();
    if (!clean) {
      setError("Enter your Roblox username");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/roblox/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: clean }),
      });
      const data = await res.json();
      if (data.ok) {
        setRobloxUserId(data.robloxUserId);
        setDisplayName(data.displayName);
        setCode(data.code);
        setStep("verify");
      } else {
        setError(data.error || "Roblox user not found");
      }
    } catch {
      setError("Failed to reach Roblox. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/roblox/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          robloxUserId,
          robloxUsername: username.trim(),
          code,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Verification failed");
        setLoading(false);
        return;
      }

      // Sign in via NextAuth with the verification token
      setStep("signing-in");
      const result = await signIn("roblox", {
        token: data.token,
        redirect: false,
      });

      if (result?.error) {
        setError("Sign-in failed after verification. Try again.");
        setStep("verify");
        setLoading(false);
        return;
      }

      toast.success(
        data.user.approved
          ? "Welcome to BloxForge AI!"
          : "Account created! Pending beta approval.",
      );
      onSuccess?.();
      onClose();
      // Reset
      setStep("username");
      setUsername("");
      setCode("");
      setError(null);
      if (typeof window !== "undefined") window.location.reload();
    } catch {
      setError("Verification failed. Try again.");
      setStep("verify");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const reset = () => {
    setStep("username");
    setUsername("");
    setCode("");
    setError(null);
  };

  const adminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn("admin-credentials", {
        email: adminEmail,
        password: adminPassword,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid admin credentials");
        setLoading(false);
        return;
      }
      toast.success("Welcome back, admin");
      onSuccess?.();
      onClose();
      if (typeof window !== "undefined") window.location.reload();
    } catch {
      setError("Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-none absolute -top-24 left-1/2 size-48 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between border-b border-border p-4">
                <Logo size={28} />
                <button
                  onClick={() => {
                    reset();
                    onClose();
                  }}
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {step === "username" && (
                    <motion.div
                      key="username"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <h2 className="font-display text-2xl font-bold tracking-tight">
                        Sign in with Roblox
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Enter your Roblox username. We'll verify it's really you
                        with a profile code.
                      </p>

                      <form onSubmit={startVerification} className="mt-5 space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="rbx-username" className="text-xs">
                            Roblox username
                          </Label>
                          <Input
                            id="rbx-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="YourRobloxUsername"
                            autoFocus
                          />
                        </div>

                        {error && (
                          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            <AlertCircle className="mt-0.5 size-4 shrink-0" />
                            <span>{error}</span>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {loading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Sparkles className="size-4" />
                          )}
                          Continue
                        </Button>
                      </form>

                      <p className="mt-4 text-center text-[11px] text-muted-foreground">
                        By signing in you agree to add a one-time verification code
                        to your Roblox profile. No password needed.
                      </p>

                      <button
                        onClick={() => {
                          setStep("admin");
                          setError(null);
                        }}
                        className="mt-3 block w-full text-center text-[11px] text-muted-foreground transition hover:text-foreground"
                      >
                        Admin sign in →
                      </button>
                    </motion.div>
                  )}

                  {step === "admin" && (
                    <motion.div
                      key="admin"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <h2 className="font-display text-2xl font-bold tracking-tight">
                        Admin sign in
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        For admin accounts only. Users sign in with Roblox.
                      </p>

                      <form onSubmit={adminSignIn} className="mt-5 space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="admin-email" className="text-xs">
                            Email
                          </Label>
                          <Input
                            id="admin-email"
                            type="email"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            placeholder="admin@example.com"
                            autoFocus
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="admin-pass" className="text-xs">
                            Password
                          </Label>
                          <Input
                            id="admin-pass"
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                        </div>

                        {error && (
                          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            <AlertCircle className="mt-0.5 size-4 shrink-0" />
                            <span>{error}</span>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {loading && <Loader2 className="size-4 animate-spin" />}
                          Sign in
                        </Button>
                      </form>

                      <button
                        onClick={() => {
                          setStep("username");
                          setError(null);
                        }}
                        className="mt-4 block w-full text-center text-[11px] text-muted-foreground transition hover:text-foreground"
                      >
                        ← Back to Roblox sign in
                      </button>
                    </motion.div>
                  )}

                  {step === "verify" && (
                    <motion.div
                      key="verify"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <h2 className="font-display text-2xl font-bold tracking-tight">
                        Verify your account
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Hi <span className="font-medium text-foreground">{displayName}</span>!
                        Add this code to your Roblox profile description, then click verify.
                      </p>

                      <div className="mt-5">
                        <Label className="mb-2 block text-xs">
                          Your verification code
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-1 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/5 py-3">
                            <span className="font-mono text-lg font-bold tracking-wider text-emerald-400">
                              {code}
                            </span>
                          </div>
                          <button
                            onClick={copyCode}
                            className="flex size-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:text-foreground"
                          >
                            {copied ? (
                              <Check className="size-4 text-emerald-400" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2.5 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">
                          How to verify:
                        </p>
                        <ol className="list-decimal space-y-1.5 pl-4">
                          <li>
                            Go to{" "}
                            <a
                              href="https://www.roblox.com/my/account"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 text-emerald-400 hover:underline"
                            >
                              Roblox settings <ExternalLink className="size-3" />
                            </a>
                          </li>
                          <li>
                            Paste the code into your <b>About</b> / description
                            field
                          </li>
                          <li>Click <b>Save</b> on Roblox</li>
                          <li>Come back here and click <b>Verify & sign in</b></li>
                        </ol>
                      </div>

                      {error && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                          <AlertCircle className="mt-0.5 size-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <div className="mt-5 flex gap-2">
                        <Button
                          variant="outline"
                          onClick={reset}
                          className="gap-2"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={verifyAndSignIn}
                          disabled={loading}
                          className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {loading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Check className="size-4" />
                          )}
                          Verify & sign in
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === "signing-in" && (
                    <motion.div
                      key="signing-in"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center py-8 text-center"
                    >
                      <Loader2 className="size-10 animate-spin text-emerald-400" />
                      <p className="mt-4 text-sm text-muted-foreground">
                        Signing you in…
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
