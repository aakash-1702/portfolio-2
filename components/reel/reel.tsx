"use client";

import {
  m,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LocalTimeProvider } from "./engine";
import { ChatFinScene } from "./scene-chatfin";

// Chapter 1 is server-rendered as the poster frame. Chapters 2-4 are separate
// chunks, prefetched once playback starts so a cut never waits on the network.
const loadBaseCase = () => import("./scene-basecase").then((mod) => mod.BaseCaseScene);
const loadQueue = () => import("./scene-queue").then((mod) => mod.QueueScene);
const loadLeetCode = () => import("./scene-leetcode").then((mod) => mod.LeetCodeScene);
const BaseCaseScene = dynamic(loadBaseCase, { ssr: false });
const QueueScene = dynamic(loadQueue, { ssr: false });
const LeetCodeScene = dynamic(loadLeetCode, { ssr: false });
const prefetchChapters = () => void Promise.all([loadBaseCase(), loadQueue(), loadLeetCode()]);

type Chapter = { id: string; label: string; title: string; dur: number; poster: number; Scene: ComponentType };

const CHAPTERS: Chapter[] = [
  { id: "chatfin", label: "ChatFin", title: "agent infrastructure", dur: 7.5, poster: 5.6, Scene: ChatFinScene },
  { id: "basecase", label: "BaseCase", title: "AI voice interviewer", dur: 7.5, poster: 4.9, Scene: BaseCaseScene },
  { id: "queuectl", label: "QueueCTL", title: "broker-less job queue", dur: 7.5, poster: 6.2, Scene: QueueScene },
  { id: "leetcode", label: "LeetCode", title: "live contest stats", dur: 6.5, poster: 4.2, Scene: LeetCodeScene },
];
const STARTS = CHAPTERS.map((_, i) => CHAPTERS.slice(0, i).reduce((s, c) => s + c.dur, 0));
const TOTAL = CHAPTERS.reduce((s, c) => s + c.dur, 0);
const BOUNDARIES = [...STARTS.slice(1), TOTAL];
// The server renders this frame, so the HTML already shows the first chapter.
const INITIAL_T = 1.1;

const chapterAt = (v: number) => {
  let i = 0;
  for (let k = 0; k < STARTS.length; k++) if (v >= STARTS[k]!) i = k;
  return i;
};
const timecode = (v: number) => `00:${String(Math.floor(v)).padStart(2, "0")}`;

function SceneHost({ t, start, dur, children }: { t: MotionValue<number>; start: number; dur: number; children: ReactNode }) {
  const local = useTransform(t, (v) => v - start);
  const opacity = useTransform(local, [0, 0.35, dur - 0.4, dur], [0, 1, 1, 0]);
  const scale = useTransform(local, [0, 0.9, dur - 0.4, dur], [1.035, 1, 1, 0.985]);
  return (
    <LocalTimeProvider value={local}>
      <m.div className="absolute inset-0" style={{ opacity, scale }}>
        {children}
      </m.div>
    </LocalTimeProvider>
  );
}

function ChapterFill({ t, start, dur }: { t: MotionValue<number>; start: number; dur: number }) {
  const scaleX = useTransform(t, (v) => Math.min(1, Math.max(0, (v - start) / dur)));
  return <m.span className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-ember to-gold" style={{ scaleX }} />;
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="size-3.5 translate-x-px" fill="currentColor" aria-hidden>
    <path d="M7 4.5v15a1 1 0 0 0 1.53.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z" />
  </svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
    <rect x="6" y="4.5" width="4" height="15" rx="1" />
    <rect x="14" y="4.5" width="4" height="15" rx="1" />
  </svg>
);

