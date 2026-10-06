import { PortfolioMetric } from "@/features/portfolio/portfolio-metric";
import { PageHero } from "@/components/page-hero";
import { appearance } from "./performance-page-content.styles";
import { TimeWeightedPerformance } from "@/features/portfolio/time-weighted-performance";
import { PerformanceChart } from "@/features/portfolio/performance-chart";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { portfolioSnapshot } from "@/features/portfolio/portfolio";
import { formatDate, formatPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

const copy = {
  en: {
    eyebrow: "Performance",
    title: (
      <>
        A Monthly Record of
        <br />
        <em>Decisions and Results.</em>
      </>
    ),
    intro:
      "A complete monthly record of portfolio results, methodology, benchmarks, dividends, fees, and periods of underperformance.",
    cumulativeReturn: "Cumulative return",
    cumulativeNote: "Cost-basis return",
    portfolioXirr: "Portfolio XIRR",
    portfolioNote: "Cash-flow weighted",
    benchmarkNote: "Same investment dates",
    chart: "Performance Chart",
    measured: "Measured consistently.",
    methodology: "Methodology",
    methodologyCopy: (
      <>
        <p>
          <strong>Cumulative return.</strong> (Stock market value + net dividends − financing interest − net cost basis)
          ÷ net cost basis. This is a cumulative, non-annualized return.
        </p>
        <p>
          <strong>XIRR.</strong> Money-weighted annualized return using dated investment cash flows and the ending stock
          market value. Each chart point shows the since-inception XIRR at that month-end, not the return for that
          month. Periods shorter than 30 days are not annualized.
        </p>
        <p>
          <strong>{portfolioSnapshot.benchmark} comparison.</strong> Uses the same investment dates and purchase costs
          with adjusted benchmark prices. It is a hypothetical comparison, not an actual benchmark holding.
        </p>
        <p>
          <strong>Reconstructed TWR.</strong> Geometrically links closing-price sub-period returns for the stock sleeve,
          with purchase costs and gifted securities modeled as beginning-of-period contributions. Net dividends and
          financing costs are settled at period end. Gift values use the preceding close; splits change quantities
          without a cash flow. Non-trading dates use the preceding trading close. The result is cumulative and not
          annualized. Like XIRR, it excludes cash balances, fund holdings and liability balances, while retaining net
          dividends, trading fees and financing interest. Account deposits and withdrawals are outside this stock-only
          boundary. SPY uses same-vintage dividend-adjusted prices from the first purchase date. This model does not
          recover actual intraday valuations or establish GIPS compliance.
        </p>
      </>
    ),
    snapshotCopy: (asOf: string) => (
      <p>
        The verified data is synchronized to this site monthly. Prices and market values use closing prices as of {asOf}{" "}
        and are not live quotes. TWR and XIRR cover stock holdings only, excluding cash balances, fund holdings and
        liability balances.
      </p>
    ),
  },
  "zh-tw": {
    eyebrow: "績效",
    title: (
      <>
        每月記錄
        <br />
        <em>決策與結果。</em>
      </>
    ),
    intro: "完整記錄每月投資組合結果、計算方法、基準、股息、費用與績效落後的時期。",
    cumulativeReturn: "累積報酬",
    cumulativeNote: "成本基礎報酬",
    portfolioXirr: "投資組合 XIRR",
    portfolioNote: "現金流加權",
    benchmarkNote: "相同投資日期",
    chart: "績效圖表",
    measured: "以一致方式衡量。",
    methodology: "計算方法",
    methodologyCopy: (
      <>
        <p>
          <strong>累積報酬。</strong>（股票市場價值＋淨股息－融資利息－淨成本）÷ 淨成本，為未經年化的累積報酬。
        </p>
        <p>
          <strong>XIRR。</strong>{" "}
          依投資現金流的實際日期與期末股票市場價值，計算資金加權年化報酬。圖表每個點代表該月底自成立以來的
          XIRR，並非該月單月報酬；不足 30 天的期間不作年化。
        </p>
        <p>
          <strong>{portfolioSnapshot.benchmark} 比較。</strong>{" "}
          使用相同投資日期、買入成本與基準的調整後價格計算，屬於假設性比較，並非實際持有基準的績效。
        </p>
        <p>
          <strong>重建 TWR。</strong>{" "}
          串接股票部位各估值期間的報酬，假設買入成本及獲贈股票於期初投入，淨股息與融資費用於期末結算。贈股按前一期收盤價估值，拆股只調整股數；非交易日沿用前一交易日收盤價。結果為未年化累積報酬；與
          XIRR
          相同，排除現金餘額、基金持倉及負債餘額，但保留淨股息、交易費用及融資利息。帳戶出入金不屬於股票部位計算範圍。SPY
          採同一資料批次的股息調整價格，自首次買入日期比較。此模型無法還原實際日內估值，也不代表符合 GIPS 標準。
        </p>
      </>
    ),
    snapshotCopy: (asOf: string) => (
      <p>
        已驗證快照每月同步至本網站。價格與市場價值均採用 {asOf} 收盤價，並非即時報價；TWR 與 XIRR
        僅涵蓋股票持倉，不包含現金餘額、基金持倉及負債餘額。
      </p>
    ),
  },
  "zh-cn": {
    eyebrow: "业绩",
    title: (
      <>
        每月记录
        <br />
        <em>决策与结果。</em>
      </>
    ),
    intro: "完整记录每月投资组合结果、计算方法、基准、股息、费用与业绩落后的时期。",
    cumulativeReturn: "累计回报",
    cumulativeNote: "成本基础回报",
    portfolioXirr: "投资组合 XIRR",
    portfolioNote: "现金流加权",
    benchmarkNote: "相同投资日期",
    chart: "业绩图表",
    measured: "以一致方式衡量。",
    methodology: "计算方法",
    methodologyCopy: (
      <>
        <p>
          <strong>累计回报。</strong>（股票市场价值＋净股息－融资利息－净成本）÷ 净成本，为未经年化的累计回报。
        </p>
        <p>
          <strong>XIRR。</strong>{" "}
          根据投资现金流的实际日期与期末股票市场价值，计算资金加权年化回报。图表每个点代表该月底自成立以来的
          XIRR，并非该月单月回报；不足 30 天的期间不作年化。
        </p>
        <p>
          <strong>{portfolioSnapshot.benchmark} 比较。</strong>{" "}
          使用相同投资日期、买入成本与基准的调整后价格计算，属于假设性比较，并非实际持有基准的业绩。
        </p>
        <p>
          <strong>重建 TWR。</strong>{" "}
          串接股票部位各估值期间的回报，假设买入成本及获赠股票于期初投入，净股息与融资费用于期末结算。赠股按前一期收盘价估值，拆股只调整股数；非交易日沿用前一交易日收盘价。结果为未经年化的累计回报；与
          XIRR
          相同，排除现金余额、基金持仓及负债余额，但保留净股息、交易费用及融资利息。账户出入金不属于股票部位计算范围。SPY
          采用同一数据批次的股息调整价格，自首次买入日期比较。此模型无法还原实际日内估值，也不代表符合 GIPS 标准。
        </p>
      </>
    ),
    snapshotCopy: (asOf: string) => (
      <p>
        已验证快照每月同步至本网站。价格与市场价值均采用 {asOf} 收盘价，并非实时报价；TWR 与 XIRR
        仅涵盖股票持仓，不包含现金余额、基金持仓及负债余额。
      </p>
    ),
  },
} as const;

export function PerformancePageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const isChinese = locale !== "en";
  const asOf = formatDate(portfolioSnapshot.asOf, locale, locale === "en");

  return (
    <div className="performance-page">
      <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
      <main id="main-content" tabIndex={-1}>
        <PageHero
          variant="performance"
          label={<>{text.eyebrow}</>}
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
        />
        <dl className={appearance["performance-summary"]}>
          <PortfolioMetric
            tone="highlight"
            className=""
            label={<>{text.cumulativeReturn}</>}
            value={<>{formatPercent(portfolioSnapshot.totalReturn)}</>}
            note={<>{text.cumulativeNote}</>}
          />
          <PortfolioMetric
            tone="brand"
            className=""
            label={<>{text.portfolioXirr}</>}
            value={<>{formatPercent(portfolioSnapshot.xirr)}</>}
            note={<>{text.portfolioNote}</>}
          />
          <PortfolioMetric
            tone="paper"
            className=""
            label={<>{portfolioSnapshot.benchmark} XIRR</>}
            value={<>{formatPercent(portfolioSnapshot.benchmarkXirr)}</>}
            note={<>{text.benchmarkNote}</>}
          />
        </dl>
        <section className={appearance["returns"] + " " + appearance["shell"]}>
          <div className={appearance["section-heading"]}>
            <p className={appearance["section-number"]}>{text.chart}</p>
            <h2>{text.measured}</h2>
          </div>
          <PerformanceChart locale={locale} />
          <TimeWeightedPerformance locale={locale} />
        </section>
        <div className={appearance["section-gray"]}>
          <section className={appearance["methodology"] + " " + appearance["shell"]}>
            <h2>{text.methodology}</h2>
            <div className={appearance["methodology-content"]}>
              <div className={appearance["methodology-explanation"]}>{text.methodologyCopy}</div>
              <aside className={appearance["methodology-source"]}>{text.snapshotCopy(asOf)}</aside>
            </div>
          </section>
        </div>
      </main>
      <PageFooter locale={locale} />
    </div>
  );
}
