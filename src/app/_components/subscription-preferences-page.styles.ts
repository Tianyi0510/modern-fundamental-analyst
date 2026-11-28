export const appearance = {
  "preferences-panel":
    "preferences-panel grid grid-cols-1 min-[1101px]:grid-cols-[var(--grid-columns)] min-[1101px]:gap-x-[var(--grid-column-gap)] min-[1101px]:[&>*]:col-span-7 min-[1101px]:[&>*]:col-start-1 [padding-top:var(--space-section-padding)] [padding-bottom:var(--space-section-padding)]",
  "preferences-request":
    "preferences-request grid [grid-template-columns:minmax(0,_1fr)] [gap:var(--space-section-content)]",
  "preferences-invalid":
    "preferences-invalid [min-height:var(--size-status-reserve)] [margin:0] [overflow-wrap:anywhere] text-small-body",
} as const;
