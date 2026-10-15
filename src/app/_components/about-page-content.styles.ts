import { containerAppearance } from "@/components/container";

export const appearance = {
  shell: containerAppearance,
  eyebrow:
    "eyebrow [margin:0] flex items-center [gap:var(--space-125)] [font-family:var(--font-ui)] text-label [text-transform:none] [&_span]:[width:9px] [&_span]:[height:9px] [&_span]:rounded-round [&_span]:[color:var(--text-interactive)] [&_span]:[background:var(--interactive-accent)] [.cta_&]:[grid-column:1_/_-1] [.cta_&]:[margin:0_0_var(--space-600)] [.about-closing_>_&]:[grid-column:1_/_-1] [@media((max-width:_800px))]:[.cta_&]:[margin-bottom:0]",
  "section-gray": "section-gray [background:var(--surface-muted)]",
  "about-section":
    "about-section [padding:var(--space-section)_0] grid [grid-template-columns:0.9fr_1.1fr] [gap:var(--space-1200)] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)] [@media((max-width:_800px))]:[padding:var(--space-section)_0] [@media((max-width:_800px))]:[gap:var(--space-heading-content)]",
  "about-section-heading":
    "about-section-heading [align-self:start] grid [gap:var(--space-heading-stack-gap)] [&_h2]:[margin:0] [&_h2]:text-headline [&_h2]:[text-transform:none] [&_h2]:[text-wrap:balance] [&_h2]:[color:var(--text-brand)] [&_>_span]:[font-family:var(--font-ui)] [&_>_span]:text-label [&_>_span]:[text-transform:none] [.about-page_&_>_span]:text-label [.about-page_&_>_span]:[text-transform:none] [@media((max-width:_800px))]:[&_h2]:[overflow-wrap:anywhere]",
  "section-number":
    "section-number [margin:0] [color:var(--text-secondary)] [font-family:var(--font-ui)] text-label [text-transform:none] [.intro_&]:[grid-column:1_/_-1]",
  "about-section-label":
    "about-section-label [margin:0] inline-flex [align-items:baseline] [gap:var(--space-75)] [&_>_span:first-child]:[min-width:2ch] [&_>_span:first-child]:[font-variant-numeric:tabular-nums] [@media((max-width:_800px))]:[flex-wrap:wrap]",
  "about-copy":
    "about-copy grid content-start [gap:var(--space-paragraph-gap)] [&_>_p]:[margin:0] [&_>_:first-child]:[margin-top:0] [&_>_:last-child]:[margin-bottom:0] [.about-page_&]:[color:var(--text-primary)] [&_em]:[color:var(--text-brand)] [&_em]:[font-style:normal] [&_em]:[font-weight:700] text-body-large [text-wrap:pretty]",
  "about-boundaries":
    "about-boundaries [.about-page_&_>_section:last-child_ol]:[color:var(--text-primary)] grid [grid-template-columns:1fr_1fr] [gap:1px] [background:var(--surface-inverse)] [&_>_section]:[min-height:0] [&_>_section]:[padding:var(--space-section)_var(--space-600)] [&_>_section]:[background:var(--surface-primary)] [&_>_section]:flex [&_>_section]:flex-col [&_h2]:[max-width:420px] [&_h2]:[margin:0] [&_h2]:text-title-small [&_h2]:[text-transform:none] [&_ol]:[margin:var(--space-related-content)_0_0] [&_ol]:[padding:0] [&_ol]:[list-style:none] [&_ol]:text-body-large [&_ol]:[text-wrap:pretty] [&_li]:grid [&_li]:[grid-template-columns:42px_minmax(0,_1fr)] [&_li]:[align-items:baseline] [&_li]:[gap:var(--space-200)] [&_li]:[padding:var(--space-250)_0] [&_li:last-child]:[padding-bottom:0] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)] [@media((max-width:_800px))]:[grid-template-rows:auto] [@media((max-width:_800px))]:[&_li_span]:[overflow-wrap:anywhere] [@media((max-width:_800px))]:[&_>_section]:[min-height:0] [@media((max-width:_800px))]:[&_>_section]:[padding:var(--space-section)_var(--space-page-gutter)] [@media((max-width:_800px))]:[&_ol]:[margin-top:var(--space-related-content)] [&_>_section:first-child]:[background:var(--surface-inverse)] [&_>_section:first-child]:[color:var(--text-inverse)] [&_>_section:last-child]:[background:var(--surface-highlight)] [&_>_section:last-child]:[color:var(--text-primary)]",
  "about-boundary-number":
    "about-boundary-number [color:var(--text-interactive)] [font-family:var(--font-ui)] [font-variant-numeric:tabular-nums] text-body-large font-bold [.about-boundaries_>_section:last-child_&]:[color:var(--text-brand)] [.about-boundaries_>_section:first-child_&]:[color:var(--text-highlight)]",
  "about-closing":
    "about-closing [&_h2]:[margin:0] [&_h2]:text-headline [&_h2]:[text-transform:none] [&_h2]:[text-wrap:balance] [.about-page_&_>_div]:[color:var(--text-primary)] [padding:var(--space-section)_0] grid [grid-template-columns:1fr_1.2fr] [gap:var(--space-1000)] [&_>_div]:[color:var(--text-primary)] [&_>_div]:text-body-large [&_>_div]:[text-wrap:pretty] [&_>_div_p]:[margin:0] [&_>_div]:grid [&_>_div]:content-start [&_>_div]:[gap:var(--space-paragraph-gap)] [@media((max-width:_800px))]:[&_h2]:[overflow-wrap:anywhere] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)] [@media((max-width:_800px))]:[padding:var(--space-section)_0] [@media((max-width:_800px))]:[gap:var(--space-heading-content)]",
  "reference-note":
    "reference-note [color:var(--text-primary)] text-body-large [text-wrap:pretty] [&_>_span]:font-bold",
  "source-link":
    "source-link [color:var(--text-interactive)] font-normal [text-decoration:underline] [text-decoration-thickness:1px] [text-underline-offset:3px] [transition:color_var(--motion-effects-default-duration)_var(--motion-effects-default-easing)] [&:focus-visible]:[outline:var(--focus-ring-width)_solid_var(--border-brand)] [&:focus-visible]:[outline-offset:var(--focus-ring-offset)] [&:focus-visible]:[color:var(--text-interactive)] [&:hover]:[color:var(--text-interactive)]",
} as const;
