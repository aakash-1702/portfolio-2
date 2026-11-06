"use client";

// The hero's WebGL "signal field". Loaded lazily (see backdrop.tsx): this
// module and three.js never ship in the initial bundle.

import type { MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { FIELD_WIDTH, fragmentShader, vertexShader } from "./shaders";

// Square grid (~0.56 units between points in both directions).
const COLS = 150;
const ROWS = 132;
const DEPTH = 74;
const Z_NEAR = 8;

export default function SignalField({
  scroll,
  onReady,
  className,
}: {
  scroll: MotionValue<number>;
  onReady?: () => void;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
    } catch {
      return; // no WebGL: the CSS poster stays
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(canvas);

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 200);
    const target = new Vector3(0, 0, -20);

    // Grid of points on the y = 0 plane, receding from the viewer.
    const count = COLS * ROWS;
    const positions = new Float32Array(count * 3);
    const grid = new Float32Array(count * 2);
    for (let r = 0, i = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++, i++) {
        positions[i * 3] = (c / (COLS - 1) - 0.5) * FIELD_WIDTH;
        positions[i * 3 + 2] = Z_NEAR - (r / (ROWS - 1)) * DEPTH;
        grid[i * 2] = c;
        grid[i * 2 + 1] = r;
      }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("aGrid", new BufferAttribute(grid, 2));

    const css = getComputedStyle(document.documentElement);
    const token = (name: string, fallback: string) => new Color(css.getPropertyValue(name).trim() || fallback);
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new Vector2(999, 999) },
        uMouseAmp: { value: 0 },
        uPixelRatio: { value: dpr },
        uFade: { value: 1 },
        uCold: { value: new Color("#8a97b4") },
        uGold: { value: token("--color-gold", "#ffb84d") },
        uHot: { value: token("--color-ember", "#ff6b3d") },
      },
    });
    scene.add(new Points(geometry, material));

    // Size to the host element.
    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    // Pointer → point on the plane (ray/plane intersection), eased in the loop.
    const pointer = { x: 0, y: 0, moved: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.moved = performance.now();
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    const ndc = new Vector3();
    const dir = new Vector3();
    const mouseTarget = new Vector2(999, 999);

    // Scroll progress comes from a Framer Motion value: no React renders involved.
    let scrollP = scroll.get();
    const unsubscribe = scroll.on("change", (v) => (scrollP = v));

    // Loop state.
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    let announced = false;
    const u = material.uniforms;

    // Only render while the field is on screen.
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(el);

    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;
      u.uTime!.value = elapsed;

      // Camera glides forward and down as you scroll past the hero.
      camera.position.set(0, 5 + scrollP * 3, 14 - scrollP * 5);
      target.set(0, -scrollP * 4, -12);
      camera.lookAt(target);
      u.uFade!.value = 1 - scrollP * 0.85;

      // Cursor dome.
      const active = now - pointer.moved < 1400;
      if (active) {
        const rect = el.getBoundingClientRect();
        ndc.set(((pointer.x - rect.left) / rect.width) * 2 - 1, -((pointer.y - rect.top) / rect.height) * 2 + 1, 0.5);
        dir.copy(ndc).unproject(camera).sub(camera.position).normalize();
        if (dir.y < -0.0001) {
          const tHit = -camera.position.y / dir.y;
          mouseTarget.set(camera.position.x + dir.x * tHit, camera.position.z + dir.z * tHit);
        }
      }
      const mouse = u.uMouse!.value as Vector2;
      if (mouse.x > 900) mouse.copy(mouseTarget);
      else mouse.lerp(mouseTarget, 0.08);
      u.uMouseAmp!.value += ((active ? 1 : 0) - u.uMouseAmp!.value) * 0.04;

      renderer.render(scene, camera);
      if (!announced) {
        announced = true;
        readyRef.current?.();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      ro.disconnect();
      unsubscribe();
      window.removeEventListener("pointermove", onPointer);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [scroll]);

  return <div ref={host} className={className} aria-hidden />;
}
