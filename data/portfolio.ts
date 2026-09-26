import {
  getHoldingWeight as calculateHoldingWeight,
  getPortfolioTotals,
  type PortfolioHolding,
} from "@/lib/portfolio-calculations";
import {
  portfolioCashEvents,
  portfolioMonthlyValuations,
  portfolioPurchases,
  spyAdjustedClosesByDate,
} from "@/data/portfolio-detail";

export { getHoldingCostPerShare, getHoldingReturn, getPortfolioTotals } from "@/lib/portfolio-calculations";
export type { PortfolioHolding } from "@/lib/portfolio-calculations";

const latestValuation = portfolioMonthlyValuations.at(-1);
if (!latestValuation) throw new Error("The portfolio needs at least one monthly valuation");
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
const cashTotals = portfolioCashEvents.reduce(
  (totals, event) => {
    if (event.kind === "financingInterest") totals.financingInterest -= event.amount;
    else totals.netDividends += event.amount;
    return totals;
  },
  { netDividends: 0, financingInterest: 0 },
);
export const portfolioIncome = {
  netDividends: roundCents(cashTotals.netDividends),
  financingInterest: roundCents(cashTotals.financingInterest),
} as const;

function getSpyObservation(date: string, priceDate: string, adjustedClose: number, xirr: number | null) {
  const simulatedUnits = portfolioPurchases.reduce(
    (units, purchase) =>
      purchase.spyPriceDate <= date
        ? units + purchase.grossAmount / spyAdjustedClosesByDate[purchase.spyPriceDate]
        : units,
    0,
  );
  return { date, priceDate, adjustedClose, simulatedUnits, simulatedValue: simulatedUnits * adjustedClose, xirr };
}

export const portfolioSpyMonthlyReturns = portfolioMonthlyValuations.map(
  ({ date, spyPriceDate, spyAdjustedClose, benchmarkXirr }) =>
    getSpyObservation(date, spyPriceDate, spyAdjustedClose, benchmarkXirr),
);

const latestSpyMonth = portfolioSpyMonthlyReturns.at(-1);
if (!latestSpyMonth) throw new Error("The portfolio needs at least one SPY valuation");
export const portfolioSpySnapshot = latestSpyMonth;
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
