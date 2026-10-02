export const appearance = {
  "subscribe-section":
    "subscribe-section min-w-0 [align-self:start] [&_h2]:[margin:0] [&_h2]:[color:var(--white)] [&_h2]:[font-size:var(--font-size-compact-title)] [&_h2]:[line-height:var(--leading-compact-title)] [&_h2]:[letter-spacing:var(--tracking-heading)] [&_h2]:font-bold [&_h2]:[text-transform:none]",
  "subscribe-form":
    "subscribe-form grid [grid-template-columns:minmax(0,_1fr)_auto] [align-items:start] [column-gap:var(--space-3)] [row-gap:var(--space-2)] [margin-top:var(--space-5)] [@media((max-width:_800px))]:[grid-template-columns:1fr]",
  "subscribe-preferences":
    "subscribe-preferences [grid-column:1] [width:fit-content] [min-height:24px] [margin-top:var(--space-2)] [color:var(--white)] [font-size:var(--font-size-control)] [line-height:var(--leading-body)] font-bold [text-decoration:underline] [transition:color_var(--motion-duration-base)_var(--motion-ease-standard)] [&:hover]:[color:var(--bright-blue)] [&:focus-visible]:[color:var(--bright-blue)] [@media((max-width:_800px))]:[grid-column:auto]",
} as const;
