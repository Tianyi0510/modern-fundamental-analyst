import assert from "node:assert/strict";
import test from "node:test";

import { read } from "./repository-helpers.mjs";

test("Stripe Checkout accepts only the three configured one-time support amounts", async () => {
  const stripe = await read("lib/stripe-checkout.ts");

  assert.match(stripe, /SUPPORT_AMOUNTS = \[6, 12, 18\] as const/);
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
  assert.doesNotMatch(stripe, /managed_payments:/);
  assert.match(stripe, /integration_identifier: CHECKOUT_INTEGRATION_IDENTIFIER/);
  assert.match(route, /isSameOrigin\(request\)/);
  assert.match(route, /createRateLimiter\(\{ namespace: "stripe-checkout"/);
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
