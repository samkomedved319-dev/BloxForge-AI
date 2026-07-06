"use client";

import ReactMarkdown from "react-markdown";
import { useState, useRef, type ReactNode } from "react";
import { Check, Copy, Plug, Loader2, ChevronDown, FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deriveInstance, type InstanceType } from "@/lib/luau-naming";

interface MarkdownProps {
  content: string;
  className?: string;
  /** When Studio is connected, code blocks get an "Insert in Studio" button. */
  studioConnected?: boolean;
  /** Receives (code, language, instanceType, instanceName, parent). */
  onInsertCode?: (
    code: string,
    language: string,
    instanceType: InstanceType,
    instanceName: string,
    parent: string,
  ) => void;
}

function CodeBlock({
  language,
  heading,
  children,
  studioConnected,
  onInsertCode,
}: {
  language: string;
  heading?: string;
  children: ReactNode;
  studioConnected?: boolean;
  onInsertCode?: (
    code: string,
    language: string,
    instanceType: InstanceType,
    instanceName: string,
    parent: string,
  ) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [inserting, setInserting] = useState(false);
  const [inserted, setInserted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const code = typeof children === "string" ? children : String(children ?? "");

  // Strip ".lua" / ".luau" extensions + trailing punctuation from the heading
  const cleanHeading = (heading || "")
    .replace(/\.luau?$/i, "")
    .replace(/[.:]$/, "")
    .trim();

  const derived = deriveInstance(code, cleanHeading);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const insert = (overrideType?: InstanceType) => {
    if (!onInsertCode) return;
    const instanceType = overrideType || derived.instanceType;
    setInserting(true);
    setShowMenu(false);
    onInsertCode(code, language, instanceType, derived.instanceName, derived.parent);
    setTimeout(() => {
      setInserting(false);
      setInserted(true);
      setTimeout(() => setInserted(false), 2200);
    }, 600);
  };

  const isInsertable =
    studioConnected &&
    (language === "luau" || language === "lua" || language === "" || language === "text");

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-border bg-[oklch(0.14_0.012_250)]">
      <div className="flex items-center justify-between border-b border-border/60 bg-[oklch(0.18_0.013_250)] px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400/90">
            {language || "code"}
          </span>
          {cleanHeading && (
            <span className="truncate text-[11px] text-muted-foreground">
              · {cleanHeading}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isInsertable && (
            <div className="relative">
              <button
                onClick={() => setShowMenu((s) => !s)}
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
                    <Plug className="size-3" />
                    <span className="hidden sm:inline">
                      Insert · {derived.instanceName}
                    </span>
                    <span className="sm:hidden">Insert</span>
                    <ChevronDown className="size-3" />
                  </>
                )}
              </button>
              {showMenu && !inserting && !inserted && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-lg border border-border bg-popover shadow-2xl">
                    <div className="border-b border-border px-3 py-1.5">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Name
                      </p>
                      <p className="font-mono text-xs text-emerald-400">
                        {derived.instanceName}
                      </p>
                    </div>
                    <button
                      onClick={() => insert("ModuleScript")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-accent"
                    >
                      <FileCode2 className="size-3.5 text-emerald-400" />
                      ModuleScript
                      {derived.instanceType === "ModuleScript" && (
                        <Check className="ml-auto size-3 text-emerald-400" />
                      )}
                    </button>
                    <button
                      onClick={() => insert("Script")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-accent"
                    >
                      <FileCode2 className="size-3.5 text-emerald-400" />
                      Script (server)
                      {derived.instanceType === "Script" && (
                        <Check className="ml-auto size-3 text-emerald-400" />
                      )}
                    </button>
                    <button
                      onClick={() => insert("LocalScript")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-accent"
                    >
                      <FileCode2 className="size-3.5 text-emerald-400" />
                      LocalScript (client)
                      {derived.instanceType === "LocalScript" && (
                        <Check className="ml-auto size-3 text-emerald-400" />
                      )}
                    </button>
                    <button
                      onClick={() => insert("Part")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-accent"
                    >
                      <FileCode2 className="size-3.5 text-emerald-400" />
                      Part
                      {derived.instanceType === "Part" && (
                        <Check className="ml-auto size-3 text-emerald-400" />
                      )}
                    </button>
                    <button
                      onClick={() => insert("Model")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-accent"
                    >
                      <FileCode2 className="size-3.5 text-emerald-400" />
                      Model
                      {derived.instanceType === "Model" && (
                        <Check className="ml-auto size-3 text-emerald-400" />
                      )}
                    </button>
                    <div className="border-t border-border px-3 py-1.5">
                      <p className="text-[10px] text-muted-foreground">
                        → {derived.parent}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
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
  // Track the most recent h3 heading so the next code block can use it as its name.
  const lastHeadingRef = useRef<string | undefined>(undefined);

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
          h3: ({ children }) => {
            const text = extractText(children);
            lastHeadingRef.current = text;
            return (
              <h3 className="mt-4 mb-2 font-display text-base font-semibold">
                {children}
              </h3>
            );
          },
          p: ({ children }) => <p className="my-2.5 first:mt-0 last:mb-0">{children}</p>,
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
            const heading = lastHeadingRef.current;
            lastHeadingRef.current = undefined; // consume so the next block without a heading doesn't reuse
            return (
              <CodeBlock
                language={match?.[1] ?? ""}
                heading={heading}
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

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText((node as any).props?.children);
  }
  return "";
}
