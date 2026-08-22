import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { portfolioSnapshot } from "@/data/portfolio";

export const metadata: Metadata = { title: "Performance", description: "Portfolio performance, benchmark comparison, and methodology." };

export default function PerformancePage() {
  return <main className="performance-page"><SiteHeader counterpartPath="/zh-tw/performance" />
    <section className="page-hero shell"><p className="eyebrow"><span /> Performance · Verified snapshot</p><h1>The score,<br /><em>with context.</em></h1><div className="page-intro"><p>Portfolio results alongside a comparable benchmark, based on the same cash-flow period.</p><small>As of 31 July 2026 · Updated monthly</small></div></section>
    <section className="performance-summary shell"><div className="summary-primary"><span>Cumulative return</span><strong className="data-value positive">+{portfolioSnapshot.totalReturn.toFixed(2)}%</strong><small>Cost-basis return</small></div><div><span>Portfolio XIRR</span><strong className="data-value positive">+{portfolioSnapshot.xirr.toFixed(2)}%</strong><small>Cash-flow weighted</small></div><div><span>{portfolioSnapshot.benchmark} XIRR</span><strong className="data-value positive">+{portfolioSnapshot.benchmarkXirr.toFixed(2)}%</strong><small>Same cash-flow period</small></div></section>
    <section className="returns shell"><div className="section-heading"><p className="section-number">Performance snapshot</p><h2>Measured consistently.</h2></div>
      <div className="returns-table"><div className="table-head"><span>Measure</span><span>Result</span><span>Context</span></div><div className="return-row"><span>Cumulative return</span><strong className="data-value positive">+{portfolioSnapshot.totalReturn.toFixed(2)}%</strong><span>Market value versus net cost basis</span></div><div className="return-row"><span>Portfolio XIRR</span><strong className="data-value positive">+{portfolioSnapshot.xirr.toFixed(2)}%</strong><span>Money-weighted annualized return</span></div><div className="return-row"><span>{portfolioSnapshot.benchmark} XIRR</span><strong className="data-value positive">+{portfolioSnapshot.benchmarkXirr.toFixed(2)}%</strong><span>Benchmark using matching cash flows</span></div></div>
    </section>
    <section className="methodology shell"><h2>Methodology</h2><div><p>Results are presented in USD. Cumulative return compares current market value with net cost basis. XIRR reflects the timing and amount of portfolio cash flows; the {portfolioSnapshot.benchmark} comparison applies those same cash flows to the benchmark.</p><p>Source: Google Sheets “{portfolioSnapshot.source}”. Data is updated monthly and is not based on live market prices. Past performance does not guarantee future results.</p></div></section><SiteFooter /></main>;
}
