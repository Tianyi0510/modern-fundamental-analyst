import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memosZhTw } from "@/data/site-zh-tw";
import { getHoldingWeight, portfolioHoldings, portfolioSnapshot } from "@/data/portfolio";
import { formatPortfolioDate, formatUsd } from "@/lib/format";

const featuredHoldings = portfolioHoldings.toSorted((a, b) => b.marketValue - a.marketValue).slice(0, 4);
const portfolioDate = formatPortfolioDate(portfolioSnapshot.asOf, "zh-tw");

export default function TraditionalChineseHome() {
  return (
    <main className="home-page">
      <SiteHeader locale="zh-tw" counterpartPath="/" />

      <section className="hero shell">
        <p className="eyebrow"><span /> Tianyi（David）Li · 獨立公開市場股票研究</p>
        <h1>為顛覆性未來，<br /><em>實踐集中投資。</em></h1>
        <div className="hero-bottom">
          <p>透過長期價值研究、財務建模與完整揭露的投資組合，幫助每一位個人投資者建立獨立判斷。</p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/zh-tw/portfolio">查看投資組合 <span className="arrow-icon" aria-hidden="true">↗︎</span></Link>
            <Link className="text-link" href="/zh-tw/memos">閱讀最新投資備忘錄 →</Link>
          </div>
        </div>
      </section>

      <section className="metric-band shell" aria-label="投資組合摘要">
        <div className="metric metric-featured"><span>累積報酬</span><strong>+{portfolioSnapshot.totalReturn.toFixed(2)}%</strong><small>成本基礎累積報酬</small></div>
        <div className="metric"><span>市場價值</span><strong>{formatUsd(portfolioSnapshot.marketValue, 0)}</strong><small>{portfolioSnapshot.holdingsCount} 檔股票與 ETF</small></div>
        <div className="metric metric-green"><span>投資組合 XIRR</span><strong>+{portfolioSnapshot.xirr.toFixed(2)}%</strong><small>截至 {portfolioDate} · 每月更新</small></div>
      </section>

      <section className="home-about shell">
        <div><p className="section-number">01 關於</p><h2>我的投資信念與<br />持續學習的承諾</h2></div>
        <div><p>我相信集中投資、長期價值投資，以及即將到來的人工智慧與其他顛覆性科技浪潮。我重視會計作為商業語言的角色，並運用財務建模連結企業基本面與估值。我也提倡以好奇心、同理心與持續學習為基礎的「learn-it-all」成長思維。</p><Link className="text-link" href="/zh-tw/about">了解投資過程 →</Link></div>
      </section>

      <section className="intro shell">
        <p className="section-number">02 投資組合</p>
        <h2>為長期持有而建立的<br />集中投資組合</h2>
        <Link className="round-link" href="/zh-tw/portfolio" aria-label="查看投資組合"><span className="arrow-icon" aria-hidden="true">↗︎</span></Link>
      </section>

      <section className="holdings-preview shell">
        <div className="holdings-list">
          {featuredHoldings.map((holding, index) => (
            <div className="holding-row" key={holding.symbol}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{holding.symbol}</strong><small>{formatUsd(holding.marketValue, 0)} 市場價值</small></div>
              <b>{getHoldingWeight(holding.marketValue).toFixed(1)}%</b>
            </div>
          ))}
        </div>
        <aside className="allocation-card">
          <span>投資組合報酬</span>
          <div className="allocation-ring" aria-label={`累積報酬百分之 ${portfolioSnapshot.totalReturn.toFixed(1)}`}><b>{portfolioSnapshot.totalReturn.toFixed(1)}%</b><small>累積報酬</small></div>
          <Link href="/zh-tw/portfolio">完整投資組合 →</Link>
        </aside>
      </section>

      <section className="performance-home">
        <div className="shell">
          <div className="section-heading inverse"><p className="section-number">03 績效</p><h2>每月完整透明揭露<br />投資結果</h2></div>
          <div className="performance-grid">
            <div className="performance-bars" aria-label="XIRR 比較圖表">
              <div className="year-bar"><div className="bar-value" style={{ height: `${portfolioSnapshot.xirr * 8}px` }}><span>{portfolioSnapshot.xirr}%</span></div><small>投資組合</small></div>
              <div className="year-bar"><div className="bar-value" style={{ height: `${portfolioSnapshot.benchmarkXirr * 8}px` }}><span>{portfolioSnapshot.benchmarkXirr}%</span></div><small>{portfolioSnapshot.benchmark}</small></div>
            </div>
            <div className="performance-copy"><strong>+{portfolioSnapshot.xirr.toFixed(2)}%</strong><p>投資組合 XIRR；相同現金流期間的 {portfolioSnapshot.benchmark} 為 +{portfolioSnapshot.benchmarkXirr.toFixed(2)}%。</p><small>截至 {portfolioDate} 的已驗證快照 · 每月更新。</small><Link className="button button-white" href="/zh-tw/performance">查看績效 <span className="arrow-icon" aria-hidden="true">↗︎</span></Link></div>
          </div>
        </div>
      </section>

      <section className="memos-home shell">
        <div className="section-heading"><p className="section-number">04 投資備忘錄</p><h2>每個部位背後的<br />詳細投資論點</h2></div>
        <div className="memo-grid">
          {memosZhTw.map((memo, index) => (
            <Link className={`memo-card memo-card-${index + 1}`} href={`/zh-tw/memos/${memo.slug}`} key={memo.slug}>
              <div><span>{memo.number}</span><span>{memo.tag}</span></div><h3>{memo.title}</h3><p>{memo.summary}</p><small>{memo.date} · {memo.readTime}</small>
            </Link>
          ))}
        </div>
        <Link className="text-link memos-all" href="/zh-tw/memos">查看所有投資備忘錄 →</Link>
      </section>

      <section className="cta shell"><p className="eyebrow"><span /> 05 聯絡</p><h2>持續掌握我的<br />最新研究</h2><Link className="button button-dark" href="/zh-tw/contact">與我聯絡 <span className="arrow-icon" aria-hidden="true">↗︎</span></Link></section>
      <SiteFooter locale="zh-tw" />
    </main>
  );
}
