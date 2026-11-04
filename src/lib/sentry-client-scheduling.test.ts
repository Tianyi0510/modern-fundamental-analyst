import { afterEach, beforeEach, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({ init: vi.fn(), captureException: vi.fn() }));
vi.mock("./sentry-client-sdk", () => sdk);

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.stubGlobal("window", new EventTarget());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("buffers a synchronous native error during the first scheduler call", async () => {
  const error = new Error("Synchronous scheduling error");
  let firstYield = true;
  vi.stubGlobal("scheduler", {
    yield: () => {
      if (firstYield) {
        firstYield = false;
        window.dispatchEvent(Object.assign(new Event("error"), { error }));
      }
      return Promise.reject(new Error("Scheduling unavailable"));
    },
  });
  const { startSentryClient } = await import("./sentry-client");
  const options = { dsn: "https://public@sentry.invalid/1", environment: "test" };
  const ready = startSentryClient(options);
  expect(startSentryClient(options)).toBe(ready);
  await vi.runAllTimersAsync();
  await ready;
  expect(sdk.init).toHaveBeenCalledExactlyOnceWith(options);
  expect(sdk.captureException).toHaveBeenCalledExactlyOnceWith(error, {
    mechanism: { handled: false, type: "auto.browser.global_handlers.onerror" },
  });
});

it.each(["missing", "rejected", "throwing"])(
  "retains buffered errors when the optional scheduler is %s",
  async (mode) => {
    const unavailable = () => {
      if (mode === "throwing") throw new Error("Scheduling unavailable");
      return Promise.reject(new Error("Scheduling unavailable"));
    };
    vi.stubGlobal("scheduler", mode === "missing" ? undefined : { yield: unavailable });
    const { startSentryClient, getSentryClient } = await import("./sentry-client");
    const options = { dsn: "https://public@sentry.invalid/1", environment: "test" };
    const ready = startSentryClient(options);
    const error = new Error("Buffered during scheduling fallback");
    window.dispatchEvent(Object.assign(new Event("error"), { error }));
    expect(sdk.init).not.toHaveBeenCalled();
    await vi.runAllTimersAsync();
    await ready;
    expect(sdk.init).toHaveBeenCalledExactlyOnceWith(options);
    expect(getSentryClient()).toBeDefined();
    expect(sdk.captureException).toHaveBeenCalledExactlyOnceWith(error, {
      mechanism: { handled: false, type: "auto.browser.global_handlers.onerror" },
    });
  },
);
