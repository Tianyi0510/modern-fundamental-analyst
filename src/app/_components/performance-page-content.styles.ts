import { containerAppearance } from "@/components/container";

export const appearance = {
  shell: containerAppearance,
  "date-text":
    "date-text [.performance-page_.page-intro_&]:[margin-left:auto] [.performance-page_.page-intro_&]:[max-width:100%] [font-family:var(--font-ui)] [font-variant-numeric:tabular-nums] [@media((max-width:_800px))]:[.performance-page_.page-intro_&]:[margin-left:0]",
  "performance-summary": "performance-summary grid grid-cols-3 gap-px bg-black compact:grid-cols-1",
  returns:
    "returns [padding:var(--space-section)_0] grid [grid-template-columns:0.7fr_1.3fr] [gap:80px] [.performance-page_&]:[grid-template-columns:minmax(0,_1fr)] [.performance-page_&]:[gap:var(--space-heading-content)] [.performance-page_&_>_*]:min-w-0 [.performance-page_&_>_*]:[overflow-wrap:anywhere] [@media((max-width:_1100px)_and_(min-width:_801px))]:[grid-template-columns:1fr] [@media((max-width:_1100px)_and_(min-width:_801px))]:[gap:var(--space-related-content)] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)] [@media((max-width:_800px))]:[padding:var(--space-section)_0] [@media((max-width:_800px))]:[.performance-page_&]:[gap:var(--space-heading-content)] [&_h2]:[color:var(--text-brand)]",
  "section-heading":
    "section-heading grid [grid-template-columns:1fr_2fr] [align-items:start] [&_h2]:[margin:0] [&_h2]:[font-size:var(--font-size-section-title)] [&_h2]:[line-height:var(--leading-section-title)] [&_h2]:[letter-spacing:var(--tracking-heading)] [&_h2]:font-bold [&_h2]:[text-transform:none] [&_h2]:[text-wrap:balance] [.returns_&]:block [.returns_&_h2]:[margin-top:var(--space-related-content)] [@media((max-width:_800px))]:[&_h2]:[overflow-wrap:anywhere] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)] [@media((max-width:_800px))]:[gap:var(--space-related-content)]",
  "section-number":
    "section-number [margin:0] [color:var(--text-secondary)] [font-family:var(--font-ui)] [font-size:var(--font-size-label)] [line-height:var(--leading-body)] font-bold [letter-spacing:var(--tracking-label)] [text-transform:none] [.intro_&]:[grid-column:1_/_-1]",
  "section-gray": "section-gray [background:var(--background-gray)]",
  methodology:
    "methodology [&_h2]:[margin:0] [&_h2]:[font-size:var(--font-size-section-title)] [&_h2]:[line-height:var(--leading-section-title)] [&_h2]:[letter-spacing:var(--tracking-heading)] [&_h2]:font-bold [&_h2]:[text-transform:none] [&_h2]:[text-wrap:balance] [&_h2]:[color:var(--text-brand)] [padding:var(--space-section)_0] grid [grid-template-columns:0.7fr_1.3fr] [gap:80px] [&_div]:[color:var(--black)] [&_div]:[font-size:var(--font-size-body-large)] [&_div]:[line-height:var(--leading-body)] [&_div]:[letter-spacing:var(--tracking-body)] [&_div]:font-normal [&_div]:[text-wrap:pretty] [&_div_p:first-child]:[margin-top:0] [.performance-page_&_>_*]:min-w-0 [.performance-page_&_>_*]:[overflow-wrap:anywhere] [@media((max-width:_1100px)_and_(min-width:_801px))]:[grid-template-columns:1fr] [@media((max-width:_1100px)_and_(min-width:_801px))]:[gap:var(--space-related-content)] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)] [@media((max-width:_800px))]:[padding:var(--space-section)_0] [@media((max-width:_800px))]:[.performance-page_&]:[gap:var(--space-heading-content)]",
  "methodology-content":
    "methodology-content [.performance-page_&_>_*]:min-w-0 [.performance-page_&_>_*]:[overflow-wrap:anywhere] [@media((max-width:_800px))]:grid [@media((max-width:_800px))]:[gap:var(--space-related-content)]",
  "methodology-explanation":
    "methodology-explanation [max-width:760px] [&_p]:[margin:0] [&_p_+_p]:[margin-top:var(--space-related-content)]",
  "methodology-source":
    "methodology-source [margin-top:var(--space-related-content)] [padding:30px] [border-left:4px_solid_var(--deep-blue)] [background:var(--white)] [color:var(--black)] [&_p]:[margin:0] [&_p_+_p]:[margin-top:18px] [&_p:first-child]:[color:var(--black)] [@media((max-width:_800px))]:[margin-top:0] [@media((max-width:_800px))]:[padding:var(--space-5)] [@media((max-width:_800px))]:[border-left:0] [@media((max-width:_800px))]:[border-top:4px_solid_var(--deep-blue)] [@media((max-width:_800px))]:[&_p_+_p]:[margin-top:var(--space-4)]",
} as const;
