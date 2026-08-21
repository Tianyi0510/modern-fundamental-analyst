import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { annualReturnsZhTw, holdingsZhTw, memosZhTw } from "@/data/site-zh-tw";

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
            <Link className="button button-dark" href="/zh-tw/portfolio">查看投資組合 <span>↗</span></Link>
            <Link className="text-link" href="/zh-tw/memos">閱讀最新札記 →</Link>
          </div>
        </div>
      </section>

      <section className="metric-band shell" aria-label="投資組合摘要">
        <div className="metric metric-featured"><span>成立以來</span><strong>+18.6%</strong><small>示意數據</small></div>
        <div className="metric"><span>已投資</span><strong>64.2%</strong><small>6 個部位</small></div>
        <div className="metric metric-green"><span>現金</span><strong>35.8%</strong><small>截至 2026 年 6 月</small></div>
      </section>

      <section className="intro shell">
        <p className="section-number">01／投資組合</p>
        <h2>有意識地集中。<br />有紀律地等待。</h2>
        <Link className="round-link" href="/zh-tw/portfolio" aria-label="查看投資組合">↗</Link>
      </section>

      <section className="holdings-preview shell">
        <div className="holdings-list">
          {holdingsZhTw.slice(0, 4).map((holding, index) => (
            <div className="holding-row" key={holding.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{holding.name}</strong><small>{holding.thesis}</small></div>
              <b>{holding.weight.toFixed(1)}%</b>
            </div>
          ))}
        </div>
        <aside className="allocation-card">
          <span>投資配置</span>
          <div className="allocation-ring" aria-label="已投資百分之六十四點二"><b>64.2%</b><small>已投資</small></div>
          <Link href="/zh-tw/portfolio">完整投資組合 →</Link>
        </aside>
      </section>

      <section className="performance-home">
        <div className="shell">
          <div className="section-heading inverse"><p className="section-number">02／績效</p><h2>每一次決策，<br />累積成一份紀錄。</h2></div>
          <div className="performance-grid">
            <div className="performance-bars" aria-label="年度績效圖表">
              {annualReturnsZhTw.slice(1).map((item) => (
                <div className="year-bar" key={item.year}>
                  <div className="bar-value" style={{ height: `${Math.max(item.portfolio * 5, 36)}px` }}><span>{item.portfolio}%</span></div>
                  <small>{item.year}</small>
                </div>
              ))}
            </div>
            <div className="performance-copy"><strong>+18.6%</strong><p>成立以來累積報酬，基準同期為 +12.4%。</p><small>此為設計預覽用示意數據。</small><Link className="button button-white" href="/zh-tw/performance">查看績效 <span>↗</span></Link></div>
          </div>
        </div>
      </section>

      <section className="memos-home shell">
        <div className="section-heading"><p className="section-number">03／投資札記</p><h2>讓思考，<br />清楚可見。</h2></div>
        <div className="memo-grid">
          {memosZhTw.map((memo, index) => (
            <Link className={`memo-card memo-card-${index + 1}`} href={`/zh-tw/memos/${memo.slug}`} key={memo.slug}>
              <div><span>{memo.number}</span><span>{memo.tag}</span></div><h3>{memo.title}</h3><p>{memo.summary}</p><small>{memo.date} · {memo.readTime}</small>
            </Link>
          ))}
        </div>
        <Link className="text-link memos-all" href="/zh-tw/memos">查看所有札記 →</Link>
      </section>

      <section className="cta shell"><p className="eyebrow"><span /> 最新更新</p><h2>關注過程，<br />而不是雜訊。</h2><Link className="button button-dark" href="/zh-tw/contact">與我聯絡 <span>↗</span></Link></section>
      <SiteFooter locale="zh-tw" />
    </main>
  );
}
