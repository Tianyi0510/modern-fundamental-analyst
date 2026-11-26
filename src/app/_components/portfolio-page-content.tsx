import { portfolioTwrSnapshot } from "@/features/portfolio/portfolio-twr";
import { PortfolioMetric } from "@/features/portfolio/portfolio-metric";
import { PageHero } from "@/components/page-hero";
import { appearance } from "./portfolio-page-content.styles";
import { PortfolioTable, type PortfolioTableCopy } from "@/features/portfolio/portfolio-table";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header/site-header";
import { portfolioHoldings, portfolioIncome, portfolioSnapshot } from "@/features/portfolio/portfolio";
import { formatDate, formatPercent, formatUsd } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

const copy = {
  en: {
    title: (
      <>
        A Fully Disclosed
        <br />
        <em>Concentrated Portfolio</em>
      </>
    ),
    intro:
      "See what I own, how much of the portfolio each holding represents, and how those positions change each month.",
    summaryLabel: "Portfolio Summary",
    marketValue: "Total Market Value",
    currency: "USD",
    totalReturn: "Total Return",
    returnSummaryNote: "Return on purchase cost",
    holdings: "Holdings",
    holdingsNote: "Stocks and ETFs",
    currentHoldings: "Current Holdings",
    positionCount: `${portfolioSnapshot.holdingsCount} Disclosed Positions`,
    returnNote:
      "The portfolio accounts for net dividends and financing interest. Individual position returns exclude both.",
  },
  "zh-tw": {
    title: (
      <>
        完整揭露的
        <br />
        <em>集中投資組合</em>
      </>
    ),
    intro: "這是我的每月持股紀錄。你可以查看每檔持股的比重，也可以追蹤持股變化。",
    summaryLabel: "投資組合摘要",
    marketValue: "總市值",
    currency: "美元",
    totalReturn: "總報酬率",
    returnSummaryNote: "以買入成本計算",
    holdings: "持股數量",
    holdingsNote: "股票與 ETF",
    currentHoldings: "目前持股",
    positionCount: `${portfolioSnapshot.holdingsCount} 個已揭露部位`,
    returnNote: "整體投資組合的報酬率計入稅後股息，並扣除融資利息。個別持股的報酬率不含這兩項。",
  },
  "zh-cn": {
    title: (
      <>
        完整披露的
        <br />
        <em>集中投资组合</em>
      </>
    ),
    intro: "这里记录了我每个月的持仓。你可以查看每只股票或 ETF 的占比，也可以追踪持仓变化。",
    summaryLabel: "投资组合摘要",
    marketValue: "总市值",
    currency: "美元",
    totalReturn: "总回报率",
    returnSummaryNote: "按买入成本计算",
    holdings: "持仓数量",
    holdingsNote: "股票与 ETF",
    currentHoldings: "当前持仓",
    positionCount: `${portfolioSnapshot.holdingsCount} 个已披露持仓`,
    returnNote: "整个投资组合的回报率计入税后股息，并扣除融资利息。单只股票或 ETF 的回报率不含这两项。",
  },
} as const;

const tableCopy = {
  en: {
    ariaLabel: "Portfolio holdings",
    empty: "No holdings to display.",
    symbol: "Position",
    shares: "Shares",
    costBasis: "Average Cost per Share",
    price: "Price",
    marketValue: "Market Value",
    returnPct: "Return",
    weight: "Weight",
    sortBy: "Sort by",
    ascending: "Ascending",
    descending: "Descending",
    total: "Total",
  },
  "zh-tw": {
    ariaLabel: "投資組合持股",
    empty: "目前沒有可顯示的持股。",
    symbol: "部位",
    shares: "股數",
    costBasis: "每股平均成本",
    price: "價格",
    marketValue: "市值",
    returnPct: "報酬率",
    weight: "權重",
    sortBy: "排序依據",
    ascending: "升序",
    descending: "降序",
    total: "合計",
  },
  "zh-cn": {
    ariaLabel: "投资组合持仓",
    empty: "目前没有可显示的持仓。",
    symbol: "持仓",
    shares: "股数",
    costBasis: "每股平均成本",
    price: "价格",
    marketValue: "市值",
    returnPct: "回报率",
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

  const priceDate = formatDate(portfolioTwrSnapshot.priceDate, locale, locale === "en");

  return (
    <div className="portfolio-page">
      <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
      <main id="main-content" tabIndex={-1} className="@container/financial-summary">
        <PageHero
          variant="portfolio"
          title={<>{text.title}</>}
          intro={
            <>
              <p>{text.intro}</p>
              <small className={appearance["date-text"]}>
                {isChinese ? "截至 " : "As of "}
                <time dateTime={portfolioSnapshot.asOf}>{asOf}</time>
                {isChinese ? " · 每月更新" : " · Updated monthly"}
              </small>
            </>
          }
        >
          <dl className={appearance["portfolio-kpis"]} aria-label={text.summaryLabel}>
            <PortfolioMetric
              locale={locale}
              tone="plain"
              label={<>{text.marketValue}</>}
              value={<>{formatUsd(portfolioSnapshot.marketValue)}</>}
              note={<>{text.currency}</>}
            />
            <PortfolioMetric
              locale={locale}
              tone="brand"
              label={<>{text.totalReturn}</>}
              value={<>{formatPercent(portfolioSnapshot.totalReturn)}</>}
              note={<>{text.returnSummaryNote}</>}
            />
            <PortfolioMetric
              locale={locale}
              tone="paper"
              label={<>{text.holdings}</>}
              value={<>{portfolioSnapshot.holdingsCount}</>}
              note={<>{text.holdingsNote}</>}
            />
          </dl>
        </PageHero>
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
                    ? "點選欄位標題即可排序。"
                    : "点击列标题即可排序。"}
              </span>
              {locale === "en"
                ? `The ${asOf} valuation uses closing prices from ${priceDate}.`
                : locale === "zh-tw"
                  ? `${asOf} 的持股市值按 ${priceDate} 的收盤價計算。`
                  : `${asOf} 的持仓市值按 ${priceDate} 的收盘价计算。`}
            </p>
          </div>
          <div className={appearance["portfolio-table-wrap"] + " " + appearance["shell"]}>
            <PortfolioTable
              locale={locale}
              copy={tableCopy[locale]}
              holdings={portfolioHoldings}
              income={portfolioIncome}
            />
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
