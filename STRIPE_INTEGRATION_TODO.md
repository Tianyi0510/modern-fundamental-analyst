# Stripe Checkout Integration

This file is the single source of truth for the remaining Stripe setup required before accepting live payments.

## Values to Replace

The repository contains no real credentials. Configure these values as **Sensitive** environment variables in Vercel rather than committing them.

**Files containing placeholders:**

- [.env.example](.env.example)

| Field | Current Value | What to Set |
|---|---|---|
| `STRIPE_RESTRICTED_KEY` | `rk_test_replace_with_restricted_key` | A test restricted key locally and a separate live restricted key in Vercel. Grant only Checkout Sessions write access and the minimum Price access required by Stripe. |
| `STRIPE_SECRET_KEY` | `sk_test_replace_with_secret_key` | Compatibility fallback only. Production currently uses this Sensitive Vercel variable; replace it with `STRIPE_RESTRICTED_KEY` when practical. |
| `STRIPE_PRICE_USD_6` | `price_replace_with_6_usd_price` | The environment-appropriate one-time USD 6 Price ID. |
| `STRIPE_PRICE_USD_12` | `price_replace_with_12_usd_price` | The environment-appropriate one-time USD 12 Price ID. |
| `STRIPE_PRICE_USD_18` | `price_replace_with_18_usd_price` | The environment-appropriate one-time USD 18 Price ID. |

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
| `automatic_tax.enabled` | `false` until an active tax registration is confirmed |
| `allow_promotion_codes` | `false` |
| `submit_type` | `auto` |
| `integration_identifier` | `hosted_web_0001_mfaqxkpt` |
| `origin_context` | `web` |
| `payment_method_collection` | Omitted because this is a one-time payment |
| `success_url` | Localized `/support?status=success&session_id={CHECKOUT_SESSION_ID}` |
| `cancel_url` | Localized `/support?status=cancelled` |

`automatic_tax` differs intentionally from the Checkout Studio value. The sandbox had no active Tax Registrations when checked, so enabling it would silently collect no tax. Confirm the applicable registrations and product tax treatment with a qualified tax professional before changing this value.

The implementation preserves the requested `hosted_web_0001` prefix and appends the required eight-letter tracking suffix for current Stripe API versions.

## Setup and Next Steps

1. Create a restricted key for the sandbox. Store it only in `.env.local` as `STRIPE_RESTRICTED_KEY`. `STRIPE_SECRET_KEY` is accepted only as a compatibility fallback.
2. Add the three sandbox Price IDs above to `.env.local`.
3. Run `npm run dev`, open `/support`, and complete each amount with Stripe test card `4242 4242 4242 4242`, any future expiry, and any CVC.
4. The equivalent live Product and Price resources have already been created; use the live Price IDs above.
5. Production currently has `STRIPE_SECRET_KEY` and the live Price IDs as Sensitive Vercel variables. Migrate the key to a least-privilege `STRIPE_RESTRICTED_KEY`, redeploy, then remove the broad secret key.
6. Redeploy Production and complete one small live payment. Refund it from Stripe after verification if desired.
7. Keep Dynamic Payment Methods enabled in Stripe Dashboard. The code intentionally omits `payment_method_types`.
8. Before enabling Stripe Tax, confirm an active registration and an appropriate product tax code. Sandbox registrations do not carry into live mode.

No webhook is required for this voluntary support flow because payment completion does not unlock content or fulfill an order. If supporter benefits, receipts outside Stripe, or entitlement tracking are added later, create a webhook endpoint and verify every Stripe signature before processing events.

## Project Structure

- `app/api/stripe/checkout/route.ts` — same-origin, rate-limited Checkout endpoint.
- `lib/stripe-checkout.ts` — Stripe client, amount validation, Price mapping, and Session configuration.
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
