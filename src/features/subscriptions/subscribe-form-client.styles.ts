export const appearance = {
  section: {
    inverse:
      "subscribe-section min-w-0 [align-self:start] [&_h2]:[margin:0] [&_h2]:[color:var(--white)] [&_h2]:[font-size:var(--font-size-compact-title)] [&_h2]:[line-height:var(--leading-compact-title)] [&_h2]:[letter-spacing:var(--tracking-heading)] [&_h2]:font-bold [&_h2]:[text-transform:none]",
    standard:
      "subscribe-section grid min-w-0 grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)] items-start gap-[72px] py-[var(--space-section)] text-black [&_h2]:m-0 [&_h2]:text-[length:var(--font-size-card-title)] [&_h2]:leading-[var(--leading-card-title)] [&_h2]:font-bold [&_h2]:tracking-[var(--tracking-heading)] max-[800px]:grid-cols-1 max-[800px]:gap-[var(--space-heading-content)]",
  },
  intro:
    "mt-[var(--space-related-content)] max-w-[390px] text-[length:var(--font-size-body)] leading-[var(--leading-body)]",
  "subscribe-form":
    "subscribe-form grid [grid-template-columns:minmax(0,_1fr)_auto] [align-items:start] [column-gap:var(--space-3)] [row-gap:var(--space-2)] [@media((max-width:_800px))]:[grid-template-columns:1fr]",
  preferences: {
    inverse:
      "subscribe-preferences [grid-column:1] [width:fit-content] [min-height:24px] [margin-top:var(--space-2)] [color:var(--white)] [font-size:var(--font-size-control)] [line-height:var(--leading-body)] font-bold [text-decoration:underline] [transition:color_var(--motion-duration-base)_var(--motion-ease-standard)] [&:hover]:[color:var(--bright-blue)] [&:focus-visible]:[color:var(--bright-blue)] [@media((max-width:_800px))]:[grid-column:auto]",
    standard:
      "subscribe-preferences col-start-1 mt-[var(--space-2)] min-h-[24px] w-fit text-[length:var(--font-size-control)] leading-[var(--leading-body)] font-bold text-black underline transition-colors duration-[var(--motion-duration-base)] hover:text-brand focus-visible:text-brand max-[800px]:col-auto",
  },
} as const;
