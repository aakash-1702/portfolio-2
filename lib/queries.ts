import { queryOptions } from "@tanstack/react-query";
import type { GitHubStats, LeetCodeStats } from "./stats";

// Shared query definitions. The server prefetches these keys with direct
// fetchers; the client refreshes them through the cached API routes.

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return (await res.json()) as T;
}

export const leetcodeQuery = queryOptions({
  queryKey: ["stats", "leetcode"] as const,
  queryFn: () => getJSON<LeetCodeStats>("/api/stats/leetcode"),
  staleTime: 15 * 60_000,
});

export const githubQuery = queryOptions({
  queryKey: ["stats", "github"] as const,
  queryFn: () => getJSON<GitHubStats>("/api/stats/github"),
  staleTime: 15 * 60_000,
});
