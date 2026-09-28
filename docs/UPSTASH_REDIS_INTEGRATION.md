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

Use the environment for the affected deployment and a stable `SUBSCRIPTION_PREFERENCES_SECRET`. Journals depend on Redis persistence and a non-evicting database; they are not a replacement for backups. The CLI below addresses a journal by hashing the supplied email with the **current** secret; changing that secret first makes old journal keys undiscoverable through the CLI.

1. Run `npm run subscription:journal -- status EMAIL` to inspect the operation ID and phase.
2. Inspect the contact, language segments and welcome event in Resend. Reconcile the intended state there. A missing response is not evidence that an event was not sent. Never resend an ambiguous welcome event automatically.
3. After confirming the provider state, run `npm run subscription:journal -- resolve EMAIL OPERATION_ID`. Resolution takes the subscriber lock and compares the journal ID before clearing it. It does not modify Resend or send email. An active lease requires waiting for its expiry first.
4. The user can then retry the normal subscription flow if needed.

There is no automatic replay worker: operator reconciliation is deliberate for writes whose delivery outcome cannot be proven. If Redis is unavailable, mutations fail before starting; if it fails mid-operation, the prewritten record remains for investigation. Use deployment logs for the service failure and the email supplied by the affected reader to locate the journal.

## Credential and secret rotation

`UPSTASH_REDIS_URL` authenticates the TLS connection. Changing only its password does not change Redis key names or invalidate preference links. `SUBSCRIPTION_PREFERENCES_SECRET` is required for journal, subscriber-lock and preference-request keys; missing configuration now blocks those operations even when `RESEND_API_KEY` exists. It also encrypts preference links, which can live up to 365 days. `RATE_LIMIT_HASH_SECRET` should remain separately configured so rotating either credential does not reset rate-limit identities. `RESEND_API_KEY` remains a legacy **link decryption** fallback for links issued before a dedicated preference secret was configured; changing it can invalidate those links too. See the key derivation in [`lib/subscription-journal.ts`](../lib/subscription-journal.ts), [`lib/resend-coordination.ts`](../lib/resend-coordination.ts), and [`lib/subscription-preferences.ts`](../lib/subscription-preferences.ts).

Before releasing the dedicated-secret requirement to an environment, confirm that it already has a stable `SUBSCRIPTION_PREFERENCES_SECRET` and identify any journal or retry keys created under the former Resend-key fallback. If the secret is absent or old hashed records may exist, keep the old deployment and Resend key available while inventorying and reconciling journals with the old CLI; follow the cutover conditions below for leases and retry records. Do not deploy the new code while unresolved legacy journals could become invisible. As of 2026-09-26, this repository change has not verified the production environment's secret presence.

### Redis connection credential

1. Confirm the target environment, database and current Vercel variable without copying its value into a ticket or log. Keep a working provider-admin connection independent of the application credential.
2. Where ACL is available, add a new application credential with the same reviewed permissions, then test TLS authentication and representative allowed and denied commands with that credential. Keep the old credential active during cutover. On the current Free Tier, do not assume two credentials can coexist; arrange a maintenance window and a provider-supported recovery path before resetting a single credential.
3. Update only `UPSTASH_REDIS_URL` in the target Vercel environment and redeploy. Confirm the deployment is ready, Redis-backed subscriber coordination and journal access work, and authorized form checks succeed. If the new credential fails while the old one remains valid, restore the previous Vercel value and redeploy.
4. Revoke the old credential only after every serving deployment uses the new value and the checks pass. Verify a new connection with the old credential is denied and a new connection with the new credential succeeds. A provider reset that immediately invalidates the old password has no guaranteed rollback to that password.

### Preference and journal secret

The current code has **no seamless in-place rotation** for `SUBSCRIPTION_PREFERENCES_SECRET`: it reads journal and coordination keys only under the primary secret and decrypts links only with that secret or the legacy Resend key. Do not change the Vercel variable as a standalone operation.

1. Choose a cutover policy. To preserve outstanding links, first implement and test an explicit old-key decryption fallback and a journal/coordination-key migration that cannot race with subscriber writes. Retain the old secret until every link issued with it has expired. Without that code change, a cutover requires a period with no new subscription or preference writes and no old links that must remain valid; account for the full 365-day link lifetime or an explicitly accepted link reset.
2. Before cutover, inventory `mfa:subscription-journal:v1:*` with a privileged, cursor-based Redis scan in the target database. Reconcile each unresolved operation against Resend and clear it with `npm run subscription:journal -- resolve EMAIL OPERATION_ID` while the old secret is active. An unknown hashed key cannot be mapped back to an email from Redis; stop and investigate instead of deleting it. Confirm a second scan finds no unresolved journals. Do not use the short lease expiry as evidence that a provider write completed.
3. Stop new writes during the cutover or use the tested migration's lock protocol. Allow existing `mfa:resend:subscriber:*` leases to finish or expire and the 25-hour `mfa:resend:preference-request:*` records to expire; otherwise the same identity can be retried under a different key or payload. Check the exact prefixes in the linked code before operating. Never bulk-delete an unresolved journal or replay an ambiguous welcome event.
4. Deploy the new secret only after those conditions hold or the tested dual-key migration is in place. With an owned test recipient and separate authorization for live provider writes, verify a new preference link, language save, subscribe/retry and journal status behavior; resolve only an actual, provider-reconciled test record. Verify old links still work when preservation was required. Confirm the old hashed journal keys were cleared or migrated by comparing the pre-cutover inventory, since old and new keys share the same prefix. Retire the old secret only after the link window ends. Record the cutover time, environment, counts and verification outcome without storing secret values, email addresses or link tokens.

If traffic cannot be paused and the migration code has not been implemented, rotation is blocked by the current design; preserve the existing secret and treat the code change as a separate release.
