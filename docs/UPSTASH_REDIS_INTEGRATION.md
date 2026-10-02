# Upstash Redis Integration

This guide covers the Redis connection, access controls, subscriber coordination, and reconciliation. See [Technical Architecture](TECHNICAL_ARCHITECTURE.md) for deployment and review procedures, [Portfolio Data](PORTFOLIO_DATA.md) for the research snapshot, and [Resend Integration](RESEND_INTEGRATION.md) for email behavior.

## Redis runtime

The application reuses one `@upstash/redis` REST client per Node.js process. Set `UPSTASH_KV_REST_API_URL` to the existing database's HTTPS REST endpoint and `UPSTASH_KV_REST_API_TOKEN` to its read/write token. TCP `UPSTASH_REDIS_URL` is no longer read. There is no socket readiness, reconnect, offline queue or CLI socket shutdown.

Each request receives a fresh five-second abort deadline. SDK retries and automatic pipelining are disabled: a lost response must never replay `INCR`, lease acquisition or another uncertain write. Automatic JSON deserialization is disabled because existing records and Lua ownership comparisons use raw serialized strings. Key prefixes, subscriber hashing, lease TTLs and journal formats remain unchanged.

All application commands use `executeRedisCommand`. A failure discards the cached client and starts a 30-second cooldown; a late failure from an older client cannot suspend its replacement. Logs are throttled by bounded category and omit endpoint, token, command arguments and private payloads.

Rate limiting falls back to a bounded in-process counter. It tracks requests while Redis is healthy so failure cannot restart the local allowance; it cannot enforce a global limit across instances. Subscriber mutations and preference-email persistence fail closed. Redis timeouts do not establish that a write was rejected; unresolved provider journals remain and leases expire naturally when release cannot be confirmed.

### Transport cutover

1. Obtain the existing database's REST endpoint and read/write token through the provider's secret settings. Configure the single pair above in the target environment before releasing this code. Do not create another database or use a read-only token.
2. Keep `SUBSCRIPTION_PREFERENCES_SECRET` identical. New REST and old TCP deployments must address the same database, raw records and lock protocol. Check an existing journal and representative lease/retry operations with isolated test fixtures; real subscriber writes require authorization.
3. Keep the old deployment and TCP setting through the rollback window. Verify the released version, Redis availability and existing journal readability before removing the unused TCP variable. This workspace change does not configure Vercel or mutate the database.

### Rate-limit identities

Identities derive a purpose-specific HMAC key from stable `SUBSCRIPTION_PREFERENCES_SECRET`; no separate rate-limit secret is read. The Redis key prefix and derived identity match the REST implementation's original primary counter. Lua atomically increments one counter and sets its expiry only on the first request, preserving a fixed window. Raw IPs are not stored in Redis.

When releasing directly from a version that hashed with a separate legacy secret, existing legacy counters cannot be located without that secret. They expire naturally; the derived identity starts its own window. This is a one-time counter reset, not a data migration or deletion. Do not describe it as preserving the old allowance. Keep the primary preference secret stable so subsequent deployments retain the derived identity and subscription journals.

### Access controls

