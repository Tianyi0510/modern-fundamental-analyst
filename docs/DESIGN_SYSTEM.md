# Design system

Use this guide for visual design, component behavior, interface copy and localization. Preserve Jost, brand assets and intentional language variants. [Architecture](WEB_APPLICATION_ARCHITECTURE.md) covers code conventions, rendering, style loading and tooling. [README](../README.md#documentation) maps the documents.

## Architecture and reference ownership

The site adopts the five layers below as its design system. Preserve its editorial identity: Jost headings, three brand blues, square financial surfaces, pill-shaped actions and generous whitespace. Apply reference principles through these owned components and tokens. Upstream defaults do not override the brand or justify unrelated features.

| Layer                  | Responsibility                                                                                                                                                                                                                      | Reference                                                                                                                                                                                                                                                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01: Design style       | Pentagram, PayPal and Jost guide the editorial identity, typographic character and brand composition. Preserve the site's own assets and explicit brand adaptations.                                                                | [Pentagram](https://www.pentagram.com/), [PayPal](https://www.pentagram.com/work/paypal), [Jost](https://indestructibletype.com/Jost.html)                                                                                                                                                                                          |
| 02: Design foundations | Geist supplies Colors, Typography, Materials and Grid. Fluent 2 supplies Design Tokens and Color Tokens: global values, semantic aliases and color roles.                                                                           | [Geist Colors](https://vercel.com/geist/colors), [Typography](https://vercel.com/geist/typography), [Materials](https://vercel.com/geist/materials), [Grid](https://vercel.com/geist/grid), [Fluent 2 design tokens](https://fluent2.microsoft.design/design-tokens), [color tokens](https://fluent2.microsoft.design/color-tokens) |
| 03: UX guidelines      | Fluent 2 Content Design guides information and interface copy. Vercel guides web interaction quality; Cieden guides task analysis, information architecture and usability.                                                          | [Fluent 2 content design](https://fluent2.microsoft.design/content-design), [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines), [Cieden Handbook](https://cieden.com/book)                                                                                                                                     |
| 04: Components         | Maintain customized shadcn/ui source and Lucide interface icons. Native HTML remains appropriate for static content and native form controls.                                                                                       | [shadcn/ui](https://ui.shadcn.com/), [Lucide](https://lucide.dev/)                                                                                                                                                                                                                                                                  |
| 05: Interaction engine | Base UI underpins shadcn interactive primitives: menus, positioning, modal isolation, focus containment and scroll locking. React and the owning feature retain application state, business workflows and interruptible animations. | [Base UI](https://base-ui.com/)                                                                                                                                                                                                                                                                                                     |

React, Next.js App Router, TypeScript, Tailwind CSS and owned CSS Modules implement these five design layers. Their dependencies, rendering boundaries and style loading belong in [Application architecture](WEB_APPLICATION_ARCHITECTURE.md#presentation-and-style-loading).

WCAG 2.2 AA, responsive design, semantic HTML and Core Web Vitals are cross-layer quality targets. Automated checks cover specific requirements; they do not establish full accessibility conformance or field CWV compliance. See the [contrast policy](#contrast-policy) and [performance verification](WEB_APPLICATION_ARCHITECTURE.md#performance-regression-checks).

Preserve Jost, Noto Sans language fallbacks, all brand colors and Logo. The style references guide composition and typographic character; they do not supply replacement assets or font licenses. Geist and Fluent 2 guide the owned design system; their component packages and fonts are not installed. Light, dark and system appearance are supported. Search and a command palette are not implied by adoption.

### Design style references

- [Pentagram](https://www.pentagram.com/) and its [PayPal identity](https://www.pentagram.com/work/paypal): brand composition and typographic direction.
- [Swiss Themes](https://swissthemes.design/) and [Bauer Types](https://bauertypes.com/): supplementary layout and type references.
- Lineto's [Supreme](https://lineto.com/typefaces/supreme) and [PayPal typography](https://lineto.com/bespoke/paypal): type and wordmark references.
- [Jost](https://indestructibletype.com/Jost.html): the site's retained typeface.

### Decision authority and brand adaptations

Geist is the primary visual reference for typography, colors, spacing, grids, shapes and elevation. Fluent 2 contributes token architecture, semantic color roles and content-design guidance. The site retains its owned palette and components. This is the site's integration of these references, not an official combined standard.

Apply decisions in this order:

1. Preserve verified content, service contracts and the explicitly retained brand assets; meet the relevant accessibility requirement.
2. Use Geist to choose a coherent visual treatment for the task.
3. Express that treatment through the shared tokens and owned component variants, following Fluent 2's global/alias structure.
4. Adapt shadcn defaults to those decisions. Add Base UI behavior only where an interactive primitive needs it.

| Brand adaptation | Site rule and reason                                                                                                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Font             | Keep Jost and the locale-specific Chinese fallbacks. Financial figures use tabular numerals; Geist Sans or Mono is not required.                                                                      |
| Palette          | Retain all brand and financial colors, including the two original grays. Use Geist neutral roles with the documented brand overrides; retain black primary text and inverse surfaces.                 |
| Geometry         | Retain square financial surfaces, pill actions and the editorial container. Standard fields and the memo grid use 6px corners; floating menus use 12px.                                               |
| Typography       | Use Geist heading, copy, label and button treatments with Jost, rem units and a 1rem minimum. Use complete Geist presets except for the preserved Logo wordmark; no locale-specific metric overrides. |
| Features         | References do not imply a dashboard, authentication, search or a command palette. Add a feature only for a defined user need.                                                                         |

A new treatment needs a reason, an owning role or component variant, and verification in its real context. Do not import another visual preset to solve an isolated component problem.

### Light, dark and system appearance

Use `next-themes` with `data-theme`, the `mfa:theme:v1` preference key and system appearance by default. The desktop Header and mobile Menu expose one localized Appearance selection. Preferences persist across reloads, routes and languages; system mode follows OS changes. The Header owns the provider and sets the document theme before hydration; page content does not subscribe to its context. The native selection restores preferences through a DOM effect, preserves pre-hydration choices and does not force a synchronous mount-state render. Suppress hydration warnings only on the root HTML attribute that this bootstrap changes.

`tokens.css` owns explicit light aliases, `data-theme="dark"` overrides and `color-scheme`. A system-preference media query applies dark aliases only when no explicit theme is set, including without JavaScript. Explicit aliases avoid build-time `light-dark()` transformations that can leave manual Dark selection using light colors. Keep brand primitives unchanged. Dark page surfaces use black and `#0a0a0a`, text uses white and lighter neutral roles, and links/focus use Bright Blue. Financial return aliases use readable dark-mode variants. Test rendered colors in production builds with Chromium and WebKit; checking the theme attribute alone does not establish that the appearance changed.

Bright Blue brand regions use the shared `brandSurface` treatment with explicit local semantic aliases and a light color context so their text, controls and focus retain the established dark lettering. The Footer stays black with white text. Footer Subscribe retains black text on its white pill. Header and Menu switch between the existing black- and white-letter SVG artwork without filtering the brand colors. Logo geometry, typography, spacing and content remain independent of theme selection.

Verify system changes, explicit overrides, persistence, keyboard/native-select operation, Menu focus/scroll behavior, three languages, 320/390px phones, desktop and 200% text. Check text contrast at 4.5:1 and control/focus boundaries at 3:1 on actual surfaces, including hover and selected states. No theme transition animation is added. Full desktop navigation starts at 1280px so the Appearance control fits without overlapping the Logo; narrower layouts expose it in the Menu.

### Token structure

`tokens.css` remains the single source of values. Global primitives such as brand colors, spacing and motion feed semantic aliases such as `--surface-brand`, `--text-brand`, `--interactive-accent` and `--chart-benchmark`; Tailwind references the same aliases. This follows Fluent 2's global/alias separation. Raw neutral values and brand colors feed surface, border, text and interaction roles; retaining useful token names avoids unnecessary churn. Component roles may have distinct aliases even when their current values match.

`--shadow-popover` owns Geist's Menu material shadow; `--shadow-surface` owns its Base surface outline. `--width-content` owns the 1312px container maximum. Shape aliases distinguish pill actions (`--radius-action`), 6px fields (`--radius-field`), square financial surfaces (`--radius-surface`) and 12px popovers (`--radius-menu`). Do not convert chart coordinates or measured animation values into fixed design tokens.

### Color and stroke ownership

Follow Fluent 2's [global and alias layers](https://fluent2.microsoft.design/design-tokens) and [color roles](https://fluent2.microsoft.design/color-tokens). Keep raw palette and alpha values in `tokens.css`; website components consume semantic aliases. Centralize derived `color-mix()` expressions there as well. Preserve existing values and justified differences rather than assigning one tint to every interaction.

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

- Use semantic text roles and complete Geist presets in `rem` units. Responsive roles switch presets; do not interpolate metrics with `clamp()` or invent a treatment to fit one screenshot.
- Choose heading levels by document structure, independent of visual size. Memo cards use H2 on the index and H3 on Home, including placeholders. Each disclaimer section has an H2 in every locale, even without an introductory lead.
- Use tabular figures for financial comparisons.

### Typography roles

Jost is shared across locales. Each Chinese root layout owns its matching Noto Sans font; ordinary English pages must not load either Chinese font stylesheet. Keep the existing font options and fallback order; typography roles below own text metrics. The global 404 handles all locales in one entry and may load both Chinese stylesheets, but its body selects the correct locale variable. `src/lib/fonts.spec.ts` verifies stylesheet scope and the normal/404 fallback behavior.

Type treatments combine size, line height, weight and tracking. Use only the complete presets from [Geist Typography](https://vercel.com/geist/typography), with Jost and locale-specific fallback families. The selected first concept supplies the prominent display hierarchy and stacked introduction/actions. The user's complete-preset constraint takes precedence over the mockup's approximate font metrics, invented copy and oversized KPI figures. Do not reproduce its custom 700-weight display, 78px line height or -0.03em tracking.

`--type-<preset>-*` primitives store the official size, line height, weight and tracking. Semantic aliases and Tailwind treatments select those combinations; components must not mix metrics from different presets. Sizes are rem-based to support text enlargement. Keep the adopted 1rem minimum; smaller Geist presets are available upstream but are not used here. Email and the standalone root-error document retain their independent rendering rules.

| Site role                     | Utility                              | Complete Geist preset                                  | Size / line height        | Weight | Tracking         |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------ | ------------------------- | ------ | ---------------- |
| Home display                  | `text-hero`                          | Heading 72; Heading 40 on mobile                       | 72 / 72; 40 / 48          | 600    | -0.06em          |
| Page display                  | `text-display`                       | Heading 64; Heading 40 on mobile                       | 64 / 64; 40 / 48          | 600    | -0.06em          |
| Section heading               | `text-headline`                      | Heading 48; Heading 32 on mobile                       | 48 / 56; 32 / 40          | 600    | -0.06em; -0.04em |
| Editorial title               | `text-editorial-title`               | Heading 32; Heading 24 on mobile                       | 32 / 40; 24 / 32          | 600    | -0.04em          |
| Hero and article introduction | `text-hero-copy`                     | Copy 24; Copy 20 on mobile                             | 24 / 36; 20 / 36          | 400    | 0                |
| Card title                    | `text-title`                         | Heading 24                                             | 24 / 32                   | 600    | -0.04em          |
| Compact title                 | `text-title-small`                   | Heading 20                                             | 20 / 26                   | 600    | -0.02em          |
| Lead                          | `text-lead`                          | Copy 20                                                | 20 / 36                   | 400    | 0                |
| Long-form body                | `text-body-large`                    | Copy 18                                                | 18 / 28                   | 400    | 0                |
| Body and caption              | `text-body`, `text-caption`          | Copy 16                                                | 16 / 24                   | 400    | 0                |
| Label                         | `text-label`                         | Label 16 Strong                                        | 16 / 20                   | 500    | 0                |
| Action                        | `text-control`                       | Button 16                                              | 16 / 20                   | 500    | 0                |
| Financial display / KPI       | `text-data-display`, `text-data-kpi` | Heading 40; Heading 32 on tablet; Heading 24 on mobile | 40 / 48; 32 / 40; 24 / 32 | 600    | -0.06em; -0.04em |
| Financial ring                | `text-data-ring`                     | Heading 40                                             | 40 / 48                   | 600    | -0.06em          |
| Financial row                 | `text-data-row`                      | Label 20                                               | 20 / 32                   | 400    | 0                |
| Holdings table figures        | `text-body`                          | Copy 16                                                | 16 / 24                   | 400    | 0                |
| Holdings symbols and totals   | `text-label`                         | Label 16 Strong                                        | 16 / 20                   | 500    | 0                |

Metrics were checked against the official public stylesheet on 2026-10-17. Geist's Copy Strong modifier uses 550, not 700; `text-body-strong` and `text-body-large-strong` apply that complete treatment. Native `strong` and `b` use Copy Strong by default; explicit heading/data treatments retain their own preset weight. Labels use the full Label 16 Strong treatment instead of adding a bold weight to Copy 16. Font family, brand colors, opacity and semantic heading levels remain separate from text metrics; adopting a Strong modifier does not recolor existing text.

Financial values keep tabular numerals. Chart axis labels use Copy 16 with normal line height; the axis container compensates for the line box so label centers stay aligned with the SVG grid at both normal and enlarged text sizes. `performance-chart.spec.ts` verifies the alignment after scrolling each deferred chart into view. The Logo uses SVG images rather than typography utilities. `BrandLogo` renders tightly framed derivatives of `public/logo.svg`: `logo-wordmark.svg` for light surfaces and `logo-wordmark-inverse.svg` for the black Footer. Both preserve the original outlined paths and blue period; the inverse uses a black SVG background and changes black glyph fills to white. Keep the master unchanged. `--width-brand-logo` controls responsive image width; preserve its intrinsic aspect ratio and constrain it to available space. Do not reconstruct the Logo with live text or CSS font metrics.

Page and major section headings lead the reading order. KPI values and Home's performance callout use the same subordinate financial scale: `2.5rem` above 1100px, `2rem` from 801–1100px and `1.5rem` at 800px or below. These are site-specific assignments from Geist's Heading 40, Heading 32 and Heading 24 tiers, not a Geist requirement for financial data. The shared KPI treatment also sizes Support's amount choices. Chart-center labels and table figures retain their separate roles. Preserve data text, colors, note opacity and tabular alignment; do not enlarge headings to compensate for oversized values.

Home, Portfolio and Performance establish a named `financial-summary` inline-size container on their main content. Three-column KPI bands stack below 48rem of available width; Portfolio's two-column summary stacks below 32rem and resets explicit cell positions. These rem thresholds respond to enlarged root text, keeping numbers on one line without shrinking them. The existing 800px phone layout still applies. Ordinary desktop column counts and square data surfaces remain unchanged.

`financial-type-hierarchy.spec.ts` checks Home, Portfolio, Performance and Support across three languages, both sides of the 800px breakpoint, 320/390px phones and 200% text size. Values must remain below page and major section headings without clipping, wrapping the number or introducing page overflow. The existing Home performance checks preserve chart reflow and navigation.

Home uses a 72px display, a Copy 24 introduction above left-aligned actions, and a 1312px content maximum. The About heading precedes its body in one editorial column. KPI labels, values and notes form a compact group rather than pushing values to the bottom of tall cells. Keep the hero lead within 64ch and allow actions to wrap. Memo and form titles use the editorial title role; chart and Footer titles use Heading 24. Article body, language notice and disclaimer share a 65ch reading measure. Preserve existing content and square KPI surfaces. The generated concept is art direction, not an exact source for colors, invented copy or oversized financial figures. Production brand tokens, verified content and the subordinate KPI scale take precedence.

All three languages use the same preset metrics, including tracking. Chinese roots keep their own font fallback and English articles retain `lang="en"`; neither changes the preset metrics. Sizes use rem rather than fixed pixels so browser text enlargement works. Fix narrow layouts instead of shrinking body text; cards, metadata and controls must wrap.

### Neutral colors and materials

Adopt the light sRGB values from [Geist Colors](https://vercel.com/geist/colors), with owned dark semantic aliases. The ten gray steps serve component backgrounds (100–300), borders (400–600), high-contrast fills (700–800) and text (900–1000). The scale is role-based, not a monotonically spaced brightness ramp. Page Background 1 is white. The site overrides Geist Background 2 with the original `--background-gray: #f8f9fb` for Hero and secondary section bands, subtle surfaces and the material background outline. The original `--gray: #ededed` supplies dividers, chart grids and `--border-subtle`, including memo-grid separators. Keep the ten-step Geist neutral palette unchanged; these two brand aliases are explicit exceptions. In light mode, secondary text uses Gray 900 (30% gray); stronger supplementary text uses Gray 1000 (9% gray).

Use solid gray for borders and translucent black for material shadows. Standard fields use white, 6px corners and Gray 800 borders to meet the non-text contrast target; do not use a faint decorative surface outline as their only boundary. Brand-colored selection, hover and focus states remain independent of the neutral palette. Black primary text, the two original grays, all existing brand/financial colors and the black Footer are explicit exceptions.

[Geist Materials](https://vercel.com/geist/materials) combine fill, outline, shadow and radius:

- The memo grid uses the Base surface: white cards, 6px corners and the single shared outline. Interior separators use solid gray. Corners are applied to the cards without clipping the grid, preserving keyboard focus outlines. It has no extra CSS border or raised shadow.
- The language popup uses Menu material: white fill, 12px corners and the official outline plus three neutral elevation layers. Its Positioner owns stacking. Do not add a second border around the material's shadow stroke.
- Standard form fields use the accessible border adaptation above. Footer fields remain inverse pills.
- Financial blocks remain square and flat. Full-screen mobile navigation remains edge-to-edge white, without a rounded floating frame. Pill CTAs and the black Footer preserve their brand treatment.

Values were checked against the official Geist stylesheets on 2026-10-15. `tokens.css` owns the implementation; no Geist font or component package is required. Do not add unused tooltip or modal materials for components the site does not render.

Apply a complete type treatment rather than repeating its utilities. Keep color, opacity, spacing and heading semantics independent. Use the corresponding complete Strong or heading preset for emphasis and table labels; do not add weight or tracking overrides. CSS Modules use the same source tokens.

Register new size names in `src/lib/utils.ts` so class merging distinguishes sizes from colors. Test computed styles and reflow rather than class strings. `typography-roles.spec.ts` checks role metrics and complete preset membership (size, line height, weight and tracking) across the public pages, with separate SVG loading, aspect-ratio, navigation and reflow checks in `brand-logo.spec.ts`; `financial-type-hierarchy.spec.ts` covers 200% scaling and subordinate financial values. Reference: [Tailwind font-size themes](https://tailwindcss.com/docs/font-size#customizing-your-theme).

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
- Check all three languages, root font sizes up to 200%, long translations and changed content. The SVG Logo must shrink proportionally within its available width.
- Allow local values for chart geometry and optical adjustments when shared spacing tokens do not fit.

### Contrast policy

Use `--interactive-accent` (Deep Blue) for normal-size interactive text. Medium Blue remains a brand primitive for decorative details, surface-appropriate non-text indicators and the dashed benchmark line; it is not a normal-text color on white. `--surface-selected` provides a pale blue surface for desktop navigation and language states. Use Deep Blue text on that surface.

The baseline focus outline consumes `--focus-ring-color`, which follows `--interactive-accent`: Deep Blue in light mode and Bright Blue in dark mode. The black Footer sets the inherited role to `--focus-ring-on-dark` (Bright Blue). Inputs retain their explicit surface variants. Check the outline against its adjacent surface at a minimum of 3:1: Medium Blue on Bright Blue is insufficient. Forced-colors mode continues to use the system Highlight color.

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

Mobile navigation uses `Sheet` over Base UI `Dialog` for naming, focus containment, background isolation and scroll locking. The existing `closed → opening → open → closing` phase remains the only application state source: keep the modal open through the closing animation. Use Base UI's `initialFocus` and `finalFocus` for the existing close-control entry and route-aware return behavior. Render the visible close button through `SheetClose`; the replaced opening trigger is inert until the modal closes. Do not add a second focus trap, body lock or background `inert` controller. The language disclosure remains native `details` with its existing animation.

Inside the Sheet, compose primary links with `SidebarMenu`, `SidebarMenuItem` and `SidebarMenuButton render={<Link ... />}`. These are a menu-only shadcn/ui composition using Base UI `useRender`, customized for this site's full-width mobile navigation. `SidebarMenu` retains an explicit list role for Safari when the reset removes list markers. Pass one route-derived active value to `isActive` and the link's `aria-current`; preserve real Next.js links, wrapping, Tab order and navigation dismissal. Sheet remains the state owner; the menu subset has no provider, collapse state, shortcut or tooltip. It does not implement the full upstream Sidebar API.

`FieldGroup` groups controls. Contact, subscription and Preferences forms use `contents` to preserve the native form's grid, event target, validation and control placement; ordinary vertical groups can use `stack`.

`FormField` connects `Field` and `FieldLabel`. `NativeSelect` keeps the platform picker. `Alert` provides shared result styling and live feedback. `ServiceLoading` pairs localized busy text with static, decorative `Skeleton` placeholders hidden from assistive technology.

UI primitives own stacking through `--layer-navigation`, `--layer-modal` and `--layer-popover`. Header composition controls responsive visibility without duplicating Sheet positioning or stacking.

## UX tasks and acceptance

Use Fluent 2 Content Design to identify the reader, their task and the information needed at each decision. Use Vercel's interface guidelines for input behavior, focus, loading and errors. Use Cieden as a reference for task analysis, information architecture and usability checks. The tasks below describe the site's current intent; they are working assumptions, not findings from a user-research study.

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

Avoid unnecessary geometry queries in interaction handlers. Cancel touch feedback from the known movement distance before reading element bounds; small movements still use current bounds so moving controls remain accurate. Reduced-motion disclosures settle immediately without measuring an unused animation height. These changes reduce opportunities for [forced reflow](https://developer.chrome.com/docs/performance/insights/forced-reflow); they do not establish that an unattributed Lighthouse reflow came from these handlers.

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

Apply [Fluent 2 Content Design](https://fluent2.microsoft.design/content-design) through plain language, concise headings, descriptive links and clear next steps. Adapt tone to the reader's task and emotional context. Prefer active voice and address the reader directly in operational guidance. Use second person for reader tasks and named third person for author background. Preserve verified financial and legal meaning when simplifying copy.

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

Fluent 2 owns content design: reader needs, plain language, tone, active voice and clear next steps. [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines#copywriting) owns capitalization: interface headings and buttons use Chicago Title Case; marketing pages use sentence case. This is an explicit project choice from Vercel's brand-specific guidance, not a universal accessibility rule.

| Context                                                                                      | Capitalization                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home, About, memo index and articles, Disclaimer; Contact and Support introduction/Hero copy | Sentence case for editorial headings and page-specific links/actions. Capitalize the first word, proper nouns and acronyms.                                                                        |
| Portfolio and Performance; preferences, confirmation and recovery screens                    | Chicago Title Case for interface headings and buttons. Use the same treatment for short field labels and table column headings. Explanations, status messages and data notes remain sentence case. |
| Contact, subscription and payment forms, including forms embedded in introduction pages      | Chicago Title Case for form headings, labels and buttons. Instructions and error/success messages remain sentence case.                                                                            |
| Shared Header, Menu and Footer                                                               | Consistent Title Case for visible navigation/control labels and section headings across routes. Accessible instructions such as “Open menu” remain sentence case.                                  |
| Transactional emails and source material                                                     | Email copy follows Fluent 2 sentence case. Preserve source quotations, names, technical identifiers and published source titles.                                                                   |

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

Home, Portfolio and Performance contain their KPI summaries inside the Hero content container, aligned to the title edges rather than the viewport. Keep 48px between the introduction/actions and summary, and 48px of outer Hero padding above and below. Portfolio shows three summary cells (market value, total return and holdings), in one desktop row or stacked when the Hero summary is narrower than 48rem. Net Cost Basis remains in the underlying data and holdings calculations, not as a summary cell. Current Holdings uses the white primary surface. When its Hero summary is narrower than 10rem (for example, 320px with 200% root text), reduce cell inline padding to 4px so full currency amounts stay on one line without reducing the type size. The following About, Holdings and Performance chart sections use 48px top and bottom padding, avoiding stacked section-sized gaps. All page heroes, including Disclaimer and the memo article header, use symmetric 48px top and bottom padding. The first content section below a general page Hero uses 48px top and bottom padding, including About, Memos, Subscribe, Support, Disclaimer and Preferences. This makes the introduction-to-content transition 96px across page families. Home About uses symmetric 48px top and bottom padding. Later sections retain their existing spacing (normally 96px desktop and 72px mobile). Keep form status-message reserve space inside the form; symmetric section padding does not remove that reserve. About content and closing columns stack below 56rem of available page width, allowing enlarged text to reflow without shrinking typography. Footer Logo artwork uses a 32px alignment box matching the adjacent heading line boxes; the glyphs keep their intrinsic aspect ratio.

Footer subscription buttons use black text through a local `--action-inverse-text` override. Keep that color for idle, hover, keyboard focus and submitting states; other inverse buttons retain their existing treatment.

Current Holdings owns symmetric 48px outer vertical padding. Its heading and return note own only internal spacing. Holdings figures use Copy 16; stock symbols and totals use Label 16 Strong on desktop and mobile. Keep tabular figures, native table semantics and sorting controls.
