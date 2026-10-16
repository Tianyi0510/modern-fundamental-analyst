import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const mergeClasses = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display",
        "headline",
        "title",
        "title-small",
        "wordmark",
        "lead",
        "body-large",
        "body",
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
