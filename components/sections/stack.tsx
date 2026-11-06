import { stack } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Reveal, Stagger, StaggerItem } from "../ui/reveal";
import { SectionHeading, Serif } from "../ui/section-heading";
import { Spotlight } from "../ui/spotlight";

const accentDot: Record<string, string> = {
  ai: "bg-ai",
  ok: "bg-ok",
  warn: "bg-warn",
  fg: "bg-fg/60",
};

// Wide/narrow alternates on every row: [ai | data] [backend | cs] [lang | tools].
const span: Record<string, string> = {
  ai: "lg:col-span-2",
  backend: "lg:col-span-2",
  tools: "lg:col-span-2",
};

// Order the bento so the wide cards sit beside a narrow one on each row.
const order = ["ai", "data", "backend", "cs", "lang", "tools"];

export function Stack() {
  const groups = order.map((id) => stack.find((g) => g.id === id)!).filter(Boolean);
  return (
    <section id="stack" className="py-20 md:py-24">
      <div className="container-page">
        <SectionHeading
          index="03"
          kicker="Stack"
          title={
            <>
              Backend-first. <Serif>AI-native.</Serif>
            </>
          }
        >
          I pick tools for the failure modes they handle, not the logo. These are the ones I&apos;ve shipped with.
        </SectionHeading>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {groups.map((g, gi) => (
            <Reveal key={g.id} delay={gi * 0.04} className={cn(span[g.id])}>
              <Spotlight className={cn("h-full p-6", g.id === "ai" && "bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-ember)_8%,transparent),transparent_55%)]")}>
                <div className="flex items-center gap-2">
                  <span className={cn("size-1.5 rounded-full", accentDot[g.accent])} />
                  <h3 className="text-[15px] font-medium tracking-tight">{g.title}</h3>
                </div>
                {g.note ? <p className="mt-1.5 text-[13px] text-dim">{g.note}</p> : null}
                <Stagger as="ul" className="mt-5 flex flex-wrap gap-1.5" stagger={0.025}>
                  {g.items.map((it) => (
                    <StaggerItem
                      as="li"
                      key={it}
                      className={cn(
                        "rounded-md border border-line bg-bg/50 px-2.5 py-1.5 text-[13px] text-fg/85 transition-colors hover:border-line-strong hover:text-fg",
                        g.id === "ai" && "border-ai/15",
                      )}
                    >
                      {it}
                    </StaggerItem>
                  ))}
                </Stagger>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
