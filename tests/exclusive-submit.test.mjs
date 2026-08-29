import assert from "node:assert/strict";
import test from "node:test";

import { createExclusiveRunner } from "../components/use-exclusive-submit.ts";

test("exclusive form runner suppresses overlapping submissions and resets afterward", async () => {
  let release;
  let calls = 0;
  const runExclusive = createExclusiveRunner();
  const first = runExclusive(async () => {
    calls += 1;
    await new Promise((resolve) => { release = resolve; });
  });

  assert.equal(await runExclusive(async () => { calls += 1; }), false);
  assert.equal(calls, 1);
  release();
  assert.equal(await first, true);
  assert.equal(await runExclusive(async () => { calls += 1; }), true);
  assert.equal(calls, 2);
});
