# Modern Fundamental Analyst

Modern Fundamental Analyst is a multilingual public-equity research website. It presents an independently maintained portfolio, a transparent performance record, long-form investment memos, and the methodology behind the published results.

Production: [modernfundamentalanalyst.com](https://www.modernfundamentalanalyst.com)

## Features

- English, Traditional Chinese, and Simplified Chinese experiences
- Portfolio holdings, cost basis, market value, allocation, and return calculations
- Performance reporting against SPY with documented methodology
- Localized investment memo index and article pages
- Contact form delivered through Resend
- Newsletter subscription, localized welcome emails, language preferences, and self-service unsubscribe
- Canonical URLs, language alternates, sitemap, robots metadata, Open Graph, and Twitter cards
- Vercel Analytics and Speed Insights
- Responsive navigation, mobile-specific portfolio presentation, accessible focus states, and reduced-motion support

## Technology

- Next.js 16 App Router
- React 19
- TypeScript 5 in strict mode
- Native CSS and CSS Modules
- `next/font` with Inter, Noto Sans TC, and Noto Sans SC
- Resend for contact and subscriber email
- Redis for shared server-side rate-limit state, with a privacy-preserving in-memory fallback
- GitHub Actions for continuous integration
- Vercel for builds, server functions, analytics, and production hosting
- Wix for domain registration and DNS management

## Application Structure

```text
app/                         App Router pages, layouts, APIs, and global styles
  (en)/                      English routes
  zh-tw/                     Traditional Chinese routes
  zh-cn/                     Simplified Chinese routes
  api/                       Contact, subscribe, and preference endpoints
components/                  Shared server and client components
data/                        Localized home copy, portfolio snapshot, and memo content
lib/                         Formatting, calculations, i18n, email, Redis, and site utilities
public/                      Favicon and social-sharing image
tests/                       Node test suite and repository-level assertions
.github/workflows/ci.yml     Pull-request and main-branch verification
```

Localized URLs use these route conventions:

- English: `/`
- Traditional Chinese: `/zh-tw`
- Simplified Chinese: `/zh-cn`

The three language versions share page components wherever possible. Locale files provide copy and metadata while preserving the same information architecture and interaction patterns.

## Design System

The interface follows a modern financial-editorial direction: strong typography, generous spacing, square data surfaces, high-contrast section changes, and restrained motion.

### Color Tokens

| Token | Value | Primary role |
| --- | --- | --- |
| Black | `#000000` | Primary text and inverse surfaces |
| White | `#FFFFFF` | Primary surface and inverse text |
| Deep Blue | `#002991` | Brand surfaces and headings |
| Medium Blue | `#008CFF` | Interactive and data accents |
| Bright Blue | `#5FCDFD` | Highlight surfaces and inverse accents |
| Gray | `#EDEDED` | Rules and neutral UI |
| Background Gray | `#F8F9FB` | Section backgrounds and form controls |
| Price Up | `#34A853` | Positive financial data only |
| Price Down | `#FF0000` | Negative financial data only |

The semantic aliases live in `app/styles/colors.css`; the base values and type scale live in `app/styles/base.css`.

### Typography

- English and numeric UI: Inter
- Traditional Chinese: Noto Sans TC
- Simplified Chinese: Noto Sans SC
- Supported weights: 400 and 700
- Dates and financial figures use tabular numerals
- Desktop and mobile use explicit token values instead of fluid `clamp()` sizing

Global CSS is separated by responsibility:

- `reset.css` — browser normalization
- `base.css` — tokens and global foundations
- `chrome.css` — header, footer, buttons, and shared site chrome
- `pages.css` — page and content layouts
- `typography.css` — semantic type mappings
- `responsive.css` — breakpoints and reduced-motion behavior
- `colors.css` — semantic color roles

## Portfolio and Memo Data

Localized home-page copy is maintained in `data/home-copy.ts`, separate from the shared server-rendered layout. Portfolio holdings are maintained in `data/portfolio.ts`. The application derives cost basis, market value, position weights, holding returns, and portfolio totals from that single snapshot so displayed figures remain internally consistent.

Google Sheets is the public source record, but the production site does not fetch it at request time. A verified monthly snapshot is committed to the repository and deployed with the application. Prices are therefore not live quotes.

Investment memo metadata is maintained in `data/memos.ts`, while article content is stored in `data/memo-content.ts`. Google Docs may serve as the source document, but published content is versioned with the website rather than fetched at runtime.

## Email and Subscription Flow

Resend handles contact delivery, subscribers, segments, templates, automations, and broadcasts. New subscriptions store a preferred-language property, synchronize the corresponding language segment, and trigger a localized welcome event containing the latest memo.

One Resend client is reused per runtime instance and recreated automatically if its API key changes. Provider calls pass through a shared exception boundary so transient network failures return controlled API responses without exposing contact data. Preferred-language segment changes use best-effort compensation: if a multi-step update fails, successfully removed language segments are restored and a newly added target segment is removed.

The signed Resend webhook at `/api/webhooks/resend` processes bounce, complaint, and suppression events. It verifies the untouched request body and Svix signature before marking matching contacts as unsubscribed; invalid signatures and oversized payloads are rejected before any contact update.

Subscribers can request a short-lived secure link to update their preferred language or unsubscribe. Preference links use authenticated AES-256-GCM encryption and a dedicated server-side secret. A migration fallback preserves links created before that secret was introduced.

## Redis Rate Limiting

Redis supplies shared rate-limit state across Vercel Functions. The implementation is intentionally small and failure-tolerant:

- One multiplexed client and one in-flight connection promise are reused per runtime instance.
- Connection and socket timeouts fail quickly, the offline queue is disabled, and reconnect attempts are bounded.
- Failed connections open a 30-second circuit breaker so an outage does not trigger a fresh authentication attempt on every request.
- A Lua script performs `INCR` and `PEXPIRE` atomically for each fixed rate-limit window.
- The process-local fallback mirrors the same fixed-window model with one bounded counter and expiry timestamp per client instead of retaining one timestamp per request.
- Keys follow the versioned `mfa:rate-limit:v1:{namespace}:{digest}` convention.
- Client identifiers always use HMAC-SHA256; raw IP addresses are never stored in Redis or the memory fallback. If no configured secret is available locally, the runtime generates an ephemeral HMAC key instead of using a predictable unkeyed hash.
- Redis failures fall back to a bounded process-local limiter so public forms remain available.
- Repeated connection errors are log-throttled by error category to keep Vercel logs useful during an outage without hiding unrelated failures.
- `rediss://` is required by default in production. If the provider exposes only `redis://`, the non-TLS connection must be explicitly acknowledged with `REDIS_ALLOW_INSECURE=true`; production then emits a warning without logging the endpoint or credentials.
- Redis authentication is mandatory. Only HMAC-derived client identifiers, counters, and short TTLs are transmitted; raw IP addresses and form contents never enter Redis.

Required server-side environment variables:

```bash
RESEND_API_KEY=
RESEND_WEBHOOK_SECRET=
CONTACT_TO_EMAIL=
SUBSCRIPTION_PREFERENCES_SECRET=
REDIS_URL=
REDIS_ALLOW_INSECURE=false
RATE_LIMIT_HASH_SECRET=
```

`RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `CONTACT_TO_EMAIL`, `SUBSCRIPTION_PREFERENCES_SECRET`, and `RATE_LIMIT_HASH_SECRET` are configured as Sensitive variables in Vercel Production and Preview. The rate-limit secret can fall back to the preference secret and then the Resend key for local compatibility, but separate production secrets provide stronger key separation.

Keep `REDIS_ALLOW_INSECURE=false` whenever TLS is available. For a provider-issued non-TLS endpoint, set it to `true` only in the environments that use that endpoint. This acknowledgement does not encrypt traffic; migrate back to `rediss://` as soon as the provider exposes TLS.

The three optional `RESEND_SEGMENT_*` variables can override the checked-in language-segment defaults when Resend segments are recreated.

Never commit production credentials. Configure them in Vercel and use `.env.local` only for local development.

## Local Development

Requirements:

- Node.js 22.x (22.13 or newer)
- npm

Install dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Checks

Run the complete local verification pipeline:

```bash
npm run verify
```

This command runs:

1. TypeScript type checking
2. ESLint
3. Node tests
4. A production Next.js build

GitHub Actions runs the same verification for every pull request and every push to `main`. It also audits production dependencies for high-severity vulnerabilities.

Individual commands are available as `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.

Tests are grouped by responsibility: behavioral API, email, preference, and Resend segment-compensation tests live in focused files; Redis connection and rate-limit architecture checks live in `tests/redis-config.test.mjs`; broader cross-page and design-system invariants remain in `tests/repository.test.mjs`.

## Deployment

The production delivery path is:

```text
Local repository → GitHub → GitHub Actions → Vercel → Wix-managed DNS
```

Vercel installs dependencies with `npm ci`. A production deployment should only be promoted after the verification pipeline passes. The public domain remains managed through Wix DNS, while application hosting and server functions run on Vercel.

## Content Updates

For a monthly portfolio update:

1. Verify the source Google Sheet.
2. Update the snapshot and date in `data/portfolio.ts`.
3. Confirm all derived totals and localized date displays.
4. Run `npm run verify`.
5. Submit and merge the change through the normal GitHub workflow.

For a new investment memo:

1. Add the localized catalog entry in `data/memos.ts`.
2. Add the source article content in `data/memo-content.ts`.
3. Verify the list page, article page, metadata, and all three locales.
4. Update the related Resend broadcast or automation content when required.
5. Run `npm run verify` before deployment.
