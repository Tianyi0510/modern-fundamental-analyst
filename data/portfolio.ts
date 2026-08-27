import {
  getHoldingWeight as calculateHoldingWeight,
  getPortfolioTotals,
  type PortfolioHolding,
} from "@/lib/portfolio-calculations";

export { getHoldingReturn, getPortfolioTotals } from "@/lib/portfolio-calculations";
export type { PortfolioHolding } from "@/lib/portfolio-calculations";

export const portfolioHoldings = [
  { symbol: "ADBE", shares: 25, stockCost: 8500, costBasis: 8506.05, price: 250.41, marketValue: 6260.25 },
  { symbol: "AMD", shares: 30, stockCost: 3328.25, costBasis: 3344.27, price: 476.15, marketValue: 14284.5 },
  { symbol: "AMZN", shares: 33, stockCost: 6596, costBasis: 6614.01, price: 271.58, marketValue: 8962.14 },
  { symbol: "BMNR", shares: 100, stockCost: 3200, costBasis: 3204.28, price: 17.28, marketValue: 1728 },
  { symbol: "BRK.B", shares: 6, stockCost: 2748, costBasis: 2759.94, price: 511.54, marketValue: 3069.24 },
  { symbol: "DELL", shares: 18, stockCost: 1849.35, costBasis: 1853.39, price: 405.37, marketValue: 7296.66 },
  { symbol: "DUOL", shares: 30, stockCost: 8250, costBasis: 8256.06, price: 134.81, marketValue: 4044.3 },
  { symbol: "GOOG", shares: 15, stockCost: 2760, costBasis: 2764.03, price: 356.65, marketValue: 5349.75 },
  { symbol: "GRNY", shares: 300, stockCost: 5354, costBasis: 5366.84, price: 27.01, marketValue: 8103 },
  { symbol: "LLY", shares: 5, stockCost: 3725, costBasis: 3727, price: 1148.84, marketValue: 5744.2 },
  { symbol: "META", shares: 15, stockCost: 9675, costBasis: 9686.99, price: 556.71, marketValue: 8350.65 },
  { symbol: "MSFT", shares: 25, stockCost: 10749.84, costBasis: 10765.85, price: 464.72, marketValue: 11618 },
  { symbol: "MU", shares: 1, stockCost: 745, costBasis: 746.99, price: 823.03, marketValue: 823.03 },
  { symbol: "NVDA", shares: 29.5, stockCost: 3897.77, costBasis: 3911.79, price: 200.75, marketValue: 5922.12 },
  { symbol: "PYPL", shares: 150, stockCost: 10764.36, costBasis: 10784.7, price: 57.21, marketValue: 8581.5 },
  { symbol: "TSLA", shares: 10, stockCost: 2600, costBasis: 2606, price: 311.21, marketValue: 3112.1 },
  { symbol: "UNH", shares: 25, stockCost: 9041.25, costBasis: 9061.21, price: 414.4, marketValue: 10360 },
  { symbol: "VGT", shares: 32, stockCost: 2460, costBasis: 2465.98, price: 113.15, marketValue: 3620.8 },
] as const satisfies ReadonlyArray<PortfolioHolding>;

const totals = getPortfolioTotals(portfolioHoldings);

export const portfolioSnapshot = {
  asOf: "2026-07-31",
  ...totals,
  xirr: 19.27,
  benchmarkXirr: 19.94,
  benchmark: "SPY",
  updateFrequency: "Monthly",
  source: "David's Portfolio Performance",
  sourceUrl: "https://docs.google.com/spreadsheets/d/1NoPTCfxNLB8FlM3tYr1EkR6t5GK1Hlz4Mfc6HU7pjkg/edit?usp=sharing",
} as const;

export function getHoldingWeight(marketValue: number, portfolioMarketValue = portfolioSnapshot.marketValue) {
  return calculateHoldingWeight(marketValue, portfolioMarketValue);
}
