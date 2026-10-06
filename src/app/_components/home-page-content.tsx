import { portfolioTwrSnapshot } from "@/features/portfolio/portfolio-twr";
import { PortfolioMetric } from "@/features/portfolio/portfolio-metric";
import { appearance } from "./home-page-content.styles";
import { ButtonLink } from "@/components/button-link";
import Link from "next/link";
import { MoveRight, MoveUpRight } from "lucide-react";
import { MemoCards } from "@/features/memos/memo-cards";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { getMemos } from "@/features/memos/memos";
import { getHoldingWeight, portfolioHoldings, portfolioSnapshot } from "@/features/portfolio/portfolio";
import { formatDate, formatPercent, formatUsd } from "@/lib/format";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

const copy = {
  en: {
    researchLabel: "Home",
    hero: ["Focus Investing for a", "Disruptive Future."],
    heroIntro:
      "Long-term value research, financial modeling, and a fully disclosed portfolio built to empower every retail investor.",
    viewPortfolio: "View portfolio",
    readLatest: "Read latest Investment Memo",
    portfolioSnapshot: "Portfolio Snapshot",
    timeWeightedReturn: "Time-Weighted Return",
    twrNote: "Reconstructed · cumulative · not annualized",
    marketValue: "Market Value",
    holdingsUnit: "stocks and ETFs",
    portfolioXirr: "Portfolio XIRR",
    asOf: "As of",
    aboutLabel: "01 · About",
    aboutTitle: ["My Investment Beliefs and", "Commitment to Learning"],
    aboutCopy:
      "I believe in focus investing, long-term value investing, and the coming waves of AI and other disruptive technologies. I value accounting as the language of business and use financial modeling to connect business fundamentals with valuation. I also promote a “learn-it-all” growth mindset based on curiosity, empathy, and continuous learning.",
    aboutLink: "About the process",
    portfolioLabel: "02 · Portfolio",
    portfolioTitle: ["A Focus Portfolio Built", "for Long-Term Ownership"],
    fullPortfolio: "Full portfolio",
    holdingsAllocation: "Holdings Allocation",
    other: "Other",
    topHoldings: "Top Four Holdings and Other",
    performanceLabel: "03 · Performance",
    performanceTitle: ["Monthly Results Disclosed", "with Complete Transparency"],
    chartLabel: "XIRR Comparison Chart",
    portfolioName: "Portfolio",
    performanceCopy: (benchmarkReturn: string) =>
      `Portfolio XIRR, versus ${benchmarkReturn} for ${portfolioSnapshot.benchmark} over the same cash-flow period.`,
    verified: "Verified snapshot as of",
    viewPerformance: "View performance",
    memosLabel: "04 · Investment Memos",
    memosTitle: ["Detailed Investment Theses", "behind Every Position"],
    viewAllMemos: "View all Investment Memos",
    contactLabel: "05 · Contact",
    contactTitle: ["Stay Connected with", "My Latest Research"],
    contactLink: "Get in touch",
    marketValueSuffix: "market value",
    updatedMonthly: "Updated monthly",
  },
  "zh-tw": {
    researchLabel: "首頁",
    hero: ["為顛覆性未來，", "實踐集中投資。"],
    heroIntro: "透過長期價值研究、財務建模與完整揭露的投資組合，幫助每一位個人投資者建立獨立判斷。",
    viewPortfolio: "查看投資組合",
    readLatest: "閱讀最新投資備忘錄",
    portfolioSnapshot: "投資組合摘要",
    timeWeightedReturn: "時間加權報酬",
    twrNote: "重建值・累積・未年化",
    marketValue: "市場價值",
    holdingsUnit: "檔股票與 ETF",
    portfolioXirr: "投資組合 XIRR",
    asOf: "截至",
    aboutLabel: "01 · 關於",
    aboutTitle: ["我的投資信念與", "持續學習的承諾"],
    aboutCopy:
      "我相信集中投資、長期價值投資，以及即將到來的人工智慧與其他顛覆性科技浪潮。我重視會計作為商業語言的角色，並運用財務建模連結企業基本面與估值。我也提倡以好奇心、同理心與持續學習為基礎的「learn-it-all」成長思維。",
    aboutLink: "了解投資過程",
    portfolioLabel: "02 · 投資組合",
    portfolioTitle: ["為長期持有而建立的", "集中投資組合"],
    fullPortfolio: "完整投資組合",
    holdingsAllocation: "持倉佔比",
    other: "其他",
    topHoldings: "前四大持倉與其他",
    performanceLabel: "03 · 績效",
    performanceTitle: ["每月完整透明揭露", "投資結果"],
    chartLabel: "XIRR 比較圖表",
    portfolioName: "投資組合",
    performanceCopy: (benchmarkReturn: string) =>
      `投資組合 XIRR；相同現金流期間的 ${portfolioSnapshot.benchmark} 為 ${benchmarkReturn}。`,
    verified: "截至",
    viewPerformance: "查看績效",
    memosLabel: "04 · 投資備忘錄",
    memosTitle: ["每個部位背後的", "詳細投資論點"],
    viewAllMemos: "查看所有投資備忘錄",
    contactLabel: "05 · 聯絡",
    contactTitle: ["持續掌握我的", "最新研究"],
    contactLink: "與我聯絡",
    marketValueSuffix: "市場價值",
    updatedMonthly: "每月更新",
  },
  "zh-cn": {
    researchLabel: "首页",
    hero: ["为颠覆性未来，", "实践集中投资。"],
    heroIntro: "通过长期价值研究、财务建模与完整披露的投资组合，帮助每一位个人投资者建立独立判断。",
    viewPortfolio: "查看投资组合",
    readLatest: "阅读最新投资备忘录",
    portfolioSnapshot: "投资组合摘要",
    timeWeightedReturn: "时间加权回报",
    twrNote: "重建值・累计・未年化",
    marketValue: "市场价值",
    holdingsUnit: "只股票与 ETF",
    portfolioXirr: "投资组合 XIRR",
    asOf: "截至",
    aboutLabel: "01 · 关于",
    aboutTitle: ["我的投资信念与", "持续学习的承诺"],
    aboutCopy:
      "我相信集中投资、长期价值投资，以及即将到来的人工智能与其他颠覆性科技浪潮。我重视会计作为商业语言的作用，并运用财务建模连接企业基本面与估值。我也倡导以好奇心、同理心与持续学习为基础的“learn-it-all”成长思维。",
    aboutLink: "了解投资过程",
    portfolioLabel: "02 · 投资组合",
    portfolioTitle: ["为长期持有而建立的", "集中投资组合"],
    fullPortfolio: "完整投资组合",
    holdingsAllocation: "持仓占比",
    other: "其他",
    topHoldings: "前四大持仓与其他",
    performanceLabel: "03 · 业绩",
    performanceTitle: ["每月完整透明披露", "投资结果"],
    chartLabel: "XIRR 比较图表",
    portfolioName: "投资组合",
    performanceCopy: (benchmarkReturn: string) =>
      `投资组合 XIRR；相同现金流期间的 ${portfolioSnapshot.benchmark} 为 ${benchmarkReturn}。`,
    verified: "截至",
    viewPerformance: "查看业绩",
    memosLabel: "04 · 投资备忘录",
    memosTitle: ["每个持仓背后的", "详细投资论点"],
    viewAllMemos: "查看所有投资备忘录",
    contactLabel: "05 · 联系",
    contactTitle: ["持续关注我的", "最新研究"],
    contactLink: "与我联系",
    marketValueSuffix: "市场价值",
    updatedMonthly: "每月更新",
  },
} as const;

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
  const text = copy[locale];
  const memos = getMemos(locale);
  const portfolioDate = formatDate(portfolioSnapshot.asOf, locale, locale === "en");
  const benchmarkReturn = formatPercent(portfolioSnapshot.benchmarkXirr);

  return (
    <div className="home-page">
      <div className={appearance["home-header"]}>
        <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
      </div>
      <main id="main-content" tabIndex={-1}>
        <div className={appearance["home-opening"]}>
          <div className={appearance["hero-band"]}>
            <section className={appearance["hero"] + " " + appearance["shell"]}>
              <p className={appearance["eyebrow"]}>
                <span /> {text.researchLabel}
              </p>
              <h1>
                {text.hero[0]}
                <br />
                <em>{text.hero[1]}</em>
              </h1>
              <div className={appearance["hero-bottom"]}>
                <p>{text.heroIntro}</p>
                <div className={appearance["hero-actions"]}>
                  <ButtonLink variant="contrast" href={getLocalizedPath("/portfolio", locale)}>
                    {text.viewPortfolio}
                  </ButtonLink>
                  <Link className={appearance["text-link"]} href={getLocalizedPath("/memos", locale)}>
                    {text.readLatest}
                    <MoveRight className={appearance["arrow-icon"]} aria-hidden="true" strokeWidth={3} />
                  </Link>
                </div>
              </div>
            </section>
          </div>
          <dl className={appearance["metric-band"]} aria-label={text.portfolioSnapshot}>
            <PortfolioMetric
              tone="highlight"
              className="metric compact:overflow-hidden"
              label={<>{text.timeWeightedReturn}</>}
              value={<>{formatPercent(portfolioTwrSnapshot.portfolioTwr)}</>}
              note={<>{text.twrNote}</>}
            />
            <PortfolioMetric
              tone="brand"
              className="metric compact:overflow-hidden"
              label={<>{text.marketValue}</>}
              value={<>{formatUsd(portfolioSnapshot.marketValue, 0)}</>}
              note={
                <>
                  {portfolioSnapshot.holdingsCount} {text.holdingsUnit}
                </>
              }
            />
            <PortfolioMetric
              tone="paper"
              className="metric compact:overflow-hidden"
              label={<>{text.portfolioXirr}</>}
              value={<>{formatPercent(portfolioSnapshot.xirr)}</>}
              note={
                <>
                  {text.asOf} <time dateTime={portfolioSnapshot.asOf}>{portfolioDate}</time> · {text.updatedMonthly}
                </>
              }
              noteClassName="date-text tabular-nums"
            />
          </dl>
        </div>

        <section className={appearance["home-about"] + " " + appearance["shell"]}>
          <div>
            <p className={appearance["section-number"]}>{text.aboutLabel}</p>
            <h2>
              {text.aboutTitle[0]}
              <br />
              {text.aboutTitle[1]}
            </h2>
          </div>
          <div>
            <p>{text.aboutCopy}</p>
            <Link className={appearance["text-link"]} href={getLocalizedPath("/about", locale)}>
              {text.aboutLink}
              <MoveRight className={appearance["arrow-icon"]} aria-hidden="true" strokeWidth={3} />
            </Link>
          </div>
        </section>

        <div className={appearance["home-portfolio-section"]}>
          <section className={appearance["intro"] + " " + appearance["shell"]}>
            <p className={appearance["section-number"]}>{text.portfolioLabel}</p>
            <h2>
              {text.portfolioTitle[0]}
              <br />
              {text.portfolioTitle[1]}
            </h2>
            <Link
              data-touch-feedback=""
              className={appearance["round-link"]}
              href={getLocalizedPath("/portfolio", locale)}
              aria-label={text.viewPortfolio}
            >
              <MoveUpRight
                className={appearance["arrow-icon"] + " " + appearance["round-link-arrow"]}
                aria-hidden="true"
                strokeWidth={3}
              />
            </Link>
          </section>
          <section className={appearance["holdings-preview"] + " " + appearance["shell"]}>
            {/* Safari needs an explicit list role when markers are removed outside navigation. */}
            {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
            <ol className={appearance["holdings-list"]} role="list">
              {featuredHoldings.map((holding, index) => (
                <li className={appearance["holding-row"]} key={holding.symbol}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{holding.symbol}</strong>
                    <small>
                      {formatUsd(holding.marketValue, 0)} {text.marketValueSuffix}
                    </small>
                  </div>
                  <b>{getHoldingWeight(holding.marketValue).toFixed(1)}%</b>
                </li>
              ))}
            </ol>
            <aside className={appearance["allocation-card"]}>
              <span>{text.holdingsAllocation}</span>
              <div className={appearance["allocation-visual"]}>
                <div
                  className={appearance["allocation-ring"]}
                  style={{ background: allocationGradient }}
                  role="img"
                  aria-label={text.topHoldings}
                >
                  <span>{portfolioSnapshot.holdingsCount}</span>
                  <small>{text.holdingsAllocation}</small>
                </div>
                <ul className={appearance["allocation-legend"]}>
                  {featuredHoldings.map((holding) => (
                    <li key={holding.symbol}>
                      <i aria-hidden="true" />
                      <span>{holding.symbol}</span>
                      <b>{getHoldingWeight(holding.marketValue).toFixed(1)}%</b>
                    </li>
                  ))}
                  <li>
                    <i aria-hidden="true" />
                    <span>{text.other}</span>
                    <b>{otherWeight.toFixed(1)}%</b>
                  </li>
                </ul>
              </div>
              <Link href={getLocalizedPath("/portfolio", locale)}>
                <span className="link-label">{text.fullPortfolio}</span>
                <MoveRight className={appearance["arrow-icon"]} aria-hidden="true" strokeWidth={3} />
              </Link>
            </aside>
          </section>
        </div>

        <section className={appearance["performance-home"]}>
          <div className={appearance["shell"]}>
            <div className={appearance["section-heading"] + " " + "inverse"}>
              <p className={appearance["section-number"]}>{text.performanceLabel}</p>
              <h2>
                {text.performanceTitle[0]}
                <br />
                {text.performanceTitle[1]}
              </h2>
            </div>
            <div className={appearance["performance-grid"]}>
              <div className={appearance["performance-bars"]} aria-label={text.chartLabel}>
                <div className={appearance["year-bar"]}>
                  <div className={appearance["bar-value"]} style={{ height: `${portfolioSnapshot.xirr * 8}px` }}>
                    <span>{formatPercent(portfolioSnapshot.xirr)}</span>
                  </div>
                  <small>{text.portfolioName}</small>
                </div>
                <div className={appearance["year-bar"]}>
                  <div
                    className={appearance["bar-value"]}
                    style={{ height: `${portfolioSnapshot.benchmarkXirr * 8}px` }}
                  >
                    <span>{benchmarkReturn}</span>
                  </div>
                  <small>{portfolioSnapshot.benchmark}</small>
                </div>
              </div>
              <div className={appearance["performance-copy"]}>
                <strong>{formatPercent(portfolioSnapshot.xirr)}</strong>
                <p>{text.performanceCopy(benchmarkReturn)}</p>
                <small className={appearance["date-text"]}>
                  {text.verified} <time dateTime={portfolioSnapshot.asOf}>{portfolioDate}</time>
                  {locale === "en" ? "" : locale === "zh-tw" ? " 的已驗證快照" : " 的已验证快照"} ·{" "}
                  {text.updatedMonthly}
                  {locale === "en" ? "." : "。"}
                </small>
                <ButtonLink
                  variant="contrast"
                  className="button-white mt-[48px]"
                  href={getLocalizedPath("/performance", locale)}
                >
                  {text.viewPerformance}
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        <div className={appearance["memos-home-band"]}>
          <section className={appearance["memos-home"] + " " + appearance["shell"]}>
            <div className={appearance["section-heading"]}>
              <p className={appearance["section-number"]}>{text.memosLabel}</p>
              <h2>
                {text.memosTitle[0]}
                <br />
                {text.memosTitle[1]}
              </h2>
            </div>
            <MemoCards memos={memos} locale={locale} />
            <Link
              className={appearance["text-link"] + " " + appearance["memos-all"]}
              href={getLocalizedPath("/memos", locale)}
            >
              {text.viewAllMemos}
              <MoveRight className={appearance["arrow-icon"]} aria-hidden="true" strokeWidth={3} />
            </Link>
          </section>
        </div>

        <div className={appearance["cta-band"]}>
          <section className={appearance["cta"] + " " + appearance["shell"]}>
            <p className={appearance["eyebrow"]}>
              <span /> {text.contactLabel}
            </p>
            <h2>
              {text.contactTitle[0]}
              <br />
              {text.contactTitle[1]}
            </h2>
            <ButtonLink href={getLocalizedPath("/contact", locale)}>{text.contactLink}</ButtonLink>
          </section>
        </div>
      </main>
      <PageFooter locale={locale} />
    </div>
  );
}
