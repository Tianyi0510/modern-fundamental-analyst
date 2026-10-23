# Modern Fundamental Analyst

A public-equity research website in English, Traditional Chinese and Simplified Chinese. It publishes portfolio holdings, performance and investment memos, with email subscriptions and one-time research support.

[Visit the website](https://www.modernfundamentalanalyst.com)

The site uses Next.js App Router, React, TypeScript, Tailwind CSS, customized shadcn/ui components with Base UI interactions, Lucide icons and CSS Modules. Resend handles email, Upstash Redis coordinates reader services, Stripe provides Hosted Checkout, Sentry monitors errors and performance, and Vercel hosts the site.

## Technology Stack

Node.js runs the application and tooling. TypeScript defines static types, React builds the UI, Next.js provides the App Router framework, and Tailwind CSS implements utility styles.

ESLint checks code rules, Prettier formats source, and Husky runs local Git checks. Vitest runs unit and integration tests; Testing Library exercises components, MSW intercepts test HTTP requests, and Playwright verifies browser journeys in Chromium and WebKit.

See [technology responsibilities](docs/WEB_APPLICATION_ARCHITECTURE.md#technology-stack) for official references and boundaries. The package manifests define dependencies and versions; the [verification commands](#verification) define how to check changes.

See [integration responsibilities and references](docs/INTEGRATIONS.md#service-responsibilities-and-references) for GitHub, Vercel, Upstash Redis, Stripe, Resend and Sentry, and [integration templates](docs/INTEGRATIONS.md#templates) for conditional implementation examples.

## Local Development

Use Node.js 24.22.1 LTS (`.nvmrc`) and npm 12.2.1 (`packageManager`). Select the Node version before installing npm.

```bash
npm install --global npm@12.2.1
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Copy [.env.example](.env.example) to an ignored `.env.local` when configuring services. Never commit credentials.

Codex Browser can also use [127.0.0.1:3000](http://127.0.0.1:3000). `allowedDevOrigins` explicitly permits this loopback alias for development resources and HMR. If HTML loads but controls remain inactive, follow [local preview diagnostics](docs/WEB_APPLICATION_ARCHITECTURE.md#local-preview-diagnostics) before clearing caches.

Email previews need no service credentials:

| Command                                    | Preview                                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| `npm run email:contact` or `npm run email` | Contact emails at [localhost:3001](http://localhost:3001)                     |
| `npm run email:preferences`                | Preference and confirmation emails at [localhost:3002](http://localhost:3002) |

For service recovery, follow [Resend webhook recovery](docs/INTEGRATIONS.md#webhook-recovery) and [Redis backup and restore](docs/INTEGRATIONS.md#backup-and-restore). These procedures do not certify current cloud settings or a completed restore drill.

See [email templates and previews](docs/INTEGRATIONS.md#email-templates-and-local-preview) for all nine localized examples.

## Verification

Run checks for the changed files and behavior. CI runs full verification; release checks confirm the deployed commit and live status. Do not routinely repeat the full suite locally.

| Scope                                                    | Command                                                           |
| -------------------------------------------------------- | ----------------------------------------------------------------- |
| Unit tests                                               | `npm run test:unit -- <test-path>`                                |
| Component integrations                                   | `npm run test:integration -- <test-path>`                         |
| Watch mode                                               | `npm run test:watch`                                              |
| Node tests                                               | `node --import ./scripts/register-server.mjs --test <test-files>` |
| Browser journeys                                         | `npm run test:e2e -- <spec-files> --project=chromium`             |
| All Node and Vitest tests                                | `npm test`                                                        |
| Full static verification                                 | `npm run verify:static`                                           |
| Static checks, build and production Chromium             | `npm run verify`                                                  |
| Performance budgets against an existing production build | `npm run test:performance`                                        |
| Mobile WebKit against an existing production build       | `npm run test:webkit`                                             |

For browser-feature compatibility and broader page-quality audits, follow the [Baseline and Lighthouse review](docs/WEB_APPLICATION_ARCHITECTURE.md#baseline-and-lighthouse-review). Baseline informs feature selection; Lighthouse diagnostics complement browser tests and field Core Web Vitals.

Replace placeholders with actual paths. WebKit selects `@mobile` cases with iPhone 13 emulation; CI runs its two shards on separate macOS runners. Both browsers use timing-balanced file lists; see [browser shard allocation](docs/WEB_APPLICATION_ARCHITECTURE.md#local-runs-and-shard-maintenance) for evidence and maintenance. Install missing browsers with `npx playwright install chromium webkit`. If local Turbopack cannot bind a worker port, use `npm run build -- --webpack` and report that fallback; CI uses Turbopack. The configuration selects supported CSS chunking for each bundler. Both builds need access to Google Fonts when the fonts are not cached.

### Commit hooks

`npm ci` installs Husky locally. Before a commit, `npm run lint:staged` checks staged formatting and JavaScript/TypeScript lint. Prettier also checks CSS syntax and recognized Tailwind class ordering. Unknown formats are skipped. The checks do not rewrite files; concurrent tasks only read them.

Fix failures, review and stage the changes, then commit again. lint-staged temporarily hides and restores unstaged edits in partially staged files. CI, Vercel and production installs skip hook setup. See [Husky](https://typicode.github.io/husky/how-to.html) for local opt-out and GUI Node configuration. Hooks do not replace CI.

## Project Layout

| Directory                     | Purpose                                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| `src/app/`                    | Routes, localized page composition in `_components`, metadata, and global CSS          |
| `src/components/site-header/` | Header implementation, owned hooks, styles and browser tests.                          |
| `src/features/`               | Portfolio, memos, subscriptions, contact, and support; each owns its data and controls |
| `src/components/`             | Shared navigation, footer, disclosure, form primitives, and email layout               |
| `scripts/`                    | Node loader, test helpers, WebKit runner, and production deployment gate               |
| `src/lib/`                    | Shared formatting, localization, request utilities, and service clients                |
| `public/`                     | Public icons, logos, and the social sharing image                                      |
| `.github/`                    | GitHub Actions workflows                                                               |
| `docs/`                       | Design system, architecture, integrations and historical release preparation           |

English routes have no prefix; Chinese routes use `/zh-tw` and `/zh-cn`. The `(en)` route group does not add a URL segment. Route files follow Next.js naming conventions.

Portfolio and memo data live in their features. Redis coordinates reader services; it is not the published research data source. Copy stays with its page or component and follows the [content design workflow](docs/DESIGN_SYSTEM.md#content-design-workflow).

The [Design System](docs/DESIGN_SYSTEM.md#architecture-and-reference-ownership) assigns responsibilities to five layers: visual style, Fluent 2 foundations, UX guidance, shadcn/ui components and Base UI primitives. Web standards take precedence. Each reference governs only its assigned domain.

The site retains its approved colors, Perfect Fourth typography and Swiss Grid / Editorial Layout. Use the ten Primitive Colors first; add only necessary Fluent default functional values. The Design System defines tokens, component mappings, responsive exceptions and copy conventions.

Investment Memo Articles are authored in local MDX and rendered as Server Components. See [memo content](docs/WEB_APPLICATION_ARCHITECTURE.md#investment-memo-content) for publishing and validation, and [available shadcn components](docs/DESIGN_SYSTEM.md#available-shadcn-components) for reusable UI modules.

## Documentation

| Document                                                             | Use it for                                                                                                  |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [Design System](docs/DESIGN_SYSTEM.md)                               | Design principles, tokens, typography, components, interaction, content and localization.                   |
| [Web Application Architecture](docs/WEB_APPLICATION_ARCHITECTURE.md) | Code conventions, application/data boundaries, portfolio updates, verification tooling, tests and releases. |
| [Integrations](docs/INTEGRATIONS.md)                                 | Service responsibilities, official references, templates, provider setup and recovery.                      |
| [AGENTS.md](AGENTS.md)                                               | Agent execution constraints and completion requirements.                                                    |
| [Modern Fundamental Analyst 1.0.0](docs/v1.0.0.md)                   | Features and known limitations of the first stable release.                                                 |

[Design QA](docs/history/design-qa.md) is a historical visual audit, not a current design specification. Active guides describe the current checkout; they do not establish which changes are deployed. Use GitHub CI and Vercel release evidence for live status.

See [AI Agents](AGENTS.md#ai-agents) for ChatGPT, OpenAI developer and repository-instruction reference responsibilities. These references concern development workflows, not website AI features.

Project Agent Skills and their responsibilities are listed in [Installed Agent Skills](docs/WEB_APPLICATION_ARCHITECTURE.md#installed-agent-skills). See [vercel-optimize readiness](docs/INTEGRATIONS.md#vercel-optimize-readiness) before planning a production optimization audit.

### Documentation maintenance

- Write clear, concise English. Include non-English text only for an exact runtime or provider value, with a link to its code definition.
- Give each rule or fact one primary location. Link to it elsewhere instead of repeating it.
- Explain decisions, boundaries, operations and completion criteria. Let code and configuration define current values.
- Separate required behavior, historical evidence and proposals. Date external observations and name their source.
- Use executable examples and mark placeholders. Explain a rule's purpose, exceptions and verification only when needed.
- Before deleting or moving a document, migrate useful content and update all references. Check links, anchors, commands, formatting and `git diff --check`.

Documentation-only changes do not require the full application suite. [AGENTS.md](AGENTS.md#verification-and-review) defines completion checks.

## Deployment

Submit changes through a PR. Review CI and Vercel Preview for its head commit; merge when release is authorized. Main CI may reuse recent full PR evidence only for an identical Git tree.

Production must pass CI for the exact release commit. Report success after Vercel is `READY` and its commit and production aliases match. Follow the [release workflow](docs/WEB_APPLICATION_ARCHITECTURE.md#release-workflow) and [production gate](docs/WEB_APPLICATION_ARCHITECTURE.md#production-gate). Use environment-scoped credentials and isolated Preview resources.

Keep local review evidence in `../local/audit/`; see [evidence retention](docs/WEB_APPLICATION_ARCHITECTURE.md#review-evidence).

Provider recovery procedures: [Resend webhooks](docs/INTEGRATIONS.md#webhook-recovery), [Redis backups](docs/INTEGRATIONS.md#backup-and-restore), and [Sentry verification](docs/INTEGRATIONS.md#local-and-cloud-verification).
