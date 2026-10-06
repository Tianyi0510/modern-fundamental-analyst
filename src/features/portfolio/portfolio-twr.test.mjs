import assert from "node:assert/strict";
import test from "node:test";
import { portfolioClosingMarks } from "./portfolio-closing-marks.ts";
import { portfolioMonthlyValuations } from "./portfolio-detail.ts";
import { portfolioTwrMonthlyReturns, portfolioTwrSnapshot, portfolioTwrValuations } from "./portfolio-twr.ts";

test("reconstructed month-end positions reconcile to every published broker stock valuation", () => {
  assert.equal(portfolioClosingMarks.length, 450);
  assert.equal(portfolioTwrMonthlyReturns.length, 22);
  for (const [index, source] of portfolioMonthlyValuations.entries()) {
    const actual = portfolioTwrMonthlyReturns[index];
    assert.equal(actual.date, source.date);
    assert.ok(Math.abs(actual.endingValue - source.stockValue) < 0.011, source.date);
  }
  assert.equal(portfolioTwrSnapshot.startDate, "2024-12-30");
  assert.equal(portfolioTwrSnapshot.date, "2026-09-30");
  assert.ok(Math.abs(portfolioTwrSnapshot.portfolioTwr - 38.2694002516289) < 0.000001);
  assert.ok(Math.abs(portfolioTwrSnapshot.benchmarkTwr - 32.19753204498825) < 0.000001);
});

test("monthly returns geometrically reproduce cumulative TWR, including the first period", () => {
  const growth = portfolioTwrMonthlyReturns.reduce((value, row) => value * (1 + row.monthlyTwr / 100), 1);
  assert.ok(Math.abs((growth - 1) * 100 - portfolioTwrSnapshot.portfolioTwr) < 1e-10);
});

test("non-trading dates use preceding closes and split/gift movements stay separate", () => {
  const weekend = portfolioClosingMarks.find((row) => row.date === "2025-01-11");
  assert.equal(weekend.priceDate, "2025-01-10");
  const split = portfolioTwrValuations.find((row) => row.date === "2026-04-21");
  assert.equal(split.contribution, 0);
  assert.ok(portfolioTwrValuations.find((row) => row.date === "2025-03-04").contribution > 0);
  assert.ok(portfolioTwrValuations.find((row) => row.date === "2025-03-10").contribution > 0);
});
