"use client";

import { AnimatePresence, m, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";
import { Appear, Caption, easeInOut, toneChip, useProgress, useStep, type Tone } from "./engine";

type Point = { x: number; y: number };
type Tool = Point & { id: string; label: string; sub: string };

const CORE: Point = { x: 50, y: 50 };
const TOOLS: Tool[] = [
  { id: "mcp", label: "MCP server", sub: "Claude & clients", x: 15, y: 18 },
  { id: "netsuite", label: "NetSuite", sub: "SuiteTalk REST", x: 85, y: 18 },
  { id: "mail", label: "Mail", sub: "Gmail · Outlook · IMAP", x: 11, y: 55 },
  { id: "sap", label: "SAP B1", sub: "AR dunning", x: 89, y: 55 },
  { id: "slack", label: "Slack", sub: "events · DMs", x: 26, y: 90 },
  { id: "mysql", label: "MySQL", sub: "shared DB layer", x: 74, y: 90 },
];
const NETSUITE = TOOLS[1]!;
const SLACK = TOOLS[4]!;

// Scene-local seconds at which the story advances.
const BEATS = [1.4, 2.0, 2.75, 3.2, 3.95, 4.35, 5.05];
// step: 0 idle · 1 prompt · 2 tool_call · 3 suspended · 4 login link · 5 signed in · 6 resuming · 7 created

function Line({ to, at, hot }: { to: Point; at: number; hot: boolean }) {
  // Fade, not pathLength: dash-based drawing breaks with non-scaling strokes in a stretched viewBox.
  const fade = useProgress(at, at + 0.6, easeInOut);
  return (
    <>
      <m.line
        x1={CORE.x}
        y1={CORE.y}
        x2={to.x}
        y2={to.y}
        stroke="rgb(196 210 255 / 0.18)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        style={{ opacity: fade }}
      />
      <line
        x1={CORE.x}
        y1={CORE.y}
        x2={to.x}
        y2={to.y}
        stroke="var(--color-ember)"
        strokeWidth={1.6}
        vectorEffect="non-scaling-stroke"
        className="transition-opacity duration-500"
        style={{ opacity: hot ? 0.9 : 0 }}
      />
    </>
  );
}

function Packet({ to, p, tone, label }: { to: Point; p: MotionValue<number>; tone: Tone; label: string }) {
  const left = useTransform(p, (v) => `${CORE.x + (to.x - CORE.x) * v}%`);
  const top = useTransform(p, (v) => `${CORE.y + (to.y - CORE.y) * v}%`);
  const opacity = useTransform(p, [0, 0.06, 0.9, 1], [0, 1, 1, 0]);
  const dot = { ember: "bg-ember text-ember", sky: "bg-sky text-sky", gold: "bg-gold text-gold", rose: "bg-rose text-rose" }[tone];
  return (
    <m.div className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left, top, opacity }}>
      <span className={cn("block size-[2.4cqmin] min-h-1.5 min-w-1.5 rounded-full shadow-[0_0_14px_currentColor]", dot)} />
      <span
        className={cn(
          "absolute left-1/2 top-[3.2cqmin] -translate-x-1/2 whitespace-nowrap rounded-full border px-[1.4cqmin] py-[0.3cqmin] font-mono text-[max(8px,2cqmin)]",
          toneChip[tone],
        )}
      >
        {label}
      </span>
    </m.div>
  );
}

function nodeStyle(tool: Tool, step: number) {
  if (tool.id === "netsuite") {
    if (step >= 7) return { cls: "border-sky/60 bg-sky/[0.08] shadow-[0_0_40px_-12px_var(--color-sky)]", sub: "201 Created", subCls: "text-sky" };
    if (step >= 5) return { cls: "border-sky/50", sub: "session ok", subCls: "text-sky" };
    if (step >= 3) return { cls: "border-gold/60 bg-gold/[0.06]", sub: "login required", subCls: "text-gold" };
    if (step >= 2) return { cls: "border-ember/60 shadow-[0_0_36px_-12px_var(--color-ember)]", sub: tool.sub, subCls: "text-dim" };
  }
  if (tool.id === "slack" && step === 4) {
    return { cls: "border-gold/60 bg-gold/[0.06]", sub: "login link sent", subCls: "text-gold" };
  }
  return { cls: "border-line-strong", sub: tool.sub, subCls: "text-dim" };
}

