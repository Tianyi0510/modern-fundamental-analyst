# AGENTS

Repository-wide defaults; follow the user's current request when it changes the task scope. More specific `AGENTS.md` instructions apply to their subtree; `AGENTS.override.md` takes precedence in the same directory.

## Working agreement

- Communicate in Traditional Chinese unless requested otherwise. Read-only reviews produce findings with file locations and practical impact, without edits.
- Write code comments, GitHub issue comments, pull request comments and review comments in English only, without emojis.
- Write project documentation prose in English. Include non-English text only when an exact runtime or provider value is needed for an operation, and identify its source in code.
- For implementation or optimization, finish the requested change, verify its behavior, and fix related failures before handing off. Resolve routine choices within the authorized scope; ask when missing information materially changes the outcome.
- Inspect `git status` before editing, preserve unrelated work, and stage only intended files. Keep ignored `audit/` evidence; it is historical context, not the current issue list.
- Commit, create a pull request or deploy when requested. Deployment includes the necessary commit, push and pull request merge. A request to create or update a pull request alone does not authorize merging or deployment. Report changes, verification, remaining limitations, and commit/pull request/deployment status; distinguish local checks from production checks.

## Project context and task references

Next.js App Router, React, TypeScript, Tailwind CSS and CSS Modules; Node.js 24 and npm (`npm ci`). English routes have no prefix; Chinese routes use `/zh-tw` and `/zh-cn`. See [README.md](README.md#project-layout) for the directory map.

Before changing Next.js APIs, routing conventions or configuration, read the relevant installed-version guide in `node_modules/next/dist/docs/`. If dependencies are unavailable, use the matching official Next.js documentation online.

Read the guide relevant to the change, rather than loading every guide:

- UI and interaction changes: [style guide](docs/STYLE_GUIDE.md), including CSS ownership, cascade, typography and motion tokens.
- Service boundaries, domain, deployment or review operations: [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md).
- Portfolio snapshots and calculations: [Portfolio Data](docs/PORTFOLIO_DATA.md).
- Email and subscription changes: [Resend integration](docs/RESEND_INTEGRATION.md); coordination and recovery use [Redis runtime](docs/UPSTASH_REDIS_INTEGRATION.md#redis-runtime) and [subscription reconciliation](docs/UPSTASH_REDIS_INTEGRATION.md#subscription-reconciliation).
- Payment changes: [Stripe integration](docs/STRIPE_INTEGRATION.md).

Keep README concise and detailed procedures in `docs/`. Update the relevant guide when behavior or commands change.

## Implementation constraints

- Use `getLocalizedPath` / `getLanguageAlternates` in `src/lib/i18n.ts` and `createRootMetadata` / `createPageMetadata` in `src/lib/site-config.ts`. Links and sharing metadata must resolve to the correct language and page.
- Compose pages in `src/app/_components`; keep domain code, data, and CSS in the owning `src/features` folder. Features must not import other features or `app`; shared `components` and `lib` must not import either layer.
- Use Prettier with `prettier-plugin-tailwindcss` for formatting and recognized class ordering, and ESLint for JavaScript/TypeScript rules. Keep the Tailwind stylesheet entry aligned with `src/app/globals.css`. CSS behavior still requires build/browser verification; formatting is not semantic CSS linting.
- Keep interface copy with its owning page or shared component, use server components for static copy, and keep client boundaries small. Reuse `src/lib/escape-html.ts`, `HoneypotField`, submission hooks and `postJson`; preserve each form's submission, idempotency and retry semantics.
- Preserve deliberate language, layout and form variants. Preserve verified research and monthly portfolio snapshots unless a content update is requested; these are not live prices.
- Preserve existing text colors in every state, including opacity, unless a color change is requested. Maintain values only in `src/app/styles/tokens.css`; Tailwind and CSS Modules reference the same tokens. Keep `globals.css` limited to layers/imports/variants and `base.css` to the single reset and document defaults. Use complete static utility classes for normal layout and states, adjacent CSS Modules for owned complex motion, and inline styles only for data or measurements. Share repeated appearance through finite component variants; never override another component’s internals.
- Keep menu visibility, focus, content interactivity and scroll restoration synchronized. Use one state source and one animation owner per property; handle interruption, reversal, cancellation, reduced motion and unmount. Touch hover resets must retain active and keyboard-focus feedback.

## Service boundaries

- Keep credentials and service modules server-side, including `server-only` boundaries. The Node test loader does not enforce Next.js boundaries. Use `.env.example`; never print or commit secrets, private email payloads or preference tokens. Verify current cloud configuration rather than trusting historical resource IDs.
- Route Redis commands through `executeRedisCommand`. Preserve shared subscriber locks and durable journals. Lease expiry does not resolve an unknown provider outcome: do not clear unresolved records or replay ambiguous welcome events. Unsubscribe retains the shared lock and unresolved journal while bypassing the journal gate.
- Public signup requests confirmation only. Activate subscriptions after an explicit confirmation POST under the subscriber lock and journal; GET must not change consent. Preserve token replay protection, recipient-level delivery limits, durable feedback suppression and webhook deduplication. Welcome delivery failure must not undo confirmed consent. Keep existing preference links and the stable secret compatible; do not silently rotate keys or clear suppression.
- Confirm payment through server-side Stripe Session verification; URL parameters cannot establish success. Preserve pending and unverified states.
- Routine tests mock provider writes. Real email, production subscriber changes and live payments require authorization for those actions; deployment does not authorize test transactions.

## Verification and review

Keep module and component tests beside the code they verify in `src`, using the matching module name and `.test.mjs` for the current Node runner. Keep browser and integration tests with their owning feature, component or application layer. Keep configuration checks beside their configuration; shared test utilities belong in `scripts/`. Update test discovery and documented commands when moving tests; preserve assertions and provider isolation. Use TypeScript test files when their types add value and the runner and lint configuration support them.

Local work owns fast, affected-scope verification; CI owns complete verification; deployment owns version identity and live status. Do not repeat full local suites before deployment unless explicitly requested or needed to investigate a failure. Local unit tests mock provider operations, and Playwright uses isolated credentials. Fix related failures within the authorized scope.

| Change | Local completion checks |
| --- | --- |
| Documentation | Links, anchors, references and `git diff --check` |
| Application or configuration | Affected type, lint, format and behavioral tests, then `git diff --check` |
| Shared UI | Targeted browser checks for affected interactions, keyboard, touch and reduced motion; verify production styles when style loading changes |
| Deployment | Review successful CI evidence for the release SHA, Vercel `READY`, matching deployed SHA and production aliases; no routine repeat of full local suites |

PR CI runs all checks. Main CI may reuse a recent successful full PR run only when `scripts/ci-plan.mjs` verifies the identical Git tree and all required test jobs. Missing or uncertain evidence requires full CI. Preserve the stable `verify` and `webkit` result jobs and the exact-commit production gate.

Install missing browser binaries with `npx playwright install chromium webkit`. Once checks pass, repeat only when subsequent changes or unresolved failures justify it. Add behavioral regression coverage for changed risks; update source-structure assertions during refactors without weakening user-visible coverage. For animation fixes, check intermediate visual states and repeated/interrupted input, not merely whether an animation was created. WebKit automation does not establish physical iPhone behavior.

## Code Review Rules

- Write all authored review output in English only, without emojis or emoji shortcodes. This includes review titles, summaries, findings, inline comments and follow-up comments. Use plain-text severity labels such as `[P1]` rather than decorative badges.
- Prioritize demonstrable violations of the constraints above, with precise locations and consequences. Leave formatting to lint; intentional variants are not defects solely because they duplicate markup.
- These rules govern authored review text. Do not claim that repository instructions disable provider-generated status summaries, boilerplate or reactions; verify a supported integration setting before reporting that those outputs have changed.

## Deployment completion

Use the existing GitHub Actions and Vercel Git integration. By default, make changes on a `codex/` branch and submit a pull request targeting `main`; reuse an existing pull request for the same work. Review the diff and required CI results before merging. For an authorized deployment, merge the verified pull request into `main` and confirm CI for the resulting release commit before declaring deployment complete. Push directly to `main` only when the user explicitly requests that workflow. Preserve `vercel.json`'s exact-commit CI gate, package integrity checks and browser suite. Keep the gate outside `npm run build` and runner-specific workarounds in the workflow; fix failed checks rather than bypassing them.

Deployment is complete after GitHub Actions succeeds for the release commit, Vercel is `READY`, and the deployed commit and production aliases match. Report success promptly once these conditions are met.

Production browser smoke checks and additional diagnostics are optional follow-up work unless the user requests them or evidence indicates a production failure. Do not delay the deployment success report for optional checks. Report deployment status separately from any incomplete or failed follow-up verification; never describe unverified checks as passed.

GitHub automatically deletes the remote feature branch when its PR merges. After successful production deployment, clean up the local merged feature branch as part of the authorized release. Confirm that the branch has no unmerged commits, switch away from it, and use safe local deletion. Preserve branches with ongoing work. Start subsequent changes from the latest `main` on a new `codex/` branch; see the [release workflow](docs/TECHNICAL_ARCHITECTURE.md#release-workflow) for cleanup details.

## Maintaining this file

Keep only durable project constraints, task-specific references and executable completion criteria. Consolidate duplicated rules; put detailed procedures in the linked guides. Add nested instructions only for genuine subtree differences. After changing instruction files, verify the active instruction sources in a fresh Codex run from the intended directory.

References: [AGENTS.md configuration](https://learn.chatgpt.com/docs/agent-configuration/agents-md) · [Rethinking skills and prompts](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra).
