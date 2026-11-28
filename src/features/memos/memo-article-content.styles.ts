export const appearance = {
  "article-body": "article-body typeset typeset-memo [margin-inline:0] compact:wrap-anywhere",

  "memo-section":
    "memo-section [.memo-section_+_&]:[margin-top:var(--space-section)] [.memo-section_+_&]:[padding-top:var(--space-section-padding)] [.memo-section_+_&]:[border-top:1px_solid_var(--border-strong)] [@media((max-width:_800px))]:[.memo-section_+_&]:[margin-top:var(--space-section)] [@media((max-width:_800px))]:[.memo-section_+_&]:[padding-top:var(--space-section-padding)]",
  "memo-subsection": "memo-subsection [margin-top:var(--space-heading-content)]",
  "memo-references":
    "memo-references [margin-top:var(--space-section-content)] py-[var(--space-section-padding)] bg-[var(--surface-secondary)] px-[var(--space-48px)] compact:px-[var(--space-24px)] [&_ol]:[margin:0] [&_ol]:[padding-left:var(--space-24px)] [&_li_+_li]:[margin-top:var(--space-paragraph)]",
} as const;
