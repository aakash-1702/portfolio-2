"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "motion/react";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Command } from "./ui/icons";
import { openCommandMenu } from "./command-menu";

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: whichever section crosses the middle of the viewport is active.
  useEffect(() => {
    if (!isHome) {
      setActive(pathname.startsWith("/blog") ? "writing" : pathname.startsWith("/projects") ? "projects" : null);
      return;
    }
    const ids = ["top", ...nav.map((n) => n.id)];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id === "top" ? null : e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [isHome, pathname]);

  const highlighted = hovered ?? active;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled ? "border-b border-line bg-bg/70 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div aria-hidden className="scroll-progress" />
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5 font-mono text-[13px] tracking-tight" aria-label={`${site.name}, home`}>
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-pulse-dot rounded-full bg-ember text-ember" />
            <span className="relative size-2 rounded-full bg-ember" />
          </span>
          <span className="text-fg">akash</span>
          <span className="-ml-2 text-dim transition-colors group-hover:text-muted">.dwivedi</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul
            className="flex items-center gap-0.5 rounded-full border border-line bg-surface/60 p-1 backdrop-blur"
            onMouseLeave={() => setHovered(null)}
          >
            {nav.map((item) => (
              <li key={item.id}>
                <Link
                  href={isHome ? `#${item.id}` : `/#${item.id}`}
                  onMouseEnter={() => setHovered(item.id)}
                  className={cn(
                    "relative block rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-200",
                    highlighted === item.id ? "text-fg" : "text-muted hover:text-fg",
                  )}
                  aria-current={active === item.id ? "true" : undefined}
                >
                  {highlighted === item.id ? (
                    <m.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-white/[0.08]"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  ) : null}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCommandMenu}
            className="flex h-8 items-center gap-2 rounded-full border border-line bg-surface/60 px-3 text-[12px] text-muted transition-colors hover:border-line-strong hover:text-fg"
            aria-label="Open command menu"
          >
            <Command className="hidden size-3.5 sm:block" />
            <span className="hidden font-mono sm:inline">K</span>
            <span className="sm:hidden">Menu</span>
          </button>
          <a
            href={site.resume}
            target="_blank"
            rel="noreferrer"
            className="hidden h-8 items-center rounded-full bg-fg px-3.5 text-[12.5px] font-medium text-bg transition-transform hover:scale-[1.03] active:scale-[0.98] sm:flex"
          >
            Resume
          </a>
        </div>
      </div>
    </header>
  );
}
