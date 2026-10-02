/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-recommended"],
  rules: {
    // Owned component selectors intentionally specialize their interaction states.
    "no-descending-specificity": null,
  },
  overrides: [
    {
      files: ["src/app/globals.css", "src/app/styles/tokens.css"],
      rules: { "at-rule-no-unknown": [true, { ignoreAtRules: ["theme", "custom-variant"] }] },
    },
  ],
};
