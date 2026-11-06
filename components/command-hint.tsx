"use client";

import { openCommandMenu } from "./command-menu";

export function CommandHint() {
  return (
    <button
      type="button"
      onClick={openCommandMenu}
      className="hidden items-center gap-2 font-mono text-[11.5px] text-dim transition-colors hover:text-muted sm:inline-flex"
    >
      <kbd className="rounded border border-line-strong px-1.5 py-px text-[11px] text-muted">⌘K</kbd>
      jump anywhere
    </button>
  );
}
