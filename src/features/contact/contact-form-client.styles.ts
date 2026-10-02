export const appearance = {
  "contact-band": "contact-band [background:var(--bright-blue)]",
  "contact-section":
    "contact-section grid [grid-template-columns:minmax(260px,_0.72fr)_minmax(0,_1.28fr)] [gap:72px] [align-items:start] [padding-top:var(--space-section)] [padding-bottom:var(--space-section)] [color:var(--black)] [@media((max-width:_800px))]:[grid-template-columns:1fr] [@media((max-width:_800px))]:[gap:var(--space-heading-content)] [@media((max-width:_800px))]:[padding-top:var(--space-section)] [@media((max-width:_800px))]:[padding-bottom:var(--space-section)]",
  "contact-heading":
    "contact-heading [padding-top:6px] [&_h2]:[margin:0_0_24px] [&_h2]:[max-width:380px] [&_h2]:[font-size:var(--font-size-card-title)] [&_h2]:[line-height:var(--leading-card-title)] [&_h2]:[letter-spacing:var(--tracking-heading)] [&_h2]:font-bold [&_h2]:[text-transform:none] [@media((max-width:_800px))]:[padding-top:0]",
  "contact-form":
    "contact-form grid [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:var(--space-form-row)_var(--space-form-column)] [padding:var(--space-7)_var(--space-7)_0] [border:0] [background:transparent] [@media((max-width:_800px))]:[grid-template-columns:1fr] [@media((max-width:_800px))]:[gap:var(--space-5)] [@media((max-width:_800px))]:[padding:0]",
  "contact-actions":
    "contact-actions [grid-column:1_/_-1] flex items-center [gap:var(--space-5)] [margin-top:4px] [@media((max-width:_800px))]:[grid-column:auto] [@media((max-width:_800px))]:[align-items:flex-start] [@media((max-width:_800px))]:flex-col [@media((max-width:_800px))]:[gap:var(--space-4)]",
  "contact-headingIntro":
    "contact-headingIntro [max-width:390px] [margin:0] [color:var(--black)] [font-size:var(--font-size-body)] [line-height:var(--leading-body)]",
} as const;
