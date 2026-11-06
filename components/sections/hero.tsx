import type { ReactNode } from "react";
import { chatfin, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { CommandHint } from "../command-hint";
import { HeroBackdrop } from "../hero/backdrop";
import { LiveClock, Magnetic, Parallax } from "../hero/motion-bits";
import { Reel } from "../reel/reel";
import { ArrowRight, ArrowUpRight } from "../ui/icons";

// Editorial, typeset hero: plain facts in a real voice, no gradients or badges.
// Line reveals are pure CSS so the headline paints before hydration (fast LCP).

function Line({ i, className, children }: { i: number; className?: string; children: ReactNode }) {
  return (
    <span className={cn("-mb-[0.12em] block overflow-hidden pb-[0.12em]", className)}>
      <span className="hero-line block" style={{ animationDelay: `${140 + i * 110}ms` }}>
        {children}
      </span>
    </span>
  );
}

const FACTS: { k: string; v: ReactNode }[] = [
  {
    k: "Now",
    v: (
      <>
        SDE intern at{" "}
        <a href={chatfin.url} target="_blank" rel="noreferrer" className="link-underline text-fg">
          ChatFin.ai
        </a>
        , agent infrastructure for finance
      </>
    ),
  },
  { k: "Shipped", v: "BaseCase (1,000+ users) and QueueCTL, a broker-less job queue" },
  { k: "Ranked", v: "LeetCode Knight · CodeChef 3★" },
  { k: "Open to", v: "Full-time SWE roles from 2027 · CSE ’27, PSIT Kanpur" },
];

export function Hero() {
  return (
    <section id="top" className="relative isolate pb-16 pt-28 md:pb-24 md:pt-32">
      <HeroBackdrop />
      <div className="container-page">
        {/* masthead */}
        <div
          className="flex animate-fade flex-wrap items-baseline justify-between gap-x-6 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-dim"
          style={{ animationDuration: "0.8s" }}
        >
          <span>
            <span className="text-fg">Akash Dwivedi</span>
            <span className="hidden sm:inline"> — backend &amp; applied AI engineer</span>
          </span>
          <span>
            Kanpur, India <span className="px-1">·</span> <LiveClock />
          </span>
        </div>
        <div aria-hidden className="hero-rule mt-4 h-px bg-line-strong" />

        <Parallax distance={-56}>
        <h1 className="mt-12 text-[clamp(2.4rem,6.3vw,5.6rem)] font-medium leading-[1.0] tracking-[-0.055em] md:mt-14">
          <Line i={0}>I build backend systems</Line>
          <Line i={1}>
            that still work at <span className="font-serif font-normal italic tracking-[-0.02em] text-ember">3&nbsp;AM.</span>
          </Line>
          <Line i={2} className="text-muted">
            Lately, for AI agents.
          </Line>
        </h1>
        </Parallax>

        <dl className="mt-12 grid grid-cols-1 border-t border-line sm:grid-cols-2 lg:grid-cols-4 md:mt-14">
          {FACTS.map((f, i) => (
            <div
              key={f.k}
              className={cn(
                "hero-item border-b border-line py-4 sm:pr-6 lg:border-b-0",
                i > 0 && "lg:border-l lg:pl-6",
                i % 2 === 1 && "sm:border-l sm:pl-6",
              )}
              style={{ animationDelay: `${480 + i * 70}ms` }}
            >
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">{f.k}</dt>
              <dd className="mt-1.5 text-pretty text-[14.5px] leading-snug text-fg/90">{f.v}</dd>
            </div>
          ))}
        </dl>
        <div aria-hidden className="hidden h-px bg-line lg:block" />

        <div className="hero-item mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-[14px]" style={{ animationDelay: "780ms" }}>
          <Magnetic>
            <a href="#work" className="group inline-flex items-center gap-1.5 font-medium text-fg">
              <span className="link-underline">Selected work</span>
              <ArrowRight className="size-3.5 rotate-90 text-ember transition-transform group-hover:translate-y-0.5" />
            </a>
          </Magnetic>
          <Magnetic>
            <a href={site.resume} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 text-muted transition-colors hover:text-fg">
              <span className="link-underline">Résumé</span>
              <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Magnetic>
          <a href={`mailto:${site.email}`} className="group inline-flex items-center gap-1 text-muted transition-colors hover:text-fg">
            <span className="link-underline">{site.email}</span>
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <span className="sm:ml-auto">
            <CommandHint />
          </span>
        </div>

        {/* the showreel */}
        <div className="relative mt-16 md:mt-20">
          <p className="hero-item mb-4 font-mono text-[11px] text-dim" style={{ animationDelay: "900ms" }}>
            ↓ A reel of my systems. It&apos;s React running in your browser, not a video file.
          </p>
          <div className="relative animate-fade" style={{ animationDelay: "300ms" }}>
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-6 -top-20 bottom-[10%] -z-10 bg-[radial-gradient(55%_55%_at_50%_35%,color-mix(in_oklab,var(--color-ember)_24%,transparent),transparent_72%)] blur-2xl"
            />
            <Reel />
          </div>
        </div>
      </div>
    </section>
  );
}
