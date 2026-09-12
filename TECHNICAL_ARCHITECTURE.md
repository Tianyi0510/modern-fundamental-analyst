# Architecture and operations

Pages render localized server components; interactive controls use small client boundaries. Pure support amounts and types live in `lib/support-config.ts`. Stripe, Redis, Resend and preference-token modules declare `server-only`. Node tests and the operator CLI load `scripts/register-server.mjs`; application builds use Next.js boundary enforcement.

## Production gate

Vercel's configured build command waits up to ten minutes for the latest push CI run on `main` matching `VERCEL_GIT_COMMIT_SHA`. Only `success` proceeds. Preview and local builds skip this gate. Missing metadata, GitHub API errors, cancellation and timeout fail closed. The repository must remain publicly readable, or the gate must gain scoped authentication before making it private. The gate adds wait time to Vercel builds and requires `vercel.json` build commands to remain in effect. Do not put it in `npm run build`: CI itself must build without waiting on its own completion.

## Redis runtime

The application shares one authenticated TLS connection per Node.js process. Concurrent cold requests wait for the same connection to become ready. Configure `UPSTASH_REDIS_URL` with a `rediss://` URL; credentials are never logged.

Connection attempts have a 2-second timeout with at most two reconnect retries. Individual commands have a 5-second timeout through node-redis `commandOptions`. There is no socket inactivity timeout, so an idle healthy connection is not closed every five seconds. Offline commands are rejected and the command queue is capped at 100.

Initial connection readiness, including authentication, has a separate 10-second deadline that destroys a stalled socket. Requests encountering a reconnecting client without a shared initial connection attempt fail fast into cooldown.

All application commands use `executeRedisCommand`. A failed command discards its connection and opens a 30-second cooldown. A delayed failure or connection completion from a discarded client cannot disable a newer client or clear its pending connection. Error listeners remain attached to discarded sockets to handle late events safely. Logs use bounded categories and omit command arguments, Redis URLs and credentials.

Rate limiting falls back to a bounded in-process counter when Redis is unavailable. Subscriber mutations and preference-email persistence instead fail closed because their correctness requires shared coordination. Redis command timeouts do not prove a write was rejected: timed-out writes are not automatically replayed. Subscriber leases expire naturally when their release cannot be confirmed.

`npm run test:unit` includes isolated connection lifecycle and concurrency tests. These tests use simulated clients and do not connect to the production database.

## Subscription reconciliation

Subscription and preference-language saves write a shared Redis journal before external operations. It records an operation UUID, operation type, start time, locale and phase; the key uses a keyed hash of the email. Older records without an operation type remain valid. It contains no plaintext email or preference token. Known completed or compensated operations clear the record. Unknown outcomes, failed rollback and interrupted execution retain it without expiry. Subsequent subscription or language-save attempts stop before further provider writes, even after the subscriber lease expires. Unsubscribe still uses the subscriber lock but bypasses the journal gate and preserves any unresolved record for investigation.

Use the environment for the affected deployment and a stable `SUBSCRIPTION_PREFERENCES_SECRET`. Journals depend on Redis persistence and a non-evicting database; they are not a replacement for backups. Secret rotation requires reconciling/migrating existing journal keys first.

1. Run `npm run subscription:journal -- status EMAIL` to inspect the operation ID and phase.
2. Inspect the contact, language segments and welcome event in Resend. Reconcile the intended state there. A missing response is not evidence that an event was not sent. Never resend an ambiguous welcome event automatically.
3. After confirming the provider state, run `npm run subscription:journal -- resolve EMAIL OPERATION_ID`. Resolution takes the subscriber lock and compares the journal ID before clearing it. It does not modify Resend or send email. An active lease requires waiting for its expiry first.
4. The user can then retry the normal subscription flow if needed.

There is no automatic replay worker: operator reconciliation is deliberate for writes whose delivery outcome cannot be proven. If Redis is unavailable, mutations fail before starting; if it fails mid-operation, the prewritten record remains for investigation. Use deployment logs for the service failure and the email supplied by the affected reader to locate the journal.

## Payment confirmation

Payment confirmation uses server-verified Stripe Session status; URL parameters cannot prove payment. See [payment confirmation](STRIPE_INTEGRATION.md#payment-confirmation) for states, permissions and future fulfillment requirements.

## Review evidence

`audit/` holds local screenshots and dated review notes. Git and Vercel exclude it; existing files are retained on disk. These historical observations are not the current issue list and are not shared with a fresh clone. Keep durable decisions and operating instructions in the root documentation. If evidence needs to be shared, prepare a separate reviewed artifact with relative image links and record its date, commit, environment and resolution status; local absolute paths are not portable.

Browser evidence is separated into `test-results/chromium/` and `test-results/webkit/`, so running WebKit preserves Chromium evidence. GitHub Actions retains failed Playwright traces and screenshots in the `browser-failure-evidence` artifact for seven days.
