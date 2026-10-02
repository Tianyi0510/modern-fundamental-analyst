# Stripe Integration

This guide owns Hosted Checkout, payment confirmation, and configuration migration. No production settings are changed by a workspace implementation.

## Environment configuration

Use [.env.example](../.env.example) for local configuration and environment-scoped Vercel secrets. Prefer `STRIPE_RESTRICTED_KEY`; `STRIPE_SECRET_KEY` remains a compatibility fallback. Grant Checkout Sessions read/write and the Product/Price permissions required by inline `price_data`; verify the actual restricted key in a sandbox before release. Do not expand permissions without checking the target account.

Checkouts use no Price-ID environment variables. The server-only [catalog](../src/features/support/server/support-catalog.ts) owns product IDs, USD prices, names and tax codes:

| Product ID      | Unit amount (USD cents) |
| --------------- | ----------------------- |
| `support-6-v1`  | 600                     |
| `support-12-v1` | 1200                    |
| `support-18-v1` | 1800                    |

Keep released catalog versions immutable, including names, tax codes and Stripe parameter construction. Add a version when terms change; keep old versions available for existing attempts. The form receives display amounts from the server. Submitted amounts never determine a catalog product's price; unknown or repeated product fields are rejected.

On 2026-10-02, the live account's three active one-time Prices were inspected read-only: USD 600/1200/1800 cents, Product name `Support`, no description, tax code `txcd_10000000`, and unspecified tax behavior. The v1 catalog preserves that name and classification and continues to use the account's tax-behavior default. This inspection does not establish restricted-key permissions, tax registrations or payment success.

## Checkout behavior

The [server module](../src/features/support/server/stripe-checkout.ts) creates one-time hosted Sessions with `price_data`, a pinned API version and the existing integration identifier. Automatic Tax remains enabled; no Managed Payments override is added. Embedded Checkout is not part of this migration. Stripe owns all payment fields; the website does not collect card details.

The Support form works as a native POST without JavaScript. With JavaScript it announces navigation, locks ordinary repeated submissions, and freezes the product/version and attempt ID. If navigation stops, an explicit resume control resubmits those same values; no timer unlocks the form. A page-cache restore starts a new attempt. New requests require one valid UUID attempt and use `support-checkout:v2:<attempt>` as the idempotency key. The key does not include the product ID: changing a selection under the same attempt must cause a parameter mismatch, not a second Session. Stripe retains keys for at least 24 hours; this is short-term recovery, not a durable payment ledger.

Expected errors redirect to the selected language with `status=error`, `status=rate-limited` or `status=invalid-amount`. Rate-limit redirects include `Retry-After` and the ten-minute message. Recovery keeps `product_id`, `checkout_attempt` and the original `checkout_locale`; interface language switches do not change Stripe metadata or return URLs. New attempts remount the form to discard a previous frozen choice. Origin, format and body-size rejections remain API errors.

Stripe Custom domains was disabled according to the owner on 2026-09-22. Redirect to Stripe's returned `session.url`; do not construct a custom payment hostname. The existing CSP permits `https://checkout.stripe.com`.

## Retired attempts

Amount-only forms and recovery links are retired. The endpoint redirects old amount-only requests to `status=retired-checkout` without creating a Session. Legacy error/rate-limit links show the same localized message and no checkout form; readers must check their original Stripe confirmation before intentionally opening a fresh Support page. Language switches preserve this notice, not an old attempt payload. Never convert an old UUID to the new pricing contract or silently create a replacement payment.

Old paid Sessions remain verifiable through their original amount metadata. The application no longer reads any legacy Price configuration. This workspace change does not delete cloud variables; removing settings from an older serving deployment still requires coordinating its release or rollback.

## Environment verification checklist

1. Configure a sandbox server key and verify permission to create an inline-price Session and retrieve it. Confirm account tax defaults, applicable registrations and the catalog's tax classification. Provider writes require separate authorization.
2. Exercise all products and three languages, native submission without JavaScript, stopped-navigation resume, changed-selection rejection, cancellation, pending payment and server-confirmed payment.
3. Before release, confirm retired links display the notice and make no provider request. Verify the new key and target account mode; sandbox success is not live payment evidence.
4. Verify the release and catalog recovery with the same attempt, product/version and original locale. Record environment, date and result without credentials or customer data.
5. Remove unused cloud settings with the corresponding release; an older rollback deployment still requires its original configuration.

## Payment confirmation

The return page retrieves the Session server-side. Only a completed, paid USD research-support Session confirms success. New catalog Sessions must also match the known product ID, subtotal and amount metadata; tax may increase the total without changing the subtotal. Missing or unavailable evidence is unverified, and completed unpaid Sessions are pending. URL parameters alone never confirm payment. No customer details are returned to the page.

No webhook is required for voluntary support because payment does not unlock content or fulfill an order. Future entitlements or durable recovery require a payment ledger and verified Stripe webhooks.

## Project Structure

- `src/features/support/server/support-catalog.ts` — versioned server pricing and product terms.
- `src/features/support/server/stripe-checkout.ts` — client, Session creation, retired-attempt protection and verification.
- `src/features/support/support-config.ts` — shared choice identifiers, historical payment amount validation and recovery query allowlist.
- `src/features/support/support-panel.tsx` — server-provided choices and payment status.
- `src/features/support/support-checkout-form.tsx` — native submission lock and explicit resume.
- `src/app/api/stripe/checkout/route.ts` — same-origin validation, rate limiting and localized redirects.

Resources: [Checkout Session creation](https://docs.stripe.com/api/checkout/sessions/create) · [Idempotent requests](https://docs.stripe.com/api/idempotent_requests) · [Hosted Checkout](https://docs.stripe.com/payments/accept-a-payment?payment-ui=checkout&ui=stripe-hosted)
