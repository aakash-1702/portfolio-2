"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// The palette UI is code-split: nothing ships until the first ⌘K / click.
const Palette = dynamic(() => import("./command-palette"), { ssr: false });

const OPEN_EVENT = "command-menu:open";

export function openCommandMenu() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMounted(true);
        setOpen((o) => !o);
      }
    };
    const onOpen = () => {
      setMounted(true);
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  return mounted ? <Palette open={open} onClose={() => setOpen(false)} /> : null;
}
