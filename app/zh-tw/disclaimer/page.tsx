import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "免責聲明", description: "關於本網站研究與績效資料的重要說明。", path: "/disclaimer", locale: "zh-tw" });

export default function DisclaimerPageZhTw() {
  return (
    <main>
      <SiteHeader locale="zh-tw" />
      <section className="legal shell">
        <header className="legal-header">
          <p className="eyebrow"><span /> 免責聲明</p>
          <h1>重要資訊。</h1>
        </header>
        <div className="legal-content">
          <article className="legal-section"><span className="legal-section-number" aria-hidden="true">01</span><h2>不構成投資建議</h2><p>本網站任何內容均不構成投資、法律、稅務或財務建議；所有資料僅供資訊與教育用途。</p></article>
          <article className="legal-section"><span className="legal-section-number" aria-hidden="true">02</span><h2>績效</h2><p>過往績效不代表未來結果。已發布的投資組合與績效數據依據所揭露的方法、資料及假設計算，可能包含錯誤或限制，讀者應自行核實。</p></article>
          <article className="legal-section"><span className="legal-section-number" aria-hidden="true">03</span><h2>持股與利益衝突</h2><p>本人可能持有本網站所討論的證券。已發布的觀點與持股可能隨時變更，恕不另行通知；相關部位或潛在利益衝突將在適當情況下揭露。</p></article>
        </div>
      </section>
      <SiteFooter locale="zh-tw" />
    </main>
  );
}
