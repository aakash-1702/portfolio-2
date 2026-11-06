import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] items-center pt-24">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10" />
      <div className="container-page">
        <p className="font-mono text-[13px] text-err">404 · route not found</p>
        <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-[1] tracking-[-0.05em]">
          This request hit a <span className="font-serif font-normal italic">dead-letter queue.</span>
        </h1>
        <p className="mt-5 max-w-md text-muted">The page you&apos;re looking for doesn&apos;t exist, or it moved in the redesign.</p>
        <div className="mt-8 flex gap-3 font-mono text-[12.5px]">
          <Link href="/" className="rounded-full bg-fg px-4 py-2 text-bg">retry → home</Link>
          <Link href="/blog" className="rounded-full border border-line-strong px-4 py-2 text-fg">read the blog</Link>
        </div>
      </div>
    </section>
  );
}
