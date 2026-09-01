import assert from "node:assert/strict";
import test from "node:test";

import { read, readStyles } from "./repository-helpers.mjs";

test("portfolio totals are derived from holdings", async () => {
  const [portfolio, calculations] = await Promise.all([
    read("data/portfolio.ts"),
    read("lib/portfolio-calculations.ts"),
  ]);

  assert.match(calculations, /holdings\.reduce/);
  assert.match(calculations, /getSafeRatio\(marketValue - costBasis, costBasis\)/);
  assert.match(calculations, /holdingsCount: holdings\.length/);
  assert.match(calculations, /getHoldingReturn/);
  assert.match(calculations, /getSafeRatio\(holding\.costBasis, holding\.shares\)/);
  assert.match(portfolio, /getPortfolioTotals\(portfolioHoldings\)/);
  assert.doesNotMatch(portfolio, /returnPct:/);
  assert.doesNotMatch(portfolio, /totalReturn:\s*22\b/);
});

test("portfolio calculations remain internally consistent", async () => {
  const { getHoldingCostPerShare, getHoldingReturn, getHoldingWeight, getPortfolioTotals, portfolioHoldings, portfolioSnapshot } = await import("../data/portfolio.ts");
  const totals = getPortfolioTotals(portfolioHoldings);

  assert.equal(totals.holdingsCount, portfolioHoldings.length);
  assert.equal(totals.costBasis, portfolioSnapshot.costBasis);
  assert.equal(totals.marketValue, portfolioSnapshot.marketValue);
  assert.equal(totals.totalReturn, portfolioSnapshot.totalReturn);

  for (const holding of portfolioHoldings) {
    assert.ok(holding.costBasis > 0, `${holding.symbol} must have a positive cost basis`);
    assert.ok(getHoldingCostPerShare(holding) > 0, `${holding.symbol} must have a positive per-share cost`);
    assert.ok(Math.abs(getHoldingCostPerShare(holding) * holding.shares - holding.costBasis) < 0.001, `${holding.symbol} per-share cost must reconcile to net cost basis`);
    assert.ok(Number.isFinite(getHoldingReturn(holding)), `${holding.symbol} must have a finite return`);
    assert.ok(Math.abs(holding.shares * holding.price - holding.marketValue) < 0.01, `${holding.symbol} market value must equal shares × price`);
  }

  assert.equal(getHoldingCostPerShare({ costBasis: 0, shares: 0 }), 0);
  assert.equal(getHoldingReturn({ costBasis: 0, marketValue: 0 }), 0);
  assert.equal(getPortfolioTotals([]).totalReturn, 0);
  assert.equal(getHoldingWeight(100, 0), 0);
  assert.equal(getHoldingWeight(Number.NaN, 100), 0);
});

test("portfolio dates are formatted from the snapshot date", async () => {
  const [format, home, portfolioPage, performancePage] = await Promise.all([
    read("lib/format.ts"),
    read("components/home-page-content.tsx"),
    read("components/portfolio-page-content.tsx"),
    read("components/performance-page-content.tsx"),
  ]);

  assert.match(format, /formatDate/);
  assert.match(format, /const dateFormatters = new Map<string, Intl\.DateTimeFormat>\(\)/);
  assert.match(format, /getDateFormatter\(locale, compact\)\.format\(date\)/);
  for (const source of [home, portfolioPage, performancePage]) {
    assert.match(source, /formatDate/);
    assert.doesNotMatch(source, /31 July 2026|2026 年 7 月 31 日/);
  }
});

test("percent formatting handles positive, zero, and negative values", async () => {
  const source = await read("lib/format.ts");
  const { formatPercent } = await import("../lib/format.ts");

  assert.match(source, /const percentFormatters = new Map<number, Intl\.NumberFormat>\(\)/);
  assert.match(source, /MAX_CACHED_FRACTION_DIGITS = 4/);
  assert.match(source, /shouldCacheFormatter\(fractionDigits\)/);
  assert.match(source, /percentFormatters\.get\(fractionDigits\)/);
  assert.match(source, /percentFormatters\.set\(fractionDigits, formatter\)/);
  assert.equal(formatPercent(3.2), "+3.20%");
  assert.equal(formatPercent(0), "0.00%");
  assert.equal(formatPercent(-3.2), "-3.20%");
});

