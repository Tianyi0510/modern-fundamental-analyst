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
| `FormField`, `Input`, `Textarea`, `NativeSelect` | Label association, visible or hidden label, standard rounded or inverse compact fields. Business validation and submission stay with the feature.                                                                                                          |
| `Alert`                                          | Standard or inverse typography, reserved space and polite live feedback; an explicit alert role supports assertive announcements.                                                                                                                          |
| `PortfolioMetric`                                | Plain, highlight, brand or paper financial surfaces, shared typography and surface-specific note colors.                                                                                                                                                   |

Use Tailwind for layout and ordinary states, and CSS Modules for complex structures and motion. Both use the same tokens. References: [Next.js CSS](https://nextjs.org/docs/app/getting-started/css#recommendations), [Tailwind themes](https://tailwindcss.com/docs/theme), and [Preflight](https://tailwindcss.com/docs/preflight).

Choose tokens by purpose. CSS defines values and breakpoints. Keep sizing, spacing and overflow predictable.

- Use Material 3 text roles and `rem` units. Do not invent sizes to fit one screenshot or change a role solely at a breakpoint.
- Choose heading levels by document structure, independent of visual size. Memo cards use H2 on the index and H3 on Home, including placeholders. Each disclaimer section has an H2 in every locale, even without an introductory lead.
- Use tabular figures for financial comparisons.

### Color roles and shape ownership

Use Material 3's [color roles](https://m3.material.io/styles/color/system/how-the-system-works) and [shape customization principles](https://m3.material.io/styles/shape/corner-radius-scale) to separate values from component responsibilities. This site keeps its static brand palette and Jost while adapting component appearance for readability and consistent state feedback. These CSS roles do not implement Material's generated tonal palettes, dynamic color, dark theme or contrast settings. Naming a role does not establish accessibility compliance; verify the rendered foreground/background pair with its alpha and element opacity.

Palette primitives (`--black`, `--white`, the three blues and neutral grays) live in `tokens.css`. Website components use purpose-based aliases. Tailwind theme aliases and CSS Modules resolve to the same source values. Email templates, brand assets and generated metadata images retain their independent rendering contracts.

| Role family                                                                                   | Use                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--surface-primary`, `--surface-inverse`, `--surface-brand`, `--surface-highlight`            | White, black, Deep Blue and Bright Blue surfaces. Pair with the existing `--text-*` roles; the KPI tone table below defines financial summary pairings.                                                                                                                     |
| `--surface-muted`, `--surface-neutral`                                                        | Existing page/field gray and neutral skeleton or menu-hover gray.                                                                                                                                                                                                           |
| `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-muted`                       | Black, 0.72-alpha secondary/muted text and 0.64-alpha tertiary text. Select by responsibility, not by the current equality of values.                                                                                                                                       |
| `--text-inverse*`, `--text-placeholder-inverse`                                               | White text, 0.8-alpha secondary and 0.72-alpha tertiary inverse text, and 0.72-alpha inverse placeholders.                                                                                                                                                                  |
| `--border-strong`, `--border-subtle`, `--border-inverse`, `--border-brand`, `--border-accent` | Black, neutral gray, white and the two existing blue border roles. Translucent border roles retain their individual alpha values.                                                                                                                                           |
| `--interactive-accent`, `--focus-ring-*`                                                      | Medium Blue decorative accents and Deep Blue default/light keyboard focus. Inverse surfaces use Bright Blue focus. Interactive text uses `--text-interactive` (Deep Blue).                                                                                                  |
| `--surface-*-hover`, `--surface-*-current`, `--surface-card-pressed`, `--surface-state-focus` | State composites named for their owning surface. Transparent quiet actions retain backdrop dependence; page surfaces use white-backed Deep Blue layers. Current navigation keeps a Bright Blue container. Neutral table hover guides reading without implying a row action. |
| `--chart-*`, `--text-return-*`                                                                | Portfolio/benchmark lines, grid/zero lines, ordered allocation categories and financial return text. Keep financial and brand meanings separate.                                                                                                                            |

Use [Material 3 state layers](https://m3.material.io/foundations/interaction/states/state-layers): `--state-hover` is 8%, and focus/press are 10%. These percentages describe the overlay, not the text opacity. Button variants provide their resting surface and content color; the shared primitive composites a single content-colored state layer. Focus and press replace hover rather than accumulating overlays. Keep the persistent focus outline and native disabled state.

Primary actions use Deep Blue with white text; contrast actions use black with white text; inverse actions use white with black text; quiet actions use Deep Blue on a transparent surface. Pointer hover, keyboard focus and held touch use the same role mapping while retaining their distinct input behavior. Touch hover resets must not clear an active press or keyboard focus. Disabled opacity remains 0.64, with the existing 0.55 Preferences variants, so submission and recovery states remain recognizable.

KPI notes use `--opacity-kpi-note` at 0.87. This is a site choice that improves caption contrast while preserving the value/note hierarchy. Body, inverse and placeholder alpha values are also site choices, not Material defaults. Keep financial and brand roles separate.

| Shape token                                          | Value                  | Responsibility                                  |
| ---------------------------------------------------- | ---------------------- | ----------------------------------------------- |
| `--radius-field`, `--radius-quiet`, `--radius-small` | 8px                    | Standard fields, quiet actions and skeletons.   |
| `--radius-menu`                                      | 12px                   | Desktop language popover.                       |
| `--radius-card`                                      | 16px                   | Memo cards and Support amount options.          |
| `--radius-pill`                                      | 999px                  | CTA, language-trigger and Menu-button rounding. |
| `--radius-round`                                     | `calc(infinity * 1px)` | Circular markers and allocation visuals.        |

Memo cards use individual borders and 24px gaps; Support options use 12px gaps. Keep full-width KPI sections, tables and editorial surfaces square. A shape does not imply a universal action. Keep the Menu touch ring's inherited radius and avoid decorative shape morphing in dense content.

`src/app/styles/shape-color.spec.ts` checks rendered controls, inverse fields and navigation. `material-states.spec.ts` verifies state colors, contrast, card/option selection and localized layouts. Existing KPI contrast, touch and form tests retain their behavioral assertions. Keep screenshots and comparison evidence outside the checkout.

### Spacing scale and layout ownership

Follow Material 3's [spacing principles](https://m3.material.io/styles/spacing/overview), [application guidance](https://m3.material.io/styles/spacing/applying-spacing) and [measurement tokens](https://m3.material.io/styles/spacing/tokens). Material currently provides spacing implementation tokens for Compose; this project owns its CSS mapping.

The baseline is 8 CSS pixels: `--space-100` maps Material's `space100` intent to the web. A suffix expresses a percentage of that baseline, not an ordinal index: `--space-300` is 24px. Define values once in `tokens.css` and reference them from Tailwind utilities and CSS Modules. Do not change Tailwind's default spacing multiplier or use the previous `--space-2` through `--space-11` names.

| Tokens                                                 | CSS values                       | Purpose                                       |
| ------------------------------------------------------ | -------------------------------- | --------------------------------------------- |
| `0`, `25`, `50`, `75`, `100`, `125`                    | 0, 2, 4, 6, 8, 10px              | Zero, small nested spacing and the baseline   |
| `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900` | 16, 24, 32, 40, 48, 56, 64, 72px | Main spacing scale                            |
| `150`, `250`, `350`, `450`, `650`                      | 12, 20, 28, 36, 52px             | Site extensions for fields and denser layouts |
| `1000`, `1200`                                         | 80, 96px                         | Site extensions for editorial sections        |

Keep spacing fixed when only text size increases to 200%; typography remains in `rem`. Browser zoom still scales the whole interface. Buttons therefore use fixed padding and icon gaps instead of `em` spacing. Let labels wrap and controls grow when necessary; do not shrink text to preserve a row.

Semantic tokens describe shared relationships or component attributes:

| Relationship          | Desktop | At 800px and below |
| --------------------- | ------- | ------------------ |
| Page gutter           | 32px    | 16px               |
| Section block padding | 96px    | 72px               |
| Heading to content    | 56px    | 40px               |
| Related content       | 40px    | 32px               |
| Footer block padding  | 72px    | 48px               |
| Memo card padding     | 32px    | 24px               |
| Hero label to title   | 64px    | 64px               |
| Paragraph gap         | 24px    | 24px               |
| Footer content gap    | 16px    | 16px               |

Use `--space-field-label-gap`, `--space-form-row-gap`, `--space-form-column-gap`, `--space-field-padding-block` and `--space-field-padding-inline` for their named attributes. Controls retain their established heights, colors, focus and submission behavior. Card variants can retain denser padding when their content and responsibility differ.

- **Padding** belongs to the containing surface. Keep full-width backgrounds outside `Container` and preserve its responsive gutters.
- **Gap** belongs to the parent arranging siblings. Hero heading groups, Footer navigation, paragraph stacks and form introductions use parent-owned gaps instead of accumulating child margins. Align text stacks to their start so grid stretching does not add unintended whitespace.
- **Margin** remains appropriate for article flow, separation from another section and intentional `auto` alignment. Do not replace these mechanically with grid layouts.
- Retain local values for chart coordinates, responsive chart geometry, borders, focus outlines, safe-area insets and brand/icon optical adjustments. These are not interchangeable with layout spacing.

The spacing migration preserves section hierarchy and responsive gutters. It normalizes small repeated discrepancies such as 66px hero gaps to 64px, 14px Footer gaps to 16px and 30px Memo card padding to 32px. It does not impose one density on every component or round every dimension to a grid.

`src/app/styles/spacing.spec.ts` checks the rendered scale, adaptive spacing, parent-owned gaps, fixed spacing under 200% text, three-language layout and mobile overflow. Keep screenshots and baseline comparisons outside the checkout; use affected browser checks instead of the full suite for ordinary spacing work.

### Typography roles

Use the [Material 3 baseline Type Scale](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-typescale.scss): 15 roles with explicit sizes, line heights, weights and tracking. Body Medium is 14px; Body Large is 16px. Do not generate the scale by repeatedly multiplying 14px by 1.125.

Retain Jost and the existing Chinese font fallbacks. Store dimensions in `rem` relative to the browser's default 16px root; never force the root to 14px. Text must scale with user preferences. The previous 1rem minimum, fluid display sizes and language-specific tracking overrides no longer apply.

| Role            | Size / line height (px at default root) | Weight | Tracking (px) |
| --------------- | --------------------------------------- | ------ | ------------- |
| display-large   | 57 / 64                                 | 400    | -0.25         |
| display-medium  | 45 / 52                                 | 400    | 0             |
| display-small   | 36 / 44                                 | 400    | 0             |
| headline-large  | 32 / 40                                 | 400    | 0             |
| headline-medium | 28 / 36                                 | 400    | 0             |
| headline-small  | 24 / 32                                 | 400    | 0             |
| title-large     | 22 / 28                                 | 400    | 0             |
| title-medium    | 16 / 24                                 | 500    | 0.15          |
| title-small     | 14 / 20                                 | 500    | 0.1           |
| body-large      | 16 / 24                                 | 400    | 0.5           |
| body-medium     | 14 / 20                                 | 400    | 0.25          |
| body-small      | 12 / 16                                 | 400    | 0.4           |
| label-large     | 14 / 20                                 | 500    | 0.1           |
| label-medium    | 12 / 16                                 | 500    | 0.5           |
| label-small     | 11 / 16                                 | 500    | 0.5           |

The site uses [official Emphasized styles](https://github.com/material-components/material-components-android/blob/master/docs/theming/Typography.md#emphasized-scale) for page, section, card and compact headings, plus prominent financial values. Emphasized Display, Headline and Title Large use **500**; Title Medium and Small use **700**. Body and Label emphasized variants use 500 and 700 respectively. Emphasis retains the role's size, line height and tracking.

Baseline tokens remain unchanged. `--md-sys-typescale-emphasized-<role>-weight` defines the optional weight for each role. Body copy, notes, controls, labels and financial table rows keep their baseline treatments; explicit inline emphasis and table totals remain available.

`--md-sys-typescale-*` variables define these treatments. Tailwind exposes them as `text-m3-<role>`, such as `text-m3-body-medium`. `src/lib/utils.ts` registers every role for class merging. Site aliases select a role and, where indicated, its Emphasized style:

| Site utility                      | Material 3 role                                                       |
| --------------------------------- | --------------------------------------------------------------------- |
| `text-display`                    | Display Large Emphasized; Display Small Emphasized at 800px and below |
| `text-data-display`               | Display Large Emphasized                                              |
| `text-headline`, `text-data-ring` | Headline Large Emphasized                                             |
| `text-title`                      | Title Large Emphasized                                                |
| `text-title-small`                | Title Medium Emphasized                                               |
| `text-data-row`                   | Title Medium                                                          |
| `text-lead`, `text-body-large`    | Body Large                                                            |
| `text-body`                       | Body Medium                                                           |
| `text-label`, `text-control`      | Label Large                                                           |
| `text-caption`                    | Body Small                                                            |
| `text-data-kpi`                   | Display Medium Emphasized                                             |

Apply all four properties together in utilities and CSS Modules. Use Body Large for native text-entry fields. Preserve explicit emphasis, prominent labels, tabular figures and wordmark tracking. Interface role tracking is identical across English and Chinese; branding remains separate. Heading levels still follow document structure, not font size. Email keeps its independent compatible styling.

A KPI's `tone` determines its colors, independent of card order:

| Tone        | Surface     | Text        |
| ----------- | ----------- | ----------- |
| `plain`     | White       | Black       |
| `highlight` | Bright Blue | Deep Blue   |
| `brand`     | Deep Blue   | Bright Blue |
| `paper`     | White       | Deep Blue   |

KPI notes use their value's text color with `--opacity-kpi-note` at 0.87 on every tone. Check at least 4.5:1 contrast after compositing over the surface; the highlight tone must remain above the threshold.

Benchmark lines and legend keys use `--chart-benchmark` (Medium Blue), with at least 3:1 contrast on white. Keep the dashed pattern and monthly table alternative.

Preserve text colors and opacity in normal, hover, active, disabled and inverse states unless a change is authorized. Pair positive and negative colors with numbers or symbols.

Portfolio return text uses `--text-return-positive` (`#037B66`) and `--text-return-negative` (`#D60A22`). These site colors were selected from [Yahoo Finance's quote table](https://finance.yahoo.com/markets/stocks/most-active/) on October 5, 2026. Both meet 4.5:1 contrast on white and the table's pale blue hover surface. Keep the non-text tokens `--price-up` and `--price-down` separate.

Medium Blue on white is about 3.39:1; retain it for brand decoration and non-text indicators, and use Deep Blue for interactive text on light surfaces. These targeted checks do not establish full WCAG compliance.

Use Jost for Latin text and numbers, Noto Sans TC for Traditional Chinese, and Noto Sans SC for Simplified Chinese.

Brand masters are [`public/icon.svg`](../public/icon.svg) and [`logo.svg`](../public/logo.svg), with PNG copies beside them. Preserve the square icon, single-line wordmark and colored period. Generate icons and social images from these masters. Keep App Router icon and Apple icon files aligned with the icon master; sharing metadata uses [`public/og-logo.png`](../public/og-logo.png). Old `/images/` URLs permanently redirect to root assets.

Preserve information and action priorities at every width.

- Use Display Small for narrow page titles; keep other role sizes consistent across viewports. Allow wrapping for enlarged or unbreakable text. Desktop line breaks must not isolate words or split short Chinese phrases on mobile.
- Align related form fields unless a visible container explains an inset. Contact and Preferences use 8px fields; compact Footer fields are pill-shaped.
- Check all three languages, root font sizes up to 200%, long translations and changed content. The footer wordmark may wrap.
- Allow local values for chart geometry and optical adjustments when shared spacing tokens do not fit.

### shadcn/ui components

The project owns its customized [shadcn/ui](https://ui.shadcn.com/docs) source. `components.json` targets Tailwind v4, `@/*` imports and `src/components/ui/`. `cn` in `src/lib/utils.ts` merges classes; Button variants use `class-variance-authority`. Import primitives directly. `ButtonLink` shares Button styles and preserves link semantics instead of using upstream `asChild`.

Use the Button variants and sizes listed above. The quiet text variant preserves the Preferences unsubscribe treatment. Fields keep `standard` and `inverse` surface variants; Textarea and NativeSelect share the input appearance. Disabled fields retain text colors and use a dashed border with a not-allowed cursor. Native controls keep refs, labels, validation and submission without a client boundary.

To add a primitive:

1. Inspect its source and dependencies with `npx shadcn@latest view <component>`.
2. Add only what is needed with `npx shadcn@latest add <component>`.
3. Review the full diff. Map colors, focus, disabled and motion states to semantic tokens. `accent` is Medium Blue for decoration; `interactive` is Deep Blue for action text.
4. Preserve Jost, the reset and customized primitives. Add a client boundary or dependency only when the component needs it.
5. Verify rendered states, native forms and navigation. Upstream defaults do not define this site's design.

Desktop language selection uses Radix `DropdownMenu`. Put linked locale items in `DropdownMenuGroup`, preserving `hrefLang`, current-language hints and validated recovery parameters. Radix owns item navigation and dismissal; the header adapts upward-arrow entry and Tab exit.

Mobile navigation uses `Sheet` (Radix Dialog) for naming, focus containment, background isolation and scroll locking. Keep it open until closing finishes. Do not add a second focus trap, body lock or background `inert` controller.

`FieldGroup` groups controls. Contact, subscription and Preferences forms use `contents` to preserve the native form's grid, event target, validation and control placement; ordinary vertical groups can use `stack`.

`FormField` connects `Field` and `FieldLabel`. `NativeSelect` keeps the platform picker. `Alert` provides shared result styling and live feedback. `ServiceLoading` pairs localized busy text with static, decorative `Skeleton` placeholders hidden from assistive technology.

UI primitives own stacking through `--layer-navigation`, `--layer-modal` and `--layer-popover`. Header composition controls responsive visibility without duplicating Sheet positioning or stacking.

### Elevation and floating surfaces

Follow [Material 3 elevation principles](https://m3.material.io/styles/elevation/overview): use a small number of levels and apply shadows where a surface needs separation from its background. Elevation expresses visual depth; `--layer-*` tokens control CSS stacking order. Their values are independent.

`--shadow-popover` in `src/app/styles/tokens.css` owns the desktop language dropdown's existing `0 16px 40px rgba(0, 0, 0, 0.12)` shadow. `DropdownMenuContent` applies it through Tailwind. This is a site-specific shadow, not an official Material dp-to-CSS conversion. Keep its geometry and opacity unchanged when reusing it for the same surface role.

The full-screen mobile Sheet remains shadowless. KPI blocks and tables stay flat; buttons use state layers and cards use borders for separation. Add another shadow token only for a demonstrated surface role; do not add unused elevation levels or tonal overlays.

`src/components/site-header.spec.ts` verifies the rendered dropdown shadow across all three languages, keyboard entry, dismissal and focus restoration, and the mobile dialog's shadowless presentation.

## Interaction, motion, and accessibility

Make every operation understandable and reliable. Include accessibility in layout, content and interaction design.

- Make controls recognizable and keyboard focus clearly visible. Touch hover resets must preserve active and `:focus-visible` feedback. Shared CTA hover recovery belongs to the button component; reset only idle hover, including transforms, without overriding active or keyboard focus.
- Shared Button, ButtonLink and round CTAs opt into `TouchPressFeedback` with `data-touch-feedback`. One delegated passive pointer listener supplies `data-touch-pressed` while a primary touch is held; release, cancellation, movement, scrolling, page hiding and cleanup clear it. Native click, navigation, focus and form behavior remain unchanged, and the controls remain server-compatible. CSS uses the shared Spatial Fast preset and reduced-motion override. Menu feedback retains its separate ownership because it transfers between trigger and close controls. Verify trusted touch holds in Chromium, tap/release in both engines, and cancellation events separately; mouse presses do not establish touch behavior.
- Give loading, success, failure, disabled, and retry states clear meanings. Forms should prevent duplicate submissions, announce outcomes with text and live regions, and clear stale outcomes when the user edits again.
- Use motion to explain state and spatial changes. Expanding and closing should support repeated input, interruption, and reversal while keeping visuals, focus, interactivity, and scroll state synchronized.
- Preserve full function and necessary feedback under `prefers-reduced-motion`. Focus outlines should remain visible in standard and forced-colors modes; disabled states should not move.

Subscription forms retain standard Contact and inverse Footer treatments. Their independent instance state and delivery contracts are documented in [Integrations](INTEGRATIONS.md#subscription-entry-points).

Contact draft and retry recovery belong to the [Contact workflow](INTEGRATIONS.md#contact-draft-recovery).

Choose focus tokens according to light or inverse form surfaces. Preferences retain their own disabled opacity. Reserve space for status messages and allow long errors to wrap. After a programmatic field reset, keep the success message visible until the user edits again.

### Menu behavior

- The mobile panel slides left to open and right to close. Navigation fades early during closing; the icon rotates from X back to Menu.
- The language disclosure starts collapsed, shows the current language as its label, and lists only the other languages.
- Mobile navigation and language controls use fast Deep Blue text feedback for hover, focus, pressed, current and expanded states. Keep their geometry stable, with no separators or background fills. Desktop navigation uses subtle state layers and a persistent current-page container.
- Keyboard focus adds an underline, distinct from current or expanded color. The desktop language menu supports Enter, Space, arrows, Escape and Tab; the mobile disclosure supports Enter, Space and Tab.
- The open close-button has blue fill and a black border. Its keyboard ring stays visible under `:focus-visible`. Touch uses a separate blue ring and slight scale reduction; release and cancellation fade it, including short taps. The effect transfers from trigger to close control during opening.
- Reduced motion keeps the held touch ring, omits scaling and release animation, and may complete state changes immediately.

Use `closed → opening → open → closing` as the mobile menu's single state source. Keep Sheet open, the background isolated and scrolling locked until dismissal completes. Escape dismisses the Sheet; navigation links keep link semantics.

On entry, focus the close control. During closing, make the wordmark and navigation inert and move focus to the close control. On dismissal, restore the trigger with `preventScroll`; suppress restoration for an actual route change, but restore it for same-route dismissal. Check wrapping and overflow inside the drawer as well as across the page.

### Motion physics and ownership

Use the [Material 3 Expressive Motion Physics System](https://m3.material.io/styles/motion/overview/how-it-works). Spatial springs animate position, size and rotation with controlled overshoot. Effects springs animate color, opacity, borders and shadows without overshoot. Preserve every final layout, color, opacity and input state.

`src/lib/motion.ts` is the parameter source. These mass-one presets follow [Google's Compose implementation](https://android.googlesource.com/platform/frameworks/support/+/43a3dc60a427d3fffa9cbc3f83e5f9a1c5cec29a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MotionScheme.kt):

| Preset          | Stiffness | Damping ratio | Site use                                          |
| --------------- | --------- | ------------- | ------------------------------------------------- |
| Spatial Fast    | 800       | 0.6           | Buttons, arrows, icons, small hover shifts        |
| Spatial Default | 380       | 0.8           | Disclosure height                                 |
| Spatial Slow    | 200       | 0.8           | Full-screen mobile navigation                     |
| Effects Fast    | 3800      | 1             | Link, field and sorting feedback; navigation fade |
| Effects Default | 1600      | 1             | Surface/color feedback and icon crossfade         |
| Effects Slow    | 800       | 1             | Released touch-ring fade                          |

The web implementation solves the damped oscillator analytically and samples it at 120 Hz. Duration follows settling thresholds, not a viewport-specific timer: displacement below 0.1% and speed below 1% of the travel per second for six samples. A final target sample removes negligible residual error. These thresholds and sampling are site implementation choices, not additional Material tokens.

CSS uses sampled `linear()` timing functions in `tokens.css`. Regenerate the motion declarations with `motionTokenDeclarations()` when physics changes; its unit test checks synchronization. To print fresh declarations from the repository root:

```sh
node --input-type=module -e 'import { motionTokenDeclarations } from "./src/lib/motion.ts"; console.log(motionTokenDeclarations())'
```

Replace the generated motion declarations in `tokens.css`, format the file, then run `npm run test:unit -- src/lib/motion.test.ts`.

Pair each preset's duration and easing. Mixed transitions list spatial and effects properties separately. CSS transitions use zero initial velocity and native browser reversal behavior; they are appropriate for small hover/press feedback. Native smooth scrolling remains browser-managed, and static loading placeholders remain static.

Web Animations API owns Menu panel/icon transforms and disclosure height. Retarget these springs from the rendered position and current physical velocity, using animation timeline time so paused animations reverse consistently. Clamp the full-screen panel at the viewport's left edge so overshoot cannot expose a strip of the page behind it. A clamped boundary has zero rendered velocity when retargeted. Keep opacity on a separate Effects timeline. Do not animate one property with both CSS and JavaScript. The close button temporarily yields its CSS transitions to WAAPI during dismissal.

Memos and monthly tables retain native `details`/`summary`, including without JavaScript. Keep requested state, `aria-expanded` and interactivity synchronized during closing. Clamp animated height to the summary's height so a closing spring cannot clip its control. Closing returns content focus to the summary. Resize settles the intended state and restores natural height; Menu width changes also settle instead of retaining stale pixel targets.

Completion, cancellation, reversal, reduced-motion changes and unmount must leave no stale effects. Reduced motion completes scripted transitions immediately and minimizes CSS timing while preserving held touch feedback, focus, modal isolation and scroll recovery. Do not add staggered Menu row entrances or animate chart data as part of this system.

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

`src/app/_components/semantic-content.spec.ts` checks KPI note/value color equality, 0.87 opacity and at least 4.5:1 composited contrast across locales and desktop/mobile widths. `src/features/portfolio/performance-chart.spec.ts` checks benchmark contrast. `scripts/color-contrast.ts` composites transparency before calculating WCAG luminance.

`src/lib/motion.test.ts` checks the independent spring solution, velocity continuity, overshoot boundaries, settling and CSS token synchronization. `src/components/motion-physics.spec.ts` samples real intermediate frames and reversals across locales. Existing Header, touch, disclosure and reduced-motion tests retain their behavioral coverage.

Typography and layout tests stay beside their owners. Use [AGENTS.md](../AGENTS.md#verification-and-review) to select affected checks and the [test workflow](WEB_APPLICATION_ARCHITECTURE.md#test-workflow) for runner and CI details.
