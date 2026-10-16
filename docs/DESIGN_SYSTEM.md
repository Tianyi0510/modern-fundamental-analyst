# Design System

Use this guide for visual design, component behavior, interface copy and localization. Preserve Jost, brand assets and intentional language variants. [Architecture](WEB_APPLICATION_ARCHITECTURE.md) covers code conventions, rendering, style loading and tooling. [README](../README.md#documentation) maps the documents.

## Architecture and reference ownership

The site adopts the five layers below as its design system. Preserve its editorial identity: Jost headings, three brand blues, square financial surfaces, pill-shaped actions and generous whitespace. Apply reference principles through these owned components and tokens. Upstream defaults do not override the brand or justify unrelated features.

| Layer                  | Responsibility                                                                                                                                                                                                                      | Reference                                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 01: Design foundations | Geist supplies Typography, Colors, Materials and guided Grid layouts. Fluent 2 organizes primitives, semantic aliases and component roles. Explicit brand exceptions remain.                                                        | [Geist](https://vercel.com/geist/introduction), [Fluent 2 tokens](https://fluent2.microsoft.design/design-tokens)   |
| 02: UX guidelines      | Evaluate clarity, feedback, navigation and input behavior against the actual task. Record justified exceptions instead of applying every recommendation mechanically.                                                               | [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines), [Cieden Handbook](https://cieden.com/book) |
| 03: Components         | Maintain customized shadcn/ui source and Lucide interface icons. Native HTML remains appropriate for static content and native form controls.                                                                                       | [shadcn/ui](https://ui.shadcn.com/docs), [Lucide](https://lucide.dev/)                                              |
| 04: Interaction engine | Base UI underpins shadcn interactive primitives: menus, positioning, modal isolation, focus containment and scroll locking. React and the owning feature retain application state, business workflows and interruptible animations. | [Base UI](https://base-ui.com/react/overview/quick-start)                                                           |
| 05: Implementation     | React, Next.js App Router, TypeScript, Tailwind CSS and owned CSS Modules implement the system.                                                                                                                                     | [Application architecture](WEB_APPLICATION_ARCHITECTURE.md#presentation-and-style-loading)                          |

WCAG 2.2 AA, responsive design, semantic HTML and Core Web Vitals are cross-layer quality targets. Automated checks cover specific requirements; they do not establish full accessibility conformance or field CWV compliance. See the [contrast policy](#contrast-policy) and [performance verification](WEB_APPLICATION_ARCHITECTURE.md#performance-regression-checks).

Preserve Jost, Noto Sans language fallbacks, the three brand blues and Logo. Pentagram's [PayPal work](https://www.pentagram.com/work/paypal), Lineto's [Supreme](https://lineto.com/typefaces/supreme) and [PayPal typography](https://lineto.com/bespoke/paypal), and [Jost](https://indestructibletype.com/Jost.html) are visual references, not replacement assets or font licenses. Geist and Fluent 2 guide the owned design system; their component packages and fonts are not installed. No dark mode, search or command palette is implied by adoption.

### Decision authority and brand adaptations

Geist is the primary visual reference for typography, colors, spacing, grids, shapes and elevation. Fluent 2 contributes token architecture and naming, not a competing palette or component library. This is the site's integration of these references, not an official combined standard.

Apply decisions in this order:

1. Preserve verified content, service contracts and the explicitly retained brand assets; meet the relevant accessibility requirement.
2. Use Geist to choose a coherent visual treatment for the task.
3. Express that treatment through the shared tokens and owned component variants, following Fluent 2's global/alias structure.
4. Adapt shadcn defaults to those decisions. Add Base UI behavior only where an interactive primitive needs it.

| Brand adaptation | Site rule and reason                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Font             | Keep Jost and the locale-specific Chinese fallbacks. Financial figures use tabular numerals; Geist Sans or Mono is not required.                                                      |
| Palette          | Retain all brand and financial colors, including the two original grays. Use Geist neutral roles with the documented brand overrides; retain black primary text and inverse surfaces. |
| Geometry         | Retain square financial surfaces, pill actions and the editorial container. Standard fields and the memo grid use 6px corners; floating menus use 12px.                               |
| Typography       | Use Geist heading, copy, label and button treatments with Jost, rem units and a 1rem minimum. Preserve the wordmark's original metrics and use zero tracking for Chinese text.        |
| Features         | References do not imply dark mode, a dashboard, authentication, search or a command palette. Add a feature only for a defined user need.                                              |

A new treatment needs a reason, an owning role or component variant, and verification in its real context. Do not import another visual preset to solve an isolated component problem.

### Token structure

`tokens.css` remains the single source of values. Global primitives such as brand colors, spacing and motion feed semantic aliases such as `--surface-brand`, `--text-brand`, `--interactive-accent` and `--chart-benchmark`; Tailwind references the same aliases. This follows Fluent 2's global/alias separation. Raw neutral values and brand colors feed surface, border, text and interaction roles; retaining useful token names avoids unnecessary churn. Component roles may have distinct aliases even when their current values match.

`--shadow-popover` owns Geist's Menu material shadow; `--shadow-surface` owns its Base surface outline. `--width-content` owns the 1440px container maximum. Shape aliases distinguish pill actions (`--radius-action`), 6px fields (`--radius-field`), square financial surfaces (`--radius-surface`) and 12px popovers (`--radius-menu`). Do not convert chart coordinates or measured animation values into fixed design tokens.

### Component token contract

Component roles are aliases within the same token system. `--action-primary-*`, `--action-contrast-*`, `--action-inverse-*` and `--action-quiet-*` describe action appearance and feedback. Button and ButtonLink consume the same variant definition. `--field-*` describes standard input, textarea and native-select surfaces; inverse fields have their own text, border and placeholder roles.

Change a shared role in `tokens.css` to update all consumers. Keep background, foreground, border and hover colors compatible as a set. Use `variant` for an existing appearance and `className` for placement or sizing, rather than overriding a shared component's colors from its caller. Preserve justified variants such as the Footer's inverse form. Theme-ready aliases do not activate a second theme.

`src/components/ui/input.spec.ts` verifies propagation from a native link through client navigation to form buttons, shared input/textarea roles, and the independent inverse field treatment. Existing control-state checks verify loading, disabled, failure and retry behavior.

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

### Grid layout

Follow [Geist Grid](https://vercel.com/geist/grid) for layouts where visible guides organize cells. `Grid` in `src/components/grid.tsx` is the site's Server Component implementation, using CSS Grid and Tailwind rather than an additional component package. Keep ordinary cards, forms, KPI bands and editorial columns on plain Tailwind grids when visible guides add no meaning. `Container` continues to own page width and gutters.

The guided grid uses one column through 800px, two from 801px, and three from 1101px when configured for three columns. Two-column grids retain two columns above 800px. Rows follow content height and DOM order; do not fix text-bearing rows to a pixel height. Tracks use `minmax(0, 1fr)` to contain long translated content.

Home and the memo index share this grid. Their three memo cells occupy three desktop columns; on tablets, the third cell spans the second row. Mobile retains the published memo and hides planned placeholders. Cards own their opaque surfaces, corners and focus feedback. The one-pixel gap exposes `--grid-guide`, an alias of the original gray divider color. The shared material outline remains unchanged.

Guides are decorative CSS backgrounds, with no focus targets or ARIA grid role. Content keeps native headings, articles and links; keyboard order follows reading order. Do not clip focus outlines or nest guided grids more than one level. Cross markers, dashed guides and overlaying cells are not needed by the current content.

Home's performance comparison uses a named inline-size container. Below 45rem of available content width, its chart and headline figure stack vertically. The rem-based container query responds to enlarged root text as well as available width, preserving the two-column layout at ordinary tablet and desktop text sizes. Keep the percentage's type size and value intact; do not hide horizontal overflow to compensate for insufficient column width.

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
| `FormField`, `Input`, `Textarea`, `NativeSelect` | Label association, visible or hidden label, standard rounded or inverse compact fields. Business validation and submission stay with the feature.                                                                                                          |
| `Alert`                                          | Standard or inverse typography, reserved space and polite live feedback; an explicit alert role supports assertive announcements.                                                                                                                          |
| `PortfolioMetric`                                | Plain, highlight, brand or paper financial surfaces, shared typography and surface-specific note colors.                                                                                                                                                   |

Use Tailwind for layout and ordinary states, and CSS Modules for complex structures and motion. Both use the same tokens. References: [Next.js CSS](https://nextjs.org/docs/app/getting-started/css#recommendations), [Tailwind themes](https://tailwindcss.com/docs/theme), and [Preflight](https://tailwindcss.com/docs/preflight).

Choose tokens by purpose. CSS defines values and breakpoints. Keep sizing, spacing and overflow predictable.

- Use semantic text roles, `rem` units and bounded `clamp()` for display sizes. Do not invent a size to fit one screenshot or change a role solely at a breakpoint.
- Choose heading levels by document structure, independent of visual size. Memo cards use H2 on the index and H3 on Home, including placeholders. Each disclaimer section has an H2 in every locale, even without an introductory lead.
- Use tabular figures for financial comparisons.

### Typography roles

Jost is shared across locales. Each Chinese root layout owns its matching Noto Sans font; ordinary English pages must not load either Chinese font stylesheet. Keep the existing font options, fallback order and text metrics. The global 404 handles all locales in one entry and may load both Chinese stylesheets, but its body selects the correct locale variable. `src/lib/fonts.spec.ts` verifies stylesheet scope and the normal/404 fallback behavior.

Type treatments combine size, line height, weight and tracking. The site adopts [Geist Typography](https://vercel.com/geist/typography) with Jost and locale-specific fallbacks. `--font-size-*`, `--leading-*`, `--tracking-*` and `--weight-*` define values; `@theme inline` in `tokens.css` maps them to Tailwind treatments:

| Role           | Utility                                                                 | Use                                                    |
| -------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| Display        | `text-display`                                                          | Page and Hero titles                                   |
| Headline       | `text-headline`                                                         | Major section headings                                 |
| Title          | `text-title`, `text-title-small`                                        | Cards, forms, chart headings and compact titles        |
| Body           | `text-lead`, `text-body-large`, `text-body`                             | Introductions and reading text                         |
| Label          | `text-label`, `text-control`, `text-caption`                            | Section markers, actions and supplementary information |
| Financial data | `text-data-display`, `text-data-kpi`, `text-data-ring`, `text-data-row` | Financial values; pair with `tabular-nums`             |

Keep website text at least `1rem`, including controls, captions, chart labels, notes and feedback; email has separate compatibility rules. At a 16px root, the adopted treatments are:

| Site role                      | Geist treatment                  | Size / line height        | Weight                         | English tracking |
| ------------------------------ | -------------------------------- | ------------------------- | ------------------------------ | ---------------- |
| Page display                   | Heading 72; Heading 40 on mobile | 72 / 72; 40 / 48          | 600                            | -0.06em          |
| Section heading                | Heading 40                       | 40 / 48                   | 600                            | -0.06em          |
| Card title                     | Heading 24                       | 24 / 32                   | 600                            | -0.04em          |
| Compact title                  | Heading 20                       | 20 / 26                   | 600                            | -0.02em          |
| Lead                           | Copy 20                          | 20 / 36                   | 400                            | 0                |
| Long-form body                 | Copy 18                          | 18 / 28                   | 400                            | 0                |
| Body and caption               | Copy 16                          | 16 / 24                   | 400                            | 0                |
| Label and action               | Label 16 Strong / Button 16      | 16 / 20                   | 500                            | 0                |
| Financial display / KPI / ring | Heading 72 / 64 / 40             | 72 / 72; 64 / 64; 40 / 48 | 600                            | -0.06em          |
| Financial row                  | Label 20                         | 20 / 32                   | 400, with explicit bold totals | 0                |

Financial values use tabular numerals. The Logo wordmark retains its original 20–24px scale, 1.2 line height, 700 weight and -0.05em tracking through a separate `text-wordmark` role. It must not inherit ordinary compact-heading changes.

Chinese headings use zero tracking. A nested `lang="en"` article restores the English role's tracking on Chinese pages. Sizes use rem rather than fixed pixels so browser text enlargement works. Fix narrow layouts instead of shrinking body text; cards, metadata and controls must wrap.

### Neutral colors and materials

Adopt the light sRGB values from [Geist Colors](https://vercel.com/geist/colors). There is no dark theme. The ten gray steps serve component backgrounds (100–300), borders (400–600), high-contrast fills (700–800) and text (900–1000). The scale is role-based, not a monotonically spaced brightness ramp. Page Background 1 is white. The site overrides Geist Background 2 with the original `--background-gray: #f8f9fb` for Hero and secondary section bands, subtle surfaces and the material background outline. The original `--gray: #ededed` supplies dividers, chart grids and `--border-subtle`, including memo-grid separators. Keep the ten-step Geist neutral palette unchanged; these two brand aliases are explicit exceptions. Secondary text uses Gray 900 (30% gray); stronger supplementary text uses Gray 1000 (9% gray).

Use solid gray for borders and translucent black for material shadows. Standard fields use white, 6px corners and Gray 800 borders to meet the non-text contrast target; do not use a faint decorative surface outline as their only boundary. Brand-colored selection, hover and focus states remain independent of the neutral palette. Black primary text, the two original grays, all existing brand/financial colors and the black Footer are explicit exceptions.

[Geist Materials](https://vercel.com/geist/materials) combine fill, outline, shadow and radius:

- The memo grid uses the Base surface: white cards, 6px corners and the single shared outline. Interior separators use solid gray. Corners are applied to the cards without clipping the grid, preserving keyboard focus outlines. It has no extra CSS border or raised shadow.
- The language popup uses Menu material: white fill, 12px corners and the official outline plus three neutral elevation layers. Its Positioner owns stacking. Do not add a second border around the material's shadow stroke.
- Standard form fields use the accessible border adaptation above. Footer fields remain inverse pills.
- Financial blocks remain square and flat. Full-screen mobile navigation remains edge-to-edge white, without a rounded floating frame. Pill CTAs and the black Footer preserve their brand treatment.

Values were checked against the official Geist stylesheets on 2026-10-15. `tokens.css` owns the implementation; no Geist font or component package is required. Do not add unused tooltip or modal materials for components the site does not render.

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

Portfolio return text uses `--text-return-positive` (`#037B66`) and `--text-return-negative` (`#D60A22`). These site colors were selected from [Yahoo Finance's quote table](https://finance.yahoo.com/markets/stocks/most-active/) on October 5, 2026. Both meet 4.5:1 contrast on white and the table's pale blue hover surface.

Support error feedback uses `--border-error` (`#FF0000`) for its left border. This non-text error role is independent of financial returns; error message text retains its existing color.

Known normal-text contrast gaps are recorded in the [contrast policy](#contrast-policy).

Use Jost for Latin text and numbers, Noto Sans TC for Traditional Chinese, and Noto Sans SC for Simplified Chinese.

Brand masters are [`public/icon.svg`](../public/icon.svg) and [`logo.svg`](../public/logo.svg), with PNG copies beside them. Preserve the square icon, single-line wordmark and colored period. Generate icons and social images from these masters. Keep App Router icon and Apple icon files aligned with the icon master; sharing metadata uses [`public/og-logo.png`](../public/og-logo.png). Old `/images/` URLs permanently redirect to root assets.

Preserve information and action priorities at every width.

- Bound mobile title sizes and allow emergency wrapping for enlarged or unbreakable text. Desktop line breaks must not isolate words or split short Chinese phrases on mobile.
- Align related form fields unless a visible container explains an inset. Contact and Preferences use the shared 6px field treatment; compact Footer fields are pill-shaped.
- Check all three languages, root font sizes up to 200%, long translations and changed content. The footer wordmark may wrap.
- Allow local values for chart geometry and optical adjustments when shared spacing tokens do not fit.

### Contrast policy

Use `--interactive-accent` (Deep Blue) for normal-size interactive text. Medium Blue remains a brand primitive for decorative details, non-text focus rings and the dashed benchmark line; it is not a normal-text color on white. `--surface-selected` provides a pale blue surface for desktop navigation and language states. Use Deep Blue text on that surface.

Validate normal-size text at 4.5:1 after compositing opacity and non-text indicators at 3:1 where required. KPI notes retain their value's color at 0.8 opacity. Footer secondary text uses dedicated inverse aliases, with 0.84 and 0.78 white opacity on black. Disabled controls have separate feedback and must not acquire enabled hover states.

Tests cover these specific combinations and input states. They do not establish full WCAG 2.2 AA conformance. Maintain keyboard and forced-colors focus indicators and verify actual surfaces when introducing a variant.

### shadcn/ui components

The project owns its customized [shadcn/ui](https://ui.shadcn.com/docs) source. `components.json` targets the `base-nova` registry, Tailwind v4, `@/*` imports and `src/components/ui/`. The registry selects Base UI source for additions. Owned tokens, component variants and brand adaptations define the rendered design; a registry preset is not a second visual system. `cn` in `src/lib/utils.ts` merges classes; Button variants use `class-variance-authority`. Import primitives directly. `ButtonLink` shares Button styles and preserves link semantics without introducing a client boundary for ordinary links.

Use the Button variants and sizes listed above. The quiet text variant preserves the Preferences unsubscribe treatment. Fields keep `standard` and `inverse` styles; Textarea and NativeSelect share the input appearance. Disabled fields retain text colors and use a dashed border with a not-allowed cursor. Native controls keep refs, labels, validation and submission without a client boundary.

To add a primitive:

1. Inspect its source and dependencies with `npx shadcn@latest view <component>`.
2. Add only what is needed with `npx shadcn@latest add <component>`.
3. Review the full diff. Map colors, focus, disabled and motion states to semantic tokens; `accent` means the accessible Deep Blue interaction role.
4. Preserve Jost, the reset and customized primitives. Add a client boundary or dependency only when the component needs it.
5. Verify rendered states, native forms and navigation. Upstream defaults do not define this site's design.

Desktop language selection uses shadcn/ui composition over Base UI `Menu`. Put linked locale items in `DropdownMenuGroup`, preserving `hrefLang`, current-language hints and validated recovery parameters. Base UI owns keyboard entry, item navigation and dismissal; the header preserves explicit Tab and outside-focus exits without moving focus away from the destination control. `render={<Link ... />}` keeps each item a real link. The positioner preserves viewport-fixed anchoring and owns popup stacking; the popup uses Base UI's available-height variable.

Mobile navigation uses `Sheet` over Base UI `Dialog` for naming, focus containment, background isolation and scroll locking. The existing `closed → opening → open → closing` phase remains the only application state source: keep the modal open through the closing animation. Use Base UI's `initialFocus` and `finalFocus` for the existing close-control entry and route-aware return behavior. Render the visible close button through `SheetClose`; the replaced opening trigger is inert until the modal closes. Do not add a second focus trap, body lock or background `inert` controller. The language disclosure remains native `details` with its existing animation.

Inside the Sheet, compose primary links with `SidebarMenu`, `SidebarMenuItem` and `SidebarMenuButton render={<Link ... />}`. These are a menu-only shadcn/ui composition using Base UI `useRender`, customized for this site's full-width mobile navigation. `SidebarMenu` retains an explicit list role for Safari when the reset removes list markers. Pass one route-derived active value to `isActive` and the link's `aria-current`; preserve real Next.js links, wrapping, Tab order and navigation dismissal. Sheet remains the state owner; the menu subset has no provider, collapse state, shortcut or tooltip. It does not implement the full upstream Sidebar API.

`FieldGroup` groups controls. Contact, subscription and Preferences forms use `contents` to preserve the native form's grid, event target, validation and control placement; ordinary vertical groups can use `stack`.

`FormField` connects `Field` and `FieldLabel`. `NativeSelect` keeps the platform picker. `Alert` provides shared result styling and live feedback. `ServiceLoading` pairs localized busy text with static, decorative `Skeleton` placeholders hidden from assistive technology.

UI primitives own stacking through `--layer-navigation`, `--layer-modal` and `--layer-popover`. Header composition controls responsive visibility without duplicating Sheet positioning or stacking.

## UX tasks and acceptance

Use Vercel's interface guidelines for input behavior, focus, loading and errors. Use Cieden as a reference for task analysis, information architecture and usability checks. The tasks below describe the site's current intent; they are working assumptions, not findings from a user-research study.

| Reader task                            | Interface contract                                                                                            | Acceptance evidence                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Evaluate research                      | Find a memo, its publication date, article language, source and disclaimer.                                   | Memo navigation, localized notices and semantic-content checks.                    |
| Inspect the portfolio                  | Identify the snapshot date, holdings, return boundary and benchmark; sort or read the monthly alternative.    | Portfolio sorting, chart disclosure, methodology and responsive checks.            |
| Contact or subscribe                   | Distinguish sending a message from requesting and confirming subscription consent; receive a clear next step. | Independent form-state tests, mocked delivery, failure and retry checks.           |
| Manage preferences or support research | Preserve validated language/recovery state, prevent duplicate operations and report only verified outcomes.   | Preferences and Checkout recovery tests; provider procedures stay in Integrations. |

Review the complete path from entry to outcome, including keyboard, touch, interrupted operations and failure recovery. Use feedback or observed task failures to revise a flow; the presence of a component or reference link does not establish usability.

## Interaction, motion, and accessibility

Make every operation understandable and reliable. Include accessibility in layout, content and interaction design.

- Make controls recognizable and keyboard focus clearly visible. Touch hover resets must preserve active and `:focus-visible` feedback. Shared CTA hover recovery belongs to the button component; reset only idle hover, including transforms, without overriding active or keyboard focus.
- Shared Button, ButtonLink and round CTAs opt into `TouchPressFeedback` with `data-touch-feedback`. One delegated passive pointer listener supplies `data-touch-pressed` while a primary touch is held; release, cancellation, movement, scrolling, page hiding and cleanup clear it. Native click, navigation, focus and form behavior remain unchanged, and the controls remain server-compatible. CSS uses the existing press tokens and reduced-motion override. Menu feedback retains its separate ownership because it transfers between trigger and close controls. Verify trusted touch holds in Chromium, tap/release in both engines, and cancellation events separately; mouse presses do not establish touch behavior.
- Give loading, success, failure, disabled, and retry states clear meanings. Forms should prevent duplicate submissions, announce outcomes with text and live regions, and clear stale outcomes when the user edits again.
- Use motion to explain state and spatial changes. Hover keeps control geometry stable; a held press uses a subtle 0.985 scale with 80ms feedback. Standard feedback uses 140–160ms transitions, larger state changes 220–280ms, and the existing mobile panel direction and icon reversal remain intact. Expanding and closing should support repeated input, interruption, and reversal while keeping visuals, focus, interactivity, and scroll state synchronized.
- Preserve full function and necessary feedback under `prefers-reduced-motion`. Focus outlines should remain visible in standard and forced-colors modes; disabled states should not move.

Subscription forms retain standard Contact and inverse Footer treatments. Their independent instance state and delivery contracts are documented in [Integrations](INTEGRATIONS.md#subscription-entry-points).

Contact draft and retry recovery belong to the [Contact workflow](INTEGRATIONS.md#contact-draft-recovery).

Choose focus tokens according to light or inverse form surfaces. Preferences retain their own disabled opacity. Reserve space for status messages and allow long errors to wrap. After a programmatic field reset, keep the success message visible until the user edits again.

### Menu behavior

- The mobile panel slides left to open and right to close. Navigation fades early during closing; the icon rotates from X back to Menu.
- The language disclosure starts collapsed, shows the current language as its label, and lists only the other languages.
- Mobile Sidebar uses Geist-style compact rows: 16px Button typography, minimum touch targets from `--size-touch-target` (48px by default), 4px row gaps, 6px corners and 18px decorative Lucide icons. Selected links retain the pale brand-blue surface and Deep Blue text. Hover and pressed feedback use Geist Gray 100 and 200 through `--sidebar-*` roles; transitions change color and background without shifting geometry. Idle touch hover resets clear the language summary background whether expanded or collapsed, preserving expanded text color, selection and keyboard focus. Keep the white full-screen panel, original wordmark, round close control and existing opening/closing animation.
- Mobile Sidebar links, language options and the disclosure summary share `--focus-ring-width` (2px by default) for the Deep Blue outline and its matching inset offset, distinct from the persistent selected surface. The bottom language group uses the original background gray, 12px outer corners and the same row feedback. Its native disclosure excludes the current language and retains keyboard operation and animated reversal. Header stays fixed inside the modal while navigation and language content share one scroll region. No extra navigation labels, separators or features are introduced. The desktop language menu supports Enter, Space, arrows, Escape and Tab; the mobile disclosure supports Enter, Space and Tab.
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

Accessibility, responsiveness, semantics, performance, maintainability and reliability apply across all five layers. Keep provider procedures, error recovery and release gates in the architecture and integration guides.

For field Core Web Vitals, target the 75th percentile separately for mobile and desktop: LCP at most 2.5s, INP at most 200ms and CLS at most 0.1. See [Web Vitals](https://web.dev/articles/vitals). Local Lighthouse budgets are regression checks with their own documented limits; TBT is not INP, and a passing lab run does not establish field compliance. Preserve the existing CI budgets unless a separate performance change justifies adjusting them.

Compare direct loads, client navigation and browser return in the same browser and viewport. Check computed styles, wrapping, focus and animation states. Do not bind behavior tests to class strings. WebKit emulation does not replace physical iPhone testing.

`src/app/_components/semantic-content.spec.ts` checks KPI note/value color equality, 0.8 opacity and at least 4.5:1 composited contrast across locales and desktop/mobile widths. `src/features/portfolio/performance-chart.spec.ts` checks benchmark contrast. `scripts/color-contrast.ts` composites transparency before calculating WCAG luminance.

Typography and layout tests stay beside their owners. Use [AGENTS.md](../AGENTS.md#verification-and-review) to select affected checks and the [test workflow](WEB_APPLICATION_ARCHITECTURE.md#test-workflow) for runner and CI details.
