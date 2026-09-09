# Stripe Checkout Integration

This guide describes the Checkout implementation and environment verification steps. Source behavior was reviewed on 2026-09-09; Stripe and Vercel Dashboard state was not rechecked during that review.

## Environment configuration

Use [.env.example](.env.example) for local configuration and environment-scoped Vercel variables for deployments. Store API keys as **Sensitive** values; never commit credentials.

**Files containing placeholders:**

- [.env.example](.env.example)

| Field | Current Value | What to Set |
|---|---|---|
| `STRIPE_RESTRICTED_KEY` | `rk_test_replace_with_restricted_key` | A test restricted key locally and a separate live restricted key in Vercel. Grant Checkout Sessions read/write access and the minimum Price access required by Stripe. |
| `STRIPE_SECRET_KEY` | `sk_test_replace_with_secret_key` | Compatibility fallback only. Used only when `STRIPE_RESTRICTED_KEY` is absent or empty. Prefer the restricted key. |
| `STRIPE_PRICE_USD_6` | `price_replace_with_6_usd_price` | The environment-appropriate one-time USD 6 Price ID. |
| `STRIPE_PRICE_USD_12` | `price_replace_with_12_usd_price` | The environment-appropriate one-time USD 12 Price ID. |
| `STRIPE_PRICE_USD_18` | `price_replace_with_18_usd_price` | The environment-appropriate one-time USD 18 Price ID. |

### Recorded Price IDs

The IDs below are retained from earlier setup records, not a current inventory. Before use, verify account, mode, active status, currency and amount in Stripe. They are resource identifiers, not credentials.

### Sandbox Price IDs

Use these only with the dedicated **Modern Fundamental Analyst sandbox** and its restricted test key.

| Amount | Price ID |
|---|---|
| USD 6 | `price_1U9xCKFrODtHXlgIGZb4mc22` |
| USD 12 | `price_1U9xCGFrODtHXlgI0sKuYsi7` |
| USD 18 | `price_1U9xCOFrODtHXlgIAwa2FneY` |

### Live Price IDs

Use these only with the **Modern Fundamental Analyst Live Mode** restricted key.

| Amount | Price ID |
|---|---|
| USD 6 | `price_1U9xHLCIXFgQXkh9KUQq9jez` |
| USD 12 | `price_1U9xHVCIXFgQXkh9nF0Vtknk` |
| USD 18 | `price_1U9xHQCIXFgQXkh9CnfR6xfQ` |

## Configured Parameters

**Checkout Session configuration:**

- [lib/stripe-checkout.ts](lib/stripe-checkout.ts)

| Parameter | Value |
|---|---|
| `ui_mode` | `hosted_page` |
| `mode` | `payment` |
| `billing_address_collection` | `auto` |
| `phone_number_collection.enabled` | `false` |
| `automatic_tax.enabled` | `true` in the application |
| `managed_payments.enabled` | Uses the Stripe account default |
| `allow_promotion_codes` | `false` |
| `submit_type` | `auto` |
| `integration_identifier` | `hosted_web_0001_mfaqxkpt` |
| `origin_context` | `web` |
| `payment_method_collection` | Omitted because this is a one-time payment |
| `success_url` | Localized `/support?status=success&session_id={CHECKOUT_SESSION_ID}` |
| `cancel_url` | Localized `/support?status=cancelled` |

The code enables Automatic Tax on every Session and omits a Managed Payments override. Verify account settings, applicable registrations and product tax codes in the target mode before payment testing; the code does not verify those Dashboard settings.

The integration identifier is defined in `lib/stripe-checkout.ts`, which also pins the Stripe API version.

## Environment verification checklist

These are checks to perform for the target environment, not claims that setup is complete.

1. Configure a sandbox restricted key and matching one-time USD 6, 12 and 18 Prices in `.env.local`. The key needs Checkout Sessions read/write access for both creation and return-page verification.
2. Run `npm run dev` and verify all three amounts and language routes in Stripe test mode, including cancellation and payment confirmation. Use Stripe's documented test payment methods.
3. Before a production rollout, verify that the configured key and all three Prices belong to the intended live account. If migrating from `STRIPE_SECRET_KEY`, verify the restricted key works after deployment before removing the fallback.
4. Confirm payment-method settings, applicable live tax registrations and product tax codes. Automatic Tax is already enabled in code; sandbox configuration is not proof of live readiness.
5. Record the environment, verification date and result in the release record. A real payment is a separate live verification action; local tests and successful builds do not demonstrate successful charging.

## Payment confirmation

The return page retrieves the Checkout Session server-side and confirms success only for a completed, paid USD research-support session. Missing, invalid or unavailable sessions display an unverified message; completed but unpaid sessions display a pending message. The restricted key must allow Checkout Sessions **read and write**. No customer details are returned to the page.

No webhook is required for this voluntary support flow because payment completion does not unlock content or fulfill an order. If supporter benefits, receipts outside Stripe, or entitlement tracking are added later, create a webhook endpoint and verify every Stripe signature before processing events.

## Project Structure

- `app/api/stripe/checkout/route.ts` — same-origin, rate-limited Checkout endpoint.
- `lib/stripe-checkout.ts` — Stripe client, Price mapping, Session configuration and payment-status verification.
- `lib/support-config.ts` — shared amounts, validation and status types.
- `components/support-page-content.tsx` — localized support interface.
- `app/(en)/support/page.tsx` — English route.
- `app/zh-tw/support/page.tsx` — Traditional Chinese route.
- `app/zh-cn/support/page.tsx` — Simplified Chinese route.

## Flow Overview

1. A reader selects USD 6, 12, or 18 on the localized Support page.
2. The server validates the amount, locale, request origin, body size, and rate limit.
3. The server creates a one-time hosted Checkout Session using an environment-specific Price ID.
4. Stripe securely collects payment details and returns the reader to the localized Support page.

Resources: [Stripe Support](https://support.stripe.com) · [Stripe MCP documentation](https://docs.stripe.com/mcp) · [Hosted Checkout](https://docs.stripe.com/payments/accept-a-payment?payment-ui=checkout&ui=stripe-hosted)
