# Design System and Style Guide

## Direction

Use a financial editorial style: clear typographic hierarchy, generous section spacing, square data surfaces, pill-shaped primary controls, and restrained motion. All three languages share the same layout and component roles.

## Ownership and Cascade

| File                                  | Responsibility                                                         |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `app/reset.css`                       | Browser normalization and border-box sizing, including pseudo-elements |
| `app/styles/base.css`                 | Palette primitives, type, spacing, control and motion tokens           |
| `app/styles/colors.css`               | Semantic surface and text aliases only                                 |
| `app/styles/chrome.css`               | Shared navigation, controls and footer geometry                        |
| `app/styles/pages.css`                | Page and data layouts                                                  |
| `app/styles/typography.css`           | Shared type-role mappings                                              |
| `app/styles/component-typography.css` | Additional component type-role mappings                                |
| `app/styles/responsive.css`           | Responsive layout and accessibility preferences                        |
| `app/styles/themes.css`               | Component surface treatments and interaction overrides                 |
| `components/*.module.css`             | Scoped component layout and states                                     |

`app/globals.css` defines the import order. Semantic aliases and theme rules remain at the end to preserve the existing cascade. New color aliases belong in `colors.css`; component selectors do not. Theme rules may own background, border and interaction treatments, but should not own type sizes or page geometry.

## Color and Surfaces

Use `--surface-*` and `--text-*` aliases where possible. Preserve existing text colors, including hover, active, disabled and inverse states. Opacity changes also affect perceived text color and need separate review.

KPI cards declare `data-tone` explicitly. Reordering cards must not change their treatment:

| Tone        | Surface       | Text          |
| ----------- | ------------- | ------------- |
| `plain`     | Primary white | Primary black |
| `highlight` | Bright Blue   | Deep Blue     |
| `brand`     | Deep Blue     | Bright Blue   |
| `paper`     | Primary white | Deep Blue     |

Use positive/negative colors only with an accompanying number or sign that communicates the result. Do not rely on hue alone.

Known deferred issue: Medium Blue on white is about 3.39:1, Price Up is 3.06:1, and Price Down is 4.00:1. These pairings need separate approval for text-color changes before claiming full text-contrast compliance. They remain unchanged in this revision.

## Typography and Languages

Brand artwork uses Jost Bold (700) converted to paths in `public/brand/icon.svg` and `public/brand/logo.svg`; these are the scalable masters. Their PNG exports are 1600 × 1600 and 5600 × 1400. Keep the original square monogram and single-line wordmark layouts, including the colored period. Website icons and the 1200 × 630 `public/og-logo.png` sharing image are rendered from these vector outlines, not enlarged JPEGs.

`base.css` is the source of truth for `--font-size-*`, weight, line-height and tracking values. Choose a role by meaning, not by whichever size fits a particular viewport.

| Role                                           | Use                                         |
| ---------------------------------------------- | ------------------------------------------- |
| Page / section / card / compact title          | Progressively subordinate headings          |
| Lead / body-large / body                       | Introductory, editorial and supporting copy |
| Label / control / caption                      | Field labels, actions and metadata          |
| Data-display / data-kpi / data-ring / data-row | Financial figures by presentation context   |

Heading levels express document structure; they do not determine the visual role automatically. Do not add raw component font sizes or switch type roles at breakpoints. Text uses `rem`; display roles use bounded `clamp()` expressions. Financial figures use tabular numerals.

Jost supplies Latin text and numerals. Traditional Chinese uses Noto Sans TC for CJK glyphs; Simplified Chinese uses Noto Sans SC. Preserve localized casing and punctuation. Check wrapping in each locale and with a 200% root font size before changing title tracking or adding manual line breaks.

## Layout and Forms

Use the spacing scale for geometry and semantic aliases for repeated relationships. Section spacing is 96px on desktop and 72px on mobile; page gutters are 32px and 16px. The content breakpoint is 800px, navigation collapses at 1150px, and selected tablet compositions adapt at 1100px. These are layout thresholds, not device detection.

Forms share `--space-field-label`, `--space-form-row`, `--space-form-column`, `--space-field-block`, and `--space-field-inline`. Control minimum heights use `--size-control` or `--size-field`. Status messages reserve `--size-status-reserve` even when empty. Long errors may wrap and grow; do not use a fixed height or clip them.

