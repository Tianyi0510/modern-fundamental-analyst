import { PortfolioTable, type PortfolioTableCopy } from "@/components/portfolio-table";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { portfolioHoldings, portfolioSnapshot } from "@/data/portfolio";
import { formatDate, formatPercent, formatUsd } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

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
    currentHoldings: "当前持仓",
    positionCount: `${portfolioSnapshot.holdingsCount} 个已披露持仓。`,
  },
} as const;

const tableCopy = {
  en: { ariaLabel: "Portfolio holdings", symbol: "Position", shares: "Shares", costBasis: "Cost Basis", price: "Price", marketValue: "Market Value", returnPct: "Return", weight: "Weight", sortBy: "Sort By", ascending: "Ascending", descending: "Descending", total: "Total" },
  "zh-tw": { ariaLabel: "投資組合持股", symbol: "部位", shares: "股數", costBasis: "成本基礎", price: "價格", marketValue: "市場價值", returnPct: "報酬", weight: "權重", sortBy: "排序依據", ascending: "升序", descending: "降序", total: "合計" },
  "zh-cn": { ariaLabel: "投资组合持仓", symbol: "持仓", shares: "股数", costBasis: "成本基础", price: "价格", marketValue: "市场价值", returnPct: "回报", weight: "权重", sortBy: "排序依据", ascending: "升序", descending: "降序", total: "合计" },
} satisfies Record<Locale, PortfolioTableCopy>;

export function PortfolioPageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const isChinese = locale !== "en";
  const asOf = formatDate(portfolioSnapshot.asOf, locale);

  return <main className="portfolio-page" id="main-content"><SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
    <section className="page-hero shell"><p className="eyebrow"><span /> {text.eyebrow}</p><h1>{text.title}</h1><div className="page-intro"><p>{text.intro}</p><small className="date-text">{isChinese ? `截至 ${asOf} · 每月更新` : `As of ${asOf} · Updated monthly`}</small></div></section>
    <section className="portfolio-kpis" aria-label={text.summaryLabel}>
      <div><span>{text.marketValue}</span><strong>{formatUsd(portfolioSnapshot.marketValue)}</strong><small>{text.currency}</small></div>
      <div><span>{text.costBasis}</span><strong>{formatUsd(portfolioSnapshot.costBasis)}</strong><small>{text.costBasisNote}</small></div>
      <div><span>{text.totalReturn}</span><strong>{formatPercent(portfolioSnapshot.totalReturn)}</strong><small>{text.totalReturnNote}</small></div>
      <div><span>{text.holdings}</span><strong>{portfolioSnapshot.holdingsCount}</strong><small>{text.holdingsNote}</small></div>
    </section>
    <section className="portfolio-holdings-heading shell">
      <div><span>{text.currentHoldings}</span><h2>{text.positionCount}</h2></div>
      <p><span className="portfolio-desktop-instruction">{locale === "en" ? "Click any column heading to sort. " : locale === "zh-tw" ? "點選任一欄位標題即可排序；" : "点击任一栏标题即可排序；"}</span>{locale === "en" ? `Prices and market values use closing prices as of ${asOf}.` : locale === "zh-tw" ? `價格與市場價值均採用 ${asOf} 收盤價。` : `价格与市场价值均采用 ${asOf} 收盘价。`}</p>
    </section>
    <section className="portfolio-table-wrap shell"><PortfolioTable copy={tableCopy[locale]} holdings={portfolioHoldings} /></section>
    <SiteFooter locale={locale} /></main>;
}
