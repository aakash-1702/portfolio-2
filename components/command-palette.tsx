"use client";

import { AnimatePresence, m } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { caseStudies, nav, posts, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, Copy, Download, GitHub, LeetCode, LinkedIn, Search, XLogo } from "./ui/icons";

type Item = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon?: ReactNode;
  keywords?: string;
  run: () => void;
};

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo<Item[]>(() => {
    const go = (href: string) => () => {
      onClose();
      if (href.startsWith("/#") && pathname === "/") {
        document.getElementById(href.slice(2))?.scrollIntoView({ behavior: "smooth" });
        history.replaceState(null, "", href);
      } else router.push(href);
    };
    const ext = (href: string) => () => {
      onClose();
      window.open(href, "_blank", "noopener,noreferrer");
    };
    return [
      ...nav.map((n) => ({ id: `nav-${n.id}`, group: "Navigate", label: n.label, icon: <ArrowRight />, run: go(`/#${n.id}`) })),
      ...caseStudies.map((c) => ({
        id: `cs-${c.slug}`,
        group: "Case studies",
        label: c.title,
        hint: c.description,
        icon: <ArrowRight />,
        run: go(`/projects/${c.slug}`),
      })),
      ...posts.map((p) => ({
        id: `post-${p.slug}`,
        group: "Writing",
        label: p.title,
        hint: `${p.readingTime} min · ${p.tag}`,
        icon: <ArrowRight />,
        run: go(`/blog/${p.slug}`),
      })),
      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        hint: site.email,
        icon: <Copy />,
        keywords: "mail contact hire",
        run: () => {
          void navigator.clipboard.writeText(site.email).then(() => {
            setToast("Email copied");
            setTimeout(onClose, 650);
          });
        },
      },
      { id: "resume", group: "Actions", label: "Open resume (PDF)", icon: <Download />, keywords: "cv", run: ext(site.resume) },
      { id: "gh", group: "Elsewhere", label: "GitHub", hint: "aakash-1702", icon: <GitHub />, run: ext(site.links.github) },
      { id: "li", group: "Elsewhere", label: "LinkedIn", hint: "aakash49", icon: <LinkedIn />, run: ext(site.links.linkedin) },
      { id: "lc", group: "Elsewhere", label: "LeetCode", hint: "AshenCold", icon: <LeetCode />, run: ext(site.links.leetcode) },
      { id: "x", group: "Elsewhere", label: "X / Twitter", hint: "@im_aakash49", icon: <XLogo />, run: ext(site.links.x) },
    ];
  }, [onClose, pathname, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => `${i.label} ${i.hint ?? ""} ${i.group} ${i.keywords ?? ""}`.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      setToast(null);
      requestAnimationFrame(() => inputRef.current?.focus());
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (i + 1) % Math.max(filtered.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[index]?.run();
    }
  };

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[14vh]" onKeyDown={onKeyDown}>
          <m.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-line-strong bg-surface/95 shadow-[0_40px_120px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ type: "spring", stiffness: 520, damping: 38 }}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-4 text-dim" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a section, project, post…"
                className="h-13 w-full bg-transparent py-4 text-[15px] text-fg outline-none placeholder:text-dim"
                aria-label="Search commands"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-list"
                aria-activedescendant={filtered[index] ? `cmd-${filtered[index].id}` : undefined}
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-dim">ESC</kbd>
            </div>

            <div ref={listRef} id="command-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2" style={{ scrollbarWidth: "thin" }}>
              {filtered.length === 0 ? (
                <p className="px-3 py-10 text-center text-sm text-dim">No results for “{query}”</p>
              ) : (
                filtered.map((item, i) => {
                  const header = item.group !== lastGroup ? item.group : null;
                  lastGroup = item.group;
                  return (
                    <div key={item.id}>
                      {header ? <p className="label px-3 pb-1.5 pt-3 first:pt-1">{header}</p> : null}
                      <button
                        id={`cmd-${item.id}`}
                        data-index={i}
                        role="option"
                        aria-selected={i === index}
                        onMouseMove={() => setIndex(i)}
                        onClick={item.run}
                        className={cn(
                          "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] transition-colors",
                          i === index ? "text-fg" : "text-muted",
                        )}
                      >
                        {i === index ? (
                          <m.span
                            layoutId="cmd-active"
                            className="absolute inset-0 -z-10 rounded-lg bg-white/[0.07]"
                            transition={{ type: "spring", stiffness: 700, damping: 45 }}
                          />
                        ) : null}
                        <span className="text-dim [&>svg]:size-3.5">{item.icon}</span>
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {item.hint ? <span className="hidden max-w-[45%] truncate font-mono text-[11px] text-dim sm:block">{item.hint}</span> : null}
                        {item.group === "Elsewhere" ? <ArrowUpRight className="size-3.5 text-dim" /> : null}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-[10.5px] text-dim">
              <span>↑↓ navigate · ↵ select</span>
              <AnimatePresence mode="wait">
                {toast ? (
                  <m.span key="toast" className="text-ok" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    ✓ {toast}
                  </m.span>
                ) : (
                  <m.span key="brand" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {site.name}
                  </m.span>
                )}
              </AnimatePresence>
            </div>
          </m.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
