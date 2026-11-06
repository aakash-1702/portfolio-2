import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleShell } from "@/components/article-shell";
import { posts, site } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date, authors: [site.name] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = posts.findIndex((p) => p.slug === slug);
  const post = posts[index];
  if (!post) notFound();
  const { default: Content } = await import(`@/content/blog/${slug}.mdx`);
  const next = posts[(index + 1) % posts.length]!;

  return (
    <ArticleShell
      back={{ href: "/blog", label: "All writing" }}
      meta={
        <>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>·</span>
          <span>{post.readingTime} min read</span>
          <span className="rounded-full border border-line px-2 py-0.5 text-[11px]">{post.tag}</span>
        </>
      }
      title={post.title}
      description={post.description}
      next={{ href: `/blog/${next.slug}`, label: "Read next", title: next.title }}
    >
      <Content />
    </ArticleShell>
  );
}
