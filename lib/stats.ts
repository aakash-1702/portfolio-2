// Server-side fetchers for live stats. Used by the API routes and by the home
// page's server prefetch, so the HTML ships with data and TanStack Query only
// refreshes it in the background.

import { site } from "./site";

export const REVALIDATE_SECONDS = 1800;

export type LeetCodeStats = {
  rating: number;
  badge: string | null;
  topPercentage: number | null;
  globalRanking: number | null;
  contests: number;
  solved: { all: number; easy: number; medium: number; hard: number };
  history: number[]; // last contest ratings, oldest first
  fetchedAt: string;
  source: "live" | "snapshot";
};

export type GitHubRepo = {
  name: string;
  url: string;
  language: string | null;
  pushedAt: string;
  stars: number;
};

export type GitHubStats = {
  publicRepos: number;
  followers: number;
  stars: number;
  recent: GitHubRepo[];
  fetchedAt: string;
  source: "live" | "snapshot";
};

// Snapshot taken on 7 Nov 2026, used only if the upstream API is unreachable.
const leetcodeSnapshot: LeetCodeStats = {
  rating: 1868,
  badge: "Knight",
  topPercentage: 5.8,
  globalRanking: 50445,
  contests: 68,
  solved: { all: 931, easy: 366, medium: 473, hard: 92 },
  history: [],
  fetchedAt: "2026-11-07T00:00:00.000Z",
  source: "snapshot",
};

const githubSnapshot: GitHubStats = {
  publicRepos: 41,
  followers: 8,
  stars: 21,
  recent: [
    { name: "pareeksha", url: "https://github.com/aakash-1702/pareeksha", language: "TypeScript", pushedAt: "2026-10-31T00:00:00Z", stars: 0 },
    { name: "redis", url: "https://github.com/aakash-1702/redis", language: "Go", pushedAt: "2026-10-25T00:00:00Z", stars: 0 },
    { name: "queuectl", url: "https://github.com/aakash-1702/queuectl", language: "TypeScript", pushedAt: "2026-07-18T00:00:00Z", stars: 0 },
    { name: "basecase", url: "https://github.com/aakash-1702/basecase", language: "TypeScript", pushedAt: "2026-06-09T00:00:00Z", stars: 6 },
  ],
  fetchedAt: "2026-11-07T00:00:00.000Z",
  source: "snapshot",
};

const LEETCODE_QUERY = `query portfolio($u: String!) {
  matchedUser(username: $u) { submitStatsGlobal { acSubmissionNum { difficulty count } } }
  userContestRanking(username: $u) { rating globalRanking topPercentage attendedContestsCount badge { name } }
  userContestRankingHistory(username: $u) { rating attended }
}`;

type LeetCodeResponse = {
  data?: {
    matchedUser: { submitStatsGlobal: { acSubmissionNum: { difficulty: string; count: number }[] } } | null;
    userContestRanking: {
      rating: number;
      globalRanking: number;
      topPercentage: number;
      attendedContestsCount: number;
      badge: { name: string } | null;
    } | null;
    userContestRankingHistory: { rating: number; attended: boolean }[] | null;
  };
};

export async function getLeetCodeStats(): Promise<LeetCodeStats> {
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
        "User-Agent": "Mozilla/5.0 (portfolio stats)",
      },
      body: JSON.stringify({ query: LEETCODE_QUERY, variables: { u: site.handles.leetcode } }),
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error(`leetcode ${res.status}`);
    const json = (await res.json()) as LeetCodeResponse;
    const ranking = json.data?.userContestRanking;
    const subs = json.data?.matchedUser?.submitStatsGlobal.acSubmissionNum;
    if (!ranking || !subs) throw new Error("leetcode: empty payload");

    const count = (d: string) => subs.find((s) => s.difficulty === d)?.count ?? 0;
    const history = (json.data?.userContestRankingHistory ?? [])
      .filter((h) => h.attended)
      .map((h) => Math.round(h.rating))
      .slice(-24);

    return {
      rating: Math.round(ranking.rating),
      badge: ranking.badge?.name ?? null,
      topPercentage: ranking.topPercentage,
      globalRanking: ranking.globalRanking,
      contests: ranking.attendedContestsCount,
      solved: { all: count("All"), easy: count("Easy"), medium: count("Medium"), hard: count("Hard") },
      history,
      fetchedAt: new Date().toISOString(),
      source: "live",
    };
  } catch {
    return leetcodeSnapshot;
  }
}

// Auto-synced or scratch repos that shouldn't headline the "recently pushed" feed.
const HIDDEN_REPOS = new Set(["LeetcodeSubmission", "DailyQuestions", "python-basics", "hackerrank-orchestrate-october26"]);

type GhUser = { public_repos: number; followers: number };
type GhRepo = {
  name: string;
  html_url: string;
  language: string | null;
  pushed_at: string;
  stargazers_count: number;
  fork: boolean;
};

export async function getGitHubStats(): Promise<GitHubStats> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-stats",
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  };
  const opts = { headers, next: { revalidate: REVALIDATE_SECONDS }, signal: AbortSignal.timeout(6000) };
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${site.handles.github}`, opts),
      fetch(`https://api.github.com/users/${site.handles.github}/repos?per_page=100&sort=pushed`, opts),
    ]);
    if (!userRes.ok || !reposRes.ok) throw new Error("github: bad status");
    const user = (await userRes.json()) as GhUser;
    const repos = ((await reposRes.json()) as GhRepo[]).filter((r) => !r.fork);

    return {
      publicRepos: user.public_repos,
      followers: user.followers,
      stars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
      recent: repos.filter((r) => !HIDDEN_REPOS.has(r.name)).slice(0, 4).map((r) => ({
        name: r.name,
        url: r.html_url,
        language: r.language,
        pushedAt: r.pushed_at,
        stars: r.stargazers_count,
      })),
      fetchedAt: new Date().toISOString(),
      source: "live",
    };
  } catch {
    return githubSnapshot;
  }
}
