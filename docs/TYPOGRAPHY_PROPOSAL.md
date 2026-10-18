# Production-Based Typography: Perfect Fourth

Design specification · 18 October 2026 · Implemented in the working copy; not deployed

Use the currently deployed site's Jost, bold editorial headings, generous introduction text and prominent financial figures as the baseline. Preserve the recent improvements to mobile navigation, forms and long-form reading.

This specification is implemented in the working copy and synchronized with [Design System](DESIGN_SYSTEM.md), tokens, tests and agent instructions. Colors, copy, capitalization, Logo artwork, layout and interaction behavior remain outside this proposal.

## Measured production baseline

Historical measurements only: nonzero tracking in this table is evidence of the deployed baseline, not a value to carry into the proposed system.

Computed styles were read from the public production site on 18 October 2026 at 1280 × 900 and 390 × 844. These are viewport samples, not recovered source breakpoints or a confirmed deployment commit. Sizes and line heights below are CSS pixels.

| Role                              | Desktop size / line height | Mobile size / line height | Weight | Tracking |
| --------------------------------- | -------------------------- | ------------------------- | ------ | -------- |
| Home hero                         | 92 / 96.6                  | 42.9 / 45.045             | 700    | -0.025em |
| Home section heading              | 66 / 72.6                  | 44 / 48.4                 | 700    | -0.025em |
| Home introduction                 | 22 / 33                    | 22 / 33                   | 400    | Normal   |
| Home KPI                          | 59.2 / 59.2                | 48 / 48                   | 700    | -0.05em  |
| Home featured return              | 83.2 / 83.2                | 52 / 52                   | 700    | -0.05em  |
| Memo card / article section title | 40.8 / 44.88               | 32 / 35.2                 | 700    | -0.025em |
| Article subsection title          | 24 / 28.8                  | 20 / 24                   | 700    | -0.025em |
| CTA                               | 16 / 24                    | 16 / 24                   | 700    | Normal   |
| Field label                       | 16 / 24                    | 16 / 24                   | 700    | 0.025em  |

Additional mobile samples covered About, Portfolio and Contact. Raw heading/body samples are preserved outside the repository in `../../local/audit/typography-2026-10-18/production-measurements.json`. Numeric leaf-element measurements are recorded in the table above. The previous whole-site comparison is in `../../local/audit/site-comparison-2026-10-17/`.

## Proposed semantic roles

Preserve Jost for Latin text and numbers, Noto Sans TC for Traditional Chinese and Noto Sans SC for Simplified Chinese. Keep the outlined Logo as an image. Treat each role as a complete size, weight, line-height and tracking assignment, separate from color and HTML semantics.

All roles use `letter-spacing: 0` across languages, viewports and interaction states. Only weights 400 and 700 are allowed: body copy and secondary controls use 400; headings, labels, primary actions, financial emphasis and inline emphasis use 700. Selection and focus do not change font weight.

## Scale construction

Use a 16px base and the exact ratio 4/3. Calculate every step independently as `16 × (4/3)^n`, then round to the nearest whole CSS pixel. Do not multiply an already rounded step; that would accumulate rounding drift. This is a rounded Perfect Fourth scale, not an exact geometric sequence after rounding.

| Step | Exact value (approx. px) | Adopted px | Implementation rem |
| ---- | ------------------------ | ---------- | ------------------ |
| 0    | 16.000                   | 16         | 1                  |
| 1    | 21.333                   | 21         | 1.3125             |
| 2    | 28.444                   | 28         | 1.75               |
| 3    | 37.926                   | 38         | 2.375              |
| 4    | 50.568                   | 51         | 3.1875             |
| 5    | 67.424                   | 67         | 4.1875             |
| 6    | 89.898                   | 90         | 5.625              |

The core scale is **16 → 21 → 28 → 38 → 51 → 67 → 90**. Do not add intermediate sizes solely to reproduce the old table. The ratio governs font sizes, not line heights, spacing or weight. Different semantic roles may intentionally share a scale step.

### Scale consistency

