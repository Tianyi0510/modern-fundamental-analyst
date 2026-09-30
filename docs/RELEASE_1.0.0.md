# Modern Fundamental Analyst 1.0.0

Status: release preparation; not yet tagged or published.

## Release notes

The first stable release brings together multilingual equity research, portfolio reporting, and reader services.

- English, Traditional Chinese, and Simplified Chinese pages with localized navigation, metadata, and sharing previews.
- Portfolio holdings, allocation, sortable data, and performance history against SPY. Published data is a dated snapshot as of 31 August 2026, not live market data. The Performance chart presents since-inception annualized XIRR at each month-end.
- Investment memos with native expandable sections, responsive layouts, and reduced-motion support.
- Contact and subscription workflows using Resend, encrypted preference links, and Redis-backed rate limiting and subscriber coordination.
- One-time research support through Stripe Checkout with server-side payment verification.
- Application code organized under `src/`, with TypeScript, ESLint, Stylelint, Prettier, unit tests, and production-build browser checks in GitHub Actions.

## Release preparation

The intended tag is `v1.0.0`. Both package manifests declare `1.0.0`; the application remains private and is not an npm publication.

The preparation baseline is commit `3d889dfc94b0c6733483999e40779226481f7094`. Its [GitHub Actions run](https://github.com/Tianyi0510/modern-fundamental-analyst/actions/runs/36490139992) passed. This evidence applies to the baseline, not the future release commit.

No portfolio data or service configuration is changed by the version bump. Existing text-contrast limitations are recorded in the [Style Guide](STYLE_GUIDE.md); this release does not claim full accessibility compliance. Browser automation does not replace physical iPhone testing.

## Physical iPhone acceptance

Status: pending; automated WebKit results do not establish physical-device acceptance.

Record the iPhone model, iOS/Safari version, tested commit or deployment URL, date, and result. Check all three languages:

- Open and close Menu repeatedly, including interrupted animation; navigate between pages and use browser Back.
- Verify focus returns to the Menu button and the page returns to its previous scroll position after dismissal.
- Expand and collapse memo and monthly-data disclosures repeatedly; confirm scrolling, focus, and controls remain usable.
- Change Portfolio sort column and direction; verify VoiceOver announces column labels and the active sort state.

## Publication checklist

- Review and commit the version manifests and these release notes; review unrelated workspace changes separately.
- Complete the deployment checks in [AGENTS.md](../AGENTS.md#verification-and-review), including WebKit for shared UI changes.
- Push the approved release commit through the existing GitHub Actions and Vercel Git integration. Require successful CI for that exact commit.
- Confirm Vercel is READY, production aliases point to the release commit, and affected routes pass read-only smoke checks.
- Create `v1.0.0` on the verified release commit and publish the GitHub Release using the Release notes section above.
- Record the final commit, release URL, and publication date here after publication. Never tag the preparation baseline merely because its CI passed.