export function ChatFinScene() {
  const step = useStep(BEATS);
  const call = useProgress(2.0, 2.7, easeInOut);
  const link = useProgress(3.2, 3.85, easeInOut);
  const resume = useProgress(4.35, 5.0, easeInOut);

  const status =
    step >= 7
      ? { k: "done", text: "✓ vendor bill VB-1042 posted", tone: "sky" as Tone }
      : step >= 5
        ? { k: "resume", text: "signed in → resuming the call", tone: "sky" as Tone }
        : step >= 3
          ? { k: "wait", text: "suspended · waiting for login", tone: "gold" as Tone }
          : step >= 2
            ? { k: "call", text: "tool_call · netsuite.postVendorBill", tone: "ember" as Tone }
            : null;

  return (
    <>
      <Caption
        index="01"
        kicker="ChatFin.ai"
        tone="ember"
        title="Agents that call real tools"
        sub="Tool-calling plugins and an MCP server over finance systems. A call that needs a login suspends in place, then resumes."
        tags={["MCP", "LLM tool calling", "Slack Bolt", "MySQL"]}
      />

      <div className="reel-visual">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
          {TOOLS.map((tool, i) => (
            <Line
              key={tool.id}
              to={tool}
              at={0.35 + i * 0.08}
              hot={(tool.id === "netsuite" && step >= 2) || (tool.id === "slack" && step === 4)}
            />
          ))}
        </svg>

        {TOOLS.map((tool, i) => {
          const s = nodeStyle(tool, step);
          return (
            <Appear
              key={tool.id}
              at={0.4 + i * 0.09}
              y={8}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${tool.x}%`, top: `${tool.y}%` }}
            >
              <div
                className={cn(
                  "rounded-[1.6cqmin] border bg-surface-2/90 px-[2.2cqmin] py-[1.2cqmin] transition-[border-color,background-color,box-shadow] duration-500",
                  s.cls,
                )}
              >
                <p className="whitespace-nowrap text-[max(9px,2.9cqmin)] font-medium leading-tight text-fg">{tool.label}</p>
                <p className={cn("node-sub whitespace-nowrap font-mono text-[max(8px,2cqmin)] transition-colors duration-500", s.subCls)}>
                  {s.sub}
                </p>
              </div>
            </Appear>
          );
        })}

        {/* agent core */}
        <Appear at={0.15} y={0} scale={0.7} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${CORE.x}%`, top: `${CORE.y}%` }}>
          <div className="relative grid size-[25cqmin] min-h-16 min-w-16 place-items-center rounded-full border border-ember/50 bg-[radial-gradient(circle_at_50%_30%,color-mix(in_oklab,var(--color-ember)_30%,transparent),var(--color-bg)_72%)] shadow-[0_0_70px_-12px_var(--color-ember)]">
            <span className="reel-ping absolute inset-0 rounded-full border border-ember/40" />
            <span className="reel-ping absolute inset-0 rounded-full border border-ember/30 [animation-delay:1.2s]" />
            <div className="text-center">
              <p className="text-[max(11px,3.6cqmin)] font-medium leading-none text-fg">agent</p>
              <p className="mt-[0.8cqmin] font-mono text-[max(8px,2cqmin)] text-ember">llm · tool calling</p>
            </div>
            <AnimatePresence>
              {step >= 7 ? (
                <m.span
                  key="burst"
                  className="absolute inset-0 rounded-full border-2 border-sky"
                  initial={{ scale: 1, opacity: 0.9 }}
                  animate={{ scale: 2.3, opacity: 0 }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </Appear>

        <Packet to={NETSUITE} p={call} tone="ember" label="tool_call" />
        <Packet to={SLACK} p={link} tone="gold" label="login link" />
        <Packet to={NETSUITE} p={resume} tone="sky" label="resume" />

        {/* incoming prompt */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[40%]">
          <AnimatePresence>
            {step >= 1 ? (
              <m.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="whitespace-nowrap rounded-full border border-line-strong bg-surface/95 px-[2.2cqmin] py-[1cqmin] font-mono text-[max(9px,2.3cqmin)]"
              >
                <span className="text-dim">you › </span>
                <span className="inline-block text-fg" style={{ animation: "type 0.9s steps(33) both" }}>
                  post this vendor bill to NetSuite
                </span>
              </m.p>
            ) : null}
          </AnimatePresence>
        </div>

        {/* status */}
        <div className="absolute left-1/2 top-[72%] -translate-x-1/2">
          <AnimatePresence mode="wait">
            {status ? (
              <m.p
                key={status.k}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "whitespace-nowrap rounded-full border px-[2cqmin] py-[0.9cqmin] font-mono text-[max(9px,2.2cqmin)]",
                  toneChip[status.tone],
                )}
              >
                {status.text}
              </m.p>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
