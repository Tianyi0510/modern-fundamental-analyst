import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memos } from "@/data/site";
import { getHoldingWeight, portfolioHoldings, portfolioSnapshot } from "@/data/portfolio";
import { formatDate, formatPercent, formatUsd } from "@/lib/format";

const featuredHoldings = portfolioHoldings.toSorted((a, b) => b.marketValue - a.marketValue).slice(0, 4);
const portfolioDate = formatDate(portfolioSnapshot.asOf, "en");
const compactPortfolioDate = formatDate(portfolioSnapshot.asOf, "en", true);

export default function Home() {
  return (
    <main className="home-page">
      <SiteHeader counterpartPath="/zh-tw" />

      <section className="hero shell">
        <p className="eyebrow"><span /> David&apos;s Independent Public-Equity Research</p>
        <h1>Focus Investing for a<br /><em>Disruptive Future.</em></h1>
        <div className="hero-bottom">
          <p>
            Long-term value research, financial modeling, and a fully disclosed portfolio built to empower every retail investor.
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
          <strong>{formatPercent(portfolioSnapshot.totalReturn)}</strong>
          <small>Cumulative cost-basis return</small>
        </div>
        <div className="metric">
          <span>Market value</span>
          <strong>{formatUsd(portfolioSnapshot.marketValue, 0)}</strong>
          <small>{portfolioSnapshot.holdingsCount} stocks and ETFs</small>
        </div>
        <div className="metric metric-accent">
          <span>Portfolio XIRR</span>
          <strong>{formatPercent(portfolioSnapshot.xirr)}</strong>
          <small className="date-text">As of {compactPortfolioDate} · Updated monthly</small>
        </div>
      </section>

      <section className="home-about shell">
        <div><p className="section-number">01 About</p><h2>My Investment Beliefs and<br />Commitment to Learning</h2></div>
        <div><p>I believe in focus investing, long-term value investing, and the coming waves of AI and other disruptive technologies. I value accounting as the language of business and use financial modeling to connect business fundamentals with valuation. I also promote a “learn-it-all” growth mindset based on curiosity, empathy, and continuous learning.</p><Link className="text-link" href="/about">About the process →</Link></div>
      </section>

      <section className="intro shell">
        <p className="section-number">02 Portfolio</p>
        <h2>A Focus Portfolio Built<br />for Long-Term Ownership</h2>
        <Link className="round-link" href="/portfolio" aria-label="View portfolio"><span className="arrow-icon" aria-hidden="true">↗︎</span></Link>
      </section>

      <section className="holdings-preview shell">
        <div className="holdings-list">
          {featuredHoldings.map((holding, index) => (
            <div className="holding-row" key={holding.symbol}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{holding.symbol}</strong><small>{formatUsd(holding.marketValue, 0)} market value</small></div>
              <b>{getHoldingWeight(holding.marketValue).toFixed(1)}%</b>
            </div>
          ))}
        </div>
        <aside className="allocation-card">
          <span>Portfolio return</span>
          <div className="allocation-ring" aria-label={`${portfolioSnapshot.totalReturn.toFixed(1)} percent cumulative return`}><b>{formatPercent(portfolioSnapshot.totalReturn, 1)}</b><small>total return</small></div>
          <Link href="/portfolio">Full portfolio →</Link>
        </aside>
      </section>

      <section className="performance-home">
        <div className="shell">
          <div className="section-heading inverse">
            <p className="section-number">03 Performance</p>
            <h2>Monthly Results Disclosed<br />with Complete Transparency</h2>
          </div>
          <div className="performance-grid">
            <div className="performance-bars" aria-label="XIRR comparison chart">
              <div className="year-bar"><div className="bar-value" style={{ height: `${portfolioSnapshot.xirr * 8}px` }}><span>{formatPercent(portfolioSnapshot.xirr)}</span></div><small>Portfolio</small></div>
              <div className="year-bar"><div className="bar-value" style={{ height: `${portfolioSnapshot.benchmarkXirr * 8}px` }}><span>{formatPercent(portfolioSnapshot.benchmarkXirr)}</span></div><small>{portfolioSnapshot.benchmark}</small></div>
            </div>
            <div className="performance-copy">
              <strong>{formatPercent(portfolioSnapshot.xirr)}</strong>
              <p>Portfolio XIRR, versus {formatPercent(portfolioSnapshot.benchmarkXirr)} for {portfolioSnapshot.benchmark} over the same cash-flow period.</p>
              <small className="date-text">Verified snapshot as of {portfolioDate} · Updated monthly.</small>
              <Link className="button button-white" href="/performance">View performance <span className="arrow-icon" aria-hidden="true">↗︎</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="memos-home shell">
        <div className="section-heading">
          <p className="section-number">04 Investment Memos</p>
          <h2>Detailed Investment Theses<br />Behind Every Position</h2>
        </div>
        <div className="memo-grid">
          {memos.map((memo, index) => (
            <Link className={`memo-card memo-card-${index + 1}`} href={`/memos/${memo.slug}`} key={memo.slug}>
              <div><span>{memo.number}</span><span>{memo.tag}</span></div>
              <h3>{memo.title}</h3>
              <p>{memo.summary}</p>
              <small className="date-text">{formatDate(memo.publishedAt, "en", true)} · {memo.readTime}</small>
            </Link>
          ))}
        </div>
        <Link className="text-link memos-all" href="/memos">View all Investment Memos →</Link>
      </section>

      <section className="cta shell">
        <p className="eyebrow"><span /> 05 Contact</p>
        <h2>Stay Connected with<br />My Latest Research</h2>
        <Link className="button button-dark" href="/contact">Get in touch <span className="arrow-icon" aria-hidden="true">↗︎</span></Link>
      </section>
      <SiteFooter />
    </main>
  );
}
