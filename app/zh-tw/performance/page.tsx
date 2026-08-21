import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { annualReturnsZhTw } from "@/data/site-zh-tw";

export const metadata: Metadata = { title: { absolute: "績效｜Modern Fundamental Analyst" }, description: "投資組合績效、基準比較與計算方法。" };

export default function PerformancePageZhTw() {
  return <main><SiteHeader locale="zh-tw" counterpartPath="/performance" />
    <section className="page-hero shell"><p className="eyebrow"><span /> 績效 · 示例數據</p><h1>看見成績，<br /><em>也看見脈絡。</em></h1></section>
    <section className="performance-summary shell"><div className="summary-primary"><span>累積報酬</span><strong>+18.6%</strong><small>成立以來</small></div><div><span>基準</span><strong>+12.4%</strong><small>相同期間</small></div><div><span>最大回撤</span><strong className="negative">−11.2%</strong><small>高點至低點</small></div></section>
    <section className="returns shell"><div className="section-heading"><p className="section-number">年度報酬</p><h2>逐年檢視。</h2></div>
      <div className="returns-table"><div className="table-head"><span>年度</span><span>投資組合</span><span>基準</span></div>{annualReturnsZhTw.map((row) => <div className="return-row" key={row.year}><span>{row.year}</span><strong className={row.portfolio < 0 ? "negative" : ""}>{row.portfolio > 0 ? "+" : ""}{row.portfolio}%</strong><span>{row.benchmark > 0 ? "+" : ""}{row.benchmark}%</span></div>)}</div>
    </section>
    <section className="methodology shell"><h2>計算方法</h2><div><p>報酬以美元呈現，並假設股利再投資。費用、現金流與基準處理方式將於正式發布前完整說明。</p><p>過往績效不代表未來結果；目前數據皆為示意資料。</p></div></section><SiteFooter locale="zh-tw" /></main>;
}
