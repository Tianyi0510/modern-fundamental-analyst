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
- Localized one-time research support through Stripe Hosted Checkout at USD 6, 12, or 18
- Canonical URLs, language alternates, sitemap, robots metadata, Open Graph, and Twitter cards
- Vercel Analytics and Speed Insights
- Shared footer navigation with GitHub, LinkedIn, and X profile links
- Responsive navigation with a viewport-fixed mobile header, mobile-specific portfolio presentation, accessible focus states, touch-specific active feedback, and reduced-motion support

## Technology

- Next.js 16 App Router
- React 19
- TypeScript 6 in strict mode
- Native CSS and CSS Modules
- `next/font` with Jost Variable, Noto Sans TC, and Noto Sans SC
- Resend for contact and subscriber email
- Stripe Checkout, Managed Payments, and Automatic Tax for one-time research support
- Redis for shared server-side rate-limit state, with a privacy-preserving in-memory fallback
- Playwright for browser-level computed-style verification
- GitHub Actions for continuous integration
- Vercel for builds, server functions, analytics, and production hosting
- Wix for domain registration and DNS management

## Application Structure

```text
app/                         App Router pages, layouts, APIs, and global styles
  (en)/                      English routes
  zh-tw/                     Traditional Chinese routes
  zh-cn/                     Simplified Chinese routes
  api/                       Contact, subscribe, preference, webhook, and Stripe Checkout endpoints
components/                  Shared components and isolated client interaction hooks
content/memos/               Versioned long-form investment memo source content
data/                        Localized copy, portfolio snapshot, and memo catalog
lib/                         Domain services, formatting, i18n, email, Redis, and utilities
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

The interface follows a modern financial-editorial direction: strong typography, generous spacing, square data surfaces, high-contrast section changes, and restrained motion. Home, Portfolio, and Performance use one shared KPI-block geometry and content rhythm across desktop and mobile. Shared header, footer, button, language-menu, and home-page interactions use consistent color and scale feedback, with touch-specific active states that avoid sticky hover behavior on mobile devices. At 800px and below, the header itself becomes a full-viewport-width fixed surface while its contents retain the shared page gutter; the document reserves the same 78px height so content never slides underneath it. The mobile menu reveals from the top, uses staggered navigation motion, supports a right-swipe close gesture, and identifies the current page with the same light-blue surface and Medium Blue text used by desktop navigation. Numbered editorial labels, legal and disclaimer rows, and supporting copy use baseline-aligned layouts across desktop and mobile.

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

- English and numeric UI: [Jost Variable](https://indestructibletype.com/Jost.html)
- Traditional Chinese: Jost for Latin characters and numbers, with Noto Sans TC for CJK glyphs
- Simplified Chinese: Jost for Latin characters and numbers, with Noto Sans SC for CJK glyphs
- Jost variable range: 100-900; semantic UI weights: 400 and 700
- Dates and financial figures use tabular numerals
- All `font-size` values are defined once as semantic role tokens in `app/styles/base.css`
- Body, lead, label, control, caption, ring, and row roles use `rem` so they respect the browser's root text size
- Page, section, card, compact, display-data, and KPI roles use bounded `clamp()` expressions that combine `rem` and `vw`
- Components may reference only their assigned `--font-size-*` role and cannot switch roles at responsive breakpoints
- Page titles use `line-height: 1.05`; section and card titles use `1.1`; compact titles use `1.2`
- Financial data keeps `line-height: 1`; all heading and data roles retain `letter-spacing: -.05em`
- Body, caption, and control text use `line-height: 1.5` with zero letter spacing; labels retain `.05em` tracking
- Component controls use `em` for internal horizontal spacing where that spacing should scale with the control text

The role scale covers page, section, card, and compact titles; lead and body copy; labels, controls, and captions; plus display, KPI, ring, and row data. `typography.css` maps shared content roles, while `component-typography.css` handles component-specific mappings. `responsive.css` changes layout and interaction behavior only—it contains no `font-size` declarations.

Global CSS is separated by responsibility:

- `reset.css` — browser normalization
- `base.css` — tokens and global foundations
- `chrome.css` — header, footer, buttons, and shared site chrome
- `pages.css` — page and content layouts
- `typography.css` — semantic type mappings
- `component-typography.css` — component-level mappings to the semantic type scale
- `responsive.css` — breakpoints and reduced-motion behavior
- `colors.css` — semantic color roles

## Portfolio and Memo Data

Localized home-page copy is maintained in `data/home-copy.ts`, separate from the shared server-rendered layout. Portfolio holdings are maintained in `data/portfolio.ts`. The application derives cost basis, market value, position weights, holding returns, and portfolio totals from that single snapshot so displayed figures remain internally consistent.

Google Sheets is the public source record, but the production site does not fetch it at request time. A verified monthly snapshot is committed to the repository and deployed with the application. Prices are therefore not live quotes.

Investment memo metadata is maintained in `data/memos.ts`. `data/memo-content.ts` is the lightweight content registry, while each long-form article lives in its own versioned module under `content/memos/`. Google Docs may serve as the source document, but published content is versioned with the website rather than fetched at runtime.

## Email and Subscription Flow

Resend handles contact delivery, subscribers, segments, templates, automations, and broadcasts. The subscribe API validates the HTTP boundary and delegates provider orchestration to `lib/subscription-service.ts`. New subscriptions store a preferred-language property, synchronize the corresponding language segment, and trigger a localized welcome event containing the latest memo.

One Resend client is reused per runtime instance and recreated automatically if its API key changes. Provider calls pass through a shared exception boundary so transient network failures return controlled API responses without exposing contact data. Direct contact and preference-link emails use request-scoped Resend idempotency keys, allowing a browser to retry the same unchanged submission without creating a duplicate email. Preferred-language segment removals run concurrently and use best-effort compensation: if a multi-step update fails, successfully removed language segments are restored and a newly added target segment is removed.

The signed Resend webhook at `/api/webhooks/resend` processes bounce, complaint, and suppression events. It verifies the untouched request body and Svix signature before marking matching contacts as unsubscribed; invalid signatures and oversized payloads are rejected before any contact update.

Subscribers can request a short-lived secure link to update their preferred language or unsubscribe. Preference links use authenticated AES-256-GCM encryption and a dedicated server-side secret. A migration fallback preserves links created before that secret was introduced.

## Stripe Support Flow

The localized `/support` pages offer voluntary one-time support at USD 6, 12, or 18. A same-origin, rate-limited server endpoint validates the selected amount and locale before creating a Stripe Hosted Checkout Session; Stripe credentials and Price IDs never reach the browser. Dynamic Payment Methods remain Dashboard-controlled because the integration intentionally omits `payment_method_types`.

Live Checkout enables Automatic Tax and uses the account's Managed Payments default. Active Live Tax Registrations were confirmed before Automatic Tax was enabled. Checkout collects the customer location needed to calculate applicable tax. Stripe's Business custom domain serves Checkout at `pay.modernfundamentalanalyst.com/c/...`, Payment Links at `/b/...`, and the Customer Portal at `/p/...`. The site's Content Security Policy permits form navigation to the same origin, the custom payment domain, and `https://checkout.stripe.com` as a fallback. No payment webhook is required while support does not unlock content or trigger fulfillment; add a signature-verified webhook before introducing supporter benefits or entitlement state.

