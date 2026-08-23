import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMemos } from "@/data/memos";
import { getHoldingWeight, portfolioHoldings, portfolioSnapshot } from "@/data/portfolio";
import { formatDate, formatPercent, formatUsd } from "@/lib/format";
import { localeConfig, type Locale } from "@/lib/i18n";

const copy = {
  en: {
    researchLabel: "David's Independent Public-Equity Research", hero: ["Focus Investing for a", "Disruptive Future."], heroIntro: "Long-term value research, financial modeling, and a fully disclosed portfolio built to empower every retail investor.", viewPortfolio: "View portfolio", readLatest: "Read latest Investment Memo", portfolioSnapshot: "Portfolio snapshot", totalReturn: "Total return", cumulativeReturn: "Cumulative cost-basis return", marketValue: "Market value", holdingsUnit: "stocks and ETFs", portfolioXirr: "Portfolio XIRR", asOf: "As of", aboutLabel: "01 About", aboutTitle: ["My Investment Beliefs and", "Commitment to Learning"], aboutCopy: "I believe in focus investing, long-term value investing, and the coming waves of AI and other disruptive technologies. I value accounting as the language of business and use financial modeling to connect business fundamentals with valuation. I also promote a “learn-it-all” growth mindset based on curiosity, empathy, and continuous learning.", aboutLink: "About the process", portfolioLabel: "02 Portfolio", portfolioTitle: ["A Focus Portfolio Built", "for Long-Term Ownership"], fullPortfolio: "Full portfolio", portfolioReturn: "Portfolio return", totalReturnShort: "total return", performanceLabel: "03 Performance", performanceTitle: ["Monthly Results Disclosed", "with Complete Transparency"], chartLabel: "XIRR comparison chart", portfolioName: "Portfolio", performanceCopy: (benchmarkReturn: string) => `Portfolio XIRR, versus ${benchmarkReturn} for ${portfolioSnapshot.benchmark} over the same cash-flow period.`, verified: "Verified snapshot as of", viewPerformance: "View performance", memosLabel: "04 Investment Memos", memosTitle: ["Detailed Investment Theses", "Behind Every Position"], viewAllMemos: "View all Investment Memos", contactLabel: "05 Contact", contactTitle: ["Stay Connected with", "My Latest Research"], contactLink: "Get in touch", marketValueSuffix: "market value", updatedMonthly: "Updated monthly",
  },
  "zh-tw": {
    researchLabel: "David 的獨立公開市場股票研究", hero: ["為顛覆性未來，", "實踐集中投資。"], heroIntro: "透過長期價值研究、財務建模與完整揭露的投資組合，幫助每一位個人投資者建立獨立判斷。", viewPortfolio: "查看投資組合", readLatest: "閱讀最新投資備忘錄", portfolioSnapshot: "投資組合摘要", totalReturn: "累積報酬", cumulativeReturn: "成本基礎累積報酬", marketValue: "市場價值", holdingsUnit: "檔股票與 ETF", portfolioXirr: "投資組合 XIRR", asOf: "截至", aboutLabel: "01 關於", aboutTitle: ["我的投資信念與", "持續學習的承諾"], aboutCopy: "我相信集中投資、長期價值投資，以及即將到來的人工智慧與其他顛覆性科技浪潮。我重視會計作為商業語言的角色，並運用財務建模連結企業基本面與估值。我也提倡以好奇心、同理心與持續學習為基礎的「learn-it-all」成長思維。", aboutLink: "了解投資過程", portfolioLabel: "02 投資組合", portfolioTitle: ["為長期持有而建立的", "集中投資組合"], fullPortfolio: "完整投資組合", portfolioReturn: "投資組合報酬", totalReturnShort: "累積報酬", performanceLabel: "03 績效", performanceTitle: ["每月完整透明揭露", "投資結果"], chartLabel: "XIRR 比較圖表", portfolioName: "投資組合", performanceCopy: (benchmarkReturn: string) => `投資組合 XIRR；相同現金流期間的 ${portfolioSnapshot.benchmark} 為 ${benchmarkReturn}。`, verified: "截至", viewPerformance: "查看績效", memosLabel: "04 投資備忘錄", memosTitle: ["每個部位背後的", "詳細投資論點"], viewAllMemos: "查看所有投資備忘錄", contactLabel: "05 聯絡", contactTitle: ["持續掌握我的", "最新研究"], contactLink: "與我聯絡", marketValueSuffix: "市場價值", updatedMonthly: "每月更新",
  },
  "zh-cn": {
    researchLabel: "David 的独立公开市场股票研究", hero: ["为颠覆性未来，", "实践集中投资。"], heroIntro: "通过长期价值研究、财务建模与完整披露的投资组合，帮助每一位个人投资者建立独立判断。", viewPortfolio: "查看投资组合", readLatest: "阅读最新投资备忘录", portfolioSnapshot: "投资组合摘要", totalReturn: "累计回报", cumulativeReturn: "成本基础累计回报", marketValue: "市场价值", holdingsUnit: "只股票与 ETF", portfolioXirr: "投资组合 XIRR", asOf: "截至", aboutLabel: "01 关于", aboutTitle: ["我的投资信念与", "持续学习的承诺"], aboutCopy: "我相信集中投资、长期价值投资，以及即将到来的人工智能与其他颠覆性科技浪潮。我重视会计作为商业语言的作用，并运用财务建模连接企业基本面与估值。我也倡导以好奇心、同理心与持续学习为基础的“learn-it-all”成长思维。", aboutLink: "了解投资过程", portfolioLabel: "02 投资组合", portfolioTitle: ["为长期持有而建立的", "集中投资组合"], fullPortfolio: "完整投资组合", portfolioReturn: "投资组合回报", totalReturnShort: "累计回报", performanceLabel: "03 业绩", performanceTitle: ["每月完整透明披露", "投资结果"], chartLabel: "XIRR 比较图表", portfolioName: "投资组合", performanceCopy: (benchmarkReturn: string) => `投资组合 XIRR；相同现金流期间的 ${portfolioSnapshot.benchmark} 为 ${benchmarkReturn}。`, verified: "截至", viewPerformance: "查看业绩", memosLabel: "04 投资备忘录", memosTitle: ["每个持仓背后的", "详细投资论点"], viewAllMemos: "查看所有投资备忘录", contactLabel: "05 联系", contactTitle: ["持续关注我的", "最新研究"], contactLink: "与我联系", marketValueSuffix: "市场价值", updatedMonthly: "每月更新",
  },
} as const;

