import { portfolioTwrSnapshot } from "@/features/portfolio/portfolio-twr";
import { PortfolioMetric } from "@/features/portfolio/portfolio-metric";
import { PageHero } from "@/components/page-hero";
import { appearance } from "./performance-page-content.styles";
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
    timeWeightedReturn: "TWRR",
    twrNote: "Time-Weighted Return · Reconstructed · Cumulative",
    portfolioXirr: "Portfolio XIRR",
    portfolioNote: "Money-Weighted Return · Annualized",
    benchmarkNote: "Benchmark Comparison · Simulated · Annualized",
    chart: "Performance Chart",
    measured: "Measured Consistently.",
    methodology: "Methodology",
    dataSources: "Data Sources",
    methodologyCopy: (
      <>
        <p>
          <strong>Cumulative Reconstructed TWRR.</strong> Geometrically links closing-price returns to show cumulative
          performance, not an annualized rate. Purchase costs, including fees, and gifted securities are contributions
          at period start; net dividends and financing costs settle at period end. Gifts use the preceding close; splits
          change quantities without a cash flow. Non-trading dates use the preceding trading close. These assumptions do
          not recover actual intraday valuations or establish GIPS compliance.
        </p>
        <p>
          <strong>Annualized XIRR.</strong> Measures money-weighted return using dated purchase costs, net dividends,
          financing interest and ending market value. Each chart point is the annualized return since inception at that
          month-end, not that month's return. Periods shorter than 30 days are not annualized.
        </p>
        <p>
          <strong>{portfolioSnapshot.benchmark} Comparison.</strong> The TWRR chart uses dividend-adjusted prices from
          one data vintage, starting on the first purchase date, without a synthetic trading-fee deduction. The XIRR
          chart simulates purchases on the portfolio's purchase dates: gross purchase amounts determine units, while
          cash outflows include fees. These are hypothetical comparisons, not actual SPY holdings.
        </p>
        <p>
          <strong>Stocks and ETFs.</strong> Both measures exclude cash balances, separate brokerage fund-account
          positions and liability balances. Listed ETFs in the stock ledger, including VGT and GRNY, remain included.
          Dividends are net of withholding tax; returns deduct trading fees and financing interest. Account deposits and
          withdrawals are outside this measurement boundary; the results do not represent the entire brokerage account.
        </p>
      </>
    ),
    snapshotCopy: (asOf: string) => (
      <p>
        Updated monthly. Prices and market values reflect closing prices as of {asOf}, using the preceding trading close
        when markets are closed. They are not live quotes.
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
    timeWeightedReturn: "TWRR",
    twrNote: "時間加權報酬・重建值・累積",
    portfolioXirr: "投資組合 XIRR",
    portfolioNote: "資金加權報酬・年化",
    benchmarkNote: "基準比較・模擬・年化",
    chart: "績效圖表",
    measured: "以一致方式衡量。",
    methodology: "計算方法",
    dataSources: "資料來源",
    methodologyCopy: (
      <>
        <p>
          <strong>累積重建 TWRR。</strong>{" "}
          以幾何方式串接收盤估值期間的報酬，呈現未年化的累積績效。含交易費用的買入成本及獲贈股票視為期初投入，淨股息與融資費用於期末結算。贈股按前一期收盤價估值，拆股只調整股數；非交易日沿用前一交易日收盤價。這些假設無法還原實際日內估值，也不代表符合
          GIPS 標準。
        </p>
        <p>
          <strong>年化 XIRR。</strong>{" "}
          依買入成本、淨股息、融資利息的實際日期與期末市場價值，計算資金加權報酬。圖表每個點代表該月底自成立以來的年化報酬，並非該月單月報酬；不足
          30 天的期間不作年化。
        </p>
        <p>
          <strong>{portfolioSnapshot.benchmark} 比較。</strong> TWRR
          圖表採用同一資料批次的股息調整價格，自首次買入日期起計算，不額外扣除模擬交易費用。XIRR
          圖表按投資組合的買入日期模擬投資：買入金額決定單位數，現金流出則包含交易費用。兩者均為假設性比較，並非實際持有
          SPY 的績效。
        </p>
        <p>
          <strong>股票與 ETF。</strong> 兩項指標均排除現金餘額、獨立基金帳戶持倉及負債餘額。股票交易紀錄內的上市
          ETF（包括 VGT 與
          GRNY）仍納入計算。股息按扣繳稅後金額計入，報酬則扣除交易費用與融資利息。帳戶出入金不屬於此計算範圍，結果並不代表整個證券帳戶的績效。
        </p>
      </>
    ),
    snapshotCopy: (asOf: string) => (
      <p>每月更新。價格與市場價值以 {asOf} 的收盤價為準；休市日採前一交易日收盤價，並非即時報價。</p>
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
    timeWeightedReturn: "TWRR",
    twrNote: "时间加权回报・重建值・累计",
    portfolioXirr: "投资组合 XIRR",
    portfolioNote: "资金加权回报・年化",
    benchmarkNote: "基准比较・模拟・年化",
    chart: "业绩图表",
    measured: "以一致方式衡量。",
    methodology: "计算方法",
    dataSources: "数据来源",
    methodologyCopy: (
      <>
        <p>
          <strong>累计重建 TWRR。</strong>{" "}
          以几何方式串接收盘估值期间的回报，呈现未经年化的累计业绩。含交易费用的买入成本及获赠股票视为期初投入，净股息与融资费用于期末结算。赠股按前一期收盘价估值，拆股只调整股数；非交易日沿用前一交易日收盘价。这些假设无法还原实际日内估值，也不代表符合
          GIPS 标准。
        </p>
        <p>
          <strong>年化 XIRR。</strong>{" "}
          根据买入成本、净股息、融资利息的实际日期与期末市场价值，计算资金加权回报。图表每个点代表该月底自成立以来的年化回报，并非该月单月回报；不足
          30 天的期间不作年化。
        </p>
        <p>
          <strong>{portfolioSnapshot.benchmark} 比较。</strong> TWRR
          图表采用同一数据批次的股息调整价格，自首次买入日期起计算，不额外扣除模拟交易费用。XIRR
          图表按投资组合的买入日期模拟投资：买入金额决定单位数，现金流出则包含交易费用。两者均为假设性比较，并非实际持有
          SPY 的业绩。
        </p>
        <p>
          <strong>股票与 ETF。</strong> 两项指标均排除现金余额、独立基金账户持仓及负债余额。股票交易记录内的上市
          ETF（包括 VGT 与
          GRNY）仍纳入计算。股息按扣缴税后金额计入，回报则扣除交易费用与融资利息。账户出入金不属于此计算范围，结果并不代表整个证券账户的业绩。
        </p>
      </>
    ),
    snapshotCopy: (asOf: string) => (
      <p>每月更新。价格与市场价值以 {asOf} 的收盘价为准；休市日采用前一交易日收盘价，并非实时报价。</p>
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
                {isChinese ? " · 每月更新" : " · Updated Monthly"}
              </small>
            </>
          }
        />
        <dl className={appearance["performance-summary"]}>
          <PortfolioMetric
            tone="highlight"
            className=""
            label={<>{text.timeWeightedReturn}</>}
            value={<>{formatPercent(portfolioTwrSnapshot.portfolioTwr)}</>}
            note={<>{text.twrNote}</>}
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
          <PerformanceChart locale={locale} measure="xirr" />
        </section>
        <div className={appearance["section-gray"]}>
          <section className={appearance["methodology"] + " " + appearance["shell"]}>
            <h2>{text.methodology}</h2>
            <div className={appearance["methodology-content"]}>
              <div className={appearance["methodology-explanation"]}>{text.methodologyCopy}</div>
              <aside className={appearance["methodology-source"]}>
                <h3 className="mb-[var(--space-3)] text-[length:var(--font-size-compact-title)] leading-[var(--leading-compact-title)] font-bold tracking-[var(--tracking-heading)]">
                  {text.dataSources}
                </h3>
                {text.snapshotCopy(asOf)}
              </aside>
            </div>
          </section>
        </div>
      </main>
      <PageFooter locale={locale} />
    </div>
  );
}
