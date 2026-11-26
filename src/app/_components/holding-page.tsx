import { ArrowRight } from "lucide-react";
import { getHoldingResearch } from "@/features/portfolio/holding-research";
import { HoldingResearchSection } from "@/features/portfolio/holding-research-section";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header/site-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { holdingPath } from "@/features/portfolio/holding-path";
import { portfolioHoldings, portfolioSnapshot, getHoldingWeight } from "@/features/portfolio/portfolio";
import { getHoldingCostPerShare, getHoldingReturn } from "@/features/portfolio/portfolio-calculations";
import { portfolioMonthlyValuations } from "@/features/portfolio/portfolio-detail";
import { PortfolioMetric } from "@/features/portfolio/portfolio-metric";
import { formatDate, formatPercent, formatShares, formatUsd } from "@/lib/format";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";
import { createPageMetadata } from "@/lib/site-config";
import { PageFooter } from "./page-footer";
import { appearance } from "./portfolio-page-content.styles";

const copy = {
  en: {
    portfolio: "Portfolio",
    asOf: "As of",
    value: "Market Value",
    weight: "Portfolio Weight",
    total: "Share of disclosed holdings by market value",
    returns: "Position Return",
    basis: "Average cost per share",
    shares: "Shares",
    price: "Closing Price",
    date: "Month End",
    history: "Month-End Positions",
    note: "All amounts are in U.S. dollars. Position return measures the gain or loss on the purchase cost, including fees. Only the portfolio return includes dividends and financing interest.",
    allHoldings: "View All Holdings",
    records: (n: number) => (n === 1 ? "1 monthly record" : `${n} monthly records`),
    description: (symbol: string) =>
      `Monthly holdings, closing prices and position values for ${symbol} in the disclosed portfolio.`,
  },
  "zh-tw": {
    portfolio: "投資組合",
    asOf: "截至",
    value: "持股市值",
    weight: "投資組合權重",
    total: "佔已揭露持股總市值的比例",
    returns: "持股報酬率",
    basis: "每股平均成本",
    shares: "股數",
    price: "收盤價",
    date: "月底日期",
    history: "歷月持股",
    note: "金額均以美元計。持股報酬率的算法是用市值減去買入成本，再除以買入成本。成本包含手續費。股息與融資利息只計入整體投資組合的報酬率。",
    allHoldings: "查看全部持股",
    records: (n: number) => `${n} 筆月底紀錄`,
    description: (symbol: string) => `查看投資組合中 ${symbol} 的歷月持股、收盤價與市值。`,
  },
  "zh-cn": {
    portfolio: "投资组合",
    asOf: "截至",
    value: "持仓市值",
    weight: "投资组合权重",
    total: "占已披露持仓总市值的比例",
    returns: "持仓回报率",
    basis: "每股平均成本",
    shares: "股数",
    price: "收盘价",
    date: "月底日期",
    history: "历月持仓",
    note: "金额均以美元计。持仓回报率的算法是用市值减去买入成本，再除以买入成本。成本包含手续费。股息和融资利息只计入整个投资组合的回报率。",
    allHoldings: "查看全部持仓",
    records: (n: number) => `${n} 条月末记录`,
    description: (symbol: string) => `查看投资组合中 ${symbol} 的历月持仓、收盘价与市值。`,
  },
};

export function getHoldingParams() {
  return portfolioHoldings.map(({ symbol }) => ({ symbol: symbol.toLowerCase() }));
}

function findHolding(slug: string) {
  return portfolioHoldings.find((holding) => holding.symbol.toLowerCase() === slug) ?? notFound();
}

export function holdingMetadata(locale: Locale, slug: string) {
  const { symbol } = findHolding(slug);
  const text = copy[locale];
  return createPageMetadata({
    locale,
    path: holdingPath(symbol),
    title: `${symbol} · ${getHoldingResearch(symbol).name} · ${text.portfolio}`,
    description: text.description(symbol),
  });
}

