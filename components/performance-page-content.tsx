import { PerformanceChart } from "@/components/performance-chart";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { portfolioSnapshot } from "@/data/portfolio";
import { formatDate, formatPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

const copy = {
  en: {
    eyebrow: "Performance",
    title: <>A Monthly Record of<br /><em>Decisions and Results.</em></>,
    intro: "A complete monthly record of portfolio results, methodology, benchmarks, dividends, fees, and periods of underperformance.",
    cumulativeReturn: "Cumulative return",
    cumulativeNote: "Cost-basis return",
    portfolioXirr: "Portfolio XIRR",
    portfolioNote: "Cash-flow weighted",
    benchmarkNote: "Same investment dates",
    chart: "Performance Chart",
    measured: "Measured consistently.",
    methodology: "Methodology",
    methodologyCopy: <><p><strong>Cumulative return.</strong> (Stock market value + net dividends − financing interest − net cost basis) ÷ net cost basis. This is a cumulative, non-annualized return.</p><p><strong>XIRR.</strong> Money-weighted annualized return using dated investment cash flows and the ending stock market value. Each chart point shows the since-inception XIRR at that month-end, not the return for that month. Periods shorter than 30 days are not annualized.</p><p><strong>{portfolioSnapshot.benchmark} comparison.</strong> Uses the same investment dates and purchase costs with adjusted benchmark prices. It is a hypothetical comparison, not an actual benchmark holding.</p></>,
    snapshotCopy: (asOf: string) => <p>The verified data is synchronized to this site monthly. Prices and market values use closing prices as of {asOf} and are not live quotes. Valuations cover stock holdings only and exclude idle cash balances.</p>,
  },
  "zh-tw": {
    eyebrow: "績效",
    title: <>每月記錄<br /><em>決策與結果。</em></>,
    intro: "完整記錄每月投資組合結果、計算方法、基準、股息、費用與績效落後的時期。",
    cumulativeReturn: "累積報酬",
    cumulativeNote: "成本基礎報酬",
    portfolioXirr: "投資組合 XIRR",
    portfolioNote: "現金流加權",
    benchmarkNote: "相同投資日期",
    chart: "績效圖表",
    measured: "以一致方式衡量。",
    methodology: "計算方法",
    methodologyCopy: <><p><strong>累積報酬。</strong>（股票市場價值＋淨股息－融資利息－淨成本）÷ 淨成本，為未經年化的累積報酬。</p><p><strong>XIRR。</strong> 依投資現金流的實際日期與期末股票市場價值，計算資金加權年化報酬。圖表每個點代表該月底自成立以來的 XIRR，並非該月單月報酬；不足 30 天的期間不作年化。</p><p><strong>{portfolioSnapshot.benchmark} 比較。</strong> 使用相同投資日期、買入成本與基準的調整後價格計算，屬於假設性比較，並非實際持有基準的績效。</p></>,
    snapshotCopy: (asOf: string) => <p>已驗證快照每月同步至本網站。價格與市場價值均採用 {asOf} 收盤價，並非即時報價；估值僅涵蓋股票持倉，不包含閒置現金餘額。</p>,
  },
  "zh-cn": {
    eyebrow: "业绩",
    title: <>每月记录<br /><em>决策与结果。</em></>,
    intro: "完整记录每月投资组合结果、计算方法、基准、股息、费用与业绩落后的时期。",
    cumulativeReturn: "累计回报",
    cumulativeNote: "成本基础回报",
    portfolioXirr: "投资组合 XIRR",
    portfolioNote: "现金流加权",
    benchmarkNote: "相同投资日期",
    chart: "业绩图表",
    measured: "以一致方式衡量。",
    methodology: "计算方法",
    methodologyCopy: <><p><strong>累计回报。</strong>（股票市场价值＋净股息－融资利息－净成本）÷ 净成本，为未经年化的累计回报。</p><p><strong>XIRR。</strong> 根据投资现金流的实际日期与期末股票市场价值，计算资金加权年化回报。图表每个点代表该月底自成立以来的 XIRR，并非该月单月回报；不足 30 天的期间不作年化。</p><p><strong>{portfolioSnapshot.benchmark} 比较。</strong> 使用相同投资日期、买入成本与基准的调整后价格计算，属于假设性比较，并非实际持有基准的业绩。</p></>,
    snapshotCopy: (asOf: string) => <p>已验证快照每月同步至本网站。价格与市场价值均采用 {asOf} 收盘价，并非实时报价；估值仅涵盖股票持仓，不包含闲置现金余额。</p>,
  },
} as const;

export function PerformancePageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const isChinese = locale !== "en";
  const asOf = formatDate(portfolioSnapshot.asOf, locale, locale === "en");

  return <main className="performance-page" id="main-content"><SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
    <section className="page-hero shell"><p className="eyebrow"><span /> {text.eyebrow}</p><h1>{text.title}</h1><div className="page-intro"><p>{text.intro}</p><small className="date-text">{isChinese ? `截至 ${asOf} · 每月更新` : `As of ${asOf} · Updated monthly`}</small></div></section>
    <section className="performance-summary"><div className="summary-primary" data-tone="highlight"><span>{text.cumulativeReturn}</span><strong>{formatPercent(portfolioSnapshot.totalReturn)}</strong><small>{text.cumulativeNote}</small></div><div data-tone="brand"><span>{text.portfolioXirr}</span><strong>{formatPercent(portfolioSnapshot.xirr)}</strong><small>{text.portfolioNote}</small></div><div data-tone="paper"><span>{portfolioSnapshot.benchmark} XIRR</span><strong>{formatPercent(portfolioSnapshot.benchmarkXirr)}</strong><small>{text.benchmarkNote}</small></div></section>
    <section className="returns shell"><div className="section-heading"><p className="section-number">{text.chart}</p><h2>{text.measured}</h2></div>
      <PerformanceChart locale={locale} />
    </section>
    <section className="methodology shell section-gray"><h2>{text.methodology}</h2><div className="methodology-content"><div className="methodology-explanation">{text.methodologyCopy}</div><aside className="methodology-source">{text.snapshotCopy(asOf)}</aside></div></section><SiteFooter locale={locale} /></main>;
}
