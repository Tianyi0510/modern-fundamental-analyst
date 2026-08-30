import assert from "node:assert/strict";
import test from "node:test";

import { read } from "./repository-helpers.mjs";

const { parseSupportAmount } = await import("../lib/stripe-checkout.ts");

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
  const stripe = await read("lib/stripe-checkout.ts");

  assert.match(stripe, /SUPPORT_AMOUNTS = \[6, 12, 18\] as const/);
  assert.match(stripe, /SUPPORT_AMOUNT_BY_VALUE\.get\(value\)/);
  assert.doesNotMatch(stripe, /Number\(value\)/);
  assert.match(stripe, /mode: "payment"/);
  assert.match(stripe, /ui_mode: "hosted_page"/);
  assert.match(stripe, /line_items: \[\{ price: getPriceId\(amount\), quantity: 1 \}\]/);
  assert.doesNotMatch(stripe, /payment_method_types/);
  assert.doesNotMatch(stripe, /payment_method_collection:/);
});

test("Stripe Checkout keeps secrets server-side and applies safety controls", async () => {
  const [stripe, route, environment] = await Promise.all([
    read("lib/stripe-checkout.ts"),
    read("app/api/stripe/checkout/route.ts"),
    read(".env.example"),
  ]);

  assert.match(stripe, /process\.env\.STRIPE_RESTRICTED_KEY/);
  assert.match(stripe, /process\.env\.STRIPE_SECRET_KEY/);
  assert.match(stripe, /automatic_tax: \{ enabled: true \}/);
  assert.match(stripe, /apiVersion: STRIPE_API_VERSION/);
  assert.match(stripe, /STRIPE_API_VERSION = "2026-07-29\.dahlia"/);
  assert.doesNotMatch(stripe, /managed_payments:/);
  assert.match(stripe, /integration_identifier: CHECKOUT_INTEGRATION_IDENTIFIER/);
  assert.match(stripe, /locale: locale === "en" \? "en" : "zh"/);
  assert.match(stripe, /payment_intent_data: \{ metadata \}/);
  assert.match(route, /isSameOrigin\(request\)/);
  assert.match(route, /createRateLimiter\(\{ namespace: "stripe-checkout"/);
  assert.match(route, /process\.env\.NODE_ENV === "production" \? SITE_URL/);
  assert.match(route, /getStripeErrorDetails\(error\)/);
  assert.doesNotMatch(route, /String\(error\.message\)/);
  assert.match(environment, /STRIPE_RESTRICTED_KEY=rk_test_replace_with_restricted_key/);
  assert.doesNotMatch(`${stripe}\n${route}`, /[sr]k_(?:test|live)_[A-Za-z0-9]+/);
});

test("Support is localized and linked without changing the primary navigation", async () => {
  const [support, footer, sitemap, navigation] = await Promise.all([
    read("components/support-page-content.tsx"),
    read("components/site-footer.tsx"),
    read("app/sitemap.ts"),
    read("lib/navigation-copy.ts"),
  ]);

  assert.match(support, /en:/);
  assert.match(support, /"zh-tw":/);
  assert.match(support, /"zh-cn":/);
  assert.match(footer, /href=\{`\$\{prefix\}\/support`\}/);
  assert.match(sitemap, /"\/support"/);
  assert.doesNotMatch(navigation, /support/i);
});
