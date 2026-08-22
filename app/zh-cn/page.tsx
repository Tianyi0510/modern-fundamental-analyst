import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memosZhCn } from "@/data/site-zh-cn";
import { getHoldingWeight, portfolioHoldings, portfolioSnapshot } from "@/data/portfolio";
import { formatDate, formatPercent, formatUsd } from "@/lib/format";

const featuredHoldings = portfolioHoldings.toSorted((a, b) => b.marketValue - a.marketValue).slice(0, 4);
const portfolioDate = formatDate(portfolioSnapshot.asOf, "zh-cn");

export default function SimplifiedChineseHome() {
  return (
    <main className="home-page">
      <SiteHeader locale="zh-cn" />

      <section className="hero shell">
        <p className="eyebrow"><span /> Tianyi（David）Li · 独立公开市场股票研究</p>
        <h1>为颠覆性未来，<br /><em>实践集中投资。</em></h1>
        <div className="hero-bottom">
          <p>通过长期价值研究、财务建模与完整披露的投资组合，帮助每一位个人投资者建立独立判断。</p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/zh-cn/portfolio">查看投资组合 <span className="arrow-icon" aria-hidden="true">↗︎</span></Link>
            <Link className="text-link" href="/zh-cn/memos">阅读最新投资备忘录 →</Link>
          </div>
        </div>
      </section>

      <section className="metric-band shell" aria-label="投资组合摘要">
        <div className="metric metric-featured"><span>累计回报</span><strong>{formatPercent(portfolioSnapshot.totalReturn)}</strong><small>成本基础累计回报</small></div>
        <div className="metric"><span>市场价值</span><strong>{formatUsd(portfolioSnapshot.marketValue, 0)}</strong><small>{portfolioSnapshot.holdingsCount} 只股票与 ETF</small></div>
        <div className="metric metric-accent"><span>投资组合 XIRR</span><strong>{formatPercent(portfolioSnapshot.xirr)}</strong><small className="date-text">截至 {portfolioDate} · 每月更新</small></div>
      </section>

      <section className="home-about shell">
        <div><p className="section-number">01 关于</p><h2>我的投资信念与<br />持续学习的承诺</h2></div>
        <div><p>我相信集中投资、长期价值投资，以及即将到来的人工智能与其他颠覆性科技浪潮。我重视会计作为商业语言的作用，并运用财务建模连接企业基本面与估值。我也倡导以好奇心、同理心与持续学习为基础的“learn-it-all”成长思维。</p><Link className="text-link" href="/zh-cn/about">了解投资过程 →</Link></div>
      </section>

      <section className="intro shell">
        <p className="section-number">02 投资组合</p>
        <h2>为长期持有而建立的<br />集中投资组合</h2>
        <Link className="round-link" href="/zh-cn/portfolio" aria-label="查看投资组合"><span className="arrow-icon" aria-hidden="true">↗︎</span></Link>
      </section>

      <section className="holdings-preview shell">
        <div className="holdings-list">
          {featuredHoldings.map((holding, index) => (
            <div className="holding-row" key={holding.symbol}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{holding.symbol}</strong><small>{formatUsd(holding.marketValue, 0)} 市场价值</small></div>
              <b>{getHoldingWeight(holding.marketValue).toFixed(1)}%</b>
            </div>
          ))}
        </div>
        <aside className="allocation-card">
          <span>投资组合回报</span>
          <div className="allocation-ring" aria-label={`累计回报百分之 ${portfolioSnapshot.totalReturn.toFixed(1)}`}><b>{formatPercent(portfolioSnapshot.totalReturn, 1)}</b><small>累计回报</small></div>
          <Link href="/zh-cn/portfolio">完整投资组合 →</Link>
        </aside>
      </section>

      <section className="performance-home">
        <div className="shell">
          <div className="section-heading inverse"><p className="section-number">03 业绩</p><h2>每月完整透明披露<br />投资结果</h2></div>
          <div className="performance-grid">
            <div className="performance-bars" aria-label="XIRR 比较图表">
              <div className="year-bar"><div className="bar-value" style={{ height: `${portfolioSnapshot.xirr * 8}px` }}><span>{formatPercent(portfolioSnapshot.xirr)}</span></div><small>投资组合</small></div>
              <div className="year-bar"><div className="bar-value" style={{ height: `${portfolioSnapshot.benchmarkXirr * 8}px` }}><span>{formatPercent(portfolioSnapshot.benchmarkXirr)}</span></div><small>{portfolioSnapshot.benchmark}</small></div>
            </div>
            <div className="performance-copy"><strong>{formatPercent(portfolioSnapshot.xirr)}</strong><p>投资组合 XIRR；相同现金流期间的 {portfolioSnapshot.benchmark} 为 {formatPercent(portfolioSnapshot.benchmarkXirr)}。</p><small className="date-text">截至 {portfolioDate} 的已验证快照 · 每月更新。</small><Link className="button button-white" href="/zh-cn/performance">查看业绩 <span className="arrow-icon" aria-hidden="true">↗︎</span></Link></div>
          </div>
        </div>
      </section>

      <section className="memos-home shell">
        <div className="section-heading"><p className="section-number">04 投资备忘录</p><h2>每个持仓背后的<br />详细投资论点</h2></div>
        <div className="memo-grid">
          {memosZhCn.slice(0, 3).map((memo, index) => (
            <Link className={`memo-card memo-card-${index + 1}`} href={`/zh-cn/memos/${memo.slug}`} key={memo.slug}>
              <div><span>{memo.number}</span><span>{memo.tag}</span></div><h3>{memo.title}</h3><p>{memo.summary}</p><small className="date-text">{formatDate(memo.publishedAt, "zh-cn")} · {memo.readTime}</small>
            </Link>
          ))}
        </div>
        <Link className="text-link memos-all" href="/zh-cn/memos">查看所有投资备忘录 →</Link>
      </section>

      <section className="cta shell"><p className="eyebrow"><span /> 05 联系</p><h2>持续关注我的<br />最新研究</h2><Link className="button button-dark" href="/zh-cn/contact">与我联系 <span className="arrow-icon" aria-hidden="true">↗︎</span></Link></section>
      <SiteFooter locale="zh-cn" />
    </main>
  );
}
