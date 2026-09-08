import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

const mockModule = `export default class Stripe {
  static errors = { StripeError: Error };
  checkout = { sessions: { create: (...args) => globalThis.stripeCreate(...args), retrieve: (...args) => globalThis.stripeRetrieve(...args) } };
}`;
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === "stripe") return { url: `data:text/javascript,${encodeURIComponent(mockModule)}`, shortCircuit: true };
  return nextResolve(specifier, context);
} });
process.env.STRIPE_RESTRICTED_KEY = "rk_test_mock";
process.env.STRIPE_PRICE_USD_12 = "price_mock_12";
delete process.env.UPSTASH_REDIS_URL;
const { POST } = await import("../app/api/stripe/checkout/route.ts");
const { resolveSupportStatus } = await import("../lib/stripe-checkout.ts");
let count = 0;
function request(body = "locale=en&amount=12", overrides = {}) {
  return new Request("https://www.modernfundamentalanalyst.com/api/stripe/checkout", { method: "POST", headers: {
    host: "www.modernfundamentalanalyst.com", origin: "https://www.modernfundamentalanalyst.com",
    "content-type": "application/x-www-form-urlencoded", "x-forwarded-for": `192.0.2.${++count}`, ...overrides,
  }, body });
}
test.beforeEach(() => {
  globalThis.stripeCreate = () => assert.fail("unexpected provider write");
  globalThis.stripeRetrieve = () => assert.fail("unexpected provider read");
});
test("checkout rejects invalid origin, format, amount and oversized bodies before Stripe", async () => {
  assert.equal((await POST(request(undefined, { origin: "https://other.example" }))).status, 403);
  assert.equal((await POST(request("{}", { "content-type": "application/json" }))).status, 415);
  assert.equal((await POST(request("amount=13"))).status, 400);
  assert.equal((await POST(request("x".repeat(5001)))).status, 413);
});
test("checkout creates the configured session and returns a 303 redirect", async () => {
  globalThis.stripeCreate = async options => {
    assert.deepEqual(options.line_items, [{ price: "price_mock_12", quantity: 1 }]);
    assert.equal(options.metadata.site_locale, "zh-tw");
    assert.ok(options.success_url.includes("/zh-tw/support?"));
    return { url: "https://checkout.stripe.com/mock" };
  };
  const response = await POST(request("locale=zh-tw&amount=12"));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "https://checkout.stripe.com/mock");
});
test("checkout provider timeout and missing URL return localized error redirects", async t => {
  t.mock.method(console, "error", () => {});
  for (const create of [async () => { throw new Error("timeout"); }, async () => ({})]) {
    globalThis.stripeCreate = create;
    const response = await POST(request("locale=zh-cn&amount=12"));
    assert.equal(response.status, 303);
    assert.ok(response.headers.get("location").endsWith("/zh-cn/support?status=error"));
  }
});
test("checkout rate limits repeated requests before provider calls", async () => {
  for (let i = 0; i < 8; i++) assert.equal((await POST(request("amount=invalid", { "x-forwarded-for": "198.51.100.1" }))).status, 400);
  const response = await POST(request("amount=12", { "x-forwarded-for": "198.51.100.1" }));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "600");
});
test("success URL alone never confirms payment", async () => {
  assert.equal(await resolveSupportStatus({ status: "success" }), "unverified");
  assert.equal(await resolveSupportStatus({ status: "success", session_id: "../fake" }), "unverified");
});
test("only a paid completed research-support session is confirmed", async t => {
  t.mock.method(console, "error", () => {});
  const session = { mode: "payment", status: "complete", payment_status: "paid", currency: "usd", metadata: { purpose: "research_support", support_amount_usd: "12" } };
  for (const [patch, expected] of [[{}, "success"], [{ payment_status: "unpaid" }, "pending"], [{ status: "open" }, "unverified"], [{ metadata: {} }, "unverified"]]) {
    globalThis.stripeRetrieve = async (id, _params, options) => {
      assert.equal(id, "cs_test_mock");
      assert.equal(options.maxNetworkRetries, 0);
      return { ...session, ...patch };
    };
    assert.equal(await resolveSupportStatus({ status: "success", session_id: "cs_test_mock" }), expected);
  }
  globalThis.stripeRetrieve = async () => { throw new Error("timeout"); };
  assert.equal(await resolveSupportStatus({ status: "success", session_id: "cs_test_mock" }), "unverified");
});
