export const appearance = {
  "preferences-form":
    "preferences-form [max-width:760px] grid [grid-template-columns:minmax(0,_1fr)] [gap:var(--space-6)]",
  "preferences-actions":
    "preferences-actions flex items-center [gap:var(--space-5)] [@media((max-width:_800px))]:[align-items:stretch] [@media((max-width:_800px))]:flex-col [@media((max-width:_800px))]:[gap:var(--space-4)]",
} as const;
