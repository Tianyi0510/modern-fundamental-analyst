import assert from "node:assert/strict";
import test from "node:test";
const { portfolioSnapshot, portfolioHoldings, portfolioMonthlyReturns } = await import("../data/portfolio.ts");

test("August snapshot reconciles to statement-backed values and retained income", () => {
  assert.equal(portfolioSnapshot.asOf, "2026-08-31");
  assert.equal(portfolioHoldings.length, 18);
  assert.ok(Math.abs(portfolioSnapshot.marketValue - 121301.99) < 0.001);
  assert.ok(Math.abs(portfolioSnapshot.costBasis - 96425.3742) < 0.001);
  const expectedReturn = ((121301.99 - 96425.3742 + 526.69 - 85.75) / 96425.3742) * 100;
  assert.ok(Math.abs(portfolioSnapshot.totalReturn - expectedReturn) < 1e-9);
  assert.equal(portfolioHoldings.find((row) => row.symbol === "PYPL").price, 52.665);
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

test("portfolio source data has unique holdings and finite nonnegative inputs", () => {
  assert.equal(new Set(portfolioHoldings.map((row) => row.symbol)).size, portfolioHoldings.length);
  for (const row of portfolioHoldings) {
    assert.ok(row.symbol.trim().length > 0);
    for (const field of ["shares", "costBasis", "price", "marketValue"]) {
      assert.ok(Number.isFinite(row[field]) && row[field] >= 0, `${row.symbol}: invalid ${field}`);
    }
    assert.ok(row.shares > 0, `${row.symbol}: empty position`);
  }
  for (const field of ["netDividends", "financingInterest"]) {
    assert.ok(Number.isFinite(portfolioSnapshot[field]) && portfolioSnapshot[field] >= 0, field);
  }
});

test("history contains consecutive calendar month-ends and paired XIRRs", () => {
  let previousMonth;
  for (const row of portfolioMonthlyReturns) {
    assert.match(row.date, /^\d{4}-\d{2}-\d{2}$/);
    const date = new Date(`${row.date}T00:00:00Z`);
    assert.equal(date.toISOString().slice(0, 10), row.date);
    const nextDay = new Date(date.getTime() + 86400000);
    assert.equal(nextDay.getUTCDate(), 1, `${row.date}: not a month-end`);
    const month = date.getUTCFullYear() * 12 + date.getUTCMonth();
    if (previousMonth !== undefined) assert.equal(month, previousMonth + 1, "Missing or duplicate month");
    previousMonth = month;
    assert.ok(Number.isFinite(row.marketValue) && row.marketValue >= 0, row.date);
    assert.equal(row.portfolioXirr === null, row.benchmarkXirr === null, row.date);
  }
  assert.ok(Number.isFinite(portfolioSnapshot.xirr) && Number.isFinite(portfolioSnapshot.benchmarkXirr));
});
