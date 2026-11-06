"use client";

import { useQuery } from "@tanstack/react-query";
import { m } from "motion/react";
import { leetcodeQuery } from "@/lib/queries";
import { achievements, site } from "@/lib/site";
import { Counter } from "../ui/counter";
import { ArrowUpRight, LeetCode } from "../ui/icons";
import { Reveal, Stagger, StaggerItem } from "../ui/reveal";
import { SectionHeading, Serif } from "../ui/section-heading";
import { Spotlight } from "../ui/spotlight";
import { TimeAgo } from "../ui/time-ago";

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const w = 320;
  const h = 72;
  const min = Math.min(...points) - 20;
  const max = Math.max(...points) + 20;
  const xy = points.map((p, i) => [(i / (points.length - 1)) * w, h - ((p - min) / (max - min)) * h] as const);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const [lx, ly] = xy[xy.length - 1]!;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[72px] w-full overflow-visible" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-ok)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-ok)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <m.path
        d={area}
        fill="url(#spark-fill)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.6 }}
      />
      <m.path
        d={line}
        fill="none"
        stroke="var(--color-ok)"
        strokeWidth={1.6}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      />
      <circle cx={lx} cy={ly} r={3} fill="var(--color-ok)" />
    </svg>
  );
}

export function Algorithms() {
  const { data: lc } = useQuery(leetcodeQuery);
  const solved = lc?.solved ?? { all: 931, easy: 366, medium: 473, hard: 92 };
  const bars = [
    { label: "Easy", value: solved.easy, color: "bg-ok" },
    { label: "Medium", value: solved.medium, color: "bg-warn" },
    { label: "Hard", value: solved.hard, color: "bg-err" },
  ];
  const maxBar = Math.max(...bars.map((b) => b.value), 1);

  return (
    <section id="algorithms" className="py-20 md:py-24">
      <div className="container-page">
        <SectionHeading
          index="05"
          kicker="Algorithms"
          title={
            <>
              Fundamentals, <Serif>under a timer.</Serif>
            </>
          }
        >
          Weekly contests keep me honest about complexity, edge cases and writing correct code under pressure. Numbers below
          are pulled live from LeetCode.
        </SectionHeading>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.35fr_1fr]">
          <Reveal>
            <a href={site.links.leetcode} target="_blank" rel="noreferrer" className="group block h-full">
              <Spotlight className="h-full p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <LeetCode className="size-4 text-warn" />
                    <span className="text-[15px] font-medium">LeetCode</span>
                    <span className="font-mono text-[12px] text-dim">@{site.handles.leetcode}</span>
                  </div>
                  <span className="flex items-center gap-1.5 font-mono text-[10.5px] text-dim">
                    <span className="size-1.5 animate-pulse-dot rounded-full bg-ok text-ok" />
                    {lc?.source === "live" ? (
                      <>
                        live · <TimeAgo iso={lc.fetchedAt} />
                      </>
                    ) : (
                      "snapshot"
                    )}
                  </span>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <div>
                    <p className="label">contest rating</p>
                    <p className="mt-2 flex items-baseline gap-3">
                      <span className="text-6xl font-medium tracking-[-0.05em]">
                        <Counter value={lc?.rating ?? 1868} />
                      </span>
                      <span className="rounded-full border border-warn/30 bg-warn/[0.08] px-2 py-0.5 font-mono text-[11px] text-warn">
                        {lc?.badge ?? "Knight"}
                      </span>
                    </p>
                    <dl className="mt-5 grid grid-cols-3 gap-3 font-mono text-[11px]">
                      <div>
                        <dt className="text-dim">top</dt>
                        <dd className="mt-1 text-[13px] text-fg">{lc?.topPercentage ?? 5.8}%</dd>
                      </div>
                      <div>
                        <dt className="text-dim">contests</dt>
                        <dd className="mt-1 text-[13px] text-fg">{lc?.contests ?? 68}</dd>
                      </div>
                      <div>
                        <dt className="text-dim">global</dt>
                        <dd className="mt-1 text-[13px] text-fg">#{(lc?.globalRanking ?? 50445).toLocaleString("en-US")}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex flex-col justify-end">
                    {lc?.history?.length ? (
                      <>
                        <Sparkline points={lc.history} />
                        <p className="mt-2 font-mono text-[10.5px] text-dim">last {lc.history.length} contests</p>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="mt-8 border-t border-line pt-6">
                  <div className="flex items-baseline justify-between">
                    <p className="label">problems solved</p>
                    <p className="text-2xl font-medium tracking-tight">
                      <Counter value={solved.all} />
                    </p>
                  </div>
                  <div className="mt-4 space-y-2.5">
                    {bars.map((b, i) => (
                      <div key={b.label} className="grid grid-cols-[60px_1fr_44px] items-center gap-3 font-mono text-[11.5px]">
                        <span className="text-muted">{b.label}</span>
                        <span className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                          <m.span
                            className={`block h-full origin-left rounded-full ${b.color}`}
                            style={{ width: `${(b.value / maxBar) * 100}%` }}
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.1, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </span>
                        <span className="text-right tabular-nums text-fg">{b.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Spotlight>
            </a>
          </Reveal>

          <Stagger className="grid grid-cols-1 gap-3 lg:grid-rows-3" stagger={0.08}>
            {achievements.filter((a) => !a.title.startsWith("LeetCode")).map((a) => {
              const body = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[15px] font-medium tracking-tight">{a.title}</p>
                    {a.href ? (
                      <ArrowUpRight className="size-4 shrink-0 text-dim transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{a.body}</p>
                </>
              );
              return (
                <StaggerItem key={a.title} className="h-full">
                  {a.href ? (
                    <a href={a.href} target="_blank" rel="noreferrer" className="group block h-full">
                      <Spotlight className="flex h-full flex-col justify-center p-5 transition-colors group-hover:border-line-strong">
                        {body}
                      </Spotlight>
                    </a>
                  ) : (
                    <Spotlight className="flex h-full flex-col justify-center p-5">{body}</Spotlight>
                  )}
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
