"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const DEFAULT_MESSAGES = [
  "Thinking...",
  "Analyzing your request...",
  "Generating Luau code...",
  "Building instances...",
  "Optimizing...",
];

/**
 * AI Text Loading — KokonutUI-inspired animated thinking indicator.
 * Cycles status messages with a shimmering gradient text effect.
 */
export function AITextLoading({
  messages = DEFAULT_MESSAGES,
  interval = 2000,
  className,
}: {
  messages?: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, interval);
    return () => clearInterval(timer);
  }, [messages.length, interval]);

  return (
    <div className={className}>
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400 bg-[length:200%_100%] bg-clip-text text-sm font-medium text-transparent"
        style={{
          animation: "shimmer-text 2s linear infinite",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {messages[index]}
          </motion.span>
        </AnimatePresence>
        <span className="ml-1 inline-flex">
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ·
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
          >
            ·
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
          >
            ·
          </motion.span>
        </span>
      </motion.div>
      <style>{`
        @keyframes shimmer-text {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
