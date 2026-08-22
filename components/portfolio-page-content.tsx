import { PortfolioTable } from "@/components/portfolio-table";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHoldingWeight, portfolioHoldings, portfolioSnapshot } from "@/data/portfolio";
import { formatDate, formatPercent, formatUsd } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

const copy = {
  en: {
    eyebrow: "Portfolio",
    title: <>A Fully Disclosed<br /><em>Focus Portfolio.</em></>,
    intro: "A monthly view of my holdings, position sizes, investment theses, and long-term approach to portfolio management.",
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
  },
  "zh-tw": {
    eyebrow: "投資組合",
    title: <>完整揭露的<br /><em>集中投資組合。</em></>,
    intro: "每月呈現我的持股、部位規模、投資論點，以及長期投資組合管理方法。",
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
  },
  "zh-cn": {
    eyebrow: "投资组合",
    title: <>完整披露的<br /><em>集中投资组合。</em></>,
    intro: "每月呈现我的持仓、仓位规模、投资论点，以及长期投资组合管理方法。",
    summaryLabel: "投资组合摘要",
    marketValue: "股票市场价值",
    currency: "美元",
    costBasis: "净成本基础",
    costBasisNote: "买入金额与交易费用",
    totalReturn: "累计回报",
    totalReturnNote: "成本基础累计回报",
    holdings: "持仓数量",
    holdingsNote: "股票与 ETF",
    allocation: "按市场价值配置",
    allocationNote: "已披露股票持仓的 100%",
    allocationLabel: "按市场价值计算的投资组合配置",
    currentHoldings: "当前持仓",
    positionCount: `${portfolioSnapshot.holdingsCount} 个已披露持仓。`,
  },
} as const;

const segmentColors = ["medium-blue", "dark-blue", "light-blue", "gray", "blue-mix", "black"] as const;

export function PortfolioPageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const isChinese = locale !== "en";
  const asOf = formatDate(portfolioSnapshot.asOf, locale);

  return <main className="portfolio-page"><SiteHeader locale={locale} />
    <section className="page-hero shell"><p className="eyebrow"><span /> {text.eyebrow}</p><h1>{text.title}</h1><div className="page-intro"><p>{text.intro}</p><small className="date-text">{isChinese ? `截至 ${asOf} · 每月更新` : `As of ${asOf} · Updated monthly`}</small></div></section>
    <section className="portfolio-kpis shell" aria-label={text.summaryLabel}>
      <div><span>{text.marketValue}</span><strong>{formatUsd(portfolioSnapshot.marketValue)}</strong><small>{text.currency}</small></div>
      <div><span>{text.costBasis}</span><strong>{formatUsd(portfolioSnapshot.costBasis)}</strong><small>{text.costBasisNote}</small></div>
      <div><span>{text.totalReturn}</span><strong>{formatPercent(portfolioSnapshot.totalReturn)}</strong><small>{text.totalReturnNote}</small></div>
      <div><span>{text.holdings}</span><strong>{portfolioSnapshot.holdingsCount}</strong><small>{text.holdingsNote}</small></div>
    </section>
    <section className="portfolio-allocation shell"><div><span>{text.allocation}</span><small>{text.allocationNote}</small></div><div className="stacked-bar" aria-label={text.allocationLabel}>{portfolioHoldings.map((holding, index) => <i className={`segment segment-${segmentColors[index % segmentColors.length]}`} style={{ width: `${getHoldingWeight(holding.marketValue)}%` }} key={holding.symbol} title={`${holding.symbol} ${getHoldingWeight(holding.marketValue).toFixed(1)}%`} />)}</div></section>
    <section className="portfolio-holdings-heading shell">
      <div><span>{text.currentHoldings}</span><h2>{text.positionCount}</h2></div>
      <p>{locale === "en" ? `Click any column heading to sort. Prices and market values use closing prices as of ${asOf}.` : locale === "zh-tw" ? `點選任一欄位標題即可排序；價格與市場價值均採用 ${asOf} 收盤價。` : `点击任一栏标题即可排序；价格与市场价值均采用 ${asOf} 收盘价。`}</p>
    </section>
    <section className="portfolio-table-wrap shell"><PortfolioTable holdings={portfolioHoldings} locale={locale} /></section>
    <p className="data-note portfolio-source-note shell">{locale === "en" ? `Source: Google Sheets “${portfolioSnapshot.source}”; the verified snapshot is synchronized to this site monthly. Prices and market values use closing prices as of ${asOf} and are not live quotes. Cash and external funding are excluded.` : locale === "zh-tw" ? `資料來源：Google Sheets「${portfolioSnapshot.source}」，已驗證快照每月同步至本網站。價格與市場價值均採用 ${asOf} 收盤價，並非即時報價；不包含現金與外部資金流。` : `数据来源：Google Sheets“${portfolioSnapshot.source}”，已验证快照每月同步至本网站。价格与市场价值均采用 ${asOf} 收盘价，并非实时报价；不包含现金与外部资金流。`}</p><SiteFooter locale={locale} /></main>;
}
