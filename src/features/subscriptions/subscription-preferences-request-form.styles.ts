export const appearance = {
  "preferences-form":
    "preferences-form [max-width:760px] grid [grid-template-columns:minmax(0,_1fr)] [gap:var(--space-400)]",
  "preferences-actions":
    "preferences-actions flex items-center [gap:var(--space-300)] [@media((max-width:_800px))]:[align-items:stretch] [@media((max-width:_800px))]:flex-col [@media((max-width:_800px))]:[gap:var(--space-200)]",
} as const;
