import { PortfolioMetric } from "@/features/portfolio/portfolio-metric";
import { PageHero } from "@/components/page-hero";
import { appearance } from "./portfolio-page-content.styles";
import { PortfolioTable, type PortfolioTableCopy } from "@/features/portfolio/portfolio-table";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { portfolioHoldings, portfolioIncome, portfolioSnapshot } from "@/features/portfolio/portfolio";
import { formatDate, formatPercent, formatUsd } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

const copy = {
  en: {
    eyebrow: "Portfolio",
    title: (
      <>
        A Fully Disclosed
        <br />
        <em>Focus Portfolio.</em>
      </>
    ),
    intro:
      "A monthly view of my holdings, position sizes, investment theses, and long-term approach to portfolio management.",
    summaryLabel: "Portfolio Summary",
    marketValue: "Stock Market Value",
    currency: "USD",
    costBasis: "Net Cost Basis",
    costBasisNote: "Purchases and Transaction Fees",
    totalReturn: "Total Return",
    returnSummaryNote: "Absolute Return",
    holdings: "Holdings",
    holdingsNote: "Stocks and ETFs",
    currentHoldings: "Current Holdings",
    positionCount: `${portfolioSnapshot.holdingsCount} Disclosed Positions.`,
    returnNote:
      "Each position's return compares market value with cost basis. Net dividends and financing interest are not allocated to positions; they are added and deducted, respectively, in the total cost-basis return shown in both the summary and the table.",
  },
  "zh-tw": {
    eyebrow: "投資組合",
    title: (
      <>
        完整揭露的
        <br />
        <em>集中投資組合。</em>
      </>
    ),
    intro: "每月呈現我的持股、部位規模、投資論點，以及長期投資組合管理方法。",
    summaryLabel: "投資組合摘要",
    marketValue: "股票市場價值",
    currency: "美元",
    costBasis: "淨成本基礎",
    costBasisNote: "買入金額與交易費用",
    totalReturn: "總報酬率",
    returnSummaryNote: "絕對報酬率",
    holdings: "持股數量",
    holdingsNote: "股票與 ETF",
    currentHoldings: "目前持股",
    positionCount: `${portfolioSnapshot.holdingsCount} 個已揭露部位。`,
    returnNote:
      "個別持股報酬僅以市值與成本基礎計算。淨股息與融資利息不分攤至各持股，在摘要與表格共同顯示的成本基礎總報酬率中分別加計與扣除。",
  },
  "zh-cn": {
    eyebrow: "投资组合",
    title: (
      <>
        完整披露的
        <br />
        <em>集中投资组合。</em>
      </>
    ),
    intro: "每月呈现我的持仓、仓位规模、投资论点，以及长期投资组合管理方法。",
    summaryLabel: "投资组合摘要",
    marketValue: "股票市场价值",
    currency: "美元",
    costBasis: "净成本基础",
    costBasisNote: "买入金额与交易费用",
    totalReturn: "总回报率",
    returnSummaryNote: "绝对回报率",
    holdings: "持仓数量",
    holdingsNote: "股票与 ETF",
    currentHoldings: "当前持仓",
    positionCount: `${portfolioSnapshot.holdingsCount} 个已披露持仓。`,
    returnNote:
      "单项持仓回报仅以市值与成本基础计算。净股息与融资利息不分摊至各持仓，在摘要与表格共同显示的成本基础总回报率中分别加计和扣除。",
  },
} as const;

