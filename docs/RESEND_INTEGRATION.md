# Resend email and subscriptions

## Environment setup

This guide describes the repository implementation. Provider resources must be configured in the Resend account used by each environment; their current Dashboard state is not verified by this document.

1. Verify the sending domain `mail.modernfundamentalanalyst.com` in Resend. The sender constants in [lib/resend.ts](../lib/resend.ts) use `contact@` for contact messages and `updates@` for preference links. If using another domain, update those constants as well as the provider configuration.
2. Configure server variables from [.env.example](../.env.example): `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `RESEND_WEBHOOK_SECRET`, `SUBSCRIPTION_PREFERENCES_SECRET`, `UPSTASH_REDIS_URL`, and `RATE_LIMIT_HASH_SECRET`. Use an API key that permits the email, contact, segment and event operations in this application. Keep the preference secret stable; see [reconciliation and secret rotation](TECHNICAL_ARCHITECTURE.md#subscription-reconciliation).
3. Create a text contact property named `preferred_language` and three language segments. Set the matching `RESEND_SEGMENT_*` variables below. The default IDs in the code and environment template refer to this project's existing resources; override all three when using another account or isolated test resources.

| Locale  | Exact `preferred_language` value | Segment variable       |
| ------- | -------------------------------- | ---------------------- |
| `en`    | `English`                        | `RESEND_SEGMENT_EN`    |
| `zh-tw` | `繁體中文`                       | `RESEND_SEGMENT_ZH_TW` |
| `zh-cn` | `简体中文`                       | `RESEND_SEGMENT_ZH_CN` |

These are the exact values written to Resend contacts, not translations of the documentation. [`localeConfig` in `lib/i18n.ts`](../lib/i18n.ts) is authoritative; update this table if those labels change. Use the literal values when configuring or inspecting contacts.

4. Configure and enable a welcome automation triggered by `subscriber.created`. The application sends `locale`, `memo_title`, `memo_summary`, `memo_url`, and `preferences_url` in its payload; use these in the localized welcome content. The code sends an event rather than the welcome email itself, so a successful event response does not verify automation delivery. New or previously unsubscribed contacts trigger it; active contacts do not. At least one memo must exist for the selected locale.
5. Configure a webhook for the deployed `/api/webhooks/resend` endpoint with `email.bounced`, `email.complained`, and `email.suppressed`. Store that endpoint's signing secret as `RESEND_WEBHOOK_SECRET`. The handler verifies the signature and marks affected contacts unsubscribed; unrelated events are acknowledged without contact changes.
6. Use isolated resources and an owned test recipient to verify contact delivery, welcome delivery, preference-link requests, language changes and unsubscribe. Confirm webhook processing with a signed provider test event. Local unit tests mock these services and cannot verify Dashboard setup. Preference URLs use `SITE_URL` from [lib/site-config.ts](../lib/site-config.ts), so confirm the destination before testing against an alternate deployment.

## Receiving

The project owner confirmed on 2026-09-22 that Receiving is enabled for `mail.modernfundamentalanalyst.com`. The domain has transferred to Vercel; maintain Resend's required receiving MX and sending/verification records in the authoritative DNS zone. Retrieve exact records from Resend rather than hard-coding provider DNS values here. See [domain ownership](TECHNICAL_ARCHITECTURE.md#domain-and-service-ownership).

Receiving is a provider capability, not an application inbox or automatic forwarding rule. The existing `/api/webhooks/resend` handler processes only `email.bounced`, `email.complained`, and `email.suppressed`; other signed events, including `email.received`, are acknowledged without processing their contents. Do not use this endpoint as an inbound-mail processor. An inbound workflow requires a separately designed handler and event subscription before it can retrieve, store or forward messages.

Keep `CONTACT_TO_EMAIL` set to the intended recipient of website contact-form messages. Enabling Receiving does not change that destination, sender addresses, or the existing webhook signing secret. No new environment variable is required for provider-only receiving. Actual inbound delivery has not been verified by this repository update.

## Preference display

A valid preference token allows a server-side contact lookup. The form displays the saved `preferred_language`, independently of the page language. Missing, unknown or unavailable values require an explicit language selection before saving; unsubscribe remains available. Editing the selection clears the previous success message. Email identity inputs are trimmed and lowercased without truncation; overlong addresses are rejected before provider operations.

## Request reliability

`UPSTASH_REDIS_URL` is required for subscriber mutations and preference-link requests. Unlike rate limiting, these operations fail with a retryable error if Redis is unavailable. No live email is sent by the unit tests.

Preference requests store the complete email payload for 25 hours using atomic `SET NX`, covering Resend's 24-hour deduplication window plus a delay before the initial send. Retries reuse the original encrypted link, text, HTML and provider idempotency key. Changing the input under the same key returns 409. After 25 minutes, a fresh submission ID is required so users do not receive a nearly expired 30-minute link. The form resets its ID on that response. Redis records contain the recipient and email content; use the existing authenticated TLS connection and restrict database access.

Before a retry, the application validates the stored record's age, email fields and recipient. A malformed or mismatched record fails closed without sending an email; it is not overwritten under the same idempotency key.

Subscribe, preference updates and unsubscribe webhooks share a per-email Redis lease. Contention returns a retryable failure instead of performing overlapping writes. Each Resend HTTP call has an 8-second abort deadline; a subscriber operation has a shared 20-second deadline. The browser allows 45 seconds for service work and Redis overhead.

Network errors, server errors and timeouts can leave the provider outcome unknown. Further provider calls in that operation are stopped, including rollback, and the 120-second lease is retained until expiry. An abort cannot undo a write already accepted by Resend. Subscription and preference-language saves also use a durable journal; follow [subscription reconciliation](TECHNICAL_ARCHITECTURE.md#subscription-reconciliation) for blocking behavior, unsubscribe availability and recovery. Webhook failures return 500 for provider retry.

Segment reconciliation reads all pages before changing membership, preserves unrelated segments, and rejects non-progressing cursors. Active subscriptions with an unchanged language skip the contact update and welcome event after checking their memberships. Welcome prerequisites are checked before mutation; a definitively rejected welcome restores the previous language property and memberships. Failed rollback is logged and retains the subscriber lease and journal for reconciliation.

## Verification

Follow the [verification commands](../README.md#verification). Coordination tests simulate Redis, provider failures, duplicate requests and aborted fetches without accessing production services. See [review evidence](TECHNICAL_ARCHITECTURE.md#review-evidence) for CI artifact retention.
