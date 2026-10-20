export const appearance = {
  "article-body":
    "article-body typeset typeset-memo [--memo-conclusion-space-before:58px] [--memo-conclusion-space-after:60px] [width:min(var(--width-article),_100%)] [margin-inline:0] [@media((max-width:_800px))]:[--memo-conclusion-space-before:49px] [@media((max-width:_800px))]:[--memo-conclusion-space-after:50px] compact:wrap-anywhere",

  "memo-section":
    "memo-section [.memo-section_+_&]:[margin-top:var(--space-section)] [.memo-section_+_&]:[padding-top:var(--space-section-compact)] [.memo-section_+_&]:[border-top:1px_solid_var(--border-strong)] [@media((max-width:_800px))]:[.memo-section_+_&]:[margin-top:var(--space-section)] [@media((max-width:_800px))]:[.memo-section_+_&]:[padding-top:var(--space-section-compact)]",
  "memo-subsection":
    "memo-subsection [margin-top:var(--space-heading-content)] [.memo-section:has(+_.memo-references)_>_&:last-child]:[margin-top:var(--memo-conclusion-space-before)]",
  "memo-references":
    "memo-references [margin-top:var(--memo-conclusion-space-after)] [padding:var(--space-section-compact)_48px] [background:var(--surface-secondary)] [&_ol]:[margin:0] [&_ol]:[padding-left:22px] [&_li_+_li]:[margin-top:14px] [@media((max-width:_800px))]:[padding-top:var(--space-section-compact)] [@media((max-width:_800px))]:[padding-inline:var(--space-5)]",
} as const;
