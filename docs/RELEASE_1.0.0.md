# Release Notes — 1.0.0

## Features

The planned first stable release includes:

- English, Traditional Chinese and Simplified Chinese pages with localized navigation, metadata and sharing previews.
- Portfolio holdings, allocation and sorting, with performance compared against SPY. Cumulative reconstructed TWR and since-inception annualized XIRR charts include monthly tables. Portfolio data reflects the 30 September 2026 snapshot.
- Investment memos with collapsible sections, an expandable article table of contents and article-link copying.
- Responsive layouts, light and dark themes, and reduced-motion support.
- Contact forms and email subscriptions through Resend, with localized confirmation emails, explicit double opt-in and encrypted preference links.
- Redis-backed subscriber coordination, recipient limits, replay protection and persistent delivery suppression. Confirmed consent is retained when welcome delivery requires reconciliation.
- One-time research support through Stripe Checkout with server-side payment verification.

## Improvements

- Updated the runtime target to Node.js 24.22.1 LTS and npm 12.2.1, along with compatible SDKs, UI packages and development tools.
- Updated MSW network guards and aligned Stripe requests with API version `2026-09-30.endive` for SDK 23.0.1.
- Standardized Email Preferences links at 16px and weight 400 across all three languages.
- Added automated unit, integration and production-browser checks, plus calibrated performance budgets in GitHub Actions.
- Load article typography styles only on investment memo article routes, reducing CSS on other pages.

## Fixes

- Allowed the exact `127.0.0.1` development origin so local previews hydrate correctly and interactive controls remain usable.
- Aligned CPU calibration with Lighthouse's browser launch settings and fresh-page measurements while preserving the CPU target, 15% drift allowance and performance budgets.

## Known Limitations

- Portfolio returns use closing-price reconstructions rather than observed intraday valuations.
- Failed welcome deliveries require reconciliation; an automatic replay worker is not included.
- TypeScript 7 and ESLint 10 upgrades remain constrained by required lint-plugin compatibility. A development-only dependency advisory remains tracked in the [architecture guide](WEB_APPLICATION_ARCHITECTURE.md#dependency-versions).
- Physical iPhone acceptance remains unverified; automated WebKit tests do not establish physical-device compatibility.
