export const appearance = {
  "preferences-form":
    "preferences-form [max-width:760px] grid [grid-template-columns:minmax(0,_1fr)] [gap:var(--space-6)]",
  "preferences-field":
    "preferences-field grid [grid-template-columns:minmax(0,_1fr)] [gap:var(--space-field-label)] min-w-0 [font-size:var(--font-size-label)] [line-height:var(--leading-body)] font-bold [letter-spacing:var(--tracking-label)] [&_strong]:[font-size:var(--font-size-body-large)] [&_strong]:[line-height:var(--leading-body)] [&_strong]:[letter-spacing:var(--tracking-body)]",
  "preferences-actions":
    "preferences-actions flex items-center [gap:var(--space-5)] [@media((max-width:_800px))]:[align-items:stretch] [@media((max-width:_800px))]:flex-col [@media((max-width:_800px))]:[gap:var(--space-4)]",
  "preferences-unsubscribe": "preferences-unsubscribe mobile:self-start",
} as const;
