import assert from "node:assert/strict";
import test from "node:test";

import { read } from "../../../scripts/repository-helpers.mjs";

const { parseSupportAmount } = await import("./support-config.ts");

test("Stripe support amount parsing accepts only canonical configured values", () => {
  assert.equal(parseSupportAmount("6"), 6);
  assert.equal(parseSupportAmount("12"), 12);
  assert.equal(parseSupportAmount("18"), 18);
  assert.equal(parseSupportAmount("06"), null);
  assert.equal(parseSupportAmount("6.0"), null);
  assert.equal(parseSupportAmount("6e0"), null);
  assert.equal(parseSupportAmount(null), null);
});

test("Stripe integration declares its server boundary and uncommitted credential configuration", async () => {
  const [stripe, route, environment] = await Promise.all([
    read("src/features/support/server/stripe-checkout.ts"),
    read("src/app/api/stripe/checkout/route.ts"),
    read(".env.example"),
  ]);
  assert.match(stripe, /import "server-only"/);
  assert.match(environment, /^STRIPE_RESTRICTED_KEY=$/m);
  assert.match(environment, /^STRIPE_SECRET_KEY=$/m);
  assert.doesNotMatch(`${stripe}\n${route}`, /[sr]k_(?:test|live)_[A-Za-z0-9]+/);
});

test("sitemap includes Support in every locale with language alternates", async () => {
  const { default: sitemap } = await import("../../app/sitemap.ts");
  const entries = sitemap();
  const urls = ["/support", "/zh-tw/support", "/zh-cn/support"].map(
    (path) => `https://www.modernfundamentalanalyst.com${path}`,
  );
  for (const url of urls) {
    const matches = entries.filter((entry) => entry.url === url);
    assert.equal(matches.length, 1);
    for (const alternate of urls) assert.ok(Object.values(matches[0].alternates.languages).includes(alternate));
  }
});

test("support language links keep only validated recovery parameters", async () => {
  const { parseSupportSearchParams } = await import("./support-config.ts");
  const attempt = "550e8400-e29b-41d4-a716-446655440000";
  const params = parseSupportSearchParams(
    { status: "error", checkout_attempt: attempt, amount: "6", extra: "discard" },
    "zh-tw",
  );
  assert.equal(params.status, "retired-checkout");
  const next = parseSupportSearchParams(Object.fromEntries(new URLSearchParams(params.languageQuery)), "en");
  assert.equal(next.status, "retired-checkout");
  assert.equal(next.attemptId, undefined);
  assert.equal(new URLSearchParams(next.languageQuery).has("extra"), false);
  assert.equal(parseSupportSearchParams({ status: ["error"], amount: "6" }, "en").languageQuery, "");
  assert.equal(
    parseSupportSearchParams({ status: "error", checkout_attempt: attempt, amount: "7" }, "en").attemptId,
    undefined,
  );
  assert.equal(
    parseSupportSearchParams({ status: "success", session_id: "cs_test_example" }, "en").languageQuery,
    "status=success&session_id=cs_test_example",
  );
  assert.equal(
    parseSupportSearchParams({ status: "success", session_id: "bad" }, "en").languageQuery,
    "status=success",
  );
});

test("catalog recovery preserves product version and original language without trusting an amount", async () => {
  const { parseSupportSearchParams } = await import("./support-config.ts");
  const { createCheckoutAttempt } = await import("./server/checkout-attempt.ts");
  const checkout_attempt = createCheckoutAttempt();
  const params = parseSupportSearchParams(
    { status: "error", checkout_attempt, product_id: "support-6-v1", amount: "18", checkout_locale: "zh-cn" },
    "en",
  );
  assert.equal(params.productId, "support-6-v1");
  const next = parseSupportSearchParams(Object.fromEntries(new URLSearchParams(params.languageQuery)), "zh-tw");
  assert.equal(next.productId, "support-6-v1");
  assert.equal(next.checkoutLocale, "zh-cn");
  assert.equal(next.attemptId, checkout_attempt);
  for (const product_id of ["unknown", ["support-6-v1", "support-18-v1"], ""]) {
    assert.equal(
      parseSupportSearchParams({ status: "error", checkout_attempt, product_id, amount: "12" }, "en").attemptId,
      undefined,
    );
  }
});
