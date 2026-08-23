export type PortfolioHolding = {
  symbol: string;
  shares: number;
  costBasis: number;
  price: number;
  marketValue: number;
};

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

export function getHoldingWeight(marketValue: number, portfolioMarketValue: number) {
  return (marketValue / portfolioMarketValue) * 100;
}
