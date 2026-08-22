import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "About",
  description: "Tianyi (David) Li's background, investment approach, and principles behind Modern Fundamental Analyst.",
};

const investmentFocus = [
  "Business model and sources of revenue",
  "Competitive advantages and industry structure",
  "Financial quality and balance-sheet resilience",
  "Management and capital allocation",
  "Long-term growth drivers",
  "Valuation and expected return",
  "Downside risk and potential thesis failure",
  "Relevant macroeconomic or regulatory developments",
];

const disclosureFocus = [
  "Portfolio holdings and position weights",
  "Performance against an appropriate benchmark",
  "Cash-flow and return-calculation methodology",
  "Dividends, fees, and other relevant costs",
  "Material assumptions and data limitations",
  "Changes to, and failures of, an investment thesis",
];

export default function AboutPage() {
  return <main className="about-page"><SiteHeader counterpartPath="/zh-tw/about" />
    <section className="page-hero shell">
      <p className="eyebrow"><span /> About</p>
      <h1>Learning in public.<br /><em>Investing with evidence.</em></h1>
      <div className="page-intro"><p>I am Tianyi (David) Li—an investor and incoming Rutgers University–New Brunswick Honors College student.</p><small>Finance · BAIT · Philosophy</small></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>01 · Introduction</span><h2>Modern Fundamental Analyst documents the process.</h2></div>
      <div className="about-copy"><p>I intend to study Finance and Business Analytics and Information Technology, alongside Philosophy. My interests sit at the intersection of fundamental investing, data analysis, and macroeconomics.</p><p>I am particularly interested in how business quality, industry structure, capital allocation, valuation, and broader economic change interact to determine long-term investment outcomes.</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>02 · Why modern fundamental analysis?</span><h2>Traditional foundations. A changing environment.</h2></div>
      <div className="about-copy"><p>Fundamental analysis remains the foundation of my approach: understand the business, examine its financial position, assess management&apos;s allocation of capital, and compare intrinsic value with the market price.</p><p>But businesses are increasingly shaped by technology, global capital flows, geopolitical fragmentation, and large-scale economic transitions. Modern fundamental analysis should combine traditional company research with data, industry analysis, and awareness of the wider macroeconomic context.</p><p>The name <em>Modern Fundamental Analyst</em> reflects this combination. It is not a claim to have perfected the process; it describes the kind of investor I am working to become.</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>03 · Investment approach</span><h2>Own the business, not the ticker.</h2></div>
      <div className="about-copy"><p>I approach an investment as an ownership interest in a real business, not simply as a ticker or a short-term price movement. My research generally focuses on:</p><ul className="about-list">{investmentFocus.map((item) => <li key={item}>{item}</li>)}</ul><p>I do not follow a rigid distinction between “value” and “growth.” A growing company can be undervalued, while a statistically inexpensive company can still be a poor investment. The relevant questions are what the business may ultimately earn, how much uncertainty surrounds that outcome, and what price is being paid for it.</p><p>My portfolio remains a developing body of work. Positions may reflect different levels of conviction, and my analytical process will continue to evolve as I gain experience and encounter new evidence.</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>04 · Transparency and accountability</span><h2>Make the record clear enough to judge honestly.</h2></div>
      <div className="about-copy"><p>I publish my portfolio and performance, including periods when the portfolio underperforms its benchmark. Investment ideas should be evaluated not only by how persuasive they sound, but also by their subsequent results.</p><p>Public disclosure creates a record of what was owned, what was believed, and how the decisions performed. Where the necessary information is available, I aim to disclose:</p><ul className="about-list">{disclosureFocus.map((item) => <li key={item}>{item}</li>)}</ul><p>The objective is not to present a flawless record. Transparency means distinguishing facts from assumptions, explaining the reasoning behind a conclusion, acknowledging uncertainty, and correcting the record when better evidence becomes available—without disclosing confidential or private information.</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>05 · Research and writing</span><h2>Turn opinions into testable arguments.</h2></div>
      <div className="about-copy"><p>The memos published here may cover a public company, an industry, a macroeconomic development, portfolio construction, or another asset class. Whether comprehensive or concise, each note aims to state the thesis, evidence, assumptions, risks, and conditions that would cause the conclusion to change.</p><p>My research includes <em>The Great Bifurcation Is Here</em>, an independent examination of structural changes in the global economic and investment environment. I have also conducted public-equity research supporting family asset-allocation decisions, including a Hong Kong residential investment case study.</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>06 · Background</span><h2>Building a broader analytical foundation.</h2></div>
      <div className="about-copy"><p>Before university, I gained professional experience through an internship in Hong Kong and maintained a strong relationship with my former supervisor. I have also operated a tutoring business, gaining early experience in client communication, record keeping, and responsibility for independently earned income.</p><p>At Rutgers, I plan to strengthen my foundation in finance, accounting, statistics, modelling, and data analysis. Philosophy will complement that training by sharpening my reasoning, argumentation, and ability to examine assumptions.</p><p>Over the longer term, I hope to work in a multinational financial institution or investment-related organisation, gain experience across markets, and continue developing as an investor and analyst.</p></div>
    </section>

    <section className="about-boundaries shell">
      <div><span>What this website is</span><ul><li>A public record of an evolving investment process</li><li>A repository for original research and investment memos</li><li>A transparent presentation of portfolio performance</li><li>A way to make my thinking more disciplined and accountable</li></ul></div>
      <div><span>What this website is not</span><p>Modern Fundamental Analyst is not an investment advisory service. Nothing published here should be interpreted as personalised financial advice. Research may contain errors, incomplete information, or conclusions that later prove incorrect.</p><p>Readers should conduct their own research and consult qualified professionals where appropriate.</p></div>
    </section>

    <section className="about-closing shell">
      <p className="eyebrow"><span /> Closing</p>
      <h2>One memo, one position, and one correction at a time.</h2>
      <div><p>I expect my views to change as I learn. That is a feature of the process, not something to conceal.</p><p>The purpose of this website is to preserve the reasoning behind my decisions, measure those decisions against their results, and gradually build a more rigorous investment process.</p><p>For detailed legal and methodological information, see the <Link href="/disclaimer">Disclaimer</Link> and <Link href="/performance">Performance</Link> pages.</p></div>
    </section>
    <SiteFooter />
  </main>;
}
