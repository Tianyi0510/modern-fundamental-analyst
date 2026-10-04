import { defineConfig } from "@playwright/test";

const shardSuffix = process.env.PLAYWRIGHT_SHARD ? `-shard-${process.env.PLAYWRIGHT_SHARD}` : "";

const useProductionBuild = process.env.PLAYWRIGHT_USE_PRODUCTION_BUILD === "1";

export default defineConfig({
  testDir: "./src",
  testMatch: "**/*.spec.ts",
  outputDir: "node_modules/.cache/playwright",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: "line",
  projects: [
    { name: "chromium", outputDir: "node_modules/.cache/playwright/chromium", use: { browserName: "chromium" } },
    {
      name: "webkit",
      outputDir: `node_modules/.cache/playwright/webkit${shardSuffix}`,
      use: { browserName: "webkit" },
    },
  ],
  use: {
    baseURL: "http://127.0.0.1:3210",
    trace: process.env.CI ? "retain-on-failure-and-retries" : "retain-on-failure",
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
      RESEND_API_KEY: "",
      RESEND_WEBHOOK_SECRET: "",
      UPSTASH_KV_REST_API_URL: "",
      UPSTASH_KV_REST_API_TOKEN: "",
      STRIPE_RESTRICTED_KEY: "",
      STRIPE_SECRET_KEY: "",
      // A fake DSN can be supplied explicitly for intercepted monitoring tests.
      NEXT_PUBLIC_SENTRY_DSN: process.env.PLAYWRIGHT_SENTRY_TEST === "1" ? "https://public@sentry.invalid/1" : "",
      SENTRY_DSN: "",
      SENTRY_AUTH_TOKEN: "",
    },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
