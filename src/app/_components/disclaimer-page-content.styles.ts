import { containerAppearance } from "@/components/container";

export const appearance = {
  legalTitle:
    "max-w-[1000px] mt-[var(--space-heading-content)] text-medium-headline text-balance text-ink [&_em]:not-italic [&_em]:text-brand compact:wrap-anywhere",
  legal: "legal bg-surface",
  "legal-hero":
    "legal-hero [padding:var(--space-section-padding)_0] [background:var(--surface-secondary)] [@media((max-width:_800px))]:[padding:var(--space-section-padding)_0]",
  shell: containerAppearance,
  eyebrow:
    "eyebrow max-w-[720px] m-0 flex items-center gap-[10px] text-large-label [&_span]:w-[9px] [&_span]:h-[9px] [&_span]:rounded-full [&_span]:bg-accent [&_span]:text-accent",
  "legal-subtitle":
    "legal-subtitle max-w-[720px] mt-[var(--space-section-content)] text-ink text-large-body text-pretty",
  "legal-body":
    "legal-body [padding:var(--space-section-padding)_0] [background:var(--surface-primary)] [@media((max-width:_800px))]:[padding:var(--space-section-padding)_0]",
  "legal-content":
    "legal-content grid [gap:var(--space-section-content)] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)]",
  "legal-section":
    "legal-section grid [grid-template-columns:var(--grid-editorial)] [column-gap:var(--grid-column-gap)] [row-gap:var(--space-section-content)] [align-items:start] [padding:0] [&_.legal-section-lead]:[margin:0] [&_.legal-section-lead]:text-small-headline [&_.legal-section-lead]:[text-transform:none] [&_.legal-section-lead]:[text-wrap:balance] [@media((max-width:_800px))]:[&_.legal-section-lead]:[overflow-wrap:anywhere] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)] [@media((max-width:_800px))]:[gap:var(--space-section-content)]",
  "legal-section-heading":
    "legal-section-heading [align-self:start] grid [gap:34px] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)]",
  "section-number":
    "section-number [margin:0] [color:var(--text-secondary)] [font-family:var(--font-ui)] text-large-label [text-transform:none] [.intro_&]:[grid-column:1_/_-1]",
  "legal-section-label":
    "legal-section-label m-0 inline-flex items-baseline gap-[0.35em] text-[var(--text-secondary)] text-large-label [&_>_span:first-child]:min-w-[2ch] [&_>_span:first-child]:tabular-nums",
  "legal-section-copy":
    "legal-section-copy max-w-[720px] [&_p]:max-w-[720px] [&_p]:m-0 [&_p]:text-ink [&_p]:text-medium-body [&_p]:text-pretty [&_p_+_p]:mt-[1.35em]",
} as const;
