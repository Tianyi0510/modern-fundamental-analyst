import assert from "node:assert/strict";
import test from "node:test";

const { postJson, PostJsonError } = await import("./client-post-json.ts");

test("client JSON requests share bounded POST behavior", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async (input, init) => {
    assert.equal(input, "/api/example");
    assert.equal(init?.method, "POST");
    assert.deepEqual(init?.headers, { "Content-Type": "application/json", "Idempotency-Key": "request-id" });
    assert.equal(init?.body, JSON.stringify({ value: 1 }));
    assert.equal(init?.signal instanceof AbortSignal, true);
    return new Response(null, { status: 204 });
  };

  const response = await postJson("/api/example", { value: 1 }, { idempotencyKey: "request-id" });
  assert.equal(response.status, 204);
});

test("client JSON requests reject non-success responses", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () => new Response(null, { status: 503 });

  await assert.rejects(postJson("/api/example", {}), /status 503/);
});

test("Retry-After accepts delay seconds or an HTTP date only for rate limits", (context) => {
  context.mock.method(Date, "now", () => Date.UTC(2026, 10, 25));
  assert.equal(new PostJsonError(429, "Wed, 25 Nov 2026 00:10:00 GMT").retryAfterSeconds, 600);
  assert.equal(new PostJsonError(429, "0").retryAfterSeconds, 0);
  for (const value of [null, "-1", "unknown", "9007199254740992"]) {
    assert.equal(new PostJsonError(429, value).retryAfterSeconds, undefined);
  }
  assert.equal(new PostJsonError(503, "600").retryAfterSeconds, undefined);
});
