import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

const mockModule = `export default class Stripe {
  static errors = { StripeError: Error };
  checkout = { sessions: { create: (...args) => globalThis.stripeCreate(...args), retrieve: (...args) => globalThis.stripeRetrieve(...args) } };
}`;
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "stripe")
      return { url: `data:text/javascript,${encodeURIComponent(mockModule)}`, shortCircuit: true };
    return nextResolve(specifier, context);
  },
});
process.env.STRIPE_RESTRICTED_KEY = "rk_test_mock";
process.env.STRIPE_PRICE_USD_12 = "price_mock_12";
delete process.env.UPSTASH_REDIS_URL;
const { POST } = await import("../src/app/api/stripe/checkout/route.ts");
const { resolveSupportStatus } = await import("../src/features/support/server/stripe-checkout.ts");
let count = 0;
function request(body = "locale=en&amount=12", overrides = {}) {
  return new Request("https://www.modernfundamentalanalyst.com/api/stripe/checkout", {
    method: "POST",
    headers: {
      host: "www.modernfundamentalanalyst.com",
      origin: "https://www.modernfundamentalanalyst.com",
      "content-type": "application/x-www-form-urlencoded",
      "x-forwarded-for": `192.0.2.${++count}`,
      ...overrides,
    },
    body,
  });
}
test.beforeEach(() => {
  globalThis.stripeCreate = () => assert.fail("unexpected provider write");
  globalThis.stripeRetrieve = () => assert.fail("unexpected provider read");
});
test("checkout rejects invalid origin, format, amount and oversized bodies before Stripe", async () => {
  assert.equal((await POST(request(undefined, { origin: "https://other.example" }))).status, 403);
  assert.equal((await POST(request("{}", { "content-type": "application/json" }))).status, 415);
  const invalid = await POST(request("locale=zh-cn&amount=13"));
  assert.equal(invalid.status, 303);
  assert.ok(invalid.headers.get("location").endsWith("/zh-cn/support?status=invalid-amount"));
  assert.equal((await POST(request("x".repeat(5001)))).status, 413);
});
test("checkout creates the configured session and returns a 303 redirect", async () => {
  globalThis.stripeCreate = async (options) => {
    assert.deepEqual(options.line_items, [{ price: "price_mock_12", quantity: 1 }]);
    assert.equal(options.metadata.site_locale, "zh-tw");
    assert.ok(options.success_url.includes("/zh-tw/support?"));
    return { url: "https://checkout.stripe.com/mock" };
  };
  const response = await POST(request("locale=zh-tw&amount=12"));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "https://checkout.stripe.com/mock");
});
test("checkout error redirects retain the validated browser origin when the internal host differs", async () => {
  const response = await POST(
    new Request("http://localhost:3210/api/stripe/checkout", {
      method: "POST",
      headers: {
        host: "127.0.0.1:3210",
        origin: "http://127.0.0.1:3210",
        "content-type": "application/x-www-form-urlencoded",
        "x-forwarded-for": "192.0.2.200",
      },
      body: "locale=zh-tw&amount=invalid",
    }),
  );
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "http://127.0.0.1:3210/zh-tw/support?status=invalid-amount");
});
test("checkout provider timeout and missing URL return localized error redirects", async (t) => {
  t.mock.method(console, "error", () => {});
  for (const create of [
    async () => {
      throw new Error("timeout");
    },
    async () => ({}),
  ]) {
    globalThis.stripeCreate = create;
    const response = await POST(request("locale=zh-cn&amount=12"));
    assert.equal(response.status, 303);
    assert.ok(response.headers.get("location").endsWith("/zh-cn/support?status=error"));
  }
});
test("checkout retries an uncertain provider result with the same idempotency key and parameters", async (t) => {
  t.mock.method(console, "error", () => {});
  const calls = [];
  globalThis.stripeCreate = async (params, options) => {
    calls.push({ params, options });
    if (calls.length === 1) throw new Error("response lost after session creation");
    return { url: "https://checkout.stripe.com/same-session" };
  };
  const attempt = "69a3c170-1105-42f2-b492-15f74ef59a71";
  const body = `locale=zh-tw&amount=12&checkout_attempt=${attempt}`;
  const recovery = new URL((await POST(request(body))).headers.get("location"));
  assert.equal(recovery.searchParams.get("status"), "error");
  assert.equal(recovery.searchParams.get("checkout_attempt"), attempt);
  assert.equal(recovery.searchParams.get("amount"), "12");
  assert.equal((await POST(request(body))).headers.get("location"), "https://checkout.stripe.com/same-session");
  assert.deepEqual(calls[0], calls[1]);
  assert.equal(calls[0].options.idempotencyKey, `support-checkout:${attempt}`);
  assert.equal((await POST(request("amount=12&checkout_attempt=invalid"))).status, 303);
  assert.equal(calls.length, 2);
});
test("checkout rate limits repeated native forms with localized retry redirects before provider calls", async () => {
  for (const [locale, prefix, address] of [
    ["en", "", "198.51.100.1"],
    ["zh-tw", "/zh-tw", "198.51.100.2"],
    ["zh-cn", "/zh-cn", "198.51.100.3"],
  ]) {
    for (let i = 0; i < 8; i++)
      assert.equal(
        (await POST(request(`locale=${locale}&amount=invalid`, { "x-forwarded-for": address }))).status,
        303,
      );
    const response = await POST(request(`locale=${locale}&amount=12`, { "x-forwarded-for": address }));
    assert.equal(response.status, 303);
    assert.ok(response.headers.get("location").endsWith(`${prefix}/support?status=rate-limited`));
    assert.equal(response.headers.get("retry-after"), "600");
    assert.equal(await resolveSupportStatus({ status: "rate-limited" }), "rate-limited");
    assert.equal(await resolveSupportStatus({ status: "invalid-amount" }), "invalid-amount");
  }
});
test("success URL alone never confirms payment", async () => {
  assert.equal(await resolveSupportStatus({ status: "success" }), "unverified");
  assert.equal(await resolveSupportStatus({ status: "success", session_id: "../fake" }), "unverified");
});
test("only a paid completed research-support session is confirmed", async (t) => {
  t.mock.method(console, "error", () => {});
  const session = {
    mode: "payment",
    status: "complete",
    payment_status: "paid",
    currency: "usd",
    metadata: { purpose: "research_support", support_amount_usd: "12" },
  };
  for (const [patch, expected] of [
    [{}, "success"],
    [{ payment_status: "unpaid" }, "pending"],
    [{ status: "open" }, "unverified"],
    [{ metadata: {} }, "unverified"],
  ]) {
    globalThis.stripeRetrieve = async (id, _params, options) => {
      assert.equal(id, "cs_test_mock");
      assert.equal(options.maxNetworkRetries, 0);
      return { ...session, ...patch };
    };
    assert.equal(await resolveSupportStatus({ status: "success", session_id: "cs_test_mock" }), expected);
  }
  globalThis.stripeRetrieve = async () => {
    throw new Error("timeout");
  };
  assert.equal(await resolveSupportStatus({ status: "success", session_id: "cs_test_mock" }), "unverified");
});

test("language switching preserves the original Stripe parameters and rejects duplicate amounts", async (t) => {
  t.mock.method(console, "error", () => {});
  const calls = [];
  globalThis.stripeCreate = async (...args) => {
    calls.push(args);
    throw new Error("uncertain result");
  };
  const attempt = "550e8400-e29b-41d4-a716-446655440000";
  for (const locale of ["en", "zh-tw", "zh-cn"]) {
    const response = await POST(request(`locale=${locale}&checkout_locale=en&checkout_attempt=${attempt}&amount=12`));
    const recovery = new URL(response.headers.get("location"));
    assert.equal(recovery.searchParams.get("checkout_locale"), "en");
    assert.equal(recovery.pathname, locale === "en" ? "/support" : `/${locale}/support`);
  }
  assert.deepEqual(calls[0], calls[1]);
  assert.deepEqual(calls[1], calls[2]);
  await POST(request("amount=6&amount=18"));
  assert.equal(calls.length, 3);
});
