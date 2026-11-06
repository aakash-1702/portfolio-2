"use client";

import { m, type Variants } from "motion/react";
import type { ReactNode } from "react";

export const ease = [0.16, 1, 0.3, 1] as const;
const viewport = { once: true, margin: "0px 0px -12% 0px" } as const;

export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </m.div>
  );
}

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function Stagger({
  children,
  className,
  stagger = 0.06,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: "div" | "ul" | "ol";
}) {
  const Comp = as === "ul" ? m.ul : as === "ol" ? m.ol : m.div;
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "span";
}) {
  const Comp = as === "li" ? m.li : as === "span" ? m.span : m.div;
  return (
    <Comp className={className} variants={item}>
      {children}
    </Comp>
  );
}
