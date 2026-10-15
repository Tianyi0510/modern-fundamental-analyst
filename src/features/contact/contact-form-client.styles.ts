export const appearance = {
  "contact-band": "contact-band [background:var(--surface-highlight)]",
  "contact-section":
    "contact-section grid [grid-template-columns:minmax(260px,_0.72fr)_minmax(0,_1.28fr)] [gap:var(--space-900)] [align-items:start] [padding-top:var(--space-section)] [padding-bottom:var(--space-section)] [color:var(--text-primary)] [@media((max-width:_800px))]:[grid-template-columns:1fr] [@media((max-width:_800px))]:[gap:var(--space-heading-content)] [@media((max-width:_800px))]:[padding-top:var(--space-section)] [@media((max-width:_800px))]:[padding-bottom:var(--space-section)]",
  "contact-heading":
    "contact-heading grid [gap:var(--space-300)] [padding-top:var(--space-75)] [&_h2]:[margin:0] [&_h2]:[max-width:380px] [&_h2]:text-title [&_h2]:[text-transform:none] [@media((max-width:_800px))]:[padding-top:0]",
  "contact-form":
    "contact-form grid [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:var(--space-form-row-gap)_var(--space-form-column-gap)] [padding:0] [border:0] [background:transparent] [@media((max-width:_800px))]:[grid-template-columns:1fr] [@media((max-width:_800px))]:[gap:var(--space-300)]",
  "contact-actions":
    "contact-actions [grid-column:1_/_-1] flex items-center [gap:var(--space-300)] [margin-top:var(--space-50)] [@media((max-width:_800px))]:[grid-column:auto] [@media((max-width:_800px))]:[align-items:flex-start] [@media((max-width:_800px))]:flex-col [@media((max-width:_800px))]:[gap:var(--space-200)]",
  "contact-headingIntro": "contact-headingIntro [max-width:390px] [margin:0] [color:var(--text-primary)] text-body",
} as const;
