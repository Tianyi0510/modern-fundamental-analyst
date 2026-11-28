import { HeadingPhrases, ResponsiveHeadingBreak } from "@/components/heading-phrases";
import { holdingPath } from "@/features/portfolio/holding-path";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { portfolioTwrSnapshot } from "@/features/portfolio/portfolio-twr";
import { PortfolioMetric } from "@/features/portfolio/portfolio-metric";
import { HomeReturnBars } from "./home-return-bars";
import { appearance } from "./home-page-content.styles";
import { ButtonLink } from "@/components/button-link";
import Link from "next/link";
import { IntentLink } from "@/components/intent-link";
import { ChartPie, MoveRight } from "lucide-react";
import { MemoCards } from "@/features/memos/memo-cards";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header/site-header";
import { getLatestMemo, getMemos } from "@/features/memos/memos";
import { getHoldingWeight, portfolioHoldings, portfolioSnapshot } from "@/features/portfolio/portfolio";
import { formatDate, formatPercent, formatUsd } from "@/lib/format";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";
import { createWebsiteStructuredData } from "@/lib/site-config";
import { Activity } from "react";

const copy = {
  en: {
    hero: ["Value investing", "in the coming waves"],
    heroIntro:
      "I believe investing is for everyone. The mission of Modern Fundamental Analyst is to empower every retail investor.",
    viewPortfolio: "View portfolio",
    readLatest: "Read the latest investment memo",
    portfolioSnapshot: "Portfolio snapshot",
    timeWeightedReturn: "TWRR",
    twrNote: "Time-weighted return · reconstructed · cumulative",
    marketValue: "Market value",
    holdingsUnit: "stocks and ETFs",
    portfolioXirr: "XIRR",
    xirrNote: "Money-weighted return · annualized",
    aboutLabel: "01 · About",
    aboutTitle: ["Investment principles and", "continuous learning"],
    aboutCopy:
      "When I pitch a stock, I start with what the business is worth. I keep my portfolio concentrated in businesses I understand. Giving those investments time to compound takes patience and discipline.",
    aboutLink: "Explore the investment approach",
    portfolioLabel: "02 · Portfolio",
    portfolioTitle: ["A concentrated portfolio built", "for long-term compounding"],
    fullPortfolio: "View full portfolio",
    holdingsAllocation: "Holdings allocation",
    other: "Other",
    topHoldings: "Top four holdings and other",
    performanceLabel: "03 · Performance",
    performanceTitle: ["Monthly results disclosed", "with complete transparency"],
    chartLabel: "XIRR comparison chart",
    portfolioName: "Portfolio",
    performanceCopy: (benchmarkReturn: string) =>
      `Portfolio XIRR, versus ${benchmarkReturn} for ${portfolioSnapshot.benchmark} over the same cash-flow period.`,
    asOf: "As of",
    viewPerformance: "Track portfolio performance",
    memosLabel: "04 · Investment memos",
    memosTitle: ["Published investment research", "with accountability"],
    viewAllMemos: "View all investment memos",
    contactLabel: "05 · Contact",
    contactTitle: ["Stay connected with", "the latest research"],
    contactLink: "Get in touch",
    marketValueSuffix: "Market value",
    updatedMonthly: "Updated monthly",
  },
  "zh-tw": {
    hero: [
      ["在新一波", "浪潮中"],
      ["實踐", "價值投資"],
    ],
    heroIntro: "我相信每個人都可以投資。Modern Fundamental Analyst 的使命，是幫助每位個人投資者獨立做判斷。",
    viewPortfolio: "查看投資組合",
    readLatest: "閱讀最新投資備忘錄",
    portfolioSnapshot: "投資組合摘要",
    timeWeightedReturn: "TWRR",
    twrNote: "時間加權報酬・重建值・累積",
    marketValue: "市場價值",
    holdingsUnit: "檔股票與 ETF",
    portfolioXirr: "XIRR",
    xirrNote: "資金加權報酬・年化",
    aboutLabel: "01 · 關於",
    aboutTitle: ["投資原則與", "持續學習"],
    aboutCopy:
      "提出個股投資觀點前，我先問這家企業值多少錢。我的持股集中在自己了解的企業。要讓複利發揮作用，需要時間，也需要耐心與紀律。",
    aboutLink: "探索投資研究方式",
    portfolioLabel: "02 · 投資組合",
    portfolioTitle: ["為長期複利而建立的", "集中投資組合"],
    fullPortfolio: "查看完整投資組合",
    holdingsAllocation: "持倉佔比",
    other: "其他",
    topHoldings: "前四大持倉與其他",
    performanceLabel: "03 · 績效",
    performanceTitle: ["每月完整公開", "投資績效"],
    chartLabel: "XIRR 比較圖表",
    portfolioName: "投資組合",
    performanceCopy: (benchmarkReturn: string) =>
      `投資組合 XIRR；相同現金流期間的 ${portfolioSnapshot.benchmark} 為 ${benchmarkReturn}。`,
    asOf: "截至",
    viewPerformance: "追蹤投資組合績效",
    memosLabel: "04 · 投資備忘錄",
    memosTitle: ["公開投資研究，", ["為自己的", "判斷負責"]],
    viewAllMemos: "查看所有投資備忘錄",
    contactLabel: "05 · 聯絡",
    contactTitle: ["持續掌握", "最新研究"],
    contactLink: "聯絡",
    marketValueSuffix: "市場價值",
    updatedMonthly: "每月更新",
  },
  "zh-cn": {
    hero: [
      ["在新一轮", "浪潮中"],
      ["践行", "价值投资"],
    ],
    heroIntro: "我相信每个人都可以投资。Modern Fundamental Analyst 的使命，是帮助每位个人投资者独立做判断。",
    viewPortfolio: "查看投资组合",
    readLatest: "阅读最新投资备忘录",
    portfolioSnapshot: "投资组合摘要",
    timeWeightedReturn: "TWRR",
    twrNote: "时间加权回报・重建值・累计",
    marketValue: "市场价值",
    holdingsUnit: "只股票与 ETF",
    portfolioXirr: "XIRR",
    xirrNote: "资金加权回报・年化",
    aboutLabel: "01 · 关于",
    aboutTitle: ["投资原则与", "持续学习"],
    aboutCopy:
      "分析一只股票是否值得投资时，我先问这家企业值多少钱。我的持仓集中在自己了解的企业。要让复利发挥作用，需要时间，也需要耐心和纪律。",
    aboutLink: "探索投资研究方式",
    portfolioLabel: "02 · 投资组合",
    portfolioTitle: ["为长期复利而建立的", "集中投资组合"],
    fullPortfolio: "查看完整投资组合",
    holdingsAllocation: "持仓占比",
    other: "其他",
    topHoldings: "前四大持仓与其他",
    performanceLabel: "03 · 业绩",
    performanceTitle: ["每月完整披露", "投资业绩"],
    chartLabel: "XIRR 比较图表",
    portfolioName: "投资组合",
    performanceCopy: (benchmarkReturn: string) =>
      `投资组合 XIRR；相同现金流期间的 ${portfolioSnapshot.benchmark} 为 ${benchmarkReturn}。`,
    asOf: "截至",
    viewPerformance: "追踪投资组合业绩",
    memosLabel: "04 · 投资备忘录",
    memosTitle: ["公开投资研究，", ["为自己的", "判断负责"]],
    viewAllMemos: "查看所有投资备忘录",
    contactLabel: "05 · 联系",
    contactTitle: ["持续关注", "最新研究"],
    contactLink: "联系",
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
const allocationGradient = `conic-gradient(var(--blue-deep) 0 ${firstStop}%, var(--blue-medium) ${firstStop}% ${secondStop}%, var(--black) ${secondStop}% ${thirdStop}%, var(--white) ${thirdStop}% ${fourthStop}%, var(--gray-medium) ${fourthStop}% 100%)`;

export function HomePageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const memos = getMemos(locale);
  const latestMemo = getLatestMemo(locale);
  const portfolioDate = formatDate(portfolioSnapshot.asOf, locale, locale === "en");
  const benchmarkReturn = formatPercent(portfolioSnapshot.benchmarkXirr);

  return (
    <div className="home-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: createWebsiteStructuredData() }} />
      <div className={appearance["home-header"]}>
        {/* Always-visible boundaries split hydration while preserving the initial HTML. */}
        <Activity mode="visible">
          <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
        </Activity>
      </div>
      <main id="main-content" tabIndex={-1} className="@container/financial-summary">
        <div className={appearance["home-opening"]}>
          <div className={appearance["hero-band"]}>
            <section className={appearance["hero"] + " @container/financial-summary " + appearance["shell"]}>
              <h1>
                <HeadingPhrases text={text.hero[0]} />
                <ResponsiveHeadingBreak locale={locale} />
                <em>
                  <HeadingPhrases text={text.hero[1]} />
                </em>
              </h1>
              <div className={appearance["hero-bottom"]}>
                <p>{text.heroIntro}</p>
                <div className={appearance["hero-actions"]}>
                  <ButtonLink variant="contrast" href={getLocalizedPath("/portfolio", locale)}>
                    {text.viewPortfolio}
                  </ButtonLink>
                  {latestMemo && (
                    <IntentLink
                      className={appearance["text-link"]}
                      href={getLocalizedPath(`/memos/${latestMemo.slug}`, locale)}
                    >
                      {text.readLatest}
                      <MoveRight className={appearance["arrow-icon"]} aria-hidden="true" strokeWidth={3} />
                    </IntentLink>
                  )}
                </div>
              </div>
              <dl className={appearance["metric-band"]} aria-label={text.portfolioSnapshot}>
                <PortfolioMetric
                  locale={locale}
                  tone="highlight"
                  className="metric compact:overflow-hidden"
                  label={<>{text.timeWeightedReturn}</>}
                  value={<>{formatPercent(portfolioTwrSnapshot.portfolioTwr)}</>}
                  note={<>{text.twrNote}</>}
                />
                <PortfolioMetric
                  locale={locale}
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
                  locale={locale}
                  tone="paper"
                  className="metric compact:overflow-hidden"
                  label={<>{text.portfolioXirr}</>}
                  value={<>{formatPercent(portfolioSnapshot.xirr)}</>}
                  note={<>{text.xirrNote}</>}
                />
              </dl>
            </section>
          </div>
        </div>

        <section className={appearance["home-about"] + " " + appearance["shell"]}>
          <div>
            <p className={appearance["section-number"]}>{text.aboutLabel}</p>
            <h2>
              {text.aboutTitle[0]}
              <ResponsiveHeadingBreak locale={locale} />
              {text.aboutTitle[1]}
            </h2>
          </div>
          <div>
            <div className="max-w-[80ch]">
              <p>{text.aboutCopy}</p>
            </div>
            <IntentLink className={appearance["text-link"]} href={getLocalizedPath("/about", locale)}>
              {text.aboutLink}
              <MoveRight className={appearance["arrow-icon"]} aria-hidden="true" strokeWidth={3} />
            </IntentLink>
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

            {/* Safari needs an explicit list role when markers are removed outside navigation. */}
            {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
            <ol className={appearance["holdings-list"]} role="list">
              {featuredHoldings.map((holding, index) => (
                <li className={appearance["holding-row"]} key={holding.symbol}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>
                      <IntentLink
                        href={getLocalizedPath(holdingPath(holding.symbol), locale)}
                        className="underline underline-offset-4"
                      >
                        {holding.symbol}
                      </IntentLink>
                    </strong>
                    <small>
                      {formatUsd(holding.marketValue, 0)} {text.marketValueSuffix}
                    </small>
                  </div>
                  <b>{getHoldingWeight(holding.marketValue).toFixed(1)}%</b>
                </li>
              ))}
            </ol>
            <Card
              variant="plain"
              role="complementary"
              aria-labelledby="home-allocation-title"
              className={appearance["allocation-card"]}
            >
              <CardHeader className="flex flex-row items-center gap-4 px-0">
                <ChartPie size={24} strokeWidth={2} aria-hidden="true" className="shrink-0" />
                <h3 id="home-allocation-title" className="m-0 text-large-label">
                  {text.holdingsAllocation}
                </h3>
              </CardHeader>
              <CardContent className={appearance["allocation-visual"] + " px-0"}>
                <div className="@container/ring grid w-full max-w-[210px] justify-self-center compact:max-w-[268px]">
                  <div
                    className={appearance["allocation-ring"]}
                    style={{ background: allocationGradient }}
                    role="img"
                    aria-label={text.topHoldings}
                  />
                  <div className={appearance["allocation-caption"]}>
                    <span>{portfolioSnapshot.holdingsCount}</span>
                    <small>{text.holdingsAllocation}</small>
                  </div>
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
              </CardContent>
              <Link href={getLocalizedPath("/portfolio", locale)}>
                <span className="link-label">{text.fullPortfolio}</span>
                <MoveRight className={appearance["arrow-icon"]} aria-hidden="true" strokeWidth={3} />
              </Link>
            </Card>
          </section>
        </div>

        <section className={appearance["performance-home"]}>
          <div className={appearance["shell"] + " @container/home-performance"}>
            <div className={appearance["section-heading"] + " " + "inverse"}>
              <p className={appearance["section-number"]}>{text.performanceLabel}</p>
              <h2>
                {text.performanceTitle[0]}
                <br />
                {text.performanceTitle[1]}
              </h2>
            </div>
            <div className={appearance["performance-grid"]}>
              <HomeReturnBars
                label={text.chartLabel}
                series={[
                  { name: text.portfolioName, value: portfolioSnapshot.xirr },
                  { name: portfolioSnapshot.benchmark, value: portfolioSnapshot.benchmarkXirr },
                ]}
              />
              <div className={appearance["performance-copy"]}>
                <div
                  className="performance-value financial-value-scroll max-w-full overflow-x-auto overflow-y-hidden"
                  role="region"
                  aria-label="XIRR"
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Native scroll regions need keyboard focus.
                  tabIndex={0}
                >
                  <strong className="block w-max min-w-full whitespace-nowrap">
                    {formatPercent(portfolioSnapshot.xirr)}
                  </strong>
                </div>
                <p>{text.performanceCopy(benchmarkReturn)}</p>
                <small className={appearance["date-text"]}>
                  {text.asOf} <time dateTime={portfolioSnapshot.asOf}>{portfolioDate}</time> · {text.updatedMonthly}
                  {locale === "en" ? "." : "。"}
                </small>
                <ButtonLink
                  variant="contrast"
                  className="button-white mt-[var(--space-48px)]"
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
                <ResponsiveHeadingBreak locale={locale} />
                <HeadingPhrases text={text.memosTitle[1]} />
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
            <p className={appearance["eyebrow"]}>{text.contactLabel}</p>
            <h2>
              {text.contactTitle[0]}
              {locale === "en" ? " " : <br className="compact:hidden" />}
              {text.contactTitle[1]}
            </h2>
            <ButtonLink href={getLocalizedPath("/contact", locale)}>{text.contactLink}</ButtonLink>
          </section>
        </div>
      </main>
      <Activity mode="visible">
        <PageFooter locale={locale} />
      </Activity>
    </div>
  );
}
