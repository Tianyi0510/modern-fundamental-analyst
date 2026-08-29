import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import globals from "globals";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: [".next/**", ".vercel/**", "node_modules/**", "audit-layout/**", "design-reference/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
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
);
