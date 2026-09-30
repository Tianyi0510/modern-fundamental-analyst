# Style Guide

This guide is the shared entry point for code, interface, interaction, content, and documentation quality. It uses common design principles to guide tradeoffs; domain guides retain the detailed procedures for service setup, deployment, and troubleshooting. It draws on the Airbnb and Google engineering style guides' emphasis on readability, consistency, and maintainability, and applies those principles to the website and its documentation.

The central question is: **Does this make the work easier to understand, use, change, and verify? Uniform appearance alone is not the goal.**

## Purpose and design principles

| Principle                             | Practical meaning                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Design for readers and users          | Make code understandable, documentation easy to find, and interfaces easy to use.                |
| Keep the same meaning consistent      | Use consistent names for the same responsibilities and consistent feedback for the same actions. |
| Make intent explicit                  | Clearly show types, responsibilities, states, constraints, and outcomes.                         |
| Choose a sufficiently simple solution | Avoid unnecessary abstraction and configuration while retaining meaningful differences.          |
| Lower the cost of change              | Maintain shared information in one place and make the impact of changes traceable.               |
| Give rules a reason                   | Rules should solve real problems; exceptions should be explainable and verifiable.               |
| Automate mechanical work              | Let tools handle formatting and static checks; use human judgment for intent and experience.     |

When principles conflict, protect correctness, accessibility, and user understanding before formal consistency or code brevity.

## Code and components

The goal is for maintainers to understand behavior from names, types, and structure.

- Use names that express domain meaning and responsibility rather than vague abbreviations. Give functions and components clear responsibility boundaries.
- Use types to express valid states, and still validate external data at boundaries. Make side effects, errors, and asynchronous outcomes easy to trace.
- Share implementations when responsibilities and behavior match. Preserve justified language, form, and service variants.
- Use comments to explain reasons, constraints, and tradeoffs rather than restating the code. Let Next.js and React rules enforce framework requirements.

