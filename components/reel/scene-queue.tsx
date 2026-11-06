"use client";

import { AnimatePresence, m } from "motion/react";
import { cn } from "@/lib/utils";
import { Appear, Caption, useStep } from "./engine";

type RowState = "pending" | "running" | "done" | "retry" | "dead";
type Row = { id: number; cmd: string; state: RowState; worker?: number; tries: number; backoff?: number };
type Ev = {
  t: number;
  kind: "claim" | "done" | "fail" | "dead";
  job: number;
  worker?: number;
  skipped?: number[];
  backoff?: number;
  log: string;
};

const JOBS = ["echo hello", "node build.js", "exit 1", "curl /health", "python etl.py", "send-digest"];

// A scripted replay of QueueCTL's semantics: oldest runnable row first, rows
// locked by another worker are skipped, failures back off 2^n seconds.
const EVENTS: Ev[] = [
  { t: 0.9, kind: "claim", job: 1, worker: 1, log: "w1 · claim job-1" },
  { t: 1.2, kind: "claim", job: 2, worker: 2, skipped: [1], log: "w2 · skip locked job-1 → claim job-2" },
  { t: 1.5, kind: "claim", job: 3, worker: 3, skipped: [1, 2], log: "w3 · skip locked job-1, job-2 → claim job-3" },
  { t: 2.2, kind: "done", job: 1, log: "w1 · job-1 exit 0 → completed" },
  { t: 2.4, kind: "claim", job: 4, worker: 1, log: "w1 · claim job-4" },
  { t: 2.7, kind: "fail", job: 3, backoff: 2, log: "w3 · job-3 exit 1 → retry in 2s" },
  { t: 2.9, kind: "claim", job: 5, worker: 3, log: "w3 · claim job-5" },
  { t: 3.3, kind: "done", job: 2, log: "w2 · job-2 exit 0 → completed" },
  { t: 3.6, kind: "claim", job: 3, worker: 2, log: "w2 · claim job-3 (attempt 2)" },
  { t: 4.1, kind: "fail", job: 3, backoff: 4, log: "w2 · job-3 exit 1 → retry in 4s" },
  { t: 4.25, kind: "claim", job: 6, worker: 2, log: "w2 · claim job-6" },
  { t: 4.6, kind: "done", job: 4, log: "w1 · job-4 exit 0 → completed" },
  { t: 4.85, kind: "done", job: 5, log: "w3 · job-5 exit 0 → completed" },
  { t: 5.05, kind: "claim", job: 3, worker: 1, log: "w1 · claim job-3 (attempt 3)" },
  { t: 5.3, kind: "done", job: 6, log: "w2 · job-6 exit 0 → completed" },
  { t: 5.75, kind: "dead", job: 3, log: "job-3 failed 3× → dead-letter queue" },
];
const TIMES = EVENTS.map((e) => e.t);

function replay(n: number): Row[] {
  const rows: Row[] = JOBS.map((cmd, i) => ({ id: i + 1, cmd, state: "pending", tries: 0 }));
  for (const e of EVENTS.slice(0, n)) {
    const r = rows[e.job - 1]!;
    if (e.kind === "claim") Object.assign(r, { state: "running", worker: e.worker });
    if (e.kind === "done") Object.assign(r, { state: "done", worker: undefined });
    if (e.kind === "fail") Object.assign(r, { state: "retry", worker: undefined, tries: r.tries + 1, backoff: e.backoff });
    if (e.kind === "dead") Object.assign(r, { state: "dead", worker: undefined, tries: 3 });
  }
  return rows;
}

const workerText = ["", "text-sky", "text-ember", "text-fg"];
const workerDot = ["", "bg-sky", "bg-ember", "bg-fg"];

function StatePill({ r }: { r: Row }) {
  const base = "inline-flex items-center gap-[0.8cqmin] rounded-full border px-[1.3cqmin] py-[0.2cqmin]";
  switch (r.state) {
    case "running":
      return (
        <span className={cn(base, "border-line-strong", workerText[r.worker ?? 0])}>
          <span className={cn("size-[1.1cqmin] min-h-1 min-w-1 animate-pulse rounded-full", workerDot[r.worker ?? 0])} />
          running
        </span>
      );
    case "done":
      return <span className={cn(base, "border-sky/30 bg-sky/[0.07] text-sky")}>completed</span>;
    case "retry":
      return <span className={cn(base, "border-gold/40 bg-gold/[0.08] text-gold")}>retry {r.backoff}s</span>;
    case "dead":
      return <span className={cn(base, "border-rose/40 bg-rose/10 text-rose")}>dead</span>;
    default:
      return <span className={cn(base, "border-line text-dim")}>pending</span>;
  }
}

