import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { portfolioSnapshot } from "@/data/portfolio";

export const metadata: Metadata = { title: { absolute: "績效｜Modern Fundamental Analyst" }, description: "投資組合績效、基準比較與計算方法。" };

export default function PerformancePageZhTw() {
  return <main><SiteHeader locale="zh-tw" counterpartPath="/performance" />
    <section className="page-hero shell"><p className="eyebrow"><span /> 績效 · 已驗證快照</p><h1>看見成績，<br /><em>也看見脈絡。</em></h1><div className="page-intro"><p>以相同現金流期間，比較投資組合與基準的績效。</p><small>截至 2026 年 7 月 31 日 · 每月更新</small></div></section>
    <section className="performance-summary shell"><div className="summary-primary"><span>累積報酬</span><strong className="positive">+{portfolioSnapshot.totalReturn.toFixed(2)}%</strong><small>成本基礎報酬</small></div><div><span>投資組合 XIRR</span><strong className="positive">+{portfolioSnapshot.xirr.toFixed(2)}%</strong><small>現金流加權</small></div><div><span>{portfolioSnapshot.benchmark} XIRR</span><strong className="positive">+{portfolioSnapshot.benchmarkXirr.toFixed(2)}%</strong><small>相同現金流期間</small></div></section>
    <section className="returns shell"><div className="section-heading"><p className="section-number">績效快照</p><h2>以一致方式衡量。</h2></div>
      <div className="returns-table"><div className="table-head"><span>衡量項目</span><span>結果</span><span>說明</span></div><div className="return-row"><span>累積報酬</span><strong className="positive">+{portfolioSnapshot.totalReturn.toFixed(2)}%</strong><span>市場價值相對淨成本基礎</span></div><div className="return-row"><span>投資組合 XIRR</span><strong className="positive">+{portfolioSnapshot.xirr.toFixed(2)}%</strong><span>資金加權年化報酬</span></div><div className="return-row"><span>{portfolioSnapshot.benchmark} XIRR</span><strong className="positive">+{portfolioSnapshot.benchmarkXirr.toFixed(2)}%</strong><span>使用相同現金流計算的基準</span></div></div>
    </section>
    <section className="methodology shell"><h2>計算方法</h2><div><p>績效以美元呈現。累積報酬比較目前市場價值與淨成本基礎；XIRR 反映投資組合現金流的時間與金額，{portfolioSnapshot.benchmark} 比較則將相同現金流套用至基準。</p><p>資料來源：Google Sheets「{portfolioSnapshot.source}」。資料每月更新，並非依據即時市場價格。過往績效不代表未來結果。</p></div></section><SiteFooter locale="zh-tw" /></main>;
}
