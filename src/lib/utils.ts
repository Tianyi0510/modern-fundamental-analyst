import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const mergeClasses = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display",
        "hero",
        "hero-copy",
        "editorial-title",
        "headline",
        "title",
        "title-small",
        "lead",
        "body-large",
        "body-large-strong",
        "body",
        "body-strong",
        "label",
        "control",
        "caption",
        "data-display",
        "data-kpi",
        "data-ring",
        "data-row",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return mergeClasses(clsx(inputs));
}
