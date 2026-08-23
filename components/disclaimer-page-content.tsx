import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/i18n";

const copy = {
  en: {
    label: "Disclaimer", title: "Important information.",
    sections: [
      ["Not investment advice", "Nothing on this website constitutes investment, legal, tax, or financial advice. The material is provided for informational and educational purposes only."],
      ["Performance", "Past performance does not guarantee future results. Published portfolio and performance figures are based on the disclosed methodology, data, and assumptions; they may contain errors or limitations and should be independently verified."],
      ["Positions and conflicts", "I may hold positions in securities discussed on this website. Published views and holdings may change without notice, and relevant positions or potential conflicts will be disclosed where appropriate."],
    ],
  },
  "zh-tw": {
    label: "免責聲明", title: "重要資訊。",
    sections: [
      ["不構成投資建議", "本網站任何內容均不構成投資、法律、稅務或財務建議；所有資料僅供資訊與教育用途。"],
      ["績效", "過往績效不代表未來結果。已發布的投資組合與績效數據依據所揭露的方法、資料及假設計算，可能包含錯誤或限制，讀者應自行核實。"],
      ["持股與利益衝突", "本人可能持有本網站所討論的證券。已發布的觀點與持股可能隨時變更，恕不另行通知；相關部位或潛在利益衝突將在適當情況下揭露。"],
    ],
  },
  "zh-cn": {
    label: "免责声明", title: "重要信息。",
    sections: [
      ["不构成投资建议", "本网站任何内容均不构成投资、法律、税务或财务建议；所有资料仅供信息与教育用途。"],
      ["业绩", "过往业绩不代表未来结果。已发布的投资组合与业绩数据依据所披露的方法、资料及假设计算，可能包含错误或限制，读者应自行核实。"],
      ["持仓与利益冲突", "本人可能持有本网站所讨论的证券。已发布的观点与持仓可能随时变更，恕不另行通知；相关持仓或潜在利益冲突将在适当情况下披露。"],
    ],
  },
} as const;

export function DisclaimerPageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return <main id="main-content">
    <SiteHeader locale={locale} />
    <section className="legal shell">
      <header className="legal-header"><p className="eyebrow"><span /> {text.label}</p><h1>{text.title}</h1></header>
      <div className="legal-content">
        {text.sections.map(([title, description], index) => <article className="legal-section" key={title}>
          <span className="legal-section-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h2>{title}</h2><p>{description}</p>
        </article>)}
      </div>
    </section>
    <SiteFooter locale={locale} />
  </main>;
}
