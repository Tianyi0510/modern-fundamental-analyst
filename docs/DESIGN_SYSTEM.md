# Design System

Use this guide for visual design, component behavior, interface copy and localization. Preserve Jost, brand assets and intentional language variants. [Architecture](WEB_APPLICATION_ARCHITECTURE.md) covers code conventions, rendering, style loading and tooling. [README](../README.md#documentation) maps the documents.

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

Make the site easier to understand, use, change and verify. Share components when responsibilities match; keep justified language, form and service variants.

## Using this system

- Start with a semantic role and an existing component variant. Tokens in code own numeric values; this document explains their purpose and exceptions.
- Maintain visual and interaction rules here, not in page-specific global overrides. Business consent, payment and retry rules belong in [Integrations](INTEGRATIONS.md).
- Validate changed components in all three languages, narrow and enlarged-text layouts, and the relevant mouse, keyboard, touch and reduced-motion states. Preserve existing text colors and opacity unless a change is explicitly authorized.

## CSS, layout, and visual language

The site uses an editorial financial style: clear type hierarchy, generous section spacing, square data surfaces, pill-shaped primary controls and restrained motion.

### Style ownership

| Primary location                             | Responsibility                                                                                                                                        |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`tokens.css`](../src/app/styles/tokens.css) | Brand primitives, semantic colors, typography, spacing, control and motion values; Tailwind theme aliases reference these values.                     |
| [`base.css`](../src/app/styles/base.css)     | The single browser normalization, document fonts, baseline focus and motion preferences. No page or component selectors.                              |
| [`globals.css`](../src/app/globals.css)      | Tailwind layers, theme/utilities imports, tokens, base and shared responsive variants.                                                                |
| Component JSX and adjacent `*.styles.ts`     | Statically identifiable Tailwind classes for layout, responsive geometry, surfaces and ordinary states. Private style maps belong to their component. |
| Adjacent `*.module.css`                      | Complex owned motion, chart structure and special controls. Never override another component's internals.                                             |
| Inline styles                                | Values derived from data or measurements, such as chart coordinates; standalone global-error and email rendering have independent constraints.        |

[`postcss.config.mjs`](../postcss.config.mjs) processes Tailwind utilities. `base.css` supplies the only reset; do not add Preflight or another reset. Use complete utility names, not interpolated fragments. Give each property one styling owner. Cancel or settle measured animations before releasing their state.

Shared components provide a fixed set of variants:

