import type { ReactNode } from "react";
import { Reveal } from "./reveal";

export function SectionHeading({
  index,
  kicker,
  title,
  children,
}: {
  index: string;
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mb-12 max-w-3xl md:mb-16">
      <Reveal>
        <p className="label flex items-center gap-3">
          <span className="text-ember">{index}</span>
          <span aria-hidden className="h-px w-8 bg-line-strong" />
          {kicker}
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-5 text-balance text-[clamp(2rem,4.6vw,3.3rem)] font-medium leading-[1.04] tracking-[-0.04em]">
          {title}
        </h2>
      </Reveal>
      {children ? (
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-2xl text-pretty text-[17px] leading-relaxed text-muted">{children}</p>
        </Reveal>
      ) : null}
    </header>
  );
}

export function Serif({ children }: { children: ReactNode }) {
  return <span className="font-serif text-[1.08em] font-normal italic tracking-[-0.02em]">{children}</span>;
}
