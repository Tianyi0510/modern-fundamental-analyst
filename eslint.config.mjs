import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import prettier from "eslint-config-prettier";
import globals from "globals";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      ".vercel/**",
      "node_modules/**",
      "audit/**",
      "**/dist/**",
      "coverage/**",
      "playwright-report/**",
    ],
  },
  {
    linterOptions: { reportUnusedDisableDirectives: "error" },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: {
      "@next/next": nextPlugin,
      "jsx-a11y": jsxA11y,
      "react-hooks": reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...jsxA11y.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["src/{components,lib}/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/**", "@/features/**", "**/app/**", "**/features/**"],
              message: "Shared modules cannot depend on application or feature modules.",
            },
          ],
        },
      ],
    },
  },
  ...["portfolio", "memos", "subscriptions", "contact", "support"].map((feature) => ({
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app/**",
                "**/app/**",
                ...["portfolio", "memos", "subscriptions", "contact", "support"]
                  .filter((name) => name !== feature)
                  .flatMap((name) => [`@/features/${name}/**`, `**/${name}/**`]),
              ],
              message: "Compose features in app; inject cross-feature data through explicit inputs.",
            },
          ],
        },
      ],
    },
  })),
  prettier,
);
