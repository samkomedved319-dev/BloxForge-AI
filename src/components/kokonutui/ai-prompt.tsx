"use client";

/**
 * @author: @kokonutui
 * @description: AI Prompt Input
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 *
 * Adapted for BloxForge AI — NVIDIA model selector, auto-resize,
 * file attach, Enter-to-submit, ChatGPT-style thinking-ready composer.
 */

import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Cpu,
  Loader2,
  Paperclip,
  Square,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/utils";

export const BLOXFORGE_MODELS = [
  "Nemotron 70B",
  "Qwen2.5 Coder",
  "DeepSeek R1",
  "Llama 3.3 70B",
  "Llama 3.1 405B",
];

export interface AIPromptProps {
  models?: string[];
  defaultModel?: string;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  placeholder?: string;
  headerText?: string;
  headerAction?: string;
  showHeader?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string, model: string) => void;
  onFileSelect?: (file: File) => void;
  fileAccept?: string;
  fileName?: string | null;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  className?: string;
  disabled?: boolean;
  streaming?: boolean;
  onStop?: () => void;
  variant?: "hero" | "chat";
}

export default function AI_Prompt({
  models = BLOXFORGE_MODELS,
  defaultModel,
  selectedModel,
  onModelChange,
  placeholder = "Describe a Roblox system in plain English…",
  headerText = "NVIDIA Nemotron is live",
  headerAction = "Forge now",
  showHeader = true,
  value: controlledValue,
  onChange,
  onSubmit,
  onFileSelect,
  fileAccept = ".lua,.luau,.txt,image/*",
  fileName: controlledFileName,
  onKeyDown,
  className,
  disabled,
  streaming,
  onStop,
  variant = "hero",
}: AIPromptProps) {
  const [internalValue, setInternalValue] = useState("");
  const value = controlledValue ?? internalValue;
  const setValue = (next: string) => {
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
  };

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: variant === "chat" ? 56 : 72,
    maxHeight: 280,
  });
  const [internalModel, setInternalModel] = useState(
    defaultModel ?? models[0] ?? "Nemotron 70B",
  );
  const model = selectedModel ?? internalModel;
  const setModel = (next: string) => {
    if (selectedModel === undefined) setInternalModel(next);
    onModelChange?.(next);
  };

  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const fileName = controlledFileName ?? localFileName;

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || streaming) return;
    onSubmit?.(trimmed, model);
    if (controlledValue === undefined) {
      setInternalValue("");
      adjustHeight(true);
    }
    setLocalFileName(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className={cn("w-full", variant === "hero" ? "py-1" : "py-0", className)}>
      <div
        className={cn(
          "rounded-2xl p-1.5",
          variant === "hero" ? "border border-violet-500/20 bg-white/5 pt-3" : "bg-white/5 pt-2",
        )}
      >
        {showHeader && variant === "hero" ? (
          <div className="mx-2 mb-2 flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2">
              <Cpu className="size-3.5 text-violet-400" />
              <h3 className="text-xs tracking-tight text-white/90">{headerText}</h3>
            </div>
            <p className="text-xs tracking-tight text-violet-300">{headerAction}</p>
          </div>
        ) : null}

        <div className="relative">
          <div className="relative flex flex-col">
            <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
              <Textarea
                className={cn(
                  "w-full resize-none rounded-xl rounded-b-none border-none bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0",
                  variant === "chat" ? "min-h-[56px]" : "min-h-[72px]",
                )}
                id={variant === "chat" ? "ai-input-chat" : "ai-input-hero"}
                onChange={(e) => {
                  setValue(e.target.value);
                  adjustHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                ref={textareaRef}
                value={value}
                disabled={disabled}
                aria-label="Prompt"
              />
            </div>

            <div className="flex h-14 items-center rounded-b-xl bg-white/5">
              <div className="absolute right-3 bottom-3 left-3 flex w-[calc(100%-24px)] items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="flex h-8 items-center gap-1 rounded-md pr-2 pl-1 text-xs text-white hover:bg-white/10"
                        variant="ghost"
                        type="button"
                        disabled={disabled}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-1"
                            exit={{ opacity: 0, y: 5 }}
                            initial={{ opacity: 0, y: -5 }}
                            key={model}
                            transition={{ duration: 0.15 }}
                          >
                            <Bot className="size-3.5 text-violet-400" />
                            <span className="max-w-40 truncate">{model}</span>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </motion.div>
                        </AnimatePresence>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-48 border-white/10 bg-neutral-950">
                      {models.map((m) => (
                        <DropdownMenuItem
                          className="flex items-center justify-between gap-2"
                          key={m}
                          onSelect={() => setModel(m)}
                        >
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-violet-400/80" />
                            <span>{m}</span>
                          </div>
                          {model === m && <Check className="h-4 w-4 text-violet-400" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="mx-0.5 h-4 w-px bg-white/10" />
                  <label
                    aria-label="Attach file"
                    className={cn(
                      "cursor-pointer rounded-lg bg-white/5 p-2",
                      "text-white/40 hover:bg-white/10 hover:text-white",
                      disabled && "pointer-events-none opacity-40",
                    )}
                  >
                    <input
                      className="hidden"
                      type="file"
                      accept={fileAccept}
                      disabled={disabled}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setLocalFileName(f.name);
                        onFileSelect?.(f);
                        e.target.value = "";
                      }}
                    />
                    <Paperclip className="h-4 w-4 transition-colors" />
                  </label>
                  {fileName ? (
                    <span className="hidden max-w-28 truncate text-[10px] text-white/50 sm:inline">
                      {fileName}
                    </span>
                  ) : null}
                </div>
                {streaming ? (
                  <button
                    aria-label="Stop generating"
                    className="rounded-lg bg-red-500/80 p-2 text-white hover:bg-red-500"
                    type="button"
                    onClick={onStop}
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    aria-label="Send message"
                    className={cn(
                      "rounded-lg bg-violet-500 p-2 text-slate-950",
                      "hover:bg-violet-400 focus-visible:ring-2 focus-visible:ring-violet-400",
                      "disabled:opacity-40",
                    )}
                    disabled={!value.trim() || disabled}
                    type="button"
                    onClick={submit}
                  >
                    {disabled ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight
                        className={cn(
                          "h-4 w-4 transition-opacity duration-200",
                          value.trim() ? "opacity-100" : "opacity-40",
                        )}
                      />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
