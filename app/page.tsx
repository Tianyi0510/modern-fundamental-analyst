import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memos } from "@/data/site";
import { getHoldingWeight, portfolioHoldings, portfolioSnapshot } from "@/data/portfolio";

const featuredHoldings = portfolioHoldings.toSorted((a, b) => b.marketValue - a.marketValue).slice(0, 4);
const formatUsd = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function Home() {
  return (
    <main className="home-page">
      <SiteHeader counterpartPath="/zh-tw" />

      <section className="hero shell">
        <p className="eyebrow"><span /> Tianyi (David) Li · Independent Public-Equity Research</p>
        <h1>Ideas compound.<br /><em>Capital follows.</em></h1>
        <div className="hero-bottom">
          <p>
            Fundamental investing, data analysis, and macroeconomic context—documented through a transparent portfolio, performance record, and investment memos.
          </p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/portfolio">View portfolio <span className="arrow-icon" aria-hidden="true">↗︎</span></Link>
            <Link className="text-link" href="/memos">Read latest Investment Memo →</Link>
          </div>
        </div>
      </section>

      <section className="metric-band shell" aria-label="Portfolio snapshot">
        <div className="metric metric-featured">
          <span>Total return</span>
          <strong>+{portfolioSnapshot.totalReturn.toFixed(2)}%</strong>
          <small>Cumulative cost-basis return</small>
        </div>
        <div className="metric">
          <span>Market value</span>
          <strong>{formatUsd(portfolioSnapshot.marketValue)}</strong>
          <small>{portfolioSnapshot.holdingsCount} stocks and ETFs</small>
        </div>
        <div className="metric metric-green">
          <span>Portfolio XIRR</span>
          <strong>+{portfolioSnapshot.xirr.toFixed(2)}%</strong>
          <small>As of 31 Jul 2026 · Updated monthly</small>
        </div>
      </section>

      <section className="home-about shell">
        <div><p className="section-number">01 About</p><h2>Modern fundamentals,<br />documented in public.</h2></div>
        <div><p>I believe in the power of focus investing and long-term value investing—and in the coming waves of AI and other disruptive technologies. Every idea must still be grounded in business quality, long-term value, valuation, and risk.</p><Link className="text-link" href="/about">About the process →</Link></div>
      </section>

      <section className="intro shell">
        <p className="section-number">02 Portfolio</p>
        <h2>Concentrated by design.<br />Patient by default.</h2>
        <Link className="round-link" href="/portfolio" aria-label="View portfolio"><span className="arrow-icon" aria-hidden="true">↗︎</span></Link>
      </section>

      <section className="holdings-preview shell">
        <div className="holdings-list">
          {featuredHoldings.map((holding, index) => (
            <div className="holding-row" key={holding.symbol}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{holding.symbol}</strong><small>{formatUsd(holding.marketValue)} market value</small></div>
              <b>{getHoldingWeight(holding.marketValue).toFixed(1)}%</b>
            </div>
          ))}
        </div>
        <aside className="allocation-card">
          <span>Portfolio return</span>
          <div className="allocation-ring" aria-label="22 percent cumulative return"><b>22.0%</b><small>total return</small></div>
          <Link href="/portfolio">Full portfolio →</Link>
        </aside>
      </section>

      <section className="performance-home">
        <div className="shell">
          <div className="section-heading inverse">
            <p className="section-number">03 Performance</p>
            <h2>A record built<br />one decision at a time.</h2>
          </div>
          <div className="performance-grid">
            <div className="performance-bars" aria-label="XIRR comparison chart">
              <div className="year-bar"><div className="bar-value" style={{ height: `${portfolioSnapshot.xirr * 8}px` }}><span>{portfolioSnapshot.xirr}%</span></div><small>Portfolio</small></div>
              <div className="year-bar"><div className="bar-value" style={{ height: `${portfolioSnapshot.benchmarkXirr * 8}px` }}><span>{portfolioSnapshot.benchmarkXirr}%</span></div><small>{portfolioSnapshot.benchmark}</small></div>
            </div>
            <div className="performance-copy">
              <strong>+{portfolioSnapshot.xirr.toFixed(2)}%</strong>
              <p>Portfolio XIRR, versus +{portfolioSnapshot.benchmarkXirr.toFixed(2)}% for {portfolioSnapshot.benchmark} over the same cash-flow period.</p>
              <small>Verified snapshot as of 31 July 2026 · Updated monthly.</small>
              <Link className="button button-white" href="/performance">View performance <span className="arrow-icon" aria-hidden="true">↗︎</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="memos-home shell">
        <div className="section-heading">
          <p className="section-number">04 Investment Memos</p>
          <h2>Thinking,<br />made visible.</h2>
        </div>
        <div className="memo-grid">
          {memos.map((memo, index) => (
            <Link className={`memo-card memo-card-${index + 1}`} href={`/memos/${memo.slug}`} key={memo.slug}>
              <div><span>{memo.number}</span><span>{memo.tag}</span></div>
              <h3>{memo.title}</h3>
              <p>{memo.summary}</p>
              <small>{memo.date} · {memo.readTime}</small>
            </Link>
          ))}
        </div>
        <Link className="text-link memos-all" href="/memos">View all Investment Memos →</Link>
      </section>

      <section className="cta shell">
        <p className="eyebrow"><span /> 05 Contact</p>
        <h2>Follow the process,<br />not the noise.</h2>
        <Link className="button button-dark" href="/contact">Get in touch <span className="arrow-icon" aria-hidden="true">↗︎</span></Link>
      </section>
      <SiteFooter />
    </main>
  );
}
