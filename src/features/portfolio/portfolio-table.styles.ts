const columns = "grid grid-cols-[1.05fr_0.5fr_0.75fr_0.9fr_1fr_0.65fr_0.6fr] gap-[22px] items-center";
const valueText =
  "text-[length:var(--font-size-data-row)] leading-[var(--leading-data)] tracking-[var(--tracking-heading)] tabular-nums";
const mobileControl =
  "w-full min-w-0 h-[var(--size-control)] border border-black rounded-none bg-white text-black text-[length:var(--font-size-control)] leading-[var(--leading-body)] tracking-[var(--tracking-body)] font-bold";
const rowLayout = `${columns} min-h-[64px] [&_>_*]:p-0 [&_>_*:not(:first-child)]:text-right compact:min-h-0 compact:grid-cols-2 compact:gap-x-[var(--space-4)] compact:gap-y-[var(--space-3)] compact:py-[var(--space-4)] compact:[&_>_*]:min-w-0 compact:[&_>_*]:grid compact:[&_>_*]:gap-[5px] compact:[&_>_*]:text-left compact:[&_>_*]:wrap-anywhere compact:[&_>_*::before]:content-[attr(data-label)] compact:[&_>_*::before]:text-[length:var(--font-size-caption)] compact:[&_>_*::before]:leading-[var(--leading-body)] compact:[&_>_*::before]:tracking-[var(--tracking-label)] compact:[&_>_*::before]:font-bold compact:[&_>_*::before]:text-[var(--text-tertiary)] compact:[&_>_th:first-child]:col-span-full compact:[&_>_th:first-child]:font-bold compact:[&_>_th:first-child::before]:hidden`;

export const appearance = {
  "portfolio-mobile-sort":
    "portfolio-mobile-sort hidden compact:grid compact:grid-cols-2 compact:gap-x-[var(--space-3)] compact:gap-y-[var(--space-2)] compact:items-center compact:mb-[var(--space-5)]",
  mobileLabel: "contents",
  mobileHeading:
    "col-span-full text-[length:var(--font-size-label)] leading-[var(--leading-body)] tracking-[var(--tracking-label)] font-bold whitespace-nowrap",
  mobileSelect: `${mobileControl} pl-[14px] pr-[36px]`,
  mobileDirection: `${mobileControl} px-[14px] inline-flex items-center justify-center gap-[var(--space-2)] wrap-anywhere transition-[background-color,color,transform] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white active:scale-[var(--motion-scale-press)] touch:[&:hover:not(:active):not(:focus-visible)]:bg-white touch:[&:hover:not(:active):not(:focus-visible)]:text-black touch:active:bg-black touch:active:text-white [&:hover_svg]:translate-y-[var(--motion-offset-sort)] [&:focus-visible_svg]:translate-y-[var(--motion-offset-sort)] touch:[&:hover:not(:active):not(:focus-visible)_svg]:translate-y-0`,
  mobileArrow:
    "w-[17px] h-[17px] ml-auto transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-emphasized)]",
  "portfolio-table":
    "portfolio-table portfolio-table-detailed block w-full min-w-[1080px] border-t border-black [&_>_:is(thead,tbody,tfoot)]:block [&_:is(th,td)]:p-0 [&_:is(th,td)]:text-left compact:min-w-0 compact:border-t-0",
  "table-head": `table-head ${columns} min-h-[var(--size-field)] text-[var(--text-secondary)] text-[length:var(--font-size-label)] leading-[var(--leading-body)] tracking-[var(--tracking-label)] font-bold [&_>_th:not(:first-child)]:text-right compact:sr-only compact:min-h-0 compact:block`,
  "portfolio-column-label": "portfolio-column-label hidden compact:inline",
  "sort-button":
    "sort-button w-full py-[10px] inline-flex items-center gap-[6px] whitespace-nowrap font-bold transition-[color,transform] duration-[var(--motion-duration-fast)] hover:text-brand focus-visible:text-brand active:scale-[var(--motion-scale-press)] [&_svg]:w-[13px] [&_svg]:h-[13px] [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-[var(--motion-duration-base)] [&_svg]:ease-[var(--motion-ease-emphasized)] [&:hover_svg]:translate-y-[var(--motion-offset-sort)] [&:focus-visible_svg]:translate-y-[var(--motion-offset-sort)] compact:hidden",
  sortAlignment: "justify-end",
  "is-active": "is-active text-brand",
  "portfolio-row": `portfolio-row ${rowLayout} ${valueText} font-normal border-t border-[var(--gray)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[color-mix(in_srgb,var(--bright-blue)_10%,var(--white))] [&_th]:font-normal compact:[&_th]:font-bold`,
  negative: "negative text-[var(--text-return-negative)]",
  positive: "positive text-[var(--text-return-positive)]",
  "portfolio-total-row": `portfolio-row portfolio-total-row ${rowLayout} ${valueText} font-bold border-t border-black bg-transparent compact:items-start compact:grid-rows-[auto_auto_auto] compact:[&_>_:empty]:hidden`,
  "portfolio-total-market": "portfolio-total-market compact:col-start-1 compact:row-start-2",
  "portfolio-total-return": "portfolio-total-return compact:col-start-2 compact:row-start-2",
} as const;
