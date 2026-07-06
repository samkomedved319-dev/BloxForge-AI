"use client";

import ReactMarkdown from "react-markdown";
import { useState, type ReactNode } from "react";
import { Check, Copy, Plug, Loader2, FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MarkdownProps {
  content: string;
  className?: string;
  /** When Studio is connected, code blocks get an "Insert in Studio" button. */
  studioConnected?: boolean;
  onInsertCode?: (code: string, language: string) => void;
}

function CodeBlock({
  language,
  children,
  studioConnected,
  onInsertCode,
}: {
  language: string;
  children: ReactNode;
  studioConnected?: boolean;
  onInsertCode?: (code: string, language: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [inserting, setInserting] = useState(false);
  const [inserted, setInserted] = useState(false);
  const code = typeof children === "string" ? children : String(children ?? "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const insert = async () => {
    if (!onInsertCode) return;
    setInserting(true);
    try {
      onInsertCode(code, language);
      // optimistic — the parent shows a toast with the real result
      setTimeout(() => {
        setInserting(false);
        setInserted(true);
        setTimeout(() => setInserted(false), 2200);
      }, 600);
    } catch {
      setInserting(false);
    }
  };

  const isInsertable =
    studioConnected &&
    (language === "luau" || language === "lua" || language === "" || language === "text");

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-border bg-[oklch(0.14_0.012_250)]">
      <div className="flex items-center justify-between border-b border-border/60 bg-[oklch(0.18_0.013_250)] px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400/90">
          {language || "code"}
        </span>
        <div className="flex items-center gap-1">
          {isInsertable && (
            <button
              onClick={insert}
              disabled={inserting}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-emerald-400 transition hover:bg-emerald-500/15"
            >
              {inserting ? (
                <>
                  <Loader2 className="size-3 animate-spin" /> Sending…
                </>
              ) : inserted ? (
                <>
                  <Check className="size-3" /> Sent
                </>
              ) : (
                <>
                  <Plug className="size-3" /> Insert in Studio
                </>
              )}
            </button>
          )}
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="size-3 text-emerald-400" /> Copied
              </>
            ) : (
              <>
                <Copy className="size-3" /> Copy
              </>
            )}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-foreground/90">{children}</code>
      </pre>
    </div>
  );
}

export function Markdown({
  content,
  className,
  studioConnected,
  onInsertCode,
}: MarkdownProps) {
  return (
    <div
      className={cn(
        "prose-bloxforge max-w-none text-[14px] leading-relaxed text-foreground/90",
        className,
      )}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mt-5 mb-3 font-display text-2xl font-bold tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-5 mb-2.5 font-display text-xl font-bold tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-2 font-display text-base font-semibold">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-2.5 first:mt-0 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-2.5 list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 list-decimal space-y-1 pl-5">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 underline decoration-emerald-400/40 underline-offset-2 hover:decoration-emerald-400"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-emerald-500/50 bg-emerald-500/5 py-1 pl-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-border" />,
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");
            if (isInline) {
              return (
                <code
                  className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12.5px] text-emerald-300"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <CodeBlock
                language={match?.[1] ?? ""}
                studioConnected={studioConnected}
                onInsertCode={onInsertCode}
              >
                {String(children).replace(/\n$/, "")}
              </CodeBlock>
            );
          },
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-[13px]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border bg-white/5 px-3 py-2 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border/50 px-3 py-2">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
