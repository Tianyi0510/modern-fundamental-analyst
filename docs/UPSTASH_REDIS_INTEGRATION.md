# Upstash Redis Integration

This guide covers the Redis connection, access controls, subscriber coordination, and reconciliation. See [Technical Architecture](TECHNICAL_ARCHITECTURE.md) for deployment and review procedures, [Portfolio Data](PORTFOLIO_DATA.md) for the research snapshot, and [Resend Integration](RESEND_INTEGRATION.md) for email behavior.

## Redis runtime

The application shares one authenticated TLS connection per Node.js process. Concurrent cold requests wait for the same connection to become ready. Configure `UPSTASH_REDIS_URL` with a `rediss://` URL; credentials are never logged.

For production ACL, create a dedicated `mfa_app` user with a generated password and the key pattern `~mfa:*`. Start with no command categories, then allow `+get +set +del +eval +incr +pexpire`. These are the only data commands used by the application, including commands inside its Lua scripts. Allow the connection commands required by node-redis (`+hello +ping +client|setinfo`) if the provider supports them. Do not grant `+@all`, administrative commands, or other key patterns. ACL key patterns do not constrain commands that take no key, so the command allowlist is essential. Keep the `default` credential available until the new user passes an authenticated connection and representative rate-limit, subscription, and journal checks.

The production database currently uses Upstash Free Tier, which does not include ACL according to Upstash's published plan documentation. The owner chose not to upgrade on 2026-09-22, so the ACL user and credential rotation remain pending. After a plan with ACL is approved, create the user in Upstash, verify `ACL DRYRUN` for permitted and denied commands (including another key prefix), and test through a separate TLS connection before changing the Vercel production `UPSTASH_REDIS_URL` to `rediss://mfa_app:<password>@<host>:6379`. Encode URL-sensitive password characters. Redeploy and test the public forms and journal operator CLI, then revoke the old application credential. Keep the password in the provider and Vercel secret settings only; do not put it in Git, logs, test fixtures, or command output. If the new credential fails, restore the previous Vercel value while the old user remains enabled.

Connection attempts have a 2-second timeout with at most two reconnect retries. Individual commands have a 5-second timeout through node-redis `commandOptions`. There is no socket inactivity timeout, so an idle healthy connection is not closed every five seconds. Offline commands are rejected and the command queue is capped at 100.

Initial connection readiness, including authentication, has a separate 10-second deadline that destroys a stalled socket. Requests encountering a reconnecting client without a shared initial connection attempt fail fast into cooldown.

All application commands use `executeRedisCommand`. A failed command discards its connection and opens a 30-second cooldown. A delayed failure or connection completion from a discarded client cannot disable a newer client or clear its pending connection. Error listeners remain attached to discarded sockets to handle late events safely. Logs use bounded categories and omit command arguments, Redis URLs and credentials.

Rate limiting falls back to a bounded in-process counter when Redis is unavailable. The counter also tracks requests while Redis is healthy, so a visitor does not regain a fresh local allowance when Redis fails; Redis remains authoritative while available. The fallback cannot enforce a global limit across application instances. Subscriber mutations and preference-email persistence instead fail closed because their correctness requires shared coordination. Redis command timeouts do not prove a write was rejected: timed-out writes are not automatically replayed. Subscriber leases expire naturally when their release cannot be confirmed.

`npm run test:unit` includes isolated connection lifecycle and concurrency tests. These tests use simulated clients and do not connect to the production database.

## Stored data and access

The subscription journal has no plaintext email or preference token and retains unresolved records without expiry; see [subscription reconciliation](#subscription-reconciliation) for its fields and recovery procedure.

Preference-email retry records are separate: they contain the sender, recipient, subject, original encrypted link, email text and HTML for up to 25 hours. The same request ID can retrieve its original payload for 25 minutes; the record remains afterward so that reusing an old ID cannot create a fresh payload during the provider's deduplication window. The request key is reused as the provider idempotency key; it is not stored in the payload. Treat these records as sensitive, restrict Redis access, and follow [Resend request reliability](RESEND_INTEGRATION.md#request-reliability) for retry behavior.

## Subscription reconciliation

Subscription and preference-language saves write a shared Redis journal before external operations. It records an operation UUID, operation type, start time, locale and phase; the key uses a keyed hash of the email. Older records without an operation type remain valid. It contains no plaintext email or preference token. Known completed or compensated operations clear the record. Unknown outcomes, failed rollback and interrupted execution retain it without expiry. Subsequent subscription or language-save attempts stop before further provider writes, even after the subscriber lease expires. Unsubscribe still uses the subscriber lock but bypasses the journal gate and preserves any unresolved record for investigation.

Use the environment for the affected deployment and a stable `SUBSCRIPTION_PREFERENCES_SECRET`. Journals depend on Redis persistence and a non-evicting database; they are not a replacement for backups. Secret rotation requires reconciling/migrating existing journal keys first.

1. Run `npm run subscription:journal -- status EMAIL` to inspect the operation ID and phase.
2. Inspect the contact, language segments and welcome event in Resend. Reconcile the intended state there. A missing response is not evidence that an event was not sent. Never resend an ambiguous welcome event automatically.
3. After confirming the provider state, run `npm run subscription:journal -- resolve EMAIL OPERATION_ID`. Resolution takes the subscriber lock and compares the journal ID before clearing it. It does not modify Resend or send email. An active lease requires waiting for its expiry first.
4. The user can then retry the normal subscription flow if needed.

There is no automatic replay worker: operator reconciliation is deliberate for writes whose delivery outcome cannot be proven. If Redis is unavailable, mutations fail before starting; if it fails mid-operation, the prewritten record remains for investigation. Use deployment logs for the service failure and the email supplied by the affected reader to locate the journal.
