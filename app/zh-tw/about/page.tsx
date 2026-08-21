import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: { absolute: "關於｜Modern Fundamental Analyst" }, description: "Modern Fundamental Analyst 獨立投資研究背後的觀點與原則。" };

export default function AboutPageZhTw() {
  return <main><SiteHeader locale="zh-tw" counterpartPath="/about" />
    <section className="page-hero shell"><p className="eyebrow"><span /> 關於</p><h1>獨立思考。<br /><em>長期視角。</em></h1></section>
    <section className="two-column shell body-section">
      <h2>研究先於觀點。</h2>
      <div className="rich-copy"><p>Modern Fundamental Analyst 是一個獨立的公開市場股票研究平台，專注於容易理解的企業、持久的經濟特性，以及有紀律的資本配置。</p><p>本網站透明記錄投資組合、績效與書面研究，並呈現結論如何隨新證據出現而演變。</p></div>
    </section>
    <section className="principles shell">
      <article><span>01</span><h3>清晰</h3><p>以簡潔易懂的語言說明企業與投資論點。</p></article>
      <article><span>02</span><h3>耐心</h3><p>讓營運進展，而非市場雜訊，決定投資節奏。</p></article>
      <article><span>03</span><h3>問責</h3><p>持續記錄決策、假設與最終結果。</p></article>
    </section><SiteFooter locale="zh-tw" /></main>;
}
