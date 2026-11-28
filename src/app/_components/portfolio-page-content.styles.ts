import { containerAppearance } from "@/components/container";

export const appearance = {
  shell: containerAppearance,
  "date-text": "date-text [font-family:var(--font-ui)] [font-variant-numeric:tabular-nums]",
  "portfolio-kpis":
    "portfolio-kpis grid auto-rows-fr grid-cols-[var(--grid-portfolio-summary)] @max-[72rem]/hero-summary:grid-cols-1 @min-[20rem]/hero-summary:@max-[22rem]/hero-summary:[&>*]:px-[var(--space-8px)] @max-[10rem]/hero-summary:[&>*]:px-[var(--space-4px)] compact:grid-cols-1",
  "portfolio-holdings-section": "portfolio-holdings-section bg-surface py-[var(--space-section-padding)]",
  "portfolio-holdings-heading":
    "portfolio-holdings-heading [padding:0_0_var(--space-heading-content)] grid grid-cols-1 min-[801px]:grid-cols-[var(--grid-columns)] min-[801px]:[&>:first-child]:[grid-column:1/9] min-[801px]:[&>:nth-child(2)]:[grid-column:9/-1] [column-gap:var(--grid-column-gap)] [row-gap:var(--space-section-content)] [align-items:end] [&_>_div]:grid [&_>_div]:[gap:var(--space-section-content)] [&_>_div]:min-w-0 [&_>_div]:[overflow-wrap:anywhere] [&_h2]:[margin:0] [&_h2]:text-small-headline [&_h2]:[text-transform:none] [&_h2]:[text-wrap:balance] [&_h2]:[color:var(--text-brand)] [&_p]:[max-width:420px] [&_p]:[margin:0] [&_p]:[color:var(--text-secondary)] [&_p]:text-small-body [&_span]:[font-family:var(--font-ui)] [&_span]:text-large-label [&_span]:[text-transform:none] [.portfolio-page_&_span]:text-large-label [.portfolio-page_&_span]:[text-transform:none] [@media((max-width:_800px))]:[padding:0_0_var(--space-heading-content)] [@media((max-width:_800px))]:[grid-template-columns:1fr] [@media((max-width:_800px))]:[gap:var(--space-section-content)]",
  "portfolio-desktop-instruction": "portfolio-desktop-instruction [@media((max-width:_800px))]:hidden",
  "portfolio-table-wrap":
    "portfolio-table-wrap [overflow-x:auto] [scrollbar-width:thin] [@media((max-width:_800px))]:[.portfolio-holdings-section_&]:[width:min(100%_-_32px,_var(--width-content-compact))] [@media((max-width:_800px))]:[.portfolio-holdings-section_&]:[margin-inline:auto] [@media((max-width:_800px))]:[.portfolio-holdings-section_&]:[overflow:visible]",
  "portfolio-return-note":
    "portfolio-return-note [padding:var(--space-section-content)_0_0] [&_p]:[max-width:var(--width-reading)] [&_p]:[margin:0] [&_p]:[color:var(--text-secondary)] [&_p]:text-small-body",
} as const;
