import assert from "node:assert/strict";
import test from "node:test";

import { read } from "./repository-helpers.mjs";

const { parseSupportAmount } = await import("../src/features/support/support-config.ts");

test("Stripe support amount parsing accepts only canonical configured values", () => {
  assert.equal(parseSupportAmount("6"), 6);
  assert.equal(parseSupportAmount("12"), 12);
  assert.equal(parseSupportAmount("18"), 18);
  assert.equal(parseSupportAmount("06"), null);
  assert.equal(parseSupportAmount("6.0"), null);
  assert.equal(parseSupportAmount("6e0"), null);
  assert.equal(parseSupportAmount(null), null);
});

test("Stripe Checkout accepts only the three configured one-time support amounts", async () => {
  const stripe = await read("src/features/support/server/stripe-checkout.ts");

  assert.doesNotMatch(stripe, /Number\(value\)/);
  assert.match(stripe, /mode: "payment"/);
  assert.match(stripe, /ui_mode: "hosted_page"/);
  assert.match(stripe, /line_items: \[\{ price: getPriceId\(amount\), quantity: 1 \}\]/);
  assert.doesNotMatch(stripe, /payment_method_types/);
  assert.doesNotMatch(stripe, /payment_method_collection:/);
});

test("Stripe Checkout keeps secrets server-side and applies safety controls", async () => {
  const [stripe, route, environment] = await Promise.all([
    read("src/features/support/server/stripe-checkout.ts"),
    read("src/app/api/stripe/checkout/route.ts"),
    read(".env.example"),
  ]);

  assert.match(stripe, /process\.env\.STRIPE_RESTRICTED_KEY/);
  assert.match(stripe, /process\.env\.STRIPE_SECRET_KEY/);
  assert.match(stripe, /automatic_tax: \{ enabled: true \}/);
  assert.match(stripe, /apiVersion: STRIPE_API_VERSION/);
  assert.match(stripe, /STRIPE_API_VERSION = "2026-08-26\.dahlia"/);
  assert.doesNotMatch(stripe, /managed_payments:/);
  assert.match(stripe, /integration_identifier: CHECKOUT_INTEGRATION_IDENTIFIER/);
  assert.match(stripe, /locale: locale === "en" \? "en" : "zh"/);
  assert.match(stripe, /payment_intent_data: \{ metadata \}/);
  assert.match(route, /isSameOrigin\(request\)/);
  assert.match(route, /createRateLimiter\(\s*\{\s*namespace: "stripe-checkout"/);
  assert.match(route, /process\.env\.NODE_ENV === "production" \? SITE_URL/);
  assert.match(route, /getStripeErrorDetails\(error\)/);
  assert.doesNotMatch(route, /String\(error\.message\)/);
  assert.match(environment, /^STRIPE_RESTRICTED_KEY=$/m);
  assert.match(environment, /^STRIPE_SECRET_KEY=$/m);
  assert.doesNotMatch(`${stripe}\n${route}`, /[sr]k_(?:test|live)_[A-Za-z0-9]+/);
});

test("Support is localized and linked without changing the primary navigation", async () => {
  const [support, footer, sitemap, navigation] = await Promise.all([
    Promise.all([read("src/features/support/support-copy.ts"), read("src/features/support/support-panel.tsx")]).then(
      (parts) => parts.join("\n"),
    ),
    read("src/components/site-footer.tsx"),
    read("src/app/sitemap.ts"),
    read("src/lib/navigation-copy.ts"),
  ]);

  assert.match(support, /en:/);
  assert.match(support, /"zh-tw":/);
  assert.match(support, /"zh-cn":/);
  assert.match(support, /className="support-section"/);
  assert.doesNotMatch(support, /className="support-section section-gray"/);
  assert.match(footer, /href=\{getLocalizedPath\("\/support", locale\)\}/);
  assert.match(sitemap, /"\/support"/);
  assert.doesNotMatch(navigation, /support/i);
});

test("support language links keep only validated recovery parameters", async () => {
  const { parseSupportSearchParams } = await import("../src/features/support/support-config.ts");
  const attempt = "550e8400-e29b-41d4-a716-446655440000";
  const params = parseSupportSearchParams(
    { status: "error", checkout_attempt: attempt, amount: "6", extra: "discard" },
    "zh-tw",
  );
  assert.equal(params.checkoutLocale, "zh-tw");
  const next = parseSupportSearchParams(Object.fromEntries(new URLSearchParams(params.languageQuery)), "en");
  assert.equal(next.checkoutLocale, "zh-tw");
  assert.equal(next.attemptId, attempt);
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
