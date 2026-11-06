"use client";

import { useInView } from "motion/react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { cn } from "@/lib/utils";

// Each simulation is its own chunk, mounted shortly before it scrolls into view.
const VoiceLoop = dynamic(() => import("./voice-loop").then((mod) => mod.VoiceLoop), { ssr: false });
const QueueSim = dynamic(() => import("./queue-sim").then((mod) => mod.QueueSim), { ssr: false });

const REGISTRY = {
  voice: { Component: VoiceLoop, minH: "min-h-[400px]", label: "voice interviewer simulation" },
  queue: { Component: QueueSim, minH: "min-h-[540px]", label: "job queue simulation" },
} as const;

export function LazyViz({ kind }: { kind: keyof typeof REGISTRY }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "400px 0px" });
  const { Component, minH, label } = REGISTRY[kind];
  return (
    <div ref={ref} className={minH}>
      {near ? (
        <Component />
      ) : (
        <div className={cn("grid place-items-center rounded-2xl border border-line bg-bg/40 font-mono text-[11px] text-dim", minH)}>
          loading {label}…
        </div>
      )}
    </div>
  );
}
