import Link from "next/link";
import { nav, site } from "@/lib/site";
import { ArrowUpRight } from "./ui/icons";

const elsewhere = [
  { label: "GitHub", href: site.links.github },
  { label: "LinkedIn", href: site.links.linkedin },
  { label: "LeetCode", href: site.links.leetcode },
  { label: "X / Twitter", href: site.links.x },
  { label: "takeUforward", href: site.links.tuf },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <p className="text-[15px] font-medium">{site.name}</p>
          <p className="mt-1 text-sm text-muted">{site.role}</p>
          <p className="mt-6 max-w-sm text-[13px] leading-relaxed text-dim">
            Built with Next.js 16, Motion and TanStack Query. Every page is pre-rendered; live stats revalidate every
            30 minutes. Press <kbd className="rounded border border-line px-1 font-mono text-[11px] text-muted">⌘K</kbd> anywhere.
          </p>
        </div>
        <div>
          <p className="label">Site</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((n) => (
              <li key={n.id}>
                <Link href={`/#${n.id}`} className="link-underline text-muted transition-colors hover:text-fg">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/blog" className="link-underline text-muted transition-colors hover:text-fg">
                All posts
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="label">Elsewhere</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {elsewhere.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 text-muted transition-colors hover:text-fg">
                  <span className="link-underline">{l.label}</span>
                  <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-page flex flex-col gap-2 border-t border-line py-6 font-mono text-[11px] text-dim sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} {site.name}. {site.location}.</span>
        <span>status: <span className="text-ok">all systems operational</span></span>
      </div>

      <p
        aria-hidden
        className="pointer-events-none -mb-[2.2vw] select-none whitespace-nowrap bg-gradient-to-b from-white/[0.09] to-white/0 bg-clip-text px-4 text-center text-[15.5vw] font-semibold leading-[0.9] tracking-[-0.06em] text-transparent"
      >
        akash dwivedi
      </p>
    </footer>
  );
}
