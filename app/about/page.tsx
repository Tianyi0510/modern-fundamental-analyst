import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "About", description: "The perspective and principles behind Modern Fundamental Analyst's independent investment research." };

export default function AboutPage() {
  return <main><SiteHeader counterpartPath="/zh-tw/about" />
    <section className="page-hero shell"><p className="eyebrow"><span /> About</p><h1>Independent thinking.<br /><em>Long-term orientation.</em></h1></section>
    <section className="two-column shell body-section">
      <h2>Research before opinion.</h2>
      <div className="rich-copy"><p>Modern Fundamental Analyst is an independent public-equity research practice focused on understandable businesses, durable economics, and disciplined capital allocation.</p><p>This site is a transparent archive of the portfolio, performance record, and written investment work. It is designed to show how conclusions change as new evidence arrives.</p></div>
    </section>
    <section className="principles shell">
      <article><span>01</span><h3>Clarity</h3><p>Explain the business and the thesis in plain language.</p></article>
      <article><span>02</span><h3>Patience</h3><p>Let operating progress, not market noise, set the tempo.</p></article>
      <article><span>03</span><h3>Accountability</h3><p>Record decisions, assumptions, and outcomes over time.</p></article>
    </section><SiteFooter /></main>;
}
