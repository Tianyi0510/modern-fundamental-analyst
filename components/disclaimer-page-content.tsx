import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

type LegalSection = readonly [title: string, lead: string | null, paragraphs: readonly string[]];
type LegalCopy = { label: string; title: string; titleAccent: string | null; subtitle: string | null; sections: readonly LegalSection[] };

const copy = {
  en: {
    label: "Disclaimer",
    title: "Legal Disclaimer and Important",
    titleAccent: "Investment Risk Disclosures",
    subtitle: "Please read these terms carefully before relying on any research, financial information, valuation, or performance data published on this website.",
    sections: [
      ["No Investment Advice", "Research and Education, Not Personalized Financial Advice", [
        "All content published on Modern Fundamental Analyst, including investment memos, portfolio disclosures, performance data, financial models, valuation estimates, and commentary, is provided solely for general informational, educational, and research purposes. Nothing on this website constitutes investment, financial, legal, accounting, or tax advice, nor an offer, solicitation, recommendation, or endorsement to buy or sell any security or financial instrument. The content does not consider any reader’s objectives, financial circumstances, risk tolerance, or individual needs. Accessing this website, subscribing to updates, or contacting the author does not create an advisory, fiduciary, broker-client, or other professional relationship. Readers should conduct independent research and consult appropriately qualified professionals before making financial decisions.",
      ]],
      ["Investment Risks", "Investment Outcomes and Future Events Remain Uncertain", [
        "All investments involve risk, including the possible loss of principal. Past performance does not guarantee or predict future results. This website may contain forecasts, projections, price targets, intrinsic-value estimates, and other forward-looking statements based on information, assumptions, and judgments available as of the stated publication date. Actual outcomes may differ materially because of changes in company performance, competition, technology, regulation, economic conditions, financial markets, interest rates, foreign-exchange rates, or other factors. Financial models, including three-statement and discounted cash flow models, are analytical tools rather than guarantees of value or return. The author may hold or transact in securities discussed, and portfolio positions are generally disclosed monthly rather than in real time. The author undertakes no obligation to revise or update any forward-looking statement except where expressly stated.",
      ]],
      ["Limitation of Liability", "Content Provided Without Warranties or Guaranteed Results", [
        "All content is provided on an “as is” and “as available” basis. Although reasonable efforts are made to use information believed to be reliable, no representation or warranty is made regarding its accuracy, completeness, timeliness, suitability, or continued availability. External links and third-party materials are provided for convenience only and do not constitute endorsement or independent verification. To the fullest extent permitted by applicable law, Modern Fundamental Analyst and its author disclaim liability for any loss arising from access to, use of, or reliance upon this website, including investment losses, lost profits, lost opportunities, and indirect, incidental, special, or consequential damages. Nothing in this disclaimer excludes or limits any liability or legal right that cannot lawfully be excluded or limited.",
      ]],
    ],
  },
  "zh-tw": {
    label: "免責聲明", title: "重要資訊。", titleAccent: null, subtitle: null,
    sections: [
      ["不構成投資建議", null, ["本網站任何內容均不構成投資、法律、稅務或財務建議；所有資料僅供資訊與教育用途。"]],
      ["績效", null, ["過往績效不代表未來結果。已發布的投資組合與績效數據依據所揭露的方法、資料及假設計算，可能包含錯誤或限制，讀者應自行核實。"]],
      ["持股與利益衝突", null, ["本人可能持有本網站所討論的證券。已發布的觀點與持股可能隨時變更，恕不另行通知；相關部位或潛在利益衝突將在適當情況下揭露。"]],
    ],
  },
  "zh-cn": {
    label: "免责声明", title: "重要信息。", titleAccent: null, subtitle: null,
    sections: [
      ["不构成投资建议", null, ["本网站任何内容均不构成投资、法律、税务或财务建议；所有资料仅供信息与教育用途。"]],
      ["业绩", null, ["过往业绩不代表未来结果。已发布的投资组合与业绩数据依据所披露的方法、资料及假设计算，可能包含错误或限制，读者应自行核实。"]],
      ["持仓与利益冲突", null, ["本人可能持有本网站所讨论的证券。已发布的观点与持仓可能随时变更，恕不另行通知；相关持仓或潜在利益冲突将在适当情况下披露。"]],
    ],
  },
} as const satisfies Record<Locale, LegalCopy>;

export function DisclaimerPageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return <main className="legal" id="main-content">
    <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
    <section className="legal-hero">
      <header className="legal-header shell">
        <p className="eyebrow"><span /> {text.label}</p>
        <h1>{text.title}{text.titleAccent ? <><br /><em>{text.titleAccent}</em></> : null}</h1>
        {text.subtitle ? <p className="legal-subtitle">{text.subtitle}</p> : null}
      </header>
    </section>
    <section className="legal-body">
      <div className="legal-content shell">
        {text.sections.map(([title, lead, paragraphs], index) => <article className="legal-section" key={title}>
          <div className="legal-section-heading">
            <p className="section-number legal-section-label">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span aria-hidden="true">·</span>
              <span>{title}</span>
            </p>
            {lead ? <h2>{lead}</h2> : null}
          </div>
          <div className="legal-section-copy">
            {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </article>)}
      </div>
    </section>
    <SiteFooter locale={locale} />
  </main>;
}
