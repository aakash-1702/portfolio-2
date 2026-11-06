import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "./ui/icons";

/** Shared chrome for long-form pages (posts and case studies). */
export function ArticleShell({
  back,
  meta,
  title,
  description,
  aside,
  children,
  next,
}: {
  back: { href: string; label: string };
  meta: ReactNode;
  title: string;
  description: string;
  aside?: ReactNode;
  children: ReactNode;
  next?: { href: string; label: string; title: string };
}) {
  return (
    <article className="relative pb-10 pt-32 md:pt-40">
      <div aria-hidden className="bg-grid absolute inset-x-0 top-0 -z-10 h-[520px]" />
      <div className="container-page max-w-[760px]">
        <Link
          href={back.href}
          className="group inline-flex items-center gap-2 font-mono text-[12px] text-dim transition-colors hover:text-fg"
        >
          <ArrowRight className="size-3.5 rotate-180 transition-transform group-hover:-translate-x-0.5" />
          {back.label}
        </Link>
        <header className="mt-10 animate-rise">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[12px] text-dim">{meta}</div>
          <h1 className="mt-5 text-balance text-[clamp(2.1rem,5vw,3.4rem)] font-medium leading-[1.05] tracking-[-0.04em]">
            {title}
          </h1>
          <p className="mt-5 text-pretty text-[18px] leading-relaxed text-muted">{description}</p>
          {aside ? <div className="mt-8">{aside}</div> : null}
        </header>
        <div className="mt-14 border-t border-line pt-4 animate-fade" style={{ animationDelay: "200ms" }}>
          <div className="prose-post">{children}</div>
        </div>
        {next ? (
          <Link
            href={next.href}
            className="group mt-20 flex items-center justify-between gap-6 rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-line-strong"
          >
            <span>
              <span className="label">{next.label}</span>
              <span className="mt-2 block text-lg font-medium tracking-tight">{next.title}</span>
            </span>
            <ArrowRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-fg" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
