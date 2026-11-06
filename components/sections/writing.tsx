"use client";

import Link from "next/link";
import { m } from "motion/react";
import { useState } from "react";
import { posts } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "../ui/icons";
import { Reveal } from "../ui/reveal";
import { SectionHeading, Serif } from "../ui/section-heading";

export function Writing() {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <section id="writing" className="py-20 md:py-24">
      <div className="container-page">
        <SectionHeading
          index="06"
          kicker="Writing"
          title={
            <>
              Notes from <Serif>building things.</Serif>
            </>
          }
        >
          Long-form write-ups on what actually broke and why: no theory-only system design.
        </SectionHeading>

        <Reveal>
          <ul className="border-t border-line" onMouseLeave={() => setHovered(null)}>
            {posts.map((p) => (
              <li key={p.slug} className="border-b border-line">
                <Link
                  href={`/blog/${p.slug}`}
                  onMouseEnter={() => setHovered(p.slug)}
                  onFocus={() => setHovered(p.slug)}
                  className="group relative grid gap-2 px-2 py-7 md:grid-cols-[130px_1fr_auto] md:items-center md:gap-8 md:px-4"
                >
                  {hovered === p.slug ? (
                    <m.span
                      layoutId="post-hover"
                      className="absolute inset-0 -z-10 rounded-xl bg-white/[0.035]"
                      transition={{ type: "spring", stiffness: 420, damping: 38 }}
                    />
                  ) : null}
                  <span className="font-mono text-[12px] text-dim">{formatDate(p.date)}</span>
                  <span>
                    <span className="block text-[clamp(1.1rem,2vw,1.4rem)] font-medium leading-snug tracking-tight text-fg">
                      {p.title}
                    </span>
                    <span className="mt-1.5 block text-[14px] leading-relaxed text-muted">{p.description}</span>
                  </span>
                  <span className="flex items-center gap-4 font-mono text-[11.5px] text-dim">
                    <span className="rounded-full border border-line px-2 py-0.5">{p.tag}</span>
                    <span>{p.readingTime} min</span>
                    <ArrowRight className="size-4 -translate-x-1 text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="mt-8">
          <Link href="/blog" className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
            All posts
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
