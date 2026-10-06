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

The Support form works as a native POST without JavaScript. With JavaScript it announces navigation, locks ordinary repeated submissions, and freezes the product/version and attempt ID. If navigation stops, an explicit resume control resubmits those same values; no timer unlocks the form. A page-cache restore after submission reloads the server page rather than minting a browser attempt. New requests require a server-issued `v3` token containing a random UUID, expiry and HMAC-SHA256 signature; the API and Session-creation service validate it before a provider write. Attempts expire 23 hours after issuance, leaving a margin before Stripe's minimum 24-hour idempotency retention. Retries keep the complete token and use `support-checkout:v3:<token>` as their idempotency key. Changing a product under the same attempt hits the same key and must cause a parameter mismatch, not another Session.

`SUPPORT_CHECKOUT_SECRET` can supply a stable signing key; otherwise signing uses the active Stripe server API key. Keep the effective key consistent across serving instances. Rotating it invalidates existing attempts, which then display the retirement notice. Unconfigured local previews use a process-local random key and cannot create Stripe Sessions. The expiry cannot be extended by editing the URL or form. This bounds retries; it is not a durable payment ledger.

Expected errors redirect to the selected language with `status=error`, `status=rate-limited` or `status=invalid-amount`. Rate-limit redirects include `Retry-After` and the ten-minute message. Recovery keeps `product_id`, `checkout_attempt` and the original `checkout_locale`; interface language switches do not change Stripe metadata or return URLs. New attempts remount the form to discard a previous frozen choice. Origin, format and body-size rejections remain API errors.

Stripe Custom domains was disabled according to the owner on 2026-09-22. Redirect to Stripe's returned `session.url`; do not construct a custom payment hostname. The existing CSP permits `https://checkout.stripe.com`.

## Retired attempts

Amount-only forms, unsigned UUID attempts, expired tokens and invalid signatures are retired. The endpoint redirects retired requests to `status=retired-checkout` without creating a Session. Legacy error/rate-limit links show the same localized message and no checkout form; readers must check their original Stripe confirmation before intentionally opening a fresh Support page. Language switches preserve this notice, not an old attempt payload. Never convert an old UUID to the new pricing contract or silently create a replacement payment.

Old paid Sessions remain verifiable through their original amount metadata. The application no longer reads any legacy Price configuration. This workspace change does not delete cloud variables; removing settings from an older serving deployment still requires coordinating its release or rollback.

## Environment verification checklist

1. Configure a sandbox server key and verify permission to create an inline-price Session and retrieve it. Confirm account tax defaults, applicable registrations and the catalog's tax classification. Provider writes require separate authorization.
2. Exercise all products and three languages, native submission without JavaScript, stopped-navigation resume, changed-selection rejection, cancellation, pending payment and server-confirmed payment.
3. Before release, confirm retired links display the notice and make no provider request. Verify the new key and target account mode; sandbox success is not live payment evidence.
4. Verify the release and catalog recovery with the same attempt, product/version and original locale. Record environment, date and result without credentials or customer data.
5. Remove unused cloud settings with the corresponding release; an older rollback deployment still requires its original configuration.

## Payment confirmation

Payment status does not grant email-subscription consent. Checkout remains independent of the [email confirmation flow](RESEND_INTEGRATION.md#subscription-confirmation-and-delivery-feedback); the application does not activate a newsletter subscription from a successful payment or a Checkout email address.

The asynchronous `VerifiedSupportPanel` retrieves payment status server-side and renders the synchronous `SupportPanel` through JSX. Payment verification uses a Suspense loading boundary; ordinary visits and retry states render the native form directly through JSX without awaiting a provider. Do not invoke either component as an ordinary function.

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
