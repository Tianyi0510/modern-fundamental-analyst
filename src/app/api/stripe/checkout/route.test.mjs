import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

const mockModule = `export default class Stripe {
  static errors = { StripeError: Error };
  constructor(key, options) { globalThis.stripeInitialization = { key, options }; }
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
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;
const { POST } = await import("./route.ts");
const { resolveSupportStatus } = await import("@/features/support/server/stripe-checkout.ts");
let count = 0;
function request(
  body = "locale=en&product_id=support-12-v1&checkout_attempt=550e8400-e29b-41d4-a716-446655440000",
  overrides = {},
) {
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
  const invalid = await POST(request("locale=zh-cn&product_id=unknown"));
  assert.equal(invalid.status, 303);
  assert.ok(invalid.headers.get("location").endsWith("/zh-cn/support?status=invalid-amount"));
  assert.equal((await POST(request("x".repeat(5001)))).status, 413);
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
      body: "locale=zh-tw&product_id=invalid",
    }),
  );
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "http://127.0.0.1:3210/zh-tw/support?status=invalid-amount");
});
test("checkout provider failures return localized redirects without logging private messages", async (t) => {
  const logs = t.mock.method(console, "error", () => {});
  for (const create of [
    async () => {
      throw new Error("private-provider-message");
    },
    async () => ({}),
  ]) {
    globalThis.stripeCreate = create;
    const response = await POST(
      request("locale=zh-cn&product_id=support-12-v1&checkout_attempt=550e8400-e29b-41d4-a716-446655440000"),
    );
    assert.equal(response.status, 303);
    assert.equal(new URL(response.headers.get("location")).searchParams.get("status"), "error");
  }
  assert.ok(logs.mock.callCount() > 0);
  assert.doesNotMatch(
    JSON.stringify(logs.mock.calls.map(({ arguments: args }) => args)),
    /private-provider-message|rk_test_mock/,
  );
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
  const body = `locale=zh-tw&product_id=support-12-v1&checkout_attempt=${attempt}`;
  const recovery = new URL((await POST(request(body))).headers.get("location"));
  assert.equal(recovery.searchParams.get("status"), "error");
  assert.equal(recovery.searchParams.get("checkout_attempt"), attempt);
  assert.equal(recovery.searchParams.get("product_id"), "support-12-v1");
  assert.equal((await POST(request(body))).headers.get("location"), "https://checkout.stripe.com/same-session");
  assert.deepEqual(calls[0], calls[1]);
  assert.equal(calls[0].options.idempotencyKey, `support-checkout:v2:${attempt}`);
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

test("catalog checkouts own pricing for every product and language", async () => {
  const attempt = "69a3c170-1105-42f2-b492-15f74ef59a71";
  {
    for (const locale of ["en", "zh-tw", "zh-cn"])
      for (const amount of [6, 12, 18]) {
        globalThis.stripeCreate = async (params, options) => {
          assert.deepEqual(params.line_items, [
            {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: amount * 100,
                product_data: { name: "Support", tax_code: "txcd_10000000" },
              },
            },
          ]);
          assert.equal(params.mode, "payment");
          assert.equal(params.ui_mode, "hosted_page");
          assert.equal(params.locale, locale === "en" ? "en" : "zh");
          assert.equal(new URL(params.success_url).pathname, locale === "en" ? "/support" : `/${locale}/support`);
          assert.equal(params.metadata.support_product_id, `support-${amount}-v1`);
          assert.equal(params.metadata.support_amount_usd, String(amount));
          assert.equal(params.metadata.site_locale, locale);
          assert.deepEqual(params.automatic_tax, { enabled: true });
          assert.equal(options.idempotencyKey, `support-checkout:v2:${attempt}`);
          return { url: "https://checkout.stripe.com/catalog" };
        };
        // User-supplied amounts never become the price for a catalog product.
        const response = await POST(
          request(`locale=${locale}&product_id=support-${amount}-v1&amount=1&checkout_attempt=${attempt}`),
        );
        assert.equal(response.headers.get("location"), "https://checkout.stripe.com/catalog");
      }
  }
});

test("unknown and repeated products cannot fall back to legacy amount pricing", async () => {
  for (const body of [
    "product_id=unknown&amount=12",
    "product_id=support-6-v1&product_id=support-18-v1&amount=12",
    "product_id=&amount=12",
  ]) {
    const response = await POST(request(body));
    assert.equal(new URL(response.headers.get("location")).searchParams.get("status"), "invalid-amount");
  }
});

test("catalog retries freeze the product version and original language after an unknown outcome", async (context) => {
  context.mock.method(console, "error", () => {});
  const calls = [];
  const attempt = "550e8400-e29b-41d4-a716-446655440000";
  globalThis.stripeCreate = async (...args) => {
    calls.push(args);
    throw new Error("response lost");
  };
  for (const locale of ["en", "zh-tw", "zh-cn"]) {
    const response = await POST(
      request(`locale=${locale}&checkout_locale=zh-tw&product_id=support-6-v1&checkout_attempt=${attempt}`),
    );
    const query = new URL(response.headers.get("location")).searchParams;
    assert.equal(query.get("product_id"), "support-6-v1");
    assert.equal(query.get("checkout_locale"), "zh-tw");
    assert.equal(query.has("amount"), false);
  }
  assert.deepEqual(calls[0], calls[1]);
  assert.deepEqual(calls[1], calls[2]);
  assert.equal(calls[0][1].idempotencyKey, `support-checkout:v2:${attempt}`);
  globalThis.stripeCreate = async (...args) => {
    calls.push(args);
    return { url: "https://checkout.stripe.com/mock" };
  };
  await POST(request(`product_id=support-18-v1&checkout_attempt=${attempt}`));
  // A changed selection must hit the SAME key, allowing Stripe to reject changed parameters.
  assert.equal(calls[3][1].idempotencyKey, calls[0][1].idempotencyKey);
});

test("catalog sessions require matching version, subtotal and amount metadata for confirmation", async () => {
  const session = {
    mode: "payment",
    status: "complete",
    payment_status: "paid",
    currency: "usd",
    amount_subtotal: 1200,
    metadata: { purpose: "research_support", support_amount_usd: "12", support_product_id: "support-12-v1" },
  };
  for (const [patch, expected] of [
    [{}, "success"],
    [{ amount_subtotal: 600 }, "unverified"],
    [{ metadata: { ...session.metadata, support_product_id: "unknown" } }, "unverified"],
    [{ metadata: { ...session.metadata, support_amount_usd: "6" } }, "unverified"],
    [{ payment_status: "unpaid" }, "pending"],
  ]) {
    globalThis.stripeRetrieve = async () => ({ ...session, ...patch });
    assert.equal(await resolveSupportStatus({ status: "success", session_id: "cs_test_catalog" }), expected);
  }
});

test("catalog requests require one valid attempt identifier", async () => {
  for (const choice of [
    "",
    "&checkout_attempt=invalid",
    "&checkout_attempt=550e8400-e29b-41d4-a716-446655440000&checkout_attempt=69a3c170-1105-42f2-b492-15f74ef59a71",
  ]) {
    const response = await POST(request(`product_id=support-12-v1${choice}`));
    assert.equal(new URL(response.headers.get("location")).searchParams.get("status"), "error");
  }
});

test("retired amount-only attempts never create a new Session or suggest an idempotent retry", async () => {
  for (const locale of ["en", "zh-tw", "zh-cn"]) {
    const response = await POST(
      request(`locale=${locale}&amount=12&checkout_attempt=550e8400-e29b-41d4-a716-446655440000`),
    );
    const url = new URL(response.headers.get("location"));
    assert.equal(response.status, 303);
    assert.equal(url.searchParams.get("status"), "retired-checkout");
    assert.equal(url.searchParams.has("checkout_attempt"), false);
    assert.equal(await resolveSupportStatus({ status: "retired-checkout" }), "retired-checkout");
  }
});