const tableCopy = {
  en: {
    ariaLabel: "Portfolio Holdings",
    symbol: "Position",
    shares: "Shares",
    costBasis: "Cost Basis",
    price: "Price",
    marketValue: "Market Value",
    returnPct: "Return",
    weight: "Weight",
    sortBy: "Sort By",
    ascending: "Ascending",
    descending: "Descending",
    total: "Total",
  },
  "zh-tw": {
    ariaLabel: "投資組合持股",
    symbol: "部位",
    shares: "股數",
    costBasis: "成本基礎",
    price: "價格",
    marketValue: "市場價值",
    returnPct: "報酬",
    weight: "權重",
    sortBy: "排序依據",
    ascending: "升序",
    descending: "降序",
    total: "合計",
  },
  "zh-cn": {
    ariaLabel: "投资组合持仓",
    symbol: "持仓",
    shares: "股数",
    costBasis: "成本基础",
    price: "价格",
    marketValue: "市场价值",
    returnPct: "回报",
    weight: "权重",
    sortBy: "排序依据",
    ascending: "升序",
    descending: "降序",
    total: "合计",
  },
} satisfies Record<Locale, PortfolioTableCopy>;

export function PortfolioPageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const isChinese = locale !== "en";
  const asOf = formatDate(portfolioSnapshot.asOf, locale, locale === "en");

  return (
    <div className="portfolio-page">
      <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
      <main id="main-content" tabIndex={-1}>
        <PageHero
          variant="portfolio"
          label={<>{text.eyebrow}</>}
          title={<>{text.title}</>}
          intro={
            <>
              <p>{text.intro}</p>
              <small className={appearance["date-text"]}>
                {isChinese ? "截至 " : "As of "}
                <time dateTime={portfolioSnapshot.asOf}>{asOf}</time>
                {isChinese ? " · 每月更新" : " · Updated Monthly"}
              </small>
            </>
          }
        />
        <dl className={appearance["portfolio-kpis"]} aria-label={text.summaryLabel}>
          <PortfolioMetric
            tone="plain"
            className="col-start-1 row-start-1 compact:col-auto compact:row-auto"
            label={<>{text.marketValue}</>}
            value={<>{formatUsd(portfolioSnapshot.marketValue)}</>}
            note={<>{text.currency}</>}
          />
          <PortfolioMetric
            tone="highlight"
            className="col-start-1 row-start-2 compact:col-auto compact:row-auto"
            label={<>{text.costBasis}</>}
            value={<>{formatUsd(portfolioSnapshot.costBasis)}</>}
            note={<>{text.costBasisNote}</>}
          />
          <PortfolioMetric
            tone="brand"
            className="col-start-2 row-start-1 compact:col-auto compact:row-auto"
            label={<>{text.totalReturn}</>}
            value={<>{formatPercent(portfolioSnapshot.totalReturn)}</>}
            note={<>{text.returnSummaryNote}</>}
          />
          <PortfolioMetric
            tone="paper"
            className="col-start-2 row-start-2 compact:col-auto compact:row-auto"
            label={<>{text.holdings}</>}
            value={<>{portfolioSnapshot.holdingsCount}</>}
            note={<>{text.holdingsNote}</>}
          />
        </dl>
        <section className={appearance["portfolio-holdings-section"]} aria-labelledby="portfolio-holdings-title">
          <div className={appearance["portfolio-holdings-heading"] + " " + appearance["shell"]}>
            <div>
              <span>{text.currentHoldings}</span>
              <h2 id="portfolio-holdings-title">{text.positionCount}</h2>
            </div>
            <p>
              <span className={appearance["portfolio-desktop-instruction"]}>
                {locale === "en"
                  ? "Click any column heading to sort. "
                  : locale === "zh-tw"
                    ? "點選任一欄位標題即可排序；"
                    : "点击任一栏标题即可排序；"}
              </span>
              {locale === "en"
                ? `Prices and market values use closing prices as of ${asOf}.`
                : locale === "zh-tw"
                  ? `價格與市場價值均採用 ${asOf} 收盤價。`
                  : `价格与市场价值均采用 ${asOf} 收盘价。`}
            </p>
          </div>
          <div className={appearance["portfolio-table-wrap"] + " " + appearance["shell"]}>
            <PortfolioTable copy={tableCopy[locale]} holdings={portfolioHoldings} income={portfolioIncome} />
          </div>
          <div className={appearance["portfolio-return-note"] + " " + appearance["shell"]}>
            <p>{text.returnNote}</p>
          </div>
        </section>
      </main>
      <PageFooter locale={locale} />
    </div>
  );
}