export function QueueScene() {
  const n = useStep(TIMES);
  const rows = replay(n);
  const last = n > 0 ? EVENTS[n - 1] : undefined;
  const skipped = last?.kind === "claim" ? (last.skipped ?? []) : [];
  const live = rows.filter((r) => r.state !== "dead");
  const dead = rows.filter((r) => r.state === "dead");
  const logs = EVENTS.slice(Math.max(0, n - 2), n);

  return (
    <>
      <Caption
        index="03"
        kicker="QueueCTL"
        tone="gold"
        title="Postgres is the broker"
        sub="Workers claim rows with FOR UPDATE SKIP LOCKED: no Redis, no RabbitMQ, no job run twice. Failures back off, then dead-letter."
        tags={["PostgreSQL", "Prisma", "child_process", "IPC"]}
      />

      <div className="reel-visual font-mono text-[max(8px,2.15cqmin)]">
        <Appear at={0.12} className="absolute inset-x-0 top-0">
          <p className="truncate rounded-[1.2cqmin] border border-line bg-surface-2/90 px-[1.8cqmin] py-[1cqmin] text-dim">
            <span className="text-ember">UPDATE</span> &quot;Job&quot; … <span className="text-ember">WHERE</span> id = (
            <span className="text-ember">SELECT</span> …{" "}
            <span className="rounded bg-gold/15 px-[0.6cqmin] text-gold">FOR UPDATE SKIP LOCKED</span> )
          </p>
        </Appear>

        {/* jobs table */}
        <Appear at={0.25} className="q-table absolute left-0 right-[35%] top-[13%]">
          <div className="rounded-[1.4cqmin] border border-line bg-surface/80">
            <div className="grid grid-cols-[17%_1fr_32%_11%] border-b border-line px-[1.6cqmin] py-[0.9cqmin] text-[max(7px,1.7cqmin)] uppercase tracking-wider text-dim">
              <span>id</span>
              <span>command</span>
              <span>state</span>
              <span className="text-right">lock</span>
            </div>
            <div className="relative">
              {live.map((r) => (
                <m.div
                  key={r.id}
                  layoutId={`reel-job-${r.id}`}
                  transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  className={cn(
                    "relative grid grid-cols-[17%_1fr_32%_11%] items-center px-[1.6cqmin] py-[0.95cqmin]",
                    r.state === "done" && "opacity-60",
                  )}
                >
                  <AnimatePresence>
                    {skipped.includes(r.id) ? (
                      <m.span
                        key={`skip-${n}`}
                        className="absolute inset-[0.3cqmin] rounded-[1cqmin] border border-gold/70 bg-gold/[0.08]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0.35] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    ) : null}
                  </AnimatePresence>
                  <span className="relative text-fg">job-{r.id}</span>
                  <span className="relative truncate text-muted">{r.cmd}</span>
                  <span className="relative">
                    <StatePill r={r} />
                  </span>
                  <span className={cn("relative text-right", workerText[r.worker ?? 0])}>{r.worker ? `w${r.worker}` : ""}</span>
                </m.div>
              ))}
            </div>
          </div>

          {/* dead-letter queue */}
          <div className="mt-[2cqmin] rounded-[1.4cqmin] border border-dashed border-rose/35 bg-rose/[0.04] px-[1.6cqmin] py-[1cqmin]">
            <p className="text-[max(7px,1.7cqmin)] uppercase tracking-wider text-rose/90">dead-letter queue</p>
            <div className="min-h-[4cqmin]">
              {dead.length === 0 ? <p className="py-[0.6cqmin] text-dim">empty</p> : null}
              {dead.map((r) => (
                <m.div
                  key={r.id}
                  layoutId={`reel-job-${r.id}`}
                  transition={{ type: "spring", stiffness: 200, damping: 26 }}
                  className="flex items-center justify-between py-[0.6cqmin]"
                >
                  <span className="text-fg">
                    job-{r.id} <span className="text-muted">{r.cmd}</span>
                  </span>
                  <span className="text-rose">3/3 tries</span>
                </m.div>
              ))}
            </div>
          </div>
        </Appear>

        {/* workers */}
        <Appear at={0.4} className="q-workers absolute right-0 top-[13%] w-[31%] space-y-[1.4cqmin]">
          {[1, 2, 3].map((w) => {
            const job = rows.find((r) => r.state === "running" && r.worker === w);
            return (
              <div key={w} className="flex items-center justify-between rounded-[1.2cqmin] border border-line bg-surface-2/90 px-[1.6cqmin] py-[1.2cqmin]">
                <span className={cn("flex items-center gap-[0.9cqmin]", workerText[w])}>
                  <span className={cn("size-[1.2cqmin] min-h-1 min-w-1 rounded-full", workerDot[w], job && "animate-pulse")} />
                  worker {w}
                </span>
                <AnimatePresence mode="wait" initial={false}>
                  <m.span
                    key={job?.id ?? "idle"}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.18 }}
                    className={job ? "text-fg" : "text-dim"}
                  >
                    {job ? `job-${job.id}` : "idle"}
                  </m.span>
                </AnimatePresence>
              </div>
            );
          })}
          {/* terminal-style tail: newest line pushes older ones up; no exit choreography to collide */}
          <div className="flex h-[18cqmin] flex-col justify-end overflow-hidden pt-[0.8cqmin]">
            {logs.map((e) => (
              <m.p
                key={e.t}
                layout="position"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "shrink-0 leading-[1.5]",
                  e.kind === "dead" ? "text-rose" : e.kind === "fail" ? "text-gold" : e.kind === "done" ? "text-sky" : "text-muted",
                )}
              >
                {e.log}
              </m.p>
            ))}
          </div>
        </Appear>
      </div>
    </>
  );
}
