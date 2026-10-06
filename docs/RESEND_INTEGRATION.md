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

4. Configure and enable a welcome automation triggered by `subscriber.created`. The application sends `locale`, `memo_title`, `memo_summary`, `memo_url`, and `preferences_url` in its payload; use these in the localized welcome content. The code sends an event rather than the welcome email itself, so a successful event response does not verify automation delivery. Only confirmed new or previously unsubscribed contacts trigger it; active contacts do not. Public signup sends a confirmation email first. At least one memo must exist for the selected locale.
5. Configure a webhook for the deployed `/api/webhooks/resend` endpoint with `email.bounced`, `email.complained`, and `email.suppressed`. Store that endpoint's signing secret as `RESEND_WEBHOOK_SECRET`. The handler verifies the signature and marks affected contacts unsubscribed; unrelated events are acknowledged without contact changes.
6. Use isolated resources and an owned test recipient to verify contact delivery, confirmation and welcome delivery, preference-link requests, language changes and unsubscribe. Confirm webhook processing with a signed provider test event. Local unit tests mock these services and cannot verify Dashboard setup. Confirmation and preference URLs use `SITE_URL` from [src/lib/site-config.ts](../src/lib/site-config.ts), so confirm the destination before testing against an alternate deployment.

## Server secrets

These credentials are independent and must not be merged or reused:

