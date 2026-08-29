import assert from "node:assert/strict";
import test from "node:test";

const { postJson } = await import("../lib/client-post-json.ts");

test("client JSON requests share bounded POST behavior", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });

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
  context.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => new Response(null, { status: 503 });

  await assert.rejects(postJson("/api/example", {}), /status 503/);
});
