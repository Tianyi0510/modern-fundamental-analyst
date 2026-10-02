import type { HTMLAttributes } from "react";

export const containerAppearance =
  "shell mx-auto w-[min(1440px,calc(100%-var(--space-page-gutter)*2))] max-[801px]:w-[min(720px,calc(100%-var(--space-page-gutter)*2))]";

export function Container({
  as: Element = "div",
  className = "",
  ...props
}: HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "header" | "footer" | "article" }) {
  return <Element className={`${containerAppearance} ${className}`} {...props} />;
}
