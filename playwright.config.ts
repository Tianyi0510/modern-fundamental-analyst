import { defineConfig } from "@playwright/test";

const useProductionBuild = process.env.PLAYWRIGHT_USE_PRODUCTION_BUILD === "1";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: "line",
  projects: [
    { name: "chromium", outputDir: "test-results/chromium", use: { browserName: "chromium" } },
    { name: "webkit", outputDir: "test-results/webkit", use: { browserName: "webkit" } },
  ],
  use: {
    baseURL: "http://127.0.0.1:3210",
    trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: useProductionBuild
      ? "npm run start -- --hostname 127.0.0.1 --port 3210"
      : "npm run dev -- --hostname 127.0.0.1 --port 3210",
    url: "http://127.0.0.1:3210",
    // Always start an isolated server: browser tests must not use local provider credentials.
    env: {
      SUBSCRIPTION_PREFERENCES_SECRET: "playwright-preferences-only",
      RATE_LIMIT_HASH_SECRET: "playwright-rate-limit-only",
      RESEND_API_KEY: "",
      RESEND_WEBHOOK_SECRET: "",
      CONTACT_TO_EMAIL: "",
      UPSTASH_REDIS_URL: "",
      STRIPE_RESTRICTED_KEY: "",
      STRIPE_SECRET_KEY: "",
      STRIPE_PRICE_USD_6: "",
      STRIPE_PRICE_USD_12: "",
      STRIPE_PRICE_USD_18: "",
    },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
