# Design QA

Date: 2026-10-17. Scope: implement the first selected typography direction as a visible composition redesign, using complete Geist presets with Jost and the existing brand colors, except for the preserved original Logo wordmark. Workspace verification only.

## Target and Evidence

- Source: `/Users/davidli/.codex/generated_images/01a0cb57-f66e-7e51-ad28-50d8e9ab792e/exec-0e66ecd5-ae41-4795-ab8d-a27601f3242a.png` (1487 × 1058).
- Implementation: `http://127.0.0.1:3000/`, final production build, closed navigation and no focused control.
- In-app browser CSS viewport: 1488 × 1058. Screenshot transport: 1473 × 1047. The comparison copy is normalized to the source dimensions; it establishes composition, not pixel equivalence.
- Current evidence directory: `../local/audit/typography-composition-2026-10-17/`.
- `source-and-implementation.png` places the source on the left and implementation on the right. Both were inspected together.
- `home-desktop.png`, `home-en-mobile.png`, `home-zh-tw-mobile.png`, `home-zh-cn-mobile.png`, `article-zh-tw-mobile.png` and `contact-desktop.png` record the rendered result. Mobile viewport: 390 × 844.
- [Geist Typography](https://vercel.com/geist/typography) supplies the complete metrics. Official reference captures remain in the preceding `geist-type-presets-2026-10-17` audit directory.

## Findings and Revisions

The preceding implementation corrected preset metrics but retained too much of the old composition. The user's correction reopened visual acceptance.

1. **P2: Typography changes were concentrated in tokens.** Applied Heading 72 to the Home display, Heading 64 to page titles, Heading 48 to major sections, Heading 32 to editorial/form titles and Copy 24 to the Home/article introduction. Mobile switches to complete smaller presets. The revised capture shows a stronger display and introduction hierarchy.
2. **P2: The Home About composition did not follow the selected direction.** Replaced the two-column, bottom-aligned introduction with a heading followed by body copy in one editorial column. Added geometric regression assertions for the reading order and shared left edge. The revised full-view comparison shows the heading above its paragraph.
3. **P2: KPI values sat too low in oversized cells.** Grouped labels, values and notes with explicit gaps; reduced desktop minimum cell height from 240px to 200px. Values use Heading 40 on desktop, 32 on tablet and 24 on mobile. They remain below page/section headings. The revised screenshot shows compact square financial surfaces without the large internal void.
4. **P2: Reading measure did not support the editorial direction.** Reduced the shared content maximum to 1312px and article body to 65ch. Article language notice and disclaimer share the body measure. Mobile article capture confirms readable wrapping and an unobstructed language notice.

The revised source/implementation comparison has no remaining actionable P0/P1/P2 differences within the authorized scope. The concept's approximate custom font metrics, larger financial figures, invented About paragraph and simplified navigation are not copied: the user requires complete Geist presets, verified content, existing brand colors and functional contracts. The implementation is a responsive adaptation, not a pixel-identical reproduction.

## Verification

- Chromium: 27 unique focused cases passed (29 executions, including two repeated Home composition cases after adding geometric assertions).
- Production WebKit: 10 affected mobile cases passed.
- Coverage includes all public-page type roles in three languages, complete preset membership, 320/390px and intermediate widths, 200% text, subordinate financial values, memo reflow, Home performance reflow, CTA navigation, drawer dismissal and mobile table labels.
- Two class-composition unit tests passed. TypeScript, affected ESLint, Prettier, whitespace checks and the production build passed.
- In-app visual inspection covered desktop Home, all three mobile Home variants, a Chinese article and desktop Contact. Browser warning/error log was empty when checked.
- No full suite, CI run, deployment, physical iPhone test or live provider mutation was performed. No claim of full WCAG conformance or field performance improvement is made.

## Completion

- [x] Apply the selected direction to components and composition.
- [x] Keep complete Geist size/line-height/weight/tracking combinations.
- [x] Preserve Jost, colors, content, data and service contracts.
- [x] Update the Design System and related regression tests.
- [x] Compare rendered implementation and source in one image.
- [x] Keep a local preview available without committing or deploying.

final result: passed

## Logo Preservation Correction

The user requires the Logo style to remain unchanged. Restored its original responsive size, 1.2 line height, 700 weight and -0.05em tracking in the Header, drawer and Footer. This explicit brand exception supersedes the earlier wordmark preset mapping. Other typography and composition changes remain.

Correction verification: 12 focused Chromium cases passed across all three languages, desktop, 801px and mobile widths, including Header/Footer metrics and the open drawer. A development preview capture, `../local/audit/typography-composition-2026-10-17/home-logo-restored.png`, confirms the restored wordmark. Earlier production screenshots precede this Logo correction. Affected ESLint, formatting and whitespace checks passed; no new production build was needed for this token-only correction.

## SVG Logo Update

The user subsequently requested SVG images directly. `BrandLogo` now renders transparent derivatives of the existing outlined master, with a white-glyph inverse for the black Footer. The master, glyph path geometry and blue period are preserved. Responsive image width and intrinsic aspect ratio replace the superseded live-text metrics.

SVG verification: 20 focused browser cases passed across Chromium (13) and WebKit (7), including six dedicated SVG cases covering three languages, 320/390/801/1440px, proportional sizing, loaded assets, accessible names and home navigation. The Footer grid now constrains its brand column at 200% text instead of letting the SVG intrinsic width expand it. Asset validation confirms both derivatives preserve all 27 original paths. TypeScript, affected ESLint, formatting and whitespace checks passed. Current development captures `svg-logo-header.png`, `svg-logo-footer.png` and `svg-logo-mobile-menu.png` in the evidence directory were visually inspected. They supersede earlier text-Logo screenshots; no production build or deployment was performed for this correction.

## Hero Summary and Footer Alignment Update

The user requested a black-background, white-letter Footer Logo, inset financial summaries within the Hero, and desktop/mobile alignment and spacing checks. This direction supersedes the earlier full-width KPI composition.

1. Captured the existing desktop Home before changing the composition. Evidence: `../local/audit/hero-alignment-2026-10-17/before-home-desktop.png`.
2. Added a black background path to the inverse SVG while preserving its white glyph paths and blue period. The Footer Logo uses a 32px alignment box matching adjacent heading line boxes.
3. Moved Home, Portfolio and Performance summaries inside their Hero containers. Title and summary edges now align; each Hero has 48px outer padding and a 48px introduction-to-summary gap. Removed Portfolio's fixed total grid height.
4. Reduced the following About, Holdings and Performance-section top padding to 48px, avoiding stacked section-sized gaps. At 320px and 200% root text, Portfolio reduces cell inline padding to 4px to preserve complete single-line currency amounts.
5. Compared `before-after-desktop.png` as one combined visual input. Inspected desktop Home, Portfolio, Performance, Footer, English mobile Home and Traditional Chinese mobile summary/Footer captures. Visual evidence confirms inset cards, retained brand colors, proportional Logo artwork and balanced section transitions. Screenshot transport dimensions can differ from CSS viewport dimensions; comparisons are compositional, not pixel-equivalence claims.

Current evidence is in `../local/audit/hero-alignment-2026-10-17/`: `final-home-desktop.png`, `portfolio-desktop.png`, `performance-desktop.png`, `footer-desktop.png`, `home-mobile.png`, `final-home-zh-tw-mobile.png` and `footer-mobile.png`. The last spacing revision changes the following section padding; the final Chinese mobile capture shows that revision. Earlier desktop Hero captures still show the unchanged Hero layout.

Validation: 23 unique affected cases passed across Chromium (15) and WebKit (8), covering three-language summaries, 320/390/800/801/900/1440px where applicable, 200% root text, complete financial values, inset card geometry and shared Hero padding. Initial failures identified an obsolete desktop padding expectation and the narrow enlarged Portfolio currency wrap; both were corrected and rerun. The final nine summary cases additionally verify following-section padding. TypeScript, affected ESLint, Prettier and whitespace checks passed. No full suite, production build, CI run, live-provider mutation or deployment was performed.

final result: passed

## Portfolio Summary Simplification

Removed the Net Cost Basis summary cell and its unused three-language labels. The remaining market value, total return and holdings cells form one desktop row and stack below 48rem of Hero-summary width. Cost-basis data, calculations and table columns remain. Current Holdings now uses the white primary surface. Twelve focused Chromium/WebKit cases passed, covering three-language semantics, white background, 320/390/801/900/1440px reflow, complete currency values and 200% root text. TypeScript, affected ESLint, formatting and whitespace checks passed. Desktop and mobile captures `portfolio-three-cells-desktop.png` and `portfolio-three-cells-mobile.png` in `../local/audit/hero-alignment-2026-10-17/` were visually inspected. No commit or deployment was made.

## General Page Transition Spacing

General Hero bottom padding and the first content section top padding now each equal 48px, giving a measured 96px introduction-to-content transition on About, Memos, Contact, Support, Disclaimer and Preferences. Existing Hero top padding remains 96px desktop and 72px mobile. Home About now has symmetric 48px padding. Subsequent content sections and article chapter spacing are unchanged.

An initial 900px/200% English About check exposed overflowing two-column content. About content and closing layouts now stack below 56rem of page-container width, preserving complete typography presets. Thirteen unique focused Chromium/WebKit cases passed after repair: nine three-language transition/reflow cases, three existing Hero-padding cases and the Footer/legal-inset case. Coverage includes 320/390/900/1440px and 200% root text. TypeScript, affected ESLint, Prettier and whitespace checks passed. No full suite, production build or deployment was performed.

Visual evidence: `../local/audit/section-spacing-2026-10-17/after-contact-desktop.png`, `after-contact-mobile.png` and `after-home-about-mobile.png`. `contact-mobile-comparison.png` was inspected with the old capture on the left and new capture on the right at the same viewport and scroll step; it confirms the narrower transition while retaining typography, brand colors and forms. No remaining actionable layout issue was found within this change.

final result: passed

## Symmetric Hero and Footer Subscription Correction

All shared page heroes, the Disclaimer Hero and the memo article header now use 48px top and bottom padding on desktop and mobile. This supersedes the asymmetric 96px/72px top padding recorded above. The following general content section retains 48px top padding, preserving the 96px introduction-to-content transition.

The Footer Subscribe button uses black text through a scoped inverse-action token override, including hover and keyboard focus. Other inverse buttons retain their existing color contract.

Validation: 12 focused Chromium/WebKit cases passed across three languages, desktop/mobile and the existing 200% root-text reflow checks. TypeScript, affected ESLint, Prettier and whitespace checks passed. Inspected screenshots: `../local/audit/section-spacing-2026-10-17/hero-symmetric-desktop.png`, `hero-symmetric-mobile.png` and `footer-black-subscribe.png`. No full suite, production build, commit or deployment was performed.

final result: passed

## First Content Section Symmetry

About's first section, Performance charts, the memo index, Contact Subscribe, Support, Disclaimer and Preferences now use 48px top and bottom padding. This supersedes the larger bottom padding in earlier captures. Later About sections, Contact's message form, Methodology and Footer retain their existing spacing. Form status-message reserve space remains inside each form.

Validation: a regression check first reproduced About's 96px bottom padding. After correction, all nine focused Chromium/WebKit cases passed across three languages, 320/390/900/1440px and the existing 200% text checks. Assertions also preserve subsequent section spacing and the 26.4px form status reserve. TypeScript, affected ESLint, Prettier and whitespace checks passed. Three-language desktop/mobile Subscribe captures were inspected in `../local/audit/first-section-balanced-2026-10-17/`. No full suite or deployment was performed.

final result: passed
