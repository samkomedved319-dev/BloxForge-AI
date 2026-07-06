"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plug,
  Check,
  Loader2,
  RefreshCw,
  Unplug,
  FileCode2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface StudioContext {
  scriptName: string;
  scriptPath: string;
  source: string;
  lineCount: number;
  updatedAt: number;
}

interface StudioState {
  connected: boolean;
  context: StudioContext | null;
  lastSeen: number | null;
  insertResults: { commandId: string; ok: boolean; message: string; at: number }[];
  pairingCode: string;
}

export function useStudioConnection() {
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [state, setState] = useState<StudioState | null>(null);
  const [connecting, setConnecting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (code: string) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/studio/state?code=${encodeURIComponent(code)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.ok) {
              setState(data.state);
              if (data.state?.connected) {
                // keep polling to detect disconnects
              }
            }
          }
        } catch {
          /* ignore transient errors */
        }
      }, 2500);
    },
    [stopPolling],
  );

  const pair = useCallback(async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/studio/pair", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setPairingCode(data.code);
        setState(null);
        startPolling(data.code);
        return data.code;
      }
    } catch {
      toast.error("Failed to start pairing");
    } finally {
      setConnecting(false);
    }
    return null;
  }, [startPolling]);

  const disconnect = useCallback(async () => {
    if (!pairingCode) return;
    try {
      await fetch("/api/studio/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pairingCode }),
      });
    } catch {
      /* ignore */
    }
    stopPolling();
    setPairingCode(null);
    setState(null);
  }, [pairingCode, stopPolling]);

  const insertCode = useCallback(
    async (code: string, title = "BloxForge Script", language = "luau") => {
      if (!pairingCode || !state?.connected) {
        toast.error("Studio is not connected");
        return { ok: false };
      }
      try {
        const res = await fetch("/api/studio/insert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pairingCode, title, language, code }),
        });
        const data = await res.json();
        if (data.ok) {
          return { ok: true, commandId: data.commandId };
        }
        toast.error(data.error || "Insert failed");
        return { ok: false };
      } catch {
        toast.error("Insert failed");
        return { ok: false };
      }
    },
    [pairingCode, state],
  );

  /**
   * Simulate a Studio connection (for testing without the real plugin).
   * Sends heartbeats with a fake script context so the web app detects
   * a connection and the full insert flow can be exercised.
   */
  const simulate = useCallback(async () => {
    let code = pairingCode;
    if (!code) {
      code = await pair();
    }
    if (!code) return;
    // Send an initial heartbeat with a fake context
    try {
      await fetch("/api/studio/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          context: {
            scriptName: "DemoScript.lua",
            scriptPath: "ServerScriptService.DemoScript",
            source: "-- Demo script\nlocal module = {}\nreturn module",
            lineCount: 2,
            updatedAt: Date.now(),
          },
        }),
      });
    } catch {
      /* ignore */
    }
    // Keep the session alive with periodic heartbeats
    const sim = setInterval(async () => {
      try {
        await fetch("/api/studio/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
      } catch {
        /* ignore */
      }
    }, 5000);
    simRef.current = sim;
  }, [pairingCode, pair]);

  const stopSimulate = useCallback(() => {
    if (simRef.current) {
      clearInterval(simRef.current);
      simRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopPolling();
      stopSimulate();
    };
  }, [stopPolling, stopSimulate]);

  return {
    pairingCode,
    state,
    connecting,
    pair,
    disconnect,
    insertCode,
    simulate,
    stopSimulate,
    isConnected: Boolean(state?.connected),
    context: state?.context ?? null,
  };
}

