# Design QA — Footer Subscribe Redesign

## Evidence

- Source visual truth: `/Users/davidli/.codex/visualizations/2026/08/14/01a00138-4bbc-73e2-bcba-170108a73a34/footer-redesign/paypal-footer-reference.png`
- Rendered implementation: `/Users/davidli/.codex/visualizations/2026/08/14/01a00138-4bbc-73e2-bcba-170108a73a34/footer-redesign/mfa-footer-no-label.png`
- Local route: `http://127.0.0.1:3000/contact#subscribe`
- Viewport: 1280 × 720 CSS px
- Source pixels: 1280 × 720; implementation pixels: 1280 × 720
- Density normalization: both captures are 1× at the same pixel dimensions; no resampling required
- State: desktop, black inverse footer, empty email field, idle submit button

## Full-View Comparison

The source and implementation were viewed together in one comparison input. The implementation preserves the reference's core composition: inverse black footer, separate brand and quick-link columns, a prominent right-side email-alert area, inline email control and white pill CTA, and a divided lower legal row. The footer is intentionally shorter because Modern Fundamental Analyst has fewer legal and alert-category links than PayPal.

## Focused Region Comparison

A separate crop was not needed: the 1280 × 720 comparison renders the form control, CTA, headings, body copy, divider, and lower links at a clearly readable size. The subscribe region was also inspected in the live browser after scrolling it into view.

## Required Fidelity Surfaces

- Fonts and typography: Inter/Noto Sans TC project typography remains intact; hierarchy, weights, line heights, and wrapping are consistent with the existing design system.
- Spacing and layout rhythm: three-column desktop hierarchy and lower divider match the reference pattern without adding unnecessary empty alert categories.
- Colors and visual tokens: black, white, and existing light-blue accent tokens are used; contrast is appropriate and green/red data colors remain absent from navigation and form UI.
- Image quality and assets: no reference imagery is required for this adapted component; the existing text wordmark is preserved and no placeholder or synthetic asset was introduced.
- Copy and content: localized English, Traditional Chinese, and Simplified Chinese labels and status messages are preserved; nonessential explanatory copy and the duplicate Subscribe link were removed.
- Responsiveness: the existing 800px breakpoint stacks the footer and form, makes the CTA full-width, and prevents horizontal overflow.
- Accessibility and interaction: semantic footer/nav/section structure, visible focus ring, associated email label, live status region, disabled submitting state, and honeypot protection remain present.

## Findings

- No actionable P0, P1, or P2 differences remain.
- [P3] The implementation does not reproduce PayPal's alert-category checkboxes. This is intentional because the current product has a single research-update subscription rather than multiple alert types.

## Comparison History

1. Initial comparison found a P2 token conflict: the Subscribe label inherited the footer's muted paragraph color instead of the light-blue section accent.
2. Fix applied: strengthened the component-scoped label color so it remains light blue inside the inverse footer.
3. Post-fix evidence: `mfa-footer-prototype.png` shows both Quick Links and Subscribe labels using the light-blue accent while the explanatory copy remains muted white.
4. The user requested a cleaner interface with fewer annotations. The introductory paragraph, consent note, and duplicate lower Subscribe link were removed.
5. Final evidence: `mfa-footer-clean.png` shows a concise heading, email field, and CTA with a single legal line and no redundant explanatory blocks.
6. The user requested removal of the remaining blue Subscribe label. The label and its unused localized copy/style were removed.
7. Final evidence: `mfa-footer-no-label.png` shows only the white subscription title, email field, and CTA in the form column.

## Implementation Checklist

- [x] Embed Subscribe form in the global footer
- [x] Preserve all three locales
- [x] Preserve Resend API integration and form states
- [x] Match reference form and CTA composition
- [x] Add responsive stacking rules
- [x] Verify typecheck, lint, repository tests, and production build

final result: passed
