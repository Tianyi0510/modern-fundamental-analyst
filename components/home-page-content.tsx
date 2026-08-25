import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { homeCopy } from "@/data/home-copy";
import { getMemos } from "@/data/memos";
import { getHoldingWeight, portfolioHoldings, portfolioSnapshot } from "@/data/portfolio";
import { formatDate, formatPercent, formatUsd } from "@/lib/format";
import { localeConfig, type Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

const featuredHoldings = portfolioHoldings.toSorted((a, b) => b.marketValue - a.marketValue).slice(0, 4);
const featuredWeights = featuredHoldings.map((holding) => getHoldingWeight(holding.marketValue));
const otherWeight = 100 - featuredWeights.reduce((total, weight) => total + weight, 0);
const allocationStops = [...featuredWeights, otherWeight].reduce<number[]>((stops, weight) => {
  stops.push((stops.at(-1) ?? 0) + weight);
  return stops;
}, []);
const [firstStop = 0, secondStop = firstStop, thirdStop = secondStop, fourthStop = thirdStop] = allocationStops;
const allocationGradient = `conic-gradient(var(--deep-blue) 0 ${firstStop}%, var(--medium-blue) ${firstStop}% ${secondStop}%, var(--black) ${secondStop}% ${thirdStop}%, var(--white) ${thirdStop}% ${fourthStop}%, var(--gray) ${fourthStop}% 100%)`;

export function HomePageContent({ locale }: { locale: Locale }) {
  const text = homeCopy[locale];
  const prefix = localeConfig[locale].prefix;
  const memos = getMemos(locale);
  const portfolioDate = formatDate(portfolioSnapshot.asOf, locale);
  const compactPortfolioDate = formatDate(portfolioSnapshot.asOf, locale, locale === "en");
  const benchmarkReturn = formatPercent(portfolioSnapshot.benchmarkXirr);

  return (
    <main className="home-page" id="main-content">
      <div className="home-opening">
        <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
        <section className="hero shell">
          <p className="eyebrow"><span /> {text.researchLabel}</p>
          <h1>{text.hero[0]}<br /><em>{text.hero[1]}</em></h1>
          <div className="hero-bottom">
            <p>{text.heroIntro}</p>
            <div className="hero-actions">
              <Link className="button button-dark" href={`${prefix}/portfolio`}>
                {text.viewPortfolio}
              </Link>
              <Link className="text-link" href={`${prefix}/memos`}>{text.readLatest} <span className="arrow-icon" aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>
        <section className="metric-band shell" aria-label={text.portfolioSnapshot}>
          <div className="metric metric-featured">
            <span>{text.totalReturn}</span>
            <strong>{formatPercent(portfolioSnapshot.totalReturn)}</strong>
            <small>{text.cumulativeReturn}</small>
          </div>
          <div className="metric">
            <span>{text.marketValue}</span>
            <strong>{formatUsd(portfolioSnapshot.marketValue, 0)}</strong>
            <small>{portfolioSnapshot.holdingsCount} {text.holdingsUnit}</small>
          </div>
          <div className="metric metric-accent">
            <span>{text.portfolioXirr}</span>
            <strong>{formatPercent(portfolioSnapshot.xirr)}</strong>
            <small className="date-text">{text.asOf} {compactPortfolioDate} · {text.updatedMonthly}</small>
          </div>
        </section>
      </div>

      <section className="home-about shell">
        <div>
          <p className="section-number">{text.aboutLabel}</p>
          <h2>{text.aboutTitle[0]}<br />{text.aboutTitle[1]}</h2>
        </div>
        <div>
          <p>{text.aboutCopy}</p>
          <Link className="text-link" href={`${prefix}/about`}>{text.aboutLink} <span className="arrow-icon" aria-hidden="true">→</span></Link>
        </div>
      </section>

      <div className="home-portfolio-section">
        <section className="intro shell">
          <p className="section-number">{text.portfolioLabel}</p>
          <h2>{text.portfolioTitle[0]}<br />{text.portfolioTitle[1]}</h2>
          <Link className="round-link" href={`${prefix}/portfolio`} aria-label={text.viewPortfolio}>
            <ArrowUpRight className="arrow-icon round-link-arrow" aria-hidden="true" strokeWidth={3} />
          </Link>
        </section>
        <section className="holdings-preview shell">
          <div className="holdings-list">
            {featuredHoldings.map((holding, index) => (
              <div className="holding-row" key={holding.symbol}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{holding.symbol}</strong>
                  <small>{formatUsd(holding.marketValue, 0)} {text.marketValueSuffix}</small>
                </div>
                <b>{getHoldingWeight(holding.marketValue).toFixed(1)}%</b>
              </div>
            ))}
          </div>
          <aside className="allocation-card">
            <span>{text.holdingsAllocation}</span>
            <div className="allocation-visual">
              <div className="allocation-ring" style={{ background: allocationGradient }} role="img" aria-label={text.topHoldings}>
                <span>{portfolioSnapshot.holdingsCount}</span>
                <small>{text.holdingsAllocation}</small>
              </div>
              <ul className="allocation-legend">
                {featuredHoldings.map((holding) => (
                  <li key={holding.symbol}>
                    <i aria-hidden="true" />
                    <span>{holding.symbol}</span>
                    <b>{getHoldingWeight(holding.marketValue).toFixed(1)}%</b>
                  </li>
                ))}
                <li><i aria-hidden="true" /><span>{text.other}</span><b>{otherWeight.toFixed(1)}%</b></li>
              </ul>
            </div>
            <Link href={`${prefix}/portfolio`}>
              <span className="link-label">{text.fullPortfolio}</span>{" "}
              <span className="arrow-icon" aria-hidden="true">→</span>
            </Link>
          </aside>
        </section>
      </div>

      <section className="performance-home">
        <div className="shell">
          <div className="section-heading inverse">
            <p className="section-number">{text.performanceLabel}</p>
            <h2>{text.performanceTitle[0]}<br />{text.performanceTitle[1]}</h2>
          </div>
          <div className="performance-grid">
            <div className="performance-bars" aria-label={text.chartLabel}>
              <div className="year-bar">
                <div className="bar-value" style={{ height: `${portfolioSnapshot.xirr * 8}px` }}>
                  <span>{formatPercent(portfolioSnapshot.xirr)}</span>
                </div>
                <small>{text.portfolioName}</small>
              </div>
              <div className="year-bar">
                <div className="bar-value" style={{ height: `${portfolioSnapshot.benchmarkXirr * 8}px` }}>
                  <span>{benchmarkReturn}</span>
                </div>
                <small>{portfolioSnapshot.benchmark}</small>
              </div>
            </div>
            <div className="performance-copy">
              <strong>{formatPercent(portfolioSnapshot.xirr)}</strong>
              <p>{text.performanceCopy(benchmarkReturn)}</p>
              <small className="date-text">
                {text.verified} {portfolioDate}{locale === "en" ? "" : locale === "zh-tw" ? " 的已驗證快照" : " 的已验证快照"} · {text.updatedMonthly}{locale === "en" ? "." : "。"}
              </small>
              <Link className="button button-white" href={`${prefix}/performance`}>
                {text.viewPerformance}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="memos-home shell">
        <div className="section-heading">
          <p className="section-number">{text.memosLabel}</p>
          <h2>{text.memosTitle[0]}<br />{text.memosTitle[1]}</h2>
        </div>
        <div className="memo-grid">
          {memos.slice(0, 3).map((memo, index) => (
            <Link className={`memo-card memo-card-${index + 1}`} href={`${prefix}/memos/${memo.slug}`} key={memo.slug}>
              <div><span>{memo.number}</span><span>{memo.tag}</span></div>
              <h3>{memo.title}</h3>
              <p>{memo.summary}</p>
              <small className="date-text">{formatDate(memo.publishedAt, locale, locale === "en")} · {memo.readTime}</small>
            </Link>
          ))}
        </div>
        <Link className="text-link memos-all" href={`${prefix}/memos`}>{text.viewAllMemos} <span className="arrow-icon" aria-hidden="true">→</span></Link>
      </section>

      <section className="cta shell">
        <p className="eyebrow"><span /> {text.contactLabel}</p>
        <h2>{text.contactTitle[0]}<br />{text.contactTitle[1]}</h2>
        <Link className="button button-dark" href={`${prefix}/contact`}>
          {text.contactLink}
        </Link>
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}
