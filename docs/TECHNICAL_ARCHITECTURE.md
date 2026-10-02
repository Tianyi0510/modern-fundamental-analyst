# Technical Architecture

This guide owns cross-service boundaries, domain ownership, deployment gating, and review evidence. Service-specific procedures remain in the [Redis](UPSTASH_REDIS_INTEGRATION.md), [Resend](RESEND_INTEGRATION.md), and [Stripe](STRIPE_INTEGRATION.md) guides.

## Application boundaries

Pages render localized server components; interactive controls use small client boundaries. Pure support amounts and types live in `src/features/support/support-config.ts`. Stripe, Redis, Resend and preference-token modules declare `server-only`. Node tests and the operator CLI load `src/testing/register-server.mjs` to resolve TypeScript imports and transpile TSX for email rendering. This loader bypasses the `server-only` marker for Node entry points and does not type-check; TypeScript checks and Next.js build-time boundary enforcement remain separate.

`src/app/_components` composes page chrome and feature content, including the Home page's portfolio and memo sections. `src/features` groups `portfolio`, `memos`, `subscriptions`, `contact`, and `support`. Feature data, CSS Modules, domain types, and controls stay with their owner; provider operations and coordination live in feature `server` directories. Shared utilities and clients remain in `src/lib`, and shared UI in `src/components`.

