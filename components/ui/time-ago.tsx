"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/utils";

/** Relative time rendered only on the client, so static HTML never mismatches. */
export function TimeAgo({ iso, prefix = "" }: { iso: string; prefix?: string }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setText(timeAgo(iso));
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, [iso]);
  return <span suppressHydrationWarning>{text ? `${prefix}${text}` : " "}</span>;
}
