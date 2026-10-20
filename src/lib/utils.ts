import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const mergeClasses = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "large-display",
        "medium-display",
        "small-display",
        "large-headline",
        "medium-headline",
        "small-headline",
        "large-title",
        "medium-title",
        "large-label",
        "medium-label",
        "large-body",
        "medium-body",
        "small-body",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return mergeClasses(clsx(inputs));
}
