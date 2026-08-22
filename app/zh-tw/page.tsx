import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memosZhTw } from "@/data/site-zh-tw";
import { getHoldingWeight, portfolioHoldings, portfolioSnapshot } from "@/data/portfolio";

const featuredHoldings = portfolioHoldings.toSorted((a, b) => b.marketValue - a.marketValue).slice(0, 4);
const formatUsd = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function TraditionalChineseHome() {
  return (
    <main>
      <SiteHeader locale="zh-tw" counterpartPath="/" />

      <section className="hero shell">
        <p className="eyebrow"><span /> 獨立公開市場股票研究</p>
        <h1>觀點會複利。<br /><em>資本隨之成長。</em></h1>
        <div className="hero-bottom">
          <p>透明呈現集中投資、長期績效，以及每項決策背後的思考。</p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/zh-tw/portfolio">查看投資組合 <span className="arrow-icon" aria-hidden="true">↗︎</span></Link>
            <Link className="text-link" href="/zh-tw/memos">閱讀最新投資備忘錄 →</Link>
          </div>
        </div>
      </section>

      <section className="metric-band shell" aria-label="投資組合摘要">
        <div className="metric metric-featured"><span>累積報酬</span><strong>+{portfolioSnapshot.totalReturn.toFixed(2)}%</strong><small>成本基礎累積報酬</small></div>
        <div className="metric"><span>市場價值</span><strong>{formatUsd(portfolioSnapshot.marketValue)}</strong><small>{portfolioSnapshot.holdingsCount} 檔股票與 ETF</small></div>
        <div className="metric metric-green"><span>投資組合 XIRR</span><strong>+{portfolioSnapshot.xirr.toFixed(2)}%</strong><small>截至 2026 年 7 月 31 日 · 每月更新</small></div>
      </section>

      <section className="intro shell">
        <p className="section-number">01／投資組合</p>
        <h2>有意識地集中。<br />有紀律地等待。</h2>
        <Link className="round-link" href="/zh-tw/portfolio" aria-label="查看投資組合"><span className="arrow-icon" aria-hidden="true">↗︎</span></Link>
      </section>

      <section className="holdings-preview shell">
        <div className="holdings-list">
          {featuredHoldings.map((holding, index) => (
            <div className="holding-row" key={holding.symbol}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{holding.symbol}</strong><small>{formatUsd(holding.marketValue)} 市場價值</small></div>
              <b>{getHoldingWeight(holding.marketValue).toFixed(1)}%</b>
            </div>
          ))}
        </div>
        <aside className="allocation-card">
          <span>投資組合報酬</span>
          <div className="allocation-ring" aria-label="累積報酬百分之二十二"><b>22.0%</b><small>累積報酬</small></div>
          <Link href="/zh-tw/portfolio">完整投資組合 →</Link>
        </aside>
      </section>

      <section className="performance-home">
        <div className="shell">
          <div className="section-heading inverse"><p className="section-number">02／績效</p><h2>每一次決策，<br />累積成一份紀錄。</h2></div>
          <div className="performance-grid">
            <div className="performance-bars" aria-label="XIRR 比較圖表">
              <div className="year-bar"><div className="bar-value" style={{ height: `${portfolioSnapshot.xirr * 8}px` }}><span>{portfolioSnapshot.xirr}%</span></div><small>投資組合</small></div>
              <div className="year-bar"><div className="bar-value" style={{ height: `${portfolioSnapshot.benchmarkXirr * 8}px` }}><span>{portfolioSnapshot.benchmarkXirr}%</span></div><small>{portfolioSnapshot.benchmark}</small></div>
            </div>
            <div className="performance-copy"><strong>+{portfolioSnapshot.xirr.toFixed(2)}%</strong><p>投資組合 XIRR；相同現金流期間的 {portfolioSnapshot.benchmark} 為 +{portfolioSnapshot.benchmarkXirr.toFixed(2)}%。</p><small>截至 2026 年 7 月 31 日的已驗證快照 · 每月更新。</small><Link className="button button-white" href="/zh-tw/performance">查看績效 <span className="arrow-icon" aria-hidden="true">↗︎</span></Link></div>
          </div>
        </div>
      </section>

      <section className="memos-home shell">
        <div className="section-heading"><p className="section-number">03／投資備忘錄</p><h2>讓思考，<br />清楚可見。</h2></div>
        <div className="memo-grid">
          {memosZhTw.map((memo, index) => (
            <Link className={`memo-card memo-card-${index + 1}`} href={`/zh-tw/memos/${memo.slug}`} key={memo.slug}>
              <div><span>{memo.number}</span><span>{memo.tag}</span></div><h3>{memo.title}</h3><p>{memo.summary}</p><small>{memo.date} · {memo.readTime}</small>
            </Link>
          ))}
        </div>
        <Link className="text-link memos-all" href="/zh-tw/memos">查看所有投資備忘錄 →</Link>
      </section>

      <section className="cta shell"><p className="eyebrow"><span /> 最新更新</p><h2>關注過程，<br />而不是雜訊。</h2><Link className="button button-dark" href="/zh-tw/contact">與我聯絡 <span className="arrow-icon" aria-hidden="true">↗︎</span></Link></section>
      <SiteFooter locale="zh-tw" />
    </main>
  );
}
