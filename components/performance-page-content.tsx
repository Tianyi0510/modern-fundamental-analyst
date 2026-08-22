import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { portfolioSnapshot } from "@/data/portfolio";
import { formatDate, formatPercent } from "@/lib/format";

type Locale = "en" | "zh-tw";

const copy = {
  en: {
    eyebrow: "Performance",
    title: <>A Monthly Record of<br /><em>Decisions and Results.</em></>,
    intro: "A complete monthly record of portfolio results, methodology, benchmarks, dividends, fees, and periods of underperformance.",
    cumulativeReturn: "Cumulative return",
    cumulativeNote: "Cost-basis return",
    portfolioXirr: "Portfolio XIRR",
    portfolioNote: "Cash-flow weighted",
    benchmarkNote: "Same cash-flow period",
    snapshot: "Performance snapshot",
    measured: "Measured consistently.",
    measure: "Measure",
    result: "Result",
    context: "Context",
    cumulativeContext: "Market value versus net cost basis",
    portfolioContext: "Money-weighted annualized return",
    benchmarkContext: "Benchmark using matching cash flows",
    methodology: "Methodology",
    methodologyCopy: <>Results are presented in USD. Cumulative return compares current market value with net cost basis. XIRR reflects the timing and amount of portfolio cash flows; the {portfolioSnapshot.benchmark} comparison applies those same cash flows to the benchmark.</>,
    sourceCopy: <>Source: Google Sheets “{portfolioSnapshot.source}”. The verified snapshot is synchronized to this site monthly and is not based on live market prices. Past performance does not guarantee future results.</>,
  },
  "zh-tw": {
    eyebrow: "績效",
    title: <>每月記錄<br /><em>決策與結果。</em></>,
    intro: "完整記錄每月投資組合結果、計算方法、基準、股息、費用與績效落後的時期。",
    cumulativeReturn: "累積報酬",
    cumulativeNote: "成本基礎報酬",
    portfolioXirr: "投資組合 XIRR",
    portfolioNote: "現金流加權",
    benchmarkNote: "相同現金流期間",
    snapshot: "績效快照",
    measured: "以一致方式衡量。",
    measure: "衡量項目",
    result: "結果",
    context: "說明",
    cumulativeContext: "市場價值相對淨成本基礎",
    portfolioContext: "資金加權年化報酬",
    benchmarkContext: "使用相同現金流計算的基準",
    methodology: "計算方法",
    methodologyCopy: <>績效以美元呈現。累積報酬比較目前市場價值與淨成本基礎；XIRR 反映投資組合現金流的時間與金額，{portfolioSnapshot.benchmark} 比較則將相同現金流套用至基準。</>,
    sourceCopy: <>資料來源：Google Sheets「{portfolioSnapshot.source}」。已驗證快照每月同步至本網站，並非依據即時市場價格。過往績效不代表未來結果。</>,
  },
} as const;

export function PerformancePageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const isChinese = locale === "zh-tw";
  const asOf = formatDate(portfolioSnapshot.asOf, locale);

  return <main className="performance-page"><SiteHeader locale={locale} counterpartPath={isChinese ? "/performance" : "/zh-tw/performance"} />
    <section className="page-hero shell"><p className="eyebrow"><span /> {text.eyebrow}</p><h1>{text.title}</h1><div className="page-intro"><p>{text.intro}</p><small className="date-text">{isChinese ? `截至 ${asOf} · 每月更新` : `As of ${asOf} · Updated monthly`}</small></div></section>
    <section className="performance-summary shell"><div className="summary-primary"><span>{text.cumulativeReturn}</span><strong>{formatPercent(portfolioSnapshot.totalReturn)}</strong><small>{text.cumulativeNote}</small></div><div><span>{text.portfolioXirr}</span><strong>{formatPercent(portfolioSnapshot.xirr)}</strong><small>{text.portfolioNote}</small></div><div><span>{portfolioSnapshot.benchmark} XIRR</span><strong>{formatPercent(portfolioSnapshot.benchmarkXirr)}</strong><small>{text.benchmarkNote}</small></div></section>
    <section className="returns shell"><div className="section-heading"><p className="section-number">{text.snapshot}</p><h2>{text.measured}</h2></div>
      <div className="returns-table"><div className="table-head"><span>{text.measure}</span><span>{text.result}</span><span>{text.context}</span></div><div className="return-row"><span>{text.cumulativeReturn}</span><strong>{formatPercent(portfolioSnapshot.totalReturn)}</strong><span>{text.cumulativeContext}</span></div><div className="return-row"><span>{text.portfolioXirr}</span><strong>{formatPercent(portfolioSnapshot.xirr)}</strong><span>{text.portfolioContext}</span></div><div className="return-row"><span>{portfolioSnapshot.benchmark} XIRR</span><strong>{formatPercent(portfolioSnapshot.benchmarkXirr)}</strong><span>{text.benchmarkContext}</span></div></div>
    </section>
    <section className="methodology shell"><h2>{text.methodology}</h2><div><p>{text.methodologyCopy}</p><p>{text.sourceCopy}</p></div></section><SiteFooter locale={locale} /></main>;
}
