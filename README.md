# Modern Fundamental Analyst

A public-equity research website in English, Traditional Chinese, and Simplified Chinese, featuring portfolio holdings, performance, investment memos, email subscriptions, and one-time research support.

[Visit the website](https://www.modernfundamentalanalyst.com)

Built with Next.js, React, TypeScript, Tailwind CSS, customized shadcn/ui primitives, and CSS Modules. Resend handles email, Upstash Redis stores confirmation and consent records and coordinates rate limits and subscriber updates, Stripe provides Checkout, and Vercel hosts the site and manages its domain.

## Local Development

Requires Node.js 24 and npm.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). For service integrations, use [.env.example](.env.example) as a template for an uncommitted `.env.local`. Never commit credentials.

For email development, run `npm run email:contact` (or `npm run email`) and open [localhost:3001](http://localhost:3001); use `npm run email:preferences` and [localhost:3002](http://localhost:3002) for preference and subscription-confirmation emails. Nine fictional, three-language previews are available without service credentials; see [Resend templates](docs/RESEND_INTEGRATION.md#email-templates-and-local-preview).

## Verification

`npm ci` installs the local Husky pre-commit hook. It runs `npm run lint:staged`: Prettier checks supported staged files, including CSS, and sorts recognized Tailwind class lists through `prettier-plugin-tailwindcss`; ESLint checks staged JavaScript/TypeScript with the shared local cache. Unknown formats are skipped. Concurrent tasks only read files, so overlapping format and lint checks do not race to rewrite them. These checks do not rewrite files. Run `npm run format` or fix reported lint errors, review and stage the changes, then commit again. Partially staged files are checked with their unstaged changes temporarily hidden and restored by lint-staged. CI, Vercel and production installs skip hook setup; local hooks do not replace CI or release verification. See [Husky](https://typicode.github.io/husky/how-to.html) for local opt-out and GUI Node setup.

Local development uses fast, affected-scope checks from [AGENTS.md](AGENTS.md#verification-and-review). GitHub Actions owns full verification; deployment verifies the release commit and live status. A release does not require repeating the complete suite locally.

`npm run verify:static` runs types, lint, formatting and unit tests. `npm run verify` adds a production build and Chromium tests when full local diagnosis is needed. `npm run test:webkit` runs both shards against an existing production build; CI runs those shards concurrently on separate macOS runners. Install browsers with `npx playwright install chromium webkit` when needed.

PRs run full CI. A main-branch merge can reuse a recent successful full PR run with an identical Git tree; otherwise it runs full CI. The release workflow records the evidence and retains the exact-commit Vercel gate. GitHub deletes merged remote branches automatically; local merged branches are cleaned up after successful deployment. See [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md#release-workflow).

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
| `docs/`           | Style guide, operations, data, and service integration guides                          |

Layout and ordinary states use static Tailwind classes; complex component motion and charts use adjacent CSS Modules. Tokens and the single reset live in `src/app/styles/`; see [style ownership](docs/STYLE_GUIDE.md#style-ownership). React Email maintains separate inbox-compatible styling.

shadcn/ui configuration lives in `components.json`; owned primitives live in `src/components/ui/`. Native form, result and loading primitives preserve server rendering; interactive DropdownMenu and Sheet use Radix. All share the existing brand tokens and semantic HTML contracts. Follow the [component installation procedure](docs/STYLE_GUIDE.md#shadcnui-components) when adding or updating a primitive.

Language routes are `/`, `/zh-tw`, and `/zh-cn`. Local review evidence stays in ignored `audit/`; see [evidence retention](docs/TECHNICAL_ARCHITECTURE.md#review-evidence).

Under `src/app/`, route groups such as `(en)` organize pages without adding a URL segment. The `zh-tw` and `zh-cn` folders are URL segments; their names intentionally appear in the path. Route files use Next.js conventions (`page.tsx`, `layout.tsx`, `not-found.tsx`, `error.tsx`, and `route.ts`).

## Content and Integrations

Portfolio transactions, cash flows, corporate actions, and month-end valuations and XIRRs live in `src/features/portfolio/portfolio-detail.ts`; `src/features/portfolio/portfolio.ts` derives the website snapshot and return history. See [Portfolio Data](docs/PORTFOLIO_DATA.md) for calculation scope and updates. Memo entries live in `src/features/memos/memos.ts`, with articles under `src/features/memos/articles/` registered in `src/features/memos/memo-content.ts`. Interface copy is maintained by its owning page or shared component.

Subscriptions require email confirmation before activation. Existing subscribers can manage language or unsubscribe through secure preference links. Keep the three distinct server secrets (`RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, and `SUBSCRIPTION_PREFERENCES_SECRET`); see [email secrets](docs/RESEND_INTEGRATION.md#server-secrets) for their roles and rotation constraints. Public signup cannot override delivery suppression.

Integration details:

- [Resend Integration](docs/RESEND_INTEGRATION.md)
- [Upstash Redis Integration](docs/UPSTASH_REDIS_INTEGRATION.md)
- [Stripe Integration](docs/STRIPE_INTEGRATION.md)
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Portfolio Data](docs/PORTFOLIO_DATA.md)

Start with the [Style Guide](docs/STYLE_GUIDE.md) for code, UI, interaction, content, and documentation principles; detailed procedures remain in the relevant domain guides.

## Deployment

Submit changes through a pull request and review its CI and Vercel Preview results. Merge only when release is authorized. Pushes to `main` trigger fresh GitHub Actions and Vercel production builds. Production requires successful CI for the exact commit; see the [release workflow](docs/TECHNICAL_ARCHITECTURE.md#release-workflow) and [production gate](docs/TECHNICAL_ARCHITECTURE.md#production-gate). Configure production credentials in Vercel and use isolated resources for preview integration testing.
