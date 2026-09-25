# Technical Architecture

This guide owns cross-service boundaries, domain ownership, deployment gating, and review evidence. Service-specific procedures remain in the [Redis](UPSTASH_REDIS_INTEGRATION.md), [Resend](RESEND_INTEGRATION.md), and [Stripe](STRIPE_INTEGRATION.md) guides.

## Application boundaries

Pages render localized server components; interactive controls use small client boundaries. Pure support amounts and types live in `lib/support-config.ts`. Stripe, Redis, Resend and preference-token modules declare `server-only`. Node tests and the operator CLI load `scripts/register-server.mjs`; application builds use Next.js boundary enforcement.

## Domain and service ownership

As reported by the project owner on 2026-09-22, `modernfundamentalanalyst.com` has transferred from Wix to Vercel. Manage the domain through Vercel; verify the authoritative nameservers before making DNS changes. The canonical website remains `https://www.modernfundamentalanalyst.com`, defined by `SITE_URL` in [lib/site-config.ts](../lib/site-config.ts). A registrar transfer does not require changing application URLs.

Preserve the root and `www` website records and the Resend verification, sending and receiving records for `mail.modernfundamentalanalyst.com`. Use the current provider dashboards for exact DNS values; do not copy historical records or assume that registrar transfer also changed authoritative DNS. See [Resend receiving](RESEND_INTEGRATION.md#receiving) and [Stripe Checkout behavior](STRIPE_INTEGRATION.md#checkout-behavior) for their separate service settings. Provider status recorded here is owner-reported, not a live DNS or delivery verification.

## Production gate

Vercel's configured build command waits up to ten minutes for the latest push CI run on `main` matching `VERCEL_GIT_COMMIT_SHA`. Only `success` proceeds. Preview and local builds skip this gate. Missing metadata, GitHub API errors, cancellation and timeout fail closed. The repository must remain publicly readable, or the gate must gain scoped authentication before making it private. The gate adds wait time to Vercel builds and requires `vercel.json` build commands to remain in effect. Do not put it in `npm run build`: CI itself must build without waiting on its own completion.

## Review evidence

`audit/` holds local screenshots and dated review notes. Git and Vercel exclude it; existing files are retained on disk. These historical observations are not the current issue list and are not shared with a fresh clone. Keep durable decisions and operating instructions in the relevant tracked guide. If evidence needs to be shared, prepare a separate reviewed artifact with relative image links and record its date, commit, environment and resolution status; local absolute paths are not portable.

Playwright defines named Chromium and WebKit projects with separate `test-results/chromium/` and `test-results/webkit/` evidence, so running one browser preserves the other's results. CI retries a failed case once and records its first retry trace; local runs keep a trace only for failed cases. Failure screenshots are retained in both environments. GitHub Actions uploads failed browser evidence from each job under a distinct artifact name for seven days. Locale and viewport variants are separate tests so a retry targets the failing case rather than rerunning every variant.

Locally, `npm run verify` builds once and runs Chromium against the production server; `npm run test:webkit` can then test the same build. In CI, the Ubuntu `verify` job and macOS `webkit` job have no dependency and run in parallel. Each runner installs only its browser and creates its own production build; the overall workflow succeeds only when both jobs succeed, which keeps the exact-commit production gate intact. The macOS WebKit job runs two sequential, test-level shards, each with one worker and a fresh browser process, to avoid a long-lived WebKit worker stalling late in the suite. Test-level sharding balances the number of cases across the two runs. Local `npm run test:computed-style` remains available for faster checks against the development server. Playwright starts and stops its own server on port 3210 for each suite or shard. Browser tests check response headers from the running Next.js server rather than matching configuration-file text.

The split follows the [Next.js testing guide](https://nextjs.org/docs/app/guides/testing): Node's isolated test runner covers service logic, while Playwright checks rendered pages and interactions against a production build. Browser project, shard and retry-trace settings follow the [Playwright projects](https://playwright.dev/docs/test-projects), [sharding](https://playwright.dev/docs/test-sharding) and [trace viewer](https://playwright.dev/docs/trace-viewer) guides.
