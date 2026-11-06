"use client";

import { useQuery } from "@tanstack/react-query";
import { githubQuery } from "@/lib/queries";
import { site } from "@/lib/site";
import { Counter } from "./ui/counter";
import { ArrowUpRight, GitHub } from "./ui/icons";
import { Spotlight } from "./ui/spotlight";
import { TimeAgo } from "./ui/time-ago";

const langColor: Record<string, string> = {
  TypeScript: "bg-sky-400",
  JavaScript: "bg-yellow-300",
  Go: "bg-cyan-300",
  Python: "bg-blue-400",
  "C++": "bg-pink-400",
};

export function ReposCard() {
  const { data } = useQuery(githubQuery);
  return (
    <a href={`${site.links.github}?tab=repositories`} target="_blank" rel="noreferrer" className="group block h-full">
      <Spotlight className="flex h-full flex-col p-5 transition-colors group-hover:border-line-strong">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <GitHub className="size-4" />
            <span className="text-[16px] font-medium tracking-tight">github/{site.handles.github}</span>
          </div>
          <ArrowUpRight className="size-4 text-dim transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
        </div>
        <p className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-medium tracking-[-0.04em]">
            <Counter value={data?.publicRepos ?? 41} />
          </span>
          <span className="text-[13px] text-muted">public repositories</span>
        </p>
        <p className="label mt-5 flex items-center gap-1.5">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-ok text-ok" />
          recently pushed
        </p>
        <ul className="mt-2.5 space-y-1.5 font-mono text-[11.5px]">
          {(data?.recent ?? []).map((r) => (
            <li key={r.name} className="flex items-center gap-2">
              <span className={`size-2 shrink-0 rounded-full ${langColor[r.language ?? ""] ?? "bg-dim"}`} />
              <span className="truncate text-fg/90">{r.name}</span>
              <span className="ml-auto shrink-0 text-dim">
                <TimeAgo iso={r.pushedAt} />
              </span>
            </li>
          ))}
        </ul>
      </Spotlight>
    </a>
  );
}
