import type { MetadataRoute } from "next";
import { caseStudies, posts, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/blog`, changeFrequency: "monthly", priority: 0.7 },
    ...caseStudies.map((c) => ({ url: `${site.url}/projects/${c.slug}`, priority: 0.8 })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date, priority: 0.6 })),
  ];
}
