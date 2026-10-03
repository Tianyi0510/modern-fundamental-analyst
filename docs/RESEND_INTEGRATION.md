# Resend Integration

## Environment setup

This guide describes the repository implementation. Provider resources must be configured in the Resend account used by each environment; their current Dashboard state is not verified by this document.

1. Verify the sending domain `mail.modernfundamentalanalyst.com` in Resend. The sender constants in [src/lib/resend.ts](../src/lib/resend.ts) use `contact@` for contact messages and `updates@` for preference links. If using another domain, update those constants as well as the provider configuration.
2. Configure server variables from [.env.example](../.env.example): `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `SUBSCRIPTION_PREFERENCES_SECRET`, `UPSTASH_KV_REST_API_URL`, and `UPSTASH_KV_REST_API_TOKEN`. Use an API key that permits the email, contact, segment and event operations in this application. Keep the preference secret stable; see [credential and secret rotation](UPSTASH_REDIS_INTEGRATION.md#credential-and-secret-rotation).
3. Create a text contact property named `preferred_language` and three language segments. Set the matching `RESEND_SEGMENT_*` variables below. The default IDs in the code and environment template refer to this project's existing resources; override all three when using another account or isolated test resources.

| Locale  | Exact `preferred_language` value | Segment variable       |
| ------- | -------------------------------- | ---------------------- |
| `en`    | `English`                        | `RESEND_SEGMENT_EN`    |
| `zh-tw` | `繁體中文`                       | `RESEND_SEGMENT_ZH_TW` |
| `zh-cn` | `简体中文`                       | `RESEND_SEGMENT_ZH_CN` |

These are the exact values written to Resend contacts, not translations of the documentation. [`localeConfig` in `src/lib/i18n.ts`](../src/lib/i18n.ts) is authoritative; update this table if those labels change. Use the literal values when configuring or inspecting contacts.

4. Configure and enable a welcome automation triggered by `subscriber.created`. The application sends `locale`, `memo_title`, `memo_summary`, `memo_url`, and `preferences_url` in its payload; use these in the localized welcome content. The code sends an event rather than the welcome email itself, so a successful event response does not verify automation delivery. New or previously unsubscribed contacts trigger it; active contacts do not. At least one memo must exist for the selected locale.
5. Configure a webhook for the deployed `/api/webhooks/resend` endpoint with `email.bounced`, `email.complained`, and `email.suppressed`. Store that endpoint's signing secret as `RESEND_WEBHOOK_SECRET`. The handler verifies the signature and marks affected contacts unsubscribed; unrelated events are acknowledged without contact changes.
6. Use isolated resources and an owned test recipient to verify contact delivery, welcome delivery, preference-link requests, language changes and unsubscribe. Confirm webhook processing with a signed provider test event. Local unit tests mock these services and cannot verify Dashboard setup. Preference URLs use `SITE_URL` from [src/lib/site-config.ts](../src/lib/site-config.ts), so confirm the destination before testing against an alternate deployment.

## Email templates and local preview

Contact notifications and preference-link emails use React Email. The shared layout owns the brand header, content container and button; domain templates own their content. Templates contain no provider clients, credentials or token-generation logic.

| Responsibility                                          | Source                                                                               |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Shared email layout and button                          | [`email-layout.tsx`](../src/components/email-layout.tsx)                             |
| Contact HTML and localized labels                       | [`contact-email.tsx`](../src/features/contact/contact-email.tsx)                     |
| Contact subject, plain text and Reply-To                | [`send-contact-message.ts`](../src/features/contact/server/send-contact-message.ts)  |
| Contact recipient                                       | [`contact-config.ts`](../src/features/contact/server/contact-config.ts)              |
| Preference HTML                                         | [`preference-email.tsx`](../src/features/subscriptions/preference-email.tsx)         |
| Preference subject and three-language copy              | [`preference-email-copy.ts`](../src/features/subscriptions/preference-email-copy.ts) |
| Preference token, plain text and delivery orchestration | [`request/route.ts`](../src/app/api/subscription-preferences/request/route.ts)       |
| Fictional Contact previews                              | [`contact/previews/`](../src/features/contact/previews/)                             |
| Fictional preference previews                           | [`subscriptions/previews/`](../src/features/subscriptions/previews/)                 |

### Preview workflow

After `npm ci`, run:

```sh
npm run email:contact
# In a separate terminal, if needed:
npm run email:preferences
```

Open [localhost:3001](http://localhost:3001) for `contact-en`, `contact-zh-tw` and `contact-zh-cn`; open [localhost:3002](http://localhost:3002) for `preferences-en`, `preferences-zh-tw` and `preferences-zh-cn`. `npm run email` remains an alias for the Contact preview. Edit the owning template or shared layout to update its preview. Stop the preview server with Ctrl+C. It can run alongside the website on port 3000.

All six examples use fictional content, `example.com` addresses and, for preferences, a nonfunctional token. No service credentials are needed. Rendering previews does not send mail; the preview UI's Send action is separate from this workflow. Welcome emails remain owned by the Resend automation.

The preview's generated plain-text view is a rendering aid, not the exact production text payload. Sending paths retain explicit plain text: Contact's operational labels remain English, while preference text uses the requested locale. Contact's HTML labels follow the submission locale. When changing copy, review HTML and the production text source together.

### Rendering and retries

The preference route awaits HTML rendering inside the initial payload factory, before storing a complete candidate in Redis. A rendering failure creates no partial retry record. Concurrent requests use atomic insertion and reuse the winning stored payload. Existing records, including those created before a template change, retain their original HTML, text and idempotency key; see [request reliability](#request-reliability).

`react-email` provides the runtime components and renderer. The development-only `@react-email/ui` package provides the preview application; its scoped npm override uses the website's patched Next.js version. Recheck the preview and dependency audit when upgrading either package.

### Template verification

Run the focused rendered-content and mocked-delivery checks:

```sh
node --import ./scripts/register-server.mjs --test src/features/subscriptions/preference-email.test.mjs src/features/contact/server/send-contact-message.test.mjs src/features/subscriptions/server/resend-coordination.test.mjs src/app/api/subscription-flow.test.mjs
```

Review both templates in all three languages at desktop and narrow widths. Check headings, action destinations, long content, line breaks and HTML escaping. Tests also cover plain text, Reply-To, idempotency, asynchronous rendering failure and concurrent retries. Local rendering does not establish Gmail, Outlook or Apple Mail inbox compatibility; real test sends require separate authorization.

## Receiving

Contact-form delivery uses the server-only [contact configuration](../src/features/contact/server/contact-config.ts). On 2026-10-02, the owner confirmed `contact@mail.modernfundamentalanalyst.com` can receive mail and approved committing it publicly. `CONTACT_TO_EMAIL` is no longer read; recipient changes now require code review and deployment. This owner confirmation is not a delivery test performed by the workspace checks. Resend Receiving alone does not establish a mailbox or forwarding destination.

The project owner confirmed on 2026-09-22 that Receiving is enabled for `mail.modernfundamentalanalyst.com`. The domain has transferred to Vercel; maintain Resend's required receiving MX and sending/verification records in the authoritative DNS zone. Retrieve exact records from Resend rather than hard-coding provider DNS values here. See [domain ownership](TECHNICAL_ARCHITECTURE.md#domain-and-service-ownership).

Receiving is a provider capability, not an application inbox or automatic forwarding rule. The existing `/api/webhooks/resend` handler processes only `email.bounced`, `email.complained`, and `email.suppressed`; other signed events, including `email.received`, are acknowledged without processing their contents. Do not use this endpoint as an inbound-mail processor. An inbound workflow requires a separately designed handler and event subscription before it can retrieve, store or forward messages.

Keep `CONTACT_TO_EMAIL` set to the intended recipient of website contact-form messages. Enabling Receiving does not change that destination, sender addresses, or the existing webhook signing secret. No new environment variable is required for provider-only receiving. Actual inbound delivery has not been verified by this repository update.

## Preference display

A valid preference token allows a server-side contact lookup. The form displays the saved `preferred_language`, independently of the page language. The provider lookup runs beneath a localized loading boundary. Language navigation retains the validated preference token and does not copy unrelated query parameters. Missing, unknown or unavailable values require an explicit language selection before saving; unsubscribe remains available. Editing the selection clears the previous success message. Email identity inputs are trimmed and lowercased without truncation; overlong addresses are rejected before provider operations.

## Request reliability

`UPSTASH_KV_REST_API_URL` and the read/write `UPSTASH_KV_REST_API_TOKEN` are required for subscriber mutations and preference-link requests. Unlike rate limiting, these operations fail with a retryable error if Redis is unavailable. No live email is sent by the unit tests.

Preference requests store the complete email payload for 25 hours using atomic `SET NX`, covering Resend's 24-hour deduplication window plus a delay before the initial send. Retries reuse the original encrypted link, text, HTML and provider idempotency key. Changing the input under the same key returns 409. After 25 minutes, a fresh submission ID is required so users do not receive a nearly expired 30-minute link. The form resets its ID on that response. Redis records contain the recipient and email content; use the existing authenticated TLS connection and restrict database access.

Before a retry, the application validates the stored record's age, email fields and recipient. A malformed or mismatched record fails closed without sending an email; it is not overwritten under the same idempotency key.

Subscribe, preference updates and unsubscribe webhooks share a per-email Redis lease. Contention returns a retryable failure instead of performing overlapping writes. Each Resend HTTP call has an 8-second abort deadline; a subscriber operation has a shared 20-second deadline. The browser allows 45 seconds for service work and Redis overhead.

Once a provider mutation has started, network errors, server errors and timeouts can leave the outcome unknown. Further provider calls in that operation are stopped, including rollback, and the 120-second lease is retained until expiry. An abort cannot undo a write already accepted by Resend. Subscription and preference-language saves also use a durable journal; follow [subscription reconciliation](UPSTASH_REDIS_INTEGRATION.md#subscription-reconciliation) for blocking behavior, unsubscribe availability and recovery. Webhook failures return 500 for provider retry.

A failed read before any mutation starts does not create an unknown write outcome. Its owned journal and lease can be released, including on a thrown read failure or expired read-only deadline. Cleanup compares the exact Redis record and fails closed if ownership cannot be confirmed. Reads that fail after writes have begun remain conservative; existing unresolved journals are never automatically cleared.

Segment reconciliation reads all pages before changing membership, preserves unrelated segments, and rejects non-progressing cursors. Active subscriptions are rejected with HTTP 409 and the message "You've already subscribed" before any contact, language-segment, or welcome-event writes. The form displays localized duplicate feedback and retains the email for editing. Language changes belong in Email Preferences; previously unsubscribed contacts may subscribe again. Welcome prerequisites are checked before mutation; a definitively rejected welcome restores the previous language property and memberships. Failed rollback is logged and retains the subscriber lease and journal for reconciliation.

## Verification

Follow the [verification commands](../README.md#verification). Coordination tests simulate Redis, provider failures, duplicate requests and aborted fetches without accessing production services. See [review evidence](TECHNICAL_ARCHITECTURE.md#review-evidence) for CI artifact retention.
