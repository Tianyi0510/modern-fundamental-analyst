import type { Metadata } from "next";
import { PortfolioTable } from "@/components/portfolio-table";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHoldingWeight, portfolioHoldings, portfolioSnapshot } from "@/data/portfolio";

export const metadata: Metadata = { title: "Portfolio", description: "Current portfolio allocation and position-level investment rationale." };

export default function PortfolioPage() {
  return <main className="portfolio-page"><SiteHeader counterpartPath="/zh-tw/portfolio" />
    <section className="page-hero shell"><p className="eyebrow"><span /> Portfolio · Verified snapshot</p><h1>Concentrated.<br /><em>Intentional.</em></h1><div className="page-intro"><p>Current public-equity positions, market values, position-level returns, and portfolio weights.</p><small>As of 31 July 2026 · Updated monthly</small></div></section>
    <section className="portfolio-kpis shell" aria-label="Portfolio summary">
      <div><span>Stock market value</span><strong>{formatUsd(portfolioSnapshot.marketValue)}</strong><small>USD</small></div>
      <div><span>Net cost basis</span><strong>{formatUsd(portfolioSnapshot.costBasis)}</strong><small>Purchases and transaction fees</small></div>
      <div><span>Total return</span><strong>+{portfolioSnapshot.totalReturn.toFixed(2)}%</strong><small>Cumulative cost-basis return</small></div>
      <div><span>Holdings</span><strong>{portfolioSnapshot.holdingsCount}</strong><small>Stocks and ETFs</small></div>
    </section>
    <section className="portfolio-allocation shell"><div><span>Allocation by market value</span><small>100% of disclosed stock holdings</small></div><div className="stacked-bar" aria-label="Portfolio allocation by market value">{portfolioHoldings.map((holding, index) => <i className={`segment segment-${segmentColors[index % segmentColors.length]}`} style={{ width: `${getHoldingWeight(holding.marketValue)}%` }} key={holding.symbol} title={`${holding.symbol} ${getHoldingWeight(holding.marketValue).toFixed(1)}%`} />)}</div></section>
    <section className="portfolio-holdings-heading shell">
      <div><span>Current holdings</span><h2>{portfolioSnapshot.holdingsCount} disclosed positions.</h2></div>
      <p>Click any column heading to sort. Prices and market values use closing prices as of 31 July 2026.</p>
    </section>
    <section className="portfolio-table-wrap shell">
      <PortfolioTable holdings={portfolioHoldings} />
    </section>
    <p className="data-note portfolio-source-note shell">Source: Google Sheets “{portfolioSnapshot.source}”. Prices and market values use closing prices as of 31 July 2026 and are not live quotes. Cash and external funding are excluded.</p><SiteFooter /></main>;
}

const segmentColors = ["blue", "deep", "light", "green", "red", "black"] as const;
const formatUsd = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value);
