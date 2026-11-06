import { chatfin, freelance } from "@/lib/site";
import { ChatFinSystem } from "../chatfin-system";
import { Counter } from "../ui/counter";
import { ArrowUpRight } from "../ui/icons";
import { Reveal, Stagger, StaggerItem } from "../ui/reveal";
import { SectionHeading, Serif } from "../ui/section-heading";

export function Experience() {
  return (
    <section id="work" className="py-20 md:py-24">
      <div className="container-page">
        <SectionHeading
          index="01"
          kicker="Experience"
          title={
            <>
              Agent infrastructure, <Serif>in production.</Serif>
            </>
          }
        >
          The interesting part of an AI agent is everything around the model: how it gets tools, who it acts as, what happens
          when a call fails halfway, and how one deployment serves many clients.
        </SectionHeading>

        <Reveal>
          <article className="card overflow-hidden">
            <div className="grid grid-cols-1 gap-8 border-b border-line p-5 sm:p-6 md:p-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="text-2xl font-medium tracking-tight">
                    <a href={chatfin.url} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1.5">
                      {chatfin.company}
                      <ArrowUpRight className="size-4 text-dim transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
                    </a>
                  </h3>
                  <span className="rounded-full border border-ok/25 bg-ok/[0.07] px-2 py-0.5 font-mono text-[10.5px] text-ok">
                    current
                  </span>
                </div>
                <p className="mt-1.5 text-[15px] text-fg/90">
                  {chatfin.role} <span className="text-dim">·</span>{" "}
                  <span className="font-mono text-[13px] text-muted">{chatfin.period}</span>
                </p>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{chatfin.blurb}</p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {chatfin.stack.map((s) => (
                    <li key={s} className="chip">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <dl className="grid grid-cols-3 gap-2 self-end sm:gap-4">
                {chatfin.metrics.map((mt) => (
                  <div key={mt.label} className="rounded-xl border border-line bg-bg/40 p-3 sm:p-4">
                    <dt className="sr-only">{mt.label}</dt>
                    <dd className="text-3xl font-medium tracking-[-0.04em]">
                      <Counter value={mt.value} />
                      {mt.suffix}
                    </dd>
                    <dd className="mt-2 text-[11.5px] leading-snug text-muted sm:text-[12px]">{mt.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="p-5 sm:p-6 md:p-8">
              <ChatFinSystem />
            </div>
          </article>
        </Reveal>

        <Reveal className="mt-6">
          <article className="card grid grid-cols-1 gap-6 p-5 sm:p-6 md:grid-cols-[1fr_1.4fr] md:p-8">
            <div>
              <h3 className="text-xl font-medium tracking-tight">{freelance.company}</h3>
              <p className="mt-1 text-sm text-muted">{freelance.subtitle}</p>
              <p className="mt-3 text-[15px] text-fg/90">
                {freelance.role} <span className="text-dim">·</span>{" "}
                <span className="font-mono text-[13px] text-muted">{freelance.period}</span>
              </p>
              <ul className="mt-5 flex flex-wrap gap-1.5">
                {freelance.stack.map((s) => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <Stagger as="ul" className="space-y-3">
              {freelance.points.map((p) => (
                <StaggerItem as="li" key={p} className="flex gap-3 text-[14.5px] leading-relaxed text-muted">
                  <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-ok/70" />
                  {p}
                </StaggerItem>
              ))}
            </Stagger>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
