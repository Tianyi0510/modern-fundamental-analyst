# Modern Fundamental Analyst

A public-equity research website in English, Traditional Chinese, and Simplified Chinese, featuring portfolio holdings, performance, investment memos, email subscriptions, and one-time research support.

[Visit the website](https://www.modernfundamentalanalyst.com)

Built with Next.js, React, TypeScript, and native CSS. Resend handles email, Upstash Redis coordinates rate limits and subscriber updates, Stripe provides Checkout, and Vercel hosts the site.

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

Verification includes type checking, linting, unit tests, Chromium browser tests, and a production build. GitHub Actions also audits dependencies and runs the browser suite in WebKit.

## Project Layout

| Directory | Purpose |
| --- | --- |
| `app/` | Pages, API routes, and global styles |
| `components/` | Shared UI and interactions |
| `data/` | Localized copy, portfolio snapshot, and memo catalog |
| `content/memos/` | Investment memo content |
| `lib/` | Services, calculations, and utilities |
| `tests/` | Unit and browser tests |
| `scripts/` | CI deployment gate, Node module loader, and subscription journal CLI |

Language routes are `/`, `/zh-tw`, and `/zh-cn`. Local review evidence stays in ignored `audit/`; see [evidence retention](ARCHITECTURE.md#review-evidence).

## Content and Integrations

Portfolio data is maintained in `data/portfolio.ts` as a verified monthly snapshot, not live quotes. Memo entries live in `data/memos.ts`, with articles under `content/memos/` registered in `data/memo-content.ts`.

Integration details:

- [Resend email and subscriptions](RESEND_INTEGRATION.md)
- [Upstash Redis runtime](ARCHITECTURE.md#redis-runtime)
- [Stripe setup and checklist](STRIPE_INTEGRATION.md)

See the [design system and style guide](STYLE_GUIDE.md) for tokens, component states, accessibility, and contribution rules.

See [architecture and operations](ARCHITECTURE.md) for production gating, server boundaries, and subscription reconciliation.

## Deployment

Pushes to `main` trigger GitHub Actions and Vercel Git builds. Production requires successful CI for the exact commit; see the [production gate](ARCHITECTURE.md#production-gate). Configure production credentials in Vercel and use isolated resources for preview integration testing.
