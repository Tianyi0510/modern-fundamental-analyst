import assert from "node:assert/strict";
import test from "node:test";

import { read } from "../../../scripts/repository-helpers.mjs";

test("portfolio calculations remain internally consistent", async () => {
  const {
    getHoldingCostPerShare,
    getHoldingReturn,
    getHoldingWeight,
    getPortfolioTotals,
    portfolioHoldings,
    portfolioSnapshot,
    portfolioIncome,
  } = await import("@/features/portfolio/portfolio.ts");
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

test("dates use localized month names and consistent day order", async () => {
  const { formatDate } = await import("@/lib/format.ts");
  assert.equal(formatDate("2026-01-02", "en"), "2 January 2026");
  assert.equal(formatDate("2026-01-02", "en", true), "2 Jan 2026");
  assert.equal(formatDate("2026-01-02", "zh-tw", true), "2026年1月2日");
  assert.equal(formatDate("2026-01-02", "zh-cn", true), "2026年1月2日");
});

test("date formatting rejects impossible and noncanonical dates", async () => {
  const { formatDate } = await import("@/lib/format.ts");

  assert.equal(formatDate("2024-02-29", "en"), "29 February 2024");
  assert.throws(() => formatDate("2026-02-30", "en"), RangeError);
  assert.throws(() => formatDate("2025-02-29", "zh-tw"), RangeError);
  assert.throws(() => formatDate("2026-2-05", "zh-cn"), RangeError);
});

test("percent formatting handles positive, zero, and negative values", async () => {
  const { formatPercent } = await import("@/lib/format.ts");

  assert.equal(formatPercent(3.2), "+3.20%");
  assert.equal(formatPercent(0), "0.00%");
  assert.equal(formatPercent(-3.2), "-3.20%");
});

test("all portfolio and performance locales compose their shared page components", async () => {
  const pages = await Promise.all(
    ["(en)", "zh-tw", "zh-cn"].flatMap((segment) =>
      ["portfolio", "performance"].map(async (route) => ({
        route,
        source: await read(`src/app/${segment}/${route}/page.tsx`),
      })),
    ),
  );

  for (const { route, source } of pages) {
    assert.match(source, route === "portfolio" ? /PortfolioPageContent/ : /PerformancePageContent/);
  }
});

test("portfolio page retains its server boundary and table keeps localized copy outside the client", async () => {
  const [table, page] = await Promise.all([
    read("src/features/portfolio/portfolio-table.tsx"),
    read("src/app/_components/portfolio-page-content.tsx"),
  ]);

  assert.match(table, /"use client"/);
  assert.doesNotMatch(page, /^\s*["']use client["']/);
  assert.doesNotMatch(table, /投資組合持股|投资组合持仓|"zh-tw"|"zh-cn"/);
});
