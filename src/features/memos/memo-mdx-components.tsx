import type { ComponentProps } from "react";
import type { MDXComponents } from "mdx/types";
import { appearance } from "./memo-article-content.styles";

export const memoMdxComponents = {
  MemoSection: (props: ComponentProps<"section">) => <section className={appearance["memo-section"]} {...props} />,
  MemoSubsection: (props: ComponentProps<"section">) => (
    <section className={appearance["memo-subsection"]} {...props} />
  ),
  MemoReferences: (props: ComponentProps<"section">) => (
    <section className={appearance["memo-references"]} {...props} />
  ),
  a: ({ children, ...props }: ComponentProps<"a">) => (
    <a className="underline underline-offset-[3px] focus-visible:outline-2 focus-visible:outline-offset-4" {...props}>
      {children}
    </a>
  ),
} satisfies MDXComponents;
