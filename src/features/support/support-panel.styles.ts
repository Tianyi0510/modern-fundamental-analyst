import { containerAppearance } from "@/components/container";

export const appearance = {
  "support-section":
    "support-section [padding:var(--space-section)_0] [&_h2]:text-headline [&_h2]:[text-transform:none] [&_h2]:[text-wrap:balance] compact:[&_h2]:wrap-anywhere",
  "support-layout":
    "support-layout grid [grid-template-columns:0.8fr_1.2fr] [gap:var(--space-1200)] [align-items:start] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)] [@media((max-width:_800px))]:[gap:var(--space-related-content)]",
  shell: containerAppearance,
  "support-copy":
    "support-copy min-w-0 [&_h2]:[margin:0] [&_p]:[max-width:520px] [&_p]:[margin:var(--space-related-content)_0_0] [&_p]:[color:var(--text-primary)] [&_p]:text-body-large",
  "support-note": "support-note [margin:var(--space-200)_0_0] [color:var(--text-secondary)] text-body-large",
  "support-honeypot": "support-honeypot absolute [left:-9999px] [width:1px] [height:1px] [overflow:hidden]",
  "support-amounts":
    "support-amounts grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:var(--space-150)] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)]",
  "support-amount-option":
    "support-amount-option [color:var(--text-brand)] rounded-[var(--radius-card)] border border-[var(--border-subtle)] relative [min-height:210px] [padding:var(--space-300)] [background:var(--surface-primary)] flex flex-col [justify-content:space-between] [cursor:pointer] [transition:background-color_var(--motion-effects-default-duration)_var(--motion-effects-default-easing),_color_var(--motion-effects-default-duration)_var(--motion-effects-default-easing),_transform_var(--motion-spatial-fast-duration)_var(--motion-spatial-fast-easing)] [&_input]:absolute [&_input]:[width:1px] [&_input]:[height:1px] [&_input]:[opacity:0] [&_input]:[pointer-events:none] [&_>_span]:font-bold [&_>_span]:[letter-spacing:var(--tracking-label)] [&:hover]:[background:var(--surface-state-hover)] [&:has(input:checked)]:[z-index:1] [&:has(input:checked)]:[background:var(--surface-brand)] [&:has(input:checked)]:[color:var(--text-inverse)] [&:has(input:focus-visible)]:[outline:var(--focus-ring-width)_solid_var(--focus-ring-on-light)] [&:has(input:checked):has(input:focus-visible)]:[outline-color:var(--focus-ring-on-dark)] [&:has(input:focus-visible)]:[outline-offset:calc(var(--focus-ring-offset)_*_-1)] [&:active]:[transform:scale(var(--motion-scale-press))] [&_strong]:[font-family:var(--font-ui)] [&_strong]:text-data-kpi [&_strong]:[font-variant-numeric:tabular-nums] [@media((max-width:_800px))]:[min-height:150px] [@media((hover:_none)_and_(pointer:_coarse))]:[&:hover:not(:has(input:checked))]:[background:var(--surface-primary)] [@media((hover:_none)_and_(pointer:_coarse))]:[&:hover:not(:has(input:checked))]:[color:var(--text-brand)] [@media((hover:_none)_and_(pointer:_coarse))]:[&:active:not(:has(input:checked))]:[background:var(--surface-state-pressed)] [@media((hover:_none)_and_(pointer:_coarse))]:[&:active:not(:has(input:checked))]:[transform:scale(var(--motion-scale-press))] [@media((hover:_none)_and_(pointer:_coarse))]:[&:active]:[transform:scale(var(--motion-scale-press))]",
  "support-status":
    "support-status [margin:var(--space-300)_0_0] [padding:var(--space-200)] [border-left-width:4px] [background:var(--surface-primary)] [color:var(--text-primary)] text-body-large",
} as const;
