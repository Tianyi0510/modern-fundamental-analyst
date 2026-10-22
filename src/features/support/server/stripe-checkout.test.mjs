import assert from "node:assert/strict";
import test from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createCheckoutAttempt } from "./checkout-attempt.ts";
import { createSupportCheckoutSession, resolveSupportStatus } from "./stripe-checkout.ts";
import { rejectUnhandledNetwork } from "../../../../scripts/unhandled-network.ts";

test("Stripe SDK sends the pinned API version and preserves Checkout retry and verification contracts", async (t) => {
  const previous = process.env.STRIPE_RESTRICTED_KEY;
  process.env.STRIPE_RESTRICTED_KEY = "sk_test_mock_only";
  t.after(() => {
    if (previous === undefined) delete process.env.STRIPE_RESTRICTED_KEY;
    else process.env.STRIPE_RESTRICTED_KEY = previous;
  });
  const writes = [];
  const reads = [];
  const unexpected = [];
  const server = setupServer(
    http.post("https://api.stripe.com/v1/checkout/sessions", async ({ request }) => {
      writes.push({ headers: request.headers, body: await request.text() });
      return HttpResponse.json({
        id: "cs_test_mock",
        object: "checkout.session",
        url: "https://checkout.stripe.com/mock",
      });
    }),
    http.get("https://api.stripe.com/v1/checkout/sessions/cs_test_mock", ({ request }) => {
      reads.push(request.headers);
      return HttpResponse.json({
        id: "cs_test_mock",
        object: "checkout.session",
        mode: "payment",
        status: "complete",
        payment_status: "paid",
        currency: "usd",
        amount_subtotal: 1200,
        metadata: { purpose: "research_support", support_product_id: "support-12-v1", support_amount_usd: "12" },
      });
    }),
  );
  server.listen({ onUnhandledFrame: rejectUnhandledNetwork((message) => unexpected.push(message)) });
  t.after(() => server.close());
  const attemptId = createCheckoutAttempt();
  const input = { locale: "en", origin: "https://example.com", productId: "support-12-v1", attemptId };
  await createSupportCheckoutSession(input);
  await createSupportCheckoutSession(input);
  assert.equal(writes.length, 2);
  assert.equal(writes[0].body, writes[1].body);
  for (const write of writes) {
    assert.equal(write.headers.get("stripe-version"), "2026-09-30.endive");
    assert.equal(write.headers.get("idempotency-key"), `support-checkout:v3:${attemptId}`);
    const body = new URLSearchParams(write.body);
    assert.equal(body.get("mode"), "payment");
    assert.equal(body.get("ui_mode"), "hosted_page");
    assert.equal(body.get("line_items[0][price_data][unit_amount]"), "1200");
    assert.equal(body.has("payment_method_types"), false);
  }
  assert.equal(await resolveSupportStatus({ status: "success", session_id: "cs_test_mock" }), "success");
  assert.equal(reads[0].get("stripe-version"), "2026-09-30.endive");
  assert.deepEqual(unexpected, []);
});
