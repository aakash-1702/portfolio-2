"use client";

import { useQuery } from "@tanstack/react-query";
import { leetcodeQuery } from "@/lib/queries";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Counter } from "../ui/counter";
import { Stagger, StaggerItem } from "../ui/reveal";
import { TimeAgo } from "../ui/time-ago";

export function Signals() {
  // Hydrated from the server prefetch: no spinner, no layout shift.
  const { data: lc } = useQuery(leetcodeQuery);

  const tiles = [
    {
      value: lc?.solved.all ?? 931,
      suffix: "",
      label: "problems solved on LeetCode",
      source: lc?.source === "live" ? "live" : "leetcode",
      href: site.links.leetcode,
      live: lc?.source === "live",
    },
    {
      value: lc?.rating ?? 1868,
      suffix: "",
      label: `contest rating · ${lc?.badge ?? "Knight"}${lc?.topPercentage ? ` · top ${lc.topPercentage}%` : ""}`,
      source: lc?.source === "live" ? "live" : "leetcode",
      href: site.links.leetcode,
      live: lc?.source === "live",
    },
    { value: 16, suffix: "", label: "PRs merged at ChatFin so far", source: "git log", live: false },
    { value: 1000, suffix: "+", label: "users on BaseCase", source: "production", href: "https://basecase-xi.vercel.app", live: false },
  ];

  return (
    <section aria-label="At a glance" className="border-y border-line bg-surface/40">
      <Stagger className="container-page grid grid-cols-2 lg:grid-cols-4" stagger={0.07}>
        {tiles.map((t, i) => {
          const Inner = (
            <>
              <p className="text-[clamp(1.9rem,3.6vw,2.6rem)] font-medium leading-none tracking-[-0.04em]">
                <Counter value={t.value} />
                {t.suffix}
              </p>
              <p className="mt-3 text-[13px] leading-snug text-muted">{t.label}</p>
              <p className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
                <span className={cn("size-1.5 rounded-full", t.live ? "animate-pulse-dot bg-ok text-ok" : "bg-dim")} />
                {t.source}
                {t.live && lc ? (
                  <span className="normal-case tracking-normal text-dim">
                    · <TimeAgo iso={lc.fetchedAt} />
                  </span>
                ) : null}
              </p>
            </>
          );
          return (
            <StaggerItem
              key={t.label}
              className={cn(
                "border-line px-1 py-8 sm:px-6 lg:py-10",
                i % 2 === 1 && "border-l pl-5",
                i >= 2 && "border-t lg:border-t-0",
                i === 2 && "lg:border-l lg:pl-6",
                i === 0 && "sm:pl-0",
              )}
            >
              {t.href ? (
                <a href={t.href} target="_blank" rel="noreferrer" className="group block">
                  {Inner}
                </a>
              ) : (
                Inner
              )}
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
