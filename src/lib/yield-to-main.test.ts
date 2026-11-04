import { afterEach, expect, it, vi } from "vitest";
import { yieldToMain } from "./yield-to-main";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("uses the browser scheduler when available", async () => {
  const resume = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  const scheduler = { yield: resume };
  vi.stubGlobal("scheduler", scheduler);
  await yieldToMain();
  expect(resume).toHaveBeenCalledOnce();
  expect(resume.mock.contexts).toEqual([scheduler]);
});

it.each(["rejected", "throwing"])("resumes in a new task when scheduler.yield is %s", async (mode) => {
  vi.stubGlobal("scheduler", {
    yield: () => {
      if (mode === "throwing") throw new Error("Scheduling unavailable");
      return Promise.reject(new Error("Scheduling unavailable"));
    },
  });
  vi.useFakeTimers();
  const resumed = vi.fn();
  const work = yieldToMain().then(resumed);
  await Promise.resolve();
  expect(resumed).not.toHaveBeenCalled();
  await vi.runAllTimersAsync();
  await work;
  expect(resumed).toHaveBeenCalledOnce();
});

it.each([undefined, {}])("falls back to a new task when scheduler.yield is unavailable: %j", async (scheduler) => {
  vi.stubGlobal("scheduler", scheduler);
  vi.useFakeTimers();
  const resumed = vi.fn();
  const work = yieldToMain().then(resumed);
  await Promise.resolve();
  expect(resumed).not.toHaveBeenCalled();
  await vi.runAllTimersAsync();
  await work;
  expect(resumed).toHaveBeenCalledOnce();
});
