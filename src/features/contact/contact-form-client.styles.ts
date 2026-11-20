import { brandSurface } from "@/components/brand-surface";
export const appearance = {
  "contact-band": `contact-band ${brandSurface} [background:var(--blue-bright)]`,
  "contact-section":
    "contact-section grid grid-cols-1 min-[1101px]:grid-cols-[var(--grid-columns)] min-[1101px]:[&>:first-child]:[grid-column:1/5] min-[1101px]:[&>:nth-child(2)]:[grid-column:5/-1] [column-gap:var(--grid-column-gap)] [row-gap:var(--space-section-content)] [align-items:start] [padding-top:var(--space-section-padding)] [padding-bottom:var(--space-section-padding)] [color:var(--text-primary)] [@media((max-width:_800px))]:[grid-template-columns:1fr] [@media((max-width:_800px))]:[gap:var(--space-heading-content)] [@media((max-width:_800px))]:[padding-top:var(--space-section-padding)] [@media((max-width:_800px))]:[padding-bottom:var(--space-section-padding)]",
  "contact-heading":
    "contact-heading [padding-top:var(--space-8px)] [&_h2]:[margin:0_0_var(--space-24px)] [&_h2]:[max-width:380px] [&_h2]:text-large-title [&_h2]:[text-transform:none] [@media((max-width:_800px))]:[padding-top:0]",
  "contact-form":
    "contact-form grid [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:var(--space-form-row)_var(--space-form-column)] [padding:0] [border:0] [background:transparent] [@media((max-width:_800px))]:[grid-template-columns:1fr] [@media((max-width:_800px))]:[gap:var(--space-24px)]",
  "contact-actions":
    "contact-actions [grid-column:1_/_-1] flex flex-wrap items-center [gap:var(--space-24px)] [margin-top:var(--space-4px)] [@media((max-width:_800px))]:[grid-column:auto] [@media((max-width:_800px))]:[align-items:flex-start] [@media((max-width:_800px))]:flex-col [@media((max-width:_800px))]:[gap:var(--space-16px)]",
  "contact-headingIntro":
    "contact-headingIntro [max-width:390px] [margin:0] [color:var(--text-primary)] text-small-body",
} as const;
