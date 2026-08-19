"use client";

import { Cpu, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AITextLoading from "@/components/kokonutui/ai-text-loading";
import { Card } from "@/components/ui/card";

function highlightLuau(code: string) {
  const escaped = code
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
  return escaped
    .replace(/(\-\-!strict|\-\-[^\n]*)/g, '<span class="text-muted-foreground">$1</span>')
    .replace(
      /\b(local|function|end|return|for|in|do|then|if|else|elseif|export|type|and|or|not)\b/g,
      '<span class="text-violet-400">$1</span>',
    )
    .replace(/\b(true|false|nil)\b/g, '<span class="text-amber-300">$1</span>')
    .replace(/\b(Player|ModuleScript|RemoteEvent)\b/g, '<span class="text-sky-300">$1</span>');
}

export function CodePreview({
  code,
  thinking,
  fileName = "RoundManager.lua",
}: {
  code: string;
  thinking: boolean;
  fileName?: string;
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (thinking) {
      setShown("");
      return;
    }
    let i = 0;
    setShown("");
    const id = window.setInterval(() => {
      i += 4;
      setShown(code.slice(0, i));
      if (i >= code.length) window.clearInterval(id);
    }, 14);
    return () => window.clearInterval(id);
  }, [code, thinking]);

  const html = useMemo(() => highlightLuau(shown), [shown]);

  return (
    <Card className="relative overflow-hidden border-border/60 bg-[oklch(0.13_0.018_280)] shadow-2xl shadow-violet-950/40">
      <div className="flex items-center gap-2 border-b border-border/60 bg-[oklch(0.16_0.02_280)] px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-red-500/70" />
          <span className="size-2.5 rounded-full bg-amber-500/70" />
          <span className="size-2.5 rounded-full bg-violet-500/70" />
        </div>
        <span className="ml-2 font-mono text-[11px] text-muted-foreground">{fileName}</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 font-mono text-[10px] text-violet-300">
          <Cpu className="size-2.5" /> Nemotron
        </span>
      </div>
      <div className="relative min-h-72">
        {thinking ? (
          <div className="absolute inset-0 grid place-items-center">
            <AITextLoading className="text-lg font-semibold sm:text-xl" />
          </div>
        ) : (
          <pre className="max-h-96 overflow-auto p-5 text-[12.5px] leading-relaxed">
            <code
              className="font-mono"
              dangerouslySetInnerHTML={{
                __html:
                  html +
                  (shown.length < code.length
                    ? '<span class="text-violet-400">▍</span>'
                    : ""),
              }}
            />
          </pre>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-border/60 bg-[oklch(0.16_0.02_280)] px-4 py-2.5">
        <span className="font-mono text-[10px] text-muted-foreground">
          {thinking ? "thinking" : "streamed"} · Luau
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-violet-500/15 px-2 py-1 text-[10px] font-semibold text-violet-300">
          <Zap className="size-2.5" /> Insert as Script
        </span>
      </div>
    </Card>
  );
}
