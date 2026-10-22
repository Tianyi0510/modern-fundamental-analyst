# Modern Fundamental Analyst 1.0.0

Status: release-preparation draft. This is historical preparation evidence, not confirmation of a tag, GitHub Release or production version. Verify the final commit before publication.

## Release notes

The planned first stable release includes:

- English, Traditional Chinese, and Simplified Chinese pages with localized navigation, metadata, and sharing previews.
- Portfolio holdings, allocation, sorting and performance against SPY, the only benchmark. The snapshot is dated 30 September 2026. Separate cumulative reconstructed TWR and since-inception annualized XIRR charts have monthly tables. See [calculation scope and reconstruction](WEB_APPLICATION_ARCHITECTURE.md#portfolio-data).
- Investment memos with Base UI-backed shadcn/ui collapsible sections and an expandable article table of contents, responsive layouts, and reduced-motion support.
- Contact and subscription workflows using Resend, three-language confirmation emails, explicit double opt-in, encrypted preference links, and Redis-backed recipient limits and subscriber coordination.
- Replay-safe confirmation and delivery feedback, persistent suppression, and confirmed consent retained when welcome delivery needs reconciliation.
- One-time research support through Stripe Checkout with server-side payment verification.
- Application code organized under `src/`, with TypeScript, ESLint, Prettier with Tailwind class sorting, unit tests, and production-build browser checks in GitHub Actions.

## Workspace Update — 22 October 2026

Status: uncommitted release preparation. This update has not been deployed or tagged.

- Upgrade the project runtime target to Node 24.22.1 LTS and package manager to npm 12.2.1. Update compatible SDKs, UI packages, test tools and SHA-pinned GitHub Actions. See the [resolved inventory and upgrade constraints](WEB_APPLICATION_ARCHITECTURE.md#dependency-versions).
- Migrate MSW 3 unhandled-network guards and pin Stripe requests to `2026-09-30.endive` for SDK 23.0.1. Preserve request validation, idempotency and payment verification.
- Render Email Preferences links at 16px and weight 400 in standard and inverse subscription forms across all three languages.
- Permit the exact `127.0.0.1` development origin so Codex previews hydrate with the default dev startup command. Keep unrelated origins blocked.
- Standardize architecture document headings in Title Case and record current versions separately from deployed evidence.

TypeScript 7 and ESLint 10 remain blocked by required lint-plugin peer support. Sentry Core matches the Next.js SDK version, and Node types follow the selected LTS major. The unresolved development-only braces advisory remains tracked in the architecture guide. Do not describe this preparation as an unconditional all-latest or vulnerability-free release.

Local validation passed: clean npm 12 installation, type checking, lint, 325 Node tests, 23 unit tests, 62 component integration tests, 11 development-browser checks across Chromium and WebKit, and 35 production-browser checks for charts, support status and Sentry. The production-mode Turbopack build passed with Sentry uploads disabled and an isolated test DSN. Provider writes were mocked. The production dependency audit reported no known vulnerabilities; the development advisory above remains unresolved. Production CI, deployment acceptance and physical iPhone verification remain pending.

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