| Variable                          | Owner and purpose                                                                                    | Rotation considerations                                                                                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`                  | Resend API Keys; permits the application's email, contact, segment and event operations.             | Keep provider authentication separate from application cryptography. It remains a legacy decryption fallback for old preference links; check those links before rotation. |
| `RESEND_WEBHOOK_SECRET`           | Signing secret of the configured Resend webhook endpoint.                                            | Must match that endpoint. The handler reads one signing secret; coordinate changes with deployment and verify delivery retries.                                           |
| `SUBSCRIPTION_PREFERENCES_SECRET` | Application-generated secret for existing encrypted preference links and stable Redis identity keys. | Preserve the current value. Journal, consent, suppression and retry records require an explicit migration before rotation.                                                |

Use environment-scoped sensitive variables in Vercel and an uncommitted `.env.local` locally. Never prefix these names with `NEXT_PUBLIC_`. Confirmation emails need no additional secret: their opaque random tokens are looked up by digest, while their coordination still depends on the stable application secret. See [credential and secret rotation](UPSTASH_REDIS_INTEGRATION.md#credential-and-secret-rotation) before changing deployed values. This guide does not verify the current Vercel values or provider settings.

## Email templates and local preview

Contact notifications, preference-link emails and subscription confirmations use React Email. The shared layout owns the brand header, content container and button; domain templates own their content. Templates contain no provider clients, credentials or token-generation logic.

| Responsibility                                          | Source                                                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Shared email layout and button                          | [`email-layout.tsx`](../src/components/email-layout.tsx)                                            |
| Contact HTML and localized labels                       | [`contact-email.tsx`](../src/features/contact/contact-email.tsx)                                    |
| Contact subject, plain text and Reply-To                | [`send-contact-message.ts`](../src/features/contact/server/send-contact-message.ts)                 |
| Contact recipient                                       | [`contact-config.ts`](../src/features/contact/server/contact-config.ts)                             |
| Preference HTML                                         | [`preference-email.tsx`](../src/features/subscriptions/preference-email.tsx)                        |
| Preference subject and three-language copy              | [`preference-email-copy.ts`](../src/features/subscriptions/preference-email-copy.ts)                |
| Preference token, plain text and delivery orchestration | [`request/route.ts`](../src/app/api/subscription-preferences/request/route.ts)                      |
| Fictional Contact previews                              | [`contact/previews/`](../src/features/contact/previews/)                                            |
| Confirmation copy                                       | [`confirmation-copy.ts`](../src/features/subscriptions/confirmation-copy.ts)                        |
| Confirmation token, consent and delivery                | [`subscription-confirmation.ts`](../src/features/subscriptions/server/subscription-confirmation.ts) |
| Fictional preference and confirmation previews          | [`subscriptions/previews/`](../src/features/subscriptions/previews/)                                |

### Preview workflow

After `npm ci`, run:

```sh
npm run email:contact
# In a separate terminal, if needed:
npm run email:preferences
```

Open [localhost:3001](http://localhost:3001) for the three `contact-*` previews; open [localhost:3002](http://localhost:3002) for the three `preferences-*` and three `confirmation-*` previews. `npm run email` remains an alias for the Contact preview. Edit the owning template or shared layout to update its preview. Stop the preview server with Ctrl+C. It can run alongside the website on port 3000.

All nine examples use fictional content, `example.com` addresses and, for link emails, a nonfunctional token. No service credentials are needed. Rendering previews does not send mail; the preview UI's Send action is separate from this workflow. Welcome emails remain owned by the Resend automation.

The preview's generated plain-text view is a rendering aid, not the exact production text payload. Sending paths retain explicit plain text: Contact's operational labels remain English, while preference and confirmation text use the requested locale. Contact's HTML labels follow the submission locale. When changing copy, review HTML and the production text source together.

### Rendering and retries

The preference route awaits HTML rendering inside the initial payload factory, before storing a complete candidate in Redis. A rendering failure creates no partial retry record. Concurrent requests use atomic insertion and reuse the winning stored payload. Existing records, including those created before a template change, retain their original HTML, text and idempotency key; see [request reliability](#request-reliability).

`react-email` provides the runtime components and renderer. The development-only `@react-email/ui` package provides the preview application; its scoped npm override uses the website's patched Next.js version. Recheck the preview and dependency audit when upgrading either package.

### Template verification

Run the focused rendered-content and mocked-delivery checks:

```sh
node --import ./scripts/register-server.mjs --test src/features/subscriptions/preference-email.test.mjs src/features/contact/server/send-contact-message.test.mjs src/features/subscriptions/server/resend-coordination.test.mjs src/app/api/subscription-flow.test.mjs src/features/subscriptions/server/subscription-confirmation.test.mjs
```

Review all three email variants in all three languages at desktop and narrow widths. Check headings, action destinations, long content, line breaks and HTML escaping. Tests also cover plain text, Reply-To, idempotency, asynchronous rendering failure and concurrent retries. Local rendering does not establish Gmail, Outlook or Apple Mail inbox compatibility; real test sends require separate authorization.

## Receiving

Contact-form delivery uses the server-only [contact configuration](../src/features/contact/server/contact-config.ts). On 2026-10-02, the owner confirmed `contact@mail.modernfundamentalanalyst.com` can receive mail and approved committing it publicly. `CONTACT_TO_EMAIL` is no longer read; recipient changes now require code review and deployment. This owner confirmation is not a delivery test performed by the workspace checks. Resend Receiving alone does not establish a mailbox or forwarding destination.

The project owner confirmed on 2026-09-22 that Receiving is enabled for `mail.modernfundamentalanalyst.com`. The domain has transferred to Vercel; maintain Resend's required receiving MX and sending/verification records in the authoritative DNS zone. Retrieve exact records from Resend rather than hard-coding provider DNS values here. See [domain ownership](TECHNICAL_ARCHITECTURE.md#domain-and-service-ownership).

Receiving is a provider capability, not an application inbox or automatic forwarding rule. The existing `/api/webhooks/resend` handler processes only `email.bounced`, `email.complained`, and `email.suppressed`; other signed events, including `email.received`, are acknowledged without processing their contents. Do not use this endpoint as an inbound-mail processor. An inbound workflow requires a separately designed handler and event subscription before it can retrieve, store or forward messages.

Maintain the website contact-form recipient in the server-only contact configuration linked above. Enabling Receiving does not change that destination, sender addresses, or the existing webhook signing secret. No new environment variable is required for provider-only receiving. Actual inbound delivery has not been verified by this repository update.

## Subscription entry points

All three Contact pages place a standard subscription form with the `contact-subscribe` ID before Send a Message; the footer renders the inverse form with the `subscribe` ID. Both compose the same `SubscribeForm` and `SubscribeFormClient`, with distinct field and heading IDs. Each instance owns its input, submission lock, status feedback and retry ID. Submitting one form must not disable, clear or replace feedback in the other. Successful requests ask the reader to check their inbox; they do not claim activation.

Both forms call the same subscription API and share recipient cooldowns, delivery allowances, confirmation records, suppression rules and subscriber coordination. Independent browser state does not bypass those protections. This separation and the specific cooldown values are project decisions, not Resend requirements. The contact-message form remains a separate workflow and does not grant subscription consent.

## Subscription confirmation and delivery feedback

Public signup validates input and requests a confirmation email; it does not activate a contact. The email uses the shared React Email layout, three-language copy and explicit plain text. Its random 256-bit token expires after 24 hours. Opening the localized `/subscription-confirmation` page has no provider side effects; an explicit same-origin POST confirms consent. The original requested email language is stored with the token, independently of the page language.

Redis stores the confirmation under the token's SHA-256 digest, with a bounded lifetime. The record contains the email and locale; the immutable email retry payload also contains the complete link. Restrict database access accordingly. Confirmation runs under the existing subscriber lock and journal. It records the consent time, locale and policy version, consumes the token after success, and cannot reactivate a later-unsubscribed contact on replay. Interrupted `processing` records fail closed; reconcile the journal and provider state before requesting a new confirmation. Never manually reset a processing token to pending after an uncertain write.

Confirmation and preference requests share a recipient-level limit: a 60-second cooldown and three distinct requests per hour, in addition to IP limits. Retries of the same request retain their allowance for the 25-minute retry window. Redis failure blocks delivery. These allowances include failed attempts. An expired confirmation request ID returns 422 so the form can create a new request without displaying the duplicate-subscription message.

Signed bounce, complaint and suppression events persist a separate delivery-suppression marker before updating the contact. Successfully handled event IDs are retained per recipient, so replay cannot repeatedly apply the mutation. Provider failures remain retryable. Public signup and confirmation cannot clear suppression; recovery requires provider reconciliation and an explicit operator decision, not another form submission. Unrelated signed events are acknowledged without Redis access.

Consent, suppression and completed webhook records are durable and have no automatic expiry. Include them in backup, access-control and subscriber-erasure procedures. Suppression takes precedence over consent, including when an old delivery event arrives for the first time. The application does not automatically override provider suppression based on event timestamps.

Welcome delivery is separate from confirmed consent: a rejected or uncertain welcome event retains the `send-welcome-event` journal for reconciliation but does not roll back the subscription. There is no automatic welcome retry worker. A successful event API response still does not prove that the Automation delivered an email. Resolve pending journals through the existing operator workflow; never blindly replay an unknown event.

Confirmation previews (`confirmation-en`, `confirmation-zh-tw`, `confirmation-zh-cn`) are included in `npm run email:preferences`. Existing preference links and the current secret remain unchanged. This release does not migrate keys or add seamless secret rotation.

## Preference display

A valid preference token allows a server-side contact lookup. The form displays the saved `preferred_language`, independently of the page language. The provider lookup runs beneath a localized loading boundary. Language navigation retains the validated preference token and does not copy unrelated query parameters. Missing, unknown or unavailable values require an explicit language selection before saving; unsubscribe remains available. Editing the selection clears the previous success message. Email identity inputs are trimmed and lowercased without truncation; overlong addresses are rejected before provider operations.

## Request reliability

`UPSTASH_KV_REST_API_URL` and the read/write `UPSTASH_KV_REST_API_TOKEN` are required for subscriber mutations and preference-link requests. Only IP rate limiting has an in-process fallback. Recipient delivery allowances, confirmation and subscriber mutations fail closed if Redis is unavailable. No live email is sent by the unit tests.

Preference requests store the complete email payload for 25 hours using atomic `SET NX`, covering Resend's 24-hour deduplication window plus a delay before the initial send. Retries reuse the original encrypted link, text, HTML and provider idempotency key. Changing the input under the same key returns 409. After 25 minutes, a fresh submission ID is required so users do not receive a nearly expired 30-minute link. The form resets its ID on that response. Redis records contain the recipient and email content; use the existing authenticated TLS connection and restrict database access.

Before a retry, the application validates the stored record's age, email fields and recipient. A malformed or mismatched record fails closed without sending an email; it is not overwritten under the same idempotency key.

Subscribe, preference updates and unsubscribe webhooks share a per-email Redis lease. Contention returns a retryable failure instead of performing overlapping writes. Each Resend HTTP call has an 8-second abort deadline; a subscriber operation has a shared 20-second deadline. The browser allows 45 seconds for service work and Redis overhead.

Once a provider mutation has started, network errors, server errors and timeouts can leave the outcome unknown. Further provider calls in that operation are stopped, including rollback, and the 120-second lease is retained until expiry. An abort cannot undo a write already accepted by Resend. Subscription and preference-language saves also use a durable journal; follow [subscription reconciliation](UPSTASH_REDIS_INTEGRATION.md#subscription-reconciliation) for blocking behavior, unsubscribe availability and recovery. Webhook failures return 500 for provider retry.

A failed read before any mutation starts does not create an unknown write outcome. Its owned journal and lease can be released, including on a thrown read failure or expired read-only deadline. Cleanup compares the exact Redis record and fails closed if ownership cannot be confirmed. Reads that fail after writes have begun remain conservative; existing unresolved journals are never automatically cleared.

Segment reconciliation reads all pages before changing membership, preserves unrelated segments, and rejects non-progressing cursors. Active subscriptions are rejected with HTTP 409 and the message "You've already subscribed" before any contact, language-segment, or welcome-event writes. The form displays localized duplicate feedback and retains the email for editing. Language changes belong in Email Preferences; previously unsubscribed contacts must confirm again, and delivery-suppressed contacts require operator review. Welcome prerequisites are checked before mutation. Language-segment failures retain the existing rollback protection; welcome delivery failures preserve confirmed consent and retain the journal for reconciliation.

## Verification

For affected UI workflows, run `npx playwright test src/features/subscriptions/subscription-confirmation.spec.ts src/app/_components/contact-subscription.spec.ts src/app/_components/portfolio-form-status.spec.ts --project=chromium --project=webkit --workers=2`. The configured server uses isolated provider settings; browser requests are mocked. Service tests cover confirmation, replay, expiry, consent, suppressed delivery, recipient allowances and journal recovery. Redis command behavior is mocked in these tests; this does not establish live Redis durability or provider delivery.

Before releasing, check the target sender/domain, Automation event and content, unsubscribe controls, webhook URL/signing secret/event subscriptions, and Redis persistence. Keep current secrets and records. Obtain separate authorization for real recipient tests; do not treat local passing tests as proof of Dashboard configuration or production delivery.

Follow the [verification commands](../README.md#verification). Coordination tests simulate Redis, provider failures, duplicate requests and aborted fetches without accessing production services. See [review evidence](TECHNICAL_ARCHITECTURE.md#review-evidence) for CI artifact retention.
