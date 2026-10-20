import type { HTMLAttributes } from "react";

export const containerAppearance =
  "shell mx-auto w-[min(var(--width-content),calc(100%-var(--space-page-gutter)*2))] max-[801px]:w-[min(var(--width-content-compact),calc(100%-var(--space-page-gutter)*2))]";

export function Container({
  as: Element = "div",
  className = "",
  ...props
}: HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "header" | "footer" | "article" }) {
  return <Element className={`${containerAppearance} ${className}`} {...props} />;
}
