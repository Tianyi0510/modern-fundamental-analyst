import { PortfolioTable } from "@/components/portfolio-table";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHoldingWeight, portfolioHoldings, portfolioSnapshot } from "@/data/portfolio";
import { formatUsd } from "@/lib/format";

type Locale = "en" | "zh-tw";

const copy = {
  en: {
    eyebrow: "Portfolio",
    title: <>A Fully Disclosed<br /><em>Focus Portfolio.</em></>,
    intro: "A monthly view of my holdings, position sizes, investment theses, and long-term approach to portfolio management.",
    asOf: "As of 31 July 2026 · Updated monthly",
    summaryLabel: "Portfolio summary",
    marketValue: "Stock market value",
    currency: "USD",
    costBasis: "Net cost basis",
    costBasisNote: "Purchases and transaction fees",
    totalReturn: "Total return",
    totalReturnNote: "Cumulative cost-basis return",
    holdings: "Holdings",
    holdingsNote: "Stocks and ETFs",
    allocation: "Allocation by market value",
    allocationNote: "100% of disclosed stock holdings",
    allocationLabel: "Portfolio allocation by market value",
    currentHoldings: "Current holdings",
    positionCount: `${portfolioSnapshot.holdingsCount} disclosed positions.`,
    sortingNote: "Click any column heading to sort. Prices and market values use closing prices as of 31 July 2026.",
    sourceNote: `Source: Google Sheets “${portfolioSnapshot.source}”. Prices and market values use closing prices as of 31 July 2026 and are not live quotes. Cash and external funding are excluded.`,
  },
  "zh-tw": {
    eyebrow: "投資組合",
    title: <>完整揭露的<br /><em>集中投資組合。</em></>,
    intro: "每月呈現我的持股、部位規模、投資論點，以及長期投資組合管理方法。",
    asOf: "截至 2026 年 7 月 31 日 · 每月更新",
    summaryLabel: "投資組合摘要",
    marketValue: "股票市場價值",
    currency: "美元",
    costBasis: "淨成本基礎",
    costBasisNote: "買入金額與交易費用",
    totalReturn: "累積報酬",
    totalReturnNote: "成本基礎累積報酬",
    holdings: "持股數量",
    holdingsNote: "股票與 ETF",
    allocation: "依市場價值配置",
    allocationNote: "已揭露股票部位的 100%",
    allocationLabel: "依市場價值計算的投資組合配置",
    currentHoldings: "目前持股",
    positionCount: `${portfolioSnapshot.holdingsCount} 個已揭露部位。`,
    sortingNote: "點選任一欄位標題即可排序；價格與市場價值均採用 2026 年 7 月 31 日收盤價。",
    sourceNote: `資料來源：Google Sheets「${portfolioSnapshot.source}」。價格與市場價值均採用 2026 年 7 月 31 日收盤價，並非即時報價；不包含現金與外部資金流。`,
  },
} as const;

const segmentColors = ["blue", "deep", "light", "green", "red", "black"] as const;

export function PortfolioPageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const isChinese = locale === "zh-tw";

  return <main className="portfolio-page"><SiteHeader locale={locale} counterpartPath={isChinese ? "/portfolio" : "/zh-tw/portfolio"} />
    <section className="page-hero shell"><p className="eyebrow"><span /> {text.eyebrow}</p><h1>{text.title}</h1><div className="page-intro"><p>{text.intro}</p><small>{text.asOf}</small></div></section>
    <section className="portfolio-kpis shell" aria-label={text.summaryLabel}>
      <div><span>{text.marketValue}</span><strong>{formatUsd(portfolioSnapshot.marketValue)}</strong><small>{text.currency}</small></div>
      <div><span>{text.costBasis}</span><strong>{formatUsd(portfolioSnapshot.costBasis)}</strong><small>{text.costBasisNote}</small></div>
      <div><span>{text.totalReturn}</span><strong>+{portfolioSnapshot.totalReturn.toFixed(2)}%</strong><small>{text.totalReturnNote}</small></div>
      <div><span>{text.holdings}</span><strong>{portfolioSnapshot.holdingsCount}</strong><small>{text.holdingsNote}</small></div>
    </section>
    <section className="portfolio-allocation shell"><div><span>{text.allocation}</span><small>{text.allocationNote}</small></div><div className="stacked-bar" aria-label={text.allocationLabel}>{portfolioHoldings.map((holding, index) => <i className={`segment segment-${segmentColors[index % segmentColors.length]}`} style={{ width: `${getHoldingWeight(holding.marketValue)}%` }} key={holding.symbol} title={`${holding.symbol} ${getHoldingWeight(holding.marketValue).toFixed(1)}%`} />)}</div></section>
    <section className="portfolio-holdings-heading shell">
      <div><span>{text.currentHoldings}</span><h2>{text.positionCount}</h2></div>
      <p>{text.sortingNote}</p>
    </section>
    <section className="portfolio-table-wrap shell"><PortfolioTable holdings={portfolioHoldings} locale={locale} /></section>
    <p className="data-note portfolio-source-note shell">{text.sourceNote}</p><SiteFooter locale={locale} /></main>;
}