See [Technical Architecture](TECHNICAL_ARCHITECTURE.md#application-boundaries) for application boundaries and deployment constraints. Service procedures are in the [Resend Integration](RESEND_INTEGRATION.md), [Stripe Integration](STRIPE_INTEGRATION.md), and [Upstash Redis Integration](UPSTASH_REDIS_INTEGRATION.md) guides.

## CSS, layout, and visual language

The goal is to make style ownership clear and use visual design to express information structure. The site uses a financial editorial style: clear type hierarchy, generous section spacing, square data surfaces, pill-shaped primary controls, and restrained motion.

### Style ownership

| Primary location                                                                                                               | Responsibility                                                 |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| [`src/app/reset.css`](../src/app/reset.css)                                                                                    | Browser normalization and the box model.                       |
| [`src/app/styles/base.css`](../src/app/styles/base.css)                                                                        | Palette primitives, type, spacing, control, and motion tokens. |
| [`src/app/styles/colors.css`](../src/app/styles/colors.css)                                                                    | Semantic color aliases.                                        |
| [`src/app/styles/chrome.css`](../src/app/styles/chrome.css), [`pages.css`](../src/app/styles/pages.css)                        | Shared chrome, controls, and page layouts.                     |
| [`typography.css`](../src/app/styles/typography.css), [`component-typography.css`](../src/app/styles/component-typography.css) | Shared text roles.                                             |
| [`responsive.css`](../src/app/styles/responsive.css)                                                                           | Responsive layout, touch, and motion preferences.              |
| [`themes.css`](../src/app/styles/themes.css)                                                                                   | Component surfaces and interaction color overrides.            |
| `src/components/*.module.css`                                                                                                  | Component-local layout and states.                             |

[`src/app/globals.css`](../src/app/globals.css) defines the import order; semantic colors and theme rules come later. Add new color aliases to `colors.css` and component selectors to the file that owns them. Theme rules may set backgrounds, borders, and interaction colors; other files own typography and page geometry.

Keep box sizing, dimensions, spacing, and overflow predictable. Select shared tokens by purpose; CSS is the source of truth for values and breakpoints. Choose type sizes by semantic role, such as page title, section title, body, control, or data, rather than by what happens to fit one screenshot. Use `rem` for text and bounded `clamp()` values for display roles. Avoid arbitrary component font sizes or changing a text role solely at a breakpoint. Heading levels express document structure; financial numbers use tabular figures for comparison.

A KPI's `data-tone` explicitly determines its colors, even if cards are reordered:

| Tone        | Surface     | Text        |
| ----------- | ----------- | ----------- |
| `plain`     | White       | Black       |
| `highlight` | Bright Blue | Deep Blue   |
| `brand`     | Deep Blue   | Bright Blue |
| `paper`     | White       | Deep Blue   |

Preserve established text colors and opacity, including hover, active, disabled, and inverse states, unless the task explicitly requests a color change. Pair positive and negative colors with numbers or symbols that convey the same meaning. Existing contrast concerns remain open: Medium Blue on white is about 3.39:1, Price Up 3.06:1, and Price Down 4.00:1. Do not claim full text-contrast compliance until the text colors have been addressed.

Use Jost for Latin text and numbers. Use Noto Sans TC and Noto Sans SC for Traditional and Simplified Chinese glyphs, respectively. The brand vector masters are [`public/images/icon.svg`](../public/images/icon.svg) and [`logo.svg`](../public/images/logo.svg); PNG copies are available in the same directory. Preserve the square icon, single-line wordmark, and colored period; generate site icons and social images from the masters. Keep the file-based icon and Apple icon in [`src/app/`](../src/app) aligned with the icon master; sharing-image metadata references [`public/images/og-logo.png`](../public/images/og-logo.png).

Responsive layouts keep information and actions in priority order. Check all three languages, root font sizes up to 200%, long translations, and content changes for wrapping and container width. The footer wordmark may wrap. Contact and preference forms use square fields, while the compact footer form uses pill-shaped fields; these are intentional variants. Local chart geometry and optical adjustments may use local values instead of forced spacing-token substitutions.

## Interaction, motion, and accessibility

The goal is clear, reliable feedback for every action. Accessibility applies during layout, content, and component design, not only at final review.

- Make controls recognizable and keyboard focus clearly visible. Touch hover resets must preserve active and `:focus-visible` feedback. Shared CTA hover recovery is maintained in the final theme layer; reset only idle hover, including transforms, without duplicating those rules in responsive styles.
- Give loading, success, failure, disabled, and retry states clear meanings. Forms should prevent duplicate submissions, announce outcomes with text and live regions, and clear stale outcomes when the user edits again.
- Use motion to explain state and spatial changes. Expanding and closing should support repeated input, interruption, and reversal while keeping visuals, focus, interactivity, and scroll state synchronized.
- Preserve full function and necessary feedback under `prefers-reduced-motion`. Focus outlines should remain visible in standard and forced-colors modes; disabled states should not move.

Choose focus tokens according to light or inverse form surfaces. Preferences retain their own disabled opacity. Reserve space for status messages and allow long errors to wrap. After a programmatic field reset, keep the success message visible until the user edits again.

Current interaction conventions: the mobile menu slides left to open and right to close, and navigation fades early on close. Mobile language choices use a vertically expanding disclosure, initially collapsed and labelled with the current language. Its options contain only the other languages, avoiding a duplicate current-language control. Menu navigation, the language disclosure label, and language choices share a fast color transition and Medium Blue feedback for hover, keyboard focus, pressed, current-page, and expanded states. They retain stable geometry without separators or background fills. Keyboard focus adds an underline to navigation links, the language disclosure label, and language choices so focus remains distinguishable from current-page and expanded colors. The close icon returns from X to Menu. Background isolation and scroll locking remain until dismissal finishes, then focus returns. The open menu's close button retains a blue fill and black border; keyboard focus keeps its outer ring visible under `:focus-visible`. Touch presses show a separate blue ring and slight scale reduction; release fades the ring, including short taps and pointer cancellation. This feedback transfers from the trigger to the close control when opening. Reduced-motion mode shows the held ring without scale or release animation. The desktop language menu supports Enter, Space, arrow keys, Escape, and Tab; the mobile disclosure supports Enter, Space, and Tab. Reduced-motion mode may complete state changes immediately.

Memos and monthly data retain native `details`/`summary` semantics. Height animation can reverse mid-flight; a viewport resize settles the intended height, and closing returns focus from the content to its summary. Without JavaScript, the native disclosure remains usable.

## Content and localization

The goal is to keep information equivalent while respecting language differences.

- Use consistent terminology for the same concepts. State the outcome first, then give the next step when needed.
- Present dates, currency, percentages, and data timestamps clearly and consistently. Portfolio and performance data are timestamped snapshots and must not imply live quotes; see [Portfolio Data](PORTFOLIO_DATA.md) for definitions.
- Preserve meaning, tone, and action intent in translation rather than matching words or line counts literally. Language differences may justify layout and content variants.

## Markdown documentation

Write all project documentation prose in English. Keep interface copy with the page or shared component that owns it. Keep independently maintained memo articles and portfolio snapshots in `src/data/`. When an operation requires an exact non-English runtime or provider value, show it as a literal and link to its authoritative definition in code; do not translate that value.

Each document should solve a clear problem and have a primary place to maintain its information:

| Document                                                                                       | Primary responsibility                                                             |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [`README.md`](../README.md)                                                                    | Project introduction, quick start, verification commands, and document navigation. |
| [`AGENTS.md`](../AGENTS.md)                                                                    | Agent constraints, task guidance, and completion criteria.                         |
| `STYLE_GUIDE.md` (this file)                                                                   | The single entry point for shared quality principles and cross-domain conventions. |
| [`TECHNICAL_ARCHITECTURE.md`](TECHNICAL_ARCHITECTURE.md)                                       | Application boundaries, domain ownership, deployment gate, and review evidence.    |
| [`PORTFOLIO_DATA.md`](PORTFOLIO_DATA.md)                                                       | Portfolio snapshot, calculations, sources, and update procedure.                   |
| [`UPSTASH_REDIS_INTEGRATION.md`](UPSTASH_REDIS_INTEGRATION.md)                                 | Redis access, stored data, subscriber coordination, and reconciliation.            |
| Integration guides such as [Resend](RESEND_INTEGRATION.md) and [Stripe](STRIPE_INTEGRATION.md) | Service setup, procedures, troubleshooting, and verification.                      |

Answer the reader's most urgent question first. Distinguish current facts, required rules, and future proposals. Give each item of information one primary maintenance location and link to it elsewhere. Commands and examples must be usable, with placeholders clearly marked. Date and source volatile external state. Organize each document by purpose rather than forcing a common template.

## Expressing rules

For important rules that are easy to misunderstand, explain **purpose → recommended practice → necessary example → reasonable exception → verification**. A simple rule needs only one clear sentence.

For example, shared components reduce behavior drift: share when responsibilities match, retain variants for different language or form behavior, and verify each variant's actual experience.

## Verification and maintenance

| Layer                                            | Responsibility and configuration source                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Prettier                                         | Consistent formatting; see the `prettier` field in [`package.json`](../package.json).             |
| ESLint, typescript-eslint, and framework plugins | Code, type usage, and framework rules; see [`eslint.config.mjs`](../eslint.config.mjs).           |
| Stylelint                                        | CSS static checks; see [`stylelint.config.mjs`](../stylelint.config.mjs).                         |
| TypeScript                                       | Type checking; see [`tsconfig.json`](../tsconfig.json).                                           |
| Unit tests                                       | Logic, state, and failure handling.                                                               |
| Playwright                                       | Layout, interaction, and browser behavior; see [`playwright.config.ts`](../playwright.config.ts). |
| Human review and device checks                   | Understandability, visual quality, and real-device experience.                                    |

See [README verification](../README.md#verification) and [`package.json`](../package.json) for commands; configuration files and [`ci.yml`](../.github/workflows/ci.yml) define versions and CI behavior. Choose checks according to change risk. Shared UI changes should cover three languages, narrow layouts, enlarged text, keyboard, touch, reduced motion, and forced colors when relevant. Browser tests should verify rendered behavior rather than repeat CSS source-code assertions.

Add a rule only to address a real problem. When revising a rule, check the related tools, documentation, and tests for conflicting standards.
