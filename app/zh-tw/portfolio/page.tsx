import type { Metadata } from "next";
import { PortfolioTable } from "@/components/portfolio-table";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHoldingWeight, portfolioHoldings, portfolioSnapshot } from "@/data/portfolio";

export const metadata: Metadata = { title: { absolute: "投資組合｜Modern Fundamental Analyst" }, description: "目前投資組合配置與各部位的投資角色。" };

export default function PortfolioPageZhTw() {
  return <main className="portfolio-page"><SiteHeader locale="zh-tw" counterpartPath="/portfolio" />
    <section className="page-hero shell"><p className="eyebrow"><span /> 投資組合</p><h1>完整揭露的<br /><em>集中投資組合。</em></h1><div className="page-intro"><p>每月呈現我的持股、部位規模、投資論點，以及長期投資組合管理方法。</p><small>截至 2026 年 7 月 31 日 · 每月更新</small></div></section>
    <section className="portfolio-kpis shell" aria-label="投資組合摘要">
      <div><span>股票市場價值</span><strong>{formatUsd(portfolioSnapshot.marketValue)}</strong><small>美元</small></div>
      <div><span>淨成本基礎</span><strong>{formatUsd(portfolioSnapshot.costBasis)}</strong><small>買入金額與交易費用</small></div>
      <div><span>累積報酬</span><strong>+{portfolioSnapshot.totalReturn.toFixed(2)}%</strong><small>成本基礎累積報酬</small></div>
      <div><span>持股數量</span><strong>{portfolioSnapshot.holdingsCount}</strong><small>股票與 ETF</small></div>
    </section>
    <section className="portfolio-allocation shell"><div><span>依市場價值配置</span><small>已揭露股票部位的 100%</small></div><div className="stacked-bar" aria-label="依市場價值計算的投資組合配置">{portfolioHoldings.map((holding, index) => <i className={`segment segment-${segmentColors[index % segmentColors.length]}`} style={{ width: `${getHoldingWeight(holding.marketValue)}%` }} key={holding.symbol} title={`${holding.symbol} ${getHoldingWeight(holding.marketValue).toFixed(1)}%`} />)}</div></section>
    <section className="portfolio-holdings-heading shell">
      <div><span>目前持股</span><h2>{portfolioSnapshot.holdingsCount} 個已揭露部位。</h2></div>
      <p>點選任一欄位標題即可排序；價格與市場價值均採用 2026 年 7 月 31 日收盤價。</p>
    </section>
    <section className="portfolio-table-wrap shell">
      <PortfolioTable holdings={portfolioHoldings} locale="zh-tw" />
    </section>
    <p className="data-note portfolio-source-note shell">資料來源：Google Sheets「{portfolioSnapshot.source}」。價格與市場價值均採用 2026 年 7 月 31 日收盤價，並非即時報價；不包含現金與外部資金流。</p><SiteFooter locale="zh-tw" /></main>;
}

const segmentColors = ["blue", "deep", "light", "green", "red", "black"] as const;
const formatUsd = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value);
