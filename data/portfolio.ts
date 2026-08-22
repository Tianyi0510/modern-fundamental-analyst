export const portfolioSnapshot = {
  asOf: "2026-07-31",
  costBasis: 96425.37,
  marketValue: 117230.24,
  totalReturn: 22,
  xirr: 19.27,
  benchmarkXirr: 19.94,
  benchmark: "SPY",
  holdingsCount: 18,
  updateFrequency: "Monthly",
  source: "David's Portfolio Performance",
};

export const portfolioHoldings = [
  { symbol: "ADBE", shares: 25, costBasis: 8506.05, price: 250.41, marketValue: 6260.25, returnPct: -26.4 },
  { symbol: "AMD", shares: 30, costBasis: 3344.27, price: 476.15, marketValue: 14284.5, returnPct: 327.1 },
  { symbol: "AMZN", shares: 33, costBasis: 6614.01, price: 271.58, marketValue: 8962.14, returnPct: 35.5 },
  { symbol: "BMNR", shares: 100, costBasis: 3204.28, price: 17.28, marketValue: 1728, returnPct: -46.1 },
  { symbol: "BRK.B", shares: 6, costBasis: 2759.94, price: 511.54, marketValue: 3069.24, returnPct: 11.2 },
  { symbol: "DELL", shares: 18, costBasis: 1853.39, price: 405.37, marketValue: 7296.66, returnPct: 296.6 },
  { symbol: "DUOL", shares: 30, costBasis: 8256.06, price: 134.81, marketValue: 4044.3, returnPct: -51 },
  { symbol: "GOOG", shares: 15, costBasis: 2764.03, price: 356.65, marketValue: 5349.75, returnPct: 94.2 },
  { symbol: "GRNY", shares: 300, costBasis: 5366.84, price: 27.01, marketValue: 8103, returnPct: 51.1 },
  { symbol: "LLY", shares: 5, costBasis: 3727, price: 1148.84, marketValue: 5744.2, returnPct: 54.7 },
  { symbol: "META", shares: 15, costBasis: 9686.99, price: 556.71, marketValue: 8350.65, returnPct: -13.5 },
  { symbol: "MSFT", shares: 25, costBasis: 10765.85, price: 464.72, marketValue: 11618, returnPct: 8.7 },
  { symbol: "MU", shares: 1, costBasis: 746.99, price: 823.03, marketValue: 823.03, returnPct: 10.2 },
  { symbol: "NVDA", shares: 29.5, costBasis: 3911.79, price: 200.75, marketValue: 5922.12, returnPct: 51.6 },
  { symbol: "PYPL", shares: 150, costBasis: 10784.7, price: 57.21, marketValue: 8581.5, returnPct: -19.9 },
  { symbol: "TSLA", shares: 10, costBasis: 2606, price: 311.21, marketValue: 3112.1, returnPct: 19.4 },
  { symbol: "UNH", shares: 25, costBasis: 9061.21, price: 414.4, marketValue: 10360, returnPct: 16.9 },
  { symbol: "VGT", shares: 32, costBasis: 2465.98, price: 113.15, marketValue: 3620.8, returnPct: 47.5 },
] as const;

export type PortfolioHolding = (typeof portfolioHoldings)[number];

export function getHoldingWeight(marketValue: number) {
  return (marketValue / portfolioSnapshot.marketValue) * 100;
}
