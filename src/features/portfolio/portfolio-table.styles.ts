const columns = "grid grid-cols-[1.05fr_0.5fr_0.75fr_0.9fr_1fr_0.65fr_0.6fr] gap-[var(--space-300)] items-center";
const valueText = "text-data-row tabular-nums";
const mobileControl =
  "w-full min-w-0 h-[var(--size-control)] border border-strong rounded-field bg-surface text-ink text-control";
const rowLayout = `${columns} min-h-[64px] [&_>_*]:p-0 [&_>_*:not(:first-child)]:text-right compact:min-h-0 compact:grid-cols-2 compact:gap-x-[var(--space-200)] compact:gap-y-[var(--space-150)] compact:py-[var(--space-200)] compact:[&_>_*]:min-w-0 compact:[&_>_*]:grid compact:[&_>_*]:gap-[gap-[5px]] compact:[&_>_*]:text-left compact:[&_>_*]:wrap-anywhere compact:[&_>_*::before]:content-[attr(data-label)] compact:[&_>_*::before]:text-m3-label-medium compact:[&_>_*::before]:text-[var(--text-tertiary)] compact:[&_>_th:first-child]:col-span-full compact:[&_>_th:first-child]:font-bold compact:[&_>_th:first-child::before]:hidden`;

export const appearance = {
  "portfolio-mobile-sort":
    "portfolio-mobile-sort hidden compact:grid compact:grid-cols-2 compact:gap-x-[var(--space-150)] compact:gap-y-[var(--space-100)] compact:items-center compact:mb-[var(--space-300)]",
  mobileLabel: "contents",
  mobileHeading: "col-span-full text-label whitespace-nowrap",
  mobileSelect: `${mobileControl} pl-[var(--space-200)] pr-[var(--space-450)]`,
  mobileDirection: `${mobileControl} px-[var(--space-200)] inline-flex items-center justify-center gap-[var(--space-100)] wrap-anywhere [transition:transform_var(--motion-spatial-fast-duration)_var(--motion-spatial-fast-easing),_scale_var(--motion-spatial-fast-duration)_var(--motion-spatial-fast-easing),_color_var(--motion-effects-fast-duration)_var(--motion-effects-fast-easing),_background-color_var(--motion-effects-fast-duration)_var(--motion-effects-fast-easing)] hover:bg-surface-inverse hover:text-inverse focus-visible:bg-surface-inverse focus-visible:text-inverse active:scale-[var(--motion-scale-press)] touch:[&:hover:not(:active):not(:focus-visible)]:bg-surface touch:[&:hover:not(:active):not(:focus-visible)]:text-ink touch:active:bg-surface-inverse touch:active:text-inverse [&:hover_svg]:translate-y-[var(--motion-offset-sort)] [&:focus-visible_svg]:translate-y-[var(--motion-offset-sort)] touch:[&:hover:not(:active):not(:focus-visible)_svg]:translate-y-0`,
  mobileArrow:
    "w-[17px] h-[17px] ml-auto transition-transform duration-[var(--motion-spatial-fast-duration)] ease-[var(--motion-spatial-fast-easing)]",
  "portfolio-table":
    "portfolio-table portfolio-table-detailed block w-full min-w-[1080px] border-t border-strong [&_>_:is(thead,tbody,tfoot)]:block [&_:is(th,td)]:p-0 [&_:is(th,td)]:text-left compact:min-w-0 compact:border-t-0",
  "table-head": `table-head ${columns} min-h-[var(--size-field)] text-[var(--text-secondary)] text-label [&_>_th:not(:first-child)]:text-right compact:sr-only compact:min-h-0 compact:block`,
  "portfolio-column-label": "portfolio-column-label hidden compact:inline",
  "sort-button":
    "sort-button w-full py-[var(--space-125)] inline-flex items-center gap-[var(--space-75)] whitespace-nowrap font-bold [transition:transform_var(--motion-spatial-fast-duration)_var(--motion-spatial-fast-easing),_scale_var(--motion-spatial-fast-duration)_var(--motion-spatial-fast-easing),_color_var(--motion-effects-fast-duration)_var(--motion-effects-fast-easing),_background-color_var(--motion-effects-fast-duration)_var(--motion-effects-fast-easing)] hover:text-brand focus-visible:text-brand active:scale-[var(--motion-scale-press)] [&_svg]:w-[13px] [&_svg]:h-[13px] [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-[var(--motion-spatial-fast-duration)] [&_svg]:ease-[var(--motion-spatial-fast-easing)] [&:hover_svg]:translate-y-[var(--motion-offset-sort)] [&:focus-visible_svg]:translate-y-[var(--motion-offset-sort)] compact:hidden",
  sortAlignment: "justify-end",
  "is-active": "is-active text-brand",
  "portfolio-row": `portfolio-row ${rowLayout} ${valueText} border-t border-[var(--border-subtle)] transition-colors duration-[var(--motion-effects-fast-duration)] ease-[var(--motion-effects-fast-easing)] hover:bg-[var(--surface-row-hover)] compact:[&_th]:font-bold`,
  negative: "negative text-[var(--text-return-negative)]",
  positive: "positive text-[var(--text-return-positive)]",
  "portfolio-total-row": `portfolio-row portfolio-total-row ${rowLayout} ${valueText} font-bold border-t border-strong bg-transparent compact:items-start compact:grid-rows-[auto_auto_auto] compact:[&_>_:empty]:hidden`,
  "portfolio-total-market": "portfolio-total-market compact:col-start-1 compact:row-start-2",
  "portfolio-total-return": "portfolio-total-return compact:col-start-2 compact:row-start-2",
} as const;
