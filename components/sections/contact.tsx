"use client";

import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { site } from "@/lib/site";
import { ArrowUpRight, Check, Copy, GitHub, LeetCode, LinkedIn, XLogo } from "../ui/icons";
import { Reveal } from "../ui/reveal";
import { Serif } from "../ui/section-heading";

const links = [
  { label: "GitHub", href: site.links.github, icon: GitHub },
  { label: "LinkedIn", href: site.links.linkedin, icon: LinkedIn },
  { label: "LeetCode", href: site.links.leetcode, icon: LeetCode },
  { label: "X", href: site.links.x, icon: XLogo },
];

export function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden pb-24 pt-20 md:pb-32 md:pt-24">
      <div aria-hidden className="glow absolute inset-0 -z-10 rotate-180 opacity-80" />
      <div className="container-page">
        <Reveal>
          <p className="label flex items-center gap-3">
            <span className="text-ember">07</span>
            <span aria-hidden className="h-px w-8 bg-line-strong" />
            Contact
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-6 max-w-4xl text-balance text-[clamp(2.4rem,6.5vw,5.2rem)] font-medium leading-[1] tracking-[-0.05em]">
            Building something that has to <Serif>hold up?</Serif>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
            I&apos;m open to full-time SWE, backend and applied-AI roles for 2027, and to interesting problems before then. The
            fastest way to reach me is email.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${site.email}`}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-fg pl-6 pr-5 text-[15px] font-medium text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {site.email}
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <button
            type="button"
            onClick={copy}
            className="relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full border border-line-strong px-5 text-[14px] text-fg transition-colors hover:bg-white/[0.04]"
            aria-live="polite"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <m.span
                  key="ok"
                  className="flex items-center gap-2 text-ok"
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Check className="size-4" /> Copied
                </m.span>
              ) : (
                <m.span
                  key="copy"
                  className="flex items-center gap-2"
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Copy className="size-4" /> Copy email
                </m.span>
              )}
            </AnimatePresence>
          </button>
        </Reveal>

        <Reveal delay={0.2} className="mt-14 flex flex-wrap gap-2">
          {links.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-2 text-[13px] text-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              <Icon className="size-3.5" />
              {label}
              <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
