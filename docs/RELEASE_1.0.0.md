# Modern Fundamental Analyst 1.0.0

Status: release-preparation draft. This is historical preparation evidence, not confirmation of a tag, GitHub Release or production version. Verify the final commit before publication.

## Release notes

The planned first stable release includes:

- English, Traditional Chinese, and Simplified Chinese pages with localized navigation, metadata, and sharing previews.
- Portfolio holdings, allocation, sorting and performance against SPY, the only benchmark. The snapshot is dated 30 September 2026. Separate cumulative reconstructed TWR and since-inception annualized XIRR charts have monthly tables. See [calculation scope and reconstruction](WEB_APPLICATION_ARCHITECTURE.md#portfolio-data).
- Investment memos with native expandable sections, responsive layouts, and reduced-motion support.
- Contact and subscription workflows using Resend, three-language confirmation emails, explicit double opt-in, encrypted preference links, and Redis-backed recipient limits and subscriber coordination.
- Replay-safe confirmation and delivery feedback, persistent suppression, and confirmed consent retained when welcome delivery needs reconciliation.
- One-time research support through Stripe Checkout with server-side payment verification.
- Application code organized under `src/`, with TypeScript, ESLint, Prettier with Tailwind class sorting, unit tests, and production-build browser checks in GitHub Actions.

## Release preparation

The intended tag is `v1.0.0`. Both package manifests declare `1.0.0`; the application remains private and is not an npm publication.

The preparation baseline is commit `3d889dfc94b0c6733483999e40779226481f7094`. Its [GitHub Actions run](https://github.com/Tianyi0510/modern-fundamental-analyst/actions/runs/36490139992) passed. This evidence applies to the baseline, not the future release commit.

The version bump changes no portfolio data or service settings. [Design System](DESIGN_SYSTEM.md#typography-roles) records text-contrast limits; this release claims no full accessibility compliance. Browser automation does not replace physical iPhone checks.

## Subscription delivery scope

Activation requires an explicit confirmation POST. Existing preference links remain compatible. Welcome failures retain a journal for reconciliation; no replay worker or seamless preference-secret rotation is included. Mocked tests and builds do not prove inbox delivery, DNS authentication or provider setup.

## Physical iPhone acceptance

Status: pending; automated WebKit results do not establish physical-device acceptance.

Record device model, iOS/Safari version, commit or deployment URL, date and result. Test all three languages:

- Open and close Menu repeatedly, including interrupted animation; navigate between pages and use browser Back.
- Verify focus returns to the Menu button and the page returns to its previous scroll position after dismissal.
- Expand and collapse memo and monthly-data disclosures repeatedly; confirm scrolling, focus, and controls remain usable.
- Change Portfolio sort column and direction; verify VoiceOver announces column labels and the active sort state.

## Publication checklist

- Review the final changes and release notes, confirm both version manifests, and commit the intended release scope; preserve unrelated workspace work.
- Complete the [deployment checks in AGENTS.md](../AGENTS.md#deployment-completion) for the final commit. CI owns the full Chromium/WebKit and production-build gates; do not routinely repeat full local suites before release.
- Push the approved release commit through the existing GitHub Actions and Vercel Git integration. Require successful CI for that exact commit.
- Confirm Vercel is READY and production aliases point to the release commit. Follow the existing workflow for any affected-route smoke checks.
- Complete the [email release checks](INTEGRATIONS.md#resend-verification), including confirmation and webhook configuration, without rotating the existing secrets. Real test sends require separate authorization.
- Create `v1.0.0` on the verified release commit and publish the GitHub Release using the Release notes section above.
- Record the final commit, release URL, and publication date here after publication. Never tag the preparation baseline merely because its CI passed.