| Component                                        | Contract                                                                                                                                                                                                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Container`                                      | Shared maximum width and responsive gutters; backgrounds belong to its outer section.                                                                                                                                                                      |
| `PageHero`                                       | Standard, portfolio, performance or support geometry; localized content remains with the page.                                                                                                                                                             |
| `Button` / `ButtonLink`                          | Primary, contrast, inverse or quiet surface; regular, small or text size. Native button and link semantics remain distinct. Button disabled feedback uses standard, muted or muted-busy variants, preserving preferences opacity without parent overrides. |
| `FormField`, `Input`, `Textarea`, `NativeSelect` | Label association, visible or hidden label, standard square or inverse compact fields. Business validation and submission stay with the feature.                                                                                                           |
| `Alert`                                          | Standard or inverse typography, reserved space and polite live feedback; an explicit alert role supports assertive announcements.                                                                                                                          |
| `PortfolioMetric`                                | Plain, highlight, brand or paper financial surfaces, shared typography and surface-specific note colors.                                                                                                                                                   |

Use Tailwind for layout and ordinary states, and CSS Modules for complex structures and motion. Both use the same tokens. References: [Next.js CSS](https://nextjs.org/docs/app/getting-started/css#recommendations), [Tailwind themes](https://tailwindcss.com/docs/theme), and [Preflight](https://tailwindcss.com/docs/preflight).

Choose tokens by purpose. CSS defines values and breakpoints. Keep sizing, spacing and overflow predictable.

- Use semantic text roles, `rem` units and bounded `clamp()` for display sizes. Do not invent a size to fit one screenshot or change a role solely at a breakpoint.
- Choose heading levels by document structure, independent of visual size. Memo cards use H2 on the index and H3 on Home, including placeholders. Each disclaimer section has an H2 in every locale, even without an introductory lead.
- Use tabular figures for financial comparisons.

### Typography roles

Jost is shared across locales. Each Chinese root layout owns its matching Noto Sans font; ordinary English pages must not load either Chinese font stylesheet. Keep the existing font options, fallback order and text metrics. The global 404 handles all locales in one entry and may load both Chinese stylesheets, but its body selects the correct locale variable. `src/lib/fonts.spec.ts` verifies stylesheet scope and the normal/404 fallback behavior.

Type treatments combine size, line height, weight and tracking. The site keeps its own scale and font families. `--font-size-*`, `--leading-*`, `--tracking-*` and `--weight-*` define values; `@theme inline` in `tokens.css` maps them to Tailwind treatments:

| Role           | Utility                                                                 | Use                                                    |
| -------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| Display        | `text-display`                                                          | Page and Hero titles                                   |
| Headline       | `text-headline`                                                         | Major section headings                                 |
| Title          | `text-title`, `text-title-small`                                        | Cards, forms, chart headings and compact titles        |
| Body           | `text-lead`, `text-body-large`, `text-body`                             | Introductions and reading text                         |
| Label          | `text-label`, `text-control`, `text-caption`                            | Section markers, actions and supplementary information |
| Financial data | `text-data-display`, `text-data-kpi`, `text-data-ring`, `text-data-row` | Financial values; pair with `tabular-nums`             |

Keep website text at least `1rem`, including controls, captions, chart labels, notes and feedback. This adapts [HarvardSites' readability guidance](https://designsystem.harvardsites.harvard.edu/graphic-design#clean-typography); email has separate compatibility rules. Preserve the title hierarchy, weights and colors. Fix the layout instead of shrinking small text.

Set tracking by content language:

| Text                                                   | Tracking                                                    |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| English headings                                       | `-0.025em`                                                  |
| English labels                                         | `0.025em`                                                   |
| Traditional and Simplified Chinese headings and labels | `0`                                                         |
| Body text                                              | `0`                                                         |
| Wordmark and financial figures                         | Independent `--tracking-brand` and `--tracking-data` tokens |

A nested `lang="en"` article restores English tracking on Chinese pages. This is a site adaptation, not a claim of full Harvard compliance. Check narrow and enlarged-text layouts after tracking changes. Memo cards and metadata must wrap; grid columns must allow content to shrink.

Apply a complete type treatment rather than repeating its utilities. Keep color, opacity, spacing and heading semantics independent. Preserve intentional emphasis and table-label weight or tracking overrides. CSS Modules use the same source tokens.

Register new size names in `src/lib/utils.ts` so class merging distinguishes sizes from colors. Test computed styles and reflow rather than class strings. Reference: [Tailwind font-size themes](https://tailwindcss.com/docs/font-size#customizing-your-theme).

A KPI's `tone` determines its colors, independent of card order:

| Tone        | Surface     | Text        |
| ----------- | ----------- | ----------- |
| `plain`     | White       | Black       |
| `highlight` | Bright Blue | Deep Blue   |
| `brand`     | Deep Blue   | Bright Blue |
| `paper`     | White       | Deep Blue   |

KPI notes use their value's text color at 0.8 opacity on every tone. Check at least 4.5:1 contrast after compositing over the surface; highlight is close to the threshold.

Benchmark lines and legend keys use `--chart-benchmark` (Medium Blue), with at least 3:1 contrast on white. Keep the dashed pattern and monthly table alternative.

Preserve text colors and opacity in normal, hover, active, disabled and inverse states unless a change is authorized. Pair positive and negative colors with numbers or symbols.

Portfolio return text uses `--text-return-positive` (`#037B66`) and `--text-return-negative` (`#D60A22`). These site colors were selected from [Yahoo Finance's quote table](https://finance.yahoo.com/markets/stocks/most-active/) on October 5, 2026. Both meet 4.5:1 contrast on white and the table's pale blue hover surface. Keep the non-text tokens `--price-up` and `--price-down` separate.

Medium Blue on white is about 3.39:1. The site does not claim full text-contrast compliance.

Use Jost for Latin text and numbers, Noto Sans TC for Traditional Chinese, and Noto Sans SC for Simplified Chinese.

Brand masters are [`public/icon.svg`](../public/icon.svg) and [`logo.svg`](../public/logo.svg), with PNG copies beside them. Preserve the square icon, single-line wordmark and colored period. Generate icons and social images from these masters. Keep App Router icon and Apple icon files aligned with the icon master; sharing metadata uses [`public/og-logo.png`](../public/og-logo.png). Old `/images/` URLs permanently redirect to root assets.

Preserve information and action priorities at every width.

- Bound mobile title sizes and allow emergency wrapping for enlarged or unbreakable text. Desktop line breaks must not isolate words or split short Chinese phrases on mobile.
- Align related form fields unless a visible container explains an inset. Contact and Preferences use square fields; compact Footer fields are pill-shaped.
- Check all three languages, root font sizes up to 200%, long translations and changed content. The footer wordmark may wrap.
- Allow local values for chart geometry and optical adjustments when shared spacing tokens do not fit.

### shadcn/ui components

