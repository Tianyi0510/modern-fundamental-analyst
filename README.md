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

For routine changes, run the focused checks in [AGENTS.md](AGENTS.md#verification-and-review). Before deployment, install the test browsers once and run the full gate:

```bash
npx playwright install chromium webkit
npm run verify
```

`npm run verify` checks types, lint, formatting, unit tests, the production build, and Chromium browser behavior. For shared UI releases, also run `npm run test:webkit`. See [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md#review-evidence) for CI browser jobs and evidence retention. Use `npm run format` to apply Prettier formatting.

## Project Layout

| Directory     | Purpose                                                              |
| ------------- | -------------------------------------------------------------------- |
| `app/`        | Pages, API routes, and global styles                                 |
| `components/` | Shared UI, page copy, and interactions                               |
| `data/`       | Portfolio snapshot, memo catalog, and memo articles                  |
| `lib/`        | Services, calculations, and utilities                                |
| `tests/`      | Unit and browser tests                                               |
| `scripts/`    | CI deployment gate, Node module loader, and subscription journal CLI |
| `docs/`       | Style guide, operations, data, and service integration guides        |

Language routes are `/`, `/zh-tw`, and `/zh-cn`. Local review evidence stays in ignored `audit/`; see [evidence retention](docs/TECHNICAL_ARCHITECTURE.md#review-evidence).

Under `app/`, route groups such as `(en)` organize pages without adding a URL segment. The `zh-tw` and `zh-cn` folders are URL segments; their names intentionally appear in the path. Route files use Next.js conventions (`page.tsx`, `layout.tsx`, `not-found.tsx`, and `route.ts`).

## Content and Integrations

Portfolio transactions, cash flows, corporate actions, and month-end valuations and XIRRs live in `data/portfolio-detail.ts`; `data/portfolio.ts` derives the website snapshot and return history. See [Portfolio Data](docs/PORTFOLIO_DATA.md) for calculation scope and updates. Memo entries live in `data/memos.ts`, with articles under `data/memos/` registered in `data/memo-content.ts`. Interface copy is maintained by its owning page or shared component.

Integration details:

- [Resend Integration](docs/RESEND_INTEGRATION.md)
- [Upstash Redis Integration](docs/UPSTASH_REDIS_INTEGRATION.md)
- [Stripe Integration](docs/STRIPE_INTEGRATION.md)
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Portfolio Data](docs/PORTFOLIO_DATA.md)

Start with the [Style Guide](docs/STYLE_GUIDE.md) for code, UI, interaction, content, and documentation principles; detailed procedures remain in the relevant domain guides.

The [Upstash Redis Integration](docs/UPSTASH_REDIS_INTEGRATION.md) guide covers Redis access, coordination, and subscription reconciliation.

## Deployment

Pushes to `main` trigger GitHub Actions and Vercel Git builds. Production requires successful CI for the exact commit; see the [production gate](docs/TECHNICAL_ARCHITECTURE.md#production-gate). Configure production credentials in Vercel and use isolated resources for preview integration testing.
