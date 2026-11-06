"use client";

import { AnimatePresence, m, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Drifts its children against the scroll for a little depth behind the 3D field. */
export function Parallax({ children, distance = -70, className }: { children: ReactNode; distance?: number; className?: string }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], [0, distance], { clamp: true });
  return (
    <m.div className={className} style={{ y }}>
      {children}
    </m.div>
  );
}

/** Pulls toward the cursor on a spring, then settles back. */
export function Magnetic({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(0, { stiffness: 260, damping: 18, mass: 0.35 });
  const y = useSpring(0, { stiffness: 260, damping: 18, mass: 0.35 });
  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <m.span ref={ref} className={cn("inline-flex", className)} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </m.span>
  );
}

const clockFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function Digit({ ch }: { ch: string }) {
  if (ch === ":") return <span className="inline-block w-[1ch] text-center">:</span>;
  return (
    <span className="relative inline-block h-[1.2em] w-[1ch] overflow-hidden align-bottom">
      <AnimatePresence initial={false} mode="popLayout">
        <m.span
          key={ch}
          className="absolute inset-0 text-center"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          {ch}
        </m.span>
      </AnimatePresence>
    </span>
  );
}

/** Kanpur time with rolling digits. Client-only, so static HTML never mismatches. */
export function LiveClock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(clockFmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="inline-flex items-baseline tabular-nums" aria-label={now ? `${now} IST` : undefined}>
      <span aria-hidden className="inline-flex">
        {(now ?? "--:--:--").split("").map((ch, i) => (
          <Digit key={i} ch={ch} />
        ))}
      </span>
      <span aria-hidden>&nbsp;IST</span>
    </span>
  );
}
