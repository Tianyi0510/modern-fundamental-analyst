import { defineConfig } from "@playwright/test";

const useProductionBuild = process.env.PLAYWRIGHT_USE_PRODUCTION_BUILD === "1";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:3210",
    browserName: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: useProductionBuild
      ? "npm run start -- --hostname 127.0.0.1 --port 3210"
      : "npm run dev -- --hostname 127.0.0.1 --port 3210",
    url: "http://127.0.0.1:3210",
    // Always start an isolated server: browser tests must not use local provider credentials.
    env: { SUBSCRIPTION_PREFERENCES_SECRET: "playwright-preferences-only", RESEND_API_KEY: "", UPSTASH_REDIS_URL: "" },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
