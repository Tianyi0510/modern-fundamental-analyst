# AGENTS.md

Repository-wide instructions for Modern Fundamental Analyst. Follow explicit user requests within higher-priority instructions; more specific `AGENTS.md` files govern their subtree. Codex also supports `AGENTS.override.md` in place of `AGENTS.md` in the same directory.

## Project context

An investor-research website using Next.js App Router, React, TypeScript, Tailwind CSS and CSS Modules. Use Node.js 24 and npm; `package.json` and `package-lock.json` define the installed stack. English routes have no prefix; Chinese routes use `/zh-tw` and `/zh-cn`.

- `src/app`: routes and application composition; page components live in `_components`.
- `src/features`: domain code, data, UI and owned styles. Features must not import other features or `app`.
- `src/components` and `src/lib`: shared UI and utilities; neither imports the feature or application layers.
- `scripts`: shared test helpers, Node loader and CI tooling. See [README](README.md#project-layout) for the full directory map.

## Working agreement

- Use Traditional Chinese for ordinary communication unless requested otherwise. Formal code-review output, including summaries, findings and follow-ups, must be English without emojis. Code comments and GitHub issue/PR comments must also be English without emojis.
- Write documentation prose in English. Include non-English text only for an exact runtime/provider value needed for an operation, identifying its source in code.
- Reviews are read-only unless changes are requested. For implementation, finish the authorized change and affected verification; resolve routine choices without unnecessary confirmation.
- Inspect `git status` before edits; preserve unrelated changes and ignored `audit/` evidence. Historical audit files are not the current issue list. Stage only intended files.
- Commit, open a PR or deploy when requested. A deployment request includes the required commit, push and merge; a PR-only request does not authorize merging. Report changes, checks, limitations and release status accurately.

## Commands

Run from the repository root containing `package.json`. Use focused checks during development; the full-suite commands below are for CI, explicit requests or diagnosis.

| Task | Command |
| --- | --- |
| Install locked dependencies | `npm ci` |
| Development server | `npm run dev` |
| Production build / server | `npm run build` / `npm run start` |
| Type checking | `npm run typecheck` |
| Lint selected files | `npx eslint <files> --max-warnings=0` |
| Check / format selected files | `npx prettier --check <files>` / `npx prettier --write <files>` |
| Vitest unit / integration tests | `npm run test:unit` / `npm run test:integration`; append `-- <test-path>` to filter |
| Vitest watch mode | `npm run test:watch` |
| Browser E2E tests | `npm run test:e2e -- <spec-files> --project=chromium` (or `webkit`) |
| Selected Node tests | `node --import ./scripts/register-server.mjs --test <test-files>` |
| Selected browser tests | `npx playwright test <spec-files> --project=chromium` (or `webkit`) |
| Production browser tests | After building: `PLAYWRIGHT_USE_PRODUCTION_BUILD=1 npx playwright test <spec-files> --project=chromium` (or `webkit`) |
| Full static checks | `npm run verify:static` |
| Full static, build and production Chromium checks | `npm run verify` |
| Mobile production WebKit checks | After building: `npm run test:webkit`; select a shard with `-- --shard=1` or `-- --shard=2` |

Replace angle-bracket placeholders with real paths. Install missing browsers with `npx playwright install chromium webkit`. Playwright starts an isolated server on port 3210 with provider credentials disabled; preserve that isolation. `npm test` runs the existing Node suite plus Vitest unit and integration projects. E2E tests use Playwright separately; CI runs the production browser matrix. Chromium covers all cases; WebKit selects `@mobile` cases with iPhone 13 emulation. Tag phone-only cases explicitly; desktop and cross-breakpoint cases remain in Chromium. Husky's pre-commit hook checks staged formatting and JavaScript/TypeScript lint; it does not replace CI.

## Task references

Read only the guides relevant to the task; update them when behavior or commands change. Keep README concise and detailed procedures in `docs/`.

| Area | Guide |
| --- | --- |
| UI, CSS, typography and motion | [Style Guide](docs/STYLE_GUIDE.md) |
| Architecture, services, tests and releases | [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) |
| Portfolio snapshots and calculations | [Portfolio Data](docs/PORTFOLIO_DATA.md) |
| Email and subscriptions | [Resend](docs/RESEND_INTEGRATION.md) |
| Subscriber coordination and recovery | [Redis runtime](docs/UPSTASH_REDIS_INTEGRATION.md#redis-runtime) and [reconciliation](docs/UPSTASH_REDIS_INTEGRATION.md#subscription-reconciliation) |
| Payments | [Stripe](docs/STRIPE_INTEGRATION.md) |

Before changing Next.js APIs, routing or configuration, read the relevant installed-version guide in `node_modules/next/dist/docs/`; if unavailable, use matching official Next.js documentation. Do not assume tools or patterns from another React starter are installed here.

## Implementation constraints

- Use `getLocalizedPath` / `getLanguageAlternates` from `src/lib/i18n.ts` and `createRootMetadata` / `createPageMetadata` from `src/lib/site-config.ts`. Links and metadata must identify the correct locale and page.
- When changing website copy, search all test files, fixtures and snapshots for the previous text, accessible names and related translations. Update every affected assertion and run the relevant Node, component and browser tests; do not weaken behavioral checks to accommodate new wording.
- Keep copy with its owning page/component, use server components for static content and minimize client boundaries. Reuse `escape-html`, `HoneypotField`, submission hooks and `postJson`; preserve each form's submission, idempotency and retry semantics.
- Preserve deliberate language, layout and form variants. Do not change verified research or monthly portfolio snapshots without a content-update request; they are not live prices.
- Preserve text colors and opacity across states unless a color change is requested. Define color values in `src/app/styles/tokens.css` and reference those tokens from Tailwind and CSS Modules.
- Keep `globals.css` to layers/imports/variants and `base.css` to the single reset/document defaults. Use complete static utility classes for normal layout/states, adjacent CSS Modules for complex owned motion, and inline styles for data/measurements. Share appearance through finite component variants; do not override another component's internals.
- Use ESLint and Prettier with `prettier-plugin-tailwindcss`; keep its stylesheet entry aligned with `src/app/globals.css`. Formatting does not validate CSS behavior.
- Synchronize menu visibility, focus, interactivity and scroll restoration. Use one state source and one animation owner per property; handle interruption, reversal, cancellation, reduced motion and unmount. Touch hover resets must preserve active and keyboard-focus feedback.

## Service boundaries

- Keep credentials and service modules server-side with `server-only` boundaries; the Node test loader does not enforce Next.js boundaries. Use `.env.example`; never print or commit secrets, private email payloads or preference tokens. Verify current cloud configuration instead of trusting historical resource IDs.
- Route Redis operations through `executeRedisCommand`. Preserve subscriber locks and durable journals. Expired leases do not resolve unknown provider outcomes: do not clear unresolved records or replay ambiguous welcome events. Unsubscribe keeps the lock and unresolved journal while bypassing the journal gate.
- Signup requests confirmation only. Activate consent through an explicit confirmation POST under the subscriber lock/journal; GET must not change consent. Preserve replay protection, recipient delivery limits, durable feedback suppression and webhook deduplication. Failed welcome delivery must not undo confirmed consent. Keep preference links and the stable secret compatible; do not silently rotate keys or clear suppression.
- Verify Stripe Sessions server-side; URL parameters cannot establish payment success. Preserve pending and unverified states.
- Mock provider writes in routine tests. Real email, production subscriber changes and live payments require authorization for those actions; deployment does not authorize test transactions.

## Verification and review

Local work owns affected checks; CI owns full verification; deployment owns release identity and live status. Do not routinely repeat full local suites before release. Fix related failures within scope; repeat passed checks only after relevant changes or unresolved failures.

| Change | Completion checks |
| --- | --- |
| Documentation | Validate commands, links, anchors and references; run `git diff --check` |
| Application/configuration | Affected type, lint, format and behavioral checks; `git diff --check` |
| Shared UI | Targeted browser checks for affected interactions, keyboard, touch and reduced motion; production-style checks when style loading changes |
| Deployment | The release gate below; no routine full local rerun |

- Colocate Vitest unit tests as `*.test.ts`, Testing Library/MSW component integrations as `*.test.tsx`, and Playwright browser workflows as `*.spec.ts`. Existing `*.test.mjs` tests retain the Node runner (`npm run test:node`); keep configuration tests beside their configuration. Shared test helpers belong in `scripts/`. Update discovery and commands when moving tests; MSW handlers must cover all integration-test requests; reset handlers and clean up mounted components after each test.
- Test observable outcomes and service integrations with provider I/O mocked. Preserve failure/retry coverage and user-visible assertions. Reserve source assertions for explicit architecture/configuration constraints that runtime tests cannot establish.
- For animation changes, check intermediate states and repeated/interrupted input. WebKit automation does not establish physical iPhone behavior.
- Review findings need demonstrable impact, precise file locations and plain severity labels such as `[P1]`. Leave formatting to lint; intentional variants are not defects solely because they repeat markup.
- Authored review rules do not control provider-generated summaries, reactions or boilerplate. Verify provider settings before claiming those outputs changed.

## Deployment completion

Use GitHub Actions and the Vercel Git integration. Follow the [release workflow](docs/TECHNICAL_ARCHITECTURE.md#release-workflow):

1. Start new changes from current `main` on a `codex/` branch; reuse an existing branch/PR for ongoing work. Target PRs at `main` and review their diff and required CI before merging. Direct pushes to `main` require an explicit request.
2. For an authorized deployment, merge the verified PR and record the resulting release SHA. PRs run full CI; main may reuse recent full PR evidence only when `scripts/ci-plan.mjs` verifies an identical Git tree and all required jobs. Missing or uncertain evidence requires full CI.
3. Declare deployment complete only after release CI succeeds, Vercel is `READY`, and its deployed SHA and production aliases match the intended release. Preview readiness or CI success alone is insufficient.
4. Report completion promptly. Production smoke checks are optional unless requested or evidence indicates a failure; report incomplete diagnostics separately.
5. After successful deployment, safely delete the local merged feature branch after checking for unmerged work and switching away. Preserve active branches. GitHub deletes the merged remote branch automatically.

Preserve the stable `verify` and `webkit` result jobs, package-integrity checks, browser coverage and `vercel.json`'s exact-commit production gate. Keep the gate outside `npm run build` and runner workarounds in the workflow. Fix failed checks rather than bypassing them.

## Maintaining this file

Keep durable project constraints, verified commands and task-specific references here; put detailed procedures in linked guides. Consolidate duplicates and add nested instructions only for genuine subtree differences. Preserve referenced heading anchors. After edits, verify instruction-file discovery from the intended directory; a fresh Codex session is needed to confirm automatic loading of changed instructions.

Format reference: [AGENTS.md](https://agents.md/).
