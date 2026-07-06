"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

/** Scroll-triggered reveal wrapper. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container for lists/grids. */
export function Stagger({
  children,
  className,
  gap = 0.06,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 20,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Animated number counter that counts up when scrolled into view. */
export function Counter({
  to,
  from = 0,
  duration = 1.5,
  className,
  format = (v: number) => Math.round(v).toLocaleString(),
}: {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
  format?: (v: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(from);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = format(v);
    });
  }, [spring, format]);

  return (
    <span ref={ref} className={className}>
      {format(from)}
    </span>
  );
}

/** Floating animated gradient orbs for hero backgrounds. */
export function FloatingOrbs() {
  return (
    <>
      <div className="pointer-events-none absolute -top-24 left-1/4 size-72 rounded-full bg-emerald-500/20 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -top-16 right-1/4 size-72 rounded-full bg-teal-500/15 blur-3xl animate-blob [animation-delay:4s]" />
    </>
  );
}