## Redis Rate Limiting

Redis supplies shared rate-limit state across Vercel Functions. The implementation is intentionally small and failure-tolerant:

- The Function bundle imports `@redis/client` directly, excluding the unused Bloom, JSON, Search, and Time Series modules from the production dependency graph.
- One multiplexed client and one in-flight connection promise are reused per runtime instance.
- Connection and socket timeouts fail quickly, the offline queue is disabled, and reconnect attempts are bounded.
- Failed connections or rate-limit commands open a 30-second circuit breaker so an outage does not trigger another Redis attempt on every request.
- A Lua script performs `INCR` and `PEXPIRE` atomically for each fixed rate-limit window.
- Rate-limit option and namespace validation rejects invalid bounds before they can create unbounded fallback behavior or malformed Redis keys.
- The process-local fallback mirrors the same fixed-window model with one bounded counter and expiry timestamp per client instead of retaining one timestamp per request; fallback reuses the request's existing HMAC identifier.
- Keys follow the compact, versioned `mfa:rl:v2:{namespace}:{base64url-digest}` convention, reducing key bytes compared with hexadecimal identifiers.
- Client identifiers always use HMAC-SHA256 with one runtime-cached secret; raw IP addresses are never stored in Redis or the memory fallback. If no configured secret is available locally, the runtime generates an ephemeral HMAC key instead of using a predictable unkeyed hash.
- Redis failures fall back to a bounded process-local limiter so public forms remain available.
- Repeated connection errors are log-throttled by error category to keep Vercel logs useful during an outage without hiding unrelated failures.
- Upstash Free is connected through Vercel Marketplace and exposes the native TCP endpoint as `UPSTASH_REDIS_URL` only to Production.
- The Redis client accepts only authenticated `rediss://` connections, so credentials and rate-limit traffic are protected by TLS.
- Redis authentication is mandatory. Only HMAC-derived client identifiers, counters, and short TTLs are transmitted; raw IP addresses and form contents never enter Redis.

