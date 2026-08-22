import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "免责声明", description: "关于本网站研究与业绩数据的重要说明。", path: "/disclaimer", locale: "zh-cn" });

export default function DisclaimerPageZhCn() {
  return (
    <main>
      <SiteHeader locale="zh-cn" />
      <section className="legal shell">
        <header className="legal-header">
          <p className="eyebrow"><span /> 免责声明</p>
          <h1>重要信息。</h1>
        </header>
        <div className="legal-content">
          <article className="legal-section"><span className="legal-section-number" aria-hidden="true">01</span><h2>不构成投资建议</h2><p>本网站任何内容均不构成投资、法律、税务或财务建议；所有资料仅供信息与教育用途。</p></article>
          <article className="legal-section"><span className="legal-section-number" aria-hidden="true">02</span><h2>业绩</h2><p>过往业绩不代表未来结果。已发布的投资组合与业绩数据依据所披露的方法、资料及假设计算，可能包含错误或限制，读者应自行核实。</p></article>
          <article className="legal-section"><span className="legal-section-number" aria-hidden="true">03</span><h2>持仓与利益冲突</h2><p>本人可能持有本网站所讨论的证券。已发布的观点与持仓可能随时变更，恕不另行通知；相关持仓或潜在利益冲突将在适当情况下披露。</p></article>
        </div>
      </section>
      <SiteFooter locale="zh-cn" />
    </main>
  );
}
