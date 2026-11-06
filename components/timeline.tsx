"use client";

import { m } from "motion/react";
import { timeline } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Vertical timeline whose rail draws itself as you scroll through it.
 * The rail uses a CSS view timeline, so scroll-linking costs no JavaScript.
 */
export function Timeline() {
  return (
    <div>
      <p className="label mb-6">Timeline</p>
      <ol className="relative space-y-9 pl-8">
        <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px bg-line" />
        <span
          aria-hidden
          className="timeline-rail absolute bottom-2 left-[5px] top-2 w-px origin-top bg-gradient-to-b from-ok via-ai to-ai/40"
        />
        {timeline.map((t, i) => {
          const now = i === timeline.length - 1;
          return (
            <m.li
              key={t.title}
              className="relative"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "0px 0px -20% 0px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute -left-8 top-[5px] size-[11px] rounded-full border-2 border-bg",
                  now ? "animate-pulse-dot bg-ok text-ok" : "bg-line-strong",
                )}
              />
              <p className={cn("font-mono text-[11px] uppercase tracking-[0.14em]", now ? "text-ok" : "text-dim")}>{t.when}</p>
              <p className="mt-1.5 text-[15.5px] font-medium tracking-tight">{t.title}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">{t.body}</p>
            </m.li>
          );
        })}
      </ol>
    </div>
  );
}