Required server-side environment variables:

```bash
RESEND_API_KEY=
RESEND_WEBHOOK_SECRET=
CONTACT_TO_EMAIL=
SUBSCRIPTION_PREFERENCES_SECRET=
UPSTASH_REDIS_URL=
RATE_LIMIT_HASH_SECRET=
STRIPE_RESTRICTED_KEY=
STRIPE_PRICE_USD_6=
STRIPE_PRICE_USD_12=
STRIPE_PRICE_USD_18=
```

Production is the only Vercel environment with Resend, contact-delivery, subscription-preference, shared rate-limit, and live Stripe credentials. Preview intentionally has no server-side service credentials, so branch and pull-request deployments can review the interface without sending email, changing the production audience, accessing production Redis, or creating live Checkout Sessions. Development uses uncommitted local `.env.local` values when service integration testing is explicitly needed.

`RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `CONTACT_TO_EMAIL`, `SUBSCRIPTION_PREFERENCES_SECRET`, `RATE_LIMIT_HASH_SECRET`, the Stripe server key, and the three live Stripe Price IDs are Production variables. Prefer a least-privilege `STRIPE_RESTRICTED_KEY`; `STRIPE_SECRET_KEY` is accepted only as a compatibility fallback. `UPSTASH_REDIS_URL` is an integration-managed Production variable created by the Vercel Marketplace connection. The rate-limit secret can fall back to the preference secret and then the Resend key for local compatibility, but separate production secrets provide stronger key separation.

The three optional `RESEND_SEGMENT_*` variables can override the checked-in language-segment defaults when Resend segments are recreated.

Never commit production credentials. Configure them in Vercel and use `.env.local` only for local development.

## Local Development

Requirements:

- Node.js 24.19.0 (latest Node.js 24 LTS patch; `24.x` is used in production)
- npm

Install dependencies and start the development server:

```bash
npm ci
npx playwright install chromium
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
3. Node unit and repository-invariant tests
4. Playwright computed-style tests
5. A production Next.js build

The computed-style suite opens the principal routes in Chromium at 1440px, 801px, and 390px. It verifies that every sampled component resolves to the expected semantic role size, that each role has one computed size per viewport, and that typography changes do not introduce horizontal overflow. Mobile interaction tests use an iPhone user agent, touch input, a 3x device scale, and a 390×844 viewport; they verify that the full-width header remains at `top: 0` after scrolling and that the menu still opens, traps focus, and closes correctly.

GitHub Actions installs Chromium and runs the same verification for every pull request and every push to `main`. It also audits production dependencies for high-severity vulnerabilities.

Individual commands are available as `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.

Tests are grouped by responsibility: behavioral API, email, preference, Resend, Stripe Checkout, and Rate Limiter tests live in focused files; Redis connection architecture checks live in `tests/redis-config.test.mjs`; broader page, portfolio, memo, and design-system invariants are split across their corresponding test files. Browser-level typography role verification lives in `tests/typography-roles.spec.ts`, mobile header and navigation verification lives in `tests/header-mobile-layout.spec.ts`, and shared Playwright settings live in `playwright.config.ts`.

## Deployment

The production delivery path is:

```text
Local repository → GitHub → GitHub Actions → Vercel → Wix-managed DNS
```

Pushes to `main` trigger both the GitHub Actions verification workflow and a Vercel Production deployment through the Git integration. Vercel installs dependencies with `npm ci`, builds the same commit, and assigns the production aliases after a successful deployment. Pull requests and non-production branches receive Preview deployments without production service credentials. The public domain remains managed through Wix DNS, while application hosting and server functions run on Vercel.

## Content Updates

For a monthly portfolio update:

1. Verify the source Google Sheet.
2. Update the snapshot and date in `data/portfolio.ts`.
3. Confirm all derived totals and localized date displays.
4. Run `npm run verify`.
5. Submit and merge the change through the normal GitHub workflow.

For a new investment memo:

1. Add the localized catalog entry in `data/memos.ts`.
2. Add a dedicated source-content module under `content/memos/`.
3. Register that module in `data/memo-content.ts`.
4. Verify the list page, article page, metadata, and all three locales.
5. Update the related Resend broadcast or automation content when required.
6. Run `npm run verify` before deployment.
