import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "About",
  description: "Tianyi (David) Li's background, investment approach, and principles behind Modern Fundamental Analyst.",
};

export default function AboutPage() {
  return <main className="about-page"><SiteHeader counterpartPath="/zh-tw/about" />
    <section className="page-hero shell">
      <p className="eyebrow"><span /> About</p>
      <h1>Learning Continuously.<br /><em>Investing with Accountability.</em></h1>
      <div className="page-intro"><p>I am Tianyi (David) Li, an incoming Rutgers Honors College student building a transparent, long-term investment process.</p><small>Finance · BAIT · Philosophy · Music</small></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>01 · Introduction</span><h2>Why I Built Modern Fundamental Analyst</h2></div>
      <div className="about-copy"><p>Modern Fundamental Analyst documents how I research stocks, value businesses, manage my portfolio, and evaluate my results.</p><p>I believe retail investors should have access to transparent investment research and understandable valuation methods. By publishing my portfolio, performance, financial models, and investment theses, I aim to create a public record that can be examined over time.</p><p>The mission of this website is to empower every retail investor to understand businesses, question assumptions, and make independent investment decisions.</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>02 · What is a Modern Fundamental Analyst?</span><h2>Traditional Fundamentals for the Coming Technological Waves</h2></div>
      <div className="about-copy"><p>A modern fundamental analyst begins with the business: its operations, competitive position, financial statements, capital allocation, long-term opportunities, and risks.</p><p>I value accounting as the language of business and as the foundation of financial modeling. I build integrated 3-statement models to understand how the income statement, balance sheet, and cash flow statement work together. I then use DCF models to determine the intrinsic value of stocks.</p><p>I also believe in the coming waves of AI and other disruptive technologies. Traditional fundamental analysis remains essential, but it must be applied to businesses operating in a rapidly changing technological environment.</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>03 · Investment Philosophy</span><h2>Focus the Portfolio and Value Businesses Long-Term</h2></div>
      <div className="about-copy"><p>I believe in focus investing for portfolio management. I prefer a limited number of positions that I understand and genuinely believe in, allowing my strongest ideas to contribute meaningfully to performance.</p><p>For stock pitching, I believe in long-term value investing. I study the business, build financial forecasts, determine its intrinsic value, and compare that value with its market price. I am willing to hold a stock for the long term when the business continues to develop as expected and the original thesis remains valid.</p><p>I also look for businesses positioned to benefit from AI and other disruptive technologies. However, a powerful trend does not automatically make every related stock a good investment. Business quality, valuation, and risk still matter.</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>04 · Transparency and Accountability</span><h2>Making Every Investment Decision Open to Review</h2></div>
      <div className="about-copy"><p>I promote transparency and accountability by fully disclosing my portfolio and performance every month and publishing detailed investment theses.</p><p>Monthly disclosure creates a public record of what I own and how my decisions perform. My investment theses explain why I own each stock, what I believe it is worth, what the market may be missing, and what could cause my view to change.</p><p>The objective is not to present a flawless record. It is to make my reasoning and results clear enough to be evaluated honestly, including mistakes, thesis changes, and periods of underperformance.</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>05 · Research and Writing</span><h2>Turning Investment Ideas into Testable Theses</h2></div>
      <div className="about-copy"><p>I use investment memos to turn opinions into structured and testable arguments. Each thesis aims to explain the business, investment opportunity, supporting evidence, valuation, major risks, and conditions that would cause my view to change.</p><p>Where appropriate, I support my research with an integrated 3-statement model and DCF valuation. The model connects operating assumptions with financial performance and intrinsic value.</p><p>Publishing the thesis creates a record before the outcome is known. Readers can examine my assumptions, disagree with my conclusions, and evaluate each idea independently as new evidence becomes available.</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>06 · Background</span><h2>Growing Through Curiosity, Empathy, and Continuous Learning</h2></div>
      <div className="about-copy"><p>I am an incoming Rutgers University–New Brunswick Honors College student intending to double major in Finance and Business Analytics and Information Technology. I also intend to pursue a minor in either Philosophy or Music.</p><p>I promote a “learn-it-all” growth mindset based on curiosity, empathy, and continuous learning. I do not expect to begin with every answer. Instead, I aim to ask better questions, listen to different perspectives, accept feedback, and continuously improve my knowledge and skills.</p><p>This mindset also shapes how I invest. When evidence challenges an existing view, I would rather examine it and revise my thesis than defend an earlier conclusion simply for consistency.</p></div>
    </section>

    <section className="about-boundaries shell">
      <div><span>What This Website Is</span><ul><li>A fully disclosed monthly record of my portfolio and performance</li><li>A repository for detailed investment theses and financial models</li><li>A resource created to empower every retail investor</li></ul></div>
      <div><span>What This Website Is Not</span><ul><li>A promise that every investment thesis will be correct</li><li>A recommendation to buy or sell any particular security</li><li>A substitute for independent research or professional financial advice</li></ul></div>
    </section>

    <section className="about-closing shell">
      <p className="eyebrow"><span /> Closing</p>
      <h2>Learn Openly, Think Independently, Improve Continuously</h2>
      <div><p>I believe in learning openly, investing transparently, and empowering others to think independently.</p><p>I do not expect to have every answer. I aim to remain curious, approach different perspectives with empathy, make my assumptions clear, and revise my conclusions when the evidence changes.</p><p>Modern Fundamental Analyst preserves the reasoning behind my investment decisions and measures those decisions against their results. Through monthly portfolio and performance disclosure, detailed investment theses, and transparent valuation methods, I hope to build a more rigorous investment process while empowering every retail investor to develop their own.</p><p>For detailed legal and methodological information, see the <Link href="/disclaimer">Disclaimer</Link> and <Link href="/performance">Performance</Link> pages.</p></div>
    </section>
    <SiteFooter />
  </main>;
}
