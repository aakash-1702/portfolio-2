"use client";

import { AnimatePresence, m, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/*
 * A small, deterministic simulation of QueueCTL's semantics:
 * workers claim the oldest runnable row with FOR UPDATE SKIP LOCKED, failures
 * back off exponentially (2^attempts), and exhausted jobs land in the DLQ.
 */

type JobState = "pending" | "processing" | "completed" | "failed" | "dead";
type Job = {
  id: string;
  cmd: string;
  ok: boolean;
  cost: number;
  state: JobState;
  attempts: number;
  worker: number | null;
  remaining: number;
  nextRunAt: number;
  claimedAt: number;
};
type Event = { id: number; tick: number; text: string; tone: "ok" | "warn" | "err" | "claim" };
type Sim = { tick: number; jobs: Job[]; events: Event[]; eid: number; idle: number };

const MAX_RETRIES = 3;
const WORKERS = 3;
const TICK_MS = 720;

const fresh = (): Sim => ({
  tick: 0,
  eid: 0,
  idle: 0,
  events: [],
  jobs: [
    { id: "job-1", cmd: "echo hello", ok: true, cost: 2 },
    { id: "job-2", cmd: "node build.js", ok: true, cost: 3 },
    { id: "job-3", cmd: "exit 1", ok: false, cost: 1 },
    { id: "job-4", cmd: "curl /health", ok: true, cost: 2 },
    { id: "job-5", cmd: "python etl.py", ok: true, cost: 4 },
    { id: "job-6", cmd: "send-digest", ok: true, cost: 1 },
  ].map((j) => ({ ...j, state: "pending" as JobState, attempts: 0, worker: null, remaining: 0, nextRunAt: 0, claimedAt: -1 })),
});

function advance(sim: Sim): Sim {
  const tick = sim.tick + 1;
  const jobs = sim.jobs.map((j) => ({ ...j }));
  const events = [...sim.events];
  let eid = sim.eid;
  const log = (text: string, tone: Event["tone"]) => events.push({ id: ++eid, tick, text, tone });

  // 1. Running jobs make progress and finish.
  for (const j of jobs) {
    if (j.state !== "processing" || --j.remaining > 0) continue;
    const w = j.worker;
    j.worker = null;
    if (j.ok) {
      j.state = "completed";
      log(`w${w} · ${j.id} exit 0 → completed`, "ok");
    } else if (++j.attempts >= MAX_RETRIES) {
      j.state = "dead";
      log(`${j.id} failed ${MAX_RETRIES}× → dead-letter queue`, "err");
    } else {
      const backoff = 2 ** j.attempts;
      j.state = "failed";
      j.nextRunAt = tick + backoff;
      log(`w${w} · ${j.id} exit 1 → retry in ${backoff}s`, "warn");
    }
  }

  // 2. Idle workers claim the oldest runnable row; rows locked this tick are skipped.
  const busy = new Set(jobs.filter((j) => j.state === "processing").map((j) => j.worker));
  for (let w = 1; w <= WORKERS; w++) {
    if (busy.has(w)) continue;
    const next = jobs.find((j) => j.state === "pending" || (j.state === "failed" && j.nextRunAt <= tick));
    if (!next) continue;
    const skipped = jobs.filter((j) => j.claimedAt === tick && jobs.indexOf(j) < jobs.indexOf(next)).map((j) => j.id);
    next.state = "processing";
    next.worker = w;
    next.remaining = next.cost;
    next.claimedAt = tick;
    busy.add(w);
    const retry = next.attempts > 0 ? ` (attempt ${next.attempts + 1})` : "";
    log(
      skipped.length ? `w${w} · skip locked ${skipped.join(", ")} → claim ${next.id}` : `w${w} · claim ${next.id}${retry}`,
      "claim",
    );
  }

  const settled = jobs.every((j) => j.state === "completed" || j.state === "dead");
  return { tick, jobs, events: events.slice(-4), eid, idle: settled ? sim.idle + 1 : 0 };
}

const workerColor = ["", "text-ok", "text-ai", "text-fg"];
const workerBg = ["", "bg-ok", "bg-ai", "bg-fg"];
const toneColor: Record<Event["tone"], string> = { ok: "text-ok", warn: "text-warn", err: "text-err", claim: "text-muted" };

function StatePill({ job, tick }: { job: Job; tick: number }) {
  const base = "inline-flex items-center gap-1.5 rounded-full border px-2 py-[1px]";
  switch (job.state) {
    case "processing":
      return (
        <span className={cn(base, "border-line-strong", workerColor[job.worker ?? 0])}>
          <span className={cn("size-1.5 animate-pulse rounded-full", workerBg[job.worker ?? 0])} />
          running
        </span>
      );
    case "completed":
      return <span className={cn(base, "border-ok/25 bg-ok/[0.06] text-ok")}>completed</span>;
    case "failed":
      return (
        <span className={cn(base, "border-warn/30 bg-warn/[0.06] text-warn")}>
          retry {Math.max(0, job.nextRunAt - tick)}s
        </span>
      );
    case "dead":
      return <span className={cn(base, "border-err/30 bg-err/[0.08] text-err")}>dead</span>;
    default:
      return <span className={cn(base, "border-line text-dim")}>pending</span>;
  }
}

export function QueueSim() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [sim, setSim] = useState<Sim>(fresh);

  useEffect(() => {
    if (reduce) {
      // Static, mid-run snapshot for reduced-motion users.
      let s = fresh();
      for (let i = 0; i < 5; i++) s = advance(s);
      setSim(s);
      return;
    }
    if (!inView) return;
    const t = setInterval(() => setSim((s) => (s.idle > 5 ? fresh() : advance(s))), TICK_MS);
    return () => clearInterval(t);
  }, [inView, reduce]);

  const live = sim.jobs.filter((j) => j.state !== "dead");
  const dead = sim.jobs.filter((j) => j.state === "dead");

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-line bg-bg/60 p-4 font-mono text-[11px] sm:p-5"
      role="img"
      aria-label="Simulation of QueueCTL: three workers claim jobs from Postgres using FOR UPDATE SKIP LOCKED, a failing job retries with exponential backoff and ends in the dead-letter queue."
    >
      <p className="overflow-hidden text-ellipsis whitespace-nowrap rounded-lg border border-line bg-surface px-3 py-2 text-[10.5px] text-dim">
        <span className="text-ai">SELECT</span> … <span className="text-ai">WHERE</span> state <span className="text-ai">IN</span>{" "}
        (&apos;pending&apos;,&apos;failed&apos;) <span className="text-ai">AND</span> &quot;nextRunAt&quot; &lt;= now(){" "}
        <span className="text-ai">LIMIT</span> 1 <span className="rounded bg-ok/10 px-1 text-ok">FOR UPDATE SKIP LOCKED</span>
      </p>

      {/* workers */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((w) => {
          const job = sim.jobs.find((j) => j.state === "processing" && j.worker === w);
          return (
            <div key={w} className="flex items-center justify-between rounded-lg border border-line bg-surface px-2.5 py-2">
              <span className={cn("flex items-center gap-1.5", workerColor[w])}>
                <span className={cn("size-1.5 rounded-full", workerBg[w], job && "animate-pulse")} />w{w}
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  key={job?.id ?? "idle"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className={job ? "text-fg" : "text-dim"}
                >
                  {job?.id ?? "idle"}
                </m.span>
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* jobs table */}
      <div className="mt-3 rounded-lg border border-line">
        <div className="grid grid-cols-[52px_1fr_84px_34px] gap-2 border-b border-line px-3 py-1.5 text-[10px] uppercase tracking-wider text-dim sm:grid-cols-[52px_1fr_92px_40px_44px]">
          <span>id</span>
          <span>command</span>
          <span>state</span>
          <span className="text-right">try</span>
          <span className="hidden text-right sm:block">lock</span>
        </div>
        <div className="relative px-3 py-1" style={{ minHeight: 6 * 26 }}>
          {live.map((j) => (
            <m.div
              key={j.id}
              layoutId={`q-${j.id}`}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className={cn(
                "grid h-[26px] grid-cols-[52px_1fr_84px_34px] items-center gap-2 sm:grid-cols-[52px_1fr_92px_40px_44px]",
                j.state === "completed" && "opacity-55",
              )}
            >
              <span className="text-fg">{j.id}</span>
              <span className="truncate text-muted">{j.cmd}</span>
              <span>
                <StatePill job={j} tick={sim.tick} />
              </span>
              <span className="text-right tabular-nums text-dim">
                {j.attempts}/{MAX_RETRIES}
              </span>
              <span className={cn("hidden text-right sm:block", workerColor[j.worker ?? 0])}>
                {j.state === "processing" ? `w${j.worker}` : ""}
              </span>
            </m.div>
          ))}
        </div>
      </div>

      {/* DLQ */}
      <div className="mt-3 rounded-lg border border-dashed border-err/25 bg-err/[0.03] px-3 py-2">
        <p className="text-[10px] uppercase tracking-wider text-err/80">dead-letter queue</p>
        <div className="mt-1 min-h-[26px]">
          {dead.length === 0 ? <p className="py-1 text-dim">empty</p> : null}
          {dead.map((j) => (
            <m.div
              key={j.id}
              layoutId={`q-${j.id}`}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
              className="flex h-[26px] items-center justify-between gap-2"
            >
              <span className="text-fg">
                {j.id} <span className="text-muted">{j.cmd}</span>
              </span>
              <span className="text-dim">queuectl dlq retry {j.id}</span>
            </m.div>
          ))}
        </div>
      </div>

      {/* event log */}
      <div className="mt-3 flex h-[72px] flex-col justify-end overflow-hidden">
        {sim.events.slice(-3).map((e) => (
          <m.p
            key={e.id}
            layout="position"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn("shrink-0 truncate leading-6", toneColor[e.tone])}
          >
            <span className="mr-2 text-dim">t+{String(e.tick).padStart(2, "0")}</span>
            {e.text}
          </m.p>
        ))}
        {sim.events.length === 0 ? <p className="leading-6 text-dim">$ queuectl worker start --count 3</p> : null}
      </div>
    </div>
  );
}
