# Modern Fundamental Analyst

A public-equity research website in English, Traditional Chinese, and Simplified Chinese, featuring portfolio holdings, performance, investment memos, email subscriptions, and one-time research support.

[Visit the website](https://www.modernfundamentalanalyst.com)

Built with Next.js, React, TypeScript, and native CSS. Resend handles email, Upstash Redis coordinates rate limits and subscriber updates, Stripe provides Checkout, and Vercel hosts the site and manages its domain.

## Local Development

Requires Node.js 24 and npm.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). For service integrations, use [.env.example](.env.example) as a template for an uncommitted `.env.local`. Never commit credentials.

## Verification

Install the test browsers once, then run all local checks:

```bash
npx playwright install chromium webkit
npm run verify
```

Verification runs type checking, ESLint, Stylelint, a Prettier format check, unit tests, and a production build, then tests that build in the Chromium Playwright project. Run `npm run test:webkit` afterward to test the same local build in two sequential, test-level WebKit shards. GitHub Actions starts independent Ubuntu Chromium and macOS WebKit jobs in parallel; each builds on its own runner, and the Ubuntu job also audits production dependencies. Run `npm run format` to apply Prettier formatting. For a quick browser check during development, use `npm run test:computed-style`; it starts the development server.

## Project Layout

| Directory        | Purpose                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `app/`           | Pages, API routes, and global styles                                 |
| `components/`    | Shared UI and interactions                                           |
| `data/`          | Localized copy, portfolio snapshot, and memo catalog                 |
| `content/memos/` | Investment memo content                                              |
| `lib/`           | Services, calculations, and utilities                                |
| `tests/`         | Unit and browser tests                                               |
| `scripts/`       | CI deployment gate, Node module loader, and subscription journal CLI |
| `docs/`          | Technical architecture, style guide, and service integration guides  |

Language routes are `/`, `/zh-tw`, and `/zh-cn`. Local review evidence stays in ignored `audit/`; see [evidence retention](docs/TECHNICAL_ARCHITECTURE.md#review-evidence).

## Content and Integrations

Portfolio holdings and month-end XIRR history are maintained in `data/portfolio.ts` as monthly snapshots, not live quotes. See [portfolio data updates](docs/TECHNICAL_ARCHITECTURE.md#portfolio-data) for sources and calculation scope. Memo entries live in `data/memos.ts`, with articles under `content/memos/` registered in `data/memo-content.ts`.

Integration details:

- [Resend email and subscriptions](docs/RESEND_INTEGRATION.md)
- [Upstash Redis runtime and ACL setup](docs/TECHNICAL_ARCHITECTURE.md#redis-runtime)
- [Stripe setup and checklist](docs/STRIPE_INTEGRATION.md)

See the [design system and style guide](docs/STYLE_GUIDE.md) for tokens, component states, accessibility, and contribution rules.

See [architecture and operations](docs/TECHNICAL_ARCHITECTURE.md) for production gating, server boundaries, and subscription reconciliation.

## Deployment

Pushes to `main` trigger GitHub Actions and Vercel Git builds. Production requires successful CI for the exact commit; see the [production gate](docs/TECHNICAL_ARCHITECTURE.md#production-gate). Configure production credentials in Vercel and use isolated resources for preview integration testing.
