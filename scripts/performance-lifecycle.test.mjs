import assert from "node:assert/strict";
import test from "node:test";
import { createPerformanceLifecycle } from "./performance-lifecycle.mjs";

test("cancellation stops owned resources once and blocks subsequent phases", async () => {
  const lifecycle = createPerformanceLifecycle();
  const stopped = [];
  lifecycle.own(() => stopped.push("server"));
  lifecycle.own(() => stopped.push("chrome"));
  await lifecycle.cancel("SIGINT");
  await lifecycle.cancel("SIGTERM");
  assert.deepEqual(stopped, ["server", "chrome"]);
  assert.throws(lifecycle.check, /interrupted \(SIGINT\)/);
});

test("resources acquired during cancellation are stopped and released resources are excluded", async () => {
  const lifecycle = createPerformanceLifecycle();
  let stops = 0;
  const release = lifecycle.own(() => stops++);
  release();
  await lifecycle.cancel("SIGTERM");
  lifecycle.own(() => stops++);
  await lifecycle.cleanup();
  assert.equal(stops, 1);
});

test("cleanup failures remain observable without preventing remaining resources from stopping", async () => {
  const lifecycle = createPerformanceLifecycle();
  let stopped = false;
  lifecycle.own(() => {
    throw new Error("cleanup failed");
  });
  lifecycle.own(() => {
    stopped = true;
  });
  await assert.rejects(lifecycle.cleanup(), /resource cleanup failed/);
  assert.equal(stopped, true);
  lifecycle.check();
});
