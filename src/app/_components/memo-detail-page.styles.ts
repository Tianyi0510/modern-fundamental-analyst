import { containerAppearance } from "@/components/container";

export const appearance = {
  "memo-article":
    "memo-article  [&_h1]:[max-width:1120px] [&_h1]:[margin:var(--space-section-content)_0] [&_h1]:text-large-display [&_h1]:[text-transform:none] [&_h1]:[text-wrap:balance] [@media((max-width:_800px))]:[&_h1]:[overflow-wrap:anywhere] [@media((max-width:_800px))]:[&_h1]:[letter-spacing:var(--tracking-zero)]",
  "memo-article-header-band": "memo-article-header-band [background:var(--surface-secondary)]",
  "memo-article-header": "memo-article-header [padding-top:var(--space-section-padding)]",
  shell: containerAppearance,
  eyebrow:
    "eyebrow [margin:0] flex items-center [gap:10px] [font-family:var(--font-ui)] text-large-label [text-transform:none] [&_span]:[width:9px] [&_span]:[height:9px] [&_span]:rounded-full [&_span]:[color:var(--interactive-accent)] [&_span]:[background:var(--interactive-accent)] [.cta_&]:[grid-column:1_/_-1] [.cta_&]:[margin:0_0_46px] [.about-closing_>_&]:[grid-column:1_/_-1] [@media((max-width:_800px))]:[.cta_&]:[margin-bottom:0]",
  "article-meta":
    "article-meta max-w-[1120px] flex items-center [flex-wrap:wrap] [gap:28px] [padding:18px_0] [border-top:1px_solid_var(--border-strong)] [border-bottom:1px_solid_var(--border-subtle)] text-small-body [font-family:var(--font-ui)] [font-variant-numeric:tabular-nums]",
  "article-lead":
    "article-lead max-w-[1120px] [margin:0_0_var(--space-related-content)] text-large-body [text-transform:none] [text-wrap:pretty]",
  "article-notes":
    "article-notes mb-[var(--space-heading-content)] w-[min(1120px,100%)] text-medium-body [overflow-wrap:anywhere]",
  "article-disclaimer":
    "article-disclaimer mt-[var(--space-heading-content)] w-[min(1120px,100%)] text-medium-body [overflow-wrap:anywhere] [&_p]:m-0",
} as const;
