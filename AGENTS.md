# AGENTS.md

Instructions for agents working on Modern Fundamental Analyst. Follow higher-priority instructions and explicit user requests. A nested `AGENTS.md` governs its subtree; `AGENTS.override.md` can replace it in the same directory.

## Project context

The site uses Next.js App Router, React, TypeScript, Tailwind CSS and CSS Modules. Use Node.js 24 and npm. The package manifests define dependencies. English routes have no prefix; Chinese routes use `/zh-tw` and `/zh-cn`.

- `src/app`: routes and application composition; page components live in `_components`.
- `src/features`: domain code, data, UI and owned styles. Features must not import other features or `app`.
- `src/components` and `src/lib`: shared UI and utilities; neither imports the feature or application layers.
- `scripts`: shared test helpers, Node loader and CI tooling. See [README](README.md#project-layout) for the full directory map.

## Working agreement

- Use Traditional Chinese for ordinary communication unless requested otherwise. Formal code-review output, including summaries, findings and follow-ups, must be English without emojis. Code comments and GitHub issue/PR comments must also be English without emojis.
- Write documentation prose in English. Include non-English text only for an exact runtime/provider value needed for an operation, identifying its source in code.
- Keep reviews read-only unless changes are requested. Complete authorized implementation and affected checks; resolve routine choices without unnecessary confirmation.
- Run `git status` before editing. Preserve unrelated changes and local evidence in `../local/audit/` or legacy ignored `audit/`. Historical audits are not the current issue list. Stage only intended files.
- Commit, open a PR or deploy when requested. Deployment authorizes the required commit, push and merge. A PR-only request does not authorize merging. Report release status accurately.

## Task execution

- Before a substantial change, state the outcome, behavior to preserve and completion criteria. Use a short plan when dependencies require one.
- Verify consequential assumptions against code, configuration or current provider evidence. Explain conflicts and unknown outcomes. Ask only for a decision needed to proceed safely; continue independent work.
- Choose the simplest solution that meets the contract. Add abstractions or dependencies for a concrete need. Delegate only with explicit authorization from the user or an applicable instruction.
- Review the diff as you work. Preserve unrelated changes, comments and variants. Check references before removing code superseded by the task; keep broader cleanup out of scope.
- For new behavior or a reproducible bug, establish an independent expected result or regression case. Documentation and formatting edits do not require test-first work.
- Measure optimizations against a baseline and check correctness. Preserve failure, retry and accessibility behavior. Line count, test count and passing checks alone do not prove improvement.
- When repeated attempts add no evidence, reassess the assumption and failure category. Stop optional checks once the remaining risk is covered; report blockers accurately.
- Review the final diff. Report changes, reasons, checks and limits. Distinguish workspace results, mocked tests, CI evidence and live-provider state.

## Commands

Run from the repository root containing `package.json`. Use focused checks during development; the full-suite commands below are for CI, explicit requests or diagnosis.

| Task                                                   | Command                                                                                                               |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Install locked dependencies                            | `npm ci`                                                                                                              |
| Development server                                     | `npm run dev`                                                                                                         |
| Production build / server                              | `npm run build` / `npm run start`                                                                                     |
| Type checking                                          | `npm run typecheck`                                                                                                   |
| Lint selected files                                    | `npx eslint <files> --max-warnings=0`                                                                                 |
| Check / format selected files                          | `npx prettier --check <files>` / `npx prettier --write <files>`                                                       |
| Vitest unit / integration tests                        | `npm run test:unit` / `npm run test:integration`; append `-- <test-path>` to filter                                   |
| Vitest watch mode                                      | `npm run test:watch`                                                                                                  |
| Browser E2E tests                                      | `npm run test:e2e -- <spec-files> --project=chromium` (or `webkit`)                                                   |
| Selected Node tests                                    | `node --import ./scripts/register-server.mjs --test <test-files>`                                                     |
| Selected browser tests                                 | `npx playwright test <spec-files> --project=chromium` (or `webkit`)                                                   |
| Production browser tests                               | After building: `PLAYWRIGHT_USE_PRODUCTION_BUILD=1 npx playwright test <spec-files> --project=chromium` (or `webkit`) |
| Dedicated performance budgets after a production build | `npm run test:performance`                                                                                            |
| Full static checks                                     | `npm run verify:static`                                                                                               |
| Full static, build and production Chromium checks      | `npm run verify`                                                                                                      |
| Mobile production WebKit checks                        | After building: `npm run test:webkit`; select a shard with `-- --shard=1` or `-- --shard=2`                           |

Replace angle-bracket placeholders with real paths. Install missing browsers with `npx playwright install chromium webkit`. Playwright starts an isolated server on port 3210 with provider credentials disabled; preserve that isolation. `npm test` runs the existing Node suite plus Vitest unit and integration projects. E2E tests use Playwright separately; CI runs the production browser matrix. Chromium covers all cases; WebKit selects `@mobile` cases with iPhone 13 emulation. Tag phone-only cases explicitly; desktop and cross-breakpoint cases remain in Chromium. Husky's pre-commit hook checks staged formatting and JavaScript/TypeScript lint; it does not replace CI.

## Task references

Read the relevant guide and update it when behavior or commands change. README is the entry point; domain procedures belong in `docs/`.

| Area                                                         | Guide                                                                                                                      |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| UI, content, localization, typography and motion             | [Design System](docs/DESIGN_SYSTEM.md)                                                                                     |
| Code conventions, application boundaries, tests and releases | [Web Application Architecture](docs/WEB_APPLICATION_ARCHITECTURE.md)                                                       |
| Portfolio sources, calculations and monthly updates          | [Portfolio data](docs/WEB_APPLICATION_ARCHITECTURE.md#portfolio-data)                                                      |
| Provider setup, email, payments and monitoring               | [Integrations](docs/INTEGRATIONS.md)                                                                                       |
| Subscriber coordination and recovery                         | [Redis runtime](docs/INTEGRATIONS.md#redis-runtime) and [reconciliation](docs/INTEGRATIONS.md#subscription-reconciliation) |

Use [README](README.md#documentation) for documentation scope and maintenance, [architecture](docs/WEB_APPLICATION_ARCHITECTURE.md#code-and-components) for code conventions, and [Design System](docs/DESIGN_SYSTEM.md#content-and-localization) for editorial rules. Keep agent execution requirements here.

Before changing Next.js APIs, routing or configuration, read the installed-version guide in `node_modules/next/dist/docs/`. If unavailable, use the matching official documentation. Verify that a tool or pattern exists in this repo before using it.

## Implementation constraints

- Use `getLocalizedPath` / `getLanguageAlternates` from `src/lib/i18n.ts` and `createRootMetadata` / `createPageMetadata` from `src/lib/site-config.ts`. Links and metadata must identify the correct locale and page.
- When changing website copy, search all test files, fixtures and snapshots for the previous text, accessible names and related translations. Update every affected assertion and run the relevant Node, component and browser tests; do not weaken behavioral checks to accommodate new wording.
- Keep copy with its owning page/component, use server components for static content and minimize client boundaries. Reuse `HoneypotField`, submission hooks and `postJson`; preserve each form's submission, idempotency and retry semantics.
- Preserve deliberate language, layout and form variants. Do not change verified research or monthly portfolio snapshots without a content-update request; they are not live prices.
- Preserve text colors and opacity across states unless a color change is requested. Define color values in `src/app/styles/tokens.css` and reference those tokens from Tailwind and CSS Modules.
- Keep `globals.css` to layers/imports/variants and `base.css` to the single reset/document defaults. Use complete static utility classes for normal layout/states, adjacent CSS Modules for complex owned motion, and inline styles for data/measurements. Share appearance through finite component variants; do not override another component's internals.
- Use ESLint and Prettier with `prettier-plugin-tailwindcss`; keep its stylesheet entry aligned with `src/app/globals.css`. Formatting does not validate CSS behavior.
- Use the Base UI shadcn registry for interactive primitives. Compose custom elements with `render`, preserving native links, refs and handlers. Base UI owns modal isolation, focus containment and scroll locking; retain the existing navigation phase and animation ownership. Do not restore a second interaction engine. Follow the five-layer Design System: design style (Pentagram, PayPal and Jost), foundations (Geist and Fluent 2), UX guidelines (Fluent 2 Content Design, Vercel and Cieden), components (shadcn/ui and Lucide), and interaction engine (Base UI). Preserve Jost, the three brand blues, Logo and the editorial identity. Use the documented Geist Typography, Colors, Materials and Grid treatments; preserve all brand colors (including the two original grays), square data blocks, pill CTAs, black Footer and wordmark identity. Use the SVG Logo artwork in the Header, drawer and Footer; do not recreate it with styled text. Other typography uses only complete documented Geist presets: size, line height, weight and tracking stay together across locales. Responsive roles switch presets without interpolation; retain Jost and existing brand colors. Use semantic light/dark aliases and localized light, dark and system controls; keep brand primitives and highlighted surfaces explicit. Fluent 2 supplies design/color token architecture and content-design guidance; use concise reader-focused language and meaningful action labels. Vercel owns capitalization: follow the Design System context matrix, using Chicago 18 Title Case for functional interfaces/shared controls and sentence case for marketing/editorial content and emails. Do not apply a blanket casing conversion or CSS capitalization. Use shared component roles and finite variants; keep business state and provider workflows with the owning feature. Reference defaults must be adapted to owned tokens and components; use the accessible interaction text alias rather than Medium Blue on white.
- Synchronize menu visibility, focus, interactivity and scroll restoration. Use one state source and one animation owner per property; handle interruption, reversal, cancellation, reduced motion and unmount. Touch hover resets must preserve active and keyboard-focus feedback.

## Service boundaries

- Keep credentials and service modules server-side with `server-only` boundaries; the Node test loader does not enforce Next.js boundaries. Use `.env.example`; never print or commit secrets, private email payloads or preference tokens. Verify current cloud configuration instead of trusting historical resource IDs.
- Route Redis operations through `executeRedisCommand`. Preserve subscriber locks and durable journals. Expired leases do not resolve unknown provider outcomes: do not clear unresolved records or replay ambiguous welcome events. Unsubscribe keeps the lock and unresolved journal while bypassing the journal gate.
- Signup requests confirmation only. Activate consent through an explicit confirmation POST under the subscriber lock/journal; GET must not change consent. Preserve replay protection, recipient delivery limits, durable feedback suppression and webhook deduplication. Failed welcome delivery must not undo confirmed consent. Keep preference links and the stable secret compatible; do not silently rotate keys or clear suppression.
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

- Colocate Vitest unit tests as `*.test.ts`, Testing Library/MSW component integrations as `*.test.tsx`, and Playwright browser workflows as `*.spec.ts`. Existing `*.test.mjs` tests retain the Node runner (`npm run test:node`); keep configuration tests beside their configuration. Shared test helpers belong in `scripts/`. Update discovery and commands when moving tests; MSW handlers must cover all integration-test requests; reset handlers and clean up mounted components after each test.
- Test observable outcomes and service integrations with provider I/O mocked. Preserve failure/retry coverage and user-visible assertions. Reserve source assertions for explicit architecture/configuration constraints that runtime tests cannot establish.
- For animation changes, check intermediate states and repeated/interrupted input. WebKit automation does not establish physical iPhone behavior.
- Review findings need demonstrable impact, precise file locations and plain severity labels such as `[P1]`. Leave formatting to lint; intentional variants are not defects solely because they repeat markup.
- Authored review rules do not control provider-generated summaries, reactions or boilerplate. Verify provider settings before claiming those outputs changed.

## Deployment completion

Use GitHub Actions and the Vercel Git integration. Follow the [release workflow](docs/WEB_APPLICATION_ARCHITECTURE.md#release-workflow):

1. Start new changes from current `main` on a `codex/` branch; reuse an existing branch/PR for ongoing work. Target PRs at `main` and review their diff and required CI before merging. Direct pushes to `main` require an explicit request.
2. For an authorized deployment, merge the verified PR and record the resulting release SHA. PRs run full CI; main may reuse recent full PR evidence only when `scripts/ci-plan.mjs` verifies an identical Git tree and all required jobs. Missing or uncertain evidence requires full CI.
3. Declare deployment complete only after release CI succeeds, Vercel is `READY`, and its deployed SHA and production aliases match the intended release. Preview readiness or CI success alone is insufficient.
4. Report completion promptly. Production smoke checks are optional unless requested or evidence indicates a failure; report incomplete diagnostics separately.
5. After successful deployment, safely delete the local merged feature branch after checking for unmerged work and switching away. Preserve active branches. GitHub deletes the merged remote branch automatically.

Preserve the stable `verify` and `webkit` result jobs, the required `performance` budget job, package-integrity checks, browser coverage and `vercel.json`'s exact-commit production gate. Keep the gate outside `npm run build` and runner workarounds in the workflow. Fix failed checks rather than bypassing them.

## Maintaining this file

Keep durable constraints, verified commands and task references here. Put detailed procedures in their domain guide. Add nested instructions only for real subtree differences. Check paths, commands, anchors and instruction-file discovery after edits. Preserve historical evidence; editing docs does not verify production or publish a release. Preserve referenced anchors. Automatic loading of changed instructions requires confirmation in a fresh Codex session.

Format reference: [AGENTS.md](https://agents.md/).
