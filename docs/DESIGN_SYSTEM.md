# Design system

Use this guide for visual design, component behavior, interface copy and localization. Preserve Jost, brand assets and intentional language variants. [Architecture](WEB_APPLICATION_ARCHITECTURE.md) covers code conventions, rendering, style loading and tooling. [README](../README.md#documentation) maps the documents.

## Architecture and reference ownership

The site adopts the five layers below as its design system. Preserve its editorial identity: Jost headings, three brand blues, square financial surfaces, pill-shaped actions and generous whitespace. Apply reference principles through these owned components and tokens. Upstream defaults do not override the brand or justify unrelated features.

| Layer                  | Responsibility                                                                                                                                                                                                                      | Reference                                                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 01: Design style       | Pentagram, PayPal and Jost guide the editorial identity, typographic character and brand composition. Preserve the site's own assets and explicit brand adaptations.                                                                | [Pentagram](https://www.pentagram.com/), [PayPal](https://www.pentagram.com/work/paypal), [Jost](https://indestructibletype.com/Jost.html) |
| 02: Design foundations | Geist supplies visual references; the site owns its palette, typography, spacing, grid, geometry and motion. Fluent 2 supplies only the global/alias Design Tokens architecture.                                                    | [Geist](https://vercel.com/geist), [Fluent 2 design tokens](https://fluent2.microsoft.design/design-tokens)                                |
| 03: UX guidelines      | Vercel guides web interaction quality; Cieden guides task analysis, information architecture and usability. The site owns its content-design rules.                                                                                 | [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines), [Cieden Handbook](https://cieden.com/book)                        |
| 04: Components         | Maintain customized shadcn/ui source and Lucide interface icons. Native HTML remains appropriate for static content and native form controls.                                                                                       | [shadcn/ui](https://ui.shadcn.com/), [Lucide](https://lucide.dev/)                                                                         |
| 05: Interaction engine | Base UI underpins shadcn interactive primitives: menus, positioning, modal isolation, focus containment and scroll locking. React and the owning feature retain application state, business workflows and interruptible animations. | [Base UI](https://base-ui.com/)                                                                                                            |

React, Next.js App Router, TypeScript, Tailwind CSS and owned CSS Modules implement these five design layers. Their dependencies, rendering boundaries and style loading belong in [Application architecture](WEB_APPLICATION_ARCHITECTURE.md#presentation-and-style-loading).

WCAG 2.2 AA, responsive design, semantic HTML and Core Web Vitals are cross-layer quality targets. Automated checks cover specific requirements; they do not establish full accessibility conformance or field CWV compliance. See the [contrast policy](#contrast-policy) and [performance verification](WEB_APPLICATION_ARCHITECTURE.md#performance-regression-checks).

Preserve Jost, Noto Sans language fallbacks, all brand colors and Logo. The style references guide composition and typographic character; they do not supply replacement assets or font licenses. Geist provides visual references; Fluent 2 is limited to token architecture. Their component packages and fonts are not installed. Light, dark and system appearance are supported. Search and a command palette are not implied by adoption.

### Design style references

- [Pentagram](https://www.pentagram.com/) and its [PayPal identity](https://www.pentagram.com/work/paypal): brand composition and typographic direction.
- [Swiss Themes](https://swissthemes.design/) and [Bauer Types](https://bauertypes.com/): supplementary layout and type references.
- Lineto's [Supreme](https://lineto.com/typefaces/supreme) and [PayPal typography](https://lineto.com/bespoke/paypal): type and wordmark references.
- [Jost](https://indestructibletype.com/Jost.html): the site's retained typeface.

### Decision authority and brand adaptations

Geist is the primary visual reference for colors, spacing, grids, shapes and elevation. Typography follows the owned Perfect Fourth scale. Fluent 2 contributes only token architecture: global primitives, semantic aliases and component consumption. It does not determine palette values, typography, spacing, grids, breakpoints, geometry, motion or content design. The site retains its owned palette and components. This is the site's integration of these references, not an official combined standard.

Apply decisions in this order:

1. Preserve verified content, service contracts and the explicitly retained brand assets; meet the relevant accessibility requirement.
2. Use Geist to choose a coherent visual treatment for the task.
3. Express that treatment through the shared tokens and owned component variants, following Fluent 2's global/alias structure.
4. Adapt shadcn defaults to those decisions. Add Base UI behavior only where an interactive primitive needs it.

| Brand adaptation | Site rule and reason                                                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Font             | Keep Jost and the locale-specific Chinese fallbacks. Financial figures use tabular numerals; Geist Sans or Mono is not required.                                                                       |
| Palette          | Retain all brand and financial colors, including the two original grays. Use Geist neutral roles with the documented brand overrides; retain black primary text and inverse surfaces.                  |
| Geometry         | Retain square financial surfaces, pill actions and the editorial container. Standard fields and the memo grid use 6px corners; floating menus use 12px.                                                |
| Typography       | Use the owned Perfect Fourth treatments with Jost, rem units and a 1rem minimum. Tracking is 0; weights are 400/700; leading is 1.15 for Display/Headline/Title and 1.5 for Label/Body across locales. |
| Features         | References do not imply a dashboard, authentication, search or a command palette. Add a feature only for a defined user need.                                                                          |

A new treatment needs a reason, an owning role or component variant, and verification in its real context. Do not import another visual preset to solve an isolated component problem.

### Light, dark and system appearance

Use `next-themes` with `data-theme`, the `mfa:theme:v1` preference key and system appearance by default. Desktop Header and mobile Menu each expose the same single `ThemeToggle`: an owned shadcn/ui Button with Lucide Moon (switch to dark) or Sun (switch to light), a localized accessible action name and a 48px target. The next state uses `resolvedTheme`, so the first click reverses the actual system-resolved appearance. Explicit light/dark choices persist across reloads, routes and languages; there is no System option in the control. Until hydration, render a disabled, stable SunMoon placeholder labeled Appearance. `SiteDocument` owns one shared provider inside the body and sets the document theme before hydration. Suppress hydration warnings only on the root HTML attribute changed by that bootstrap.

`tokens.css` owns explicit light aliases, `data-theme="dark"` overrides and `color-scheme`. A system-preference media query applies dark aliases only when no explicit theme is set, including without JavaScript. Explicit aliases avoid build-time `light-dark()` transformations that can leave manual Dark selection using light colors. Keep brand primitives unchanged. Dark page surfaces use black and `#141414`, text uses white and lighter neutral roles, and links/focus use Bright Blue. Financial return aliases use readable dark-mode variants. Test rendered colors in production builds with Chromium and WebKit; checking the theme attribute alone does not establish that the appearance changed.

Bright Blue brand regions use the shared `brandSurface` treatment with explicit local semantic aliases and a light color context so their text, controls and focus retain the established dark lettering. The Footer stays black with white text. Footer Subscribe retains black text on its white pill. Header and Menu text wordmarks use semantic foreground colors while keeping the blue period. Logo geometry, typography, spacing and content remain independent of theme selection.

Verify system changes, explicit overrides, persistence, keyboard button operation, Menu focus/scroll behavior, three languages, 320/390px phones, desktop and 200% text. Check text contrast at 4.5:1 and control/focus boundaries at 3:1 on actual surfaces, including hover and selected states. No theme transition animation is added. Full desktop navigation starts at 1280px so the Appearance control fits without overlapping the Logo; narrower layouts expose it in the Menu.

### Token structure

`tokens.css` remains the single source of values. Global primitives such as brand colors, spacing and motion feed semantic aliases such as `--surface-brand`, `--text-brand`, `--interactive-accent` and `--chart-benchmark`; Tailwind references the same aliases. This follows Fluent 2's global/alias separation. Raw neutral values and brand colors feed surface, border, text and interaction roles; retaining useful token names avoids unnecessary churn. Component roles may have distinct aliases even when their current values match.

`--shadow-popover` owns Geist's Menu material shadow; `--shadow-surface` owns its Base surface outline. `--width-content` owns the 1312px container maximum. Shape aliases distinguish pill actions (`--radius-action`), 6px fields (`--radius-field`), square financial surfaces (`--radius-surface`) and 12px popovers (`--radius-menu`). Do not convert chart coordinates or measured animation values into fixed design tokens.

### Color and stroke ownership

Follow Fluent 2's [global and alias layers](https://fluent2.microsoft.design/design-tokens) for structure only. The site defines its own color roles and values. Keep raw palette and alpha values in `tokens.css`; website components consume semantic aliases. Centralize derived `color-mix()` expressions there as well. Preserve existing values and justified differences rather than assigning one tint to every interaction.

| Role                         | Tokens and use                                                                                                                                                                                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decorative separators        | `--border-subtle`, `--border-strong`, `--border-inverse-subtle`; section, table and Footer dividers. They do not identify inputs or keyboard focus.                                                                                                                          |
| Control boundaries           | `--border-control`, `--border-control-inverse`, consumed through `--field-*`; identify editable controls on light and inverse surfaces.                                                                                                                                      |
| Brand and validation strokes | `--border-brand` for editorial/status accents; `--border-error` for the existing error stroke. Financial return colors remain separate from validation status.                                                                                                               |
| Focus and touch feedback     | `--focus-ring-on-light`, `--focus-ring-on-dark`, and the existing Medium Blue `--focus-ring-brand` treatment for Menu/Support. `--focus-ring-color` inherits the surrounding surface's focus treatment. Touch feedback and persistent keyboard focus remain separate states. |
| Data decoration              | `--allocation-divider`, `--allocation-swatch-border`, `--chart-axis-border` and `--text-chart-secondary` preserve the existing alpha treatments.                                                                                                                             |
| Interaction surfaces         | `--holding-row-hover-surface`, `--portfolio-row-hover-surface`, `--memo-*-hover-surface`, `--memo-card-pressed-surface`, `--memo-card-touch-pressed-surface` and `--support-option-*` preserve component-specific hover, press and selection treatments.                     |

Equal current values do not imply equal responsibilities. Memo cards retain their existing 22% tint while hovered and pressed together; the separate pressed alias does not change selector precedence. Selection persists independently of hover; focus remains visible independently of selection. Disabled controls retain their existing opacity/cursor/border treatment; do not invent unused state colors or change their behavior during token maintenance. These aliases do not certify every existing contrast combination as WCAG AA.

React Email keeps literal inline colors for email-client compatibility. Standalone error documents and metadata/brand artwork also keep their independently rendered color values. These exceptions must not become a reason to hardcode website component colors.

`src/app/styles/color-roles.spec.ts` checks rendered colors and stroke roles across all three languages, including component hover/press/selection and touch variants. Existing material and focus tests cover control boundaries, modal behavior and focus contrast.

### Component token contract

Component roles are aliases within the same token system. `--action-primary-*`, `--action-contrast-*`, `--action-inverse-*` and `--action-quiet-*` describe action appearance and feedback. Button and ButtonLink consume the same variant definition. `--field-*` describes standard input, textarea and native-select surfaces; inverse fields have their own text, border and placeholder roles.

Change a shared role in `tokens.css` to update all consumers. Keep background, foreground, border and hover colors compatible as a set. Use `variant` for an existing appearance and `className` for placement or sizing, rather than overriding a shared component's colors from its caller. Preserve justified variants such as the Footer's inverse form. Light and dark aliases share the same component structure and state rules.

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

Home's performance comparison uses a named inline-size container. Below 64rem of available content width, its chart and headline figure stack vertically. The rem-based container query responds to enlarged root text as well as available width, retaining two columns only when the chart and complete headline figure have enough room. Keep the percentage's type size and value intact; do not hide horizontal overflow to compensate for insufficient column width.

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

### Available shadcn components

`components.json` selects the official `base-nova` registry. Existing Alert, Button, Dropdown Menu, Field, Input, Native Select, Sheet, Sidebar, Skeleton and Textarea retain their owned contracts. Added registry components use the same `cn` helper, Jost typography roles, semantic palette, focus/motion tokens and `data-theme` appearance. Registry defaults must not replace the existing page designs or Button variants.

| Module                                                                          | Use                                                                                                                                                                |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `alert-dialog`, `collapsible`, `navigation-menu`, `radio-group`, `toggle-group` | Base UI interaction primitives; provide accessible names and required title/description composition.                                                               |
| `card`, `table`                                                                 | Server-compatible structural primitives. Cards retain square surfaces; tables retain native semantics and container scrolling.                                     |
| `chart`, `line-chart`                                                           | Recharts v3 composition with shared tooltip and legend content. Supply labels, series configuration and localized empty-state text; null observations remain gaps. |
| `data-table`                                                                    | Render a feature-owned TanStack Table v9 instance. The feature chooses models, columns and state, and supplies its accessible name and empty-state text.           |
| `toast`                                                                         | Base UI toast manager and optional `Toaster`. Supply localized `closeLabel` and `regionLabel`; keyboard access uses the primitive's F6 behavior.                   |

Page composition uses these building blocks:

- Home and the memo index use Card Header, Content, Description and Footer inside each real article link. Planned research remains a noninteractive article. The heading level follows its page placement.
- Portfolio follows the shadcn/ui Data Table guide: a feature-owned TanStack sorted row model and a shared Table-based renderer. Holding rows and totals also use TableRow, TableHead, TableCell and TableFooter; the guide is a composition pattern, not a separately installed DataTable primitive. Native column/row headings, `aria-sort`, mobile sorting, return colors and totals remain available; sorting never changes financial calculations. Mobile sorting uses NativeSelect and Button; column sorting uses Button with the existing aria-sort state.
- Performance groups each interactive Recharts Line Chart in a square Card, with localized Tooltip and no static chart or mode switch. The monthly table uses shadcn/ui Table, Header, Body, Row, Head, Cell and Caption inside a mounted Collapsible panel; opening the panel requires JavaScript. Table containerProps provides the single named, keyboard-focusable horizontal/vertical scroll region, preserving sticky headers and row/column scopes without nested scroll containers. Both series remain visible, with Portfolio solid and SPY dashed. There are no custom series or data-point buttons. Preserve pointer/touch/arrow-key comparison and gaps for null observations.
- Contact, standard Subscribe and Support forms share a Card-based Form Panel with responsive padding. Footer Subscribe keeps its inverse surface. Field errors and asynchronous results remain inline, with each form owning its submission state. Native payment radios and POST retain the no-JavaScript path.
- Header composes real desktop links with Navigation Menu and keeps its Base UI Dropdown Menu and Sheet, including navigation recovery parameters and the existing modal/focus lifecycle. Desktop and mobile appearance use the same Button-based light/dark toggle with Lucide icons and next-themes. Mobile language options use the shared shadcn/ui Collapsible (Base UI Root, Trigger and Panel) inside the Sheet. Base UI owns expanded state, ARIA relationships and panel visibility; CSS owns the height transition and respects reduced motion. The language group and appearance button retain a 4px gap.

Memos indexes and monthly tables use the shared AnimatedDisclosure composition over shadcn/ui Collapsible. Base UI owns state, ARIA and panel visibility; CSS owns reversible height transitions and reduced-motion behavior. Contact uses Alert Dialog before clearing an unsent message and its locale-specific saved draft; cancellation preserves both. Sending locks the clear control. Memo articles use an instance-local Toast manager for copy-link success or clipboard failure, with localized notifications and keyboard dismissal. Copying excludes query parameters and fragments. Provider results remain inline rather than being duplicated in toasts. Import Recharts and TanStack Table only from components that need them; do not introduce a global component barrel or mount a toast provider on every page. Use [Chart](https://ui.shadcn.com/docs/components/base/chart), [Data Table](https://ui.shadcn.com/docs/components/base/data-table) and [Toast](https://ui.shadcn.com/docs/components/base/toast) for upstream composition examples.

Chart configuration accepts trusted, authored color tokens; it is not a reader-input format. Map shadcn color aliases through `tokens.css`, keeping explicit/system dark mode consistent. `next-themes` remains the single appearance mechanism. Respect reduced motion and use the existing Button's `primary`, `contrast`, `inverse` and `quiet` variants when composing new primitives.

Shared components provide a fixed set of variants:

| Component                                        | Contract                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Container`                                      | Shared maximum width and responsive gutters; backgrounds belong to its outer section.                                                                                                                                                                                                    |
| `PageHero`                                       | Standard, portfolio, performance or support geometry; localized content remains with the page.                                                                                                                                                                                           |
| `Button` / `ButtonLink`                          | Primary, contrast, inverse or quiet surface; regular, small or text size. Native button and link semantics remain distinct. Button disabled feedback uses standard, muted or muted-busy variants, preserving preferences opacity without parent overrides.                               |
| `FormField`, `Input`, `Textarea`, `NativeSelect` | Label association, visible or hidden label, standard rounded or inverse compact fields. Business validation and submission stay with the feature.                                                                                                                                        |
| `Alert`                                          | Standard or inverse typography, reserved space and polite live feedback; an explicit alert role supports assertive announcements. Compose optional AlertTitle, AlertDescription and AlertAction without changing existing appearance. Callers associate labels/descriptions when needed. |
| `PortfolioMetric`                                | Plain, highlight, brand or paper financial surfaces, shared typography and surface-specific note colors.                                                                                                                                                                                 |

Use Tailwind for layout and ordinary states, and CSS Modules for complex structures and motion. Both use the same tokens. References: [Next.js CSS](https://nextjs.org/docs/app/getting-started/css#recommendations), [Tailwind themes](https://tailwindcss.com/docs/theme), and [Preflight](https://tailwindcss.com/docs/preflight).

Choose tokens by purpose. CSS defines values and breakpoints. Keep sizing, spacing and overflow predictable.

- Use size-first Perfect Fourth text roles in rem units. Responsive roles switch approved sizes; do not interpolate metrics with clamp() or invent a treatment to fit one screenshot.
- Choose heading levels by document structure, independent of visual size. Memo cards use H2 on the index and H3 on Home, including placeholders. Each disclaimer section has an H2 in every locale, even without an introductory lead.
- Use tabular figures for financial comparisons.

### Typography roles

The site uses the approved, production-derived Perfect Fourth scale: **16, 21, 28, 38, 51, 67 and 90px**, expressed in rem at a 16px root. Calculate each step independently from `16 × (4/3)^n` and round once. Semantic text roles use only these sizes; the shared mobile wordmark retains its documented 18px brand exception. [Typography specification](TYPOGRAPHY_PROPOSAL.md) retains measured provenance and the page assignment matrix.

Use size-first names: Large / Medium / Small + Display / Headline / Title / Label / Body. Utilities such as `text-large-display` and tokens such as `--font-size-large-display` live in `tokens.css`. Only 13 treatments are needed; Small Title and Small Label are not defined. Medium Body and Small Body intentionally share metrics while identifying different uses.

All tracking is **0**. Weights are **400 and 700 only**. Display, Headline and Title use **1.15** leading; Label and Body use **1.5**. These rules apply to English, Traditional Chinese, Simplified Chinese, every viewport and every interaction state. Inline emphasis uses 700 and inherits its surrounding size and leading. Keep Jost before the locale-specific Noto Sans fallback; English routes must not load Chinese fonts. The shared text wordmark uses Jost 700, zero tracking and 1.15 leading, with 21px desktop and 18px mobile as a brand exception.

| Role              | Desktop size / line height | Mobile size / line height | Leading | Weight | Tracking | Use                                                                         |
| ----------------- | -------------------------- | ------------------------- | ------- | ------ | -------- | --------------------------------------------------------------------------- |
| `Large Display`   | 90 / 103.5                 | 51 / 58.65                | 1.15    | 700    | 0        | Home and memo-article H1; featured return                                   |
| `Medium Display`  | 67 / 77.05                 | 51 / 58.65                | 1.15    | 700    | 0        | Summary market value, returns and Support amounts                           |
| `Small Display`   | 38 / 43.7                  | 38 / 43.7                 | 1.15    | 700    | 0        | Chart-ring figures                                                          |
| `Large Headline`  | 67 / 77.05                 | 38 / 43.7                 | 1.15    | 700    | 0        | General page H1 and major Home sections                                     |
| `Medium Headline` | 51 / 58.65                 | 38 / 43.7                 | 1.15    | 700    | 0        | Disclaimer H1                                                               |
| `Small Headline`  | 38 / 43.7                  | 28 / 32.2                 | 1.15    | 700    | 0        | About sections, holdings section and article H2                             |
| `Large Title`     | 28 / 32.2                  | 28 / 32.2                 | 1.15    | 700    | 0        | Memo cards and form-panel headings                                          |
| `Medium Title`    | 21 / 24.15                 | 21 / 24.15                | 1.15    | 700    | 0        | Charts, article H3, utility-page H1, Footer headings and holdings summaries |
| `Large Label`     | 16 / 24                    | 16 / 24                   | 1.5     | 700    | 0        | Field labels, table headings, category labels and all CTA actions           |
| `Medium Label`    | 16 / 24                    | 16 / 24                   | 1.5     | 400    | 0        | Sidebar, navigation, selectors and secondary controls                       |
| `Large Body`      | 21 / 31.5                  | 21 / 31.5                 | 1.5     | 400    | 0        | Hero and short editorial introductions                                      |
| `Medium Body`     | 16 / 24                    | 16 / 24                   | 1.5     | 400    | 0        | Article and Disclaimer prose                                                |
| `Small Body`      | 16 / 24                    | 16 / 24                   | 1.5     | 400    | 0        | Card copy, instructions, table figures, dates, notes and feedback           |

The table lists desktop and mobile values. Below 50rem use mobile sizes. From 50rem to below 75rem use Large Display 67px; Medium Display, Large Headline and Medium Headline 51px; other roles use desktop sizes. At 75rem use desktop sizes. Breakpoints change size only; leading, weight and tracking stay fixed. Layout breakpoints remain independent.

Home uses Large Display for its H1 and featured return, Large Headline for major sections, and Large Body for introductions. General page heroes use Large Headline. Memo article heroes use Large Display; Disclaimer heroes use Medium Headline; article H2 uses Small Headline and H3 uses Medium Title. Email Preferences uses Large Headline like other general page heroes. Subscription confirmation retains Medium Title through PageHero's finite title-role variant. Memo/form headings use Large Title. Support amounts use responsive Medium Display. Home, Portfolio and Performance summary KPIs use Medium Display with a fixed 51px (3.1875rem) size at every viewport, retaining 1.15 leading, weight 700 and zero tracking; ring values use Small Display; tables use Small Body and Large Label. Navigation uses Medium Label; all CTAs use Large Label (16px/24px, weight 700), including primary buttons, secondary text actions, Email Preferences and error recovery links. Ordinary navigation and prose links retain their existing roles.

Footer Quick Links use 36px minimum-height rows with no grid gap, retaining 16px/24px Medium Label text. This compact navigation treatment is independent of the 48px mobile Sidebar controls.

Financial values use tabular numerals and can exceed nearby headings. Do not impose a smaller-than-heading invariant. Keep complete values and unchanged colors, signs, units and precision. Home and Performance summaries stack below 72rem of their financial-summary container; Portfolio stacks below 72rem of its inner Hero summary. Reflow columns first. If a full value still cannot fit at enlarged text sizes, its named, keyboard-focusable region scrolls horizontally without shrinking, truncating or wrapping the number. Show a localized horizontal-scroll hint only while a summary value overflows, associate it with the scroll region, and make only overflowing regions keyboard-focusable. The page itself must not overflow. Typography does not alter document heading semantics.

Preserve the existing component surfaces, page grids and CTA placement; apply the vertical rhythm defined below. Investment memo article prose, summary, language notice and disclaimer share the title’s 1120px maximum width and left alignment within the page container; on smaller screens they fill the available container width. Controls retain touch-target padding independently of the shorter text line box. Chart axis labels use Small Body; the CSS axis wrapper compensates for the line height to keep labels centered on SVG ticks.

`typography-roles.spec.ts` verifies computed role metrics, scale membership, locales, colors, focus and reflow. `financial-type-hierarchy.spec.ts` checks full financial values at regular and enlarged text sizes without the former subordinate-value rule. Test against the specification, not implementation class strings.

### Neutral colors and materials

The owned palette defines Brand (`--blue-deep: #0d288b`, `--blue-medium: #3d8af7`, `--blue-bright: #7dcbfa`), Neutral (`--black: #000000`, `--white: #ffffff`, `--gray-deep: #cccccc`, `--gray-medium: #eef0f2`, `--gray-bright: #f5f7fa`) and Financial (`--market-positive: #007c66`, `--market-negative: #bf2a2c`, `--market-neutral: #000000`) primitives. Light-mode secondary text uses the independent `--neutral-900` semantic source to remain readable; Gray Deep is a light neutral primitive and must not be used for small text on white. Dividers and chart grids use Gray Medium, and Hero and secondary bands use Gray Bright. The existing ten-step Geist component neutral scale and dark-mode semantic overrides remain separate from these owned primitives.

Use solid gray for borders and translucent black for material shadows. Standard fields use white, 6px corners and Gray 800 borders to meet the non-text contrast target; do not use a faint decorative surface outline as their only boundary. Brand-colored selection, hover and focus states remain independent of the neutral palette. Black primary text, the two original grays, all existing brand/financial colors and the black Footer are explicit exceptions.

[Geist Materials](https://vercel.com/geist/materials) combine fill, outline, shadow and radius:

- The memo grid uses the Base surface: white cards, 6px corners and the single shared outline. Interior separators use solid gray. Corners are applied to the cards without clipping the grid, preserving keyboard focus outlines. It has no extra CSS border or raised shadow.
- The language popup uses Menu material: white fill, 12px corners and the official outline plus three neutral elevation layers. Its Positioner owns stacking. Do not add a second border around the material's shadow stroke.
- Standard form fields use the accessible border adaptation above. Footer fields remain inverse pills.
- Financial blocks remain square and flat. Full-screen mobile navigation remains edge-to-edge on its theme-aware primary surface, without a rounded floating frame. Pill CTAs and the black Footer preserve their brand treatment.

Values were checked against the official Geist stylesheets on 2026-10-15. `tokens.css` owns the implementation; no Geist font or component package is required. Do not add unused tooltip or modal materials for components the site does not render.

Apply a complete type treatment rather than repeating its utilities. Keep color, opacity, spacing and heading semantics independent. Use Large Label for table labels; inline emphasis inherits size and leading with weight 700. Never override tracking. CSS Modules use the same source tokens.

Register new size names in `src/lib/utils.ts` so class merging distinguishes sizes from colors. Test computed styles and reflow rather than class strings. Logo checks remain in `brand-logo.spec.ts`.

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

Portfolio return text uses `--text-return-positive` (`--market-positive`, `#007c66`) and `--text-return-negative` (`--market-negative`, `#bf2a2c`). These are the user-approved financial colors, superseding the previously sampled Yahoo Finance colors. Neutral financial values use the normal text role, black in light mode; dark mode retains accessible light text and its existing positive/negative overrides.

Support error feedback uses `--border-error` (`#FF0000`) for its left border. This non-text error role is independent of financial returns; error message text retains its existing color.

Known normal-text contrast gaps are recorded in the [contrast policy](#contrast-policy).

Use Jost for Latin text and numbers, Noto Sans TC for Traditional Chinese, and Noto Sans SC for Simplified Chinese.

Header, drawer and Footer render the shared text BrandLogo, including its blue period. SVG/PNG files remain for icons, sharing and downloadable brand assets; they are not used for the navigation wordmark. Brand masters are [`public/icon.svg`](../public/icon.svg) and [`logo.svg`](../public/logo.svg), with PNG copies beside them. Preserve the square icon, single-line wordmark and colored period. Generate icons and social images from these masters. Keep App Router icon and Apple icon files aligned with the icon master; sharing metadata uses [`public/og-logo.png`](../public/og-logo.png). Old `/images/` URLs permanently redirect to root assets.

Preserve information and action priorities at every width.

- Bound mobile title sizes and allow emergency wrapping for enlarged or unbreakable text. Desktop line breaks must not isolate words or split short Chinese phrases on mobile.
- Align related form fields unless a visible container explains an inset. Contact and Preferences use the shared 6px field treatment; compact Footer fields are pill-shaped.
- Check all three languages, root font sizes up to 200%, long translations and changed content. The text Logo must wrap within its available width without colliding with navigation.
- Allow local values for chart geometry and optical adjustments when shared spacing tokens do not fit.

### Contrast policy

Use `--interactive-accent` (Deep Blue) for normal-size interactive text. Medium Blue remains a brand primitive for decorative details, surface-appropriate non-text indicators and the dashed benchmark line; it is not a normal-text color on white. `--surface-selected` provides a pale blue surface for desktop navigation and language states. Use Deep Blue text on that surface.

Chart disclosures and scrollable monthly-data regions use the same theme-aware focus alias as other controls. The baseline focus outline consumes `--focus-ring-color`, which follows `--interactive-accent`: Deep Blue in light mode and Bright Blue in dark mode. The black Footer sets the inherited role to `--focus-ring-on-dark` (Bright Blue). Inputs retain their explicit surface variants. Check the outline against its adjacent surface at a minimum of 3:1: Medium Blue on Bright Blue is insufficient. Forced-colors mode continues to use the system Highlight color.

Validate normal-size text at 4.5:1 after compositing opacity and non-text indicators at 3:1 where required. KPI notes retain their value's color at 0.8 opacity. Footer secondary text uses dedicated inverse aliases, with 0.84 and 0.78 white opacity on black. Disabled controls have separate feedback and must not acquire enabled hover states.

Tests cover these specific combinations and input states. They do not establish full WCAG 2.2 AA conformance. Maintain keyboard and forced-colors focus indicators and verify actual surfaces when introducing a variant.

### shadcn/ui components

The project owns its customized [shadcn/ui](https://ui.shadcn.com/docs) source. `components.json` targets the `base-nova` registry, Tailwind v4, `@/*` imports and `src/components/ui/`. The registry selects Base UI source for additions. Owned tokens, component variants and brand adaptations define the rendered design; a registry preset is not a second visual system. `cn` in `src/lib/utils.ts` merges classes; Button variants use `class-variance-authority`. Import primitives directly. `ButtonLink` shares Button styles and preserves link semantics without introducing a client boundary for ordinary links.

Use the Button variants and sizes listed above. The quiet text variant preserves the Preferences unsubscribe treatment. Fields keep `standard` and `inverse` styles; Textarea and NativeSelect share the input appearance. Disabled fields retain text colors and use a dashed border with a not-allowed cursor. Native controls keep refs, labels, validation and submission without a client boundary.

`FormField` accepts a feature-owned error message, preserves existing descriptions and associates the error through `aria-describedby` and `aria-invalid`. Features own validation rules and focus decisions; ordinary fields retain their native behavior and appearance.

To add a primitive:

1. Inspect its source and dependencies with `npx shadcn@latest view <component>`.
2. Add only what is needed with `npx shadcn@latest add <component>`.
3. Review the full diff. Map colors, focus, disabled and motion states to semantic tokens; `accent` means the accessible Deep Blue interaction role.
4. Preserve Jost, the reset and customized primitives. Add a client boundary or dependency only when the component needs it.
5. Verify rendered states, native forms and navigation. Upstream defaults do not define this site's design.

Desktop language selection uses shadcn/ui composition over Base UI `Menu`. Put linked locale items in `DropdownMenuGroup`, preserving `hrefLang`, current-language hints and validated recovery parameters. Base UI owns keyboard entry, item navigation and dismissal; the header preserves explicit Tab and outside-focus exits without moving focus away from the destination control. `render={<Link ... />}` keeps each item a real link. The positioner preserves viewport-fixed anchoring and owns popup stacking; the popup uses Base UI's available-height variable.

Mobile navigation uses `Sheet` over Base UI `Dialog` for naming, focus containment, background isolation and scroll locking. The existing `closed → opening → open → closing` phase remains the only application state source: keep the modal open through the closing animation. Use Base UI's `initialFocus` and `finalFocus` for the existing close-control entry and route-aware return behavior. Render the visible close button through `SheetClose`; the replaced opening trigger is inert until the modal closes. Do not add a second focus trap, body lock or background `inert` controller. The language disclosure uses shadcn/ui Collapsible.

Inside the Sheet, compose primary links with `SidebarMenu`, `SidebarMenuItem` and `SidebarMenuButton render={<Link ... />}`. These are a menu-only shadcn/ui composition using Base UI `useRender`, customized for this site's full-width mobile navigation. `SidebarMenu` retains an explicit list role for Safari when the reset removes list markers. Pass one route-derived active value to `isActive` and the link's `aria-current`; preserve real Next.js links, wrapping, Tab order and navigation dismissal. Sheet remains the state owner; the menu subset has no provider, collapse state, shortcut or tooltip. It does not implement the full upstream Sidebar API.

`FieldGroup` groups controls. Contact, subscription and Preferences forms use `contents` to preserve the native form's grid, event target, validation and control placement; ordinary vertical groups can use `stack`.

`FormField` connects `Field` and `FieldLabel`. `NativeSelect` keeps the platform picker. `Alert` provides shared result styling and live feedback. `ServiceLoading` pairs localized busy text with static, decorative `Skeleton` placeholders hidden from assistive technology.

UI primitives own stacking through `--layer-navigation`, `--layer-modal` and `--layer-popover`. Header composition controls responsive visibility without duplicating Sheet positioning or stacking.

## UX tasks and acceptance

Identify the reader, their task and the information needed at each decision using the site’s content-design rules. Use Vercel's interface guidelines for input behavior, focus, loading and errors. Use Cieden as a reference for task analysis, information architecture and usability checks. The tasks below describe the site's current intent; they are working assumptions, not findings from a user-research study.

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
- Shared Button and ButtonLink opt into `TouchPressFeedback` with `data-touch-feedback`. One delegated passive pointer listener supplies `data-touch-pressed` while a primary touch is held; release, cancellation, movement, scrolling, page hiding and cleanup clear it. Native click, navigation, focus and form behavior remain unchanged, and the controls remain server-compatible. CSS uses the existing press tokens and reduced-motion override. Menu feedback retains its separate ownership because it transfers between trigger and close controls. Verify trusted touch holds in Chromium, tap/release in both engines, and cancellation events separately; mouse presses do not establish touch behavior.
- Give loading, success, failure, disabled, and retry states clear meanings. Forms should prevent duplicate submissions, announce outcomes with text and live regions, and clear stale outcomes when the user edits again.
- Use motion to explain state and spatial changes. Hover keeps control geometry stable; a held press uses a subtle 0.985 scale with 100ms feedback. Standard feedback uses 150–200ms transitions, larger state changes 250–300ms, and the existing mobile panel direction and icon reversal remain intact. Expanding and closing should support repeated input, interruption, and reversal while keeping visuals, focus, interactivity, and scroll state synchronized.
- Preserve full function and necessary feedback under `prefers-reduced-motion`. Focus outlines should remain visible in standard and forced-colors modes; disabled states should not move.

Avoid unnecessary geometry queries in interaction handlers. Cancel touch feedback from the known movement distance before reading element bounds; small movements still use current bounds so moving controls remain accurate. Reduced-motion disclosures settle immediately without measuring an unused animation height. These changes reduce opportunities for [forced reflow](https://developer.chrome.com/docs/performance/insights/forced-reflow); they do not establish that an unattributed Lighthouse reflow came from these handlers.

Subscription forms retain standard Contact and inverse Footer treatments. Their independent instance state and delivery contracts are documented in [Integrations](INTEGRATIONS.md#subscription-entry-points).

Contact draft and retry recovery belong to the [Contact workflow](INTEGRATIONS.md#contact-draft-recovery).

Choose focus tokens according to light or inverse form surfaces. Preferences retain their own disabled opacity. Reserve space for status messages and allow long errors to wrap. After a programmatic field reset, keep the success message visible until the user edits again.

### Motion tokens and timing

Motion is a site-owned visual decision. Movement communicates state and relationships and remains local to the interaction. Existing duration and curve values were originally selected from Fluent UI references; that historical provenance does not give Fluent 2 authority over motion. Retain the current values unless a visual change is requested. Only the global-to-semantic token structure follows Fluent 2.

Global durations are 50, 100, 150, 200, 250, 300, 400 and 500ms. `--duration-*` and `--curve-*` are foundation values; components consume `--motion-*` aliases. Keep the same timing at desktop and phone breakpoints. Existing `fast`, `base`, `medium` and `slow` aliases resolve to 150, 200, 250 and 300ms.

| Purpose                                 | Duration alias                                 | Value       | Curve                           |
| --------------------------------------- | ---------------------------------------------- | ----------- | ------------------------------- |
| Held press                              | `--motion-duration-press`                      | 100ms       | Easy ease                       |
| Color, border and focus feedback        | `--motion-duration-fast` / `base`              | 150 / 200ms | Easy ease                       |
| Dropdown, dialog and toast entry        | `--motion-duration-enter`                      | 250ms       | Decelerate max                  |
| Dropdown, dialog and toast exit         | `--motion-duration-exit`                       | 150ms       | Accelerate max                  |
| Full-screen mobile panel entry / exit   | `--motion-duration-panel-enter` / `panel-exit` | 300 / 250ms | Decelerate max / Accelerate max |
| AnimatedDisclosure expansion / collapse | `--motion-duration-expand` / `collapse`        | 300 / 250ms | Decelerate max / Easy ease      |
| Icon change and touch-ring release      | `--motion-duration-icon` / `feedback`          | 200ms       | Decelerate max / Easy ease      |

`--motion-ease-standard` uses the retained curve `(0.33, 0, 0.67, 1)`; `emphasized` uses the retained curve `(0.1, 0.9, 0.2, 1)`; `exit` uses the retained curve `(0.9, 0.1, 1, 0.2)`. `--motion-ease-linear` is reserved for constant rotation and the staged Menu/X rotation. Tailwind's default transitions also resolve to the shared fast duration and standard curve. A continuous loading spinner takes one second, derived from two ultra-slow intervals; notification lifetime and network timeouts are not animation durations. Skeletons stay static and financial lines do not animate between values.

Do not add route slides, list staggering, or idle decorative motion. The mobile panel keeps its directional entry/exit, with text grouped rather than staggered. Base UI owns popup presence and Collapsible state, ARIA and panel visibility. CSS owns ordinary feedback and Collapsible height transitions; AnimatedDisclosure uses the expansion/collapse aliases above, while the mobile language Collapsible uses the base duration and standard curve. Web Animations API owns the mobile Sheet’s measured panel and icon transitions. Never let both animate the same property.

Reduced motion completes JavaScript layout transitions immediately, cancels running effects, removes press scaling and retains textual status/focus feedback. The existing CSS safety rule caps transitions and animations at 0.01ms with one iteration; components may disable their transitions entirely. This near-zero duration preserves lifecycle cleanup. Verify real browser timing, intermediate reversal, focus/scroll recovery and a live preference change; do not infer behavior from token definitions alone.

### Menu behavior

- The mobile panel slides left to open and right to close. Navigation fades early during closing; the icon rotates from X back to Menu.
- The language disclosure starts collapsed, shows the current language as its label, and lists only the other languages.
- Mobile Sidebar uses Geist-style compact rows: 16px Medium Label typography, minimum touch targets from `--size-touch-target` (48px by default), 4px row gaps, 6px corners and 18px decorative Lucide icons. Selected links use `--sidebar-selected-surface` and `--interactive-accent`: pale brand blue with Deep Blue text in light mode, and a darker blue-tinted surface with Bright Blue text in dark mode. Hover and pressed feedback use `--sidebar-hover-surface` and `--sidebar-pressed-surface` (Gray 100/200 in light mode and `#242424`/`#303030` in dark mode); transitions change color and background without shifting geometry. Idle touch hover resets clear the language summary background whether expanded or collapsed, preserving expanded text color, selection and keyboard focus. Keep the full-screen panel on `--surface-primary` (white in light mode, black in dark mode), the shared text wordmark, round close control and existing opening/closing animation.
- Mobile Sidebar links, language options and the disclosure summary share `--focus-ring-width` (2px by default) for the theme-aware interaction outline (Deep Blue in light mode, Bright Blue in dark mode) and its matching inset offset, distinct from the persistent selected surface. The bottom language group uses `--sidebar-language-surface`, 12px outer corners and the same theme-aware row feedback. Its Collapsible opens upward above a stationary trigger without moving the appearance toggle, and excludes the current language and retains keyboard operation and animated reversal. Header stays fixed inside the modal while navigation and language content share one scroll region. No extra navigation labels, separators or features are introduced. The desktop language menu supports Enter, Space, arrows, Escape and Tab; the mobile disclosure supports Enter, Space and Tab.
- The open close-button keeps Bright Blue fill and a black icon in both themes. Its `--border-strong` border is black in light mode and white in dark mode. Its keyboard ring stays visible under `:focus-visible`. Touch uses a separate blue ring and slight scale reduction; release and cancellation fade it, including short taps. The effect transfers from trigger to close control during opening.
- Reduced motion keeps the held touch ring, omits scaling and release animation, and may complete state changes immediately.

Use `closed → opening → open → closing` as the mobile menu's single state source. Keep Sheet open, the background isolated and scrolling locked until dismissal completes. Escape dismisses the Sheet; navigation links keep link semantics.

On entry, focus the close control. During closing, make the wordmark and navigation inert and move focus to the close control. On dismissal, restore the trigger with `preventScroll`; suppress restoration for an actual route change, but restore it for same-route dismissal. Check wrapping and overflow inside the drawer as well as across the page.

### Disclosure and animation ownership

Memos and monthly tables use shadcn/ui Collapsible through AnimatedDisclosure. Keep mounted server-rendered content hidden while closed. Opening requires JavaScript; do not describe this as native details or a no-JavaScript disclosure. Base UI synchronizes requested state, `aria-expanded` and panel visibility. CSS height transitions can reverse and respond to resizing; reduced motion disables them. Closing returns focus from the content to its trigger without scrolling.

Web Animations API owns panel and icon transforms; CSS Modules own separate color and touch effects. Completion, cancellation, resize, reduced-motion changes and unmount must leave no stale effects.

## Content and localization

Describe verified outcomes and give a clear next step. A confirmation request is not an active subscription; returning from Checkout does not prove payment status. [Integrations](INTEGRATIONS.md) defines consent and payment states.

Keep meaning, tone and action intent equivalent across languages; line counts and layout may differ.

The site’s content-design rules favor plain language, concise headings, descriptive links and clear next steps. Adapt tone to the reader's task and emotional context. Prefer active voice and address the reader directly in operational guidance. Use second person for reader tasks and named third person for author background. Preserve verified financial and legal meaning when simplifying copy.

### Content design workflow

Before writing, identify the reader, the task they want to complete and the information they need at that step. For an error or uncertain outcome, consider what may worry them and make the next safe action clear. Keep copy with the page or feature that owns the behavior.

| Context                | Content responsibility                                                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Research and portfolio | Explain the evidence, data date, calculation boundary and limitations. Define specialist terms where readers need them.                                                |
| Navigation and actions | Use short labels that name the destination or action. Instructions must work without relying on screen position, color or device.                                      |
| Subscription           | Distinguish requesting a confirmation email from confirming consent. Tell readers how to finish subscribing; do not describe a request as an active subscription.      |
| Preferences            | Explain the secure-link step and keep the same confirmation for every address. Do not reveal subscriber status or promise delivery that the response cannot establish. |
| Errors and payments    | State what is known, explain any necessary wait and give a safe next step. A failed request or return navigation does not prove a provider operation failed.           |

Use short sentences, familiar words and active voice. Prefer present tense for current states; use past or future tense when it accurately describes an event or next step. Keep a neutral, reassuring tone for errors. Avoid filler, blame, unsupported response-time promises and celebratory punctuation in routine feedback. Use headings and lists to support scanning. Decorative icons remain hidden from assistive technology; informative visuals need meaningful alternatives.

Review each change in all three languages. Check content against actual consent, privacy, financial and legal states. If a content decision requires a behavior change, implement and verify that behavior before publishing the promise. Search for the previous wording in tests and fixtures, update affected assertions, then verify the visible message, accessible name, next action and mobile wrapping. Provider writes stay mocked during routine verification.

### Capitalization and editorial conventions

The site owns content design: reader needs, plain language, tone, active voice and clear next steps. [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines#copywriting) owns capitalization: interface headings and buttons use Chicago Title Case; marketing pages use sentence case. This is an explicit project choice from Vercel's brand-specific guidance, not a universal accessibility rule.

| Context                                                                                      | Capitalization                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home, About, memo index and articles, Disclaimer; Contact and Support introduction/Hero copy | Sentence case for editorial headings and page-specific links/actions. Capitalize the first word, proper nouns and acronyms.                                                                        |
| Portfolio and Performance; preferences, confirmation and recovery screens                    | Chicago Title Case for interface headings and buttons. Use the same treatment for short field labels and table column headings. Explanations, status messages and data notes remain sentence case. |
| Contact, subscription and payment forms, including forms embedded in introduction pages      | Chicago Title Case for form headings, labels and buttons. Instructions and error/success messages remain sentence case.                                                                            |
| Shared Header, Menu and Footer                                                               | Consistent Title Case for visible navigation/control labels and section headings across routes. Accessible instructions such as “Open menu” remain sentence case.                                  |
| Transactional emails and source material                                                     | Email copy uses the site’s sentence-case convention. Preserve source quotations, names, technical identifiers and published source titles.                                                         |

Use Chicago's 18th-edition rules: capitalize the first and last words, nouns, pronouns, verbs, adjectives and adverbs. Lowercase internal articles (`a`, `an`, `the`), coordinating conjunctions (`and`, `but`, `for`, `or`, `nor`), `to` in infinitives and short prepositions used as prepositions. Capitalize prepositions of five or more letters; for example, `Get Help with a Payment` and `Connect Through Research`. [Chicago's capitalization clarification](https://www.chicagomanualofstyle.org/qanda/data/faq/topics/CapitalizationTitles/faq0035.html) explains the edition change.

Maintain capitalization in owned copy; do not use CSS `text-transform: capitalize` or a runtime word converter. Determine the phrase's grammar and context. A visual line break does not start a new sentence or title. Keep Modern Fundamental Analyst, Microsoft, Stripe, Rutgers University–New Brunswick Honors College, AI, ETF, TWRR and XIRR unchanged. Chinese content does not acquire English casing rules.

- Write directly to the reader with active voice and familiar words. Use the named author for factual biography rather than first-person narration. Do not assign the author's beliefs to the reader.
- Remove terminal periods from headings, buttons, labels and fragment lists in all languages. Keep punctuation in complete explanatory sentences, source quotations and actual questions.
- Use descriptive action and destination labels. Instructions must work without references such as “below”, “on the right” or “the blue button”.
- Express a failed or uncertain operation accurately and give the next safe action. A request, redirect or provider acknowledgment alone does not establish delivery, consent or payment completion.
- The content design rules govern wording and interaction decisions. Existing capitalization, voice, punctuation or workflow contracts are not exceptions by themselves. A changed workflow needs corresponding implementation and focused verification.
- Present dates, currency, percentages, and data timestamps clearly and consistently. Portfolio and performance data are timestamped snapshots and must not imply live quotes; see [portfolio data](WEB_APPLICATION_ARCHITECTURE.md#portfolio-data) for definitions.
- Preserve meaning, tone, and action intent in translation rather than matching words or line counts literally. Language differences may justify layout and content variants.

Describe research coverage accurately. Selected-company coverage does not imply a thesis or model for every holding. Keep research evidence, source quotations and publication dates accurate. Article headings follow sentence case; source paragraphs remain attributable to the published research. Put scope and language notices in the page's language, aligned with the article body and spaced apart from its first heading. Label publisher overviews when they are not the full report.

## Design verification

Accessibility, responsiveness, semantics, performance, maintainability and reliability apply across all five layers. Keep provider procedures, error recovery and release gates in the architecture and integration guides.

For field Core Web Vitals, target the 75th percentile separately for mobile and desktop: LCP at most 2.5s, INP at most 200ms and CLS at most 0.1. See [Web Vitals](https://web.dev/articles/vitals). Local Lighthouse budgets are regression checks with their own documented limits; TBT is not INP, and a passing lab run does not establish field compliance. Preserve the existing CI budgets unless a separate performance change justifies adjusting them.

Compare direct loads, client navigation and browser return in the same browser and viewport. Check computed styles, wrapping, focus and animation states. Do not bind behavior tests to class strings. WebKit emulation does not replace physical iPhone testing.

`src/app/_components/semantic-content.spec.ts` checks KPI note/value color equality, 0.8 opacity and at least 4.5:1 composited contrast across locales and desktop/mobile widths. `src/features/portfolio/performance-chart.spec.ts` checks benchmark contrast. `scripts/color-contrast.ts` composites transparency before calculating WCAG luminance.

Typography and layout tests stay beside their owners. Use [AGENTS.md](../AGENTS.md#verification-and-review) to select affected checks and the [test workflow](WEB_APPLICATION_ARCHITECTURE.md#test-workflow) for runner and CI details.

### Hero summaries and vertical rhythm

Summary containers from 40rem to below 72rem use three equal-width, equal-height stacked rows. Each row places its label and explanation on the left and the unchanged 51px value on the right, using a 2:3 internal grid, 24px vertical padding and a 136px minimum height. Rows grow together for longer translations. Below 40rem retain vertical card contents; from 72rem retain the three-column layout. These container thresholds also respond to text enlargement.

Disclaimer uses the same 48px title-to-description gap as other page Heroes at every breakpoint.

Page-level blocks use `--space-section-padding: 96px` for both top and bottom padding at every viewport width. Major content groups within a block use `--space-section-content: 48px`, including heading-to-content spacing and Hero introduction/actions-to-summary spacing. This is breathing room inside the existing background, not an added white band or external margin. Page blocks have no added vertical margins; adjacent background bands meet directly. Home Portfolio uses one padded grid: the section label sits 48px above the title, and the allocation card starts at the title row in the desktop right column and stretches to the bottom of the holdings list. On mobile, the card follows the holdings list with a 48px gap. About boundary panels own their padding individually.

This rule covers page heroes, Home content bands, About sections, Portfolio holdings, Performance charts and methodology, the memo index and article header/body, Contact Subscribe and message sections, Support and subscription preference/confirmation content. Header, Footer, dialogs, cards, form fields, KPI cells and article subsections retain their component-specific spacing; they are not independent page blocks.

Home, Portfolio and Performance contain their KPI summaries inside the Hero content container, aligned to the title edges rather than the viewport. Keep 48px between the introduction/actions and summary. Portfolio shows three summary cells (market value, total return and holdings), in one desktop row or stacked when the Hero summary is narrower than 72rem. Net Cost Basis remains in the underlying data and holdings calculations, not as a summary cell. Current Holdings uses the white primary surface. When its Hero summary is narrower than 10rem (for example, 320px with 200% root text), reduce cell inline padding to 4px; locally scroll a value that still exceeds the available width. Keep form status-message reserve space inside the form. About content and closing columns stack through 800px using their phone rules and at 801–1100px through the shared `--grid-editorial` override. Their named `about-page` container query also stacks them below 56rem of available page width, including when enlarged root text raises that threshold. Above 1100px, the 5:7 layout returns only when the container query does not require stacking. Footer text Logo uses a minimum 32px alignment box.

Footer subscription buttons use black text through a local `--action-inverse-text` override. Keep that color for idle, hover, keyboard focus and submitting states; other inverse buttons retain their existing treatment.

Current Holdings owns symmetric 96px vertical padding with no added vertical margins. Its heading and return note own only internal spacing. Holdings figures use Small Body; stock symbols and totals use Large Label on desktop and mobile. Keep tabular figures, native table semantics and sorting controls.

### Swiss Grid and editorial layout

The site owns its Swiss Grid / Editorial Layout: proximity, shared alignment, content-driven reflow and a 4px spacing base. All dimensions, proportions and responsive thresholds below are site decisions. Fluent 2 is referenced only for organizing these values into global and semantic design tokens; its Layout guidance is not a visual specification for this site.

| Layer               | Site rule                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Section boundary    | 96px top and bottom padding on all viewports; continuous background bands, no external spacer strips                     |
| Content groups      | 48px between headings and content, charts, and featured memos and their index                                            |
| Component internals | 8/12/16/24/32px for labels, fields, metadata and card padding; do not apply 48px to every child                          |
| Container           | 1312px maximum; 32px outer gutters, 16px at 800px and below; existing 720px intermediate container cap remains           |
| Column gutter       | `--grid-column-gap`: 32px desktop, 16px mobile; stacked major regions use a 48px row gap                                 |
| Editorial regions   | 5:7 (`--grid-editorial`), 4:8 (`--grid-sidebar`), or 8:4 (`--grid-feature`), subdivisions of a conceptual 12-column grid |
| Repeated modules    | Memo cards reflow 3/2/1 columns at 1101px/801px; 1px guide lines remain a deliberate modular-grid separator              |
| Manuscript          | Article title and body share a left-aligned 1120px maximum width                                                         |

Use the existing content-driven stacking thresholds: 800px for phone layouts, 1100px for editorial/sidebar regions and the intermediate Footer composition, and container queries for About, KPI and chart regions. A 12-column concept does not require twelve DOM wrappers. Regions use `minmax(0, ...)` so text can reflow. Keep source order meaningful when columns stack. Do not shrink typography to preserve columns. Header navigation retains its separate 1280px breakpoint.

Spacing belongs to one owner: section padding surrounds the complete block; a group gap separates peer groups; compact component spacing relates metadata and controls. The memo index owns 96px padding and uses exactly 48px between cards and disclosure. Memo cards have content-driven heights, with aligned footers, instead of fixed empty vertical space. Text and controls follow shared left edges; numeric table columns retain their deliberate right alignment. Preserve the approved typography rather than forcing its line boxes onto an artificial 4px baseline.

Memo cards use 48px outer content insets at every viewport width, including the footer bottom inset. Performance chart X-axis labels reserve a 48px axis height and a 16px tick gap to separate them from the lowest Y-axis label.

Submission buttons in Contact, Subscribe and Support pair their localized pending label with Spinner. The spinner is decorative beside that label and disables rotation for reduced motion. Empty renders genuine no-data states in DataTable and LineChart; it does not replace loading Skeletons or error boundaries.

Support amount cards progressively enhance native radio inputs to shadcn/ui RadioGroup after hydration. The group submits product_id, retains the server-selected product, and uses the existing fieldset lock and frozen retry payload. Native radios remain the no-JavaScript fallback; keyboard focus is visible on the full amount card.

Performance charts include a black 1px dashed reference line at 0% (6px dash, 4px gap), using `--chart-reference`: black in light mode and `#cccccc` in dark mode. The reference extends the Y-axis domain when needed and does not change the return data or series styles.

Support amounts use Medium Display, (51px mobile, 67px wide desktop, weight 700); summary KPIs instead remain 51px at every viewport. Amount cards retain 1px internal separators using `--border-strong`: black in light mode and white in dark mode.

Home Hero keeps 96px vertical padding and 48px between its label, title and introduction. Home allocation cards place the holdings legend below the ring at every viewport width, with a 48px gap.

Dark secondary surfaces use `#141414` to distinguish panels from the black page. Selected surfaces mix 16% Bright Blue into the primary surface; menu hover and pressed surfaces use `#242424` and `#303030`. Chart axis boundaries use translucent white in dark mode. Apply the same aliases to explicit and system dark appearance; preserve explicit light brand surfaces and the black Footer.

Tablet Header (801–1279px) shares the page container and 32px gutters rather than a separate 720px cap. It retains Sheet navigation, with an 84px header and 48px menu controls. The Sheet top row uses the same height and gutters so the wordmark and open/close controls stay aligned. Phone and desktop navigation breakpoints remain unchanged.

### Tablet layout contract

Use [Fluent 2 Design Tokens](https://fluent2.microsoft.design/design-tokens) as the architecture reference: global spacing values feed semantic layout aliases, and components consume those aliases. The following thresholds are owned content-fit decisions, not Fluent device sizes.

- `--space-section-padding` references `--space-11` (96px), `--space-section-content` references `--space-8` (48px), and `--grid-column-gap` references the 32px/16px spacing ramp. Do not shrink type or section rhythm to preserve a crowded desktop arrangement.
- At 801–1100px, `--grid-editorial` and `--grid-sidebar` become one column. This gives About, Disclaimer, Contact, Subscribe and Support full-width reading/form regions. Wider screens restore 5:7 and 4:8. The Home holdings/allocation composition keeps its separate 8:4 feature grid and aligned card edges.
- The Footer uses two columns for identity and Quick Links at 801–1100px, with Subscribe spanning the full next row. Phones retain one column; wider layouts retain three columns.
- All Hero introductions wrap metadata with an explicit related-content gap. All financial KPI summaries stack below 72rem of available container width; the Home performance comparison stacks below 64rem; preserve full numeric values and existing enlarged-text scrolling fallback.
- Memo cards retain their two-column intermediate grid and 48px insets. The holdings table and monthly chart data retain native horizontal scroll regions when necessary; do not squeeze or remove financial columns. Article title/body alignment remains unchanged.
- Verify the English and both Chinese routes at 768, 834, 1024, 1180 and 1280px. Check numeric-region clipping as well as page overflow, since a contained page can still hide a KPI inside a scroll region. Include Header/Sheet transitions and phone/desktop form and allocation regressions.

Above the stacking threshold, Portfolio summaries use `--grid-portfolio-summary` with three equal-width columns. Home, Portfolio and Performance summary grids use equal-height rows, including stacked layouts. Home performance uses `--grid-comparison` (7:5) for the chart and headline figure, preventing large percentage values from clipping on landscape tablets. The Home comparison ratio is separate from the equal-width KPI summary columns.

The memo-article Hero follows the deployed editorial composition: 96px top padding, a Large Display title with 48px block margins, and a bordered metadata row at the bottom of the secondary surface, with no extra bottom padding. Metadata and the Copy Article Link action share the 1120px title/body width; the action remains right-aligned and moves to its own row on phones. The summary and language notice remain in the body, which retains 96px top padding. This Hero is an explicit exception to symmetric section padding.

Hero metadata (dates and About disciplines) aligns to the right edge of the introduction container at every width, including when it wraps onto a separate row. PageHero owns this rule; page-specific date classes must not override it.
