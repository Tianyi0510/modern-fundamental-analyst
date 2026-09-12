# Stripe Checkout Integration

This guide describes the Checkout implementation and environment verification steps. Source behavior was reviewed on 2026-09-09; Stripe and Vercel Dashboard state was not rechecked during that review.

## Environment configuration

Use [.env.example](.env.example) for local configuration and environment-scoped Vercel variables for deployments. Store API keys as **Sensitive** values; never commit credentials.

| Field | Template Value | What to Set |
|---|---|---|
| `STRIPE_RESTRICTED_KEY` | Empty | A test restricted key locally and a separate live restricted key in Vercel. Grant Checkout Sessions read/write access and the minimum Price access required by Stripe. |
| `STRIPE_SECRET_KEY` | Empty | Compatibility fallback only. Used only when `STRIPE_RESTRICTED_KEY` is absent or empty. Prefer the restricted key. |
| `STRIPE_PRICE_USD_6` | `price_replace_with_6_usd_price` | The environment-appropriate one-time USD 6 Price ID. |
| `STRIPE_PRICE_USD_12` | `price_replace_with_12_usd_price` | The environment-appropriate one-time USD 12 Price ID. |
| `STRIPE_PRICE_USD_18` | `price_replace_with_18_usd_price` | The environment-appropriate one-time USD 18 Price ID. |

### Recorded Price IDs

The IDs below are retained from earlier setup records, not a current inventory. Before use, verify account, mode, active status, currency and amount in Stripe. They are resource identifiers, not credentials.

Use sandbox IDs only with the dedicated **Modern Fundamental Analyst sandbox** test key, and live IDs only with the **Modern Fundamental Analyst Live Mode** key.

| Amount | Sandbox Price ID | Live Price ID |
|---|---|---|
| USD 6 | `price_1U9xCKFrODtHXlgIGZb4mc22` | `price_1U9xHLCIXFgQXkh9KUQq9jez` |
| USD 12 | `price_1U9xCGFrODtHXlgI0sKuYsi7` | `price_1U9xHVCIXFgQXkh9nF0Vtknk` |
| USD 18 | `price_1U9xCOFrODtHXlgIAwa2FneY` | `price_1U9xHQCIXFgQXkh9CnfR6xfQ` |

## Checkout behavior

[lib/stripe-checkout.ts](lib/stripe-checkout.ts) defines the one-time hosted Checkout Session, Price mapping, pinned API version and integration identifier. Success and cancellation return to the localized Support page; the success URL includes the Session ID for server-side verification.

Automatic Tax is enabled on every Session, with no Managed Payments override. Verify account settings, applicable tax registrations and product tax codes in the target mode before payment testing; the code does not verify Dashboard configuration.

## Environment verification checklist

These are checks to perform for the target environment, not claims that setup is complete.

1. Configure a sandbox restricted key and matching one-time USD 6, 12 and 18 Prices in `.env.local`. The key needs Checkout Sessions read/write access for both creation and return-page verification.
2. Run `npm run dev` and verify all three amounts and language routes in Stripe test mode, including cancellation and payment confirmation. Use Stripe's documented test payment methods.
3. Before a production rollout, verify that the configured key and all three Prices belong to the intended live account. If migrating from `STRIPE_SECRET_KEY`, verify the restricted key works after deployment before removing the fallback.
4. Confirm payment-method settings, applicable live tax registrations and product tax codes. Automatic Tax is already enabled in code; sandbox configuration is not proof of live readiness.
5. Record the environment, verification date and result in the release record. A real payment is a separate live verification action; local tests and successful builds do not demonstrate successful charging.

## Payment confirmation

The return page retrieves the Checkout Session server-side and confirms success only for a completed, paid USD research-support session. Missing, invalid or unavailable sessions display an unverified message; completed but unpaid sessions display a pending message. Provider failures do not prompt the reader to pay again. The restricted key must allow Checkout Sessions **read and write**. No customer details are returned to the page.

No webhook is required for this voluntary support flow because payment completion does not unlock content or fulfill an order. If supporter benefits, receipts outside Stripe, or entitlement tracking are added later, add a durable payment ledger and a webhook endpoint that verifies every Stripe signature before processing events.

## Project Structure

- `app/api/stripe/checkout/route.ts` — same-origin, rate-limited Checkout endpoint.
- `lib/stripe-checkout.ts` — Stripe client, Price mapping, Session configuration and payment-status verification.
- `lib/support-config.ts` — shared amounts, validation and status types.
- `components/support-page-content.tsx` — localized support interface.
- `app/(en)/support/page.tsx` — English route.
- `app/zh-tw/support/page.tsx` — Traditional Chinese route.
- `app/zh-cn/support/page.tsx` — Simplified Chinese route.

Resources: [Stripe Support](https://support.stripe.com) · [Stripe MCP documentation](https://docs.stripe.com/mcp) · [Hosted Checkout](https://docs.stripe.com/payments/accept-a-payment?payment-ui=checkout&ui=stripe-hosted)
