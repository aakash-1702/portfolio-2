"use client";

/*
 * A tiny Remotion-style engine on top of Motion values.
 *
 * One clock (a MotionValue of seconds) drives the whole reel. Scenes read
 * their local time from context and derive styles from it, so frames are
 * deterministic, seekable and update the DOM without React re-renders.
 * Only discrete state changes (useStep) cause a render.
 */

import { m, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { createContext, useContext, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const LocalTime = createContext<MotionValue<number> | null>(null);
export const LocalTimeProvider = LocalTime.Provider;

export function useLocalTime() {
  const t = useContext(LocalTime);
  if (!t) throw new Error("useLocalTime must be used inside a reel scene");
  return t;
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Index of the last threshold crossed (0 = none yet). Re-renders only when it changes. */
export function useStep(times: readonly number[]) {
  const local = useLocalTime();
  const at = (v: number) => {
    let i = 0;
    while (i < times.length && v >= times[i]!) i++;
    return i;
  };
  const [step, setStep] = useState(() => at(local.get()));
  const current = useRef(step);
  useMotionValueEvent(local, "change", (v) => {
    const next = at(v);
    if (next !== current.current) {
      current.current = next;
      setStep(next);
    }
  });
  return step;
}

/** 0→1 between two scene-local times (clamped, optionally eased), as a MotionValue. */
export function useProgress(from: number, to: number, ease: (x: number) => number = (x) => x) {
  const local = useLocalTime();
  return useTransform(local, (v) => ease(clamp01((v - from) / (to - from))));
}

/** Fades/slides an element in at a scene-local time. Pure function of time: SSR-safe and seekable. */
export function Appear({
  at,
  dur = 0.55,
  y = 12,
  scale = 1,
  className,
  style,
  children,
}: {
  at: number;
  dur?: number;
  y?: number;
  scale?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const p = useProgress(at, at + dur, easeOutExpo);
  const ty = useTransform(p, (v) => (1 - v) * y);
  const sc = useTransform(p, (v) => scale + (1 - scale) * v);
  return (
    <m.div className={className} style={{ ...style, opacity: p, y: ty, scale: sc }}>
      {children}
    </m.div>
  );
}

export type Tone = "ember" | "sky" | "gold" | "rose";
export const toneText: Record<Tone, string> = {
  ember: "text-ember",
  sky: "text-sky",
  gold: "text-gold",
  rose: "text-rose",
};
export const toneChip: Record<Tone, string> = {
  ember: "border-ember/40 bg-ember/10 text-ember",
  sky: "border-sky/40 bg-sky/10 text-sky",
  gold: "border-gold/40 bg-gold/10 text-gold",
  rose: "border-rose/40 bg-rose/10 text-rose",
};

/** Left-hand (or top, on phones) title card shared by every chapter. */
export function Caption({
  index,
  kicker,
  title,
  sub,
  tags,
  tone,
}: {
  index: string;
  kicker: string;
  title: string;
  sub: string;
  tags: string[];
  tone: Tone;
}) {
  return (
    <div className="reel-caption">
      <Appear at={0.1} y={8}>
        <p className={cn("reel-kicker", toneText[tone])}>
          {index} <span className="text-dim">/</span> {kicker}
        </p>
      </Appear>
      <Appear at={0.2} y={16} dur={0.7}>
        <p className="reel-title mt-[1.4cqh] text-balance text-fg">{title}</p>
      </Appear>
      <Appear at={0.38} y={10}>
        <p className="reel-sub mt-[2.4cqh] text-pretty text-muted">{sub}</p>
      </Appear>
      <Appear at={0.52} y={8}>
        <ul className="mt-[3cqh] flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <li key={t} className="reel-tag rounded-full border border-line-strong bg-white/[0.03] text-muted">
              {t}
            </li>
          ))}
        </ul>
      </Appear>
    </div>
  );
}
