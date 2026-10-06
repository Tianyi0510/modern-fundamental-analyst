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

### Project standards

These conventions adapt [Bulletproof React's Project Standards](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-standards.md) to this Next.js application.

- Use kebab-case for application files and folders; exported React components use PascalCase. Preserve Next.js routing and metadata conventions, including `(en)`, `[slug]`, `[...unmatched]`, `_components`, and `page.tsx`. Keep established tool configuration names and document titles.
- Use the single `@/*` alias from [`tsconfig.json`](../tsconfig.json) for imports across source directories. Relative imports are appropriate for adjacent files and root tooling. Node tests use the same alias through the explicit [loader](../scripts/register-server.mjs), retaining file extensions for `.mjs` helpers. Do not introduce barrel exports solely to shorten paths.
- Use UTF-8, LF line endings, two-space indentation, and a final newline. [EditorConfig](../.editorconfig) applies editor defaults; [Git attributes](../.gitattributes) normalize text line endings without treating binary assets as text. Prettier remains the formatting authority; Markdown trailing spaces may express intentional line breaks.
- Keep ESLint's flat configuration and type-aware rules. Lint commands reject warnings, and unused ESLint disable directives are errors. Scope necessary suppressions to the smallest affected code and explain their reason; remove them when the underlying exception disappears.
- Validate external data at runtime even when its TypeScript type is declared. During refactoring, update types and callers together, then run affected checks. Tests stay beside their owning code; shared test utilities live in `scripts/` and are never imported by application entry points.
- CI is the required verification gate for releases. Husky provides local pre-commit checks of staged files; see [README verification](../README.md#verification) for their scope and recovery steps. Hooks cannot replace CI and must not run complete browser suites on every commit. Choose focused local checks using [AGENTS](../AGENTS.md#verification-and-review).

## CSS, layout, and visual language

The goal is to make style ownership clear and use visual design to express information structure. The site uses a financial editorial style: clear type hierarchy, generous section spacing, square data surfaces, pill-shaped primary controls, and restrained motion.

### Style ownership

| Primary location                             | Responsibility                                                                                                                                        |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`tokens.css`](../src/app/styles/tokens.css) | Brand primitives, semantic colors, typography, spacing, control and motion values; Tailwind theme aliases reference these values.                     |
| [`base.css`](../src/app/styles/base.css)     | The single browser normalization, document fonts, baseline focus and motion preferences. No page or component selectors.                              |
| [`globals.css`](../src/app/globals.css)      | Tailwind layers, theme/utilities imports, tokens, base and shared responsive variants.                                                                |
| Component JSX and adjacent `*.styles.ts`     | Statically identifiable Tailwind classes for layout, responsive geometry, surfaces and ordinary states. Private style maps belong to their component. |
| Adjacent `*.module.css`                      | Complex owned motion, chart structure and special controls. Never override another component's internals.                                             |
| Inline styles                                | Values derived from data or measurements, such as chart coordinates; standalone global-error and email rendering have independent constraints.        |

Tailwind utilities are processed by [`postcss.config.mjs`](../postcss.config.mjs). The custom normalization in `base.css` remains the only reset: Tailwind Preflight is deliberately not imported, preserving established heading, control and media defaults. Do not stack another reset on it. Use complete literal classes rather than interpolating utility fragments. Keep the same property under one styling mechanism; cancel and settle measured animations before releasing their state.

Shared appearance is maintained through components, with finite variants:

| Component                                             | Contract                                                                                                                                                                                                                               |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Container`                                           | Shared maximum width and responsive gutters; backgrounds belong to its outer section.                                                                                                                                                  |
| `PageHero`                                            | Standard, portfolio, performance or support geometry; localized content remains with the page.                                                                                                                                         |
| `Button` / `ButtonLink`                               | Primary, contrast or inverse surface; regular or small size. Native button and link semantics remain distinct. Disabled feedback uses standard, muted or muted-busy variants, preserving preferences opacity without parent overrides. |
| `FormField`, `TextInput`, `TextArea`, `SelectControl` | Label association, visible or hidden label, standard square or inverse compact fields. Business validation and submission stay with the feature.                                                                                       |
| `StatusMessage`                                       | Standard or inverse typography, reserved space and polite live feedback.                                                                                                                                                               |
| `PortfolioMetric`                                     | Plain, highlight, brand or paper financial surfaces, shared typography and note opacity.                                                                                                                                               |

Use Tailwind for normal layout and states, CSS Modules for owned complex structures and motion. Both reference the same tokens. This split follows [Next.js CSS recommendations](https://nextjs.org/docs/app/getting-started/css#recommendations), [Tailwind theme variables](https://tailwindcss.com/docs/theme) and the documented [Preflight effects](https://tailwindcss.com/docs/preflight).

Keep box sizing, dimensions, spacing, and overflow predictable. Select shared tokens by purpose; CSS is the source of truth for values and breakpoints. Choose type sizes by semantic role, such as page title, section title, body, control, or data, rather than by what happens to fit one screenshot. Use `rem` for text and bounded `clamp()` values for display roles. Avoid arbitrary component font sizes or changing a text role solely at a breakpoint. Heading levels express document structure independently of visual size. Memo cards use H2 on the memo index and H3 beneath the home section heading, including placeholders. Every disclaimer section has an H2 in each locale, even when its introductory lead is absent; financial numbers use tabular figures for comparison.

A KPI's `tone` prop explicitly determines its colors, even if cards are reordered:

| Tone        | Surface     | Text        |
| ----------- | ----------- | ----------- |
| `plain`     | White       | Black       |
| `highlight` | Bright Blue | Deep Blue   |
| `brand`     | Deep Blue   | Bright Blue |
| `paper`     | White       | Deep Blue   |

Preserve established text colors and opacity, including hover, active, disabled, and inverse states, unless the task explicitly requests a color change. Pair positive and negative colors with numbers or symbols that convey the same meaning. Portfolio return values use dedicated `--text-return-positive` and `--text-return-negative` tokens on light surfaces, including the table's pale blue hover background. The return text tokens use the positive `#037B66` and negative `#D60A22` text colors observed in [Yahoo Finance's quote table](https://finance.yahoo.com/markets/stocks/most-active/) on October 5, 2026, as selected for this site. Both colors meet the 4.5:1 contrast threshold for normal text on white and the table's pale blue hover background. Keep `--price-up` and `--price-down` separate for non-text uses. Medium Blue on white remains about 3.39:1; do not claim full text-contrast compliance for the site.

Use Jost for Latin text and numbers. Use Noto Sans TC and Noto Sans SC for Traditional and Simplified Chinese glyphs, respectively. The brand vector masters are [`public/icon.svg`](../public/icon.svg) and [`logo.svg`](../public/logo.svg); PNG copies are available in the same directory. Preserve the square icon, single-line wordmark, and colored period; generate site icons and social images from the masters. Keep the file-based icon and Apple icon in [`src/app/`](../src/app) aligned with the icon master; sharing-image metadata references [`public/og-logo.png`](../public/og-logo.png). Previous `/images/` asset URLs permanently redirect to their root-level equivalents.

Responsive layouts keep information and actions in priority order. Check all three languages, root font sizes up to 200%, long translations, and content changes for wrapping and container width. The footer wordmark may wrap. Contact and preference forms use square fields, while the compact footer form uses pill-shaped fields; these are intentional variants. Local chart geometry and optical adjustments may use local values instead of forced spacing-token substitutions.

### Email presentation

Email templates share the brand through [`email-layout.tsx`](../src/components/email-layout.tsx), rather than importing website CSS. Use React Email layout components, email-compatible inline styles and pixel-based dimensions. Preserve the existing email font stack (`Inter, Arial, Helvetica, sans-serif`), text colors and colored brand period; the website's Jost and responsive CSS rules do not apply automatically to inboxes.

Keep one primary heading, a language attribute matching the content, descriptive action text and a usable plain-text alternative. Pass user content as React text, not raw HTML. Keep production copy with its owning feature and preview-only examples in the owning feature’s `previews/` directory. Review all three languages and narrow layouts when changing the shared layout. See [Resend templates](RESEND_INTEGRATION.md#email-templates-and-local-preview) for source ownership, preview commands and delivery verification.

### shadcn/ui components

[shadcn/ui](https://ui.shadcn.com/docs) supplies component source that this project owns and customizes. `components.json` targets Tailwind v4, the existing `@/*` alias and `src/components/ui/`; `src/lib/utils.ts` provides `cn` for conditional classes and utility conflict resolution. Button variants use `class-variance-authority`. Import primitives directly from their source files; `ButtonLink` shares Button appearance while retaining link semantics.

Button uses the site's `primary`, `contrast`, `inverse`, and `quiet` variants, `regular`, `small`, and `text` sizes, and explicit disabled feedback. The quiet text action preserves the Preferences unsubscribe treatment without duplicating its appearance in the feature. Input retains `standard` and `inverse` treatments; Textarea and the native select share the field appearance. Disabled fields use a dashed border and a not-allowed cursor while preserving their text colors. These native elements retain refs, labels, validation and form submission without a client boundary. The separate `ButtonLink` contract deliberately replaces upstream Button's optional `asChild` composition.

Before adding a component, inspect its official source and dependencies with `npx shadcn@latest view <component>`. Add only the needed component with `npx shadcn@latest add <component>`, then review the entire generated diff. Adapt new semantic aliases in `tokens.css`, including any focus, disabled and motion states; the existing `accent` alias means medium blue. Do not copy a default palette, add a second reset, replace Jost, or overwrite customized primitives blindly. Keep simple primitives server-compatible; add a client boundary only where an interactive primitive requires one. Install animation or primitive dependencies only when the selected component uses them.

Desktop language selection uses the Radix-based `DropdownMenu`; items compose genuine links with `hrefLang`, current-language hints and validated recovery parameters. Radix owns item navigation and dismissal. The header only adapts upward-key entry and Tab exit to its neighboring controls. Mobile navigation uses `Sheet` (Radix Dialog) for accessible naming, focus containment, background accessibility isolation and scroll locking. Keep the Sheet open through the closing phase; release it only when the owned animation finishes or is explicitly completed. Do not add another focus trap, body-position lock or background `inert` controller.

`FormField` composes `Field` and an explicit `FieldLabel` association; controls keep their native validation, refs and submission semantics. `NativeSelect` retains the platform picker. `Alert` owns form and payment outcome appearance and live-region behavior; do not create a second status-message implementation. `ServiceLoading` combines localized busy feedback with decorative, static `Skeleton` placeholders that are hidden from assistive technology.

Verify affected rendered states, native form behavior and navigation after integration. Upstream defaults are examples, not a second visual standard for this site.

## Interaction, motion, and accessibility

The goal is clear, reliable feedback for every action. Accessibility applies during layout, content, and component design, not only at final review.

- Make controls recognizable and keyboard focus clearly visible. Touch hover resets must preserve active and `:focus-visible` feedback. Shared CTA hover recovery belongs to the button component; reset only idle hover, including transforms, without overriding active or keyboard focus.
- Shared Button, ButtonLink and round CTAs opt into `TouchPressFeedback` with `data-touch-feedback`. One delegated passive pointer listener supplies `data-touch-pressed` while a primary touch is held; release, cancellation, movement, scrolling, page hiding and cleanup clear it. Native click, navigation, focus and form behavior remain unchanged, and the controls remain server-compatible. CSS uses the existing press tokens and reduced-motion override. Menu feedback retains its separate ownership because it transfers between trigger and close controls. Verify trusted touch holds in Chromium, tap/release in both engines, and cancellation events separately; mouse presses do not establish touch behavior.
- Give loading, success, failure, disabled, and retry states clear meanings. Forms should prevent duplicate submissions, announce outcomes with text and live regions, and clear stale outcomes when the user edits again.
- Use motion to explain state and spatial changes. Expanding and closing should support repeated input, interruption, and reversal while keeping visuals, focus, interactivity, and scroll state synchronized.
- Preserve full function and necessary feedback under `prefers-reduced-motion`. Focus outlines should remain visible in standard and forced-colors modes; disabled states should not move.

The shared subscription form uses a standard light treatment on Contact and an inverse treatment in the Footer. Each instance has a unique section/heading ID and independent submission state; both retain the same confirmation and retry contract.

Choose focus tokens according to light or inverse form surfaces. Preferences retain their own disabled opacity. Reserve space for status messages and allow long errors to wrap. After a programmatic field reset, keep the success message visible until the user edits again.

Current interaction conventions: the mobile menu slides left to open and right to close, and navigation fades early on close. Mobile language choices use a vertically expanding disclosure, initially collapsed and labelled with the current language. Its options contain only the other languages, avoiding a duplicate current-language control. Menu navigation, the language disclosure label, and language choices share a fast color transition and Medium Blue feedback for hover, keyboard focus, pressed, current-page, and expanded states. They retain stable geometry without separators or background fills. Keyboard focus adds an underline to navigation links, the language disclosure label, and language choices so focus remains distinguishable from current-page and expanded colors. The close icon returns from X to Menu. Background isolation and scroll locking remain until dismissal finishes, then focus returns. The open menu's close button retains a blue fill and black border; keyboard focus keeps its outer ring visible under `:focus-visible`. Touch presses show a separate blue ring and slight scale reduction; release fades the ring, including short taps and pointer cancellation. This feedback transfers from the trigger to the close control when opening. Reduced-motion mode shows the held ring without scale or release animation. The desktop language menu supports Enter, Space, arrow keys, Escape, and Tab; the mobile disclosure supports Enter, Space, and Tab. Reduced-motion mode may complete state changes immediately.

Memos and monthly data retain native `details`/`summary` semantics. The requested state, `aria-expanded` and content interactivity remain synchronized, including during closing. Height animation can reverse mid-flight; a viewport resize settles the intended height, and closing returns focus from the content to its summary. Without JavaScript, the native disclosure remains usable. The modal mobile navigation uses `closed → opening → open → closing` phases, background isolation, a focus trap and Escape dismissal; ordinary navigation links retain link semantics. Opening and dismissal transforms are owned by Web Animations API; CSS Modules own unrelated color and touch feedback. Cancel, finish, resize, reduced-motion changes and unmount must leave no stale effects.

## Content and localization

Subscription feedback distinguishes confirmation requested, subscription confirmed, duplicate subscription, and delivery failure. Never call a request “subscribed” before confirmation. Confirmation pages require an explicit action; opening a link must not mutate consent. Keep invalid, pending, failed and completed states accessible, and preserve request identity on retries. Translate confirmation purpose, expiry and unrequested-email guidance in all three languages. Service behavior belongs in the [Resend guide](RESEND_INTEGRATION.md#subscription-confirmation-and-delivery-feedback).

The goal is to keep information equivalent while respecting language differences.

- Use consistent terminology for the same concepts. State the outcome first, then give the next step when needed.
- Use title case for English page and section headings, form titles, data labels, chart and table headings, and disclosure titles. Capitalize the first and last words, nouns, pronouns, verbs, adjectives, and adverbs; keep articles, coordinating conjunctions, and prepositions lowercase unless they start or end the title. Treat wrapped lines as one title, capitalize meaningful parts of hyphenated words, and preserve brand names and acronyms. Use sentence case for prose, status messages, and ordinary actions.
- Present dates, currency, percentages, and data timestamps clearly and consistently. Portfolio and performance data are timestamped snapshots and must not imply live quotes; see [Portfolio Data](PORTFOLIO_DATA.md) for definitions.
- Preserve meaning, tone, and action intent in translation rather than matching words or line counts literally. Language differences may justify layout and content variants.

## Markdown documentation

Write all project documentation prose in English. Keep interface copy with the page or shared component that owns it. Keep portfolio snapshots and their derivation modules directly in the owning feature; memo articles live in the memo feature’s `articles/` directory. When an operation requires an exact non-English runtime or provider value, show it as a literal and link to its authoritative definition in code; do not translate that value.

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

| Layer                                            | Responsibility and configuration source                                                                           |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Prettier and Tailwind plugin                     | Formatting and recognized Tailwind class ordering; see the `prettier` field in [`package.json`](../package.json). |
| ESLint, typescript-eslint, and framework plugins | Code, type usage, and framework rules; see [`eslint.config.mjs`](../eslint.config.mjs).                           |
| TypeScript                                       | Type checking; see [`tsconfig.json`](../tsconfig.json).                                                           |
| Unit tests                                       | Logic, state, and failure handling.                                                                               |
| Playwright                                       | Layout, interaction, and browser behavior; see [`playwright.config.ts`](../playwright.config.ts).                 |
| Human review and device checks                   | Understandability, visual quality, and real-device experience.                                                    |

See [README verification](../README.md#verification) and [`package.json`](../package.json) for commands; configuration files and [`ci.yml`](../.github/workflows/ci.yml) define versions and CI behavior. Choose checks according to change risk. Shared UI changes should cover three languages, narrow layouts, enlarged text, keyboard, touch, reduced motion, and forced colors when relevant. Browser tests should verify rendered behavior rather than repeat CSS source-code assertions.

Add a rule only to address a real problem. When revising a rule, check the related tools, documentation, and tests for conflicting standards.

Prettier uses `prettier-plugin-tailwindcss` with `src/app/globals.css` as the Tailwind v4 stylesheet entry point, including custom tokens and variants. It sorts recognized `className` attributes and class lists passed to `cn`, `clsx` and `cva`. Plain strings in private style maps are not automatically recognized; do not claim that every string in a `*.styles.ts` file is sorted. Preserve CSS cascade, variant semantics and meaningful interpolation boundaries when editing those maps.

`npm run lint` runs ESLint; `npm run format:check` runs Prettier including CSS parsing and Tailwind ordering. `eslint-config-prettier` disables conflicting formatting rules. There is no dedicated CSS semantic linter: formatting does not detect invalid property names or all selector errors. Use the production CSS build, affected browser checks and review for those concerns. Commit hooks remain check-only; use `npm run format`, inspect the diff and stage the intended files before committing.
