import assert from "node:assert/strict";
import test from "node:test";
import { reconstructTimeWeightedReturns } from "./portfolio-twr-calculations.ts";

const mark = (date, price, spyAdjustedClose = 100) => ({
  date,
  priceDate: date,
  prices: { TEST: price },
  spyAdjustedClose,
});
const purchase = (date, shares, grossAmount, fees = 0) => ({ date, symbol: "TEST", shares, grossAmount, fees });
const run = (input) => reconstructTimeWeightedReturns({ cashEvents: [], corporateActions: [], ...input });

test("TWR removes an added contribution and links sub-period returns geometrically", () => {
  const rows = run({
    marks: [mark("2025-01-01", 100), mark("2025-01-02", 110), mark("2025-01-03", 121)],
    purchases: [purchase("2025-01-01", 1, 100), purchase("2025-01-03", 1, 110)],
  });
  assert.ok(Math.abs(rows.at(-1).portfolioTwr - 21) < 1e-10);
  assert.equal(rows.at(-1).contribution, 110);
});

test("TWR includes fees, signed income and financing costs", () => {
  const rows = run({
    marks: [mark("2025-01-01", 100), mark("2025-01-02", 100)],
    purchases: [purchase("2025-01-01", 1, 100, 2)],
    cashEvents: [
      { date: "2025-01-02", amount: 10 },
      { date: "2025-01-02", amount: -1 },
      { date: "2025-01-02", amount: -2 },
    ],
  });
  assert.ok(Math.abs(rows.at(-1).portfolioTwr - (107 / 102 - 1) * 100) < 1e-10);
});

test("gifted securities and splits do not create artificial investment gains", () => {
  const rows = run({
    marks: [mark("2025-01-01", 100), mark("2025-01-02", 100), mark("2025-01-03", 50)],
    purchases: [purchase("2025-01-01", 1, 100)],
    corporateActions: [
      { date: "2025-01-02", symbol: "TEST", kind: "gift", quantity: 1 },
      { date: "2025-01-03", symbol: "TEST", kind: "forwardSplit", factor: 2 },
    ],
  });
  assert.equal(rows.at(-1).portfolioTwr, 0);
  assert.equal(rows[1].contribution, 100);
  assert.equal(rows[2].contribution, 0);
});

test("missing event marks, position prices, transfer prices and invalid ordering fail explicitly", () => {
  const input = { marks: [mark("2025-01-01", 100)], purchases: [purchase("2025-01-01", 1, 100)] };
  assert.throws(() => run({ ...input, cashEvents: [{ date: "2025-01-02", amount: 1 }] }), /Missing TWR event/);
  assert.throws(() => run({ ...input, marks: [{ ...input.marks[0], prices: {} }] }), /Missing TWR position/);
  assert.throws(() => run({ ...input, marks: [...input.marks, ...input.marks] }), /Duplicate/);
  assert.throws(() => run({ ...input, marks: [mark("2025-01-02", 100), ...input.marks] }), /chronological/);
  assert.throws(
    () => run({ ...input, corporateActions: [{ date: "2025-01-01", symbol: "TEST", kind: "gift", quantity: 1 }] }),
    /transfer price/,
  );
});
