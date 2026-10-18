export const appearance = {
  "memo-grid": "memo-grid rounded-control shadow-[var(--shadow-surface)]",
  "memo-card":
    "memo-card min-w-0 rounded-control wrap-anywhere min-[801px]:max-[1100px]:last:col-span-2  overflow-hidden flex flex-col [transform-origin:center] [transition:transform_var(--motion-duration-base)_var(--motion-ease-standard),_background-color_var(--motion-duration-base)_var(--motion-ease-standard)] [background:var(--surface-primary)] [color:var(--text-primary)] [&:hover]:[background:var(--memo-card-hover-surface)] [&:hover]:[transform:scale(var(--motion-scale-press))] [&:focus-visible]:[background:var(--memo-card-hover-surface)] [&:focus-visible]:[transform:scale(var(--motion-scale-press))] [&:active]:[background:var(--memo-card-pressed-surface)] [&:active]:[transform:scale(var(--motion-scale-press))]  [@media((hover:_none)_and_(pointer:_coarse))]:[&:hover:not(:active):not(:focus-visible)]:[background:var(--surface-primary)] [@media((hover:_none)_and_(pointer:_coarse))]:[&:hover:not(:active):not(:focus-visible)]:[transform:none] [@media((hover:_none)_and_(pointer:_coarse))]:[&:hover:not(:active):not(:focus-visible)]:[box-shadow:none] [@media((hover:_none)_and_(pointer:_coarse))]:[&:not(.memo-card-placeholder):active]:[background:var(--memo-card-touch-pressed-surface)] [@media((hover:_none)_and_(pointer:_coarse))]:[&:not(.memo-card-placeholder):active]:[transform:scale(var(--motion-scale-press))]",
  "memo-card-placeholder":
    "memo-card-placeholder [cursor:default] [&:hover]:[background:var(--surface-primary)] [&:hover]:[transform:none] [&:focus-visible]:[background:var(--surface-primary)] [&:focus-visible]:[transform:none] [&:active]:[background:var(--surface-primary)] [&:active]:[transform:none] [@media((max-width:_800px))]:hidden",
  body: "min-h-full flex-1 gap-0 border-0 bg-transparent p-0 text-inherit ring-0 [--card-spacing:var(--space-section-content)]",
  header: "flex items-center justify-between gap-5 pt-[var(--card-spacing)] text-large-label",
  content: " pt-[var(--space-8)] pb-[var(--space-6)]",
  title: "mb-[var(--space-5)] text-large-title text-balance",
  description: "text-small-body text-[var(--text-secondary)]",
  footer:
    "mt-auto mx-[var(--card-spacing)] border-[var(--border-subtle)] bg-transparent px-0 pt-[var(--space-4)] pb-[var(--card-spacing)] text-small-body",
  "date-text":
    "date-text [.performance-page_.page-intro_&]:[margin-left:auto] [.performance-page_.page-intro_&]:[max-width:100%] [font-family:var(--font-ui)] [font-variant-numeric:tabular-nums] [@media((max-width:_800px))]:[.performance-page_.page-intro_&]:[margin-left:0]",
} as const;
