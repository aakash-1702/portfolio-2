"use client";

import { AnimatePresence, m } from "motion/react";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { Appear, Caption, useStep } from "./engine";

const STATES = ["idle", "listening", "processing", "speaking"] as const;
type State = (typeof STATES)[number];

const pill: Record<State, string> = {
  idle: "bg-white/10",
  listening: "bg-sky/15",
  processing: "bg-gold/15",
  speaking: "bg-ember/15",
};
const text: Record<State, string> = {
  idle: "text-fg",
  listening: "text-sky",
  processing: "text-gold",
  speaking: "text-ember",
};

const CHUNKS = ["two-sum › follow-ups", "hash map › edge cases", "rubric › complexity"];
const BARS = 34;

function Transcript({ who, tone, line }: { who: string; tone: string; line: string }) {
  return (
    <m.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex gap-[1.8cqmin]"
    >
      <span className="w-[5cqmin] min-w-6 shrink-0 text-dim">{who}</span>
      <span className={cn("min-w-0", tone)} style={{ animation: `type 1.1s steps(${line.length}) both` }}>
        {line}
      </span>
    </m.p>
  );
}

export function BaseCaseScene() {
  // 0 idle · 1 listening · 2 processing (RAG) · 3 speaking
  const step = useStep([0.7, 2.6, 3.9]);
  const state = STATES[step]!;
  const amp = state === "speaking" ? 1 : state === "listening" ? 0.62 : 0.08;

  return (
    <>
      <Caption
        index="02"
        kicker="BaseCase"
        tone="sky"
        title="An AI interviewer that listens"
        sub="RAG over Qdrant, a strict four-state voice machine and a self-hosted judge. 1,000+ users and 100+ mock interviews."
        tags={["Qdrant", "OpenAI SDK", "Judge0", "SM-2"]}
      />

      <div className="reel-visual">
        {/* state machine */}
        <Appear at={0.15} className="absolute inset-x-0 top-0 flex items-center gap-[1cqmin] font-mono text-[max(8px,2.3cqmin)]">
          {STATES.map((s, i) => (
            <Fragment key={s}>
              <span
                className={cn(
                  "relative isolate rounded-full px-[2cqmin] py-[0.9cqmin] transition-colors duration-300",
                  s === state ? text[s] : "text-dim",
                )}
              >
                {s === state ? (
                  <m.span
                    layoutId="reel-fsm"
                    className={cn("absolute inset-0 -z-10 rounded-full", pill[s])}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                {s}
              </span>
              {i < STATES.length - 1 ? <span className="h-px min-w-2 flex-1 bg-line-strong" /> : null}
            </Fragment>
          ))}
        </Appear>

        {/* vector store */}
        <Appear at={0.3} className="absolute left-0 top-[22%] w-[21%]">
          <div className="rounded-[1.6cqmin] border border-line-strong bg-surface-2/90 p-[1.8cqmin]">
            <div className="grid grid-cols-4 gap-[1.2cqmin]">
              {Array.from({ length: 16 }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "aspect-square rounded-full transition-colors duration-500",
                    step === 2 && [1, 6, 11].includes(i) ? "bg-gold shadow-[0_0_10px_var(--color-gold)]" : "bg-sky/30",
                  )}
                />
              ))}
            </div>
            <p className="mt-[1.4cqmin] font-mono text-[max(8px,1.9cqmin)] text-dim">qdrant · vectors</p>
          </div>
        </Appear>

        {/* waveform */}
        <Appear
          at={0.25}
          className="absolute left-[27%] right-0 top-[22%] h-[38%] overflow-hidden rounded-[2cqmin] border border-line bg-bg/50"
        >
          <m.div
            className="flex h-full items-center justify-center gap-[0.8cqmin] px-[3cqmin]"
            animate={{ scaleY: amp }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {Array.from({ length: BARS }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-[72%] w-[0.9cqmin] min-w-[2px] animate-wave rounded-full transition-colors duration-500",
                  state === "speaking" ? "bg-ember" : state === "listening" ? "bg-sky" : "bg-dim",
                )}
                style={{ animationDelay: `${(i * 97) % 700}ms`, animationDuration: `${640 + ((i * 131) % 480)}ms` }}
              />
            ))}
          </m.div>
          <AnimatePresence>
            {state === "processing" ? (
              <m.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-0 bottom-[9%] text-center font-mono text-[max(8px,2cqmin)] text-gold/90"
              >
                grounding the next question
              </m.p>
            ) : null}
          </AnimatePresence>
        </Appear>

        {/* retrieved chunks fly from the vector store into the model */}
        <AnimatePresence>
          {state === "processing"
            ? CHUNKS.map((c, i) => (
                <m.span
                  key={c}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-[1cqmin] border border-gold/40 bg-surface px-[1.4cqmin] py-[0.5cqmin] font-mono text-[max(8px,1.9cqmin)] text-gold"
                  initial={{ left: "11%", top: "38%", opacity: 0, scale: 0.85 }}
                  animate={{ left: "63.5%", top: `${30 + i * 8}%`, opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.9, delay: i * 0.16, ease: [0.16, 1, 0.3, 1] }}
                >
                  {c}
                </m.span>
              ))
            : null}
        </AnimatePresence>

        {/* transcript */}
        <div className="absolute inset-x-0 bottom-0 top-[68%] space-y-[1.6cqmin] font-mono text-[max(9px,2.35cqmin)] leading-snug">
          {step >= 1 ? <Transcript who="you" tone="text-sky" line="I'd store each number's complement in a hash map." /> : null}
          {step >= 3 ? <Transcript who="ai" tone="text-ember" line="Good. What changes if the array is already sorted?" /> : null}
        </div>
      </div>
    </>
  );
}
