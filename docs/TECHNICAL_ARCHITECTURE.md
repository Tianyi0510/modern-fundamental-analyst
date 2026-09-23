# Architecture and operations

Pages render localized server components; interactive controls use small client boundaries. Pure support amounts and types live in `lib/support-config.ts`. Stripe, Redis, Resend and preference-token modules declare `server-only`. Node tests and the operator CLI load `scripts/register-server.mjs`; application builds use Next.js boundary enforcement.

## Domain and service ownership

As reported by the project owner on 2026-09-22, `modernfundamentalanalyst.com` has transferred from Wix to Vercel. Manage the domain through Vercel; verify the authoritative nameservers before making DNS changes. The canonical website remains `https://www.modernfundamentalanalyst.com`, defined by `SITE_URL` in [lib/site-config.ts](../lib/site-config.ts). A registrar transfer does not require changing application URLs.

Preserve the root and `www` website records and the Resend verification, sending and receiving records for `mail.modernfundamentalanalyst.com`. Use the current provider dashboards for exact DNS values; do not copy historical records or assume that registrar transfer also changed authoritative DNS. See [Resend receiving](RESEND_INTEGRATION.md#receiving) and [Stripe Checkout behavior](STRIPE_INTEGRATION.md#checkout-behavior) for their separate service settings. Provider status recorded here is owner-reported, not a live DNS or delivery verification.

## Production gate

Vercel's configured build command waits up to ten minutes for the latest push CI run on `main` matching `VERCEL_GIT_COMMIT_SHA`. Only `success` proceeds. Preview and local builds skip this gate. Missing metadata, GitHub API errors, cancellation and timeout fail closed. The repository must remain publicly readable, or the gate must gain scoped authentication before making it private. The gate adds wait time to Vercel builds and requires `vercel.json` build commands to remain in effect. Do not put it in `npm run build`: CI itself must build without waiting on its own completion.

## Redis runtime

The application shares one authenticated TLS connection per Node.js process. Concurrent cold requests wait for the same connection to become ready. Configure `UPSTASH_REDIS_URL` with a `rediss://` URL; credentials are never logged.

For production ACL, create a dedicated `mfa_app` user with a generated password and the key pattern `~mfa:*`. Start with no command categories, then allow `+get +set +del +eval +incr +pexpire`. These are the only data commands used by the application, including commands inside its Lua scripts. Allow the connection commands required by node-redis (`+hello +ping +client|setinfo`) if the provider supports them. Do not grant `+@all`, administrative commands, or other key patterns. ACL key patterns do not constrain commands that take no key, so the command allowlist is essential. Keep the `default` credential available until the new user passes an authenticated connection and representative rate-limit, subscription, and journal checks.

The production database currently uses Upstash Free Tier, which does not include ACL according to Upstash's published plan documentation. The owner chose not to upgrade on 2026-09-22, so the ACL user and credential rotation remain pending. After a plan with ACL is approved, create the user in Upstash, verify `ACL DRYRUN` for permitted and denied commands (including another key prefix), and test through a separate TLS connection before changing the Vercel production `UPSTASH_REDIS_URL` to `rediss://mfa_app:<password>@<host>:6379`. Encode URL-sensitive password characters. Redeploy and test the public forms and journal operator CLI, then revoke the old application credential. Keep the password in the provider and Vercel secret settings only; do not put it in Git, logs, test fixtures, or command output. If the new credential fails, restore the previous Vercel value while the old user remains enabled.

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

Playwright defines named Chromium and WebKit projects with separate `test-results/chromium/` and `test-results/webkit/` evidence, so running one browser preserves the other's results. CI retries a failed case once and records its first retry trace; local runs keep a trace only for failed cases. Failure screenshots are retained in both environments. GitHub Actions uploads failed browser evidence for seven days. Locale and viewport variants are separate tests so a retry targets the failing case rather than rerunning every variant.

`npm run verify` builds once and runs Chromium against the production server. The subsequent CI WebKit step tests that same build in two sequential shards, each with one worker and a fresh browser process, to avoid a long-lived WebKit worker stalling late in the suite. Local `npm run test:computed-style` remains available for faster checks against the development server. Playwright starts and stops its own server on port 3210 for each suite or shard.

The split follows the [Next.js testing guide](https://nextjs.org/docs/app/guides/testing): Node's isolated test runner covers service logic, while Playwright checks rendered pages and interactions against a production build. Browser project and retry-trace settings follow the [Playwright projects](https://playwright.dev/docs/test-projects) and [trace viewer](https://playwright.dev/docs/trace-viewer) guides.

## Portfolio data

`data/portfolio.ts` is the site's portfolio data store; Redis only supports service coordination and rate limiting. Home, Portfolio and Performance share this snapshot. The Performance chart uses since-inception annualized XIRR at each month-end, not single-month returns; horizons below 30 days remain unavailable.

The 2026-08-31 update uses `portfolio-return-analysis-monthly-xirr.xlsx` (statement-backed revision): `August Statement!A16:D33` for 18 holdings and `Monthly XIRR!A5:H25` for the history. The original `portfolio-return-analysis-2026-07-31.xlsx` supplies unchanged cost bases, net dividends and financing interest; the August revision reports no added cash flows. Stocks total USD 121,301.99. Idle cash is excluded. Original July tabs remain historical snapshots; do not use the provisional August estimates.

Keep source precision until display formatting. Portfolio cumulative return includes net dividends and deducts financing interest; individual holding returns remain market-value-versus-cost calculations. On each update, reconcile quantities and price × shares, totals, the latest XIRR observation and snapshot date; run the portfolio regression and browser suites. Do not commit source statements, account identifiers or local source paths.

The latest history row supplies the shared snapshot date and both XIRRs; do not maintain duplicate headline values. Holdings remain the source of aggregate cost and market value. Retain the independently reported monthly market value for reconciliation rather than replacing it with a calculated total. CI checks unique holdings, finite nonnegative inputs, consecutive calendar month-ends, paired XIRR availability and agreement between the latest history and holdings.

The application and CI require only Node.js. Python is optional for offline Excel extraction or independent XIRR reconciliation; it is not a website runtime or deployment dependency. Review extracted values before updating the versioned data, and never publish private workbook contents automatically.
