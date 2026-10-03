import { containerAppearance } from "@/components/container";

export const appearance = {
  legalTitle:
    "max-w-[1000px] mt-[var(--space-heading-content)] text-[length:var(--font-size-page-title)] leading-[var(--leading-page-title)] tracking-[var(--tracking-heading)] font-bold text-balance text-ink [&_em]:not-italic [&_em]:text-brand compact:wrap-anywhere",
  legal: "legal bg-white",
  "legal-hero":
    "legal-hero [padding:var(--space-section)_0] [background:var(--background-gray)] [@media((max-width:_800px))]:[padding:var(--space-section)_0]",
  shell: containerAppearance,
  eyebrow:
    "eyebrow max-w-[720px] m-0 flex items-center gap-[10px] text-[length:var(--font-size-label)] leading-[var(--leading-body)] tracking-[var(--tracking-label)] font-bold [&_span]:w-[9px] [&_span]:h-[9px] [&_span]:rounded-full [&_span]:bg-accent [&_span]:text-accent",
  "legal-subtitle":
    "legal-subtitle max-w-[720px] mt-[var(--space-related-content)] text-black text-[length:var(--font-size-lead)] leading-[var(--leading-body)] tracking-[var(--tracking-body)] font-normal text-pretty",
  "legal-body":
    "legal-body [padding:var(--space-section)_0] [background:var(--white)] [@media((max-width:_800px))]:[padding:var(--space-section)_0]",
  "legal-content":
    "legal-content grid [gap:var(--space-section)] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)]",
  "legal-section":
    "legal-section grid [grid-template-columns:0.9fr_1.1fr] [gap:var(--space-11)] [align-items:start] [padding:0] [&_.legal-section-lead]:[margin:0] [&_.legal-section-lead]:[font-size:var(--font-size-section-title)] [&_.legal-section-lead]:[line-height:var(--leading-section-title)] [&_.legal-section-lead]:[letter-spacing:var(--tracking-heading)] [&_.legal-section-lead]:font-bold [&_.legal-section-lead]:[text-transform:none] [&_.legal-section-lead]:[text-wrap:balance] [@media((max-width:_800px))]:[&_.legal-section-lead]:[overflow-wrap:anywhere] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)] [@media((max-width:_800px))]:[gap:var(--space-related-content)]",
  "legal-section-heading":
    "legal-section-heading [align-self:start] grid [gap:34px] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)]",
  "section-number":
    "section-number [margin:0] [color:var(--text-secondary)] [font-family:var(--font-ui)] [font-size:var(--font-size-label)] [line-height:var(--leading-body)] font-bold [letter-spacing:var(--tracking-label)] [text-transform:none] [.intro_&]:[grid-column:1_/_-1]",
  "legal-section-label":
    "legal-section-label m-0 inline-flex items-baseline gap-[0.35em] text-[var(--text-secondary)] text-[length:var(--font-size-label)] leading-[var(--leading-body)] tracking-[var(--tracking-label)] font-bold [&_>_span:first-child]:min-w-[2ch] [&_>_span:first-child]:tabular-nums",
  "legal-section-copy":
    "legal-section-copy max-w-[720px] [&_p]:max-w-[720px] [&_p]:m-0 [&_p]:text-black [&_p]:text-[length:var(--font-size-body-large)] [&_p]:leading-[var(--leading-body)] [&_p]:tracking-[var(--tracking-body)] [&_p]:font-normal [&_p]:text-pretty [&_p_+_p]:mt-[1.35em]",
} as const;
