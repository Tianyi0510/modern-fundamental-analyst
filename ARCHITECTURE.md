# Architecture and operations

Pages render localized server components; interactive controls use small client boundaries. Pure support amounts and types live in `lib/support-config.ts`. Stripe, Redis, Resend and preference-token modules declare `server-only`. Node tests and the operator CLI load `scripts/register-server.mjs`; application builds use Next.js boundary enforcement.

## Production gate

Vercel's configured build command waits up to ten minutes for the latest push CI run on `main` matching `VERCEL_GIT_COMMIT_SHA`. Only `success` proceeds. Missing metadata, GitHub API errors, cancellation and timeout fail closed. The repository must remain publicly readable, or the gate must gain scoped authentication before making it private. The gate adds wait time to Vercel builds and requires `vercel.json` build commands to remain in effect. Do not put it in `npm run build`: CI itself must build without waiting on its own completion.

## Subscription reconciliation

Subscription and preference-language saves write a shared Redis journal before external operations. It records an operation UUID, operation type, start time, locale and phase; the key uses a keyed hash of the email. Older records without an operation type remain valid. It contains no plaintext email or preference token. Known completed or compensated operations clear the record. Unknown outcomes, failed rollback and interrupted execution retain it without expiry. Subsequent subscription or language-save attempts stop before further provider writes, even after the subscriber lease expires. Unsubscribe still uses the subscriber lock but bypasses the journal gate and preserves any unresolved record for investigation.

Use the environment for the affected deployment and a stable `SUBSCRIPTION_PREFERENCES_SECRET`. Journals depend on Redis persistence and a non-evicting database; they are not a replacement for backups. Secret rotation requires reconciling/migrating existing journal keys first.

1. Run `npm run subscription:journal -- status EMAIL` to inspect the operation ID and phase.
2. Inspect the contact, language segments and welcome event in Resend. Reconcile the intended state there. A missing response is not evidence that an event was not sent. Never resend an ambiguous welcome event automatically.
3. After confirming the provider state, run `npm run subscription:journal -- resolve EMAIL OPERATION_ID`. Resolution takes the subscriber lock and compares the journal ID before clearing it. It does not modify Resend or send email. An active lease requires waiting for its expiry first.
4. The user can then retry the normal subscription flow if needed.

There is no automatic replay worker: operator reconciliation is deliberate for writes whose delivery outcome cannot be proven. If Redis is unavailable, mutations fail before starting; if it fails mid-operation, the prewritten record remains for investigation. Use deployment logs for the service failure and the email supplied by the affected reader to locate the journal.

## Payment confirmation

The return page reads only server-verified status from Stripe. URL parameters cannot assert payment. Provider failures produce an unverified state, not a prompt to pay again. Checkout Session read permission is required alongside write permission. Entitlements or fulfillment would require a separate verified webhook and durable payment ledger.

## Review evidence

`audit/` holds local screenshots and dated review notes. Git and Vercel exclude it; existing files are retained on disk. These historical observations are not the current issue list and are not shared with a fresh clone. Keep durable decisions and operating instructions in the root documentation. If evidence needs to be shared, prepare a separate reviewed artifact with relative image links and record its date, commit, environment and resolution status; local absolute paths are not portable. CI browser failure evidence is retained for seven days as described in [Resend verification](RESEND_INTEGRATION.md#verification).
