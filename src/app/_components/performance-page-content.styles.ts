import { containerAppearance } from "@/components/container";

export const appearance = {
  shell: containerAppearance,
  "date-text": "date-text [font-family:var(--font-ui)] [font-variant-numeric:tabular-nums]",
  "performance-summary":
    "performance-summary grid auto-rows-fr grid-cols-3 @max-[72rem]/financial-summary:grid-cols-1 gap-px bg-[var(--surface-inverse)] compact:grid-cols-1",
  returns:
    "returns [padding:var(--space-section-padding)_0] grid [grid-template-columns:var(--grid-sidebar)] [column-gap:var(--grid-column-gap)] [row-gap:var(--space-section-content)] [.performance-page_&]:[grid-template-columns:minmax(0,_1fr)] [.performance-page_&]:[gap:var(--space-heading-content)] [.performance-page_&_>_*]:min-w-0 [.performance-page_&_>_*]:[overflow-wrap:anywhere] [@media((max-width:_1100px)_and_(min-width:_801px))]:[grid-template-columns:1fr] [@media((max-width:_1100px)_and_(min-width:_801px))]:[gap:var(--space-section-content)] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)] [@media((max-width:_800px))]:[padding:var(--space-section-padding)_0] [@media((max-width:_800px))]:[.performance-page_&]:[gap:var(--space-heading-content)] [&_h2]:[color:var(--text-brand)]",
  "section-heading":
    "section-heading grid [grid-template-columns:1fr_2fr] [align-items:start] [&_h2]:[margin:0] [&_h2]:text-small-headline [&_h2]:[text-transform:none] [&_h2]:[text-wrap:balance] [.returns_&]:block [.returns_&_h2]:[margin-top:var(--space-section-content)] [@media((max-width:_800px))]:[&_h2]:[overflow-wrap:anywhere] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)] [@media((max-width:_800px))]:[gap:var(--space-section-content)]",
  "section-number":
    "section-number [margin:0] [color:var(--text-secondary)] [font-family:var(--font-ui)] text-large-label [text-transform:none] [.intro_&]:[grid-column:1_/_-1]",
  "section-gray": "section-gray [background:var(--surface-secondary)]",
  methodology:
    "methodology [&_h2]:[margin:0] [&_h2]:text-small-headline [&_h2]:[text-transform:none] [&_h2]:[text-wrap:balance] [&_h2]:[color:var(--text-brand)] [padding:var(--space-section-padding)_0] grid [grid-template-columns:var(--grid-sidebar)] [column-gap:var(--grid-column-gap)] [row-gap:var(--space-section-content)] [&_div]:[color:var(--text-primary)] [&_div]:text-medium-body [&_div]:[text-wrap:pretty] [&_div_p:first-child]:[margin-top:0] [.performance-page_&_>_*]:min-w-0 [.performance-page_&_>_*]:[overflow-wrap:anywhere] [@media((max-width:_1100px)_and_(min-width:_801px))]:[grid-template-columns:1fr] [@media((max-width:_1100px)_and_(min-width:_801px))]:[gap:var(--space-section-content)] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)] [@media((max-width:_800px))]:[padding:var(--space-section-padding)_0] [@media((max-width:_800px))]:[.performance-page_&]:[gap:var(--space-heading-content)]",
  "methodology-content":
    "methodology-content [.performance-page_&_>_*]:min-w-0 [.performance-page_&_>_*]:[overflow-wrap:anywhere] [@media((max-width:_800px))]:grid [@media((max-width:_800px))]:[gap:var(--space-section-content)]",
  "methodology-explanation":
    "methodology-explanation [max-width:760px] [&_p]:[margin:0] [&_p_+_p]:[margin-top:var(--space-section-content)]",
  "methodology-source":
    "methodology-source [margin-top:var(--space-section-content)] [padding:30px] [border-left:4px_solid_var(--blue-deep)] [background:var(--surface-primary)] [color:var(--text-primary)] [&_p]:[margin:0] [&_p_+_p]:[margin-top:18px] [&_p:first-child]:[color:var(--text-primary)] [@media((max-width:_800px))]:[margin-top:0] [@media((max-width:_800px))]:[padding:var(--space-5)] [@media((max-width:_800px))]:[border-left:0] [@media((max-width:_800px))]:[border-top:4px_solid_var(--blue-deep)] [@media((max-width:_800px))]:[&_p_+_p]:[margin-top:var(--space-4)]",
} as const;