export function StudioConnectDialog({
  open,
  onClose,
  pairingCode,
  state,
  connecting,
  onPair,
  onDisconnect,
  onSimulate,
}: {
  open: boolean;
  onClose: () => void;
  pairingCode: string | null;
  state: StudioState | null;
  connecting: boolean;
  onPair: () => void;
  onDisconnect: () => void;
  onSimulate?: () => void;
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const connected = state?.connected;

  const serverUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    if (open && !pairingCode && !connecting) {
      onPair();
    }
  }, [open, pairingCode, connecting, onPair]);

  const copyCode = async () => {
    if (!pairingCode) return;
    try {
      await navigator.clipboard.writeText(pairingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const copyUrl = async () => {
    if (!serverUrl) return;
    try {
      await navigator.clipboard.writeText(serverUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 1600);
    } catch {
      /* ignore */
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

            <div className="relative max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Plug className="size-4 text-emerald-400" />
                  <span className="font-display font-bold">Connect Roblox Studio</span>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {!connected ? (
                    <motion.div
                      key="pairing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className="text-sm text-muted-foreground">
                        Pair this browser session with the BloxForge plugin in
                        Roblox Studio. The AI chat stays here — the plugin just
                        syncs your selected script and inserts generated code.
                      </p>

                      {/* Pairing code */}
                      <div className="mt-5">
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          ① Your pairing code
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-1 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/5 py-4">
                            {pairingCode ? (
                              <span className="font-mono text-3xl font-bold tracking-[0.3em] text-emerald-400">
                                {pairingCode}
                              </span>
                            ) : (
                              <Loader2 className="size-6 animate-spin text-muted-foreground" />
                            )}
                          </div>
                          <button
                            onClick={copyCode}
                            disabled={!pairingCode}
                            className="flex size-12 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:text-foreground disabled:opacity-40"
                            title="Copy pairing code"
                          >
                            {copiedCode ? (
                              <Check className="size-4 text-emerald-400" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Server URL */}
                      <div className="mt-4">
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          ② BloxForge server URL (paste in plugin)
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-1 items-center rounded-xl border border-border bg-background px-3 py-2.5">
                            <span className="truncate font-mono text-xs text-foreground">
                              {serverUrl || "—"}
                            </span>
                          </div>
                          <button
                            onClick={copyUrl}
                            disabled={!serverUrl}
                            className="flex size-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:text-foreground disabled:opacity-40"
                            title="Copy server URL"
                          >
                            {copiedUrl ? (
                              <Check className="size-4 text-emerald-400" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </button>
                        </div>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">
                          Paste this exact URL into the plugin’s “BloxForge Server
                          URL” field.
                        </p>
                      </div>

                      {/* Steps */}
                      <div className="mt-4 space-y-2.5">
                        <Step n={3}>
                          Open the <b>BloxForge plugin</b> in Roblox Studio
                          (toolbar button).
                        </Step>
                        <Step n={4}>
                          Paste the server URL + pairing code, then click{" "}
                          <b>Connect</b>.
                        </Step>
                      </div>

                      <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin text-emerald-400" />
                        Waiting for Studio to connect…
                      </div>

                      {/* Simulate + help */}
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                        {onSimulate && (
                          <button
                            onClick={onSimulate}
                            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:border-emerald-500/30 hover:text-foreground"
                            title="Simulate a Studio connection for testing"
                          >
                            <RefreshCw className="size-3.5" />
                            Simulate connection
                          </button>
                        )}
                        <button
                          onClick={() => setShowHelp((s) => !s)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                        >
                          {showHelp ? "Hide help" : "Not connecting?"}
                        </button>
                      </div>

                      {showHelp && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-muted-foreground">
                            <p className="font-semibold text-amber-300">
                              Connection troubleshooting
                            </p>
                            <ul className="list-disc space-y-1.5 pl-4">
                              <li>
                                Make sure the plugin’s server URL matches{" "}
                                <code className="rounded bg-white/10 px-1 font-mono text-[10px] text-foreground">
                                  {serverUrl}
                                </code>{" "}
                                exactly — no trailing slash, no{" "}
                                <code className="font-mono text-[10px]">/api</code>.
                              </li>
                              <li>
                                Roblox HttpService requires{" "}
                                <b>HTTPS</b>. Localhost (
                                <code className="font-mono text-[10px]">http://…</code>
                                ) only works from Studio on the same machine running
                                the dev server.
                              </li>
                              <li>
                                Check the Studio <b>Output</b> window for
                                <code className="font-mono text-[10px]">
                                  [BloxForge Connector]
                                </code>{" "}
                                error messages.
                              </li>
                              <li>
                                The pairing code expires after 10 minutes. Click
                                “Simulate connection” to test the flow without
                                Studio.
                              </li>
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="connected"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 14, delay: 0.1 }}
                        className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/15"
                      >
                        <Check className="size-8 text-emerald-400" />
                      </motion.div>
                      <h3 className="font-display text-xl font-bold">
                        Studio connected
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your Roblox Studio session is linked.
                      </p>

                      {state?.context ? (
                        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left">
                          <FileCode2 className="size-4 shrink-0 text-emerald-400" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">
                              {state.context.scriptName}
                            </p>
                            <p className="truncate font-mono text-[10px] text-muted-foreground">
                              {state.context.scriptPath}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-[10px]"
                          >
                            {state.context.lineCount} lines
                          </Badge>
                        </div>
                      ) : (
                        <p className="mt-4 text-xs text-muted-foreground">
                          Select a script in Studio to share it as context.
                        </p>
                      )}

                      <Button
                        onClick={onClose}
                        className="mt-5 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Start forging
                      </Button>
                      <button
                        onClick={onDisconnect}
                        className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-destructive"
                      >
                        <Unplug className="size-3" /> Disconnect
                      </button>
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

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-[11px] font-bold text-emerald-400">
        {n}
      </span>
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}

/** Compact badge shown in the chat header when Studio is connected. */
export function StudioBadge({
  context,
  onClick,
}: {
  context: StudioContext | null;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs transition hover:bg-emerald-500/20"
      title={context ? context.scriptPath : "Studio connected"}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
      </span>
      <Plug className="size-3.5 text-emerald-400" />
      <span className="hidden font-medium text-emerald-300 sm:inline">
        {context ? context.scriptName : "Studio"}
      </span>
    </button>
  );
}

/** Button to open the connect dialog (shown when not connected). */
export function ConnectStudioButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs transition hover:border-emerald-500/30 hover:bg-accent/40"
      title="Connect Roblox Studio"
    >
      <Plug className="size-3.5 text-muted-foreground" />
      <span className="hidden font-medium text-muted-foreground sm:inline">
        Connect Studio
      </span>
    </button>
  );
}
