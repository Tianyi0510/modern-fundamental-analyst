# Resend request reliability

`UPSTASH_REDIS_URL` is required for subscriber mutations and preference-link requests. Unlike rate limiting, these operations fail with a retryable error if Redis is unavailable. No live email is sent by the unit tests.

Preference requests store the complete email payload for 25 hours using atomic `SET NX`, covering Resend's 24-hour deduplication window plus a delay before the initial send. Retries reuse the original encrypted link, text, HTML and provider idempotency key. Changing the input under the same key returns 409. After 25 minutes, a fresh submission ID is required so users do not receive a nearly expired 30-minute link. The form resets its ID on that response. Redis records contain the recipient and email content; use the existing authenticated TLS connection and restrict database access.

Subscribe, preference updates and unsubscribe webhooks share a per-email Redis lease. Contention returns a retryable failure instead of performing overlapping writes. Each Resend HTTP call has an 8-second abort deadline; a subscriber operation has a shared 20-second deadline. The browser allows 45 seconds for service work and Redis overhead.

Network errors, server errors and timeouts can leave the provider outcome unknown. Further provider calls in that operation are stopped, including rollback. The 120-second lease is retained until expiry. An abort cannot undo a write already accepted by Resend; this is bounded coordination, not an exactly-once transaction. A welcome event with an unknown outcome may require checking Resend logs before retrying it. Webhook failures return 500 for provider retry.

Run `npm run test:unit`, `npm run typecheck`, `npm run lint`, and `npm run build`. The coordination tests simulate Redis, provider failures, duplicate requests and aborted fetches without accessing production services.

Segment reconciliation reads all pages before changing membership, preserves unrelated segments, and rejects non-progressing cursors. Active subscriptions with an unchanged language skip the contact update and welcome event after checking their memberships. Welcome prerequisites are checked before mutation; a definitively rejected welcome restores the previous language property and memberships. Failed rollback is logged and retains the subscriber lease for reconciliation.

GitHub Actions retains failed Playwright traces and screenshots in the `browser-failure-evidence` artifact for seven days.
