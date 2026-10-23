# Design System

Use this guide for visual design, component behavior, interface copy and localization. Preserve Jost, brand assets and intentional language variants. [Architecture](WEB_APPLICATION_ARCHITECTURE.md) covers code conventions, rendering, style loading and tooling. [README](../README.md#documentation) maps the documents.

## Architecture and reference ownership

**Layer 01 owns the visual system. Layer 02 systematizes it. Layer 04 implements it.** Layer 03 governs UX within its assigned scope; Layer 05 supplies interaction primitives. Cross-layer web standards take precedence over every layer.

| Layer                      | References in priority order                                                    | Assigned responsibility                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01: Design style           | Pentagram → PayPal → Swiss Themes → Bauer Types → Lineto → Jost → Yahoo Finance | Pentagram, Swiss Themes, Bauer Types and Lineto guide visual composition and typographic character. Primitive Colors comprise eight PayPal-inspired brand/neutrals and two Yahoo Finance-inspired financial colors, listed below. Google Fonts supplies Jost, Noto Sans TC and Noto Sans SC. Typography uses Perfect Fourth (4/3, approximately 1.33), a 16px (1rem) base, weights 400/700, leading 1.15/1.5 and tracking 0. |
| 02: Design foundations     | Fluent 2                                                                        | Global Tokens and Alias Tokens; Color, Elevation, Layout, Material, Motion and Shapes. Functional Colors cover Neutral Colors, Brand Colors, Semantic Colors, Interaction States and Accessibility Best Practices. Motion comprises Duration and Easing. Preserve documented defaults and explicit site mappings within their assigned responsibilities.                                                                     |
| 03: UX guidelines          | Web Interface Guidelines → Fluent 2 → Cieden Handbook                           | Web Interface Guidelines governs Interactions, Forms, Performance and Copywriting. Fluent 2 governs Accessibility, Content Design, Handoffs, Onboarding and Wait UX. Cieden is a supporting reference. Copywriting and Content Design apply exclusively to UX Writing.                                                                                                                                                       |
| 04: Components             | shadcn/ui → Lucide                                                              | shadcn/ui Theming, Typeset and Components; Lucide interface icons. Owned component source maps the upper-layer decisions into implementation. Native HTML remains appropriate for static content and native form controls.                                                                                                                                                                                                   |
| 05: Interaction primitives | Base UI                                                                         | Interactive mechanics, including positioning, modal isolation, focus containment and scroll locking. React and the owning feature retain application state, business workflows and interruptible animations.                                                                                                                                                                                                                 |

React, Next.js App Router, TypeScript, Tailwind CSS and owned CSS Modules implement these layers. Dependencies, rendering boundaries and style loading belong in [Application architecture](WEB_APPLICATION_ARCHITECTURE.md#presentation-and-style-loading).

### Cross-layer web standards

- HTML Living Standard: [complete specification](https://html.spec.whatwg.org/) and [developer edition](https://html.spec.whatwg.org/dev/) govern HTML semantics and native behavior.
- [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) is the accessibility target across all layers.
- [Responsive Web Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design) guides adaptation across viewport sizes and user settings.
- [Core Web Vitals](https://web.dev/explore/learn-core-web-vitals) provides field performance targets.

Automated checks cover specific requirements; they do not establish full accessibility conformance or field CWV compliance. See the [contrast policy](#contrast-policy) and [performance verification](WEB_APPLICATION_ARCHITECTURE.md#performance-regression-checks).

### Design style references

- [Pentagram](https://www.pentagram.com/) and its [PayPal identity](https://www.pentagram.com/work/paypal): visual composition and typographic direction.
- [PayPal](https://www.paypal.com/us/home): inspiration for the eight brand and neutral primitive colors.
- [Swiss Themes](https://swissthemes.design/): visual layout reference.
- [Bauer Types](https://bauertypes.com/): typographic character reference.
- Lineto's [Supreme](https://lineto.com/typefaces/supreme) and [PayPal typography](https://lineto.com/bespoke/paypal): type and wordmark references.
- [Jost](https://indestructibletype.com/Jost.html): the site's retained Latin typeface. Google Fonts sources: [Jost](https://fonts.google.com/specimen/Jost), [Noto Sans TC](https://fonts.google.com/noto/specimen/Noto+Sans+TC?preview.script=Hant) and [Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC?preview.script=Hant).
- [Yahoo Finance](https://finance.yahoo.com/): inspiration for Positive and Negative financial primitives. The approved values below are site decisions, not a claim about Yahoo Finance’s current stylesheet.

These references do not supply replacement assets or font licenses. Keep the documented Typography roles and responsive exceptions; the ratio does not require replacing every approved size with an unrounded mathematical value.

Color Tokens consist of **10 Primitive Colors + Fluent 2 Functional Colors**. Layer 01 defines the ten primitive values; Layer 02 defines their functional roles, theme/state application and accessibility guidance. Functional aliases reference only those ten values or exact Fluent defaults; custom mixed shades are prohibited.

See the ten values in the [Primitive Colors inventory](#primitive-colors).

Neutral financial values reuse Black (or the readable foreground alias in dark mode); Neutral is a semantic role, not an eleventh primitive. Deep Gray must not be used for normal text on White. No Geist Design System preset or neutral scale is adopted; Web Interface Guidelines remains an independent UX reference.

### Functional color ownership

Use two color categories: **10 Primitive Colors** and **Fluent 2 Functional Colors**. Prefer primitives. Add an exact Fluent default only when needed for contrast or dark surface hierarchy. Do not generate tints, mix colors or import unused palettes.

Fluent organizes neutral, brand and shared semantic roles. “Functional Colors” is this project's umbrella term, not a separate official Fluent palette.

| Functional responsibility    | Site application                                                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Neutral Colors               | Surface hierarchy, readable text, borders and material aliases in light/dark themes                                               |
| Brand Colors                 | Brand-linked actions, selection and focus roles using the approved visual identity                                                |
| Semantic Colors              | Error, success and other meaningful status feedback, paired with text or other indicators; financial return roles remain distinct |
| Interaction States           | Rest, hover, pressed, selected, disabled and keyboard-focus treatments                                                            |
| Accessibility Best Practices | Contrast, theme adaptability and information conveyed by more than color alone, subject to cross-layer WCAG 2.2 AA                |

The [color inventory](#color-inventory) records active mappings. Brand identity belongs to Layer 01; Fluent supplies role structure, theme/state guidance and necessary default values. Semantic status and financial returns remain separate roles even when they share a value.

### Design foundation references

Fluent 2 supplies [Design Tokens](https://fluent2.microsoft.design/design-tokens), [Color](https://fluent2.microsoft.design/color), [Elevation](https://fluent2.microsoft.design/elevation), [Layout](https://fluent2.microsoft.design/layout), [Material](https://fluent2.microsoft.design/material), [Motion](https://fluent2.microsoft.design/motion) and [Shapes](https://fluent2.microsoft.design/shapes). Use Global Tokens and Alias Tokens, with Duration and Easing for motion. Easing is implemented by the official `curve*` tokens; those identifiers remain unchanged. The tables below document the adopted Web defaults and site mappings. Fluent's component package and fonts are not installed.

### UX guideline references

- [Web Interface Guidelines](https://vercel.com/design/guidelines): Interactions, Forms, Performance and Copywriting.
- Fluent 2: [Accessibility](https://fluent2.microsoft.design/accessibility), [Content Design](https://fluent2.microsoft.design/content-design), [Handoffs](https://fluent2.microsoft.design/handoffs), [Onboarding](https://fluent2.microsoft.design/onboarding) and [Wait UX](https://fluent2.microsoft.design/wait-ux).
- [Cieden Handbook](https://cieden.com/book): supporting reference for task analysis, information architecture and usability.

Web Interface Guidelines Copywriting and Fluent 2 Content Design apply exclusively to UX Writing: navigation, controls, forms, instructions, status, errors and recovery. Research prose, biography, marketing and editorial content retain the site's editorial rules and verified source meaning. Handoffs concerns transitions between user workflows or applications; apply relevant principles to existing flows without assuming Copilot or other new features. Onboarding and Wait UX apply where the site has an actual first-use, setup or waiting task.

### Component and interaction references

[shadcn/ui Theming](https://ui.shadcn.com/docs/theming), [Typeset](https://ui.shadcn.com/docs/typeset) and [Components](https://ui.shadcn.com/docs/components) implement the upper layers. [Lucide](https://lucide.dev/) supplies icons. [Base UI](https://base-ui.com/) owns interactive primitives; features own business state and provider outcomes.

The adopted component families are Alert, Alert Dialog, Button, Card, Chart, Collapsible, Data Table, Dropdown Menu, Empty, Field, Input, Native Select, Navigation Menu, Radio Group, Sheet, Sidebar, Skeleton, Spinner, Table, Textarea, Toast and Tooltip. See [current consumers](#available-shadcn-components). LineChart is a local Chart composition, not an additional prescribed component family.

### Decision authority and brand adaptations

Apply priority in this order:

1. Cross-layer web standards.
2. Layers 01 through 05, within their assigned responsibilities.
3. References from left to right within the same layer and domain.

A reference cannot govern a domain assigned elsewhere. For example, Fluent organizes color roles without replacing the approved palette; shadcn/ui implements typography without selecting a new scale. Web Interface Guidelines takes precedence over Fluent Content Design for conflicting UX Writing guidance.

| Brand adaptation | Site rule and reason                                                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Font             | Keep Jost and the locale-specific Chinese fallbacks. Financial figures use tabular numerals.                                                                                                           |
| Palette          | Retain the approved brand, neutral and financial primitives and semantic light/dark aliases; retain black primary text and inverse surfaces.                                                           |
| Geometry         | Retain square data blocks and Investment Memo Cards, pill actions and the editorial container.                                                                                                         |
| Typography       | Use the owned Perfect Fourth treatments with Jost, rem units and a 1rem minimum. Tracking is 0; weights are 400/700; leading is 1.15 for Display/Headline/Title and 1.5 for Label/Body across locales. |
| Features         | References do not imply a dashboard, authentication, search or a command palette. Add a feature only for a defined user need.                                                                          |

Distinguish requirements from implementation status. An existing behavior is not an approved exception merely because it is deployed. Record unresolved differences as review findings; do not weaken a rule to describe the current code.

### Light, dark and system appearance

`next-themes` owns appearance through `data-theme` and the `mfa:theme:v1` storage key. System appearance is the initial default. Explicit choices persist across routes, locales and reloads. There is no separate System control.

Menu and Close controls use a 44px circle with a 20px icon on phones and tablets. Both controls retain the same dimensions through Sheet transitions.

Header and Sheet share `ThemeToggle`: shadcn/ui Button + Lucide Sun/Moon + localized `aria-label` + Tooltip. The 48px control names the next action. Tooltip is visual help; it does not replace the accessible name. Before hydration, show a disabled SunMoon control labeled Appearance. `SiteDocument` owns the provider and theme bootstrap.

`tokens.css` defines explicit light/dark aliases and a matching no-JavaScript system fallback. Test computed colors, not only the theme attribute. Keep the black Footer and fixed light brand regions independent of the page theme. `brandSurface` provides Black text, White fields, Bright Gray cards and Medium Gray quiet-action feedback inside Bright Blue regions.

### Token structure

`tokens.css` remains the single source of values. Global primitives such as brand colors, spacing and motion feed semantic aliases such as `--surface-brand`, `--text-brand`, `--interactive-accent` and `--chart-benchmark`; Tailwind references the same aliases. This follows Fluent 2's global/alias separation. Raw neutral values and brand colors feed surface, border, text and interaction roles; retaining useful token names avoids unnecessary churn. Component roles may have distinct aliases even when their current values match.

### Elevation, layout, material and motion tokens

Use Fluent UI Web geometry and motion defaults with their official camelCase names, prefixed by `--` for CSS. Material roles prioritize the ten primitives; Fluent dark surface values remain justified hierarchy exceptions. The Web implementation is authoritative where the general Fluent 2 shape guidance differs (for example, Web Large is 6px and XLarge is 8px). Component role selection is a site decision; these are not claims that every shadcn component matches a Fluent component preset.

| Foundation | Official tokens and values                                                                                                                  | Site mapping                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Layout     | `spacingHorizontal*` and `spacingVertical*`: None 0, XXS 2, XS 4, SNudge 6, S 8, MNudge 10, M 12, L 16, XL 20, XXL 24, XXXL 32px            | Gutter/column gap 32px (phone 16px); vertical aliases derive from the vertical ramp. 48px = 2 × XXL; 96px = 3 × XXXL.   |
| Shapes     | `borderRadius*`: None 0, Small 2, Medium 4, Large 6, XLarge 8, 2XLarge 12, 3XLarge 16, 4XLarge 24, 5XLarge 32, 6XLarge 40, Circular 10000px | Controls/fields Medium; general Cards XLarge; data blocks and Memo Cards None; menus 2XLarge; pill actions Circular.    |
| Strokes    | `strokeWidthThin/Thick/Thicker/Thickest`: 1/2/3/4px                                                                                         | Focus ring uses Thick; existing 1px boundaries use the Thin value.                                                      |
| Elevation  | `shadow2/4/8/16/28/64`                                                                                                                      | Surface 2; Toast 8; popover/chart tooltip 16; modal dialog 64. Layer indices 90/100/110 remain separate stacking rules. |
| Motion     | `durationUltraFast` through `durationUltraSlow`, all nine `curve*` defaults                                                                 | See the duration/curve tables below; retain reduced-motion handling.                                                    |

Shadow geometry follows Microsoft's two-layer ambient/key formulas. Ambient/key alpha is 12%/14% in light mode and 24%/28% in dark mode. No custom outline shadow is added to these presets.

Neutral material and state values are listed in the [color inventory](#color-inventory). `--material-solid`, `--material-solid-secondary`, `--material-popup` and `--material-smoke` adapt those roles to their consumers. Explicit dark selection and the no-JavaScript system fallback share identical overrides. Menus and sheets remain opaque; Acrylic and Windows desktop Mica are not implemented. The black Footer and blue brand surfaces retain explicit brand overrides.

The 1312px shell, 720px reading width, 1120px article width, grid proportions and responsive thresholds are site compositions, not invented Fluent tokens. CSS query thresholds remain literals. Chart coordinates and measured animation geometry remain data.

Official sources: [spacing](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/spacings.ts), [radii](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/borderRadius.ts), [strokes](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/strokeWidths.ts), [shadows](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/utils/shadows.ts), [light materials](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/alias/lightColor.ts), [dark materials](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/alias/darkColor.ts). Verified 18 October 2026.

`design-foundations.spec.ts` verifies rendered widths, materials and popover shadows across phone, tablet and desktop. Component theming tests cover notification shadow propagation; motion tests cover timing, interrupted interaction and reduced motion.

### Color and stroke ownership

Define approved raw values only in `tokens.css`; component roles reference them. Do not use `color-mix()`, color utility alpha modifiers or steady-state opacity to manufacture colors. Independent email and SVG renderers may use literal Primitive Colors. Tailwind's default color namespace is reset; only the owned semantic aliases are exported. Browser forced-colors system keywords remain an accessibility exception, not a third authored palette.

Decorative dividers use `--border-subtle`; editable boundaries use `--border-control`; errors use `--border-error`. Focus uses the contextual `--focus-ring-color` and remains separate from hover and selection. Financial returns use `--text-return-positive`/`--text-return-negative`, never interface danger colors.

Holding rows, portfolio rows, memo disclosures/cards and Support options share the neutral hover role. Desktop memo press uses the stronger pressed role; touch press retains the hover surface to preserve existing touch choreography. Sidebar hover/press use Fluent neutral states; selected navigation uses Medium Gray in light mode and the Fluent Card surface in dark mode. No component owns a one-off hover mixture. Disabled controls retain disabled semantics, cursor and applicable dashed-border/loading feedback, at full color opacity; no unused disabled palette is installed.

Component aliases with distinct responsibilities remain even when their values match. Remove unused roles, intermediate alpha variables and duplicate literal values, not meaningful semantic boundaries. The required ten primitives remain the approved source inventory; Bright Gray supplies website secondary surfaces, light hover states and email backgrounds.

### Component token contract

Components consume semantic aliases from `tokens.css`:

- `--action-*`: Button and ButtonLink surfaces, text and feedback.
- `--field-*`: standard and inverse inputs, textareas and native selects. Standard placeholders use `--field-text` at full opacity; inverse fields have a separate placeholder role.
- `--color-*`: consumed Tailwind/shadcn aliases. Do not register unused defaults.
- `--layer-*`: navigation, modal and popover stacking, separate from shadows.

`brandSurface` maps the Card background to Bright Gray and text to Black, including quiet actions. Quiet-action feedback uses Medium Gray. These local mappings use existing primitives.

Use component variants for appearance and caller classes for placement. Keep foreground, background, border and interactive states compatible as a set. The reset retains `currentColor`; separators that need a subtle border explicitly use `border-border`.

## Purpose and design principles

Make research, financial data and reader actions easy to understand. Use consistent terms and feedback, native semantics, readable contrast and content-driven layouts. Share components when their responsibilities match; retain justified language and workflow variants. Prefer one source for each rule and verify exceptions in context.

## Using this system

- Start with a semantic role and an existing component variant. Tokens in code own numeric values; this document explains their purpose and exceptions.
- Maintain visual and interaction rules here, not in page-specific global overrides. Business consent, payment and retry rules belong in [Integrations](INTEGRATIONS.md).
- Validate changed components in all three languages, narrow and enlarged-text layouts, and the relevant mouse, keyboard, touch and reduced-motion states. Preserve existing text colors and opacity unless a change is explicitly authorized.

## CSS, layout, and visual language

The site uses an editorial financial style: clear type hierarchy, generous section spacing, square data blocks and Investment Memo Cards, pill-shaped primary controls and restrained motion.

### Grid layout

`Grid` in `src/components/grid.tsx` is the site's Server Component implementation, using CSS Grid and Tailwind rather than an additional component package. Keep ordinary cards, forms, KPI bands and editorial columns on plain Tailwind grids when visible guides add no meaning. `Container` continues to own page width and gutters.

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

The inventory below covers every non-test module currently under `src/components/ui`. “Used indirectly” means a live composition imports it. Data Table and Line Chart are owned compositions rather than independent interaction primitives. Subcomponents share their family row.

| Component family | Local source                                                    | Status          | Current use                                                                                               |
| ---------------- | --------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------- |
| Alert            | [alert.tsx](../src/components/ui/alert.tsx)                     | Used            | Inline form feedback, subscription confirmation and Support status                                        |
| Alert Dialog     | [alert-dialog.tsx](../src/components/ui/alert-dialog.tsx)       | Used            | Contact clear-draft confirmation; cancel preserves the message                                            |
| Button           | [button.tsx](../src/components/ui/button.tsx)                   | Used            | CTAs, form actions, theme toggle, copy link, sorting and recovery                                         |
| Card             | [card.tsx](../src/components/ui/card.tsx)                       | Used            | Memo cards, shared FormPanel, Performance charts, Home allocation and About boundary panels               |
| Chart            | [chart.tsx](../src/components/ui/chart.tsx)                     | Used indirectly | Recharts container and tooltip primitives consumed by LineChart                                           |
| Collapsible      | [collapsible.tsx](../src/components/ui/collapsible.tsx)         | Used            | Mobile languages and controlled article outlines; AnimatedDisclosure for memo indexes and monthly returns |
| Data Table       | [data-table.tsx](../src/components/ui/data-table.tsx)           | Used            | Current Holdings; Table renderer for the feature-owned TanStack model                                     |
| Dropdown Menu    | [dropdown-menu.tsx](../src/components/ui/dropdown-menu.tsx)     | Used            | Desktop Header language menu                                                                              |
| Empty            | [empty.tsx](../src/components/ui/empty.tsx)                     | Used indirectly | No-data states in DataTable and LineChart                                                                 |
| Field            | [field.tsx](../src/components/ui/field.tsx)                     | Used            | Field groups and shared accessible form-field composition                                                 |
| Input            | [input.tsx](../src/components/ui/input.tsx)                     | Used            | Contact and subscription inputs; shared input styling for other controls                                  |
| Line Chart       | [line-chart.tsx](../src/components/ui/line-chart.tsx)           | Used            | Performance explorer; owned composition of Recharts and Chart                                             |
| Native Select    | [native-select.tsx](../src/components/ui/native-select.tsx)     | Used            | Mobile holdings sorting and subscription preferences                                                      |
| Navigation Menu  | [navigation-menu.tsx](../src/components/ui/navigation-menu.tsx) | Used            | Desktop Header navigation links                                                                           |
| Radio Group      | [radio-group.tsx](../src/components/ui/radio-group.tsx)         | Used            | Support amount selection after hydration; native radio fallback retained                                  |
| Sheet            | [sheet.tsx](../src/components/ui/sheet.tsx)                     | Used            | Mobile/Tablet navigation panel and modal focus lifecycle                                                  |
| Sidebar          | [sidebar.tsx](../src/components/ui/sidebar.tsx)                 | Used (subset)   | SidebarMenu, SidebarMenuItem and SidebarMenuButton inside Sheet; not a separate desktop sidebar           |
| Skeleton         | [skeleton.tsx](../src/components/ui/skeleton.tsx)               | Used            | Performance explorer loading placeholder                                                                  |
| Spinner          | [spinner.tsx](../src/components/ui/spinner.tsx)                 | Used            | Contact, Subscribe, Support and Email Preferences pending actions                                         |
| Table            | [table.tsx](../src/components/ui/table.tsx)                     | Used            | Monthly Performance table and Current Holdings table composition                                          |
| Textarea         | [textarea.tsx](../src/components/ui/textarea.tsx)               | Used            | Contact message field                                                                                     |
| Toast            | [toast.tsx](../src/components/ui/toast.tsx)                     | Used            | Memo article copy-link success/failure with instance-local manager                                        |
| Tooltip          | [tooltip.tsx](../src/components/ui/tooltip.tsx)                 | Used            | Theme-toggle visual label on hover and keyboard focus; localized aria-label supplies its accessible name  |

Card’s `plain` variant inherits its surrounding text and omits the default surface, ring, radius and outer spacing. Home allocation and About boundary panels use CardHeader and CardContent with their existing section colors and geometry. Lucide ChartPie labels holdings allocation; decorative Check/X icons distinguish the About lists without replacing their headings or text.

Use these composition boundaries:

- **Header:** Navigation Menu for desktop links, Dropdown Menu for desktop languages, Sheet for mobile/Tablet navigation. Sidebar is only the menu subset inside Sheet.
- **Language disclosure:** Collapsible opens upward above its fixed trigger. It keeps a 4px gap to the theme toggle.
- **Theme toggle:** a local Tooltip provider delays pointer entry by 600ms; keyboard focus opens immediately. Its localized `aria-label` supplies the accessible name. The hydrated button explicitly uses `tabIndex={0}` so WebKit includes it in the keyboard sequence.
- **Holdings:** the feature owns TanStack sorting and calculations; DataTable renders native Table semantics, headings, totals and `aria-sort`. Mobile sorting uses Native Select and Button.
- **Performance:** two measures, cumulative reconstructed TWRR and annualized XIRR, each with one interactive Recharts composition in Card, with solid Portfolio and dashed SPY. Keep keyboard/touch comparison, missing-data gaps and the monthly Table alternative. No static chart or custom series buttons.
- **Memos:** linked Cards represent published articles; planned research stays noninteractive. H2/H3 semantics depend on placement. Article outlines compose Collapsible directly; indexes and monthly tables use AnimatedDisclosure.
- **Forms:** standard forms use FormPanel; Footer Subscribe retains its inverse treatment. Field feedback and provider results stay inline. Support enhances native payment radios after hydration.
- **Feedback:** Alert Dialog confirms draft clearing. Memo copy-link success/failure uses an instance-local Toast manager; copying omits query and fragment. Empty represents no data, Skeleton represents loading, and Spinner accompanies pending actions.

Base UI synchronizes primitive ARIA and visibility; React owns controlled application state. Keep server-rendered disclosure content mounted while closed. A single named, focusable Table scroll region owns overflow and sticky headers. Import Recharts and TanStack only where needed; do not add a global component barrel or application-wide Toast provider.

Shared components provide a fixed set of variants:

| Component                                        | Contract                                                                                                                                                                                                                                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Container`                                      | Shared maximum width and responsive gutters; backgrounds belong to its outer section.                                                                                                                                                                                        |
| `PageHero`                                       | Standard, portfolio, performance or support geometry; localized content remains with the page.                                                                                                                                                                               |
| `Button` / `ButtonLink`                          | Primary, contrast, inverse or quiet surface; regular, small, text or icon size. Native button and link semantics remain distinct. Button disabled feedback uses standard, muted or muted-busy variants, preserving preferences opacity without parent overrides.             |
| `FormField`, `Input`, `Textarea`, `NativeSelect` | Label association, visible or hidden label, standard rounded or inverse compact fields. Business validation and submission stay with the feature.                                                                                                                            |
| `Alert`                                          | Standard or inverse typography, reserved space and polite live feedback; an explicit alert role supports assertive announcements. Compose optional AlertDescription and AlertAction without changing existing appearance. Callers associate labels/descriptions when needed. |
| `PortfolioMetric`                                | Plain, highlight, brand or paper financial surfaces, shared typography and surface-specific note colors.                                                                                                                                                                     |

Use Tailwind for layout and ordinary states, and CSS Modules for complex structures and motion. Both use the same tokens. References: [Next.js CSS](https://nextjs.org/docs/app/getting-started/css#recommendations), [Tailwind themes](https://tailwindcss.com/docs/theme), and [Preflight](https://tailwindcss.com/docs/preflight).

Choose tokens by purpose. CSS defines values and breakpoints. Keep sizing, spacing and overflow predictable.

- Use size-first Perfect Fourth text roles in rem units. Responsive roles switch approved sizes; do not interpolate metrics with clamp() or invent a treatment to fit one screenshot.
- Choose heading levels by document structure, independent of visual size. Memo cards use H2 on the index and H3 on Home, including placeholders. Each disclaimer section has an H2 in every locale, even without an introductory lead.
- Use tabular figures for financial comparisons.

### Typography roles

The site uses the approved, production-derived Perfect Fourth scale: **16, 21, 28, 38, 51, 67 and 90px**, expressed in rem at a 16px root. Calculate each step independently from `16 × (4/3)^n` and round once. Semantic text roles use only these sizes; the shared mobile wordmark retains its documented 18px brand exception. This section is the canonical typography specification.

Use size-first names: Large / Medium / Small + Display / Headline / Title / Label / Body. Utilities such as `text-large-display` and tokens such as `--font-size-large-display` live in `tokens.css`. Only 13 treatments are needed; Small Title and Small Label are not defined. Medium Body and Small Body intentionally share metrics while identifying different uses.

All tracking is **0**. Weights are **400 and 700 only**. Display, Headline and Title use **1.15** leading; Label and Body use **1.5**. These rules apply to English, Traditional Chinese, Simplified Chinese, every viewport and every interaction state. Inline emphasis uses 700 and inherits its surrounding size and leading. Keep Jost before the locale-specific Noto Sans fallback; English routes must not load Chinese fonts. The shared text wordmark uses Jost 700, zero tracking and 1.15 leading, with 21px desktop and 18px mobile as a brand exception.

| Role              | Desktop size / line height | Mobile size / line height | Leading | Weight | Tracking | Use                                                               |
| ----------------- | -------------------------- | ------------------------- | ------- | ------ | -------- | ----------------------------------------------------------------- |
| `Large Display`   | 90 / 103.5                 | 51 / 58.65                | 1.15    | 700    | 0        | All page Hero H1s; featured return                                |
| `Medium Display`  | 67 / 77.05                 | 51 / 58.65                | 1.15    | 700    | 0        | Support amounts; summary KPIs fixed at 51px                       |
| `Small Display`   | 38 / 43.7                  | 38 / 43.7                 | 1.15    | 700    | 0        | Chart-ring figures                                                |
| `Large Headline`  | 67 / 77.05                 | 38 / 43.7                 | 1.15    | 700    | 0        | Major Home sections                                               |
| `Medium Headline` | 51 / 58.65                 | 38 / 43.7                 | 1.15    | 700    | 0        | Reserved intermediate headline role                               |
| `Small Headline`  | 38 / 43.7                  | 28 / 32.2                 | 1.15    | 700    | 0        | About sections, holdings section and article H2                   |
| `Large Title`     | 28 / 32.2                  | 28 / 32.2                 | 1.15    | 700    | 0        | Memo cards and form-panel headings                                |
| `Medium Title`    | 21 / 24.15                 | 21 / 24.15                | 1.15    | 700    | 0        | Charts, article H3, Footer headings and holdings summaries        |
| `Large Label`     | 16 / 24                    | 16 / 24                   | 1.5     | 700    | 0        | Field labels, table headings, category labels and CTA actions     |
| `Medium Label`    | 16 / 24                    | 16 / 24                   | 1.5     | 400    | 0        | Sidebar, navigation, selectors and secondary controls             |
| `Large Body`      | 21 / 31.5                  | 21 / 31.5                 | 1.5     | 400    | 0        | Hero and short editorial introductions                            |
| `Medium Body`     | 16 / 24                    | 16 / 24                   | 1.5     | 400    | 0        | Article and Disclaimer prose                                      |
| `Small Body`      | 16 / 24                    | 16 / 24                   | 1.5     | 400    | 0        | Card copy, instructions, table figures, dates, notes and feedback |

The table lists desktop and mobile values. Below 50rem use mobile sizes. From 50rem to below 75rem use Large Display 67px; Medium Display, Large Headline and Medium Headline 51px; other roles use desktop sizes. At 75rem use desktop sizes. Breakpoints change size only; leading, weight and tracking stay fixed. Layout breakpoints remain independent.

Apply these role assignments and exceptions:

- Every page Hero H1 uses Large Display, including memo articles, preferences and confirmation pages.
- Home section headings use Large Headline; memo/form headings use Large Title. Article H2/H3 use Small Headline/Medium Title.
- Summary KPIs remain 51px at every width. Support amounts use responsive Medium Display; ring values use Small Display. Financial figures use tabular numerals.
- CTAs use Large Label. Copy Article Link and Toast titles use Small Body, matching article metadata. Email Preferences links also use Small Body (16px, weight 400) in both subscription form variants. Ordinary navigation uses Medium Label.
- Footer links use 36.15px minimum-height rows: the 24.15px heading row plus a 12px gap. Mobile Sidebar controls retain 48px targets.

Reflow financial summaries below 72rem of container width. Preserve signs, units, precision and complete values. If enlarged text still overflows, use a named local horizontal-scroll region with a localized hint; make it focusable only while overflowing. Never shrink or truncate values to preserve columns.

Article title, summary, notice, body and disclaimer share the centered 1120px container. Heading semantics remain independent of visual size. Touch padding is independent of line height. Chart labels use Small Body with SVG alignment compensation. Cartesian tick labels use `muted-foreground` in both themes and must meet 4.5:1 contrast against the chart surface.

`typography-roles.spec.ts` checks computed metrics and reflow. `financial-type-hierarchy.spec.ts` checks complete values at regular and enlarged text sizes. Assert rendered behavior, not class strings.

### Memo article Typeset

Investment Memo Article MDX body uses [shadcn/ui Typeset](https://ui.shadcn.com/docs/typeset). The owned CSS is vendored in `src/components/ui/typeset.css` from shadcn-ui/ui commit `d2fba50ee5b9113008b5bb908563527b7efd2f27`, with its MIT notice retained. `src/features/memos/typeset-memo.css` imports the upstream components-layer rules before the site preset. The article component imports this stylesheet; unrelated routes do not load Typeset on a fresh visit. No package dependency or client runtime is added.

| Element                              | Site treatment                                                            | Scope / spacing                                                              |
| ------------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Body, paragraphs and reference lists | Jost, 16px / 24px, weight 400, tracking 0                                 | Fixed 1rem base at all breakpoints; adjacent paragraphs use 1.35em spacing   |
| H2                                   | Small Headline: 28px phone / 38px wider screens, leading 1.15, weight 700 | Retains 34px below the heading                                               |
| H3                                   | Medium Title: 21px, leading 1.15, weight 700                              | Retains 18px below the heading                                               |
| Blockquote                           | Medium Title: 21px, leading 1.15, weight 700                              | Retains editorial horizontal borders, 64px margins and 34px vertical padding |
| Links / emphasis                     | Inherited link metrics; emphasis weight 700                               | Underlines and visible keyboard focus; reference numbering remains native    |
| Article wrapper                      | Centered 1120px maximum; left-aligned text                                | Layout owns width, section rhythm and reference panel; Typeset owns prose    |

Override upstream automatic mobile enlargement, heading scale, 500/600 weights and tracking in the memo preset. Use semantic theme aliases for colors, including marks; dark mode does not change type metrics. Superscripts and subscripts retain inline notation behavior. Hero, metadata, Copy Article Link, summary, language notice, article outline and closing disclaimer remain outside the Typeset wrapper. Embedded UI must use `not-typeset` or `data-not-typeset`; registry elements with `data-slot` are excluded by upstream selectors. This is a prose styling system, not an additional `src/components/ui` component family.

`memo-article.spec.ts` checks three locale routes, responsive type, both themes, enlarged text and scope. `memo-mdx.test.mjs` retains the verified research text hash, headings and source-reference assertions.

### Color inventory

Two source categories feed semantic component aliases and shadcn/Tailwind bindings. Aliases are mappings, not additional palette colors. Dark entries apply to both explicit and system-dark appearance. Official values were checked against [Fluent Web light colors](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/alias/lightColor.ts), [dark colors](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/alias/darkColor.ts) and [status colors](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/colors.ts) on 2026-10-18.

#### Primitive Colors

| Token               | Light     | Dark      |
| ------------------- | --------- | --------- |
| `--black`           | `#000000` | `#000000` |
| `--white`           | `#ffffff` | `#ffffff` |
| `--blue-deep`       | `#0d288b` | `#0d288b` |
| `--blue-medium`     | `#3d8af7` | `#3d8af7` |
| `--blue-bright`     | `#7dcbfa` | `#7dcbfa` |
| `--gray-deep`       | `#cccccc` | `#cccccc` |
| `--gray-medium`     | `#eef0f2` | `#eef0f2` |
| `--gray-bright`     | `#f5f7fa` | `#f5f7fa` |
| `--market-positive` | `#007c66` | `#007c66` |
| `--market-negative` | `#bf2a2c` | `#bf2a2c` |

These are the only Layer 01 primitives. Black also represents neutral financial values; there is no duplicate `market-neutral` primitive. App icons, wordmarks and email templates use this inventory.

#### Fluent 2 Functional Colors

Primitive values take precedence over Fluent defaults. Fluent provides the functional role structure; only dark surface hierarchy, readable dark financial/status text and official overlay/shadow alpha roles retain additional Fluent values. `colorBrandForeground1` maps directly to the owned deep/bright blues; no custom brand ramp is generated. Only the consumed dark success role is declared; no unused warning, persona or extra chart palette is installed.

| Token                              | Light                            | Dark                             |
| ---------------------------------- | -------------------------------- | -------------------------------- |
| `--colorNeutralForeground2`        | `var(--black)`                   | `var(--gray-deep)`               |
| `--colorNeutralForeground3`        | `var(--black)`                   | `var(--gray-deep)`               |
| `--colorNeutralBackground1Hover`   | `var(--gray-bright)`             | `#3d3d3d`                        |
| `--colorNeutralBackground1Pressed` | `var(--gray-medium)`             | `var(--colorNeutralBackground2)` |
| `--colorNeutralStrokeAccessible`   | `var(--colorNeutralForeground3)` | `var(--colorNeutralForeground3)` |
| `--colorStatusDangerForeground2`   | `var(--market-negative)`         | `#eeacb2`                        |
| `--colorBrandForeground1`          | `var(--blue-deep)`               | `var(--blue-bright)`             |
| `--colorNeutralBackground1`        | `var(--white)`                   | `#292929`                        |
| `--colorNeutralBackground2`        | `var(--gray-bright)`             | `#1f1f1f`                        |
| `--colorNeutralCardBackground`     | `var(--colorNeutralBackground2)` | `#333333`                        |
| `--colorBackgroundOverlay`         | `rgba(0, 0, 0, 0.4)`             | `rgba(0, 0, 0, 0.5)`             |
| `--colorNeutralShadowAmbient`      | `rgba(0, 0, 0, 0.12)`            | `rgba(0, 0, 0, 0.24)`            |
| `--colorNeutralShadowKey`          | `rgba(0, 0, 0, 0.14)`            | `rgba(0, 0, 0, 0.28)`            |

`--colorStatusSuccessForeground2` is defined only in dark mode as `#9fd89f`, the default Fluent dark success foreground. Light financial gains use the Positive primitive.

#### Semantic, interaction and shadow colors

These component-facing aliases consume the two source categories directly. Inverse text, controls and chart decoration are opaque primitives. Dark financial text uses Fluent Success/Danger Foreground 2. Official overlay/shadow alpha colors retain their exact default RGBA values.

| Token                               | Light                                   | Dark                                    |
| ----------------------------------- | --------------------------------------- | --------------------------------------- |
| `--material-smoke`                  | `var(--colorBackgroundOverlay)`         | `var(--colorBackgroundOverlay)`         |
| `--overlay-scrim`                   | `var(--material-smoke)`                 | `var(--material-smoke)`                 |
| `--material-solid`                  | `var(--colorNeutralBackground1)`        | `var(--colorNeutralBackground1)`        |
| `--material-solid-secondary`        | `var(--colorNeutralBackground2)`        | `var(--colorNeutralBackground2)`        |
| `--material-popup`                  | `var(--surface-primary)`                | `var(--surface-primary)`                |
| `--material-popup-text`             | `var(--text-primary)`                   | `var(--text-primary)`                   |
| `--text-error`                      | `var(--colorStatusDangerForeground2)`   | `var(--colorStatusDangerForeground2)`   |
| `--border-subtle`                   | `var(--gray-medium)`                    | `var(--colorNeutralCardBackground)`     |
| `--border-strong`                   | `var(--black)`                          | `var(--white)`                          |
| `--border-control`                  | `var(--colorNeutralStrokeAccessible)`   | `var(--colorNeutralStrokeAccessible)`   |
| `--border-inverse-subtle`           | `var(--gray-deep)`                      | `var(--gray-deep)`                      |
| `--border-control-inverse`          | `var(--white)`                          | `var(--white)`                          |
| `--border-brand`                    | `var(--blue-medium)`                    | `var(--blue-medium)`                    |
| `--border-error`                    | `var(--text-error)`                     | `var(--text-error)`                     |
| `--surface-subtle`                  | `var(--surface-secondary)`              | `var(--surface-secondary)`              |
| `--surface-selected`                | `var(--gray-medium)`                    | `var(--colorNeutralCardBackground)`     |
| `--text-return-positive`            | `var(--market-positive)`                | `var(--colorStatusSuccessForeground2)`  |
| `--text-return-negative`            | `var(--market-negative)`                | `var(--colorStatusDangerForeground2)`   |
| `--focus-ring-on-dark`              | `var(--blue-bright)`                    | `var(--blue-bright)`                    |
| `--focus-ring-brand`                | `var(--blue-medium)`                    | `var(--blue-medium)`                    |
| `--focus-ring-color`                | `var(--interactive-accent)`             | `var(--interactive-accent)`             |
| `--surface-primary`                 | `var(--material-solid)`                 | `var(--material-solid)`                 |
| `--surface-secondary`               | `var(--material-solid-secondary)`       | `var(--material-solid-secondary)`       |
| `--surface-inverse`                 | `var(--black)`                          | `var(--black)`                          |
| `--surface-brand`                   | `var(--blue-deep)`                      | `var(--blue-deep)`                      |
| `--surface-highlight`               | `var(--blue-bright)`                    | `var(--blue-bright)`                    |
| `--text-primary`                    | `var(--black)`                          | `var(--white)`                          |
| `--text-secondary`                  | `var(--colorNeutralForeground2)`        | `var(--colorNeutralForeground2)`        |
| `--text-tertiary`                   | `var(--colorNeutralForeground3)`        | `var(--colorNeutralForeground3)`        |
| `--text-brand`                      | `var(--colorBrandForeground1)`          | `var(--colorBrandForeground1)`          |
| `--text-inverse`                    | `var(--white)`                          | `var(--white)`                          |
| `--text-inverse-secondary`          | `var(--gray-medium)`                    | `var(--gray-medium)`                    |
| `--text-inverse-tertiary`           | `var(--gray-deep)`                      | `var(--gray-deep)`                      |
| `--text-highlight`                  | `var(--blue-bright)`                    | `var(--blue-bright)`                    |
| `--chart-benchmark`                 | `var(--blue-medium)`                    | `var(--blue-medium)`                    |
| `--interactive-accent`              | `var(--colorBrandForeground1)`          | `var(--colorBrandForeground1)`          |
| `--chart-portfolio`                 | `var(--colorBrandForeground1)`          | `var(--colorBrandForeground1)`          |
| `--action-primary-surface`          | `var(--black)`                          | `var(--white)`                          |
| `--action-primary-text`             | `var(--white)`                          | `var(--black)`                          |
| `--action-primary-hover-text`       | `var(--white)`                          | `var(--white)`                          |
| `--action-primary-hover-surface`    | `var(--surface-brand)`                  | `var(--surface-brand)`                  |
| `--action-contrast-surface`         | `var(--black)`                          | `var(--white)`                          |
| `--action-contrast-text`            | `var(--white)`                          | `var(--black)`                          |
| `--action-contrast-hover-surface`   | `var(--surface-highlight)`              | `var(--surface-highlight)`              |
| `--action-contrast-hover-text`      | `var(--black)`                          | `var(--black)`                          |
| `--action-inverse-surface`          | `var(--white)`                          | `var(--white)`                          |
| `--action-inverse-text`             | `var(--blue-deep)`                      | `var(--blue-deep)`                      |
| `--action-inverse-hover-surface`    | `var(--surface-highlight)`              | `var(--surface-highlight)`              |
| `--action-quiet-text`               | `var(--text-primary)`                   | `var(--text-primary)`                   |
| `--action-quiet-hover-surface`      | `var(--surface-selected)`               | `var(--surface-selected)`               |
| `--sidebar-text`                    | `var(--text-primary)`                   | `var(--text-primary)`                   |
| `--sidebar-hover-surface`           | `var(--colorNeutralBackground1Hover)`   | `var(--colorNeutralBackground1Hover)`   |
| `--sidebar-pressed-surface`         | `var(--colorNeutralBackground1Pressed)` | `var(--colorNeutralBackground1Pressed)` |
| `--sidebar-selected-surface`        | `var(--surface-selected)`               | `var(--surface-selected)`               |
| `--sidebar-language-surface`        | `var(--surface-subtle)`                 | `var(--surface-subtle)`                 |
| `--holding-row-hover-surface`       | `var(--colorNeutralBackground1Hover)`   | `var(--colorNeutralBackground1Hover)`   |
| `--portfolio-row-hover-surface`     | `var(--colorNeutralBackground1Hover)`   | `var(--colorNeutralBackground1Hover)`   |
| `--memo-disclosure-hover-surface`   | `var(--colorNeutralBackground1Hover)`   | `var(--colorNeutralBackground1Hover)`   |
| `--memo-row-hover-surface`          | `var(--memo-disclosure-hover-surface)`  | `var(--memo-disclosure-hover-surface)`  |
| `--memo-card-hover-surface`         | `var(--colorNeutralBackground1Hover)`   | `var(--colorNeutralBackground1Hover)`   |
| `--memo-card-pressed-surface`       | `var(--colorNeutralBackground1Pressed)` | `var(--colorNeutralBackground1Pressed)` |
| `--memo-card-touch-pressed-surface` | `var(--memo-card-hover-surface)`        | `var(--memo-card-hover-surface)`        |
| `--support-option-hover-surface`    | `var(--colorNeutralBackground1Hover)`   | `var(--colorNeutralBackground1Hover)`   |
| `--support-option-selected-surface` | `var(--surface-brand)`                  | `var(--surface-brand)`                  |
| `--support-option-selected-text`    | `var(--text-inverse)`                   | `var(--text-inverse)`                   |
| `--allocation-divider`              | `var(--gray-deep)`                      | `var(--gray-deep)`                      |
| `--allocation-swatch-border`        | `var(--gray-deep)`                      | `var(--gray-deep)`                      |
| `--chart-axis-border`               | `var(--gray-deep)`                      | `var(--gray-deep)`                      |
| `--chart-reference`                 | `var(--black)`                          | `var(--gray-deep)`                      |
| `--text-chart-secondary`            | `var(--text-secondary)`                 | `var(--text-secondary)`                 |
| `--field-surface`                   | `var(--surface-primary)`                | `var(--surface-primary)`                |
| `--field-text`                      | `var(--text-primary)`                   | `var(--text-primary)`                   |
| `--field-border`                    | `var(--border-control)`                 | `var(--border-control)`                 |
| `--field-focus-border`              | `var(--interactive-accent)`             | `var(--interactive-accent)`             |
| `--field-focus-ring`                | `var(--focus-ring-color)`               | `var(--focus-ring-color)`               |
| `--field-inverse-text`              | `var(--text-inverse)`                   | `var(--text-inverse)`                   |
| `--field-inverse-border`            | `var(--border-control-inverse)`         | `var(--border-control-inverse)`         |
| `--field-inverse-placeholder`       | `var(--gray-deep)`                      | `var(--gray-deep)`                      |

#### Tailwind and shadcn color aliases

The default Tailwind color palette is disabled with `--color-*: initial`. Only consumed semantic aliases are registered for the shadcn component contract; they do not introduce color values. Unused secondary, secondary-foreground and accent-foreground aliases are omitted. Unused numbered chart colors are removed; the chart consumes `--chart-portfolio` and `--chart-benchmark` directly.

| Alias                        | Mapping                             |
| ---------------------------- | ----------------------------------- |
| `--color-brand`              | `var(--text-brand)`                 |
| `--color-accent`             | `var(--interactive-accent)`         |
| `--color-highlight`          | `var(--blue-bright)`                |
| `--color-surface`            | `var(--surface-primary)`            |
| `--color-ink`                | `var(--text-primary)`               |
| `--color-border`             | `var(--border-subtle)`              |
| `--color-muted`              | `var(--surface-subtle)`             |
| `--color-selected`           | `var(--surface-selected)`           |
| `--color-background`         | `var(--surface-primary)`            |
| `--color-foreground`         | `var(--text-primary)`               |
| `--color-card`               | `var(--colorNeutralCardBackground)` |
| `--color-card-foreground`    | `var(--text-primary)`               |
| `--color-popover`            | `var(--material-popup)`             |
| `--color-popover-foreground` | `var(--material-popup-text)`        |
| `--color-primary`            | `var(--action-primary-surface)`     |
| `--color-primary-foreground` | `var(--action-primary-text)`        |
| `--color-muted-foreground`   | `var(--text-secondary)`             |
| `--color-destructive`        | `var(--text-error)`                 |
| `--color-input`              | `var(--border-control)`             |
| `--color-ring`               | `var(--focus-ring-color)`           |

#### Local surface and independent-renderer exceptions

| Renderer                       | Color ownership                                                                                                                                             |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brandSurface`                 | White fields, Black text/borders and Deep Blue interaction/focus inside Bright Blue sections; all local values reference primitives, with no local mixtures |
| Footer                         | Black surface, White text, opaque Medium/Deep Gray secondary text; Footer Subscribe overrides inverse text to Black                                         |
| React Email                    | Literal approved primitive values for client compatibility; White on Deep Blue header, Black on Bright Blue CTA, Bright Gray background                     |
| SVG / PNG assets               | Primitive fills from `public/icon.svg` and `public/logo.svg`; raster edge pixels derive from antialiasing these fills                                       |
| Transparent / inherited colors | `transparent` and `currentColor`; allocation sectors use hard gradient stops with approved fills                                                            |
| Forced colors                  | User-agent system colors such as `Highlight` preserve accessible OS contrast                                                                                |

### Derived color formulas and verification

Use the ten primitives first. Where a primitive cannot serve the required contrast or dark surface hierarchy, choose an exact Fluent default functional value. Never generate a custom tint, blend or alpha color. The only alpha colors are Fluent's default overlay (Black 40%/50%) and shadow ambient/key (12%/14% light, 24%/28% dark), written as their exact RGBA values. Component color opacity modifiers and steady-state text/disabled opacity are removed. Animation opacity still controls visibility during transitions, not a resting color palette.

Normal text requires 4.5:1; large text and necessary control/chart/focus indicators require 3:1. KPI notes use their approved foreground at full opacity. Financial signs, labels and solid/dashed lines supplement color. Browser and email checks establish the tested combinations, not full-site WCAG certification.

`palette.test.mjs` restricts raw functional values to the adopted Fluent roles, preserves exactly ten primitive definitions, checks theme fallback parity and rejects unrelated source colors. Theme browser tests check real rendered role pairs, surfaces and interaction states.

### Neutral colors and materials

Use the [color inventory](#color-inventory) for exact values. Light/dark surfaces, readable text, control boundaries and interaction states are semantic roles. Fixed brand regions and the black Footer retain their own complete foreground/background pairs.

KPI tones are deliberate Layer 01 treatments:

| Tone        | Surface     | Text        |
| ----------- | ----------- | ----------- |
| `plain`     | White       | Black       |
| `highlight` | Bright Blue | Deep Blue   |
| `brand`     | Deep Blue   | Bright Blue |
| `paper`     | White       | Deep Blue   |

KPI notes use the value's foreground at full opacity and meet 4.5:1 contrast. Financial signs and solid/dashed chart lines supplement color. The SPY line uses Medium Blue and meets 3:1 on its chart surface. Dark financial and danger text use the documented Fluent defaults.

Header, Sheet and Footer use the text `BrandLogo`. SVG/PNG files serve icons, sharing and downloadable assets. The masters are [`icon.svg`](../public/icon.svg) and [`logo.svg`](../public/logo.svg); App Router icons and raster copies must stay aligned with them. `/images/` legacy URLs redirect to root assets.

Use complete typography roles. Register new role names in `src/lib/utils.ts` so class merging distinguishes size from color. Verify all three locales, narrow layouts and 200% root text. Reflow before shrinking or clipping content.

### Contrast policy

Use `--interactive-accent` (Deep Blue) for normal-size interactive text. Medium Blue remains a brand primitive for decorative details, surface-appropriate non-text indicators and the dashed benchmark line; it is not a normal-text color on white. `--surface-selected` provides a Medium Gray surface in light mode for desktop navigation and language states. Use Deep Blue text on that surface.

Expanded disclosure chevrons retain their rotation during press feedback; scaling must compose with rotation on the Collapsible trigger.

Chart disclosures and scrollable monthly-data regions use the same theme-aware focus alias as other controls. The baseline focus outline consumes `--focus-ring-color`, which follows `--interactive-accent`: Deep Blue in light mode and Bright Blue in dark mode. The black Footer sets the inherited role to `--focus-ring-on-dark` (Bright Blue). Inputs retain their explicit surface variants. Check the outline against its adjacent surface at a minimum of 3:1: Medium Blue on Bright Blue is insufficient. Forced-colors mode continues to use the system Highlight color.

Validate normal-size text at 4.5:1 after compositing opacity and non-text indicators at 3:1 where required. KPI notes retain their value's color at full opacity. Footer secondary text uses Medium Gray and Deep Gray on Black. Disabled controls have separate feedback and must not acquire enabled hover states.

Tests cover these specific combinations and input states. They do not establish full WCAG 2.2 AA conformance. Maintain keyboard and forced-colors focus indicators and verify actual surfaces when introducing a variant.

### shadcn/ui components

The project owns customized shadcn/ui source. `components.json` selects `base-nova`, Tailwind v4, `@/*` imports and `src/components/ui`. The registry supplies source patterns; Layers 01–03 govern the result. `cn` merges classes and `class-variance-authority` defines Button variants. Import components directly. Native controls and ordinary links remain server-compatible.

Before adding a component, inspect its source and dependencies. Add only the needed family, review the diff, map its colors/typography/motion to site tokens, and verify rendered states. Preserve the single reset and existing variants.

- **Fields:** FormField associates labels, descriptions and errors through native IDs, `aria-describedby` and `aria-invalid`. Features own validation. FieldGroup uses `contents` where a form already owns the grid; `stack` supplies a vertical layout. Disabled fields retain readable text and a dashed boundary.
- **Dropdown Menu:** use grouped, real locale links with `hrefLang`, current-language hints and validated recovery parameters. Base UI owns item navigation and dismissal; preserve Tab/outside-focus exit and viewport-aware positioning.
- **Sheet:** Base UI Dialog owns focus containment, background isolation and scrolling locks. Keep it open through the application's closing phase. Use its initial/final focus APIs and SheetClose; do not add a second trap or lock.
- **Sidebar subset:** SidebarMenu, SidebarMenuItem and SidebarMenuButton compose real links through Base UI `useRender`. Preserve list semantics, wrapping, `aria-current`, Tab order and route dismissal. This subset has no separate provider, collapse state or shortcut.

See [Menu behavior](#menu-behavior) and [Disclosure and animation ownership](#disclosure-and-animation-ownership) for lifecycle rules.

## UX tasks and acceptance

Identify the reader, their task and the information needed at each decision. Use Web Interface Guidelines for interactions, forms, performance and UX Copywriting; Fluent 2 for Accessibility, UX Content Design, Handoffs, Onboarding and Wait UX; and Cieden as a supporting reference for task analysis, information architecture and usability checks. The tasks below describe the site's current intent; they are working assumptions, not findings from a user-research study.

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

Choose focus tokens according to light or inverse form surfaces. Preferences retain their disabled behavior at full color opacity. Reserve space for status messages and allow long errors to wrap. After a programmatic field reset, keep the success message visible until the user edits again.

### Motion tokens and timing

Use Fluent 2 default motion duration tokens and easing curves as the foundation. Movement communicates state and relationships and remains local to the interaction. Values were verified on 18 October 2026 against Microsoft’s [duration tokens](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/durations.ts) and [curve tokens](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/curves.ts), with [Fluent 2 motion guidance](https://fluent2.microsoft.design/motion) informing their purpose. CSS custom properties preserve the official camelCase token names with the required CSS prefix, for example `--durationNormal` and `--curveEasyEase`. Component mappings below are site choices, not prescribed Fluent component defaults.

Global durations are 50, 100, 150, 200, 250, 300, 400 and 500ms. `--duration*` and `--curve*` are foundation values; components consume `--motion-*` aliases. Keep the same timing at desktop and phone breakpoints. Existing `fast`, `base`, `medium` and `slow` aliases resolve to 150, 200, 250 and 300ms.

| Purpose                                 | Duration alias                                 | Value       | Curve                           |
| --------------------------------------- | ---------------------------------------------- | ----------- | ------------------------------- |
| Held press                              | `--motion-duration-press`                      | 100ms       | Easy ease                       |
| Color, border and focus feedback        | `--motion-duration-fast` / `base`              | 150 / 200ms | Easy ease                       |
| Dropdown, dialog and toast entry        | `--motion-duration-enter`                      | 250ms       | Decelerate max                  |
| Dropdown, dialog and toast exit         | `--motion-duration-exit`                       | 150ms       | Accelerate max                  |
| Full-screen mobile panel entry / exit   | `--motion-duration-panel-enter` / `panel-exit` | 300 / 250ms | Decelerate max / Accelerate max |
| AnimatedDisclosure expansion / collapse | `--motion-duration-expand` / `collapse`        | 300 / 250ms | Decelerate max / Easy ease      |
| Icon change and touch-ring release      | `--motion-duration-icon` / `feedback`          | 200ms       | Decelerate max / Easy ease      |

| Semantic curve             | Global token           | Cubic Bézier         | Use                                 |
| -------------------------- | ---------------------- | -------------------- | ----------------------------------- |
| `--motion-ease-standard`   | `--curveEasyEase`      | `(0.33, 0, 0.67, 1)` | Feedback and ordinary state changes |
| `--motion-ease-emphasized` | `--curveDecelerateMax` | `(0.1, 0.9, 0.2, 1)` | Entry and expansion                 |
| `--motion-ease-exit`       | `--curveAccelerateMax` | `(0.9, 0.1, 1, 0.2)` | Dismissal                           |
| `--motion-ease-linear`     | `--curveLinear`        | `(0, 0, 1, 1)`       | Constant rotation                   |

`--motion-ease-standard` uses the Fluent default curve `(0.33, 0, 0.67, 1)`; `emphasized` uses the Fluent default curve `(0.1, 0.9, 0.2, 1)`; `exit` uses the Fluent default curve `(0.9, 0.1, 1, 0.2)`. `--motion-ease-linear` is reserved for constant rotation and the staged Menu/X rotation. Tailwind's default transitions also resolve to the shared fast duration and standard curve. A continuous loading spinner uses `--motion-duration-spin`: one second, derived from two ultra-slow intervals; notification lifetime and network timeouts are not animation durations. Skeletons stay static and financial lines do not animate between values.

Do not add route slides, list staggering, or idle decorative motion. The mobile panel keeps its directional entry/exit, with text grouped rather than staggered. Base UI owns popup presence and Collapsible state, ARIA and panel visibility. CSS owns ordinary feedback and Collapsible height transitions; AnimatedDisclosure uses the expansion/collapse aliases above, while the mobile language Collapsible uses the base duration and standard curve. Web Animations API owns the mobile Sheet’s measured panel and icon transitions. Never let both animate the same property.

Reduced motion completes JavaScript layout transitions immediately, cancels running effects, removes press scaling and retains textual status/focus feedback. The existing CSS safety rule caps transitions and animations through `--motion-duration-reduced` at 0.01ms with one iteration and `--motion-delay-none` at zero; components may disable their transitions entirely. This near-zero duration preserves lifecycle cleanup. Verify real browser timing, intermediate reversal, focus/scroll recovery and a live preference change; do not infer behavior from token definitions alone.

### Menu behavior

- The mobile panel slides left to open and right to close. Navigation fades early during closing; the icon rotates from X back to Menu.
- The language disclosure starts collapsed, shows the current language as its label, and lists only the other languages.
- Mobile Sidebar uses compact rows: 16px Medium Label typography, minimum touch targets from `--size-touch-target` (48px by default), 4px row gaps, 6px corners and 18px decorative Lucide icons. Selected links use `--sidebar-selected-surface` and `--interactive-accent`: Medium Gray with Deep Blue text in light mode, and Fluent Card Background with Bright Blue text in dark mode. Hover and pressed feedback use `--sidebar-hover-surface` and `--sidebar-pressed-surface` (Bright Gray/Medium Gray in light mode and Fluent `#3d3d3d`/`#1f1f1f` in dark mode); transitions change color and background without shifting geometry. Idle touch hover resets clear the language summary background whether expanded or collapsed, preserving expanded text color, selection and keyboard focus. Keep the full-screen panel on `--surface-primary` (White in light mode, Fluent `#292929` in dark mode), the shared text wordmark, round close control and existing opening/closing animation.
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

For UX Writing, Web Interface Guidelines and Fluent 2 Content Design guide plain language, concise headings, descriptive links and clear next steps. Adapt tone to the reader's task and emotional context. Prefer active voice and address the reader directly in operational guidance. Use second person for reader tasks. Named third person for author background is a separate site editorial convention. Preserve verified financial and legal meaning when simplifying copy.

### Content design workflow

Identify the reader, task, known state and next action before writing. Keep copy with its owning page or feature. External Copywriting and Content Design rules apply only to UX Writing; research and marketing retain editorial rules.

| Context                | Content responsibility                                                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Research and portfolio | Explain the evidence, data date, calculation boundary and limitations. Define specialist terms where readers need them.                                                |
| Navigation and actions | Use short labels that name the destination or action. Instructions must work without relying on screen position, color or device.                                      |
| Subscription           | Distinguish requesting a confirmation email from confirming consent. Tell readers how to finish subscribing; do not describe a request as an active subscription.      |
| Preferences            | Explain the secure-link step and keep the same confirmation for every address. Do not reveal subscriber status or promise delivery that the response cannot establish. |
| Errors and payments    | State what is known, explain any necessary wait and give a safe next step. A failed request or return navigation does not prove a provider operation failed.           |

Use short sentences, familiar words and active voice. Avoid blame, filler and unsupported outcome or timing promises. Verify translations against the same consent, privacy and payment states. Search tests and fixtures for replaced wording, then check visible copy, accessible names and mobile wrapping. Mock provider writes during routine verification.

### Capitalization and editorial conventions

For UX Writing, [Web Interface Guidelines](https://vercel.com/design/guidelines#copywriting) takes precedence over Fluent 2 Content Design: functional interface headings and buttons use Chicago Title Case as adopted by this project. Sentence case for marketing and editorial content is a separate site editorial decision. The context matrix below preserves current copy conventions; neither external UX Writing reference governs research prose or marketing content. Capitalization is not a universal accessibility rule.

| Context                                                                                      | Capitalization                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home, About, memo index and articles, Disclaimer; Contact and Support introduction/Hero copy | Sentence case for editorial headings and editorial navigation links. Embedded functional controls, such as Copy Article Link and On This Page, use Chicago Title Case. Capitalize the first word, proper nouns and acronyms. |
| Portfolio and Performance; preferences, confirmation and recovery screens                    | Chicago Title Case for interface headings and buttons. Use the same treatment for short field labels and table column headings. Explanations, status messages and data notes remain sentence case.                           |
| Contact, subscription and payment forms, including forms embedded in introduction pages      | Chicago Title Case for form headings, labels and buttons. Instructions and error/success messages remain sentence case.                                                                                                      |
| Shared Header, Menu and Footer                                                               | Consistent Title Case for visible navigation/control labels and section headings across routes. Accessible instructions such as “Open menu” remain sentence case.                                                            |
| Transactional emails and source material                                                     | Email copy uses the site’s sentence-case convention. Preserve source quotations, names, technical identifiers and published source titles.                                                                                   |

Use Chicago's 18th-edition rules: capitalize the first and last words, nouns, pronouns, verbs, adjectives and adverbs. Lowercase internal articles (`a`, `an`, `the`), coordinating conjunctions (`and`, `but`, `for`, `or`, `nor`), `to` in infinitives and short prepositions used as prepositions. Capitalize prepositions of five or more letters; for example, `Get Help with a Payment` and `Connect Through Research`. [Chicago's capitalization clarification](https://www.chicagomanualofstyle.org/qanda/data/faq/topics/CapitalizationTitles/faq0035.html) explains the edition change.

Maintain capitalization in owned copy; do not use CSS `text-transform: capitalize` or a runtime word converter. Determine the phrase's grammar and context. A visual line break does not start a new sentence or title. Keep Modern Fundamental Analyst, Microsoft, Stripe, Rutgers University–New Brunswick Honors College, AI, ETF, TWRR and XIRR unchanged. Chinese content does not acquire English casing rules.

- Write directly to the reader with active voice and familiar words. Use the named author for factual biography rather than first-person narration. Do not assign the author's beliefs to the reader.
- Remove terminal periods from headings, buttons, labels and fragment lists in all languages. Keep punctuation in complete explanatory sentences, source quotations and actual questions.
- Use descriptive action and destination labels. Instructions must work without references such as “below”, “on the right” or “the blue button”.
- Express a failed or uncertain operation accurately and give the next safe action. A request, redirect or provider acknowledgment alone does not establish delivery, consent or payment completion.
- UX Writing guidance governs interface wording and interaction decisions within its assigned scope. Editorial conventions govern other content. A changed workflow needs corresponding implementation and focused verification.
- Present dates, currency, percentages, and data timestamps clearly and consistently. Portfolio and performance data are timestamped snapshots and must not imply live quotes; see [portfolio data](WEB_APPLICATION_ARCHITECTURE.md#portfolio-data) for definitions.
- Preserve meaning, tone, and action intent in translation rather than matching words or line counts literally. Language differences may justify layout and content variants.

Describe research coverage accurately. Selected-company coverage does not imply a thesis or model for every holding. Keep research evidence, source quotations and publication dates accurate. Article headings follow sentence case; source paragraphs remain attributable to the published research. Put scope and language notices in the page's language, aligned with the article body and spaced apart from its first heading. Label publisher overviews when they are not the full report.

## Design verification

Accessibility, responsiveness, semantics, performance, maintainability and reliability apply across all five layers. Keep provider procedures, error recovery and release gates in the architecture and integration guides.

For field Core Web Vitals, target the 75th percentile separately for mobile and desktop: LCP at most 2.5s, INP at most 200ms and CLS at most 0.1. See [Web Vitals](https://web.dev/articles/vitals). Local Lighthouse budgets are regression checks with their own documented limits; TBT is not INP, and a passing lab run does not establish field compliance. Preserve the existing CI budgets unless a separate performance change justifies adjusting them.

Compare direct loads, client navigation and browser return in the same browser and viewport. Check computed styles, wrapping, focus and animation states. Do not bind behavior tests to class strings. WebKit emulation does not replace physical iPhone testing.

`src/app/_components/semantic-content.spec.ts` checks KPI note/value color equality, full opacity and at least 4.5:1 composited contrast across locales and desktop/mobile widths. `src/features/portfolio/performance-chart.spec.ts` checks benchmark contrast. `scripts/color-contrast.ts` composites transparency before calculating WCAG luminance.

Typography and layout tests stay beside their owners. Use [AGENTS.md](../AGENTS.md#verification-and-review) to select affected checks and the [test workflow](WEB_APPLICATION_ARCHITECTURE.md#test-workflow) for runner and CI details.

### Hero summaries and vertical rhythm

Summary containers from 40rem to below 72rem use three equal-width, equal-height stacked rows. Each row places its label and explanation on the left and the unchanged 51px value on the right, using a 2:3 internal grid, 24px vertical padding and a 136px minimum height. Rows grow together for longer translations. Below 40rem retain vertical card contents; from 72rem retain the three-column layout. These container thresholds also respond to text enlargement.

Disclaimer uses the same 48px title-to-description gap as other page Heroes at every breakpoint.

Page-level blocks use `--space-section-padding: 96px` for both top and bottom padding at every viewport width. Major content groups within a block use `--space-section-content: 48px`, including heading-to-content spacing and Hero introduction/actions-to-summary spacing. This is breathing room inside the existing background, not an added white band or external margin. Page blocks have no added vertical margins; adjacent background bands meet directly. Home Portfolio uses one padded grid: the section label sits 48px above the title, and the allocation card starts at the title row in the desktop right column and stretches to the bottom of the holdings list. On mobile, the card follows the holdings list with a 48px gap. About boundary panels own their padding individually.

This rule covers page heroes, Home content bands, About sections, Portfolio holdings, Performance charts and methodology, the memo index and article header/body, Contact Subscribe and message sections, Support and subscription preference/confirmation content. Header, Footer, dialogs, cards, form fields, KPI cells and article subsections retain their component-specific spacing; they are not independent page blocks.

Home, Portfolio and Performance contain their KPI summaries inside the Hero content container, aligned to the title edges rather than the viewport. Keep 48px between the introduction/actions and summary. Portfolio shows three summary cells (market value, total return and holdings), in one desktop row or stacked when the Hero summary is narrower than 72rem. Net Cost Basis remains in the underlying data and holdings calculations, not as a summary cell. Current Holdings uses the white primary surface. When its Hero summary is narrower than 10rem (for example, 320px with 200% root text), reduce cell inline padding to 4px; locally scroll a value that still exceeds the available width. Keep form status-message reserve space inside the form. About content and closing columns stack through 800px using their phone rules and at 801–1100px through the shared `--grid-editorial` override. Their named `about-page` container query also stacks them below 56rem of available page width, including when enlarged root text raises that threshold. Above 1100px, the 5:7 layout returns only when the container query does not require stacking. Footer text Logo shares `--size-footer-heading` with column headings (24.15px at the default root size), followed by the shared 12px gap.

Footer subscription buttons use black text through a local `--action-inverse-text` override. Keep that color for idle, hover, keyboard focus and submitting states; other inverse buttons retain their existing treatment.

Current Holdings owns symmetric 96px vertical padding with no added vertical margins. Its heading and return note own only internal spacing. Holdings figures use Small Body; stock symbols and totals use Large Label on desktop and mobile. Keep tabular figures, native table semantics and sorting controls.

### Swiss Grid and editorial layout

The site owns its Swiss Grid / Editorial Layout: proximity, shared alignment, content-driven reflow and a 4px spacing base. All dimensions, proportions and responsive thresholds below are site decisions. Fluent Web horizontal and vertical spacing tokens supply the base ramp; larger section intervals are compositions of these defaults. Grid proportions and content-fit thresholds remain site decisions.

| Layer               | Site rule                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Section boundary    | 96px top and bottom padding on all viewports; continuous background bands, no external spacer strips                     |
| Content groups      | 48px between headings and content, charts, and featured memos and their index                                            |
| Component internals | 8/12/16/24/32px for labels, fields, metadata and card padding; do not apply 48px to every child                          |
| Container           | 1312px maximum; 32px outer gutters, 16px at 800px and below; existing 720px intermediate container cap remains           |
| Column gutter       | `--grid-column-gap`: 32px desktop, 16px mobile; stacked major regions use a 48px row gap                                 |
| Editorial regions   | 5:7 (`--grid-editorial`), 4:8 (`--grid-sidebar`), or 8:4 (`--grid-feature`), subdivisions of a conceptual 12-column grid |
| Repeated modules    | Memo cards reflow 3/2/1 columns at 1101px/801px; 1px guide lines remain a deliberate modular-grid separator              |
| Manuscript          | Article title and body share a centered 1120px maximum-width container with equal outer margins and left-aligned text    |

Use the existing content-driven stacking thresholds: 800px for phone layouts, 1100px for editorial/sidebar regions and the intermediate Footer composition, and container queries for About, KPI and chart regions. A 12-column concept does not require twelve DOM wrappers. Regions use `minmax(0, ...)` so text can reflow. Keep source order meaningful when columns stack. Do not shrink typography to preserve columns. Header navigation retains its separate 1280px breakpoint.

Spacing belongs to one owner: section padding surrounds the complete block; a group gap separates peer groups; compact component spacing relates metadata and controls. The memo index owns 96px padding and uses exactly 48px between cards and disclosure. Memo cards have content-driven heights, with aligned footers, instead of fixed empty vertical space. Text and controls follow shared left edges; numeric table columns retain their deliberate right alignment. Preserve the approved typography rather than forcing its line boxes onto an artificial 4px baseline.

Data blocks use `--radius-data`; Investment Memo Cards, their inner Card and the grid use `--radius-memo`. Both aliases map to Fluent `--borderRadiusNone` (0px), including hover/focus states. General form and chart Cards retain XLarge (8px).

Memo cards use 48px outer content insets at every viewport width, including the footer bottom inset. Performance chart X-axis labels reserve a 48px axis height and a 16px tick gap to separate them from the lowest Y-axis label.

Contact, Subscribe and Support retain their action label and add the shared shadcn/ui Spinner while pending. The decorative spinner is hidden from assistive technology and disables rotation for reduced motion; a separate live status announces the localized pending message.

Email Preferences adds the same decorative Spinner beside its localized requesting, saving or unsubscribing label and removes it when the request settles.

Email inputs disable spellchecking while preserving email autocomplete and keyboard hints.

Empty renders genuine no-data states in DataTable and LineChart; it does not replace loading Skeletons or error boundaries.

Support amount cards progressively enhance native radio inputs to shadcn/ui RadioGroup after hydration. The group submits product_id, retains the server-selected product, and uses the existing fieldset lock and frozen retry payload. Native radios remain the no-JavaScript fallback; keyboard focus is visible on the full amount card.

Each Performance chart reserves a 300px Skeleton and loads within 200px of the viewport. It stays mounted after loading. Monthly tables remain independent of chart loading and rendering.

Performance charts include a 1px dashed reference line at 0% (6px dash, 4px gap), using `--chart-reference`: black in light mode and `#cccccc` in dark mode. The reference extends the Y-axis domain when needed and does not change the return data or series styles.

Support amounts use Medium Display, (51px mobile, 67px wide desktop, weight 700); summary KPIs instead remain 51px at every viewport. Amount cards retain 1px internal separators using `--border-strong`: black in light mode and white in dark mode.

Page Heroes begin with the main heading; omit the decorative dot and page/category label above it in every locale. Keep 96px vertical padding and 48px between the title and introduction or article metadata. Navigation links and section labels remain unchanged. Home allocation cards place the holdings legend below the ring at every viewport width, with a 48px gap.

Dark secondary/primary surfaces use Fluent `#1f1f1f`/`#292929`. Selected surfaces use Fluent Card Background (`#333333`); menu hover and pressed surfaces use Fluent `#3d3d3d`/`#1f1f1f`. Chart axis boundaries use Deep Gray in both modes. Apply the same aliases to explicit and system dark appearance; preserve explicit light brand surfaces and the black Footer.

Tablet Header (801–1279px) shares the page container and 32px gutters rather than a separate 720px cap. It retains Sheet navigation. Header height is 64px on phones and 72px on tablets and desktop. Phone and tablet Menu and close controls use 44px circular targets with 20px Lucide icons. The Sheet top row uses the same height and gutters so the wordmark and open/close controls stay aligned. Phone and desktop navigation breakpoints remain unchanged.

### Tablet layout contract

Use [Fluent 2 Design Tokens](https://fluent2.microsoft.design/design-tokens) as the architecture reference: global spacing values feed semantic layout aliases, and components consume those aliases. The following thresholds are owned content-fit decisions, not Fluent device sizes.

- `--space-section-padding` references `--space-11` (96px), `--space-section-content` references `--space-8` (48px), and `--grid-column-gap` references the 32px/16px spacing ramp. Do not shrink type or section rhythm to preserve a crowded desktop arrangement.
- At 801–1100px, `--grid-editorial` and `--grid-sidebar` become one column. This gives About, Disclaimer, Contact, Subscribe and Support full-width reading/form regions. Wider screens restore 5:7 and 4:8. The Home holdings/allocation composition keeps its separate 8:4 feature grid and aligned card edges.
- The Footer uses two columns for identity and Quick Links at 801–1100px, with Subscribe spanning the full next row. Phones retain one column; wider layouts retain three columns.
- All Hero introductions wrap metadata with an explicit related-content gap. All financial KPI summaries stack below 72rem of available container width; the Home performance comparison stacks below 64rem; preserve full numeric values and existing enlarged-text scrolling fallback.
- Memo cards retain their two-column intermediate grid and 48px insets. The holdings table and monthly chart data retain native horizontal scroll regions when necessary; do not squeeze or remove financial columns. Article title/body alignment remains unchanged.
- Verify the English and both Chinese routes at 768, 834, 1024, 1180 and 1280px. Check numeric-region clipping as well as page overflow, since a contained page can still hide a KPI inside a scroll region. Include Header/Sheet transitions and phone/desktop form and allocation regressions.

Above the stacking threshold, Portfolio summaries use `--grid-portfolio-summary` with three equal-width columns. Home, Portfolio and Performance summary grids use equal-height rows, including stacked layouts. Home performance uses `--grid-comparison` (7:5) for the chart and headline figure, preventing large percentage values from clipping on landscape tablets. The Home comparison ratio is separate from the equal-width KPI summary columns.

The memo-article Hero follows the deployed editorial composition: 96px top padding, a Large Display title with 48px block margins, and a bordered metadata row at the bottom of the secondary surface, with no extra bottom padding. Metadata and the Copy Article Link action share the 1120px title/body width; the action remains right-aligned above 800px and moves to its own left-aligned row at 800px and below. The summary and language notice remain in the body, which retains 96px top padding. This Hero is an explicit exception to symmetric section padding.

Hero metadata (dates and About disciplines) aligns to the right edge of the introduction container at every width, including when it wraps onto a separate row. PageHero owns this rule; page-specific date classes must not override it.

### Memo article outline

Investment Memo articles place an initially collapsed **On This Page** outline after the summary/language notice and before the Typeset body. The control directly composes shadcn/ui Collapsible, CollapsibleTrigger and CollapsibleContent, with Lucide List and ChevronDown. React owns `open` through `useState(false)` and `onOpenChange`; Base UI owns ARIA and visibility. The mounted content reuses the shared disclosure height-transition CSS. The full-width trigger has a minimum 48px target; the chevron rotates with the expanded state and follows reduced-motion preferences.

Memo Markdown headings may supply an explicit trailing `\{#id\}` anchor (braces escaped for MDX). The outline and rendered heading use the same ID, while the marker is excluded from visible copy. Generated names are reserved so later repeated headings retain their existing URLs. The Business Analysis section uses `#section-1-business-analysis`. Each Introduction and Investment conclusion uses its chapter prefix (`business-analysis`, `management-analysis` or `financial-analysis`) followed by `-introduction` or `-investment-conclusion`. Visible titles remain unchanged.

The outline uses the 1120px article width and leaves 48px before the body. Its interface label follows the site locale; links retain the article language and original heading wording. H2 entries are bold and H3 entries indented. It remains outside Typeset so article prose rules do not style the control.

The local `remark-memo-toc.mjs` plugin builds heading IDs and the exported outline together during MDX compilation. Heading IDs use unprefixed title slugs (for example, `framework-for-understanding-business`). Repeated headings receive unique, deterministic suffixes. Native fragment links preserve deep linking without client-side heading discovery or duplicated editorial metadata. Tests verify the unchanged research-text hash, link targets, three locales, keyboard expansion/collapse and narrow layouts.

### Footer column alignment

Footer title rows share `--size-footer-heading` (Medium Title line height, 24.15px at the default root size) and `--space-footer-heading` (12px). The description, first navigation link line box and subscription input top border share the second-row start in the three-column layout. Navigation links are top-aligned and use `--size-footer-link` (title row plus gap, 36.15px), so the title-to-first-link distance matches subsequent link intervals. Social icons retain vertical alignment with their 24px text lines. The Footer wordmark uses the available column width to avoid unnecessary wrapping; Tablet retains its separate subscription row and mobile retains stacked groups.

Footer Email Preferences starts 12px below the input bottom edge on multi-column forms (8px grid gap plus 4px link margin). On mobile, it remains below the Subscribe button with the same 12px gap.

## Implementation status

Current Holdings uses validated `sort` and `direction` query parameters. Supported keys match the table columns; direction is `asc` or `desc`. Missing or invalid pairs use market value descending. Native history updates preserve other parameters and the fragment, support reload and Back/Forward, and avoid fetching portfolio data again. A local Suspense boundary retains the default server-rendered table with disabled sorting controls while URL state becomes available. Consecutive sorting actions read the latest URL before updating it.

Contact, Subscribe and Support keep the action label while pending, display the shared Spinner and announce progress separately. Existing request locks, idempotency keys and recovery payloads remain unchanged.

These contracts follow the assigned [Web Interface Guidelines](https://vercel.com/design/guidelines#interactions). Automated checks cover URL sorting and pending form states. They do not establish full WCAG conformance, physical-device behavior or field Core Web Vitals compliance.
