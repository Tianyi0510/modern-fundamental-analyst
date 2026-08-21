import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { holdings } from "@/data/site";

export const metadata: Metadata = { title: "Portfolio", description: "Current portfolio allocation and position-level investment rationale." };

export default function PortfolioPage() {
  return <main><SiteHeader counterpartPath="/zh-tw/portfolio" />
    <section className="page-hero shell"><p className="eyebrow"><span /> Portfolio · Sample data</p><h1>Concentrated.<br /><em>Intentional.</em></h1><div className="page-intro"><p>A snapshot of current exposure, the role of each position, and the level of liquidity held for future opportunities.</p><small>As of 30 June 2026</small></div></section>
    <section className="portfolio-total shell"><div><span>Invested</span><strong>64.2%</strong></div><div className="stacked-bar">{holdings.map((h) => <i className={`segment segment-${h.color}`} style={{ width: `${h.weight}%` }} key={h.name} />)}</div></section>
    <section className="portfolio-table shell">
      <div className="table-head"><span>Allocation</span><span>Role in portfolio</span><span>Weight</span></div>
      {holdings.map((holding, index) => <div className="portfolio-row" key={holding.name}><span>{String(index + 1).padStart(2,"0")} · {holding.name}</span><span>{holding.thesis}</span><strong>{holding.weight.toFixed(1)}%</strong></div>)}
    </section>
    <p className="data-note shell">All figures on this initial version are illustrative placeholders and will be replaced by verified portfolio data.</p><SiteFooter /></main>;
}
