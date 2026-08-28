import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, context);
    }
    return nextResolve(specifier, context);
  },
});

const {
  cleanSingleLine,
  getRequestErrorDetails,
  isSameOrigin,
  isValidEmail,
  readLimitedJson,
  readLimitedText,
  readObjectJson,
  RequestBodyError,
} = await import("../lib/api-request.ts");

test("request helpers normalize text and validate forwarded origins", () => {
  assert.equal(cleanSingleLine("  Hello\n\tworld  ", 100), "Hello world");
  assert.equal(isSameOrigin(new Request("https://example.com/api", {
    headers: { origin: "https://example.com", host: "internal.vercel.app", "x-forwarded-host": "example.com" },
  })), true);
  assert.equal(isSameOrigin(new Request("https://example.com/api", {
    headers: { origin: "https://attacker.example", host: "example.com" },
  })), false);
});

test("email validation rejects malformed and oversized addresses", () => {
  assert.equal(isValidEmail("reader@example.com"), true);
  assert.equal(isValidEmail("reader@example"), false);
  assert.equal(isValidEmail(`reader@${"x".repeat(250)}.com`), false);
});

test("limited JSON reader checks streamed bytes without relying on Content-Length", async () => {
  const valid = new Request("https://example.com/api", {
    method: "POST",
    body: JSON.stringify({ email: "reader@example.com" }),
  });
  assert.deepEqual(await readLimitedJson(valid, 100), { email: "reader@example.com" });

  const oversized = new Request("https://example.com/api", {
    method: "POST",
    body: JSON.stringify({ message: "x".repeat(100) }),
  });
  await assert.rejects(
    readLimitedJson(oversized, 20),
    (error) => error instanceof RequestBodyError && error.status === 413,
  );
});

test("limited text reader preserves the raw request body for signature verification", async () => {
  const payload = '{"type":"email.bounced","data":{"to":["reader@example.com"]}}';
  const request = new Request("https://example.com/api", { method: "POST", body: payload });
  assert.equal(await readLimitedText(request, 100), payload);
});

test("object JSON reader rejects arrays and scalar payloads", async () => {
  for (const body of ["[]", '"value"', "null"]) {
    await assert.rejects(
      readObjectJson(new Request("https://example.com/api", { method: "POST", body }), 100),
      (error) => error instanceof RequestBodyError && error.status === 400,
    );
  }
});

test("request errors are normalized to stable API details", () => {
  assert.deepEqual(getRequestErrorDetails(new RequestBodyError("Request is too large.", 413)), {
    message: "Request is too large.",
    status: 413,
  });
  assert.deepEqual(getRequestErrorDetails(new TypeError("private details")), {
    message: "Invalid request.",
    status: 400,
  });
});
