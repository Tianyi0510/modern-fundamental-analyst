import { containerAppearance } from "@/components/container";

export const appearance = {
  shell: containerAppearance,
  "date-text":
    "date-text [.performance-page_.page-intro_&]:[margin-left:auto] [.performance-page_.page-intro_&]:[max-width:100%] [font-family:var(--font-ui)] [font-variant-numeric:tabular-nums] [@media((max-width:_800px))]:[.performance-page_.page-intro_&]:[margin-left:0]",
  "portfolio-kpis":
    "portfolio-kpis grid grid-cols-2 grid-rows-2 min-h-[480px] compact:grid-cols-1 compact:grid-rows-[repeat(4,minmax(168px,auto))] compact:min-h-0",
  "portfolio-holdings-section": "portfolio-holdings-section [background:var(--background-gray)]",
  "portfolio-holdings-heading":
    "portfolio-holdings-heading [padding:var(--space-section-compact)_0_var(--space-heading-content)] grid [grid-template-columns:1.35fr_0.65fr] [gap:64px] [align-items:end] [&_>_div]:grid [&_>_div]:[gap:20px] [&_>_div]:min-w-0 [&_>_div]:[overflow-wrap:anywhere] [&_h2]:[margin:0] [&_h2]:[font-size:var(--font-size-section-title)] [&_h2]:[line-height:var(--leading-section-title)] [&_h2]:[letter-spacing:var(--tracking-heading)] [&_h2]:font-bold [&_h2]:[text-transform:none] [&_h2]:[text-wrap:balance] [&_h2]:[color:var(--text-brand)] [&_p]:[max-width:420px] [&_p]:[margin:0] [&_p]:[color:var(--text-secondary)] [&_p]:[font-size:var(--font-size-body)] [&_p]:[line-height:var(--leading-body)] [&_p]:[letter-spacing:var(--tracking-body)] [&_p]:font-normal [&_span]:[font-family:var(--font-ui)] [&_span]:[font-size:var(--font-size-label)] [&_span]:[line-height:var(--leading-body)] [&_span]:font-bold [&_span]:[letter-spacing:var(--tracking-label)] [&_span]:[text-transform:none] [.portfolio-page_&_span]:[font-size:var(--font-size-label)] [.portfolio-page_&_span]:[line-height:var(--leading-body)] [.portfolio-page_&_span]:font-bold [.portfolio-page_&_span]:[letter-spacing:var(--tracking-label)] [.portfolio-page_&_span]:[text-transform:none] [@media((max-width:_800px))]:[padding:var(--space-section-compact)_0_var(--space-heading-content)] [@media((max-width:_800px))]:[grid-template-columns:1fr] [@media((max-width:_800px))]:[gap:var(--space-related-content)]",
  "portfolio-desktop-instruction": "portfolio-desktop-instruction [@media((max-width:_800px))]:hidden",
  "portfolio-table-wrap":
    "portfolio-table-wrap [overflow-x:auto] [scrollbar-width:thin] [@media((max-width:_800px))]:[.portfolio-holdings-section_&]:[width:min(100%_-_32px,_720px)] [@media((max-width:_800px))]:[.portfolio-holdings-section_&]:[margin-inline:auto] [@media((max-width:_800px))]:[.portfolio-holdings-section_&]:[overflow:visible]",
  "portfolio-return-note":
    "portfolio-return-note [padding:var(--space-4)_0_var(--space-section-compact)] [&_p]:[max-width:720px] [&_p]:[margin:0] [&_p]:[color:var(--text-secondary)] [&_p]:[font-size:var(--font-size-caption)] [&_p]:[line-height:var(--leading-body)]",
} as const;
