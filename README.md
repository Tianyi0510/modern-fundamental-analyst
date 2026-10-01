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

For email development, run `npm run email:contact` (or `npm run email`) and open [localhost:3001](http://localhost:3001); use `npm run email:preferences` and [localhost:3002](http://localhost:3002) for preference emails. Six fictional, three-language previews are available without service credentials; see [Resend templates](docs/RESEND_INTEGRATION.md#email-templates-and-local-preview).

## Verification

For routine changes, run the focused checks in [AGENTS.md](AGENTS.md#verification-and-review). Before deployment, install the test browsers once and run the full gate:

```bash
npx playwright install chromium webkit
npm run verify
```

`npm run verify:static` runs types, lint, formatting and unit tests without starting a browser. `npm run verify` adds a production build and Chromium browser tests. For shared UI releases, also run `npm run test:webkit` against that build. It runs both WebKit shards, even if the first has failing tests, and returns a failure if either shard fails. See [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md#review-evidence) for CI browser jobs and evidence retention. Use `npm run format` to apply Prettier formatting.

## Project Layout

| Directory         | Purpose                                                                                |
| ----------------- | -------------------------------------------------------------------------------------- |
| `src/app/`        | Routes, localized page composition in `_components`, metadata, and global CSS          |
| `src/features/`   | Portfolio, memos, subscriptions, contact, and support; each owns its data and controls |
| `src/components/` | Shared navigation, footer, disclosure, form primitives, and email layout               |
| `src/testing/`    | Shared test helpers and the explicit Node loader                                       |
| `src/lib/`        | Shared formatting, localization, request utilities, and service clients                |
| `public/images/`  | Public icons, logos, and the social sharing image                                      |
| `.github/`        | CI workflows, production deployment gate, and WebKit runner                            |
| `docs/`           | Style guide, operations, data, and service integration guides                          |

Language routes are `/`, `/zh-tw`, and `/zh-cn`. Local review evidence stays in ignored `audit/`; see [evidence retention](docs/TECHNICAL_ARCHITECTURE.md#review-evidence).

Under `src/app/`, route groups such as `(en)` organize pages without adding a URL segment. The `zh-tw` and `zh-cn` folders are URL segments; their names intentionally appear in the path. Route files use Next.js conventions (`page.tsx`, `layout.tsx`, `not-found.tsx`, `error.tsx`, and `route.ts`).

## Content and Integrations

Portfolio transactions, cash flows, corporate actions, and month-end valuations and XIRRs live in `src/features/portfolio/portfolio-detail.ts`; `src/features/portfolio/portfolio.ts` derives the website snapshot and return history. See [Portfolio Data](docs/PORTFOLIO_DATA.md) for calculation scope and updates. Memo entries live in `src/features/memos/memos.ts`, with articles under `src/features/memos/articles/` registered in `src/features/memos/memo-content.ts`. Interface copy is maintained by its owning page or shared component.

Integration details:

- [Resend Integration](docs/RESEND_INTEGRATION.md)
- [Upstash Redis Integration](docs/UPSTASH_REDIS_INTEGRATION.md)
- [Stripe Integration](docs/STRIPE_INTEGRATION.md)
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Portfolio Data](docs/PORTFOLIO_DATA.md)

Start with the [Style Guide](docs/STYLE_GUIDE.md) for code, UI, interaction, content, and documentation principles; detailed procedures remain in the relevant domain guides.

## Deployment

Submit changes through a pull request and review its CI and Vercel Preview results. Merge only when release is authorized. Pushes to `main` trigger fresh GitHub Actions and Vercel production builds. Production requires successful CI for the exact commit; see the [release workflow](docs/TECHNICAL_ARCHITECTURE.md#release-workflow) and [production gate](docs/TECHNICAL_ARCHITECTURE.md#production-gate). Configure production credentials in Vercel and use isolated resources for preview integration testing.
