# akashdwivedi.me (v3)

Personal site of Akash Dwivedi: backend & applied-AI engineer.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · Motion (Framer Motion) · TanStack Query v5 · MDX with build-time syntax highlighting (Shiki).

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all routes static / ISR)
npm start          # serve the production build
npm run typecheck
```

## Editing content

Almost every word on the site lives in **`lib/site.ts`**: experience, ChatFin contributions (and which diagram nodes each one lights up), projects, stack, timeline, certifications and the post list. Components only render that data.

| What | Where |
| --- | --- |
| Blog posts | `content/blog/<slug>.mdx` + an entry in `posts` in `lib/site.ts` |
| Case studies | `content/projects/<slug>.mdx` + an entry in `caseStudies` and `featured` |
| Resume PDF | `public/AkashResume.pdf` (also served at `/resume`) |
| Live-stats fallbacks | `lib/stats.ts` (snapshot used only if LeetCode/GitHub are unreachable) |

MDX note: `{`, `}` and `<` in prose must be escaped (`\{`, `&lt;`) or wrapped in backticks.

## How the live data works

- `lib/stats.ts` fetches LeetCode (GraphQL) and GitHub (REST) on the server.
- The home page is static with `revalidate = 1800`. At build/ISR time it prefetches both queries and passes them to the client through TanStack Query's `HydrationBoundary`, so the HTML ships with real numbers and there is no loading state.
- In the browser, `useQuery` reuses that cache and refreshes stale data from `/api/stats/*` (also ISR-cached for 30 minutes), so upstream APIs are hit at most twice an hour.
- Optional `GITHUB_TOKEN` env var raises the GitHub rate limit (see `.env.example`).

## Performance choices

- Hero text animates with pure CSS, so it paints before hydration (LCP ≈ 0.9 s on Lighthouse's throttled mobile profile).
- Motion uses `LazyMotion` + the `m` component (strict mode), and animations pause when off-screen (`useInView`, SMIL `pauseAnimations`).
- Scroll progress and the timeline rail use CSS scroll-driven animations: no JS on scroll.
- The ⌘K palette is code-split and loads on first open.
- Counters write to the DOM directly (no React re-renders) and never read layout.
- Lighthouse (Nov 2026): 100 / 100 / 100 / 100 on mobile and desktop.

## Deploying

Import the repo in Vercel (framework preset: Next.js). No env vars are required; add `GITHUB_TOKEN` if you want authenticated GitHub requests. Old URLs (`/about`, `/contact`, `/projects`, `/projects/medbackend`, `/projects/bookstore-backend`) redirect via `next.config.ts`.