test("portfolio sorting precomputes derived values once per holding", async () => {
  const source = await read("components/portfolio-table.tsx");

  assert.match(source, /const rows = useMemo\(\(\) => holdings\.map/);
  assert.match(source, /returnPct: getHoldingReturn\(holding\)/);
  assert.match(source, /weight: getHoldingWeight\(holding\.marketValue, totals\.marketValue\)/);
  assert.match(source, /const sortedRows = useMemo\(\(\) => \{[\s\S]*?const getSortValue[\s\S]*?return rows\.toSorted/);
  assert.doesNotMatch(source, /toSorted\(\(a, b\) => \{[\s\S]*?getHolding(?:Return|Weight)\(/);
});

test("all portfolio and performance locales share page structures", async () => {
  const [portfolioEn, portfolioZhTw, portfolioZhCn, performanceEn, performanceZhTw, performanceZhCn, portfolioShared, performanceShared, portfolioTable, styles] = await Promise.all([
    read("app/(en)/portfolio/page.tsx"),
    read("app/zh-tw/portfolio/page.tsx"),
    read("app/zh-cn/portfolio/page.tsx"),
    read("app/(en)/performance/page.tsx"),
    read("app/zh-tw/performance/page.tsx"),
    read("app/zh-cn/performance/page.tsx"),
    read("components/portfolio-page-content.tsx"),
    read("components/performance-page-content.tsx"),
    read("components/portfolio-table.tsx"),
    readStyles(),
  ]);

  assert.match(portfolioEn, /PortfolioPageContent/);
  assert.match(portfolioZhTw, /PortfolioPageContent/);
  assert.match(portfolioZhCn, /PortfolioPageContent/);
  assert.match(performanceEn, /PerformancePageContent/);
  assert.match(performanceZhTw, /PerformancePageContent/);
  assert.match(performanceZhCn, /PerformancePageContent/);
  assert.doesNotMatch(portfolioShared, /portfolio-allocation|Allocation by market value|getHoldingWeight/);
  assert.doesNotMatch(portfolioShared, /portfolio-source-note|Source Sheet:/);
  assert.match(portfolioShared, /className="portfolio-holdings-section"/);
  assert.match(portfolioShared, /aria-labelledby="portfolio-holdings-title"/);
  assert.match(portfolioTable, /costPerShare:\s*getHoldingCostPerShare\(holding\)/);
  assert.match(portfolioTable, /sortKey === "costBasis"\) return row\.costPerShare/);
  assert.match(portfolioTable, /formatUsd\(costPerShare\)/);
  assert.match(portfolioTable, /const columns: SortKey\[\] = \["symbol", "shares", "price", "costBasis", "marketValue", "returnPct", "weight"\]/);
  assert.doesNotMatch(portfolioTable, /toSorted\(\(a, b\) => \{\s*const getSortValue/);
  assert.doesNotMatch(portfolioTable, /formatUsd\(totals\.costBasis\)|100\.0%/);
  assert.match(portfolioTable, /portfolio-total-market[^>]*>\{formatUsd\(totals\.marketValue\)\}<\/span>/);
  assert.match(portfolioTable, /portfolio-total-return[\s\S]*?\{formatPercent\(totals\.totalReturn\)\}/);
  assert.doesNotMatch(portfolioTable, /portfolio-total-(?:cost|weight)/);
  assert.doesNotMatch(portfolioTable, /role="cell" data-label=\{copy\.(?:costBasis|weight)\} \/>/);
  assert.match(styles, /\.portfolio-total-row \.portfolio-total-return\s*\{\s*font-weight:\s*var\(--weight-bold\)/s);
  assert.match(performanceShared, /className="methodology-source"/);
  assert.match(performanceShared, /Prices and market values use closing prices as of \{asOf\}/);
  assert.match(styles, /grid-template-areas:\s*"market return" "cost holdings"/);
  assert.match(styles, /\.metric-band\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/s);
  assert.match(styles, /\.portfolio-kpis\s*\{[^}]*min-height:\s*480px/s);
  assert.match(styles, /\.portfolio-kpis\s*\{[^}]*gap:\s*0;[^}]*background:\s*transparent/s);
  assert.match(styles, /\.portfolio-kpis > div\s*\{[^}]*background:\s*var\(--white\)/s);
  assert.match(styles, /\.home-page \.metric,\s*\.portfolio-page \.portfolio-kpis > div,\s*\.performance-page \.performance-summary > div\s*\{[^}]*min-height:\s*240px;[^}]*padding:\s*var\(--space-5\)/s);
  assert.match(styles, /\.metric,[\s\S]*?\.portfolio-kpis > div,[\s\S]*?\.performance-summary > div\s*\{\s*display:\s*flex;\s*flex-direction:\s*column;/);
  assert.match(styles, /\.metric strong,[\s\S]*?\.portfolio-kpis strong,[\s\S]*?\.performance-summary strong\s*\{\s*margin-top:\s*auto;/);
  assert.match(styles, /\.home-page \.metric strong,[\s\S]*?\.portfolio-page \.portfolio-kpis strong,[\s\S]*?\.performance-summary strong\s*\{[^}]*font-size:\s*var\(--font-size-data-kpi\);/s);
  assert.doesNotMatch(styles, /@media \(max-width:\s*800px\)[\s\S]*?(?:\.metric|\.portfolio-kpis|\.performance-summary) strong\s*\{[^}]*font-size:/s);
  assert.match(styles, /\.metric small,[\s\S]*?\.portfolio-kpis small,[\s\S]*?\.performance-summary small\s*\{[^}]*margin-top:\s*14px;[^}]*opacity:\s*\.62/s);
  assert.match(styles, /\.portfolio-page \.portfolio-row span:nth-child\(2\)\s*\{\s*color:\s*var\(--black\)/);
  assert.match(styles, /@media \(max-width:\s*800px\)[\s\S]*?\.home-page \.metric,\s*\.portfolio-page \.portfolio-kpis > div,\s*\.performance-page \.performance-summary > div\s*\{[^}]*min-height:\s*168px;[^}]*padding:\s*var\(--space-5\) var\(--space-page-gutter\)/s);
  assert.match(styles, /\.portfolio-holdings-section\s*\{[^}]*background:\s*var\(--background-gray\)/s);
  assert.match(styles, /\.portfolio-holdings-section \.portfolio-total-row\s*\{[^}]*background:\s*transparent/s);
  assert.match(styles, /\.portfolio-mobile-sort\s*\{\s*display:\s*none;/s);
  assert.match(styles, /@media \(max-width:\s*800px\)[\s\S]*?\.portfolio-mobile-sort\s*\{[^}]*display:\s*grid;/s);
  assert.match(styles, /@media \(max-width:\s*800px\)[\s\S]*?\.portfolio-page \.portfolio-kpis\s*\{[^}]*grid-template-columns:\s*1fr;[^}]*grid-template-areas:\s*"market" "cost" "return" "holdings"/s);
  assert.match(styles, /\.portfolio-mobile-sort\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);[^}]*gap:\s*8px 12px/s);
  assert.match(styles, /\.portfolio-mobile-sort label\s*\{[^}]*display:\s*contents/s);
  assert.match(styles, /\.portfolio-mobile-sort label > span\s*\{[^}]*grid-column:\s*1 \/ -1/s);
  assert.match(styles, /\.portfolio-mobile-sort select,\s*\.portfolio-mobile-sort button\s*\{[^}]*box-sizing:\s*border-box;[^}]*width:\s*100%;[^}]*height:\s*var\(--size-control\);[^}]*margin:\s*0;/s);
  assert.match(styles, /\.portfolio-mobile-sort button\s*\{[^}]*display:\s*inline-flex;[^}]*justify-content:\s*center/s);
  assert.match(styles, /\.portfolio-table-detailed \.portfolio-row > \[role="cell"\]::before\s*\{[^}]*content:\s*attr\(data-label\)/s);
  assert.match(styles, /\.portfolio-table-detailed \.portfolio-row > span\[role="cell"\]:not\(:first-child\)\s*\{[^}]*text-align:\s*left/s);
  assert.doesNotMatch(styles, /--portfolio-mobile-inline/);
  assert.match(styles, /\.portfolio-table-detailed \.portfolio-total-market\s*\{[^}]*grid-column:\s*1;[^}]*grid-row:\s*2;/s);
  assert.match(styles, /\.portfolio-table-detailed \.portfolio-total-return\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*2;/s);
  assert.match(performanceShared, /className="methodology shell section-gray"/);
  assert.match(styles, /--background-gray:\s*#f8f9fb/);
  assert.match(styles, /\.section-gray\s*\{[^}]*background:\s*var\(--background-gray\)/s);
  assert.match(styles, /\.hero,[\s\S]*?\.page-hero,[\s\S]*?\.memo-article-header\s*\{[^}]*background:\s*var\(--background-gray\)/s);
});

test("portfolio table receives only the active locale labels from its server parent", async () => {
  const [table, page] = await Promise.all([
    read("components/portfolio-table.tsx"),
    read("components/portfolio-page-content.tsx"),
  ]);

  assert.match(table, /"use client"/);
  assert.match(table, /copy: PortfolioTableCopy/);
  assert.doesNotMatch(table, /投資組合持股|投资组合持仓|"zh-tw"|"zh-cn"/);
  assert.match(page, /satisfies Record<Locale, PortfolioTableCopy>/);
  assert.match(page, /PortfolioTable copy=\{tableCopy\[locale\]\} holdings=\{portfolioHoldings\}/);
});
