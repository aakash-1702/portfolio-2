import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleShell } from "@/components/article-shell";
import { ArrowUpRight, GitHub } from "@/components/ui/icons";
import { caseStudies, featured } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cs = caseStudies.find((c) => c.slug === slug);
  if (!cs) return {};
  return { title: cs.title, description: cs.description, alternates: { canonical: `/projects/${slug}` } };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = featured.find((p) => p.slug === slug);
  const index = caseStudies.findIndex((c) => c.slug === slug);
  if (!project || index === -1) notFound();
  const { default: Content } = await import(`@/content/projects/${slug}.mdx`);
  const next = caseStudies[(index + 1) % caseStudies.length]!;

  return (
    <ArticleShell
      back={{ href: "/#projects", label: "All projects" }}
      meta={
        <>
          <span>case study</span>
          <span>·</span>
          <span>{project.period}</span>
        </>
      }
      title={`${project.name}: ${project.tagline}`}
      description={project.summary}
      aside={
        <div className="space-y-6">
          {project.metrics ? (
            <dl className="grid grid-cols-3 gap-3">
              {project.metrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-line bg-surface p-4">
                  <dd className="text-2xl font-medium tracking-tight">{m.value}</dd>
                  <dt className="mt-1 text-[12px] text-dim">{m.label}</dt>
                </div>
              ))}
            </dl>
          ) : null}
          <ul className="flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {project.links.live ? (
              <a href={project.links.live} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-fg px-4 text-[13px] font-medium text-bg">
                Open live app <ArrowUpRight className="size-3.5" />
              </a>
            ) : null}
            {project.links.github ? (
              <a href={project.links.github} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong px-4 text-[13px] text-fg hover:bg-white/[0.04]">
                <GitHub className="size-3.5" /> Source
              </a>
            ) : null}
          </div>
        </div>
      }
      next={next.slug !== slug ? { href: `/projects/${next.slug}`, label: "Next case study", title: next.title } : undefined}
    >
      <Content />
    </ArticleShell>
  );
}