const featuredHoldings = portfolioHoldings.toSorted((a, b) => b.marketValue - a.marketValue).slice(0, 4);

export function HomePageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const prefix = localeConfig[locale].prefix;
  const memos = getMemos(locale);
  const portfolioDate = formatDate(portfolioSnapshot.asOf, locale);
  const compactPortfolioDate = formatDate(portfolioSnapshot.asOf, locale, locale === "en");
  const benchmarkReturn = formatPercent(portfolioSnapshot.benchmarkXirr);

  return <main className="home-page" id="main-content">
    <div className="home-opening">
      <SiteHeader locale={locale} />
      <section className="hero shell"><p className="eyebrow"><span /> {text.researchLabel}</p><h1>{text.hero[0]}<br /><em>{text.hero[1]}</em></h1><div className="hero-bottom"><p>{text.heroIntro}</p><div className="hero-actions"><Link className="button button-dark" href={`${prefix}/portfolio`}>{text.viewPortfolio} <span className="arrow-icon" aria-hidden="true">↗︎</span></Link><Link className="text-link" href={`${prefix}/memos`}>{text.readLatest} →</Link></div></div></section>
      <section className="metric-band shell" aria-label={text.portfolioSnapshot}><div className="metric metric-featured"><span>{text.totalReturn}</span><strong>{formatPercent(portfolioSnapshot.totalReturn)}</strong><small>{text.cumulativeReturn}</small></div><div className="metric"><span>{text.marketValue}</span><strong>{formatUsd(portfolioSnapshot.marketValue, 0)}</strong><small>{portfolioSnapshot.holdingsCount} {text.holdingsUnit}</small></div><div className="metric metric-accent"><span>{text.portfolioXirr}</span><strong>{formatPercent(portfolioSnapshot.xirr)}</strong><small className="date-text">{text.asOf} {compactPortfolioDate} · {text.updatedMonthly}</small></div></section>
    </div>
    <section className="home-about shell"><div><p className="section-number">{text.aboutLabel}</p><h2>{text.aboutTitle[0]}<br />{text.aboutTitle[1]}</h2></div><div><p>{text.aboutCopy}</p><Link className="text-link" href={`${prefix}/about`}>{text.aboutLink} →</Link></div></section>
    <section className="intro shell"><p className="section-number">{text.portfolioLabel}</p><h2>{text.portfolioTitle[0]}<br />{text.portfolioTitle[1]}</h2><Link className="round-link" href={`${prefix}/portfolio`} aria-label={text.viewPortfolio}><span className="arrow-icon" aria-hidden="true">↗︎</span></Link></section>
    <section className="holdings-preview shell"><div className="holdings-list">{featuredHoldings.map((holding, index) => <div className="holding-row" key={holding.symbol}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{holding.symbol}</strong><small>{formatUsd(holding.marketValue, 0)} {text.marketValueSuffix}</small></div><b>{getHoldingWeight(holding.marketValue).toFixed(1)}%</b></div>)}</div><aside className="allocation-card"><span>{text.portfolioReturn}</span><div className="allocation-ring" aria-label={`${text.totalReturnShort} ${portfolioSnapshot.totalReturn.toFixed(1)}%`}><b>{formatPercent(portfolioSnapshot.totalReturn, 1)}</b><small>{text.totalReturnShort}</small></div><Link href={`${prefix}/portfolio`}><span className="link-label">{text.fullPortfolio}</span> <span className="arrow-icon" aria-hidden="true">→</span></Link></aside></section>
    <section className="performance-home">
      <div className="shell">
        <div className="section-heading inverse"><p className="section-number">{text.performanceLabel}</p><h2>{text.performanceTitle[0]}<br />{text.performanceTitle[1]}</h2></div>
        <div className="performance-grid">
          <div className="performance-bars" aria-label={text.chartLabel}><div className="year-bar"><div className="bar-value" style={{ height: `${portfolioSnapshot.xirr * 8}px` }}><span>{formatPercent(portfolioSnapshot.xirr)}</span></div><small>{text.portfolioName}</small></div><div className="year-bar"><div className="bar-value" style={{ height: `${portfolioSnapshot.benchmarkXirr * 8}px` }}><span>{benchmarkReturn}</span></div><small>{portfolioSnapshot.benchmark}</small></div></div>
          <div className="performance-copy"><strong>{formatPercent(portfolioSnapshot.xirr)}</strong><p>{text.performanceCopy(benchmarkReturn)}</p><small className="date-text">{text.verified} {portfolioDate}{locale === "en" ? "" : locale === "zh-tw" ? " 的已驗證快照" : " 的已验证快照"} · {text.updatedMonthly}{locale === "en" ? "." : "。"}</small><Link className="button button-white" href={`${prefix}/performance`}>{text.viewPerformance} <span className="arrow-icon" aria-hidden="true">↗︎</span></Link></div>
        </div>
      </div>
    </section>
    <section className="memos-home shell"><div className="section-heading"><p className="section-number">{text.memosLabel}</p><h2>{text.memosTitle[0]}<br />{text.memosTitle[1]}</h2></div><div className="memo-grid">{memos.slice(0, 3).map((memo, index) => <Link className={`memo-card memo-card-${index + 1}`} href={`${prefix}/memos/${memo.slug}`} key={memo.slug}><div><span>{memo.number}</span><span>{memo.tag}</span></div><h3>{memo.title}</h3><p>{memo.summary}</p><small className="date-text">{formatDate(memo.publishedAt, locale, locale === "en")} · {memo.readTime}</small></Link>)}</div><Link className="text-link memos-all" href={`${prefix}/memos`}>{text.viewAllMemos} →</Link></section>
    <section className="cta shell"><p className="eyebrow"><span /> {text.contactLabel}</p><h2>{text.contactTitle[0]}<br />{text.contactTitle[1]}</h2><Link className="button button-dark" href={`${prefix}/contact`}>{text.contactLink} <span className="arrow-icon" aria-hidden="true">↗︎</span></Link></section>
    <SiteFooter locale={locale} />
  </main>;
}