Transactional email templates stay in their owning features and share `src/components/email-layout.tsx`. Each feature’s `previews/` directory composes fictional local previews; see [email templates](RESEND_INTEGRATION.md#email-templates-and-local-preview). The preview composition imports templates without importing service modules. Production rendering runs in server delivery paths, and preference retries retain their stored HTML and plain text.

Dependencies flow from application composition to features to shared modules. Features do not import other features or the application; ESLint enforces these boundaries. Use direct module imports, not barrels that mix server and client code. The application supplies the footer's subscription slot and injects the welcome memo provider into subscription orchestration. The provider is called only after confirming that the contact is not already subscribed.

Browser forms call typed request functions in their owning feature's `contact-api.ts` or `subscription-api.ts`. These functions own endpoints and input contracts and use the shared `postJson` transport for bounded requests, HTTP errors and idempotency headers. They return successful completion without asserting an unvalidated JSON response type. Routes still validate untrusted input at runtime. The preference mutation route validates HTTP input and tokens, then maps the feature service's result to an HTTP response; subscriber locks, journals, language synchronization, rollback and unsubscribe belong to `server/update-subscription-preferences.ts`.

Each page has one focusable main landmark, with navigation and the footer outside it. Three language-specific catch-all routes reuse localized 404 views. Payment verification and saved email preferences stream through local Suspense boundaries; ordinary Support visits and retry errors resolve their native form before streaming so they work without JavaScript. The header and hero do not wait for provider responses. Locale-specific error boundaries expose retry and home actions, while the global error uses a minimal document fallback. Error views do not display raw errors or provider data.

Language links accept a server-validated query allowlist. Preference links retain only a valid token. Support links retain recognized status, a validated Session ID, or a complete recovery attempt with its amount and original checkout locale. Query parameters never confirm payment. Article metadata and safely serialized Article JSON-LD derive from the localized memo catalog, without inventing modification dates.

```mermaid
flowchart LR
    Visitor[Browser] --> Pages[Localized Next.js pages]
    Pages --> Data[Workspace portfolio and memo data]
    Visitor --> API[Next.js API routes]
    API --> Redis[Upstash Redis]
    API --> Resend[Resend]
    API --> Stripe[Stripe Checkout]
    Resend --> Webhook[Signed webhook route]
    Webhook --> Redis
```

Portfolio and memo pages read versioned workspace data at build or request time; Redis is not their source of truth. Contact and subscription routes call Resend. Redis supplies rate limiting, subscriber locks, retry payloads and a durable journal around uncertain subscriber writes. Rate limiting has a local fallback, while subscription and preference mutations fail closed if coordination is unavailable. The Support route creates a hosted Stripe Session; the return page verifies payment status server-side. The Resend webhook accepts signed delivery feedback and shares the subscriber lock. See the service guides for failure recovery and operator actions.

## Presentation and style loading

The root layout loads `src/app/globals.css` once. PostCSS compiles Tailwind's theme and utilities; tokens remain a single source for both utility aliases and CSS Modules. The `base` layer contains the site's only normalization and document defaults. Preflight is not imported. Component-specific global selector files have been removed.

Pages assemble server-rendered `Container`, `PageHero`, button links and feature content. Customized shadcn/ui Button, Input and Textarea sources live in `src/components/ui`, with finite variants and `cn` from `src/lib/utils`. Their native elements need no Radix provider or runtime, and preserve server rendering and native forms. `components.json` configures future source installation without replacing the site theme or reset. Shared primitives are not client entry points; only interactive owners declare `use client`. Adjacent private `*.styles.ts` maps contain complete static utility strings, keeping large owned layouts readable without creating shared global selectors. CSS Modules are imported by their component for chart structure and complex motion. Features keep business components and services within their boundary. Email styles do not import website utilities or modules.

Mobile navigation has explicit opening, open, closing and closed phases. The same state controls modal isolation, focus and scroll restoration. Its measured panel and icon animations use Web Animations API; CSS does not transition those properties simultaneously. Native disclosures remain usable without JavaScript, and enhanced closing content is inert until reopened. Provider contracts, localized routes, workspace financial data and checkout recovery remain independent of presentation.

For presentation migrations, retain screenshots and computed styles before changes, compare in the same browser and viewport, and measure production assets before making performance claims. Verify direct requests, client navigation and browser return against the production build; development hot reload is not evidence of production style ordering. Keep behavioral assertions independent of utility class strings. Physical iPhone checks remain separate from WebKit automation.

## Domain and service ownership

As reported by the project owner on 2026-09-22, `modernfundamentalanalyst.com` has transferred from Wix to Vercel. Manage the domain through Vercel; verify the authoritative nameservers before making DNS changes. The canonical website remains `https://www.modernfundamentalanalyst.com`, defined by `SITE_URL` in [src/lib/site-config.ts](../src/lib/site-config.ts). A registrar transfer does not require changing application URLs.

Preserve the root and `www` website records and the Resend verification, sending and receiving records for `mail.modernfundamentalanalyst.com`. Use the current provider dashboards for exact DNS values; do not copy historical records or assume that registrar transfer also changed authoritative DNS. See [Resend receiving](RESEND_INTEGRATION.md#receiving) and [Stripe Checkout behavior](STRIPE_INTEGRATION.md#checkout-behavior) for their separate service settings. Provider status recorded here is owner-reported, not a live DNS or delivery verification.

## Test workflow

Test selection follows [Bulletproof React's testing guidance](https://github.com/alan2207/bulletproof-react/blob/master/docs/testing.md): verify observable outcomes and prioritize integrations at service boundaries. Node tests call real route handlers and services with provider I/O mocked, while Playwright covers user interactions against the isolated application. Render real components through the shared loader instead of compiling a separate copy inside each test. Compare generated metadata, redirects, provider payloads and recovery state rather than searching for implementation names. Keep source assertions only for explicit architecture or configuration constraints that runtime tests cannot establish, such as the `server-only` declaration. Retain failures, interrupted operations and idempotent retries when consolidating cases; test count alone is not a coverage measure.

The Node loader and shared test helpers live in `src/testing/`; the WebKit runner and production gate live in `.github/`. The journal CLI lives beside the subscription service in `src/features/subscriptions/server/subscription-journal-cli.mjs` and shares the Node loader through `npm run subscription:journal`. These entry points remain separate from application imports.

Module and component tests live beside their implementation in `src` as `*.test.mjs`. The Node runner discovers them recursively alongside configuration checks beside the root configuration and in `.github/`; Playwright discovers colocated `src/**/*.spec.ts` browser workflows. Test files are not imported by application entry points. The Node loader supports application TypeScript and TSX imports without changing the existing test format.

Both GitHub Actions jobs use the Node version in `.nvmrc` and install locked dependencies with `npm ci`. The `verify` and `webkit` job names remain stable for branch protection. They run independently; neither job's success alone completes CI.

| Job      | Runner | Execution order                                                                                               |
| -------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| `verify` | Ubuntu | Install, production dependency audit, `verify:static`, build, Chromium installation, production browser tests |
| `webkit` | macOS  | Install, build, WebKit installation, shard 1, shard 2                                                         |

Static failures stop the Ubuntu job before browser installation or compilation. Both jobs build before downloading their browser, so build failures avoid that setup cost. Each operating system builds its own output; neither reuses an application build from another runner. The existing 15-minute Ubuntu and 20-minute macOS job limits remain in effect.

For a local non-deployment change, use affected tests and checks. `npm run verify:static` is the aggregate command when all static checks and unit tests are warranted. `npm run verify` runs those checks, builds once, and checks Chromium against that build. `npm run test:webkit` expects a current production build and installed WebKit browser; it does not build again.

The shared [`run-webkit.mjs`](../.github/run-webkit.mjs) starts two fresh, sequential Playwright processes with one worker each. Ordinary test failures do not skip the second shard, and either shard failing makes the combined command fail. Launch errors and interruption stop execution. Use `npm run test:webkit -- --shard=1` or `--shard=2` to rerun a specific shard; append `--grep` or a test path for focused local checks. Filtered runs are not a complete release check. `npm run test:webkit -- --list` validates discovery without running browsers.

CI invokes the same runner in separate steps so it can retain both results. Shard 2 runs after shard 1 fails only if the build and browser installation succeeded and the job was not cancelled. Evidence directories remain separate; see [review evidence](#review-evidence).

## Release workflow

1. Push the reviewed changes to the pull request branch. Confirm both CI jobs and the Vercel Preview for that revision; a successful preview does not establish production readiness.
2. When release is authorized, complete the required local release checks, merge the reviewed PR into `main`, and record the resulting commit SHA. PR checks cannot substitute for the main-branch push run because the release SHA may differ.
3. Let Vercel's Git integration run the production gate below. Wait for successful CI for the release SHA, a `READY` production deployment, and matching deployed commit and production aliases before reporting completion.
4. If CI or deployment fails, inspect the failed step and retained evidence, correct the cause, and rerun the appropriate workflow or deployment. Do not bypass the exact-commit gate or promote an unrelated preview. A timed-out gate may be retried after the same release commit has passed CI.
5. After successful production deployment, clean up the merged feature branch when authorized. Fetch the latest refs, confirm the PR is merged and the branch tip is included in `main`, and check for commits added after the merge. Switch to `main`, update it with a fast-forward, delete the remote branch, and use `git branch -d` for the local branch. Preserve branches with unmerged or ongoing work. For a squash or rebase merge, commit ancestry may differ; verify the changes separately rather than forcing deletion automatically. Git history and the closed PR retain the review record. Start the next task from the latest `main` on a new `codex/` branch.

A PR update does not authorize merging or production deployment. Optional production browser smoke checks are reported separately from deployment completion. CI credentials remain read-only and the existing Git integration requires no new deployment token. New runs supersede older runs on the same ref through workflow concurrency; a cancelled release run cannot pass the gate.

## Production gate

Vercel's configured build command waits up to 30 minutes for the latest push CI run on `main` matching `VERCEL_GIT_COMMIT_SHA`. The macOS job allows 20 minutes of execution; the extra wait covers ordinary queueing while leaving build headroom under Vercel's [45-minute build limit](https://vercel.com/docs/limits#build-time-per-deployment). Longer queues can still time out and require a fresh deployment of the verified commit. Only `success` proceeds. Preview and local builds skip this gate. Normal polling runs once per minute. Transient network, response-body read, JSON parsing, malformed response and server failures back off up to four minutes. The failure count resets only after a complete response has been parsed and validated; rate-limit responses honor `Retry-After` and quota-reset headers within the same total deadline. Missing metadata, non-retryable API errors, cancellation and timeout fail closed. No additional GitHub credential is required for the public repository. The repository must remain publicly readable, or the gate must gain scoped authentication before making it private. The gate adds wait time to Vercel builds and requires `vercel.json` build commands to remain in effect. Do not put it in `npm run build`: CI itself must build without waiting on its own completion.

## Review evidence

`audit/` holds local screenshots and dated review notes. Git and Vercel exclude it; existing files are retained on disk. These historical observations are not the current issue list and are not shared with a fresh clone. Keep durable decisions and operating instructions in the relevant tracked guide. If evidence needs to be shared, prepare a separate reviewed artifact with relative image links and record its date, commit, environment and resolution status; local absolute paths are not portable.

The Ubuntu Chromium and macOS WebKit CI jobs run independently; the workflow and exact-commit production gate succeed only when both pass. Browser variants are separate cases so retries target the failure. WebKit uses fresh browser processes across two sequential shards because a long-lived worker previously stalled late in the suite. CI retains traces from failed attempts and all retries, including retries that pass, plus screenshots of failed attempts. Artifacts are uploaded even when the job ultimately passes and retained for seven days. WebKit shards run in separate steps and write to distinct `node_modules/.cache/playwright/webkit-shard-1/` and `node_modules/.cache/playwright/webkit-shard-2/` directories so the second run cannot erase the first run's evidence. Local failures retain traces in `node_modules/.cache/playwright/`. See [`playwright.config.ts`](../playwright.config.ts), [`ci.yml`](../.github/workflows/ci.yml), and [README verification](../README.md#verification) for current commands, project settings and artifact paths.

The split follows the [Next.js testing guide](https://nextjs.org/docs/app/guides/testing): Node's isolated test runner covers service logic, while Playwright checks rendered pages and interactions against a production build. Browser project, shard and retry-trace settings follow the [Playwright projects](https://playwright.dev/docs/test-projects), [sharding](https://playwright.dev/docs/test-sharding) and [trace viewer](https://playwright.dev/docs/trace-viewer) guides.
