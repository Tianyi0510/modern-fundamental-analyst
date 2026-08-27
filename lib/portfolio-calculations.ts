export type PortfolioHolding = {
  symbol: string;
  shares: number;
  costBasis: number;
  price: number;
  marketValue: number;
};

function getSafeRatio(numerator: number, denominator: number) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return 0;
  return numerator / denominator;
}

export function getHoldingReturn(holding: Pick<PortfolioHolding, "costBasis" | "marketValue">) {
  return getSafeRatio(holding.marketValue - holding.costBasis, holding.costBasis) * 100;
}
export function getHoldingCostPerShare(holding: Pick<PortfolioHolding, "costBasis" | "shares">) {
  return getSafeRatio(holding.costBasis, holding.shares);
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
    totalReturn: getSafeRatio(marketValue - costBasis, costBasis) * 100,
    holdingsCount: holdings.length,
  };
}

export function getHoldingWeight(marketValue: number, portfolioMarketValue: number) {
  return getSafeRatio(marketValue, portfolioMarketValue) * 100;
}
