/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-recommended"],
  rules: {
    // Page, theme and state layers intentionally override earlier selectors.
    "no-descending-specificity": null,
  },
};
