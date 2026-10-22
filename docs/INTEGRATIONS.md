# Integrations

Use this guide to configure and operate Vercel/DNS, Resend, Upstash Redis, Stripe and Sentry. It describes repository behavior and dated provider observations. It does not verify current cloud settings, inbox delivery, telemetry ingestion or payment outcomes.

## Operational boundaries

Use [.env.example](../.env.example) for variable names. Store environment-scoped secrets in Vercel and local credentials in ignored `.env.local`. Never commit or print credentials. [Architecture](WEB_APPLICATION_ARCHITECTURE.md) defines application boundaries; [Design System](DESIGN_SYSTEM.md) defines UI contracts. Published portfolio data stays in the workspace.

Routine tests mock provider I/O. Deployment does not authorize real emails, subscriber changes, payments or unrelated cloud changes. Preserve credentials and durable records through rollback windows. When a write's outcome is unknown, reconcile it before retrying or clearing records.

| Task                                        | Start here                                                                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Domain and hosting                          | [Vercel and DNS](#vercel-and-dns); [release gate](WEB_APPLICATION_ARCHITECTURE.md#production-gate)                           |
| Sending, receiving, consent and preferences | [Resend](#resend), [server secrets](#server-secrets), [verification](#resend-verification)                                   |
| Redis configuration and recovery            | [Upstash Redis](#upstash-redis), [reconciliation](#subscription-reconciliation), [rotation](#credential-and-secret-rotation) |
| Checkout and payment verification           | [Stripe](#stripe), [environment verification](#environment-verification-checklist)                                           |
| Errors, traces, logs, metrics and Replay    | [Sentry](#sentry)                                                                                                            |

## Vercel and DNS

The owner reported the domain transfer from Wix to Vercel on 2026-09-22. Manage `modernfundamentalanalyst.com` through Vercel, and verify authoritative nameservers before changing DNS. `SITE_URL` in [site-config.ts](../src/lib/site-config.ts) remains `https://www.modernfundamentalanalyst.com`; a registrar transfer does not require URL changes.

Preserve root and `www` website records and Resend verification, sending and receiving records for `mail.modernfundamentalanalyst.com`. Obtain exact values from current dashboards. A registrar transfer does not prove a nameserver change. See [Receiving](#receiving) and [Checkout](#checkout-behavior) for separate service settings. Owner reports are not live DNS or delivery checks.

Follow the [release workflow](WEB_APPLICATION_ARCHITECTURE.md#release-workflow) for hosting and CI gating. Confirm the target environment and current provider state before changing DNS or credentials.

## Resend

### Environment setup

Configure resources in the Resend account for the target environment. Repository configuration does not establish Dashboard state.

1. Verify the sending domain `mail.modernfundamentalanalyst.com` in Resend. The sender constants in [src/lib/resend.ts](../src/lib/resend.ts) use `contact@` for contact messages and `updates@` for preference links. If using another domain, update those constants as well as the provider configuration.
2. Configure server variables from [.env.example](../.env.example): `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `SUBSCRIPTION_PREFERENCES_SECRET`, `UPSTASH_KV_REST_API_URL`, and `UPSTASH_KV_REST_API_TOKEN`. Use an API key that permits the email, contact, segment and event operations in this application. Keep the preference secret stable; see [credential and secret rotation](#credential-and-secret-rotation).
3. Create a text contact property named `preferred_language` and three language segments. Set the matching `RESEND_SEGMENT_*` variables below. The default IDs in the code and environment template refer to this project's existing resources; override all three when using another account or isolated test resources.

| Locale  | Exact `preferred_language` value | Segment variable       |
| ------- | -------------------------------- | ---------------------- |
| `en`    | `English`                        | `RESEND_SEGMENT_EN`    |
| `zh-tw` | `繁體中文`                       | `RESEND_SEGMENT_ZH_TW` |
| `zh-cn` | `简体中文`                       | `RESEND_SEGMENT_ZH_CN` |

Use these exact provider values. [`localeConfig` in `src/lib/i18n.ts`](../src/lib/i18n.ts) defines them; update this table if the labels change.

4. Configure and enable a welcome automation triggered by `subscriber.created`. The application sends `locale`, `memo_title`, `memo_summary`, `memo_url`, and `preferences_url` in its payload; use these in the localized welcome content. The code sends an event rather than the welcome email itself, so a successful event response does not verify automation delivery. Only confirmed new or previously unsubscribed contacts trigger it; active contacts do not. Public signup sends a confirmation email first. At least one memo must exist for the selected locale.
5. Configure a webhook for the deployed `/api/webhooks/resend` endpoint with `email.bounced`, `email.complained`, and `email.suppressed`. Store that endpoint's signing secret as `RESEND_WEBHOOK_SECRET`. The handler verifies the signature and marks affected contacts unsubscribed; unrelated events are acknowledged without contact changes.
6. Use isolated resources and an owned test recipient to verify contact delivery, confirmation and welcome delivery, preference-link requests, language changes and unsubscribe. Confirm webhook processing with a signed provider test event. Local unit tests mock these services and cannot verify Dashboard setup. Confirmation and preference URLs use `SITE_URL` from [src/lib/site-config.ts](../src/lib/site-config.ts), so confirm the destination before testing against an alternate deployment.

### Domain authentication status

On October 12, 2026, Vercel's authoritative zone and a public resolver returned this organizational-domain record:

```text
_dmarc.modernfundamentalanalyst.com
v=DMARC1; p=none; rua=mailto:contact@mail.modernfundamentalanalyst.com;
```

It also applies to the mail subdomain while no separate policy exists. `p=none` requests monitoring, not quarantine or rejection. Reports use the owner's confirmed receiving address. Review received-message authentication and aggregate reports before tightening the policy; see [Resend's rollout guidance](https://resend.com/docs/dashboard/domains/dmarc). A published record does not prove delivery or report receipt.

### Server secrets

These credentials are independent and must not be merged or reused:

| Variable                          | Owner and purpose                                                                                    | Rotation considerations                                                                                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`                  | Resend API Keys; permits the application's email, contact, segment and event operations.             | Keep provider authentication separate from application cryptography. It remains a legacy decryption fallback for old preference links; check those links before rotation. |
| `RESEND_WEBHOOK_SECRET`           | Signing secret of the configured Resend webhook endpoint.                                            | Must match that endpoint. The handler reads one signing secret; coordinate changes with deployment and verify delivery retries.                                           |
| `SUBSCRIPTION_PREFERENCES_SECRET` | Application-generated secret for existing encrypted preference links and stable Redis identity keys. | Preserve the current value. Journal, consent, suppression and retry records require an explicit migration before rotation.                                                |

Store these as sensitive, environment-scoped Vercel variables or in ignored `.env.local`. Never use `NEXT_PUBLIC_` prefixes. Confirmation tokens use digest lookup and need no additional secret; coordination still needs the stable application secret. Follow [rotation procedures](#credential-and-secret-rotation) before changing values.

### Email templates and local preview

#### Email presentation

Email uses [`email-layout.tsx`](../src/components/email-layout.tsx), React Email components, compatible inline styles and pixel dimensions. Keep the email font stack `Inter, Arial, Helvetica, sans-serif`, existing text colors and brand period. Website Jost and responsive CSS do not apply to inboxes.

The native body and presentation table retain language and direction when clients strip document attributes.

Use one primary heading, the correct language, descriptive actions and plain text. Render user content as React text, never raw HTML. Production copy stays with its feature; fictional previews stay in `previews/`. Review all locales and narrow layouts when changing the shared layout.

Contact, preference and confirmation templates share the brand header, container and button. Features own their content. Templates contain no provider clients, credentials or token-generation logic.

| Responsibility                                          | Source                                                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Shared email layout and button                          | [`email-layout.tsx`](../src/components/email-layout.tsx)                                            |
| Contact HTML and localized labels                       | [`contact-email.tsx`](../src/features/contact/contact-email.tsx)                                    |
| Contact subject, plain text and Reply-To                | [`send-contact-message.ts`](../src/features/contact/server/send-contact-message.ts)                 |
| Contact recipient                                       | [`contact-config.ts`](../src/features/contact/server/contact-config.ts)                             |
| Preference HTML                                         | [`preference-email.tsx`](../src/features/subscriptions/preference-email.tsx)                        |
| Preference subject and three-language copy              | [`preference-email-copy.ts`](../src/features/subscriptions/preference-email-copy.ts)                |
| Preference token, plain text and delivery orchestration | [`request-preference-link.ts`](../src/features/subscriptions/server/request-preference-link.ts)     |
| Fictional Contact previews                              | [`contact/previews/`](../src/features/contact/previews/)                                            |
| Confirmation copy                                       | [`confirmation-copy.ts`](../src/features/subscriptions/confirmation-copy.ts)                        |
| Confirmation token, consent and delivery                | [`subscription-confirmation.ts`](../src/features/subscriptions/server/subscription-confirmation.ts) |
| Fictional preference and confirmation previews          | [`subscriptions/previews/`](../src/features/subscriptions/previews/)                                |

The layout sets locale and left-to-right direction on the document, body and outer table. The three published welcome templates were updated and read back on October 12, 2026 with these attributes; their copy, variables and plain text were preserved.

#### Preview workflow

After `npm ci`, run:

```sh
npm run email:contact
# In a separate terminal, if needed:
npm run email:preferences
```

Open [localhost:3001](http://localhost:3001) for three Contact previews and [localhost:3002](http://localhost:3002) for three preference and three confirmation previews. `npm run email` aliases Contact previews. Edit the owning template or shared layout; stop with Ctrl+C. Both can run beside the website on port 3000.

All nine previews use fictional content, `example.com` addresses and nonfunctional tokens. They need no credentials. Rendering does not send email; the UI's Send action is separate. Resend automation owns welcome emails.

Preview-generated plain text is not the production payload. Production text is explicit: Contact's operational labels are English; preference and confirmation text use the requested locale. Contact HTML labels use the submission locale. Review HTML and production text together.

#### Rendering and retries

The preference service renders HTML before storing a complete retry payload. Rendering failure leaves no partial record. Atomic insertion selects one payload for concurrent requests. Retries retain its HTML, text, link and idempotency key, even after template changes. See [request reliability](#request-reliability).

`react-email` supplies components and rendering. Development-only `@react-email/ui` supplies previews; its scoped override uses the site's patched Next.js version. Recheck previews and the dependency audit after upgrades.

#### Template verification

Run the focused rendered-content and mocked-delivery checks:

```sh
node --import ./scripts/register-server.mjs --test src/features/subscriptions/preference-email.test.mjs src/features/contact/server/send-contact-message.test.mjs src/features/subscriptions/server/resend-coordination.test.mjs src/app/api/subscription-flow.test.mjs src/features/subscriptions/server/subscription-confirmation.test.mjs
```

Review Contact, preference and confirmation emails in all three languages at desktop and narrow widths. Check headings, links, long content, wrapping and escaping. Tests cover plain text, Reply-To, idempotency, failed rendering and concurrent retries. Local rendering does not prove email-client compatibility. Real test sends require authorization.

### Receiving

Contact sends to the server-only [contact configuration](../src/features/contact/server/contact-config.ts). On 2026-10-02, the owner confirmed `contact@mail.modernfundamentalanalyst.com` receives mail and approved its publication. Recipient changes require code review and deployment; `CONTACT_TO_EMAIL` is no longer read. This is owner-reported, not a workspace delivery test.

The owner confirmed Receiving for `mail.modernfundamentalanalyst.com` on 2026-09-22. Preserve its MX and sending/verification records in the authoritative zone; obtain exact records from Resend. See [domain ownership](#vercel-and-dns).

Receiving alone provides neither an application inbox nor automatic forwarding. `/api/webhooks/resend` handles only signed bounce, complaint and suppression events. It acknowledges `email.received` and other events without processing content. Design a separate handler and event subscription before retrieving, storing or forwarding inbound mail.

Receiving does not change the Contact recipient, senders or webhook secret. Provider-only receiving needs no new environment variable. This repository update did not verify inbound delivery.

### JavaScript form availability

Contact, subscription signup, preference-link request, preference update and subscription confirmation forms use `ClientForm`. Their native fieldsets stay disabled until hydration attaches the submission handler. Without JavaScript, a localized notice explains that the information has not been sent. The forms explicitly use POST as a fallback safeguard; no personal fields are submitted through a default GET, and native GET submission cannot discard preference or confirmation tokens. Notices use the page language, independently of the saved subscription language. The preference lookup also includes the notice in its streaming fallback, so readers without JavaScript receive instructions while the completed form remains outside the main content. Their existing JSON API contracts remain unchanged. Support retains its independent native POST workflow.

### Contact draft recovery

Contact's client and API share field validation. Whitespace-only names and subjects, invalid email addresses and messages shorter than ten characters after trimming are rejected before delivery. The client associates localized inline errors with each field and focuses the first invalid field. An HTTP 400 response focuses a validation summary; service failures retain separate retry guidance. Neither failure clears the draft or a valid attempt's retry identity.

Contact stores unsent fields and the failed attempt's retry ID in versioned, locale-specific `sessionStorage`. This supports reload and navigation recovery within the tab. Editing starts a new attempt; confirmed success clears only the matching draft, preserving newer edits. Never store the honeypot or share drafts across locales or form types. Submission must work without storage. Draft restoration fills only unchanged default fields; browser-restored or autofilled values take precedence. A merged draft that differs from the saved attempt loses that attempt ID.

### Subscription entry points

Each Contact page places `contact-subscribe` before Send a Message; Footer uses `subscribe`. Both compose `SubscribeForm` and `SubscribeFormClient` with unique field and heading IDs. Each owns its input, lock, feedback and retry ID. Submitting one must not affect the other. Success asks readers to open the confirmation email to finish subscribing; it does not claim activation.

Both forms share the API, recipient limits, confirmation, suppression and coordination rules. Independent browser state does not bypass them. These limits and form choices are project decisions, not Resend requirements. Contact messages do not grant newsletter consent.

Subscription and preference-link request forms use the API's shared email validator before sending. Invalid input and HTTP 400 responses show a localized, associated email error and focus the enabled field. Editing clears the error and starts a new attempt; retrying unchanged input after a server rejection retains its retry ID. Service failures keep separate feedback. Preference-link success remains identical whether or not the address is subscribed. It conditionally directs subscribed readers to their inbox without asserting that a link was sent or delivered. Keep this service-state boundary when applying the [content design workflow](DESIGN_SYSTEM.md#content-design-workflow).

### Subscription confirmation and delivery feedback

Signup validates input and sends a confirmation email; it does not activate a contact. The email uses React Email, localized copy and explicit plain text. Its random 256-bit token expires after 24 hours. Opening `/subscription-confirmation` has no provider side effects. Consent requires a same-origin POST and retains the originally requested email language, independent of page language.

Redis stores the token's SHA-256 digest with a bounded lifetime. The record contains email and locale; the immutable retry payload includes the full link. Restrict access.

Confirmation holds the subscriber lock and writes a journal. It records consent time, locale and policy version, consumes the token after success, and cannot reactivate a later-unsubscribed contact on replay. A token left in `processing` fails closed: reconcile its journal and provider state, then request a new confirmation. Never reset it to pending after an uncertain write.

Confirmation and preference requests share a 60-second recipient cooldown and three distinct requests per hour, plus IP limits. Failed attempts consume allowance. Same-ID retries retain allowance for 25 minutes. Redis failure blocks delivery. Expired confirmation request IDs return 422, allowing a new ID without duplicate-subscription feedback.

Signed bounce, complaint and suppression events persist suppression before updating the contact. Completed event IDs are retained per recipient to prevent repeated mutation. Provider failures remain retryable. Signup and confirmation never clear suppression; recovery requires provider reconciliation and an explicit operator decision. Unrelated signed events are acknowledged without Redis access.

Consent, suppression and completed webhook records do not expire automatically. Include them in backups, access controls and erasure procedures. Suppression overrides consent, including the first arrival of an old event; timestamps do not automatically override provider suppression.

Welcome delivery is independent of consent. A rejected or uncertain welcome event leaves the contact subscribed and retains a `send-welcome-event` journal. There is no automatic replay worker. A successful API event response does not prove automation delivery. Reconcile before clearing a journal; never replay an unknown event blindly.

The `confirmation-en`, `confirmation-zh-tw` and `confirmation-zh-cn` previews run with `npm run email:preferences`. Existing preference links and secrets remain unchanged. No key migration or seamless secret rotation is provided. Journal and confirmation records are parsed as unknown data and validated before use. Invalid journals block reconciliation and remain untouched; legacy journals without an operation field remain readable. Invalid confirmations cannot activate a subscription.

### Preference display

A valid preference token permits a server contact lookup under a localized loading boundary. The form shows saved `preferred_language`, independent of page language. Language links retain only the validated token.

Missing, unknown or unavailable values require a language selection before saving; unsubscribe remains available. Editing clears prior success feedback. Email identities are trimmed and lowercased; reject overlong values rather than truncating them.

### Request reliability

The [request route](../src/app/api/subscription-preferences/request/route.ts) validates HTTP input and maps responses. The [feature service](../src/features/subscriptions/server/request-preference-link.ts) owns recipient limits, immutable payloads, contact lookup, rendering and sending. Existing and missing contacts receive the same public success response; missing contacts receive no email.

Subscriber mutations and preference requests require `UPSTASH_KV_REST_API_URL` and a read/write `UPSTASH_KV_REST_API_TOKEN`. Only IP limits have an in-process fallback. Recipient limits, confirmation and mutations fail closed without Redis. Unit tests send no live email.

Preference requests atomically store a complete payload with `SET NX` for 25 hours: Resend's 24-hour deduplication window plus initial-send delay. Retries reuse the original encrypted link, text, HTML and provider key. Changed input under the same key returns 409.

After 25 minutes, require a new submission ID to avoid sending a nearly expired 30-minute link. The form resets its ID. Records contain recipient and content; use authenticated TLS and restricted access.

Before retrying, validate record age, email fields and recipient. Malformed or mismatched records fail closed without delivery or replacement under the same key.

Subscribe, preference updates and unsubscribe webhooks share a per-email lease. Contention is retryable and prevents overlapping writes.

| Deadline                                         | Duration    |
| ------------------------------------------------ | ----------- |
| Resend HTTP call                                 | 8 seconds   |
| Subscriber operation                             | 20 seconds  |
| Browser request, including coordination overhead | 45 seconds  |
| Subscriber lease                                 | 120 seconds |

After a mutation starts, network errors, server errors or timeouts leave the outcome unknown. Stop further provider calls, including rollback, and retain the lease until expiry. Abort cannot undo an accepted write. Subscription and language saves retain durable journals; follow [reconciliation](#subscription-reconciliation). Webhook failures return 500 for provider retry. Automatic retries are finite; follow [webhook recovery](#webhook-recovery).

A failed read before mutation is not an unknown write. Cleanup may release its owned journal and lease, even after a thrown read or expired deadline, using exact-value ownership checks. Fail closed if ownership is uncertain. Failures after writes remain conservative; never clear a pre-existing unresolved journal automatically.

Read all segment pages before changing membership. Preserve unrelated segments and reject non-progressing cursors.

Active subscriptions return 409 with "You've already subscribed" before contact, segment or welcome writes. Localized feedback keeps the email editable. Use Preferences for language changes; previously unsubscribed contacts must reconfirm, and suppressed contacts need operator review.

Check welcome prerequisites before mutation. Keep rollback protection for segment failures. Welcome failure preserves consent and leaves a journal.

### Webhook recovery

[Resend retries and replays](https://resend.com/docs/webhooks/retries-and-replays) defines automatic delivery, endpoint disabling and manual replay. Retry delays are relative to the preceding failed attempt: immediate, 5 seconds, 5 minutes, 30 minutes, 2 hours, 5 hours, 10 hours and another 10 hours. Persistently failing endpoints can be disabled automatically; Resend emails the team. Disabled or removed endpoints receive no delivery attempts. Inspect each message's delivery history and next retry instead of assuming retries continue indefinitely.

Use this procedure for incoming bounce, complaint and suppression feedback. It does not authorize resending welcome events or email.

1. **Scope the incident.** Confirm the Resend account, endpoint URL, deployment and Redis database. Record the outage window, affected event IDs, delivery failures and endpoint status. Check the team's notification email. Do not record signing secrets, message bodies or recipient addresses in the incident report.
2. **Repair the cause.** Check routing, the endpoint's signing secret, subscribed events, Redis availability and provider failures. Preserve signature verification, suppression records, completed event IDs and uncertain-write journals. An expired lease is not proof that a provider write failed.
3. **Restore delivery.** Verify the repaired endpoint can process a valid signed delivery. If disabled, re-enable it in the Resend Webhooks dashboard. Re-enabling alone does not establish that missed events were recovered.
4. **Recover missed feedback.** In Webhooks, select the endpoint, open each affected message and choose **Replay**. Inventory the outage window and replay failed or unprocessed feedback, preserving the original event identity through the provider's replay mechanism. Do not routinely replay successful messages. Use existing duplicate handling when a replay follows an uncertain response; investigate unresolved provider state using [subscription reconciliation](#subscription-reconciliation).
5. **Verify completion.** For each relevant recipient, confirm a successful delivery response, durable suppression, the expected unsubscribed contact state or accepted missing-contact result, and the completed webhook record. A 2xx for an unrelated event is not evidence of suppression. Confirm a subsequent delivery succeeds without manual replay. Preserve unresolved journals and record any unavailable events or reconciliation gaps; do not declare recovery complete while these remain unexplained.

When delivery history cannot cover the incident window, reconcile available Resend feedback and contact state before allowing affected recipients to receive email. Missing evidence never clears suppression or grants consent. Coordinate replay with [Redis restoration](#backup-and-restore) so completed events and suppression are not lost during cutover.

### Resend verification

For shared email layout or preference-link orchestration changes, run this focused mocked-provider and rendering check:

```sh
node --import ./scripts/register-server.mjs --test src/features/subscriptions/preference-email.test.mjs src/features/subscriptions/server/request-preference-link.test.mjs src/features/contact/server/send-contact-message.test.mjs
```

Rendering tests cover all nine localized previews, escaping, plain text and inner language/direction attributes after outer attributes are removed. They do not establish compatibility with every client.

For affected UI workflows, run `npx playwright test src/features/subscriptions/subscription-confirmation.spec.ts src/app/_components/contact-subscription.spec.ts src/app/_components/portfolio-form-status.spec.ts --project=chromium --project=webkit --workers=2`. The configured server uses isolated provider settings; browser requests are mocked. Service tests cover confirmation, replay, expiry, consent, suppressed delivery, recipient allowances and journal recovery. Redis command behavior is mocked in these tests; this does not establish live Redis durability or provider delivery.

Before release, verify the target sender/domain, welcome automation, unsubscribe controls, webhook URL, signing secret, subscribed events and Redis persistence. Preserve existing secrets and records. Obtain authorization for real recipient tests; local checks do not prove provider setup or delivery.

Follow the [verification commands](../README.md#verification). Coordination tests simulate Redis, provider failures, duplicate requests and aborted fetches without accessing production services. See [review evidence](WEB_APPLICATION_ARCHITECTURE.md#review-evidence) for CI artifact retention.

## Upstash Redis

### Redis runtime

Use one `@upstash/redis` REST client per Node.js process. Set `UPSTASH_KV_REST_API_URL` to the existing database's HTTPS endpoint and `UPSTASH_KV_REST_API_TOKEN` to its read/write token. The app no longer reads TCP `UPSTASH_REDIS_URL` or maintains socket readiness, reconnects, queues or shutdown.

Each request gets a fresh five-second deadline. Disable SDK retries and automatic pipelining: a lost response must not replay `INCR`, lease acquisition or another uncertain write. Disable automatic JSON deserialization because records and Lua ownership checks use raw strings. Preserve key prefixes, hashing, lease TTLs and journal formats.

Send every command through `executeRedisCommand`. Failure discards the cached client and starts a 30-second cooldown. An old client's late failure cannot suspend its replacement. Bounded, throttled logs omit endpoints, tokens, arguments and private payloads.

IP limits fall back to a bounded process-local counter that also tracks healthy Redis requests, preventing a fresh local allowance on failure. It cannot enforce a cross-instance limit.

Recipient limits, confirmation, mutations and retry-payload storage fail closed. A timeout does not prove a write failed; retain unresolved journals and let uncertain leases expire.

#### Transport cutover

Use this procedure only for environments still serving TCP code. For REST environments, verify the deployed revision and endpoint/token first. Repository configuration does not prove live database state.

1. Obtain the existing database's REST endpoint and read/write token through the provider's secret settings. Configure the single pair above in the target environment before releasing this code. Do not create another database or use a read-only token.
2. Keep `SUBSCRIPTION_PREFERENCES_SECRET` identical. New REST and old TCP deployments must address the same database, raw records and lock protocol. Check an existing journal and representative lease/retry operations with isolated test fixtures; real subscriber writes require authorization.
3. Keep the old deployment and TCP setting through the rollback window. Verify the released version, Redis availability and existing journal readability before removing the unused TCP variable. Changing workspace transport code alone does not configure Vercel or mutate the database.

#### Rate-limit identities

Derive IP identity keys by purpose-specific HMAC from stable `SUBSCRIPTION_PREFERENCES_SECRET`. No separate rate-limit secret is read. The Redis key matches the REST implementation's original primary counter. Lua increments it atomically and sets expiry only on first use, preserving a fixed window. Redis stores no raw IP.

A direct upgrade from separate legacy hashing starts a new counter window; old counters cannot be located without the old secret and expire naturally. This is a one-time reset, not a migration that preserves allowance. Keep the primary secret stable for subsequent identity and journal continuity.

#### Access controls

The owner declined a Free Tier upgrade on 2026-09-22. Recheck the current plan before proposing ACL changes; no upgrade or ACL change is implied here.

Where supported, restrict the app user to `~mfa:*` and `+get +set +del +eval +incr +pexpire +exists +expire`, including commands used by Lua. Do not grant administrative commands or `+@all`. Generate a REST token with the documented `ACL RESTTOKEN` procedure, and test allowed and denied operations before cutover. Keep credentials out of Git and logs. See [REST authentication and ACL](https://upstash.com/docs/redis/features/restapi).

Tests mock HTTP or in-memory records. They cover raw JSON, command arguments, fresh deadlines, disabled write retries, cooldown, late failures, fallback counters and recovery. They never connect to production.

### Stored data and access

The subscription journal has no plaintext email or preference token and retains unresolved records without expiry; see [subscription reconciliation](#subscription-reconciliation) for its fields and recovery procedure.

Preference and confirmation email retry records are separate: they contain the sender, recipient, subject, original encrypted preference link or opaque confirmation link, email text and HTML for up to 25 hours. The same request ID can retrieve its original payload for 25 minutes; the record remains afterward so that reusing an old ID cannot create a fresh payload during the provider's deduplication window. The request key is reused as the provider idempotency key; it is not stored in the payload. Treat these records as sensitive, restrict Redis access, and follow [Resend request reliability](#request-reliability) for retry behavior.

### Subscription reconciliation

Subscription and language saves journal before provider operations. The key hashes the email with the application secret; the value records UUID, operation type, start time, locale and phase. Older records without a type remain valid. Journals contain no plaintext email or preference token.

Clear a record only after known completion, compensation, or a handled pre-mutation failure with exact-value ownership. Unknown writes, failed rollback, interrupted mutations or termination before cleanup leave records without expiry. Never clear pre-existing journals automatically.

Unresolved records block further subscription and language writes after lease expiry. Unsubscribe still holds the lock, bypasses the journal gate and preserves the record.

Use the affected deployment's environment and stable `SUBSCRIPTION_PREFERENCES_SECRET`. Journals require Redis persistence and a non-evicting database; they do not replace the [backup and restore procedure](#backup-and-restore). The CLI hashes email with the current secret. Changing it first makes old journals undiscoverable through that CLI.

1. Run `npm run subscription:journal -- status EMAIL` to inspect the operation ID and phase.
2. Inspect the contact, language segments and welcome event in Resend. Reconcile the intended state there. A missing response is not evidence that an event was not sent. Never resend an ambiguous welcome event automatically.
3. After confirming the provider state, run `npm run subscription:journal -- resolve EMAIL OPERATION_ID`. Resolution takes the subscriber lock and compares the journal ID before clearing it. It does not modify Resend or send email. An active lease requires waiting for its expiry first.
4. If activation is still needed, the reader can request a fresh confirmation after reconciliation. If already subscribed, use preferences to manage the subscription; another public signup does not retry the welcome event. Resolving a journal neither resets a consumed/processing token nor clears suppression.

There is no automatic replay worker. Reconcile uncertain outcomes manually. Redis failure before mutation blocks work; mid-operation failure leaves the prewritten journal. Use deployment logs and the reader-supplied email to locate it.

### Backup and restore

Follow [Upstash Backup and Restore](https://upstash.com/docs/redis/features/backup) for provider operations. Backups can be restored to another database in the same account or team. **Restoring deletes all existing data in the target database.** Normal Redis commands continue during backup; a backup does not pause application writes. Persistence is not a recovery copy.

The steps below are project recovery requirements, not evidence that production backups are enabled or that a restore drill has passed. Verify current plan support, backup availability and retention before relying on them.

#### Establish backup coverage

1. Confirm the account, team, environment and database. In the database's **Backups** tab, inspect **Daily Backup**, retained snapshots and their timestamps and sizes. Choose retention that covers the agreed recovery window; record the maximum acceptable data loss and downtime. Verify scheduled backups actually appear.
2. Before a planned migration, use **Backup & Export → Backup** to create a manual backup and confirm it completes. Restrict access to backups as carefully as the live database: they can contain email payloads, links and subscriber state.
3. Inventory durable consent, suppression, completed webhook IDs and unresolved journals, plus transient confirmation tokens, leases, rate limits and retry payloads. Keep the matching application version and secret configuration available through the secret manager; never copy secrets into backup reports. A backup without the correct `SUBSCRIPTION_PREFERENCES_SECRET` may leave hashed records inaccessible to application workflows.
4. Keep destructive [eviction](https://upstash.com/docs/redis/features/eviction) disabled. Monitor capacity and rejected writes rather than enabling eviction to free space. Verify restore coverage through the isolated drill below, not only snapshot existence or size.

#### Validate an isolated restore

1. Obtain an authorized, separate target database in the same account or team. Verify its identity and that it contains no needed data. Keep production routes, provider jobs and email sending disconnected from this target.
2. In the target's **Backups** tab, choose **Restore…**, select the source database and backup, review the target deletion warning, then start the restore. Record source, target, backup time and completion status without credentials.
3. Inspect restored record families, representative values and expiry behavior with restricted access. Compare with the available backup-time inventory, allowing for elapsed expirations. Check durable records remain readable with the matching application secret. Never reset TTLs or extend expired confirmation links, leases or retry identities to make a drill pass.
4. Exercise journal lookup, duplicate webhook handling and suppression enforcement in an isolated application with provider I/O mocked. Record the result and missing evidence. An isolated restore proves recoverability of that snapshot, not readiness to replace current production state.

#### Restore service safely

1. **Pause writes.** Confirm the recovery target, cutoff time and affected deployments. Establish and verify a write pause across subscription, preference, confirmation, webhook and operator entry points. Let in-flight operations settle and retain uncertain journals. Keep incoming feedback retryable; do not return success while discarding it. There is no documented one-command maintenance switch: do not restore or cut over without a verified pause.
2. **Preserve current state.** Where accessible, retain the original database and capture a fresh backup and inventory before any destructive restore. Prefer a separate restored database so the original evidence remains available. Verify the destination again before accepting Upstash's deletion warning.
3. **Reconcile the gap.** Account for changes between the snapshot and the write pause using preserved Redis records, Resend state and delivery history. Restore newer suppression, unsubscribe decisions, completed webhook IDs, consumed confirmation state and unresolved journals before reopening writes. Missing consent never authorizes sending; old consent must not override a later unsubscribe or suppression. Do not revive consumed tokens, extend original expirations or resend uncertain email. If records cannot be reconciled safely, keep the affected workflow closed and document the gap.
4. **Cut over consistently.** Preserve `SUBSCRIPTION_PREFERENCES_SECRET`. If the database changed, update both `UPSTASH_KV_REST_API_URL` and `UPSTASH_KV_REST_API_TOKEN` in the affected environment and redeploy all serving instances. Verify that old deployments and operator tools cannot continue writing to the former database. Keep eviction disabled and verify backup coverage on the restored target.
5. **Verify and resume.** Confirm Redis access, journal lookup, expiry handling, suppression and duplicate-event protection. Re-enable incoming feedback and follow [webhook recovery](#webhook-recovery) for the outage window before reopening affected subscriber writes. Use authorized live tests only when needed; mocked checks do not prove provider recovery. Record the reconciled cutoff, remaining gaps, checks and operator decision to resume.
6. **Retain recovery evidence.** Keep the former database and snapshots for the approved retention period with restricted access. After new writes reach the restored database, switching back can lose those writes; reconcile them before any rollback. Record recovery duration and data loss against the agreed objectives.

### Credential and secret rotation

Keep transport authentication separate from identity and encryption:

| Credential                        | Effect of rotation                                                                                                                                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `UPSTASH_KV_REST_API_TOKEN`       | Changes REST authentication, not key names or preference links.                                                                                                                                                          |
| `SUBSCRIPTION_PREFERENCES_SECRET` | Changes journal, lock, retry, recipient-limit, consent, suppression and IP identities; also encrypts preference links lasting up to 365 days. Missing configuration blocks these operations even if a Resend key exists. |
| `RESEND_API_KEY`                  | Authenticates Resend and remains a legacy decryption fallback for links issued before the dedicated secret. Rotation can invalidate those links.                                                                         |

See [`subscription-journal.ts`](../src/features/subscriptions/server/subscription-journal.ts), [`resend-coordination.ts`](../src/features/subscriptions/server/resend-coordination.ts) and [`subscription-preferences.ts`](../src/features/subscriptions/server/subscription-preferences.ts).

Before deploying the dedicated-secret requirement, confirm a stable preference secret and identify journals or retries created with the former Resend-key fallback. Keep the old deployment, key and CLI available to reconcile them. Follow the lease and retry cutover rules below. Do not deploy while legacy unresolved journals could become invisible. The 2026-09-26 repository change did not verify production's secret configuration.

#### Redis connection credential

1. Confirm the target environment and database, with a separate working provider-admin path. Keep the REST endpoint unchanged when rotating only credentials.
2. Where the plan supports ACL, create and test a replacement application's REST token with the same reviewed permissions. Keep the old token during cutover. If a provider reset immediately revokes the sole credential, arrange a maintenance window and supported recovery path; do not promise rollback to that token.
3. Update `UPSTASH_KV_REST_API_TOKEN` in the target Vercel environment and redeploy. Confirm readiness, Redis-backed coordination and existing journal access. Restore the former token only if it remains valid.
4. Revoke the old credential after all serving deployments use the new token and checks pass. Verify the old credential is denied and the new one works. Do not rotate the preference secret as part of transport credential rotation.

#### Preference and journal secret

`SUBSCRIPTION_PREFERENCES_SECRET` has **no seamless in-place rotation**. Journals and coordination read only the primary key; links decrypt with it or the legacy Resend key. Do not change the variable without a migration.

1. **Choose link compatibility.** To preserve outstanding links, implement and test old-key decryption plus a journal/coordination migration protected from concurrent writes. Retain the old secret until all its links expire. Without that code, stop new subscription/preference writes and wait out the 365-day link lifetime, or explicitly accept invalidating old links.
2. **Reconcile old journals.** Use a privileged, cursor-based scan of `mfa:subscription-journal:v1:*` in the target database. While the old secret is active, reconcile each operation with Resend and resolve it with `npm run subscription:journal -- resolve EMAIL OPERATION_ID`. Redis cannot reverse an unknown email hash; investigate unknown keys instead of deleting them. Scan again to confirm none remain. Lease expiry does not prove provider completion.
3. **Preserve consent and suppression.** Inventory and migrate `mfa:resend:consent:*` and `mfa:resend:suppression:*`. Missing records under the new key never imply permission to send. Waiting for leases cannot recover these records. Pause writes or use the tested migration's lock protocol.
4. **Drain transient records.** Let `mfa:resend:subscriber:*` leases finish or expire and 25-hour `mfa:resend:preference-request:*` records expire. Otherwise one identity could retry under a different key or payload. Verify prefixes in code. Never bulk-delete unresolved journals or replay uncertain welcome events.
5. **Deploy and verify.** Proceed only after these conditions hold or a tested dual-key migration is ready. With an owned recipient and authorization for live writes, test a preference link, language save, subscribe/retry and journal lookup. Resolve only provider-reconciled test records. Test old links when preservation is required. Compare old/new inventories: their prefixes are identical.
6. **Retire and record.** Retire the old secret only after the link window ends. Record time, environment, counts and results without secret values, email addresses or tokens.

Without a tested migration or a safe write pause, keep the current secret. Implement rotation support as a separate release.

### Confirmation and feedback records

| Record                               | Retention                                                                                      |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `mfa:subscription-confirmation:v1:*` | Expiring confirmation records keyed by SHA-256 token digest                                    |
| `mfa:resend:recipient-*`             | Cooldown, hourly limit and request receipts; one Lua operation reserves both limits atomically |
| `mfa:resend:consent:*`               | Durable consent                                                                                |
| `mfa:resend:suppression:*`           | Durable suppression                                                                            |
| `mfa:resend:webhook:*`               | Durable completed event IDs                                                                    |

Include durable records in backup, retention and subscriber-erasure procedures. Signup must not clear suppression.

The preference secret derives consent, suppression and recipient identities. Preserve it or migrate those records before rotation. Confirmation keys and webhook IDs are independent of it. Preference-token encryption is unchanged.

Reconcile a `processing` confirmation against its journal and provider state; never reset it for replay. The reader can request a new confirmation afterward. Welcome failures retain `send-welcome-event` while preserving the subscription. Unsubscribe holds the lock and bypasses the journal gate.

## Stripe

### Stripe environment configuration

Configure environment-scoped Stripe keys from [.env.example](../.env.example). Prefer `STRIPE_RESTRICTED_KEY`; `STRIPE_SECRET_KEY` is a compatibility fallback. Grant Checkout Sessions read/write and the Product/Price access needed by `price_data`. Test the actual key in a sandbox before release. Do not broaden permissions without checking the target account.

Checkouts use no Price-ID environment variables. The server-only [catalog](../src/features/support/server/support-catalog.ts) owns product IDs, USD prices, names and tax codes:

| Product ID      | Unit amount (USD cents) |
| --------------- | ----------------------- |
| `support-6-v1`  | 600                     |
| `support-12-v1` | 1200                    |
| `support-18-v1` | 1800                    |

Released catalog versions are immutable: preserve names, prices, tax codes and parameter construction. Add a version for changed terms and retain old versions for retries. The server supplies display amounts and prices all products; submitted amounts never set prices. Reject unknown or repeated product fields.

On 2026-10-02, the live account's three active one-time Prices were inspected read-only: USD 600/1200/1800 cents, Product name `Support`, no description, tax code `txcd_10000000`, and unspecified tax behavior. The v1 catalog preserves that name and classification and continues to use the account's tax-behavior default. This inspection does not establish restricted-key permissions, tax registrations or payment success.

### Checkout behavior

The [server module](../src/features/support/server/stripe-checkout.ts) creates one-time Hosted Checkout Sessions with `price_data`, a pinned API version and the existing integration identifier. Automatic Tax stays enabled; no Managed Payments override is added. Embedded Checkout is not used. Stripe collects payment details; the site does not collect card data.

Support submits a native POST without JavaScript. With JavaScript it announces navigation, locks repeat submissions and freezes product/version and attempt ID. If navigation stops, Resume resubmits the same values. No timer unlocks the form. A page-cache return reloads server state instead of minting a browser attempt.

Each request needs a server-issued `v3` token with UUID, expiry and HMAC-SHA256 signature. Both the route and Session service validate it before writing. Tokens expire after 23 hours, within Stripe's minimum 24-hour idempotency retention. Retries use the full token and key `support-checkout:v3:<token>`. A changed product under that attempt must cause a parameter mismatch, never a new Session.

Signing uses `SUPPORT_CHECKOUT_SECRET` or the active Stripe server key. Keep the effective key identical across serving instances. Rotation retires existing attempts. Unconfigured previews use a process-local random key and cannot create Sessions. Form or URL edits cannot extend expiry. This limits retries; it is not a payment ledger.

Expected errors redirect to the selected locale with `status=error`, `status=rate-limited` or `status=invalid-amount`. Rate limits include `Retry-After` and a ten-minute message. Recovery keeps `product_id`, `checkout_attempt` and original `checkout_locale`; language changes do not alter Stripe metadata or return URLs. New attempts remount the form to discard frozen choices. Origin, format and body-size errors remain API responses.

Stripe Custom domains was disabled according to the owner on 2026-09-22. Redirect to Stripe's returned `session.url`; do not construct a custom payment hostname. The existing CSP permits `https://checkout.stripe.com`.

### Retired attempts

Retire amount-only forms, unsigned UUIDs, expired tokens and invalid signatures. Redirect to `status=retired-checkout` without creating a Session. Legacy error/rate-limit links show the same localized notice without a form. Ask readers to check their original Stripe confirmation before intentionally starting again.

Language changes preserve the notice, not the old payload. Never upgrade an old UUID or silently create a replacement payment.

Verify old paid Sessions using their original amount metadata. No legacy Price configuration is read. Removing code does not delete cloud variables; retain settings needed by a serving or rollback deployment.

### Environment verification checklist

Focused local checks use `npm run test:integration -- src/features/support/support-panel.test.tsx` for rendered status behavior and `npx playwright test src/features/support/support-status.spec.ts --project=chromium` for the browser journey. These checks do not establish live payment outcomes.

1. Configure a sandbox server key and verify permission to create an inline-price Session and retrieve it. Confirm account tax defaults, applicable registrations and the catalog's tax classification. Provider writes require separate authorization.
2. Exercise all products and three languages, native submission without JavaScript, stopped-navigation resume, changed-selection rejection, cancellation, pending payment and server-confirmed payment.
3. Before release, confirm retired links display the notice and make no provider request. Verify the new key and target account mode; sandbox success is not live payment evidence.
4. Verify the release and catalog recovery with the same attempt, product/version and original locale. Record environment, date and result without credentials or customer data.
5. Remove unused cloud settings with the corresponding release; an older rollback deployment still requires its original configuration.

### Payment confirmation

Payment does not grant newsletter consent. Neither a successful payment nor a Checkout email activates a subscription. Follow the separate [confirmation flow](#subscription-confirmation-and-delivery-feedback).

`VerifiedSupportPanel` retrieves status server-side under Suspense, then renders `SupportPanel` with JSX. Ordinary visits and retry states render the native form without waiting for a provider. Never call either component as an ordinary function.

Retrieve the Session server-side; URL parameters never confirm payment.

| Evidence                                     | Result                                                                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Completed, paid USD research-support Session | Confirm payment. Catalog Sessions must also match product ID, subtotal and amount metadata. Tax may increase total without changing subtotal. |
| Completed but unpaid Session                 | Pending; hide Checkout and create no new attempt. Refresh the same URL to recheck or use localized Contact help.                              |
| Missing or unavailable evidence              | Unverified.                                                                                                                                   |
| `status=cancelled` alone                     | Returned from Checkout; no proven cancellation, failure or unpaid status. Ask the reader to check Stripe confirmation before retrying.        |

Return no customer details to the page. Success confirms payment without promising an email receipt. Explain before checkout that applicable taxes are calculated there.

Voluntary support unlocks no content and fulfills no order, so this flow needs no payment webhook. Add a durable ledger and verified Stripe webhooks before introducing entitlements or durable recovery.

### Stripe source ownership

- `src/features/support/server/support-catalog.ts` — versioned server pricing and product terms.
- `src/features/support/server/stripe-checkout.ts` — client, Session creation, retired-attempt protection and verification.
- `src/features/support/support-config.ts` — shared choice identifiers, historical payment amount validation and recovery query allowlist.
- `src/features/support/support-panel.tsx` — server-provided choices and payment status.
- `src/features/support/support-checkout-form.tsx` — native submission lock and explicit resume.
- `src/app/api/stripe/checkout/route.ts` — same-origin validation, rate limiting and localized redirects.

Resources: [Checkout Session creation](https://docs.stripe.com/api/checkout/sessions/create) · [Idempotent requests](https://docs.stripe.com/api/idempotent_requests) · [Hosted Checkout](https://docs.stripe.com/payments/accept-a-payment?payment-ui=checkout&ui=stripe-hosted)

## Sentry

### Configuration

Vercel Integration was verified for Production on October 6, 2026. Preview and Development need their own DSN configuration. The recorded resource uses the free Developer plan and US region; project `4512194291761152` is `modern-fundamental-analyst/sentry-modern-fundamental-analyst`. Recheck slugs after renaming.

| Variable                                            | Purpose                                                                          |
| --------------------------------------------------- | -------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN`                            | Browser reporting and server fallback                                            |
| `SENTRY_DSN`                                        | Optional server override; empty or whitespace values fall back to the public DSN |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | Source-map uploads; keep the token server/build-only                             |

Prefer integration-managed values. Never expose the upload token with `NEXT_PUBLIC_`. Missing DSNs leave monitoring inactive.

### Errors and source maps

`src/instrumentation-client.ts` initializes browser monitoring before hydration. `src/instrumentation.ts` loads Node/Edge configuration and exposes request-error reporting. Localized and global boundaries report errors while preserving retry and navigation UI.

`next.config.ts` wraps Next.js with Sentry, uploads maps only with complete upload settings, then deletes uploaded generated maps from output. Runtime reporting needs no upload token.

Production builds replace `__SENTRY_DEBUG__` with `false` through Next.js `compiler.define`, allowing both bundlers to remove internal SDK debug diagnostics. Development retains those diagnostics. This does not disable Sentry Logs, errors, tracing, metrics or Replay; their sampling and initialization remain unchanged.

`src/lib/sentry-server.ts` reports Checkout failures, missing Contact configuration and Resend failures using fixed operation names and failure classes. It attaches no provider messages or request values. `runResendOperation` reports both thrown exceptions and returned SDK errors once, preserving the original result and retry behavior. All subscription segment requests, including rollback, use this boundary. Contact does not report the same provider rejection again.

`isResendWriteAcknowledged` validates successful SDK payloads and reports malformed acknowledgements without including their contents. These are uncertain writes, not confirmed rejections. Subscriber leases and journals remain available for reconciliation; no further mutation or compensating rollback should follow an uncertain result. A malformed feedback unsubscribe response must not create a completed webhook marker. Provider retries can resume after the lease expires; local suppression remains in place. Contact, confirmation and preference-link retries reuse their original email payload and idempotency key. See [provider recovery requirements](WEB_APPLICATION_ARCHITECTURE.md#provider-recovery-verification) for the shared validation contracts.

Callers explicitly allow expected statuses: contact lookups and feedback-driven unsubscribe updates accept 404. Other returned errors, including provider 5xx responses, remain reportable. Public input validation and application rate limits do not call this reporting boundary. Keep Sentry Core and Next.js SDK versions aligned and use the initialized client's APIs to avoid Node/CommonJS import incompatibilities.

### Traces, logs and metrics

Trace pages, navigation and requests at 10% in Production and 100% in other configured environments. Propagate trace headers only to relative app URLs, the site domain and local development.

Streamed-span filtering keeps timing, operation, environment/release, SDK identity, segment association, HTTP method/status and numeric measurements. It strips queries/fragments from names, replaces database descriptions and drops arbitrary attributes and links. The site has no AI agent; web tracing does not create agent conversations.

SDK v11 captures logs and application metrics without extra enable flags. `reportServiceFailure` emits `Service operation failed`, increments `mfa.service.failures` and reports the exception. Only the three known operations and failure classes are accepted; unknown logs/metrics are dropped. Safe environment/release attributes remain.

These signals require a real service failure, not a page visit. Never trigger live emails or payments to populate dashboards. Keep private values out of shared scope attributes, which the SDK may merge after filtering.

### Data protection

Disable automatic collection of users, cookies, headers, request bodies, queries, database values, stack variables and AI inputs/outputs. The final error filter removes breadcrumbs and extras; strips queries/fragments from request, Next.js and stack-frame contexts; and redacts email addresses and bearer credentials.

Do not include secrets or private provider responses in messages; filters cannot recognize every secret. The app does not use integration-provided OTLP or log-drain variables.

### Session Replay

Browser instrumentation installs native error/rejection buffering immediately. A narrow dynamic entry exports only initialization, exception reporting, router transitions and Replay access. The SDK loads on the first browser yield and yields again before setup, initializes once, then forwards up to 25 original errors through the existing privacy filters. Error boundaries use the same reporting bridge. Listeners and buffered references are removed after initialization or load failure; no errors are persisted to storage. Router transitions received during startup wait for the same SDK promise. This separates SDK evaluation from application bootstrap without a fixed delay or a Lighthouse-specific bypass. Replay loads through a separate dynamic module after SDK readiness. Yield to the browser before requesting the Replay module and again before starting its DOM snapshot, so optional recording work does not extend the same initialization task. Use `scheduler.yield()` when available and a zero-delay timer fallback elsewhere; there is no fixed multi-second delay or Lighthouse-specific bypass. Recheck privacy permission after each asynchronous boundary. Private navigation permanently cancels a pending Replay initialization for the page lifetime, as well as stopping an active recording. A Replay chunk failure leaves error monitoring active. Sample normal sessions at 10% and error sessions at 100%. Isolated `test` builds use 100% sampling and the same compression as production. Transport tests decode the compressed recording before checking masking and blocked form contents.

Mask text and inputs, block media, discard custom console/network events, and block forms and links containing queries or fragments. Do not start Replay on query/fragment URLs, Support, Preferences or Confirmation. Navigating there stops recording without automatic restart; errors and tracing stay active.

The fake-DSN regression checks real Replay envelopes and masking. It does not verify cloud ingestion.

### Local and cloud verification

An empty dashboard or incomplete onboarding does not prove collection is disabled. Local transport tests verify envelope generation and filtering; accepted cloud events verify ingestion. After deployment, check the Vercel Integration, release and an authorized controlled error in Sentry Issues.

For CSS chunk errors, inspect the environment and runtime frames before changing application code. On October 15, 2026, issue `SENTRY-MODERN-FUNDAMENTAL-ANALYST-6` recorded four localhost development events. Turbopack rejected CSS updates because the stylesheet link was missing after component unmounting.

Next.js 16.4.2 passed isolated Chromium and WebKit checks for CSS updates after unmounting; see the [upstream fix](https://github.com/vercel/next.js/pull/94551). Restart development servers normally and reload existing tabs after a framework update. Keep stylesheet errors reportable, and verify the fix in its target environment before resolving the cloud issue.

Set `NEXT_PUBLIC_SENTRY_DSN` in ignored `.env.local` to enable local reporting; leave it empty to disable it. `.env.example` supplies organization and project identifiers. Only authenticated map uploads need `SENTRY_AUTH_TOKEN`.

Before `vercel env pull .env.local`, preserve local configuration: the command replaces the file and needs a Development connection.

Browser tests set `SENTRY_DISABLED=1` for server/edge runtime isolation and clear runtime DSNs and the upload token. This does not disable browser code with a compiled DSN. For ordinary browser-test builds, use `NEXT_PUBLIC_SENTRY_DSN= SENTRY_AUTH_TOKEN= npm run build`.

For telemetry regressions, CI builds with a fake DSN and `NEXT_PUBLIC_VERCEL_ENV=test`, then sets `PLAYWRIGHT_SENTRY_TEST=1`. Chromium and WebKit use deterministic 100% test sampling; Production stays at 10%. Run the isolated production regression:

```bash
node --import ./scripts/register-server.mjs --test src/lib/sentry-options.test.mjs src/lib/sentry-server.test.mjs
NEXT_PUBLIC_SENTRY_DSN=https://public@sentry.invalid/1 NEXT_PUBLIC_VERCEL_ENV=test SENTRY_DSN= SENTRY_AUTH_TOKEN= npm run build
PLAYWRIGHT_USE_PRODUCTION_BUILD=1 PLAYWRIGHT_SENTRY_TEST=1 npx playwright test src/lib/sentry.spec.ts --project=chromium --project=webkit
```

These commands send no event to the real project. A focused development-server check is also available:

```sh
PLAYWRIGHT_SENTRY_TEST=1 npx playwright test src/lib/sentry.spec.ts --project=chromium
```

Verify cloud traces in Traces. After an actual service failure, look for `Service operation failed` in Logs and `mfa.service.failures` in Metrics. Local emission does not prove cloud ingestion.

When investigating missing spans, inspect project ingestion outcomes for the affected deployment window. Sampling drops are expected at the configured rate; distinguish them from network and timestamp failures. Rejected spans cannot be attributed to a release from accepted-event searches alone. Do not change timestamps, sampling or privacy filters without a reproducible cause.

Uptime monitoring is separate from the SDK. Use one anonymous GET monitor for the production site, verify its URL returns 2xx, and connect outage notifications before treating reachability as monitored. Check existing monitors and the account's included allowance before creating one; an Error Monitor or active trace stream does not establish uptime coverage.

On October 16, 2026, [production monitor 10662057](https://modern-fundamental-analyst.sentry.io/monitors/10662057/) was created for `GET https://www.modernfundamentalanalyst.com/` in `production`: a 60-second interval, 5-second timeout, 2xx response assertion, three failures to open an issue and one success to resolve it. The manual test passed. Existing project alerts appear on its detail page; notification delivery has not been tested.

On October 22, 2026, activation was retried and Sentry again returned `You don't have enough budget available to create a new seat`. Billing showed the Developer plan, Uptime usage `0 / 1` and `$0.00` additional spend. The monitor remained disabled, with no recent scheduled checks. No trial, upgrade or spending increase was enabled. This is an unresolved provider entitlement discrepancy, not an application deployment failure.

Ask Sentry Support to reconcile the included Uptime allowance for monitor `10662057`. Provide the organization, monitor ID, observation date and the error above through an authorized support request; exclude credentials and subscriber data. Do not delete and recreate the monitor or raise spending to bypass the error. After Sentry corrects the entitlement, enable the existing monitor, verify scheduled 2xx check-ins, and verify that the connected notification rules cover downtime and recovery. Notification delivery remains untested. A successful manual check alone does not establish scheduled coverage.

References: [Next.js tracing](https://docs.sentry.io/platforms/javascript/guides/nextjs/tracing/), [Logs](https://docs.sentry.io/platforms/javascript/guides/nextjs/logs/), [Metrics](https://docs.sentry.io/platforms/javascript/guides/nextjs/metrics/), and [data collection](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection).
