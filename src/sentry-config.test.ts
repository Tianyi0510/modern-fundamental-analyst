import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({ init: vi.fn() }));
vi.mock("@sentry/nextjs", () => sdk);

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("SENTRY_DSN", "");
  vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");
  vi.stubEnv("SENTRY_DISABLED", "");
  vi.stubEnv("VERCEL_ENV", "production");
});
afterEach(() => vi.unstubAllEnvs());

describe.each([
  ["Node", () => import("./sentry.server.config")],
  ["Edge", () => import("./sentry.edge.config")],
] as const)("%s Sentry configuration", (_runtime, load) => {
  it("does not initialize without a configured DSN", async () => {
    await load();
    expect(sdk.init).not.toHaveBeenCalled();
  });

  it("honors the runtime opt-out even with a public DSN baked into the build", async () => {
    vi.stubEnv("SENTRY_DSN", "https://server@sentry.invalid/2");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://public@sentry.invalid/1");
    vi.stubEnv("SENTRY_DISABLED", "1");
    await load();
    expect(sdk.init).not.toHaveBeenCalled();
  });

  it.each([
    [" https://server@sentry.invalid/2 ", "https://server@sentry.invalid/2"],
    ["  ", "https://public@sentry.invalid/1"],
  ])("resolves DSN precedence and retains production privacy controls (%s)", async (serverDsn, expected) => {
    vi.stubEnv("SENTRY_DSN", serverDsn);
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://public@sentry.invalid/1");
    await load();
    expect(sdk.init).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        dsn: expected,
        environment: "production",
        sampleRate: 1,
        tracesSampleRate: 0.1,
        beforeSend: expect.any(Function) as unknown,
        beforeSendSpan: expect.any(Function) as unknown,
        dataCollection: expect.objectContaining({ userInfo: false, urlQueryParams: false, httpBodies: [] }) as unknown,
      }),
    );
  });
});
