import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, context);
    }
    return nextResolve(specifier, context);
  },
});

export const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const styleModules = [
  "app/reset.css",
  "app/styles/base.css",
  "app/styles/chrome.css",
  "app/styles/pages.css",
  "app/styles/typography.css",
  "app/styles/component-typography.css",
  "app/styles/responsive.css",
  "app/styles/colors.css",
];

export const readStyles = async () => (await Promise.all(styleModules.map(read))).join("\n");
