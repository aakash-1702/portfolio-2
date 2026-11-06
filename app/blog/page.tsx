import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { posts } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Writing",
  description: "Long-form notes on building code judges, voice agents, queues and backends.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <section className="relative pb-16 pt-32 md:pt-40">
      <div aria-hidden className="bg-grid absolute inset-x-0 top-0 -z-10 h-[520px]" />
      <div className="container-page max-w-[880px]">
        <p className="label animate-rise">Writing</p>
        <h1 className="mt-5 animate-rise text-[clamp(2.4rem,6vw,4rem)] font-medium leading-[1] tracking-[-0.05em]" style={{ animationDelay: "60ms" }}>
          Notes from{" "}
          <span className="font-serif font-normal italic tracking-[-0.02em]">building things.</span>
        </h1>
        <p className="mt-5 max-w-xl animate-rise text-[17px] leading-relaxed text-muted" style={{ animationDelay: "120ms" }}>
          What actually broke, why, and what I&apos;d do differently. Subscribe via{" "}
          <a href="/blog/rss.xml" className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-ok">
            RSS
          </a>
          .
        </p>
        <ul className="mt-14 border-t border-line">
          {posts.map((p, i) => (
            <li key={p.slug} className="animate-rise border-b border-line" style={{ animationDelay: `${180 + i * 70}ms` }}>
              <Link href={`/blog/${p.slug}`} className="group block rounded-xl px-2 py-8 transition-colors hover:bg-white/[0.025] md:px-4">
                <div className="flex flex-wrap items-center gap-3 font-mono text-[12px] text-dim">
                  <time dateTime={p.date}>{formatDate(p.date)}</time>
                  <span>·</span>
                  <span>{p.readingTime} min</span>
                  <span className="rounded-full border border-line px-2 py-0.5 text-[11px]">{p.tag}</span>
                </div>
                <h2 className="mt-3 flex items-start justify-between gap-6 text-[clamp(1.25rem,2.4vw,1.6rem)] font-medium leading-snug tracking-tight">
                  {p.title}
                  <ArrowRight className="mt-1.5 size-5 shrink-0 -translate-x-1 text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{p.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
