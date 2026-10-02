import assert from "node:assert/strict";
import test from "node:test";
import { requireSuccessfulCI } from "./require-ci.mjs";

const sha = "a".repeat(40);
const env = { VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: sha };
const run = { id: 1, head_sha: sha, head_branch: "main", event: "push", status: "completed", conclusion: "success" };
test("production gate requires successful CI for the exact commit", async () => {
  let clock = 0,
    calls = 0;
  await requireSuccessfulCI({
    env,
    now: () => clock,
    sleep: async (ms) => {
      clock += ms;
    },
    fetcher: async () => {
      calls++;
      return Response.json({ workflow_runs: calls === 1 ? [{ ...run, head_sha: "b".repeat(40) }] : [run] });
    },
  });
  assert.equal(calls, 2);
});
test("production gate accepts CI that succeeds after a 20-minute job", async () => {
  let clock = 0;
  await requireSuccessfulCI({
    env,
    now: () => clock,
    sleep: async (ms) => {
      clock += ms;
    },
    fetcher: async () =>
      Response.json({
        workflow_runs: [clock < 21 * 60_000 ? { ...run, status: "in_progress", conclusion: null } : run],
      }),
  });
  assert.equal(clock, 21 * 60_000);
});
test("production gate fails closed on failed CI, missing SHA, API errors and timeout", async () => {
  await assert.rejects(requireSuccessfulCI({ env: { VERCEL_ENV: "production" } }), /exact Git commit/);
  await assert.rejects(
    requireSuccessfulCI({
      env,
      fetcher: async () => Response.json({ workflow_runs: [{ ...run, conclusion: "failure" }] }),
    }),
    /blocked/,
  );
  await assert.rejects(requireSuccessfulCI({ env, fetcher: async () => new Response(null, { status: 403 }) }), /403/);
  let clock = 0;
  await assert.rejects(
    requireSuccessfulCI({
      env,
      now: () => clock,
      sleep: async (ms) => {
        clock += ms;
      },
      fetcher: async () => Response.json({ workflow_runs: [] }),
    }),
    /30 minutes/,
  );
  assert.equal(clock, 30 * 60_000);
});
test("preview and local builds do not require production CI", async () => {
  await requireSuccessfulCI({ env: {}, fetcher: () => assert.fail("must not fetch") });
});

test("normal polling stays within thirty unauthenticated requests", async () => {
  let clock = 0,
    calls = 0;
  await assert.rejects(
    requireSuccessfulCI({
      env,
      now: () => clock,
      sleep: async (ms) => {
        clock += ms;
      },
      fetcher: async () => {
        calls++;
        return Response.json({ workflow_runs: [] });
      },
    }),
    /30 minutes/,
  );
  assert.equal(calls, 30);
});
test("transient failures back off and rate-limit headers delay the next request", async () => {
  let clock = 0,
    calls = 0;
  const times = [];
  await requireSuccessfulCI({
    env,
    now: () => clock,
    sleep: async (ms) => {
      clock += ms;
    },
    fetcher: async () => {
      times.push(clock);
      calls++;
      if (calls === 1) throw new TypeError("network unavailable");
      if (calls === 2) return new Response(null, { status: 503 });
      if (calls === 3)
        return new Response(null, {
          status: 403,
          headers: { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "900", "retry-after": "60" },
        });
      return Response.json({ workflow_runs: [run] });
    },
  });
  assert.deepEqual(times, [0, 60_000, 180_000, 900_000]);
});
test("a rate-limit reset beyond the deadline fails closed without another request", async () => {
  let clock = 0,
    calls = 0;
  await assert.rejects(
    requireSuccessfulCI({
      env,
      now: () => clock,
      sleep: async (ms) => {
        clock += ms;
      },
      fetcher: async () => {
        calls++;
        return new Response(null, { status: 429, headers: { "retry-after": "3600" } });
      },
    }),
    /30 minutes/,
  );
  assert.equal(calls, 1);
});

test("body read and JSON parsing failures share backoff, reset only after a complete valid response", async () => {
  let clock = 0;
  const times = [];
  const responses = [
    () => {
      throw new TypeError("network unavailable");
    },
    () => ({
      ok: true,
      json: async () => {
        throw new TypeError("body stream interrupted");
      },
    }),
    () => new Response('{"workflow_runs":['),
    () => Response.json({ workflow_runs: [] }),
    () => ({
      ok: true,
      json: async () => {
        throw new DOMException("body timeout", "TimeoutError");
      },
    }),
    () => Response.json({ workflow_runs: [run] }),
  ];
  await requireSuccessfulCI({
    env,
    now: () => clock,
    sleep: async (ms) => {
      clock += ms;
    },
    fetcher: async () => {
      times.push(clock);
      return responses.shift()();
    },
  });
  assert.deepEqual(times, [0, 60_000, 180_000, 420_000, 480_000, 540_000]);
});

test("unreadable or malformed CI evidence cannot authorize deployment", async () => {
  for (const response of [
    () => ({
      ok: true,
      json: async () => {
        throw new TypeError("body interrupted");
      },
    }),
    () => new Response("not JSON"),
    () => Response.json(null),
    () => Response.json({ workflow_runs: {} }),
    () => Response.json({ workflow_runs: [null] }),
    () => Response.json({ workflow_runs: [{ ...run, id: "invalid" }] }),
  ]) {
    let clock = 0;
    const delays = [];
    await assert.rejects(
      requireSuccessfulCI({
        env,
        now: () => clock,
        sleep: async (ms) => {
          delays.push(ms);
          clock += ms;
        },
        fetcher: async () => response(),
      }),
      /30 minutes/,
    );
    assert.deepEqual(delays.slice(0, 4), [60_000, 120_000, 240_000, 240_000]);
    assert.equal(clock, 30 * 60_000);
  }
});
