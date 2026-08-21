import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { holdingsZhTw } from "@/data/site-zh-tw";

export const metadata: Metadata = { title: { absolute: "投資組合｜Modern Fundamental Analyst" }, description: "目前投資組合配置與各部位的投資角色。" };

export default function PortfolioPageZhTw() {
  return <main><SiteHeader locale="zh-tw" counterpartPath="/portfolio" />
    <section className="page-hero shell"><p className="eyebrow"><span /> 投資組合 · 示例數據</p><h1>集中。<br /><em>有意識。</em></h1><div className="page-intro"><p>呈現目前曝險、各部位在組合中的角色，以及為未來機會保留的流動性。</p><small>截至 2026 年 6 月 30 日</small></div></section>
    <section className="portfolio-total shell"><div><span>已投資</span><strong>64.2%</strong></div><div className="stacked-bar">{holdingsZhTw.map((holding) => <i className={`segment segment-${holding.color}`} style={{ width: `${holding.weight}%` }} key={holding.name} />)}</div></section>
    <section className="portfolio-table shell">
      <div className="table-head"><span>配置</span><span>組合角色</span><span>權重</span></div>
      {holdingsZhTw.map((holding, index) => <div className="portfolio-row" key={holding.name}><span>{String(index + 1).padStart(2, "0")} · {holding.name}</span><span>{holding.thesis}</span><strong>{holding.weight.toFixed(1)}%</strong></div>)}
    </section>
    <p className="data-note shell">初版所有數據皆為示意資料，之後將以經過驗證的投資組合數據取代。</p><SiteFooter locale="zh-tw" /></main>;
}
