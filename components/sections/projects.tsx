import Link from "next/link";
import type { ReactNode } from "react";
import { backends, featured, type MiniProject, type Project } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, GitHub } from "../ui/icons";
import { Reveal, Stagger, StaggerItem } from "../ui/reveal";
import { SectionHeading, Serif } from "../ui/section-heading";
import { Spotlight } from "../ui/spotlight";
import { LazyViz } from "../viz/lazy-viz";
import { ReposCard } from "../repos-card";

const viz: Record<string, ReactNode> = {
  basecase: <LazyViz kind="voice" />,
  queuectl: <LazyViz kind="queue" />,
};

function ProjectLinks({ p }: { p: Project }) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-2">
      {p.links.caseStudy ? (
        <Link
          href={p.links.caseStudy}
          className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-fg pl-4 pr-3 text-[13px] font-medium text-bg transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          Read the case study
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
      {p.links.live ? (
        <a
          href={p.links.live}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong px-4 text-[13px] text-fg transition-colors hover:bg-white/[0.04]"
        >
          Live <ArrowUpRight className="size-3.5" />
        </a>
      ) : null}
      {p.links.github ? (
        <a
          href={p.links.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-4 text-[13px] text-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          <GitHub className="size-3.5" /> Source
        </a>
      ) : null}
    </div>
  );
}

function FeaturedCard({ p, flip }: { p: Project; flip?: boolean }) {
  return (
    <Reveal>
      <Spotlight className="overflow-hidden">
        <div className={cn("grid grid-cols-1 gap-10 p-5 sm:p-6 md:p-10 lg:grid-cols-2 lg:gap-14", flip && "lg:[&>*:first-child]:order-2")}>
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h3 className="text-3xl font-medium tracking-[-0.03em]">{p.name}</h3>
              {p.status === "live" ? (
                <span className="flex items-center gap-1.5 rounded-full border border-ok/25 bg-ok/[0.07] px-2 py-0.5 font-mono text-[10.5px] text-ok">
                  <span className="size-1.5 animate-pulse-dot rounded-full bg-ok text-ok" /> live
                </span>
              ) : null}
              <span className="font-mono text-[11.5px] text-dim">{p.period}</span>
            </div>
            <p className="mt-2 text-[15px] text-fg/85">{p.tagline}</p>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">{p.summary}</p>

            <Stagger as="ul" className="mt-6 space-y-3">
              {p.points.map((pt) => (
                <StaggerItem as="li" key={pt} className="flex gap-3 text-[14px] leading-relaxed text-muted">
                  <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-ok/70" />
                  {pt}
                </StaggerItem>
              ))}
            </Stagger>

            {p.metrics ? (
              <dl className="mt-7 grid grid-cols-3 gap-3">
                {p.metrics.map((mt) => (
                  <div key={mt.label} className="border-l border-line-strong pl-3">
                    <dd className="text-xl font-medium tracking-tight">{mt.value}</dd>
                    <dt className="mt-0.5 text-[12px] text-dim">{mt.label}</dt>
                  </div>
                ))}
              </dl>
            ) : null}

            <ul className="mt-7 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <ProjectLinks p={p} />
            </div>
          </div>
          <div className="min-w-0 self-center">{viz[p.slug]}</div>
        </div>
      </Spotlight>
    </Reveal>
  );
}

const rounds = ["Assessment", "Subjective · rubric", "Coding round", "AI interview", "Human decision"];

function BuildingCard({ p }: { p: Project }) {
  return (
    <Reveal>
      <Spotlight className="overflow-hidden p-5 sm:p-6 md:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h3 className="text-2xl font-medium tracking-[-0.03em]">{p.name}</h3>
              <span className="flex items-center gap-1.5 rounded-full border border-warn/25 bg-warn/[0.07] px-2 py-0.5 font-mono text-[10.5px] text-warn">
                <span className="size-1.5 animate-pulse rounded-full bg-warn" /> building
              </span>
            </div>
            <p className="mt-2 text-[15px] text-fg/85">{p.tagline}</p>
            <p className="mt-4 text-[14.5px] leading-relaxed text-muted">{p.summary}</p>
            <ul className="mt-4 space-y-2">
              {p.points.map((pt) => (
                <li key={pt} className="flex gap-3 text-[14px] leading-relaxed text-muted">
                  <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-warn/70" />
                  {pt}
                </li>
              ))}
            </ul>
            <ul className="mt-6 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
            <ProjectLinks p={p} />
          </div>
          <Stagger as="ol" className="relative space-y-2 font-mono text-[12px]" stagger={0.09}>
            {rounds.map((r, i) => (
              <StaggerItem
                as="li"
                key={r}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                  i === rounds.length - 1 ? "border-ok/30 bg-ok/[0.05] text-ok" : "border-line bg-bg/50 text-muted",
                )}
              >
                <span className="text-dim">{String(i + 1).padStart(2, "0")}</span>
                {r}
                {i === rounds.length - 1 ? <span className="ml-auto text-[10.5px] text-ok/80">always a person</span> : null}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Spotlight>
    </Reveal>
  );
}

const methodColor: Record<string, string> = {
  GET: "text-ok",
  POST: "text-ai",
  PATCH: "text-warn",
  PUT: "text-warn",
  DELETE: "text-err",
};

function MiniCard({ p }: { p: MiniProject }) {
  return (
    <a href={p.github} target="_blank" rel="noreferrer" className="group block h-full">
      <Spotlight className="flex h-full flex-col p-5 transition-colors group-hover:border-line-strong">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-[16px] font-medium tracking-tight">{p.name}</h4>
            <p className="mt-0.5 font-mono text-[11px] text-dim">{p.what}</p>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-dim transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
        </div>
        <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{p.body}</p>
        {p.routes ? (
          <ul className="mt-4 space-y-1 rounded-lg border border-line bg-bg/50 p-2.5 font-mono text-[10.5px]">
            {p.routes.map((r) => (
              <li key={r.path} className="flex items-center gap-2">
                <span className={cn("w-11 shrink-0", methodColor[r.method])}>{r.method}</span>
                <span className="min-w-0 truncate text-muted">{r.path}</span>
                {r.role ? <span className="ml-auto shrink-0 text-dim">{r.role}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {p.stack.map((s) => (
            <li key={s} className="chip text-[10.5px]">
              {s}
            </li>
          ))}
        </ul>
      </Spotlight>
    </a>
  );
}

export function Projects() {
  const [basecase, queuectl, pareeksha] = featured;
  return (
    <section id="projects" className="py-20 md:py-24">
      <div className="container-page">
        <SectionHeading
          index="02"
          kicker="Projects"
          title={
            <>
              Systems I&apos;ve built <Serif>end to end.</Serif>
            </>
          }
        >
          A platform real people use, a job queue that leans on Postgres instead of a broker, and the backends where I learned
          to do this properly. The panels on the right are live simulations of how each one works.
        </SectionHeading>

        <div className="space-y-6">
          {basecase ? <FeaturedCard p={basecase} /> : null}
          {queuectl ? <FeaturedCard p={queuectl} flip /> : null}
          {pareeksha ? <BuildingCard p={pareeksha} /> : null}
        </div>

        <Reveal className="mt-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="label">More backend work</p>
              <h3 className="mt-3 text-2xl font-medium tracking-tight">Where the fundamentals came from</h3>
            </div>
            <a
              href="https://github.com/aakash-1702?tab=repositories"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg sm:inline-flex"
            >
              All repositories <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </Reveal>
        <Stagger className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
          {backends.map((p) => (
            <StaggerItem key={p.name} className="h-full">
              <MiniCard p={p} />
            </StaggerItem>
          ))}
          <StaggerItem className="h-full">
            <ReposCard />
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
