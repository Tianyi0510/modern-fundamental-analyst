import { containerAppearance } from "@/components/container";

export const appearance = {
  "support-section":
    "support-section [padding:var(--space-section-padding)_0] [&_h2]:text-large-title [&_h2]:[text-transform:none] [&_h2]:[text-wrap:balance] compact:[&_h2]:wrap-anywhere",
  "support-layout":
    "support-layout grid [grid-template-columns:var(--grid-sidebar)] [column-gap:var(--grid-column-gap)] [row-gap:var(--space-section-content)] [align-items:start] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)] [@media((max-width:_800px))]:[gap:var(--space-section-content)]",
  shell: containerAppearance,
  "support-copy":
    "support-copy min-w-0 [&_h2]:[margin:0] [&_p]:[max-width:520px] [&_p]:[margin:var(--space-related-content)_0_0] [&_p]:[color:var(--text-primary)] [&_p]:text-medium-body",
  "support-note": "support-note [margin:var(--space-4)_0_0] [color:var(--text-secondary)] text-medium-body",
  "support-honeypot": "support-honeypot absolute [left:-9999px] [width:1px] [height:1px] [overflow:hidden]",
  "support-amounts":
    "support-amounts @max-[30rem]/support-options:grid-cols-1 grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] gap-px [background:var(--border-strong)] [border:1px_solid_var(--border-strong)] [@media((max-width:_800px))]:[grid-template-columns:minmax(0,_1fr)]",
  "support-amount-option":
    "support-amount-option relative [min-height:210px] [padding:var(--space-5)] [background:var(--surface-primary)] flex flex-col [justify-content:space-between] [cursor:pointer] [transition:background-color_var(--motion-duration-base)_var(--motion-ease-standard),_color_var(--motion-duration-base)_var(--motion-ease-standard),_transform_var(--motion-duration-base)_var(--motion-ease-emphasized)] [&_input]:absolute [&_input]:[width:1px] [&_input]:[height:1px] [&_input]:[opacity:0] [&_input]:[pointer-events:none] [&_>_span]:text-large-label [&:hover]:[background:var(--support-option-hover-surface)] [&:has(input:checked)]:[z-index:1] [&:has(input:checked)]:[background:var(--support-option-selected-surface)] [&:has(input:checked)]:[color:var(--support-option-selected-text)] [&:has([role=radio]:focus-visible,input:focus-visible)]:[outline:var(--focus-ring-width)_solid_var(--focus-ring-brand)] [&:has([role=radio]:focus-visible,input:focus-visible)]:[outline-offset:calc(var(--focus-ring-offset)_*_-1)] [&:active]:[transform:scale(var(--motion-scale-press))] [&_strong]:[font-family:var(--font-ui)] [&_strong]:text-medium-display [&_strong]:[font-variant-numeric:tabular-nums] [@media((max-width:_800px))]:[min-height:150px] [@media((hover:_none)_and_(pointer:_coarse))]:[&:hover:not(:has(input:checked))]:[background:var(--surface-primary)] [@media((hover:_none)_and_(pointer:_coarse))]:[&:hover:not(:has(input:checked))]:[color:var(--text-primary)] [@media((hover:_none)_and_(pointer:_coarse))]:[&:active:not(:has(input:checked))]:[background:var(--support-option-hover-surface)] [@media((hover:_none)_and_(pointer:_coarse))]:[&:active:not(:has(input:checked))]:[transform:scale(var(--motion-scale-press))] [@media((hover:_none)_and_(pointer:_coarse))]:[&:active]:[transform:scale(var(--motion-scale-press))]",
  "support-status":
    "support-status [margin:var(--space-5)_0_0] [padding:var(--space-4)] [border-left-width:4px] [background:var(--surface-primary)] [color:var(--text-primary)] text-medium-body",
} as const;
