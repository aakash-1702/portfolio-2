"use client";

import { useQuery } from "@tanstack/react-query";
import { m, useTransform, type MotionValue } from "motion/react";
import { leetcodeQuery } from "@/lib/queries";
import { Appear, Caption, easeInOut, easeOutExpo, useProgress } from "./engine";

// Used only if the live query has no data (it is normally hydrated from the server).
const FALLBACK = {
  rating: 1868,
  badge: "Knight",
  topPercentage: 5.8,
  contests: 68,
  solved: { all: 931, easy: 366, medium: 473, hard: 92 },
  history: [1500, 1540, 1580, 1610, 1650, 1640, 1690, 1720, 1700, 1760, 1790, 1810, 1800, 1830, 1850, 1868],
};

function sparkPath(points: number[]) {
  const min = Math.min(...points) - 15;
  const max = Math.max(...points) + 15;
  return points
    .map((p, i) => `${i ? "L" : "M"}${((i / (points.length - 1)) * 100).toFixed(2)} ${(38 - ((p - min) / (max - min)) * 34).toFixed(2)}`)
    .join(" ");
}

function Bar({ label, value, max, p, color }: { label: string; value: number; max: number; p: MotionValue<number>; color: string }) {
  const scaleX = useTransform(p, (v) => v * (value / max));
  const count = useTransform(p, (v) => String(Math.round(value * v)));
  return (
    <div className="grid grid-cols-[18%_1fr_12%] items-center gap-[1.6cqmin]">
      <span className="text-muted">{label}</span>
      <span className="h-[1.3cqmin] min-h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <m.span className={`block h-full origin-left rounded-full ${color}`} style={{ scaleX }} />
      </span>
      <m.span className="text-right tabular-nums text-fg">{count}</m.span>
    </div>
  );
}

export function LeetCodeScene() {
  const { data } = useQuery(leetcodeQuery);
  const lc = {
    rating: data?.rating ?? FALLBACK.rating,
    badge: data?.badge ?? FALLBACK.badge,
    top: data?.topPercentage ?? FALLBACK.topPercentage,
    contests: data?.contests ?? FALLBACK.contests,
    solved: data?.solved ?? FALLBACK.solved,
    history: data?.history && data.history.length > 1 ? data.history : FALLBACK.history,
  };

  const count = useProgress(0.3, 2.0, easeOutExpo);
  const rating = useTransform(count, (v) => Math.round(lc.rating * v).toLocaleString("en-US"));
  const draw = useProgress(0.6, 2.4, easeInOut);
  const fill = useProgress(1.8, 2.8);
  const bars = useProgress(2.3, 3.6, easeOutExpo);
  const solved = useTransform(bars, (v) => Math.round(lc.solved.all * v).toLocaleString("en-US"));
  const maxBar = Math.max(lc.solved.easy, lc.solved.medium, lc.solved.hard, 1);
  const line = sparkPath(lc.history);

  return (
    <>
      <Caption
        index="04"
        kicker="LeetCode · live"
        tone="ember"
        title="Fundamentals, under a timer"
        sub={`${lc.badge} · top ${lc.top}% · ${lc.solved.all} problems solved. These numbers are fetched live from LeetCode.`}
        tags={["DSA", "weekly contests", "TanStack Query"]}
      />

      <div className="reel-visual font-mono text-[max(8px,2.2cqmin)]">
        {/* rating */}
        <Appear at={0.15} className="absolute left-0 top-[2%] w-[46%]">
          <p className="text-[max(8px,1.9cqmin)] uppercase tracking-[0.16em] text-dim">contest rating</p>
          <m.p className="mt-[1cqmin] font-sans text-[max(28px,15cqmin)] font-medium leading-none tracking-[-0.05em] text-fg tabular-nums">
            {rating}
          </m.p>
          <div className="mt-[2.2cqmin] flex flex-wrap items-center gap-[1.2cqmin]">
            <span className="rounded-full border border-gold/40 bg-gold/10 px-[1.6cqmin] py-[0.4cqmin] text-gold">{lc.badge}</span>
            <span className="text-muted">top {lc.top}%</span>
            <span className="text-dim">·</span>
            <span className="text-muted">{lc.contests} contests</span>
          </div>
        </Appear>

        {/* rating history */}
        <Appear at={0.3} className="absolute right-0 top-0 h-[58%] w-[50%] rounded-[1.8cqmin] border border-line bg-surface/80 p-[2cqmin]">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-[78%] w-full overflow-visible">
            <defs>
              <linearGradient id="reel-spark" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-ember)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--color-ember)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <m.path d={`${line} L100 40 L0 40 Z`} fill="url(#reel-spark)" style={{ opacity: fill }} />
            <m.path
              d={line}
              fill="none"
              stroke="var(--color-ember)"
              strokeWidth={1.8}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ pathLength: draw }}
            />
          </svg>
          <p className="mt-[1cqmin] text-[max(8px,1.8cqmin)] text-dim">last {lc.history.length} contests</p>
        </Appear>

        {/* solved */}
        <Appear at={2.1} className="absolute inset-x-0 bottom-0 top-[66%]">
          <div className="flex items-baseline justify-between">
            <p className="text-[max(8px,1.9cqmin)] uppercase tracking-[0.16em] text-dim">problems solved</p>
            <m.p className="font-sans text-[max(14px,4.6cqmin)] font-medium text-fg tabular-nums">{solved}</m.p>
          </div>
          <div className="mt-[1.4cqmin] space-y-[1.2cqmin]">
            <Bar label="Easy" value={lc.solved.easy} max={maxBar} p={bars} color="bg-sky" />
            <Bar label="Medium" value={lc.solved.medium} max={maxBar} p={bars} color="bg-gold" />
            <Bar label="Hard" value={lc.solved.hard} max={maxBar} p={bars} color="bg-rose" />
          </div>
        </Appear>
      </div>
    </>
  );
}
