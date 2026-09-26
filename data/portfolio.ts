import {
  getHoldingWeight as calculateHoldingWeight,
  getPortfolioTotals,
  type PortfolioHolding,
} from "@/lib/portfolio-calculations";
import { portfolioCashEvents, portfolioMonthlyValuations, portfolioPurchases } from "@/data/portfolio-detail";

export { getHoldingCostPerShare, getHoldingReturn, getPortfolioTotals } from "@/lib/portfolio-calculations";
export type { PortfolioHolding } from "@/lib/portfolio-calculations";

const latestValuation = portfolioMonthlyValuations.at(-1)!;
const costBasisBySymbol = new Map<string, number>();
for (const purchase of portfolioPurchases) {
  costBasisBySymbol.set(
    purchase.symbol,
    (costBasisBySymbol.get(purchase.symbol) ?? 0) + purchase.grossAmount + purchase.fees,
  );
}

export const portfolioHoldings: ReadonlyArray<PortfolioHolding> = Object.entries(latestValuation.shares).map(
  ([symbol, shares]) => {
    const price = latestValuation.prices[symbol as keyof typeof latestValuation.prices];
    return { symbol, shares, costBasis: costBasisBySymbol.get(symbol) ?? 0, price, marketValue: price * shares };
  },
);

const roundCents = (amount: number) => Math.round(amount * 100) / 100;
export const portfolioIncome = {
  netDividends: roundCents(
    portfolioCashEvents
      .filter((event) => event.kind !== "financingInterest")
      .reduce((sum, event) => sum + event.amount, 0),
  ),
  financingInterest: roundCents(
    -portfolioCashEvents
      .filter((event) => event.kind === "financingInterest")
      .reduce((sum, event) => sum + event.amount, 0),
  ),
} as const;
// Month-end since-inception annualized XIRR; null denotes a horizon below 30 days.
export const portfolioMonthlyReturns = portfolioMonthlyValuations.map(
  ({ date, stockValue, portfolioXirr, benchmarkXirr }) => ({
    date,
    marketValue: stockValue,
    portfolioXirr,
    benchmarkXirr,
  }),
);

const latestMonth = portfolioMonthlyReturns.at(-1)!;
if (latestMonth.portfolioXirr === null || latestMonth.benchmarkXirr === null) {
  throw new Error("The latest portfolio month must have verified annualized returns");
}

const totals = getPortfolioTotals(portfolioHoldings, portfolioIncome);

export const portfolioSnapshot = {
  asOf: latestMonth.date,
  ...totals,
  ...portfolioIncome,
  xirr: latestMonth.portfolioXirr,
  benchmarkXirr: latestMonth.benchmarkXirr,
  benchmark: "SPY",
  updateFrequency: "Monthly",
} as const;

export function getHoldingWeight(marketValue: number, portfolioMarketValue = portfolioSnapshot.marketValue) {
  return calculateHoldingWeight(marketValue, portfolioMarketValue);
}
