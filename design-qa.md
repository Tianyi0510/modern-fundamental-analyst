# Design QA — Home And Footer Interactions

## Evidence

- Local route: `http://127.0.0.1:3000/`
- Reference: the site's existing button and arrow interaction system
- State checked: English desktop home page, portfolio card, and footer

## Interaction Comparison

The Full Portfolio link keeps its existing placement and typography. Its arrow is now a dedicated `.arrow-icon` element with the same 220ms easing used by the site's other arrow controls, moving four pixels to the right on hover.

The footer wordmark keeps its white text and blue punctuation in both resting and hover states. Its transition is explicitly disabled, while the remaining footer navigation links retain their existing hover feedback.

## Required Fidelity Surfaces

- Typography: unchanged; the existing Button and wordmark tokens remain in use.
- Layout: unchanged except for flex alignment inside the Full Portfolio link so the arrow remains aligned at the trailing edge.
- Color: footer wordmark remains white with the existing blue punctuation.
- Motion: portfolio arrow uses the existing interaction duration and easing; footer wordmark has no motion or color transition.
- Accessibility: the decorative arrow is hidden from assistive technology and the link's accessible name remains “Full portfolio”.
- Responsiveness: the interaction uses the existing card layout and does not introduce breakpoint-specific dimensions.

## Verification

- Live DOM confirmed the Full Portfolio arrow is rendered as `→` with a `transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)` transition.
- Live DOM confirmed the footer wordmark remains `rgb(255, 255, 255)` with `transition: none`.
- TypeScript, ESLint, and all 21 repository tests passed.
- The production build passed with webpack. The default Turbopack build was blocked by the sandbox's port-binding restriction, not by application code.

## Findings

- No actionable P0, P1, or P2 differences remain.

final result: passed
