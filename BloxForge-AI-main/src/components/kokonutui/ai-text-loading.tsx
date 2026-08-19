"use client";

/**
 * @author: @kokonutui
 * @description: AI Text Loading
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 *
 * Adapted for BloxForge AI — ChatGPT-style shimmering thinking states.
 */

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const BLOXFORGE_LOADING_TEXTS = [
  "Thinking…",
  "Generating Luau…",
  "Wiring remotes…",
  "Building GUI hierarchy…",
  "Authoring ModuleScripts…",
  "Syncing to Studio…",
];

interface AITextLoadingProps {
  texts?: string[];
  /** @deprecated use `texts` */
  messages?: string[];
  className?: string;
  interval?: number;
}

export default function AITextLoading({
  texts,
  messages,
  className,
  interval = 1500,
}: AITextLoadingProps) {
  const items = texts ?? messages ?? BLOXFORGE_LOADING_TEXTS;
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval, items.length]);

  return (
    <div className="flex items-center p-1">
      <motion.div
        animate={{ opacity: 1 }}
        className="relative px-1 py-0.5"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            animate={{
              opacity: 1,
              y: 0,
              backgroundPosition: ["200% center", "-200% center"],
            }}
            className={cn(
              "flex min-w-max items-center gap-1.5 whitespace-nowrap bg-[length:200%_100%] bg-gradient-to-r from-violet-300 via-white to-violet-300 bg-clip-text font-medium text-transparent",
              className,
            )}
            exit={{ opacity: 0, y: -12 }}
            initial={{ opacity: 0, y: 12 }}
            key={currentTextIndex}
            transition={{
              opacity: { duration: 0.28 },
              y: { duration: 0.28 },
              backgroundPosition: {
                duration: 2.2,
                ease: "linear",
                repeat: Number.POSITIVE_INFINITY,
              },
            }}
          >
            {items[currentTextIndex]}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export { AITextLoading };
