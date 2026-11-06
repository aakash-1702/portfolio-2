"use client";

import { useEffect, useRef } from "react";

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const fmt = (n: number, decimals: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Counts up to `value` the first time it scrolls into view, and tweens to new
 * values when live data refreshes. Writes straight to the DOM (no re-renders)
 * and never reads layout: visibility comes from IntersectionObserver only.
 */
export function Counter({
  value,
  duration = 1400,
  decimals = 0,
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef(value); // server HTML already shows the final value
  const seen = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;

    const tween = (from: number) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || from === value) {
        current.current = value;
        el.textContent = fmt(value, decimals);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const v = from + (value - from) * easeOutExpo(t);
        current.current = v;
        el.textContent = fmt(v, decimals);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    // Live data refreshed after we've already been seen: tween old → new.
    if (seen.current) {
      tween(current.current);
      return () => cancelAnimationFrame(raf);
    }

    let first = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (first) {
          first = false;
          if (entry.isIntersecting) {
            // On screen at load: keep the server-rendered number, no flash to 0.
            seen.current = true;
            io.disconnect();
            return;
          }
          // Below the fold: park at 0 (invisible) and count up on arrival.
          current.current = 0;
          el.textContent = fmt(0, decimals);
          return;
        }
        if (entry.isIntersecting) {
          seen.current = true;
          io.disconnect();
          tween(0);
        }
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, decimals]);

  // Server HTML carries the real number for crawlers and no-JS readers.
  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {fmt(value, decimals)}
    </span>
  );
}
