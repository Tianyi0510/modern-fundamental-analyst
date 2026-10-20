export const appearance = {
  section: {
    inverse:
      "subscribe-section min-w-0 [align-self:start] [&_h2]:[margin:0] [&_h2]:[color:var(--white)] [&_h2]:text-medium-title [&_h2]:min-h-[var(--size-footer-heading)] [&_h2]:[text-transform:none]",
    standard:
      "subscribe-section grid min-w-0 grid-cols-[var(--grid-sidebar)] items-start gap-x-[var(--grid-column-gap)] gap-y-[var(--space-section-content)] py-[var(--space-section-padding)] text-ink [&_h2]:m-0 [&_h2]:text-large-title max-[800px]:grid-cols-1 max-[800px]:gap-[var(--space-heading-content)]",
  },
  intro: "mt-[var(--space-related-content)] max-w-[390px] text-small-body",
  "subscribe-form":
    "subscribe-form grid [grid-template-columns:minmax(0,_1fr)_auto] [align-items:start] [column-gap:var(--space-3)] [row-gap:var(--space-2)] [@media((max-width:_800px))]:[grid-template-columns:1fr]",
  preferences: {
    inverse:
      "subscribe-preferences [grid-column:1] [width:fit-content] [min-height:24px] [margin-top:var(--spacingVerticalXS)] [color:var(--white)] text-large-label [text-decoration:underline] [transition:color_var(--motion-duration-base)_var(--motion-ease-standard)] [&:hover]:[color:var(--blue-bright)] [&:focus-visible]:[color:var(--blue-bright)] [@media((max-width:_800px))]:[grid-column:auto]",
    standard:
      "subscribe-preferences col-start-1 mt-[var(--space-2)] min-h-[24px] w-fit text-large-label text-ink underline transition-colors duration-[var(--motion-duration-base)] hover:text-brand focus-visible:text-brand max-[800px]:col-auto",
  },
} as const;