The project owns its customized [shadcn/ui](https://ui.shadcn.com/docs) source. `components.json` targets Tailwind v4, `@/*` imports and `src/components/ui/`. `cn` in `src/lib/utils.ts` merges classes; Button variants use `class-variance-authority`. Import primitives directly. `ButtonLink` shares Button styles and preserves link semantics instead of using upstream `asChild`.

Use the Button variants and sizes listed above. The quiet text variant preserves the Preferences unsubscribe treatment. Fields keep `standard` and `inverse` styles; Textarea and NativeSelect share the input appearance. Disabled fields retain text colors and use a dashed border with a not-allowed cursor. Native controls keep refs, labels, validation and submission without a client boundary.

To add a primitive:

1. Inspect its source and dependencies with `npx shadcn@latest view <component>`.
2. Add only what is needed with `npx shadcn@latest add <component>`.
3. Review the full diff. Map colors, focus, disabled and motion states to existing tokens; `accent` means Medium Blue.
4. Preserve Jost, the reset and customized primitives. Add a client boundary or dependency only when the component needs it.
5. Verify rendered states, native forms and navigation. Upstream defaults do not define this site's design.

Desktop language selection uses Radix `DropdownMenu`. Put linked locale items in `DropdownMenuGroup`, preserving `hrefLang`, current-language hints and validated recovery parameters. Radix owns item navigation and dismissal; the header adapts upward-arrow entry and Tab exit.

Mobile navigation uses `Sheet` (Radix Dialog) for naming, focus containment, background isolation and scroll locking. Keep it open until closing finishes. Do not add a second focus trap, body lock or background `inert` controller.

Inside the Sheet, compose primary links with `SidebarMenu`, `SidebarMenuItem` and `SidebarMenuButton asChild`. These are the menu-only subset of the Radix Sidebar pattern, customized for this site's full-width text navigation. `SidebarMenu` retains an explicit list role for Safari when the reset removes list markers. Pass one route-derived active value to `isActive` and the link's `aria-current`; preserve real Next.js links, wrapping, Tab order and navigation dismissal. Sheet remains the state owner; the menu subset has no provider, collapse state, shortcut or tooltip. It does not implement the full upstream Sidebar API.

`FieldGroup` groups controls. Contact, subscription and Preferences forms use `contents` to preserve the native form's grid, event target, validation and control placement; ordinary vertical groups can use `stack`.

`FormField` connects `Field` and `FieldLabel`. `NativeSelect` keeps the platform picker. `Alert` provides shared result styling and live feedback. `ServiceLoading` pairs localized busy text with static, decorative `Skeleton` placeholders hidden from assistive technology.

UI primitives own stacking through `--layer-navigation`, `--layer-modal` and `--layer-popover`. Header composition controls responsive visibility without duplicating Sheet positioning or stacking.

## Interaction, motion, and accessibility

Make every operation understandable and reliable. Include accessibility in layout, content and interaction design.

- Make controls recognizable and keyboard focus clearly visible. Touch hover resets must preserve active and `:focus-visible` feedback. Shared CTA hover recovery belongs to the button component; reset only idle hover, including transforms, without overriding active or keyboard focus.
- Shared Button, ButtonLink and round CTAs opt into `TouchPressFeedback` with `data-touch-feedback`. One delegated passive pointer listener supplies `data-touch-pressed` while a primary touch is held; release, cancellation, movement, scrolling, page hiding and cleanup clear it. Native click, navigation, focus and form behavior remain unchanged, and the controls remain server-compatible. CSS uses the existing press tokens and reduced-motion override. Menu feedback retains its separate ownership because it transfers between trigger and close controls. Verify trusted touch holds in Chromium, tap/release in both engines, and cancellation events separately; mouse presses do not establish touch behavior.
- Give loading, success, failure, disabled, and retry states clear meanings. Forms should prevent duplicate submissions, announce outcomes with text and live regions, and clear stale outcomes when the user edits again.
- Use motion to explain state and spatial changes. Expanding and closing should support repeated input, interruption, and reversal while keeping visuals, focus, interactivity, and scroll state synchronized.
- Preserve full function and necessary feedback under `prefers-reduced-motion`. Focus outlines should remain visible in standard and forced-colors modes; disabled states should not move.

Subscription forms retain standard Contact and inverse Footer treatments. Their independent instance state and delivery contracts are documented in [Integrations](INTEGRATIONS.md#subscription-entry-points).

Contact draft and retry recovery belong to the [Contact workflow](INTEGRATIONS.md#contact-draft-recovery).

Choose focus tokens according to light or inverse form surfaces. Preferences retain their own disabled opacity. Reserve space for status messages and allow long errors to wrap. After a programmatic field reset, keep the success message visible until the user edits again.

### Menu behavior

- The mobile panel slides left to open and right to close. Navigation fades early during closing; the icon rotates from X back to Menu.
- The language disclosure starts collapsed, shows the current language as its label, and lists only the other languages.
- Navigation and language controls use a fast color transition and Medium Blue for hover, focus, pressed, current and expanded states. Keep their geometry stable, with no separators or background fills.
- Keyboard focus adds an underline, distinct from current or expanded color. The desktop language menu supports Enter, Space, arrows, Escape and Tab; the mobile disclosure supports Enter, Space and Tab.
- The open close-button has blue fill and a black border. Its keyboard ring stays visible under `:focus-visible`. Touch uses a separate blue ring and slight scale reduction; release and cancellation fade it, including short taps. The effect transfers from trigger to close control during opening.
- Reduced motion keeps the held touch ring, omits scaling and release animation, and may complete state changes immediately.

Use `closed → opening → open → closing` as the mobile menu's single state source. Keep Sheet open, the background isolated and scrolling locked until dismissal completes. Escape dismisses the Sheet; navigation links keep link semantics.

On entry, focus the close control. During closing, make the wordmark and navigation inert and move focus to the close control. On dismissal, restore the trigger with `preventScroll`; suppress restoration for an actual route change, but restore it for same-route dismissal. Check wrapping and overflow inside the drawer as well as across the page.

### Disclosure and animation ownership

Memos and monthly tables use native `details`/`summary`, including without JavaScript. Keep requested state, `aria-expanded` and interactivity synchronized during closing. Height animations can reverse; resizing settles the intended height. Closing returns focus from the content to its summary.

Web Animations API owns panel and icon transforms; CSS Modules own separate color and touch effects. Completion, cancellation, resize, reduced-motion changes and unmount must leave no stale effects.

## Content and localization

Describe verified outcomes and give a clear next step. A confirmation request is not an active subscription; returning from Checkout does not prove payment status. [Integrations](INTEGRATIONS.md) defines consent and payment states.

Keep meaning, tone and action intent equivalent across languages; line counts and layout may differ.

- Use consistent terminology for the same concepts. State the outcome first, then give the next step when needed.
- Follow [APA title case](https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case) for English page and section headings, form titles, data labels, chart and table headings, and disclosure titles. Capitalize the first word of the title or heading and the first word of a subtitle, including after a colon or a dash. Capitalize nouns, verbs (including linking verbs), adjectives, adverbs, pronouns, and words of four or more letters. Lowercase articles (`a`, `an`, `the`) and conjunctions or prepositions of three letters or fewer unless they begin the title, heading, or subtitle. Capitalize particles in phrasal verbs and major words in hyphenated compounds. Treat wrapped lines as one title and preserve brand names and acronyms.
- Apply the same capitalization to CTA labels, including links and buttons, as a site design convention; APA does not prescribe interface button capitalization. Examples: `Connect Through Research`, `View All Investment Memos`, `Get in Touch`, `Continue to Stripe`, and `Portfolio: A Monthly Record`. Apply title case to short visible annotations and supplementary labels as well: `Updated Monthly`, `Verified Snapshot as of`, `Purchases and Transaction Fees`, `Cash-Flow Weighted`, `Last Updated on`, and `Coming Soon`. Keep sentence case for complete explanatory sentences and paragraphs, methodology, form feedback, status messages, and loading feedback. Preserve date formats, unit symbols such as `min`, brand names, acronyms, and non-English copy.
- Present dates, currency, percentages, and data timestamps clearly and consistently. Portfolio and performance data are timestamped snapshots and must not imply live quotes; see [portfolio data](WEB_APPLICATION_ARCHITECTURE.md#portfolio-data) for definitions.
- Preserve meaning, tone, and action intent in translation rather than matching words or line counts literally. Language differences may justify layout and content variants.

Describe research coverage accurately. Selected-company coverage does not imply a thesis or model for every holding. Preserve source-article wording and publication dates. Put scope and language notices in the page's language, aligned with the article body and spaced apart from its first heading. Label publisher overviews when they are not the full report.

## Design verification

Compare direct loads, client navigation and browser return in the same browser and viewport. Check computed styles, wrapping, focus and animation states. Do not bind behavior tests to class strings. WebKit emulation does not replace physical iPhone testing.

`src/app/_components/semantic-content.spec.ts` checks KPI note/value color equality, 0.8 opacity and at least 4.5:1 composited contrast across locales and desktop/mobile widths. `src/features/portfolio/performance-chart.spec.ts` checks benchmark contrast. `scripts/color-contrast.ts` composites transparency before calculating WCAG luminance.

Typography and layout tests stay beside their owners. Use [AGENTS.md](../AGENTS.md#verification-and-review) to select affected checks and the [test workflow](WEB_APPLICATION_ARCHITECTURE.md#test-workflow) for runner and CI details.
