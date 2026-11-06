"use client";

import { m, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// three.js + the shader live in their own chunk, fetched only when the gate below opens.
const SignalField = dynamic(() => import("./signal-field"), { ssr: false });

type Connection = { saveData?: boolean };

function canRunWebGL() {
  if (typeof window === "undefined" || !("WebGL2RenderingContext" in window)) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if ((navigator as Navigator & { connection?: Connection }).connection?.saveData) return false;
  // Phones keep the CSS field: no 3D download on small screens or slow CPUs.
  return window.matchMedia("(min-width: 768px)").matches;
}

/**
 * Hero backdrop. Server-renders a CSS-only perspective dot field (the "poster"),
 * then, once the browser is idle and the hero is on screen, lazily mounts the
 * WebGL field and crossfades to it with Framer Motion.
 */
export function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { margin: "200px 0px" });
  const [eligible, setEligible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  // Scroll progress through the first viewport drives the camera and fade.
  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, [0, 900], [0, 1], { clamp: true });
  const posterY = useTransform(scrollY, [0, 900], [0, 140]);

  useEffect(() => {
    if (reduce || !canRunWebGL()) return;
    const open = () => setEligible(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(open, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(open, 1200);
    return () => window.clearTimeout(id);
  }, [reduce]);

  // Mount once (when eligible and on screen); the field pauses itself off-screen.
  useEffect(() => {
    if (eligible && inView) setMounted(true);
  }, [eligible, inView]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="hero-field-mask pointer-events-none absolute inset-x-0 top-0 -z-10 h-[100svh] min-h-[640px] overflow-hidden"
    >
      <m.div
        className="field-poster"
        style={{ y: posterY }}
        animate={{ opacity: ready ? 0 : 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
      {mounted ? (
        <m.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <SignalField scroll={progress} onReady={() => setReady(true)} className="absolute inset-0" />
        </m.div>
      ) : null}
    </div>
  );
}
