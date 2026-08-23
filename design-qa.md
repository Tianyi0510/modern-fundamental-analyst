# Design QA — Full Portfolio Motion

## Evidence

- Local route: `http://127.0.0.1:3000/`
- Reference: the Home page's existing arrow-button motion system
- State: Full Portfolio link in the allocation card

## Interaction Comparison

The link retains its existing typography, spacing, accessible name, and card dimensions. On hover, the label moves two pixels to the right while the arrow moves four pixels to the right. Both elements use the existing 220ms cubic-bezier timing, giving the arrow slightly stronger directional emphasis without separating it visually from the label.

## Required Fidelity Surfaces

- Typography and colors: unchanged.
- Layout: unchanged; transforms do not affect document flow.
- Motion: label and arrow share one duration and easing curve.
- Accessibility: the label remains the link's accessible text; the decorative arrow remains hidden from assistive technology.
- Localization: the shared component applies the interaction to English, Traditional Chinese, and Simplified Chinese.

## Verification

- Production HTML contains the dedicated `link-label` and `arrow-icon` elements.
- Repository tests explicitly guard the 2px label and 4px arrow hover transforms.
- TypeScript, ESLint, all 21 tests, and the webpack production build passed.
- The in-app browser connection was unavailable during the final interaction check; HTML output and compiled CSS were verified directly instead.

## Findings

- No actionable P0, P1, or P2 differences remain.

final result: passed