export function Reel() {
  const ref = useRef<HTMLDivElement>(null);
  const t = useMotionValue(INITIAL_T);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { margin: "0px 0px -8% 0px" });
  const [playing, setPlaying] = useState(false);
  const [chapter, setChapter] = useState(0);
  const chapterRef = useRef(0);
  const running = playing && inView;
  const runningRef = useRef(false);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  // Start once the main thread is idle so the reel never competes with hydration.
  // Reduced motion: no autoplay; each chapter shows a still "poster" frame instead.
  useEffect(() => {
    if (reduce) {
      t.set(CHAPTERS[0]!.poster);
      prefetchChapters();
      return;
    }
    const start = () => {
      prefetchChapters();
      setPlaying(true);
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 700);
    return () => window.clearTimeout(id);
  }, [reduce, t]);

  // The clock. Clamping delta keeps a backgrounded tab from skipping whole chapters.
  useAnimationFrame((_, delta) => {
    if (!runningRef.current) return;
    const next = t.get() + Math.min(delta, 64) / 1000;
    t.set(next >= TOTAL ? next - TOTAL : next);
  });

  useMotionValueEvent(t, "change", (v) => {
    const i = chapterAt(v);
    if (i !== chapterRef.current) {
      chapterRef.current = i;
      setChapter(i);
    }
  });

  const clock = useTransform(t, timecode);
  // Light sweep across each cut between chapters.
  const sweep = useTransform(t, (v) => {
    for (const b of BOUNDARIES) {
      const d = v - b;
      if (d > -0.4 && d < 0.4) return (d + 0.4) / 0.8;
    }
    return v < 0.4 ? (v + 0.4) / 0.8 : -1;
  });
  const sweepX = useTransform(sweep, (p) => `${p < 0 ? -120 : -60 + p * 220}%`);
  const sweepOpacity = useTransform(sweep, (p) => (p < 0 ? 0 : Math.sin(p * Math.PI) * 0.75));

  const seek = (i: number) => {
    const showPoster = reduce && !playing;
    t.set(STARTS[i]! + (showPoster ? CHAPTERS[i]!.poster : 0.001));
  };

  const current = CHAPTERS[chapter]!;

  return (
    <div className="reel-perspective">
      <div
        ref={ref}
        className="reel reel-tilt relative overflow-hidden rounded-[22px] border border-line-strong bg-[#090b11] shadow-[0_50px_140px_-40px_rgb(0_0_0/0.9),0_0_0_1px_rgb(255_255_255/0.02)]"
        data-paused={running ? undefined : ""}
        data-chapter={current.id}
      >
        <p className="sr-only">
          Animated showreel rendered in code, four chapters: ChatFin agent infrastructure, the BaseCase AI interviewer, the
          QueueCTL job queue, and live LeetCode stats.
        </p>
        <div className="reel-stage relative aspect-[4/5] overflow-hidden sm:aspect-video" aria-hidden>
          {/* backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,#10131c,#07080c_70%)]" />
          <div className="reel-leak reel-leak-a -right-[12%] -top-[35%] h-[85%] w-[60%]" />
          <div className="reel-leak reel-leak-b -bottom-[40%] -left-[12%] h-[75%] w-[50%]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(196_210_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(196_210_255/0.035)_1px,transparent_1px)] bg-[size:4cqw_4cqw] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_45%,#000_30%,transparent_80%)]" />

          <SceneHost key={current.id} t={t} start={STARTS[chapter]!} dur={current.dur}>
            <current.Scene />
          </SceneHost>

          <m.div
            className="pointer-events-none absolute inset-y-0 w-[40%] bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--color-gold)_22%,transparent),color-mix(in_oklab,var(--color-ember)_35%,transparent),transparent)] mix-blend-screen"
            style={{ x: sweepX, opacity: sweepOpacity }}
          />
          <div className="grain" />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgb(0_0_0/0.7)]" />

          {/* player chrome */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 font-mono text-[10.5px] text-muted sm:px-5">
            <span className="flex items-center gap-2">
              <span className={cn("size-1.5 rounded-full bg-ember", running && "animate-pulse")} />
              <span className="text-fg/90">REC</span>
              <span className="hidden text-dim sm:inline">· reel.tsx · rendered live</span>
            </span>
            <span className="tabular-nums">
              <m.span>{clock}</m.span>
              <span className="text-dim"> / {timecode(TOTAL)}</span>
            </span>
          </div>
        </div>

        {/* controls */}
        <div className="flex items-center gap-3 border-t border-line bg-surface/85 px-3 py-2.5 sm:gap-4 sm:px-4">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause showreel" : "Play showreel"}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-fg text-bg transition-transform hover:scale-105 active:scale-95"
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <div className="grid flex-1 grid-cols-4 gap-1.5 sm:gap-2.5">
            {CHAPTERS.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => seek(i)}
                aria-label={`Jump to ${c.label}: ${c.title}`}
                aria-current={i === chapter ? "step" : undefined}
                className="group min-w-0 py-1 text-left"
              >
                <span className="relative block h-[3px] overflow-hidden rounded-full bg-white/10">
                  <ChapterFill t={t} start={STARTS[i]!} dur={c.dur} />
                </span>
                <span
                  className={cn(
                    "mt-1.5 block truncate font-mono text-[10.5px] transition-colors",
                    i === chapter ? "text-fg" : "text-dim group-hover:text-muted",
                  )}
                >
                  {c.label}
                  <span className="hidden text-dim lg:inline"> · {c.title}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
