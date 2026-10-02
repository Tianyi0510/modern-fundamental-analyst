import { containerAppearance } from "@/components/container";

export const appearance = {
  "support-section":
    "support-section [padding:var(--space-section)_0] [&_h2]:[font-size:var(--font-size-section-title)] [&_h2]:[line-height:var(--leading-section-title)] [&_h2]:[letter-spacing:var(--tracking-heading)] [&_h2]:font-bold [&_h2]:[text-transform:none] [&_h2]:[text-wrap:balance]",
  "support-layout":
    "support-layout grid [grid-template-columns:0.8fr_1.2fr] [gap:var(--space-11)] [align-items:start] [@media((max-width:_800px))]:[grid-template-columns:1fr] [@media((max-width:_800px))]:[gap:var(--space-related-content)]",
  shell: containerAppearance,
  "support-copy":
    "support-copy [&_h2]:[margin:0] [&_p]:[max-width:520px] [&_p]:[margin:var(--space-related-content)_0_0] [&_p]:[color:var(--black)] [&_p]:[font-size:var(--font-size-body-large)] [&_p]:[line-height:var(--leading-body)] [&_p]:[letter-spacing:var(--tracking-body)] [&_p]:font-normal",
  "support-note":
    "support-note [margin:var(--space-4)_0_0] [color:var(--text-secondary)] [font-size:var(--font-size-body-large)] [line-height:var(--leading-body)] [letter-spacing:var(--tracking-body)] font-normal",
  "support-honeypot": "support-honeypot absolute [left:-9999px] [width:1px] [height:1px] [overflow:hidden]",
  "support-amounts":
    "support-amounts grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:1px] [background:var(--black)] [border:1px_solid_var(--black)] [@media((max-width:_800px))]:[grid-template-columns:1fr]",
  "support-amount-option":
    "support-amount-option relative [min-height:210px] [padding:var(--space-5)] [background:var(--white)] flex flex-col [justify-content:space-between] [cursor:pointer] [transition:background-color_var(--motion-duration-base)_var(--motion-ease-standard),_color_var(--motion-duration-base)_var(--motion-ease-standard),_transform_var(--motion-duration-base)_var(--motion-ease-emphasized)] [&_input]:absolute [&_input]:[width:1px] [&_input]:[height:1px] [&_input]:[opacity:0] [&_input]:[pointer-events:none] [&_>_span]:font-bold [&_>_span]:[letter-spacing:var(--tracking-label)] [&:hover]:[background:color-mix(in_srgb,_var(--bright-blue)_24%,_var(--white))] [&:has(input:checked)]:[z-index:1] [&:has(input:checked)]:[background:var(--deep-blue)] [&:has(input:checked)]:[color:var(--white)] [&:has(input:focus-visible)]:[outline:var(--focus-ring-width)_solid_var(--medium-blue)] [&:has(input:focus-visible)]:[outline-offset:calc(var(--focus-ring-offset)_*_-1)] [&:active]:[transform:scale(var(--motion-scale-press))] [&_strong]:[font-family:var(--font-ui)] [&_strong]:[font-size:var(--font-size-data-kpi)] [&_strong]:[line-height:var(--leading-data)] [&_strong]:[letter-spacing:var(--tracking-heading)] [&_strong]:font-bold [&_strong]:[font-variant-numeric:tabular-nums] [@media((max-width:_800px))]:[min-height:150px] [@media((hover:_none)_and_(pointer:_coarse))]:[&:hover:not(:has(input:checked))]:[background:var(--white)] [@media((hover:_none)_and_(pointer:_coarse))]:[&:hover:not(:has(input:checked))]:[color:var(--black)] [@media((hover:_none)_and_(pointer:_coarse))]:[&:active:not(:has(input:checked))]:[background:color-mix(in_srgb,_var(--bright-blue)_24%,_var(--white))] [@media((hover:_none)_and_(pointer:_coarse))]:[&:active:not(:has(input:checked))]:[transform:scale(var(--motion-scale-press))] [@media((hover:_none)_and_(pointer:_coarse))]:[&:active]:[transform:scale(var(--motion-scale-press))]",
  "support-status":
    "support-status [margin:var(--space-5)_0_0] [padding:var(--space-4)] [border-left-width:4px] [background:var(--white)] [color:var(--black)] [font-size:var(--font-size-body-large)] [line-height:var(--leading-body)] [letter-spacing:var(--tracking-body)] font-normal",
} as const;
