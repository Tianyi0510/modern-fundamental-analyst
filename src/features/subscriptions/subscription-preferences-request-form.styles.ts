export const appearance = {
  "preferences-form":
    "preferences-form [max-width:760px] grid [grid-template-columns:minmax(0,_1fr)] [gap:var(--space-32px)]",
  "preferences-actions":
    "preferences-actions flex items-center [gap:var(--space-24px)] [@media((max-width:_800px))]:[align-items:stretch] [@media((max-width:_800px))]:flex-col [@media((max-width:_800px))]:[gap:var(--space-16px)]",
} as const;
