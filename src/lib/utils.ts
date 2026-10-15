import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const mergeClasses = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "m3-display-large",
        "m3-display-medium",
        "m3-display-small",
        "m3-headline-large",
        "m3-headline-medium",
        "m3-headline-small",
        "m3-title-large",
        "m3-title-medium",
        "m3-title-small",
        "m3-body-large",
        "m3-body-medium",
        "m3-body-small",
        "m3-label-large",
        "m3-label-medium",
        "m3-label-small",
        "display",
        "headline",
        "title",
        "title-small",
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
