export const appearance = {
  section: {
    inverse:
      "subscribe-section grid gap-[var(--space-form-row-gap)] min-w-0 [align-self:start] [&_h2]:[margin:0] [&_h2]:[color:var(--text-inverse)] [&_h2]:text-title-small [&_h2]:[text-transform:none]",
    standard:
      "subscribe-section grid min-w-0 grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)] items-start gap-[var(--space-900)] py-[var(--space-section)] text-ink [&_h2]:m-0 [&_h2]:text-title max-[800px]:grid-cols-1 max-[800px]:gap-[var(--space-heading-content)]",
  },
  intro: "m-0 max-w-[390px] text-body",
  "subscribe-form":
    "subscribe-form grid [grid-template-columns:minmax(0,_1fr)_auto] [align-items:start] [column-gap:var(--space-150)] [row-gap:var(--space-100)] [@media((max-width:_800px))]:[grid-template-columns:1fr]",
  preferences: {
    inverse:
      "subscribe-preferences [grid-column:1] [width:fit-content] [min-height:24px] [margin-top:var(--space-100)] [color:var(--text-inverse)] text-control [text-decoration:underline] [transition:color_var(--motion-effects-default-duration)_var(--motion-effects-default-easing)] [&:hover]:[color:var(--text-highlight)] [&:focus-visible]:[color:var(--text-highlight)] [@media((max-width:_800px))]:[grid-column:auto]",
    standard:
      "subscribe-preferences col-start-1 mt-[var(--space-100)] min-h-[24px] w-fit text-control text-ink underline transition-colors duration-[var(--motion-effects-default-duration)] ease-[var(--motion-effects-default-easing)] hover:text-brand focus-visible:text-brand max-[800px]:col-auto",
  },
} as const;
