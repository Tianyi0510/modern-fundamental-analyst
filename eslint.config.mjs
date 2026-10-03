import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import prettier from "eslint-config-prettier";
import globals from "globals";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import path from "node:path";

const sourceRoot = path.join(import.meta.dirname, "src");
const architecture = {
  rules: {
    "dynamic-import-boundaries": {
      meta: {
        type: "problem",
        schema: [],
        messages: {
          literal: "Use a literal dynamic-import path so module boundaries can be checked.",
          boundary: "Compose features in app; shared modules and peer features cannot depend on this module.",
        },
      },
      create(context) {
        return {
          ImportExpression(node) {
            const source = node.source;
            const specifier =
              source.type === "Literal" && typeof source.value === "string"
                ? source.value
                : source.type === "TemplateLiteral" && source.expressions.length === 0
                  ? source.quasis[0].value.cooked
                  : null;
            if (specifier === null) {
              context.report({ node, messageId: "literal" });
              return;
            }
            if (!specifier.startsWith("@/") && !specifier.startsWith(".")) return;
            const target = specifier.startsWith("@/")
              ? path.resolve(sourceRoot, specifier.slice(2))
              : path.resolve(path.dirname(context.filename), specifier);
            const from = path.relative(sourceRoot, context.filename).split(path.sep);
            const to = path.relative(sourceRoot, target).split(path.sep);
            if (to[0] === "app" || (to[0] === "features" && (from[0] !== "features" || from[1] !== to[1]))) {
              context.report({ node, messageId: "boundary" });
            }
          },
        };
      },
    },
  },
};

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
    files: ["src/{components,lib,features}/**/*.{ts,tsx}"],
    plugins: { architecture },
    rules: { "architecture/dynamic-import-boundaries": "error" },
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
