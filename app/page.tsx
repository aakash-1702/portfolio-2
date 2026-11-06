import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { About } from "@/components/sections/about";
import { Algorithms } from "@/components/sections/algorithms";
import { Contact } from "@/components/sections/contact";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { Projects } from "@/components/sections/projects";
import { Signals } from "@/components/sections/signals";
import { Stack } from "@/components/sections/stack";
import { Writing } from "@/components/sections/writing";
import { githubQuery, leetcodeQuery } from "@/lib/queries";
import { getGitHubStats, getLeetCodeStats } from "@/lib/stats";

// Static page, regenerated in the background at most every 30 minutes.
export const revalidate = 1800;

export default async function Home() {
  // Prefetch on the server so the HTML ships with live numbers. The client
  // reuses this cache via HydrationBoundary and only refetches when stale.
  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery({ ...leetcodeQuery, queryFn: getLeetCodeStats }),
    queryClient.prefetchQuery({ ...githubQuery, queryFn: getGitHubStats }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Hero />
      <Signals />
      <Experience />
      <Projects />
      <Stack />
      <About />
      <Algorithms />
      <Writing />
      <Contact />
    </HydrationBoundary>
  );
}
