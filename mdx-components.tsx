import type { MDXComponents } from "mdx/types";
import Link from "next/link";

const components: MDXComponents = {
  a: ({ href = "", children, ...rest }) =>
    href.startsWith("/") ? (
      <Link href={href} {...rest}>{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noreferrer" {...rest}>{children}</a>
    ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
