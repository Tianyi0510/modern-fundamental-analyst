import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { annualReturns, holdings, memos } from "@/data/site";

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="hero shell">
        <p className="eyebrow"><span /> Independent public-equity research</p>
        <h1>Ideas compound.<br /><em>Capital follows.</em></h1>
        <div className="hero-bottom">
          <p>
            A transparent record of concentrated investments, long-term
            performance, and the thinking behind every decision.
          </p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/portfolio">View portfolio <span>↗</span></Link>
            <Link className="text-link" href="/memos">Read latest memo →</Link>
          </div>
        </div>
      </section>

      <section className="metric-band shell" aria-label="Portfolio snapshot">
        <div className="metric metric-featured">
          <span>Since inception</span>
          <strong>+18.6%</strong>
          <small>Illustrative data</small>
        </div>
        <div className="metric">
          <span>Invested</span>
          <strong>64.2%</strong>
          <small>6 positions</small>
        </div>
        <div className="metric metric-green">
          <span>Cash</span>
          <strong>35.8%</strong>
          <small>As of Jun 2026</small>
        </div>
      </section>

      <section className="intro shell">
        <p className="section-number">01 / Portfolio</p>
        <h2>Concentrated by design.<br />Patient by default.</h2>
        <Link className="round-link" href="/portfolio" aria-label="View portfolio">↗</Link>
      </section>

      <section className="holdings-preview shell">
        <div className="holdings-list">
          {holdings.slice(0, 4).map((holding, index) => (
            <div className="holding-row" key={holding.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{holding.name}</strong><small>{holding.thesis}</small></div>
              <b>{holding.weight.toFixed(1)}%</b>
            </div>
          ))}
        </div>
        <aside className="allocation-card">
          <span>Portfolio allocation</span>
          <div className="allocation-ring" aria-label="64.2 percent invested"><b>64.2%</b><small>invested</small></div>
          <Link href="/portfolio">Full portfolio →</Link>
        </aside>
      </section>

      <section className="performance-home">
        <div className="shell">
          <div className="section-heading inverse">
            <p className="section-number">02 / Performance</p>
            <h2>A record built<br />one decision at a time.</h2>
          </div>
          <div className="performance-grid">
            <div className="performance-bars" aria-label="Annual performance chart">
              {annualReturns.slice(1).map((item) => (
                <div className="year-bar" key={item.year}>
                  <div className="bar-value" style={{ height: `${Math.max(item.portfolio * 5, 36)}px` }}><span>{item.portfolio}%</span></div>
                  <small>{item.year}</small>
                </div>
              ))}
            </div>
            <div className="performance-copy">
              <strong>+18.6%</strong>
              <p>Cumulative return since inception, versus +12.4% for the benchmark.</p>
              <small>Illustrative data for design preview.</small>
              <Link className="button button-white" href="/performance">View performance <span>↗</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="memos-home shell">
        <div className="section-heading">
          <p className="section-number">03 / Investment memos</p>
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
        <Link className="text-link memos-all" href="/memos">View all memos →</Link>
      </section>

      <section className="cta shell">
        <p className="eyebrow"><span /> Latest update</p>
        <h2>Follow the process,<br />not the noise.</h2>
        <Link className="button button-dark" href="/contact">Get in touch <span>↗</span></Link>
      </section>
      <SiteFooter />
    </main>
  );
}