All implemented font sizes use the rounded Perfect Fourth scale; there are no off-scale size exceptions. Medium Body uses 16px (1rem) on all viewports. Medium Display uses 51px (3.1875rem) on mobile and tablet, and 67px on desktop. Home, Portfolio and Performance summary KPIs retain Medium Display treatment with a fixed 51px size at every viewport so the three equal-width cells can show complete values. Historical production measurements above remain unchanged.

Medium Body and Small Body share identical metrics: 16px, weight 400 and leading 1.5. Their names distinguish long-form prose from interface copy; both should reference the same metric tokens. Logo artwork is not live text and is outside this scale.

### Role assignments

Names follow **Size + Category**: Large / Medium / Small + Display / Headline / Title / Label / Body. Use lowercase kebab-case for future implementation tokens, for example `large-display`, `medium-headline` and `small-body`. Page-specific uses are assignments, not additional typography names.

Define only the 13 used treatments below. Small Title and Small Label are intentionally undefined: there is no distinct current need, and filling every combination would introduce redundant styles or text below the 16px minimum. Large and Medium Label share a size but distinguish bold action/field hierarchy from regular secondary controls.

Values are CSS-pixel equivalents at a 16px root. Implement size with rem and leading with the listed unitless multiplier. Leading is fixed by category across all languages and viewports: 1.15 for Display, Headline and Title; 1.5 for Label and Body. No role-specific or locale-specific leading overrides apply.

| Role              | Desktop size / line height | Mobile size / line height | Leading | Weight | Tracking | Use                                                                         |
| ----------------- | -------------------------- | ------------------------- | ------- | ------ | -------- | --------------------------------------------------------------------------- |
| `Large Display`   | 90 / 103.5                 | 51 / 58.65                | 1.15    | 700    | 0        | Home H1 and featured return                                                 |
| `Medium Display`  | 67 / 77.05                 | 51 / 58.65                | 1.15    | 700    | 0        | Summary market value and returns                                            |
| `Small Display`   | 38 / 43.7                  | 38 / 43.7                 | 1.15    | 700    | 0        | Chart-ring figures                                                          |
| `Large Headline`  | 67 / 77.05                 | 38 / 43.7                 | 1.15    | 700    | 0        | General page H1 and major Home sections                                     |
| `Medium Headline` | 51 / 58.65                 | 38 / 43.7                 | 1.15    | 700    | 0        | Article and Disclaimer H1                                                   |
| `Small Headline`  | 38 / 43.7                  | 28 / 32.2                 | 1.15    | 700    | 0        | About sections, holdings section and article H2                             |
| `Large Title`     | 28 / 32.2                  | 28 / 32.2                 | 1.15    | 700    | 0        | Memo cards, form panels and Support amount choices                          |
| `Medium Title`    | 21 / 24.15                 | 21 / 24.15                | 1.15    | 700    | 0        | Charts, article H3, utility-page H1, Footer headings and holdings summaries |
| `Large Label`     | 16 / 24                    | 16 / 24                   | 1.5     | 700    | 0        | Field labels, table headings, category labels and primary actions           |
| `Medium Label`    | 16 / 24                    | 16 / 24                   | 1.5     | 400    | 0        | Sidebar, navigation, selectors and secondary controls                       |
| `Large Body`      | 21 / 31.5                  | 21 / 31.5                 | 1.5     | 400    | 0        | Hero and short editorial introductions                                      |
| `Medium Body`     | 16 / 24                    | 16 / 24                   | 1.5     | 400    | 0        | Article and Disclaimer prose                                                |
| `Small Body`      | 16 / 24                    | 16 / 24                   | 1.5     | 400    | 0        | Card copy, instructions, table figures, dates, notes and feedback           |

Inline emphasis uses 700 without changing its paragraph's size, leading or tracking. Apply tabular numerals to financial content independently of its typography name; preserve signs, decimals, currency symbols and units. Use only one featured-return focal point per section. Support choices use responsive Medium Display.

A financial value may be larger than a nearby heading. Semantic heading order does not impose a font-size ceiling. A compact utility-page H1 remains an H1; a large return value does not become a heading.

## Responsive and language behavior

