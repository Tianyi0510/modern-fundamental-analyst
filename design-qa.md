# Design QA — Investment Memos Hero Metadata

## Evidence

- Source visual truth: `/Users/davidli/.codex/visualizations/2026/08/14/01a00138-4bbc-73e2-bcba-170108a73a34/memos-subtitle/portfolio-reference.png`
- Rendered implementation: `/Users/davidli/.codex/visualizations/2026/08/14/01a00138-4bbc-73e2-bcba-170108a73a34/memos-subtitle/memos-intro.png`
- Local route: `http://127.0.0.1:3000/memos`
- Viewport: 1280 × 720 CSS px
- Source and implementation pixels: 1280 × 720 at 1× density; no normalization required
- State: desktop, English, page hero and introduction visible

## Full-View Comparison

The Portfolio hero was used as the existing-product reference because the request was to keep the Investment Memos page consistent with other inner pages. Both use the shared `page-hero` and `page-intro` structures: the subtitle is left aligned at Title size and the date annotation is right aligned at Caption size. The Investment Memos title is longer and naturally extends the hero below the first viewport, but the spacing and hierarchy remain consistent.

## Focused Region Comparison

The scrolled Investment Memos capture isolates the subtitle and date row at a readable scale. It confirms that the subtitle wraps within the same 630px measure as Portfolio and that “Last updated on 10 October 2025” aligns to the lower-right edge of the shared grid.

## Required Fidelity Surfaces

- Fonts and typography: existing Inter/Noto Sans locale typography and shared Subtitle/Caption tokens are used.
- Spacing and layout rhythm: existing `page-intro` grid, 72px top margin, mobile stacking breakpoint, and alignment are reused without page-specific CSS.
- Colors and visual tokens: black body copy and muted black date annotation match the other inner-page heroes.
- Image quality and assets: no image or icon assets are required for this text-only change.
- Copy and content: the requested English subtitle is present; equivalent Traditional Chinese and Simplified Chinese translations are included.
- Responsiveness: the existing 800px breakpoint stacks subtitle and date with a 28px gap.
- Accessibility: the content remains semantic paragraph and supporting `small` text; the date uses the existing `date-text` convention.

## Findings

- No actionable P0, P1, or P2 differences remain.
- No focused visual fixes were required after the first comparison.

## Comparison History

1. Initial comparison: no P0/P1/P2 findings. The implementation directly reuses the established inner-page component classes and responsive rules.

## Implementation Checklist

- [x] Add English subtitle
- [x] Add Traditional Chinese and Simplified Chinese equivalents
- [x] Derive the displayed update date from the newest memo publication date
- [x] Reuse shared inner-page layout and typography
- [x] Verify typecheck, lint, tests, production build, and browser rendering

final result: passed