After a form reports success or failure, changing an input clears that result so it cannot be mistaken for the next submission. Programmatic form reset after a successful request retains the confirmation until the user edits a field.

The footer wordmark may wrap when text is enlarged. Keep its width bounded by its container rather than forcing a single line.

Contact and preferences fields use square borders; the compact inverse footer form uses pill shapes. These are deliberate variants. Borders, optical offsets, icon dimensions and chart geometry may use local values when a spacing token would misrepresent their purpose.

## Interaction and Accessibility

| State           | Rule                                                                                    |
| --------------- | --------------------------------------------------------------------------------------- |
| Hover           | Use shared motion tokens and the component's existing color treatment                   |
| Keyboard focus  | Keep an outline; never rely on a faint shadow alone                                     |
| Active          | Use the shared press scale; preserve text colors                                        |
| Busy            | Disable duplicate submission and editable fields; announce status through a live region |
| Disabled        | Suppress movement; use the existing opacity variant                                     |
| Error / success | Supply meaningful localized text; do not communicate status using color alone           |

Light-surface form fields use `--focus-ring-on-light`; inverse fields use `--focus-ring-on-dark`. Width and offset use shared focus tokens. Forced-colors mode uses the system Highlight outline. Do not disable the browser's forced-color adjustment.

The default disabled opacity is `--opacity-disabled`; preferences preserve `--opacity-disabled-preferences`. A wait cursor applies while the preferences form is busy, not after unsubscribe has permanently disabled its controls.

Reduced-motion mode removes smooth scrolling, minimizes transition durations, disables hover/press scaling through tokens, and removes decorative arrow movement and menu-control rotation. Summary and sort offsets use `--motion-offset-summary` and `--motion-offset-sort`, both zero in reduced-motion mode. Touch hover resets must exclude `:active` and `:focus-visible` so press and keyboard feedback keep their authored treatment.

The mobile menu opens with coordinated motion and dismisses by translating its content below the header to the right using the slow motion token (300ms on mobile) and the exit easing token. Menu links fade early; the close control changes from X to the Menu icon and matches the underlying button's colors before the fixed top bar fades over the final part of the exit. The full-screen layer stays fixed and intercepts background clicks until dismissal finishes. Use panel movement rather than animated clipping so the exit has measurable intermediate positions. Background isolation and scroll locking remain active until dismissal finishes; navigation and reduced motion close immediately. The final dismissal frame stays in place until the layer is hidden to prevent a flash. Repeated dismissal requests share the running animation, and changing to desktop or reduced motion cancels it safely. While open, background siblings are inert except for the visible header controls, which leave the tab order behind the modal layer; closing restores their previous state and returns focus to the trigger. The language dropdown becomes inert as soon as closing starts, while its visual exit can finish. The language menu supports Enter, Space and arrow-key entry, arrow navigation, Escape dismissal and Tab exit.

The mobile close icon replays its entrance keyframes on each opening, including after navigation. On dismissal, the X fades out without rotating and a second Lucide Menu icon scales in over the fast motion token (140ms on mobile), while the control's fill, border, and focus ring move toward the underlying trigger's appearance. The content slides out and the top bar stays in place; retain the final frames until the menu is hidden. Reduced motion bypasses these animations. Memo and monthly-data disclosures share `AnimatedDisclosure` and keep native details/summary semantics and use a small client wrapper to animate height in both directions, including WebKit. Repeated input reverses from the current height; reduced motion switches immediately. A viewport resize settles an active disclosure to its intended state and natural height. Closing returns focus to the summary if focus has moved into its content during the animation. Without JavaScript, the native disclosure remains usable.

The open mobile menu's close button retains its Bright Blue fill and blue outer ring independently of `:focus-visible`, so touch navigation does not remove them. Keep its black icon and keyboard focus styles intact.

## Validation and Changes

Run `npm run verify`; CI also runs WebKit. ESLint, Stylelint and Prettier check static rules and formatting. Browser checks should cover all three locales, narrow layouts, larger text, visible focus and reduced-motion behavior. Test forced colors separately when supported. Use rendered interaction checks for layout and behavior; avoid duplicating them with CSS source-pattern tests.

When adding a component, select existing roles, document intentional variants, verify its interaction states, and add behavior checks where the risk warrants them. Add a token only for a reusable purpose; record exceptions here. Keep the README concise and link to this guide rather than duplicating its rules.