- Below 50rem: use mobile roles. From 50rem to below 75rem: use 67px for Large Display and 51px for Medium Display, Large Headline and Medium Headline; other roles use desktop sizes. Retain each role's unitless leading. From 75rem: use desktop sizes. All tablet sizes belong to the core scale. These are typography breakpoints, independent of layout breakpoints.
- Initially use explicit tiers rather than viewport interpolation. Keep the root at 100% and support user text enlargement. Reflow summaries before shrinking figures: stack cells and reduce unnecessary padding. Do not clip, ellipsize or silently abbreviate financial data. Values that still exceed the available width use a named, keyboard-focusable local horizontal scroll region. Preserve the complete single-line number and verify keyboard access to its end; the page itself must not overflow.
- Chinese and Latin text use the same role sizes, weights, zero tracking and category leading. Preserve sufficient control padding for touch targets independently of line height. Verify Chinese glyphs, punctuation and multiline text in both Noto families without introducing leading overrides.
- Preserve explicit English article language inside Chinese routes. Do not force identical line counts across locales or add manual breaks that orphan words on phones.
- Keep body copy, notes, controls and chart labels at least 16px-equivalent. Reduce emphasis with placement and spacing rather than tiny type.
- Limit English reading measure to about 65ch and Chinese prose to about 35em. Hero introductions should generally stay within 45–55ch. These are maximum widths, never minimum widths.
- Use paragraph gaps of 1em. Reading-section headings use approximately 1.5em above and 0.6em below, relative to body size. Keep internal text rhythm separate from section padding; typography adoption must not silently change grids, Hero padding or CTA placement.

## Page assignments

| Page family                | Title             | Supporting roles                                                  |
| -------------------------- | ----------------- | ----------------------------------------------------------------- |
| Home                       | `Large Display`   | `Large Headline`, `Large Body`, `Medium Display`, `Large Display` |
| About                      | `Large Headline`  | `Small Headline`, `Large Body`, `Small Body`                      |
| Portfolio                  | `Large Headline`  | `Medium Display`, `Small Headline`, `Small Body` tables           |
| Performance                | `Large Headline`  | `Medium Display`, `Medium Title` charts, `Small Body`             |
| Memos                      | `Large Headline`  | `Large Title`, `Small Body`                                       |
| Article                    | `Medium Headline` | `Small Headline`, `Medium Title`, `Medium Body`                   |
| Contact / Support          | `Large Headline`  | `Large Title`, `Large Label`, `Small Body`                        |
| Disclaimer                 | `Medium Headline` | `Small Headline`, `Medium Body`                                   |
| Preferences / Confirmation | `Medium Title`    | `Small Body`, `Large Label`, `Medium Label`                       |

## Adoption and verification

1. Implement the named treatments with size-first tokens such as `large-display`, and map page/component uses to them. Replace legacy typography utility names during adoption and update their consumers and class-merging registration together. Keep Support amounts on responsive Medium Display and KPI summaries on Medium Display fixed at 51px. Do not add page-specific typography names or change every heading identically.
2. Update the typography section in `DESIGN_SYSTEM.md` and the complete-Geist-presets requirement in `AGENTS.md` together. This proposal replaces that metric requirement with production-derived brand roles; other design layers remain intact.
3. Register any new size utility in class merging. Preserve component surfaces, focus, animation, copy, data and colors.
4. Replace tests that enforce Geist preset membership or require all KPI figures to be smaller than headings. Assert semantic metrics, membership in the rounded scale without off-scale exceptions, zero tracking, weights limited to 400 and 700, leading of 1.15 for Display/Headline/Title and 1.5 for Label/Body, complete values, readable labels and reflow.
5. Compare Home, Portfolio, an article and Contact against the production baseline at 1280px and 390px. Then verify all page families at 320, 390, 800 and 1280px, either side of type breakpoints, all three languages, 200% text enlargement and keyboard focus. Check dark appearance for preserved colors and legibility. Pay particular attention to the 51px mobile Home H1, the 51px mobile KPI, the 51px desktop KPI and longer labels at zero tracking; these differ from the previous proposal and may require layout reflow, not extra font sizes.
6. Accept when headline and financial-number priority, complete values and readable long text are preserved without overflow or clipped line boxes. Retain the newer Sidebar and form treatments.

Application styles and tests now implement this specification. The production measurements remain historical evidence, not the current working-copy metrics. This change does not deploy the website.
