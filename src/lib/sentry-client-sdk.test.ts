import { expect, it, vi } from "vitest";
import { createSentryOptions } from "./sentry-options";

const sdk = vi.hoisted(() => ({ init: vi.fn() }));
vi.mock("@sentry/nextjs", () => sdk);

it("applies the shared privacy and sampling options before browser-specific overrides", async () => {
  const { init } = await import("./sentry-client-sdk");
  const dsn = "https://public@sentry.invalid/1";
  for (const environment of ["production", "test"]) {
    const options = {
      dsn,
      environment,
      integrations: [],
      replaysSessionSampleRate: environment === "test" ? 1 : 0.1,
      replaysOnErrorSampleRate: 1,
    };
    init(options);
    expect(sdk.init).toHaveBeenLastCalledWith({ ...createSentryOptions(dsn, environment), ...options });
  }
});
