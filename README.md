# Modern Fundamental Analyst

A public-equity research website in English, Traditional Chinese and Simplified Chinese. It publishes portfolio holdings, performance and investment memos, with email subscriptions and one-time research support.

[Visit the website](https://www.modernfundamentalanalyst.com)

The site uses Next.js App Router, React, TypeScript, Tailwind CSS, customized shadcn/ui components and CSS Modules. Resend handles email, Upstash Redis coordinates reader services, Stripe provides Hosted Checkout, Sentry monitors errors and performance, and Vercel hosts the site.

## Local Development

Use Node.js 24 and npm.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Copy [.env.example](.env.example) to an ignored `.env.local` when configuring services. Never commit credentials.

Email previews need no service credentials:

| Command                                    | Preview                                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| `npm run email:contact` or `npm run email` | Contact emails at [localhost:3001](http://localhost:3001)                     |
| `npm run email:preferences`                | Preference and confirmation emails at [localhost:3002](http://localhost:3002) |

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

Replace placeholders with actual paths. WebKit selects `@mobile` cases with iPhone 13 emulation; CI runs its two shards on separate macOS runners. Install missing browsers with `npx playwright install chromium webkit`. If local Turbopack cannot bind a worker port, use `npm run build -- --webpack` and report that fallback; CI uses Turbopack.

### Commit hooks

`npm ci` installs Husky locally. Before a commit, `npm run lint:staged` checks staged formatting and JavaScript/TypeScript lint. Prettier also checks CSS syntax and recognized Tailwind class ordering. Unknown formats are skipped. The checks do not rewrite files; concurrent tasks only read them.

Fix failures, review and stage the changes, then commit again. lint-staged temporarily hides and restores unstaged edits in partially staged files. CI, Vercel and production installs skip hook setup. See [Husky](https://typicode.github.io/husky/how-to.html) for local opt-out and GUI Node configuration. Hooks do not replace CI.

## Project Layout

| Directory         | Purpose                                                                                |
| ----------------- | -------------------------------------------------------------------------------------- |
| `src/app/`        | Routes, localized page composition in `_components`, metadata, and global CSS          |
| `src/features/`   | Portfolio, memos, subscriptions, contact, and support; each owns its data and controls |
| `src/components/` | Shared navigation, footer, disclosure, form primitives, and email layout               |
| `scripts/`        | Node loader, test helpers, WebKit runner, and production deployment gate               |
| `src/lib/`        | Shared formatting, localization, request utilities, and service clients                |
| `public/`         | Public icons, logos, and the social sharing image                                      |
| `.github/`        | GitHub Actions workflows                                                               |
| `docs/`           | Quality, design system, architecture, and integration documentation                    |

English routes have no prefix; Chinese routes use `/zh-tw` and `/zh-cn`. The `(en)` route group does not add a URL segment. Route files follow Next.js naming conventions.

Portfolio and memo data live in their features. Redis coordinates reader services; it is not the published research data source. Copy stays with its page or component. Presentation uses shared components and semantic tokens.

## Documentation

| Document                                                             | Use it for                                                                                                  |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [Design System](docs/DESIGN_SYSTEM.md)                               | Design principles, tokens, typography, components, interaction, content and localization.                   |
| [Web Application Architecture](docs/WEB_APPLICATION_ARCHITECTURE.md) | Code conventions, application/data boundaries, portfolio updates, verification tooling, tests and releases. |
| [Integrations](docs/INTEGRATIONS.md)                                 | Provider setup, secrets, email/consent, Redis recovery, payment verification and monitoring.                |
| [AGENTS.md](AGENTS.md)                                               | Agent execution constraints and completion requirements.                                                    |
| [Release 1.0.0](docs/RELEASE_1.0.0.md)                               | Historical release-preparation evidence and checklist, not current deployment status.                       |

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
