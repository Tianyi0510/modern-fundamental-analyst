import assert from "node:assert/strict";
import test from "node:test";

import { read } from "./repository-helpers.mjs";

test("portfolio calculations remain internally consistent", async () => {
  const {
    getHoldingCostPerShare,
    getHoldingReturn,
    getHoldingWeight,
    getPortfolioTotals,
    portfolioHoldings,
    portfolioSnapshot,
    portfolioIncome,
  } = await import("../data/portfolio.ts");
  const totals = getPortfolioTotals(portfolioHoldings, portfolioIncome);

  assert.equal(totals.holdingsCount, portfolioHoldings.length);
  assert.equal(totals.costBasis, portfolioSnapshot.costBasis);
  assert.equal(totals.marketValue, portfolioSnapshot.marketValue);
  assert.equal(totals.totalReturn, portfolioSnapshot.totalReturn);

  for (const holding of portfolioHoldings) {
    assert.ok(holding.costBasis > 0, `${holding.symbol} must have a positive cost basis`);
    assert.ok(getHoldingCostPerShare(holding) > 0, `${holding.symbol} must have a positive per-share cost`);
    assert.ok(
      Math.abs(getHoldingCostPerShare(holding) * holding.shares - holding.costBasis) < 0.001,
      `${holding.symbol} per-share cost must reconcile to net cost basis`,
    );
    assert.ok(Number.isFinite(getHoldingReturn(holding)), `${holding.symbol} must have a finite return`);
    assert.ok(
      Math.abs(holding.shares * holding.price - holding.marketValue) < 0.01,
      `${holding.symbol} market value must equal shares × price`,
    );
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

test("date formatting rejects impossible and noncanonical dates", async () => {
  const { formatDate } = await import("../lib/format.ts");

  assert.equal(formatDate("2024-02-29", "en"), "29 February 2024");
  assert.throws(() => formatDate("2026-02-30", "en"), RangeError);
  assert.throws(() => formatDate("2025-02-29", "zh-tw"), RangeError);
  assert.throws(() => formatDate("2026-2-05", "zh-cn"), RangeError);
});

test("percent formatting handles positive, zero, and negative values", async () => {
  const { formatPercent } = await import("../lib/format.ts");

  assert.equal(formatPercent(3.2), "+3.20%");
  assert.equal(formatPercent(0), "0.00%");
  assert.equal(formatPercent(-3.2), "-3.20%");
});

test("all portfolio and performance locales share page structures", async () => {
  const [
    portfolioEn,
    portfolioZhTw,
    portfolioZhCn,
    performanceEn,
    performanceZhTw,
    performanceZhCn,
    portfolioShared,
    performanceShared,
    portfolioTable,
  ] = await Promise.all([
    read("app/(en)/portfolio/page.tsx"),
    read("app/zh-tw/portfolio/page.tsx"),
    read("app/zh-cn/portfolio/page.tsx"),
    read("app/(en)/performance/page.tsx"),
    read("app/zh-tw/performance/page.tsx"),
    read("app/zh-cn/performance/page.tsx"),
    read("components/portfolio-page-content.tsx"),
    read("components/performance-page-content.tsx"),
    read("components/portfolio-table.tsx"),
  ]);

  for (const page of [portfolioEn, portfolioZhTw, portfolioZhCn]) assert.match(page, /PortfolioPageContent/);
  for (const page of [performanceEn, performanceZhTw, performanceZhCn]) assert.match(page, /PerformancePageContent/);
  assert.match(portfolioShared, /aria-labelledby="portfolio-holdings-title"/);
  assert.doesNotMatch(portfolioShared, /portfolio-allocation|Allocation by market value|getHoldingWeight/);
  assert.doesNotMatch(portfolioShared, /portfolio-source-note|Source Sheet:/);
  assert.match(portfolioTable, /costPerShare:\s*getHoldingCostPerShare\(holding\)/);
  assert.match(portfolioTable, /sortKey === "costBasis"\) return row\.costPerShare/);
  assert.match(portfolioTable, /formatUsd\(costPerShare\)/);
  assert.match(portfolioTable, /portfolio-total-market[^>]*>\s*\{formatUsd\(totals\.marketValue\)\}\s*<\/span>/);
  assert.match(portfolioTable, /portfolio-total-return[\s\S]*?\{formatPercent\(totals\.totalReturn\)\}/);
  assert.match(performanceShared, /className="methodology-source"/);
  assert.match(performanceShared, /Prices and market values use closing prices as of \{asOf\}/);
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
  assert.match(
    page,
    /PortfolioTable copy=\{tableCopy\[locale\]\} holdings=\{portfolioHoldings\} income=\{portfolioIncome\}/,
  );
});
