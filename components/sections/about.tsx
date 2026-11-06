import { certifications, education, principles, site } from "@/lib/site";
import { Timeline } from "../timeline";
import { Reveal, Stagger, StaggerItem } from "../ui/reveal";
import { SectionHeading, Serif } from "../ui/section-heading";

export function About() {
  return (
    <section id="about" className="py-20 md:py-24">
      <div className="container-page">
        <SectionHeading
          index="04"
          kicker="About"
          title={
            <>
              I like the parts of a system <Serif>nobody sees</Serif> until they break.
            </>
          }
        />

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
          <div className="min-w-0">
            <Reveal>
              <div className="space-y-5 text-[16.5px] leading-relaxed text-muted">
                <p>
                  I&apos;m {site.shortName}, a final-year CS student at PSIT Kanpur who mostly lives on the backend. Queues, locks,
                  schemas, auth flows, retries: the pieces that decide whether software still works at 3 AM.
                </p>
                <p>
                  Lately that has meant <span className="text-fg">agent infrastructure</span>: giving LLMs tools they can call
                  safely against real finance systems, and making sure a half-finished call can suspend, recover or fail loudly
                  instead of silently.
                </p>
                <p>
                  Competitive programming keeps the fundamentals sharp. I&apos;m a LeetCode Knight with 900+ problems solved and a
                  3★ CodeChef coder, and I care more about it making my production code better than about the rating.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.05} className="mt-10">
              <div className="card flex items-start justify-between gap-4 p-5">
                <div>
                  <p className="label">Education</p>
                  <p className="mt-2 text-[15px] font-medium">{education.school}</p>
                  <p className="mt-0.5 text-sm text-muted">{education.degree}</p>
                </div>
                <div className="text-right font-mono text-[12px] text-muted">
                  <p>{education.period}</p>
                  <p className="mt-1 text-fg">{education.score}</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05} className="mt-3">
              <div className="card p-5">
                <p className="label">Certifications</p>
                <ul className="mt-3 divide-y divide-line">
                  {certifications.map((c) => (
                    <li key={c.name} className="flex items-baseline justify-between gap-4 py-2.5 text-[13.5px]">
                      <span className="text-fg/90">{c.name}</span>
                      <span className="shrink-0 font-mono text-[11px] text-dim">{c.issuer}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.05} className="mt-12">
              <p className="label">Principles, learned the hard way</p>
            </Reveal>
            <Stagger className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {principles.map((p, i) => (
                <StaggerItem key={p.title} className="card p-5">
                  <p className="font-mono text-[11px] text-ok">{String(i + 1).padStart(2, "0")}</p>
                  <p className="mt-2 text-[15px] font-medium tracking-tight">{p.title}</p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{p.body}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <Timeline />
        </div>
      </div>
    </section>
  );
}
