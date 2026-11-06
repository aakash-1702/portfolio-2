"use client";

import { m, useInView } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { chatfin, type ArchNode } from "@/lib/site";
import { cn } from "@/lib/utils";

const W = 1000;
const H = 520;
const NODE_W = 168;

type NodeDef = { id: ArchNode; x: number; y: number; label: string; sub: string; kind?: "ai" | "sys" };

const NODES: NodeDef[] = [
  { id: "slack", x: 95, y: 80, label: "Slack", sub: "channels · DMs" },
  { id: "mail", x: 95, y: 200, label: "Email", sub: "Gmail · Outlook · IMAP" },
  { id: "web", x: 95, y: 320, label: "Web chat", sub: "apps & copilots" },
  { id: "mcpc", x: 95, y: 440, label: "MCP clients", sub: "Claude & others" },
  { id: "bus", x: 315, y: 140, label: "Event bus", sub: "subscribe · fan-out" },
  { id: "mcps", x: 315, y: 440, label: "MCP server", sub: "tool discovery" },
  { id: "wf", x: 535, y: 80, label: "Workflows & apps", sub: "durable runs" },
  { id: "agent", x: 535, y: 270, label: "AI agent", sub: "LLM tool calling", kind: "ai" },
  { id: "plugins", x: 745, y: 270, label: "Plugins", sub: "tools · lazy auth" },
  { id: "netsuite", x: 912, y: 110, label: "NetSuite", sub: "SuiteTalk REST", kind: "sys" },
  { id: "sap", x: 912, y: 270, label: "SAP B1", sub: "AR · invoices", kind: "sys" },
  { id: "mysql", x: 912, y: 430, label: "MySQL", sub: "shared DB layer", kind: "sys" },
];

const EDGES: [ArchNode, ArchNode][] = [
  ["slack", "bus"], ["mail", "bus"], ["bus", "wf"], ["bus", "agent"], ["web", "agent"],
  ["wf", "plugins"], ["agent", "plugins"], ["mcpc", "mcps"], ["mcps", "plugins"],
  ["plugins", "netsuite"], ["plugins", "sap"], ["plugins", "mysql"],
];

