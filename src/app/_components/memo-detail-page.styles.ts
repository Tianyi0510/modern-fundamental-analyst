import { containerAppearance } from "@/components/container";

export const appearance = {
  "memo-article":
    "memo-article [padding:0_0_var(--space-section)] [&_h1]:[max-width:1120px] [&_h1]:[margin:var(--space-600)_0_var(--space-600)] [&_h1]:text-display [&_h1]:[text-transform:none] [&_h1]:[text-wrap:balance] [@media((max-width:_800px))]:[&_h1]:[overflow-wrap:anywhere]",
  "memo-article-header-band": "memo-article-header-band [background:var(--surface-muted)]",
  "memo-article-header": "memo-article-header [padding-top:var(--space-section)]",
  shell: containerAppearance,
  eyebrow:
    "eyebrow [margin:0] flex items-center [gap:var(--space-125)] [font-family:var(--font-ui)] text-label [text-transform:none] [&_span]:[width:9px] [&_span]:[height:9px] [&_span]:rounded-round [&_span]:[color:var(--text-interactive)] [&_span]:[background:var(--interactive-accent)] [.cta_&]:[grid-column:1_/_-1] [.cta_&]:[margin:0_0_var(--space-600)] [.about-closing_>_&]:[grid-column:1_/_-1] [@media((max-width:_800px))]:[.cta_&]:[margin-bottom:0]",
  "article-meta":
    "article-meta flex items-center [flex-wrap:wrap] [gap:var(--space-350)] [padding:var(--space-250)_0] [border-top:1px_solid_var(--border-strong)] [border-bottom:1px_solid_var(--border-subtle)] text-caption [font-family:var(--font-ui)] [font-variant-numeric:tabular-nums]",
  "article-lead":
    "article-lead [max-width:900px] [margin:var(--space-section)_0_var(--space-related-content)] text-lead [text-transform:none] [text-wrap:pretty]",
  "article-notes":
    "article-notes mx-auto mb-[var(--space-heading-content)] grid w-[min(1040px,100%)] gap-[var(--space-300)] text-body-large [overflow-wrap:anywhere]",
} as const;
