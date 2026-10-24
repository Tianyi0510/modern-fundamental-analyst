import css from "@eslint/css";
import { tailwind4 } from "tailwind-csstree";

export default [
  {
    files: ["src/**/*.css"],
    plugins: { css },
    language: "css/css",
    languageOptions: { customSyntax: tailwind4 },
    linterOptions: { reportUnusedDisableDirectives: "error" },
    rules: { "css/use-baseline": ["error", { available: "widely" }] },
  },
];
