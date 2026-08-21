import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { annualReturns } from "@/data/site";

export const metadata: Metadata = { title: "Performance", description: "Portfolio performance, benchmark comparison, and methodology." };

export default function PerformancePage() {
  return <main><SiteHeader counterpartPath="/zh-tw/performance" />
    <section className="page-hero shell"><p className="eyebrow"><span /> Performance · Sample data</p><h1>The score,<br /><em>with context.</em></h1></section>
    <section className="performance-summary shell"><div className="summary-primary"><span>Cumulative return</span><strong className="positive">+18.6%</strong><small>Since inception</small></div><div><span>Benchmark</span><strong className="positive">+12.4%</strong><small>Same period</small></div><div><span>Max drawdown</span><strong className="negative">−11.2%</strong><small>Peak to trough</small></div></section>
    <section className="returns shell"><div className="section-heading"><p className="section-number">Annual returns</p><h2>Year by year.</h2></div>
      <div className="returns-table"><div className="table-head"><span>Year</span><span>Portfolio</span><span>Benchmark</span></div>{annualReturns.map((r) => <div className="return-row" key={r.year}><span>{r.year}</span><strong className={r.portfolio < 0 ? "negative" : "positive"}>{r.portfolio > 0 ? "+" : ""}{r.portfolio}%</strong><span className={r.benchmark < 0 ? "negative" : "positive"}>{r.benchmark > 0 ? "+" : ""}{r.benchmark}%</span></div>)}</div>
    </section>
    <section className="methodology shell"><h2>Methodology</h2><div><p>Returns are presented in USD and assume dividends are reinvested. Fees, cash flows, and benchmark treatment will be documented before launch.</p><p>Past performance does not guarantee future results. These initial figures are illustrative placeholders.</p></div></section><SiteFooter /></main>;
}
