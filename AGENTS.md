# AGENTS.md

Instructions for agents working on Modern Fundamental Analyst. Follow higher-priority instructions and explicit user requests. A nested `AGENTS.md` governs its subtree; `AGENTS.override.md` can replace it in the same directory.

## AI Agents

These references guide AI-assisted development of this repository. They do not establish a requirement to add AI features or OpenAI API dependencies to the website.

| Reference                                           | Responsibility                                                                               |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [ChatGPT Learn](https://learn.chatgpt.com/docs)     | ChatGPT usage and collaboration workflows.                                                   |
| [OpenAI Developers](https://developers.openai.com/) | Official Codex, OpenAI API and agent-development behavior for the tools and features in use. |
| [AGENTS.md](https://agents.md/)                     | Repository instruction format, organization and nested scope conventions.                    |

Apply references within their assigned domains. Product documentation governs supported behavior; workflow advice cannot override it or grant authorization. Check instruction-file discovery against the active tool’s documentation.

Use OpenAI’s [maintenance case study](https://developers.openai.com/blog/maintaining-software-with-the-gpt-6-family) for evidence-based maintenance and [custom review rules](https://developers.openai.com/blog/custom-code-review-rules-for-codex) for concise, scoped review guidance.

Keep repository execution rules here. Link to [architecture](docs/WEB_APPLICATION_ARCHITECTURE.md), [design](docs/DESIGN_SYSTEM.md) and [integrations](docs/INTEGRATIONS.md) for their domain rules instead of copying them. Use the [installed skills](docs/WEB_APPLICATION_ARCHITECTURE.md#installed-agent-skills) only when applicable; a reference does not install a skill, grant access or authorize external actions.

The [README](README.md#mission) owns the mission and investment philosophy; [Architecture](docs/WEB_APPLICATION_ARCHITECTURE.md#article-taxonomy) owns the article taxonomy and editorial-source status. A source link is not authorization to publish its contents.

## Project context

The site uses Next.js App Router, React, TypeScript, Tailwind CSS and CSS Modules. Use Node.js 24 as the JavaScript runtime and npm for dependency management and package scripts. The package manifests define dependencies. English routes have no prefix; Chinese routes use `/zh-tw` and `/zh-cn`.

- `src/app`: routes and application composition; page components live in `_components`.
- `src/features`: domain code, data, UI and owned styles. Features must not import other features or `app`.
- `src/components` and `src/lib`: shared UI and utilities; neither imports the feature or application layers.
- `scripts`: shared test helpers, Node loader and CI tooling. See [README](README.md#project-layout) for the full directory map.

## Working agreement

- Use Traditional Chinese for ordinary communication unless requested otherwise. Formal code-review output, including summaries, findings and follow-ups, must be English without emojis. Code comments and GitHub issue/PR comments must also be English without emojis.
- Write documentation prose in English. Include non-English text only for an exact runtime/provider value needed for an operation, identifying its source in code.
- Keep reviews read-only unless changes are requested. Complete authorized implementation and affected checks; resolve routine choices without unnecessary confirmation.
- Run `git status` before editing. Preserve unrelated changes and local evidence in `../local/audit/` or legacy ignored `audit/`. Historical audits are not the current issue list. Stage only intended files.
- Follow Branch → PR → Main. Commit, push, open a PR or deploy within the requested scope. Merge only after the owner explicitly authorizes merging the PR. A commit, PR or deployment request alone does not authorize merging. Do not enable auto-merge. Report release status accurately.

## Task execution

- Before a substantial change, state the outcome, behavior to preserve and completion criteria. Use a short plan when dependencies require one.
- Verify consequential assumptions against code, configuration or current provider evidence. Explain conflicts and unknown outcomes. Ask only for a decision needed to proceed safely; continue independent work.
- Choose the simplest solution that meets the contract. Add abstractions or dependencies for a concrete need. Delegate only with explicit authorization from the user or an applicable instruction.
- Review the diff as you work. Preserve unrelated changes, comments and variants. Check references before removing code superseded by the task; keep broader cleanup out of scope.
- For new behavior or a reproducible bug, establish an independent expected result or regression case. Documentation and formatting edits do not require test-first work.
- Measure optimizations against a baseline and check correctness. Preserve failure, retry and accessibility behavior. Line count, test count and passing checks alone do not prove improvement.
- Follow the [maintenance workflow](docs/WEB_APPLICATION_ARCHITECTURE.md#software-maintenance) for cleanup and CI improvements. Verify indirect uses and operational purpose before removal. Preserve fallbacks and recovery paths when non-use is unproven.
- When repeated attempts add no evidence, reassess the assumption and failure category. Stop optional checks once the remaining risk is covered; report blockers accurately.
- Review the final diff. Report changes, reasons, checks and limits. Distinguish workspace results, mocked tests, CI evidence and live-provider state.

## Commands

Run from the repository root containing `package.json`. Use focused checks during development. Reserve full suites for CI, explicit requests or diagnosis.

Use the [verification command table](README.md#verification) and [local development instructions](README.md#local-development). For file-scoped checks:

```sh
npx eslint path/to/changed-file.ts --max-warnings=0
npx prettier --check path/to/changed-file.ts
node --import ./scripts/register-server.mjs --test path/to/test.test.mjs
```

Replace example paths with actual files. After a production build, run focused browser checks with `PLAYWRIGHT_USE_PRODUCTION_BUILD=1 npx playwright test path/to/test.spec.ts --project=chromium`. Use `--project=webkit` for mobile cases.

Playwright starts an isolated server on port 3210 with provider credentials disabled. Preserve that isolation. Chromium covers all cases; WebKit selects `@mobile` cases with iPhone 13 emulation. Keep desktop and cross-breakpoint cases in Chromium. Follow the [test workflow](docs/WEB_APPLICATION_ARCHITECTURE.md#test-workflow) for runners, browser installation, shard allocation and CI coverage. Local commit hooks do not replace CI.

## Task references

Read the relevant guide and update it when behavior or commands change. README is the entry point; domain procedures belong in `docs/`.

| Area                                                         | Guide                                                                                                                      |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| UI, content, localization, typography and motion             | [Design System](docs/DESIGN_SYSTEM.md)                                                                                     |
| Code conventions, application boundaries, tests and releases | [Web Application Architecture](docs/WEB_APPLICATION_ARCHITECTURE.md)                                                       |
| Portfolio sources, calculations and monthly updates          | [Portfolio data](docs/WEB_APPLICATION_ARCHITECTURE.md#portfolio-data)                                                      |
| Provider setup, email, payments and monitoring               | [Integrations](docs/INTEGRATIONS.md)                                                                                       |
| Subscriber coordination and recovery                         | [Redis runtime](docs/INTEGRATIONS.md#redis-runtime) and [reconciliation](docs/INTEGRATIONS.md#subscription-reconciliation) |

Use [README](README.md#documentation) for document ownership and [architecture](docs/WEB_APPLICATION_ARCHITECTURE.md#code-and-components) for code conventions.

Before changing Next.js APIs, routing or configuration, read the installed-version guide in `node_modules/next/dist/docs/`. If unavailable, use the matching official documentation. Use installed Next.js workflow skills only when their prerequisites and task scope apply; general framework reference knowledge comes from the bundled docs rather than the retired `next-best-practices` skill. Verify that a tool or pattern exists in this repo before using it.

## Implementation constraints

- Use `getLocalizedPath` / `getLanguageAlternates` from `src/lib/i18n.ts` and `createRootMetadata` / `createPageMetadata` from `src/lib/site-config.ts`. Links and metadata must identify the correct locale and page.
- When changing website copy, search all test files, fixtures and snapshots for the previous text, accessible names and related translations. Update every affected assertion and run the relevant Node, component and browser tests; do not weaken behavioral checks to accommodate new wording.
- Keep copy with its owning page/component, use server components for static content and minimize client boundaries. Reuse `HoneypotField`, submission hooks and `postJson`; preserve each form's submission, idempotency and retry semantics.
- Preserve deliberate language, layout and form variants. Do not change verified research or monthly portfolio snapshots without a content-update request; they are not live prices.
- Follow the [Design System](docs/DESIGN_SYSTEM.md) and its [reference priorities](docs/DESIGN_SYSTEM.md#architecture-and-reference-ownership). Preserve approved colors, typography, language and layout variants unless the requested change covers them. Use the documented tokens and styling boundaries rather than library defaults.
- Use the configured Base UI shadcn registry and shared components. Preserve native semantics, refs and handlers when composing with `render`; keep business state in its owning feature.
- Let Base UI own modal isolation, focus containment and scroll locking. Follow the [menu lifecycle](docs/DESIGN_SYSTEM.md#menu-behavior) and [animation ownership](docs/DESIGN_SYSTEM.md#disclosure-and-animation-ownership): one state source and animation owner per property; synchronized visibility, focus and interactivity; correct interruption, reduced-motion and unmount behavior.

## Service boundaries

- Keep credentials and service modules server-side with `server-only` boundaries; the Node test loader does not enforce Next.js boundaries. Use `.env.example`; never print or commit secrets, private email payloads or preference tokens. Verify current cloud configuration instead of trusting historical resource IDs.
- Apply the [Code Review Rules](#code-review-rules) below when changing subscriber coordination, consent, provider acknowledgements or external contracts.
- Verify Stripe Sessions server-side; URL parameters cannot establish payment success. Preserve pending and unverified states.
- Mock provider writes in routine tests. Real email, production subscriber changes and live payments require authorization for those actions; deployment does not authorize test transactions.

## Verification and review

Run affected checks locally. CI owns full verification; deployment checks establish release identity and live status. Do not routinely rerun full suites locally. Repeat a passed check only after a relevant change or to resolve a remaining failure.

| Change                    | Completion checks                                                                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Documentation             | Validate commands, links, anchors and references; run `git diff --check`                                                                  |
| Application/configuration | Affected type, lint, format and behavioral checks; `git diff --check`                                                                     |
| Shared UI                 | Targeted browser checks for affected interactions, keyboard, touch and reduced motion; production-style checks when style loading changes |
| Deployment                | The release gate below; no routine full local rerun                                                                                       |

- Follow the [test workflow](docs/WEB_APPLICATION_ARCHITECTURE.md#test-workflow) for test placement, runners and MSW isolation. Update discovery and commands when moving tests.
- Test observable outcomes and service integrations with provider I/O mocked. Preserve failure/retry coverage and user-visible assertions. Reserve source assertions for explicit architecture/configuration constraints that runtime tests cannot establish.
- For animation changes, check intermediate states and repeated/interrupted input. WebKit automation does not establish physical iPhone behavior.

## Code Review Rules

Review changed behavior and affected consumers. Report actionable defects with a concrete trigger, impact, precise location and priority such as `[P1]`; cite the relevant rule when applicable. Apply only rules relevant to the change and continue checking ordinary bugs. Leave formatting to lint. Intentional variants and documented mitigations are not defects without new evidence.

### Subscriber state and provider outcomes

For subscription, Redis or email changes, preserve locks, durable journals, replay protection, delivery limits, suppression and webhook deduplication. Route Redis calls through `executeRedisCommand`. Expired leases do not resolve unknown provider outcomes: retain unresolved records and reconcile before replaying ambiguous writes. Unsubscribe keeps its lock and unresolved journal while bypassing the journal gate. Signup requests confirmation; only explicit confirmation POST changes consent, never GET. Failed welcome delivery must not undo consent. Keep these safeguards or provide a tested migration under the [recovery procedures](docs/INTEGRATIONS.md#subscription-reconciliation).

### External contracts and sensitive data

For route, redirect, preference-link, webhook or provider changes, trace existing consumers before changing names, payloads or token behavior. Preserve compatible links, stable secrets and server-side verification, or provide an explicit migration and rollback plan. Do not silently rotate keys, clear suppression or expose credentials, recipient content or preference tokens through logs or client bundles. See [Integrations](docs/INTEGRATIONS.md).

### Release safeguards

For workflow and deployment changes, preserve `verify`, `webkit`, performance budgets, package-integrity checks, browser coverage and the exact-commit production gate. Keep the gate outside `npm run build`. Fix failing checks rather than weakening acceptance criteria. CI success and a favorable review do not authorize merging; follow [Deployment completion](#deployment-completion).

These rules supplement tests and branch protection; they do not enforce cloud settings. Provider-generated summaries and reactions require separate verification.

## Deployment completion

Use GitHub Actions and the Vercel Git integration. Follow the [release workflow](docs/WEB_APPLICATION_ARCHITECTURE.md#release-workflow):

During deployment, change only what is necessary to resolve a demonstrated release blocker. Validate each fix with targeted checks before running required CI. Do not expand the scope with unrelated cleanup, refactoring or additional reviews. Prepare the reviewed diff, required CI results and Preview before requesting any missing merge authorization. If authorization already covers the PR, do not ask again. After the authorized merge, confirm release identity and deployment status without adding optional checks or reviews.

1. Start new changes from current `main` on a `codex/` branch; reuse an existing branch/PR for ongoing work. Push the branch and open a PR targeting `main` when requested. Review its diff, required CI and Preview. Do not push changes directly to `main` or bypass branch protection.
2. Merge the verified PR only with explicit owner authorization to merge that PR. Otherwise, leave it open and report readiness. Merging to `main` triggers the production deployment workflow; record the resulting release SHA. PRs run full CI; main may reuse recent full PR evidence only when `scripts/ci-plan.mjs` verifies an identical Git tree and all required jobs. Missing or uncertain evidence requires full CI.
3. Declare deployment complete only after release CI succeeds, Vercel is `READY`, and its deployed SHA and production aliases match the intended release. Preview readiness or CI success alone is insufficient.
4. Report completion promptly. Do not add production smoke checks unless requested or evidence indicates a failure; report incomplete diagnostics separately.
5. After successful deployment, safely delete the local merged feature branch after checking for unmerged work and switching away. Preserve active branches. GitHub deletes the merged remote branch automatically.

## Maintaining this file

Keep durable constraints, verified commands and task references here; link to domain guides for detailed procedures. Add review rules only for consequential, non-obvious invariants and include a safe path. Scope subtree-specific rules locally. Validate rule changes against a violation, a safe counterexample and an unrelated change; narrow or remove rules that create noise. Check paths, commands, anchors and instruction-file discovery after edits. Preserve historical evidence; editing docs does not verify production or publish a release. Describe the current checkout in active guides, keep dated audits and release-preparation records explicitly historical, and distinguish local validation from CI and deployed evidence. Preserve referenced anchors. Automatic loading of changed instructions requires confirmation in a fresh Codex session.
