import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    // Keep every URL from the previous version of the site working.
    return [
      { source: "/about", destination: "/#about", permanent: true },
      { source: "/contact", destination: "/#contact", permanent: true },
      { source: "/projects", destination: "/#projects", permanent: true },
      { source: "/projects/medbackend", destination: "https://github.com/aakash-1702/medBackend", permanent: false },
      { source: "/projects/bookstore-backend", destination: "https://github.com/aakash-1702/BOOKSTORE", permanent: false },
      { source: "/resume", destination: "/AkashResume.pdf", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:all*(woff2|svg|png|jpg|pdf)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

// Plugins are referenced by name so the config stays serializable for Turbopack.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: [["rehype-pretty-code", { theme: "github-dark-default", keepBackground: false }]],
  },
});

export default withMDX(nextConfig);
