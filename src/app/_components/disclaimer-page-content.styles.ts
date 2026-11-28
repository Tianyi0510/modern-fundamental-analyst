import { containerAppearance } from "@/components/container";

export const appearance = {
  legalTitle:
    "max-w-[1000px] mt-0 text-large-display text-balance text-ink [&_em]:not-italic [&_em]:text-brand compact:wrap-anywhere",
  legal: "legal bg-surface",
  "legal-hero":
    "legal-hero [padding:var(--space-section-padding)_0] [background:var(--surface-secondary)] [@media((max-width:_800px))]:[padding:var(--space-section-padding)_0]",
  shell: containerAppearance,
  "legal-subtitle":
    "legal-subtitle max-w-[var(--width-reading)] mt-[var(--space-section-content)] text-ink text-large-body text-pretty",
  "legal-section": "legal-section py-[var(--space-section-padding)] even:bg-[var(--surface-secondary)]",
  "legal-content":
    "legal-content grid grid-cols-1 min-[1101px]:grid-cols-[var(--grid-columns)] min-[1101px]:[&>p]:col-span-full min-[1101px]:[&>h2]:[grid-column:1/6] min-[1101px]:[&>.legal-section-copy]:[grid-column:6/-1] [column-gap:var(--grid-column-gap)] [row-gap:var(--space-section-content)] [align-items:start] [padding:0] [&_.legal-section-lead]:[margin:0] [&_.legal-section-lead]:text-small-headline [&_.legal-section-lead]:[text-transform:none] [&_.legal-section-lead]:[text-wrap:balance] [@media((max-width:_800px))]:[&_.legal-section-lead]:[overflow-wrap:anywhere] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)] [@media((max-width:_800px))]:[gap:var(--space-section-content)]",
  "section-number":
    "section-number [margin:0] [color:var(--text-secondary)] [font-family:var(--font-ui)] text-large-label [text-transform:none] [.intro_&]:[grid-column:1_/_-1]",
  "legal-section-label":
    "legal-section-label m-0 inline-flex items-baseline gap-[var(--space-4px)] text-[var(--text-secondary)] text-large-label [&_>_span:first-child]:min-w-[2ch] [&_>_span:first-child]:tabular-nums",
  "legal-section-copy":
    "legal-section-copy [&_p]:max-w-[var(--width-reading)] [&_p]:m-0 [&_p]:text-ink [&_p]:text-medium-body [&_p]:text-pretty [&_p_+_p]:mt-[var(--space-paragraph)]",
} as const;
