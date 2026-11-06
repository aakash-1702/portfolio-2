"use client";

import { AnimatePresence, m, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type State = "idle" | "listening" | "processing" | "speaking";
const STATES: State[] = ["idle", "listening", "processing", "speaking"];
const DURATION: Record<State, number> = { idle: 1100, listening: 2300, processing: 1500, speaking: 2500 };

const stateStyle: Record<State, { pill: string; text: string }> = {
  idle: { pill: "bg-white/10", text: "text-fg" },
  listening: { pill: "bg-ok/15", text: "text-ok" },
  processing: { pill: "bg-warn/15", text: "text-warn" },
  speaking: { pill: "bg-ai/15", text: "text-ai" },
};

const TURNS = [
  {
    you: "I'd store each number's complement in a hash map.",
    rag: "retrieved 3 chunks · two-sum › follow-ups",
    ai: "Good. What changes if the array is already sorted?",
  },
  {
    you: "Then two pointers from both ends, O(1) extra space.",
    rag: "retrieved 2 chunks · two-pointers › proofs",
    ai: "Why can moving the left pointer never skip a valid pair?",
  },
  {
    you: "Every pair it skips sums to less than the target.",
    rag: "scored answer against rubric · 4/5",
    ai: "Nice. Now let's talk about duplicates.",
  },
];

const BARS = 32;

export function VoiceLoop() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [state, setState] = useState<State>(reduce ? "speaking" : "idle");
  const [turn, setTurn] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const t = setTimeout(() => {
      if (state === "speaking") {
        setTurn((n) => (n + 1) % TURNS.length);
        setState("listening");
      } else setState(STATES[STATES.indexOf(state) + 1]!);
    }, DURATION[state]);
    return () => clearTimeout(t);
  }, [state, inView, reduce]);

  const current = TURNS[turn]!;
  const lines: { who: string; text: string; tone: string }[] = [];
  if (state !== "idle") lines.push({ who: "you", text: current.you, tone: "text-fg" });
  if (state === "processing" || state === "speaking") lines.push({ who: "rag", text: current.rag, tone: "text-warn/90" });
  if (state === "speaking") lines.push({ who: "ai", text: current.ai, tone: "text-ai" });

  const amp = state === "speaking" ? 1 : state === "listening" ? 0.55 : 0.08;

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-line bg-bg/60 p-4 sm:p-5"
      role="img"
      aria-label="Animation of the BaseCase AI interviewer moving through its states: idle, listening, processing with retrieval, and speaking."
    >
      <div className="flex items-center justify-between font-mono text-[11px] text-dim">
        <span>
          interview <span className="text-muted">· two-sum</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-err" /> live 12:34
        </span>
      </div>

      {/* FSM */}
      <div className="mt-5 flex items-center justify-between gap-1 font-mono text-[10.5px] sm:text-[11px]">
        {STATES.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-1 last:flex-none">
            <span
              className={cn(
                "relative rounded-full px-2.5 py-1 transition-colors duration-300",
                state === s ? stateStyle[s].text : "text-dim",
              )}
            >
              {state === s ? (
                <m.span
                  layoutId="fsm-active"
                  className={cn("absolute inset-0 -z-10 rounded-full", stateStyle[s].pill)}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}
              {s}
            </span>
            {i < STATES.length - 1 ? <span className="h-px flex-1 bg-line-strong" /> : null}
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-right font-mono text-[10px] text-dim">speaking ↺ listening · mic locked while AI speaks</p>

      {/* waveform */}
      <div className="relative mt-4 flex h-20 items-center justify-center gap-[3px] overflow-hidden rounded-xl border border-line bg-surface">
        <m.div
          className="flex h-full items-center gap-[3px]"
          animate={{ scaleY: amp, opacity: state === "processing" || state === "idle" ? 0.35 : 1 }}
          transition={{ duration: 0.4 }}
        >
          {Array.from({ length: BARS }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-12 w-[3px] origin-center rounded-full transition-colors duration-500",
                state === "speaking" ? "bg-ai" : state === "listening" ? "bg-ok" : "bg-dim",
                !reduce && "animate-wave",
              )}
              style={{
                animationDelay: `${(i * 97) % 700}ms`,
                animationDuration: `${700 + ((i * 131) % 500)}ms`,
              }}
            />
          ))}
        </m.div>
        <AnimatePresence>
          {state === "processing" ? (
            <m.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center gap-2 font-mono text-[11px] text-warn"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-warn" />
              grounding answer · qdrant
            </m.span>
          ) : null}
        </AnimatePresence>
      </div>

      {/* transcript */}
      <div className="mt-4 h-[78px] space-y-1.5 font-mono text-[11.5px] leading-[1.45]">
        <AnimatePresence mode="popLayout" initial={false}>
          {lines.map((l) => (
            <m.div
              key={`${turn}-${l.who}`}
              layout="position"
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.35 }}
              className="flex gap-2"
            >
              <span className="w-7 shrink-0 text-dim">{l.who}</span>
              <span className={cn("min-w-0", l.tone)}>{l.text}</span>
            </m.div>
          ))}
        </AnimatePresence>
        {state === "idle" ? <span className="text-dim">waiting for candidate…</span> : null}
      </div>
    </div>
  );
}
