import assert from "node:assert/strict";
import test from "node:test";
const { portfolioSnapshot, portfolioHoldings, portfolioMonthlyReturns } = await import("../data/portfolio.ts");

test("August snapshot reconciles to statement-backed values and retained income", () => {
  assert.equal(portfolioSnapshot.asOf, "2026-08-31");
  assert.equal(portfolioHoldings.length, 18);
  assert.ok(Math.abs(portfolioSnapshot.marketValue - 121301.99) < 0.001);
  assert.ok(Math.abs(portfolioSnapshot.costBasis - 96425.3742) < 0.001);
  const expectedReturn = (121301.99 - 96425.3742 + 526.69 - 85.75) / 96425.3742 * 100;
  assert.ok(Math.abs(portfolioSnapshot.totalReturn - expectedReturn) < 1e-9);
  assert.equal(portfolioHoldings.find(row => row.symbol === "PYPL").price, 52.665);
});

test("monthly XIRR history preserves unavailable periods and matches the latest snapshot", () => {
  assert.equal(portfolioMonthlyReturns.length, 21);
  assert.equal(portfolioMonthlyReturns[0].date, "2024-12-31");
  assert.equal(portfolioMonthlyReturns[0].portfolioXirr, null);
  assert.equal(portfolioMonthlyReturns[0].benchmarkXirr, null);
  for (let index = 1; index < portfolioMonthlyReturns.length; index++) {
    const row = portfolioMonthlyReturns[index];
    assert.ok(row.date > portfolioMonthlyReturns[index - 1].date);
    assert.ok(Number.isFinite(row.portfolioXirr) && Number.isFinite(row.benchmarkXirr));
  }
  const latest = portfolioMonthlyReturns.at(-1);
  assert.equal(latest.date, portfolioSnapshot.asOf);
  assert.ok(Math.abs(latest.marketValue - portfolioSnapshot.marketValue) < 0.001);
  assert.equal(latest.portfolioXirr, portfolioSnapshot.xirr);
  assert.equal(latest.benchmarkXirr, portfolioSnapshot.benchmarkXirr);
});
