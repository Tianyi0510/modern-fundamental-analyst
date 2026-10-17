import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  init: vi.fn(),
  captureException: vi.fn<(error: unknown, context?: unknown) => void>(),
}));
const scheduler = vi.hoisted(() => ({ gate: Promise.resolve(), release: () => {} }));
vi.mock("./sentry-client-sdk", () => mocks);
vi.mock("./yield-to-main", () => ({ yieldToMain: () => scheduler.gate }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubGlobal("window", new EventTarget());
  scheduler.gate = new Promise<void>((resolve) => {
    scheduler.release = resolve;
  });
});
afterEach(() => vi.unstubAllGlobals());
const options = { dsn: "https://public@sentry.invalid/1" };

it("buffers native errors, rejections and reported errors until one SDK initialization completes", async () => {
  const { startSentryClient, reportClientError, getSentryClient } = await import("./sentry-client");
  const ready = startSentryClient(options);
  const error = new Error("Original stack");
  const rejection = new Error("Rejected promise");
  window.dispatchEvent(Object.assign(new Event("error"), { error }));
  window.dispatchEvent(Object.assign(new Event("unhandledrejection"), { reason: rejection }));
  reportClientError(error, { tags: { feature: "performance-chart" } });
  expect(mocks.captureException).not.toHaveBeenCalled();
  expect(startSentryClient(options)).toBe(ready);
  scheduler.release();
  await ready;
  expect(mocks.init).toHaveBeenCalledExactlyOnceWith(options);
  expect(mocks.captureException.mock.calls.map(([captured]) => captured)).toEqual([error, rejection, error]);
  expect(mocks.captureException).toHaveBeenCalledWith(error, { tags: { feature: "performance-chart" } });
  expect(getSentryClient()).toBeDefined();
  const next = new Error("After startup");
  reportClientError(next);
  expect(mocks.captureException).toHaveBeenLastCalledWith(next, undefined);
  window.dispatchEvent(Object.assign(new Event("error"), { error: next }));
  expect(mocks.captureException).toHaveBeenCalledTimes(4);
});

it("bounds the transient startup buffer without storing errors on disk", async () => {
  const { startSentryClient, reportClientError } = await import("./sentry-client");
  const ready = startSentryClient(options);
  for (let index = 0; index < 30; index++) reportClientError(new Error(String(index)));
  scheduler.release();
  await ready;
  expect(mocks.captureException).toHaveBeenCalledTimes(25);
  expect(mocks.captureException.mock.calls[0]?.[0]).toEqual(expect.objectContaining({ message: "0" }));
  expect(mocks.captureException.mock.calls[24]?.[0]).toEqual(expect.objectContaining({ message: "24" }));
});

it("cleans up native listeners when SDK initialization fails", async () => {
  const { startSentryClient, reportClientError, getSentryClient } = await import("./sentry-client");
  mocks.init.mockImplementationOnce(() => {
    throw new Error("SDK unavailable");
  });
  const ready = startSentryClient(options);
  reportClientError(new Error("Buffered"));
  scheduler.release();
  await expect(ready).resolves.toBeUndefined();
  reportClientError(new Error("Later"));
  window.dispatchEvent(Object.assign(new Event("error"), { error: new Error("Native") }));
  expect(getSentryClient()).toBeUndefined();
  expect(mocks.captureException).not.toHaveBeenCalled();
});

it("does not initialize the browser SDK during server rendering", async () => {
  vi.unstubAllGlobals();
  const { startSentryClient, reportClientError } = await import("./sentry-client");
  reportClientError(new Error("No configured client"));
  await expect(startSentryClient(options)).resolves.toBeUndefined();
  expect(mocks.init).not.toHaveBeenCalled();
});
