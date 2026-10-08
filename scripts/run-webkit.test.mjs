import assert from "node:assert/strict";
import test from "node:test";
import { runWebKit } from "./run-webkit.mjs";

test("both shards run after a test failure, using production mode and separate evidence", () => {
  const calls = [];
  const status = runWebKit({
    env: { CI: "true" },
    spawn: (command, args, options) => {
      calls.push({ command, args, options });
      return { status: calls.length === 1 ? 1 : 0 };
    },
  });
  assert.equal(status, 1);
  assert.equal(calls.length, 2);
  for (const [index, call] of calls.entries()) {
    assert.equal(call.command, process.execPath);
    assert.ok(call.args.includes(`--shard=${index + 1}/2`));
    assert.ok(call.args.includes("--project=webkit"));
    assert.equal(call.options.env.PLAYWRIGHT_SHARD, String(index + 1));
    assert.equal(call.options.env.PLAYWRIGHT_USE_PRODUCTION_BUILD, "1");
    assert.equal(call.options.env.CI, "true");
  }
});
test("a selected CI shard forwards test filters and returns success", () => {
  let count = 0;
  assert.equal(
    runWebKit({
      args: ["--shard=2", "site-header.spec.ts"],
      spawn: (_, args) => {
        count++;
        assert.ok(args.includes("--shard=2/2"));
        assert.equal(args[2], "site-header.spec.ts");
        return { status: 0 };
      },
    }),
    0,
  );
  assert.equal(count, 1);
});
test("invalid shard and coverage overrides fail before launching", () => {
  for (const args of [
    ["--shard", "1/2"],
    ["--shard=3"],
    ["--shard=1", "--shard=2"],
    ["--project=chromium"],
    ["--output=shared"],
    ["--grep", "desktop"],
    ["--grep=desktop"],
    ["-g", "desktop"],
    ["-gdesktop"],
  ]) {
    assert.throws(() => runWebKit({ args, spawn: () => assert.fail("must not spawn") }));
  }
});
test("interruption and launch failure stop further shards and never pass", () => {
  let calls = 0;
  assert.equal(
    runWebKit({
      spawn: () => {
        calls++;
        return { signal: "SIGINT", status: null };
      },
    }),
    130,
  );
  assert.equal(calls, 1);
  assert.throws(() => runWebKit({ spawn: () => ({ error: new Error("cannot launch") }) }), /cannot launch/);
  assert.equal(runWebKit({ spawn: () => ({ status: null }) }), 1);
});
