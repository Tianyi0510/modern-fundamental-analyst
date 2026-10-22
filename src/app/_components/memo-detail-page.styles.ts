import { containerAppearance } from "@/components/container";

export const appearance = {
  "memo-article":
    "memo-article  [&_h1]:[max-width:var(--width-article)] [&_h1]:[margin:0_0_var(--space-section-content)] [&_h1]:text-large-display [&_h1]:[text-transform:none] [&_h1]:[text-wrap:balance] [@media((max-width:_800px))]:[&_h1]:[overflow-wrap:anywhere] [@media((max-width:_800px))]:[&_h1]:[letter-spacing:var(--tracking-zero)]",
  "memo-article-header-band": "memo-article-header-band [background:var(--surface-secondary)]",
  "memo-article-header": "memo-article-header [padding-top:var(--space-section-padding)]",
  shell: containerAppearance + " max-w-[var(--width-article)]",
  "article-meta":
    "article-meta max-w-[var(--width-article)] flex items-center [flex-wrap:wrap] [gap:28px] [padding:18px_0] [border-top:1px_solid_var(--border-strong)] [border-bottom:1px_solid_var(--border-subtle)] text-small-body [font-family:var(--font-ui)] [font-variant-numeric:tabular-nums]",
  "article-lead":
    "article-lead max-w-[var(--width-article)] [margin:0_0_var(--space-related-content)] text-large-body [text-transform:none] [text-wrap:pretty]",
  "article-notes":
    "article-notes mb-[var(--space-heading-content)] w-[min(var(--width-article),100%)] text-medium-body [overflow-wrap:anywhere]",
  "article-disclaimer":
    "article-disclaimer mt-[var(--space-heading-content)] w-[min(var(--width-article),100%)] text-medium-body [overflow-wrap:anywhere] [&_p]:m-0",
} as const;