The owner chose not to upgrade the recorded Free Tier on 2026-09-22; this change does not add ACL or change that decision. Verify the current plan before a separate ACL change. Where supported, restrict an application user to `~mfa:*` and `+get +set +del +eval +incr +pexpire`, including Lua's commands; never grant administrative commands or `+@all`. Generate its REST token using Upstash's documented `ACL RESTTOKEN` procedure and test allowed and denied operations before credential cutover. Keep passwords and tokens out of logs and Git. See [REST authentication and ACL](https://upstash.com/docs/redis/features/restapi).

Affected tests use mocked HTTP or in-memory records. They cover raw JSON, command arguments, fresh deadlines, no write retries, cooldown, late failures, failover counters and existing subscription recovery; they do not connect to production.

## Stored data and access

The subscription journal has no plaintext email or preference token and retains unresolved records without expiry; see [subscription reconciliation](#subscription-reconciliation) for its fields and recovery procedure.

Preference-email retry records are separate: they contain the sender, recipient, subject, original encrypted link, email text and HTML for up to 25 hours. The same request ID can retrieve its original payload for 25 minutes; the record remains afterward so that reusing an old ID cannot create a fresh payload during the provider's deduplication window. The request key is reused as the provider idempotency key; it is not stored in the payload. Treat these records as sensitive, restrict Redis access, and follow [Resend request reliability](RESEND_INTEGRATION.md#request-reliability) for retry behavior.

## Subscription reconciliation

Subscription and preference-language saves write a shared Redis journal before external operations. It records an operation UUID, operation type, start time, locale and phase; the key uses a keyed hash of the email. Older records without an operation type remain valid. It contains no plaintext email or preference token. Known completed or compensated operations clear the record. A handled failure before any provider mutation starts may also clear its own record, using an exact-value ownership comparison; an expired read-only deadline does not imply an unknown write. Unknown outcomes, failed rollback and execution interrupted after a mutation starts retain the record without expiry. A process that terminates before cleanup also leaves its journal for reconciliation. This change does not automatically clear any pre-existing journal. Subsequent subscription or language-save attempts stop before further provider writes, even after the subscriber lease expires. Unsubscribe still uses the subscriber lock but bypasses the journal gate and preserves any unresolved record for investigation.

Use the environment for the affected deployment and a stable `SUBSCRIPTION_PREFERENCES_SECRET`. Journals depend on Redis persistence and a non-evicting database; they are not a replacement for backups. The CLI below addresses a journal by hashing the supplied email with the **current** secret; changing that secret first makes old journal keys undiscoverable through the CLI.

1. Run `npm run subscription:journal -- status EMAIL` to inspect the operation ID and phase.
2. Inspect the contact, language segments and welcome event in Resend. Reconcile the intended state there. A missing response is not evidence that an event was not sent. Never resend an ambiguous welcome event automatically.
3. After confirming the provider state, run `npm run subscription:journal -- resolve EMAIL OPERATION_ID`. Resolution takes the subscriber lock and compares the journal ID before clearing it. It does not modify Resend or send email. An active lease requires waiting for its expiry first.
4. The user can then retry the normal subscription flow if needed.

There is no automatic replay worker: operator reconciliation is deliberate for writes whose delivery outcome cannot be proven. If Redis is unavailable, mutations fail before starting; if it fails mid-operation, the prewritten record remains for investigation. Use deployment logs for the service failure and the email supplied by the affected reader to locate the journal.

## Credential and secret rotation

`UPSTASH_KV_REST_API_TOKEN` authenticates REST requests. Changing only this credential does not change Redis key names or invalidate preference links. `SUBSCRIPTION_PREFERENCES_SECRET` is required for journal, subscriber-lock and preference-request keys; missing configuration now blocks those operations even when `RESEND_API_KEY` exists. It also encrypts preference links, which can live up to 365 days. Rate-limit identities derive solely from the stable preference secret. Rotating the primary secret also changes those identities. `RESEND_API_KEY` remains a legacy **link decryption** fallback for links issued before a dedicated preference secret was configured; changing it can invalidate those links too. See the key derivation in [`src/features/subscriptions/server/subscription-journal.ts`](../src/features/subscriptions/server/subscription-journal.ts), [`src/features/subscriptions/server/resend-coordination.ts`](../src/features/subscriptions/server/resend-coordination.ts), and [`src/features/subscriptions/server/subscription-preferences.ts`](../src/features/subscriptions/server/subscription-preferences.ts).

Before releasing the dedicated-secret requirement to an environment, confirm that it already has a stable `SUBSCRIPTION_PREFERENCES_SECRET` and identify any journal or retry keys created under the former Resend-key fallback. If the secret is absent or old hashed records may exist, keep the old deployment and Resend key available while inventorying and reconciling journals with the old CLI; follow the cutover conditions below for leases and retry records. Do not deploy the new code while unresolved legacy journals could become invisible. As of 2026-09-26, this repository change has not verified the production environment's secret presence.

### Redis connection credential

1. Confirm the target environment and database, with a separate working provider-admin path. Keep the REST endpoint unchanged when rotating only credentials.
2. Where the plan supports ACL, create and test a replacement application's REST token with the same reviewed permissions. Keep the old token during cutover. If a provider reset immediately revokes the sole credential, arrange a maintenance window and supported recovery path; do not promise rollback to that token.
3. Update `UPSTASH_KV_REST_API_TOKEN` in the target Vercel environment and redeploy. Confirm readiness, Redis-backed coordination and existing journal access. Restore the former token only if it remains valid.
4. Revoke the old credential after all serving deployments use the new token and checks pass. Verify the old credential is denied and the new one works. Do not rotate the preference secret as part of transport credential rotation.

### Preference and journal secret

The current code has **no seamless in-place rotation** for `SUBSCRIPTION_PREFERENCES_SECRET`: it reads journal and coordination keys only under the primary secret and decrypts links only with that secret or the legacy Resend key. Do not change the Vercel variable as a standalone operation.

1. Choose a cutover policy. To preserve outstanding links, first implement and test an explicit old-key decryption fallback and a journal/coordination-key migration that cannot race with subscriber writes. Retain the old secret until every link issued with it has expired. Without that code change, a cutover requires a period with no new subscription or preference writes and no old links that must remain valid; account for the full 365-day link lifetime or an explicitly accepted link reset.
2. Before cutover, inventory `mfa:subscription-journal:v1:*` with a privileged, cursor-based Redis scan in the target database. Reconcile each unresolved operation against Resend and clear it with `npm run subscription:journal -- resolve EMAIL OPERATION_ID` while the old secret is active. An unknown hashed key cannot be mapped back to an email from Redis; stop and investigate instead of deleting it. Confirm a second scan finds no unresolved journals. Do not use the short lease expiry as evidence that a provider write completed.
3. Stop new writes during the cutover or use the tested migration's lock protocol. Allow existing `mfa:resend:subscriber:*` leases to finish or expire and the 25-hour `mfa:resend:preference-request:*` records to expire; otherwise the same identity can be retried under a different key or payload. Check the exact prefixes in the linked code before operating. Never bulk-delete an unresolved journal or replay an ambiguous welcome event.
4. Deploy the new secret only after those conditions hold or the tested dual-key migration is in place. With an owned test recipient and separate authorization for live provider writes, verify a new preference link, language save, subscribe/retry and journal status behavior; resolve only an actual, provider-reconciled test record. Verify old links still work when preservation was required. Confirm the old hashed journal keys were cleared or migrated by comparing the pre-cutover inventory, since old and new keys share the same prefix. Retire the old secret only after the link window ends. Record the cutover time, environment, counts and verification outcome without storing secret values, email addresses or link tokens.

If traffic cannot be paused and the migration code has not been implemented, rotation is blocked by the current design; preserve the existing secret and treat the code change as a separate release.
