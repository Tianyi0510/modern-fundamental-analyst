# Repository guidance

This file defines repository-wide defaults. Follow the user's current request when it changes these defaults. More specific instructions in an applicable nested `AGENTS.md` take precedence for that subtree; an `AGENTS.override.md` takes precedence over `AGENTS.md` in the same directory.

## Working agreement

- Communicate with the user in Traditional Chinese unless requested otherwise.
- For a read-only review, report findings with file locations and practical impact; do not edit files.
- For optimization requests, implement the agreed scope and verify it. Commit or deploy when requested; a deployment request includes the necessary commit and push.
- Inspect `git status` before editing. Preserve unrelated work and local review evidence. Stage only intended files.
- Report what changed, what was checked, any remaining limitations, and whether changes were committed or deployed. Distinguish local verification from production verification.

## Project map

- Next.js App Router, React, TypeScript and native CSS; use Node.js 24 and npm. Install dependencies with `npm ci`.
- `app/(en)/`, `app/zh-tw/`, `app/zh-cn/`: thin language routes and root layouts. English URLs have no language prefix.
- `components/`: shared page content and interactive controls. Keep static copy in server components and client boundaries small.
- `data/`: localized copy, portfolio snapshot and memo catalog. `content/memos/`: article content, registered in `data/memo-content.ts`.
- `lib/`: shared utilities, calculations and service integrations. `scripts/`: CI gate, Node module loader and journal CLI.
- `tests/*.test.mjs`: Node unit tests. `tests/*.spec.ts`: Playwright browser checks.

## Implementation rules

- Use `getLocalizedPath` and `getLanguageAlternates` from `lib/i18n.ts` for language URLs. Use `createRootMetadata` and `createPageMetadata` from `lib/site-config.ts` for metadata.
- Reuse `lib/escape-html.ts` for HTML interpolation and `HoneypotField` for the existing form trap. Do not duplicate helpers or pass values that can be derived from existing props.
- Preserve each form's submission, idempotency and retry behavior. Similar markup does not imply identical workflows. Reuse the existing submission hooks and `postJson` where appropriate.
- Keep provider credentials and service modules on the server. Preserve `server-only` boundaries; the Node test loader is not a replacement for Next.js boundary enforcement.
- Prefer focused changes over new frameworks or broad abstractions. Keep deliberate language, layout and form variants explicit.
- Preserve verified portfolio data and research content unless the task requests a content update. Portfolio values are monthly snapshots, not live prices.

## Visual and interaction rules

- Follow [STYLE_GUIDE.md](STYLE_GUIDE.md) for CSS ownership, cascade, typography, spacing and states.
- Preserve existing text colors, including hover, active, disabled and inverse states, unless the user requests a color change. Opacity can also change perceived text color.
- Reuse semantic type, spacing, focus and motion tokens. Preserve the import order in `app/globals.css` and scoped component styles.
- Check all three languages, narrow layouts, enlarged text, keyboard focus, touch interactions and reduced motion when changing shared UI.
- Keep focus management, scroll restoration and menu visibility synchronized. Touch hover resets must preserve active and keyboard-focus feedback.

## Service invariants

- Consult [RESEND_INTEGRATION.md](RESEND_INTEGRATION.md), [UPSTASH_REDIS.md](UPSTASH_REDIS.md) and [STRIPE_INTEGRATION.md](STRIPE_INTEGRATION.md) for the integration being changed.
- Use `.env.example` as the configuration template. Never commit or print secrets, private email payloads or preference tokens. Historical resource IDs in documentation do not establish current cloud configuration.
- Route Redis commands through `executeRedisCommand`. Preserve shared subscriber locking and durable journals; an expired lease does not resolve an unknown provider outcome.
- Follow [ARCHITECTURE.md](ARCHITECTURE.md#subscription-reconciliation) for journal inspection and reconciliation. Do not clear unresolved records or automatically replay ambiguous welcome events as a retry fix. Preserve unsubscribe availability under the shared lock.
- Payment success requires server-side Stripe Session verification. URL parameters cannot prove payment. Preserve pending and unverified states.
- Routine tests should mock provider writes. Sending real email, changing production subscriber state or making a live payment requires authorization for that action; deploying alone does not authorize test transactions.

## Verification

- For application changes, run `npm run verify` (typecheck, lint, unit tests, Chromium tests and production build).
- Install browser binaries when needed: `npx playwright install chromium webkit`.
- For shared UI changes, also run `PLAYWRIGHT_USE_PRODUCTION_BUILD=1 npm run test:computed-style -- --browser=webkit --workers=1` after a successful build.
- Prefer behavioral regression checks for changed risks. Update source-structure assertions when refactoring, while preserving coverage of user-visible behavior. Do not weaken assertions merely to make a failure disappear.
- Documentation-only changes need link, reference and diff checks; they do not require the full application suite.
- Run `git diff --check` before handing off. Preserve ignored `audit/` files as local historical evidence; they are not the current issue list.

## Deployment

- Use the existing GitHub Actions and Vercel Git integration. Push authorized releases to `main`; if a new working branch is needed, use `codex/` unless otherwise requested.
- Preserve `vercel.json`'s exact-commit CI gate. Do not bypass failed checks or move the gate into `npm run build`, which CI itself must run.
- Inspect CI failures and fix their cause. Preserve package integrity checks and the browser suite; keep runner-specific installation workarounds in the workflow rather than treating them as permanent application requirements.
- Confirm GitHub Actions success, Vercel `READY`, the deployed commit and production aliases before reporting deployment complete. Perform read-only smoke checks of affected routes.
- Keep [README.md](README.md) concise; put detailed operating procedures in [ARCHITECTURE.md](ARCHITECTURE.md) and integration guides. Update documentation when behavior or commands change.

## Code Review Rules

- Flag localized links or sharing metadata that point to the wrong language or page. Use the existing i18n and metadata helpers; localized wording may intentionally differ.
- Flag changes to existing text colors or opacity when color changes are outside the requested scope. Verify keyboard focus and reduced-motion behavior for shared interaction changes.
- Flag subscription writes that bypass the shared lock or journal, or retries that replay an unknown provider outcome. Unsubscribe intentionally bypasses the journal gate while retaining the lock and unresolved record.
- Flag payment confirmation derived only from URL parameters. Keep server-side Session verification and preserve pending or unverified outcomes.
- Flag credentials or private provider payloads crossing client boundaries, entering logs or being committed. Use server modules and bounded diagnostic details.
- Prioritize demonstrable defects and regressions with precise file locations and consequences. Leave formatting and lint enforcement to CI; do not label intentional variants as defects solely to reduce duplication.

## Maintaining this guidance

Keep this file focused on reusable repository rules and executable commands. Link detailed procedures instead of copying them. Add nested guidance only when a subtree needs different rules; avoid duplicate or speculative restrictions. After changing instruction files, verify the active instruction sources in a new Codex run from the intended working directory.

Reference: [Official AGENTS.md configuration guide](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
