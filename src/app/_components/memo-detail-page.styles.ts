import { containerAppearance } from "@/components/container";

export const appearance = {
  "memo-article":
    "memo-article [padding:0_0_var(--space-section)] [&_h1]:[max-width:1120px] [&_h1]:[margin:50px_0_46px] [&_h1]:[font-size:var(--font-size-page-title)] [&_h1]:[line-height:var(--leading-page-title)] [&_h1]:[letter-spacing:var(--tracking-heading)] [&_h1]:font-bold [&_h1]:[text-transform:none] [&_h1]:[text-wrap:balance] [@media((max-width:_800px))]:[&_h1]:[overflow-wrap:anywhere] [@media((max-width:_800px))]:[&_h1]:[letter-spacing:var(--tracking-heading)]",
  "memo-article-header-band": "memo-article-header-band [background:var(--background-gray)]",
  "memo-article-header": "memo-article-header [padding-top:var(--space-section)]",
  shell: containerAppearance,
  eyebrow:
    "eyebrow [margin:0] flex items-center [gap:10px] [font-family:var(--font-ui)] [font-size:var(--font-size-label)] [line-height:var(--leading-body)] font-bold [letter-spacing:var(--tracking-label)] [text-transform:none] [&_span]:[width:9px] [&_span]:[height:9px] [&_span]:rounded-full [&_span]:[color:var(--interactive-accent)] [&_span]:[background:var(--interactive-accent)] [.cta_&]:[grid-column:1_/_-1] [.cta_&]:[margin:0_0_46px] [.about-closing_>_&]:[grid-column:1_/_-1] [@media((max-width:_800px))]:[.cta_&]:[margin-bottom:0]",
  "article-meta":
    "article-meta flex items-center [flex-wrap:wrap] [gap:28px] [padding:18px_0] [border-top:1px_solid_var(--black)] [border-bottom:1px_solid_var(--gray)] [font-size:var(--font-size-caption)] [line-height:var(--leading-body)] [letter-spacing:var(--tracking-body)] font-normal [font-family:var(--font-ui)] [font-variant-numeric:tabular-nums]",
  "article-lead":
    "article-lead [max-width:900px] [margin:var(--space-section)_0] [font-size:var(--font-size-lead)] [line-height:var(--leading-body)] [letter-spacing:var(--tracking-body)] font-normal [text-transform:none] [text-wrap:pretty]",
} as const;