export function HoldingPage({ locale, slug }: { locale: Locale; slug: string }) {
  const holding = findHolding(slug);
  const { symbol, shares, marketValue, price } = holding;
  const text = copy[locale];
  const profile = getHoldingResearch(symbol);
  const history = portfolioMonthlyValuations.toReversed().flatMap((month) => {
    const quantities: Readonly<Record<string, number>> = month.shares;
    const prices: Readonly<Record<string, number>> = month.prices;
    const quantity = quantities[symbol];
    const close = prices[symbol];
    return quantity && close !== undefined ? [{ date: month.date, quantity, close }] : [];
  });
  const oldest = history.at(-1);
  const latest = history[0];
  return (
    <>
      <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
      <main id="main-content" tabIndex={-1}>
        <PageHero
          variant="portfolio"
          action={
            <ButtonLink
              variant="quiet"
              size="text"
              className="gap-[var(--space-8px)]"
              href={getLocalizedPath("/portfolio", locale)}
            >
              {text.allHoldings}
              <ArrowRight aria-hidden="true" size={18} />
            </ButtonLink>
          }
          title={<em>{symbol}</em>}
          intro={
            <>
              <p>
                {profile.name} <span className="whitespace-nowrap">· {profile.exchange}</span>
              </p>
              <small>
                {text.asOf} <time dateTime={portfolioSnapshot.asOf}>{formatDate(portfolioSnapshot.asOf, locale)}</time>
              </small>
            </>
          }
        >
          <dl className={appearance["portfolio-kpis"]}>
            <PortfolioMetric
              locale={locale}
              tone="plain"
              label={text.value}
              value={formatUsd(marketValue)}
              note={`${formatShares(shares)} × ${formatUsd(price)}`}
            />
            <PortfolioMetric
              locale={locale}
              tone="brand"
              label={text.returns}
              value={formatPercent(getHoldingReturn(holding), 1)}
              note={`${text.basis} · ${formatUsd(getHoldingCostPerShare(holding))}`}
            />
            <PortfolioMetric
              locale={locale}
              tone="paper"
              label={text.weight}
              value={`${getHoldingWeight(marketValue).toFixed(1)}%`}
              note={text.total}
            />
          </dl>
        </PageHero>
        <HoldingResearchSection locale={locale} symbol={symbol} />
        <Container
          as="section"
          aria-labelledby="holding-history"
          className="grid items-start gap-y-[var(--space-section-content)] py-[var(--space-section-padding)] min-[1101px]:grid-cols-[var(--grid-columns)] min-[1101px]:gap-x-[var(--grid-column-gap)]"
        >
          <div className="min-w-0 min-[1101px]:col-span-4">
            <h2 id="holding-history" className="m-0 text-small-headline text-brand">
              {text.history}
            </h2>
            <p className="mt-[var(--space-related-content)] text-small-body text-muted-foreground tabular-nums">
              {text.records(history.length)}
              {oldest && latest && (
                <>
                  {" "}
                  · <time dateTime={oldest.date}>{formatDate(oldest.date, locale, true)}</time>
                  {oldest !== latest && (
                    <>
                      {" "}
                      – <time dateTime={latest.date}>{formatDate(latest.date, locale, true)}</time>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
          <Table
            aria-labelledby="holding-history"
            aria-describedby="holding-history-note"
            className="tabular-nums"
            containerProps={{
              className:
                "min-w-0 min-[1101px]:col-span-8 h-[min(24rem,60svh)] overflow-auto focus-visible:-outline-offset-2",
              role: "region",
              "aria-labelledby": "holding-history",
              tabIndex: 0,
            }}
          >
            <TableHeader className="sticky top-0 z-10 bg-muted">
              <TableRow>
                {[text.date, text.shares, text.price, text.value].map((label, index) => (
                  <TableHead key={label} scope="col" className={index ? "text-right" : ""}>
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map(({ date, quantity, close }) => (
                <TableRow key={date}>
                  <TableHead scope="row" className="font-normal">
                    <time dateTime={date}>{formatDate(date, locale, true)}</time>
                  </TableHead>
                  <TableCell className="text-right">{formatShares(quantity)}</TableCell>
                  <TableCell className="text-right">{formatUsd(close)}</TableCell>
                  <TableCell className="text-right font-bold">{formatUsd(quantity * close)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p
            id="holding-history-note"
            className="m-0 max-w-[var(--width-reading)] text-small-body min-[1101px]:col-span-8 min-[1101px]:col-start-5"
          >
            {text.note}
          </p>
        </Container>
      </main>
      <PageFooter locale={locale} />
    </>
  );
}
