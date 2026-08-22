export const portfolioHoldings = [
  { symbol: "ADBE", shares: 25, costBasis: 8506.05, price: 250.41, marketValue: 6260.25 },
  { symbol: "AMD", shares: 30, costBasis: 3344.27, price: 476.15, marketValue: 14284.5 },
  { symbol: "AMZN", shares: 33, costBasis: 6614.01, price: 271.58, marketValue: 8962.14 },
  { symbol: "BMNR", shares: 100, costBasis: 3204.28, price: 17.28, marketValue: 1728 },
  { symbol: "BRK.B", shares: 6, costBasis: 2759.94, price: 511.54, marketValue: 3069.24 },
  { symbol: "DELL", shares: 18, costBasis: 1853.39, price: 405.37, marketValue: 7296.66 },
  { symbol: "DUOL", shares: 30, costBasis: 8256.06, price: 134.81, marketValue: 4044.3 },
  { symbol: "GOOG", shares: 15, costBasis: 2764.03, price: 356.65, marketValue: 5349.75 },
  { symbol: "GRNY", shares: 300, costBasis: 5366.84, price: 27.01, marketValue: 8103 },
  { symbol: "LLY", shares: 5, costBasis: 3727, price: 1148.84, marketValue: 5744.2 },
  { symbol: "META", shares: 15, costBasis: 9686.99, price: 556.71, marketValue: 8350.65 },
  { symbol: "MSFT", shares: 25, costBasis: 10765.85, price: 464.72, marketValue: 11618 },
  { symbol: "MU", shares: 1, costBasis: 746.99, price: 823.03, marketValue: 823.03 },
  { symbol: "NVDA", shares: 29.5, costBasis: 3911.79, price: 200.75, marketValue: 5922.12 },
  { symbol: "PYPL", shares: 150, costBasis: 10784.7, price: 57.21, marketValue: 8581.5 },
  { symbol: "TSLA", shares: 10, costBasis: 2606, price: 311.21, marketValue: 3112.1 },
  { symbol: "UNH", shares: 25, costBasis: 9061.21, price: 414.4, marketValue: 10360 },
  { symbol: "VGT", shares: 32, costBasis: 2465.98, price: 113.15, marketValue: 3620.8 },
] as const;

export type PortfolioHolding = (typeof portfolioHoldings)[number];

export function getHoldingReturn(holding: Pick<PortfolioHolding, "costBasis" | "marketValue">) {
  return ((holding.marketValue - holding.costBasis) / holding.costBasis) * 100;
}

export function getPortfolioTotals(holdings: ReadonlyArray<PortfolioHolding>) {
  const { costBasis, marketValue } = holdings.reduce(
    (totals, holding) => ({
      costBasis: totals.costBasis + holding.costBasis,
      marketValue: totals.marketValue + holding.marketValue,
    }),
    { costBasis: 0, marketValue: 0 },
  );

  return {
    costBasis,
    marketValue,
    totalReturn: ((marketValue - costBasis) / costBasis) * 100,
    holdingsCount: holdings.length,
  };
}

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
  return (marketValue / portfolioMarketValue) * 100;
}