const COLUMNS = [
  { x: 95, label: "channels" },
  { x: 315, label: "routing" },
  { x: 535, label: "orchestration" },
  { x: 745, label: "tools" },
  { x: 912, label: "systems" },
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<ArchNode, NodeDef>;

function edgePath(a: NodeDef, b: NodeDef) {
  const x1 = a.x + NODE_W / 2;
  const x2 = b.x - NODE_W / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${x2} ${b.y}`;
}

const tagStyle: Record<string, string> = {
  agents: "text-ai border-ai/25 bg-ai/[0.07]",
  events: "text-ok border-ok/25 bg-ok/[0.07]",
  data: "text-warn border-warn/25 bg-warn/[0.07]",
  reliability: "text-fg/80 border-line-strong bg-white/[0.04]",
};

export function ChatFinSystem() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const inView = useInView(wrapRef, { margin: "-10% 0px" });
  const [active, setActive] = useState(chatfin.contributions[0]!.id);
  const [pinned, setPinned] = useState(false);

  // Auto-advance through contributions while visible and not being explored.
  useEffect(() => {
    if (!inView || pinned) return;
    const t = setInterval(() => {
      setActive((cur) => {
        const i = chatfin.contributions.findIndex((c) => c.id === cur);
        return chatfin.contributions[(i + 1) % chatfin.contributions.length]!.id;
      });
    }, 4200);
    return () => clearInterval(t);
  }, [inView, pinned]);

  // Pause SMIL packet animations when the diagram is off-screen.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (inView) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [inView]);

  const activeNodes = useMemo(
    () => new Set<ArchNode>(chatfin.contributions.find((c) => c.id === active)?.nodes ?? []),
    [active],
  );

  const edges = useMemo(
    () =>
      EDGES.map(([a, b], i) => ({
        id: `${a}-${b}`,
        d: edgePath(byId[a], byId[b]),
        hot: activeNodes.has(a) && activeNodes.has(b),
        i,
      })),
    [activeNodes],
  );

  return (
    <div ref={wrapRef}>
      {/* Diagram */}
      <div className="relative hidden md:block" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden>
          <defs>
            <linearGradient id="edge-hot" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--color-sky)" />
              <stop offset="100%" stopColor="var(--color-ember)" />
            </linearGradient>
          </defs>
          {COLUMNS.map((c) => (
            <line key={c.label} x1={c.x} x2={c.x} y1={30} y2={H - 10} stroke="rgb(255 255 255 / 0.03)" strokeDasharray="2 6" />
          ))}
          {edges.map((e) => (
            <g key={e.id}>
              <path id={`edge-${e.id}`} d={e.d} fill="none" stroke="rgb(255 255 255 / 0.09)" strokeWidth={1.2} />
              {/* ambient packet on every edge */}
              <circle r={2.2} fill="rgb(255 255 255 / 0.35)">
                <animateMotion dur="3.4s" repeatCount="indefinite" begin={`-${((e.i * 0.41) % 3.4).toFixed(2)}s`} path={e.d} />
              </circle>
            </g>
          ))}
          {edges
            .filter((e) => e.hot)
            .map((e) => (
              <g key={`${active}-${e.id}`}>
                <m.path
                  d={e.d}
                  fill="none"
                  stroke="url(#edge-hot)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
                {[0, 0.6].map((offset) => (
                  <circle key={offset} r={3.2} fill="var(--color-ember)" style={{ filter: "drop-shadow(0 0 6px var(--color-ember))" }}>
                    <animateMotion dur="1.2s" repeatCount="indefinite" begin={`-${offset}s`} path={e.d} />
                  </circle>
                ))}
              </g>
            ))}
        </svg>

        {COLUMNS.map((c) => (
          <span
            key={c.label}
            className="label absolute -translate-x-1/2 text-[10px]"
            style={{ left: `${(c.x / W) * 100}%`, top: 0 }}
          >
            {c.label}
          </span>
        ))}

        {NODES.map((n) => {
          const on = activeNodes.has(n.id);
          return (
            <div
              key={n.id}
              className={cn(
                "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col justify-center rounded-xl border px-3 transition-[border-color,background-color,box-shadow,color] duration-500",
                on
                  ? n.kind === "ai" || n.id === "agent"
                    ? "border-ai/60 bg-[color-mix(in_oklab,var(--color-ember)_10%,var(--color-surface-2))] shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-ember)_9%,transparent),0_0_40px_-8px_color-mix(in_oklab,var(--color-ember)_55%,transparent)]"
                    : "border-ok/50 bg-[color-mix(in_oklab,var(--color-sky)_8%,var(--color-surface-2))] shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-sky)_7%,transparent),0_0_40px_-10px_color-mix(in_oklab,var(--color-sky)_45%,transparent)]"
                  : n.id === "agent"
                    ? "border-ai/25 bg-surface-2"
                    : "border-line-strong bg-surface-2",
              )}
              style={{
                left: `${(n.x / W) * 100}%`,
                top: `${(n.y / H) * 100}%`,
                width: `${(NODE_W / W) * 100}%`,
                height: `${(58 / H) * 100}%`,
              }}
            >
              <span className={cn("truncate text-[11px] font-medium lg:text-[13px]", on ? "text-fg" : "text-fg/75")}>
                {n.label}
              </span>
              <span className={cn("truncate font-mono text-[9px] lg:text-[10.5px]", on ? "text-muted" : "text-dim")}>
                {n.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* Contributions */}
      <div
        className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        onMouseLeave={() => setPinned(false)}
      >
        {chatfin.contributions.map((c, i) => {
          const on = c.id === active;
          return (
            <m.button
              type="button"
              key={c.id}
              onMouseEnter={() => {
                setPinned(true);
                setActive(c.id);
              }}
              onFocus={() => {
                setPinned(true);
                setActive(c.id);
              }}
              onClick={() => {
                setPinned(true);
                setActive(c.id);
              }}
              aria-pressed={on}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "relative flex flex-col items-start justify-start overflow-hidden rounded-xl border p-5 text-left transition-colors duration-300",
                on ? "border-line-strong bg-surface-2" : "border-line bg-surface hover:border-line-strong",
              )}
            >
              {on ? (
                <m.span
                  layoutId="contrib-bar"
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-ok via-ai to-transparent"
                  transition={{ type: "spring", stiffness: 300, damping: 34 }}
                />
              ) : null}
              <span className={cn("inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider", tagStyle[c.tag])}>
                {c.tag}
              </span>
              <h4 className="mt-3.5 text-[15px] font-medium tracking-tight text-fg">{c.title}</h4>
              <p className={cn("mt-2 text-[13.5px] leading-relaxed transition-colors", on ? "text-muted" : "text-muted/80")}>{c.body}</p>
            </m.button>
          );
        })}
      </div>
      <p className="mt-4 font-mono text-[11px] text-dim">
        <span className="hidden md:inline">Hover a card to trace it through the system. </span>Diagram simplified; client
        systems omitted.
      </p>
    </div>
  );
}
