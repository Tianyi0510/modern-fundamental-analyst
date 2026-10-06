import "server-only";
import { portfolioClosingMarks } from "./portfolio-closing-marks";
import {
  portfolioCashEvents,
  portfolioCorporateActions,
  portfolioMonthlyValuations,
  portfolioPurchases,
} from "./portfolio-detail";
import { reconstructTimeWeightedReturns } from "./portfolio-twr-calculations";

const asOf = portfolioMonthlyValuations.at(-1)!.date;
export const portfolioTwrValuations = reconstructTimeWeightedReturns({
  marks: portfolioClosingMarks.filter((row) => row.date <= asOf),
  purchases: portfolioPurchases.filter((row) => row.date <= asOf),
  cashEvents: portfolioCashEvents.filter((row) => row.date <= asOf),
  corporateActions: portfolioCorporateActions.filter((row) => row.date <= asOf),
});
const byDate = new Map(portfolioTwrValuations.map((row) => [row.date, row]));
export const portfolioTwrMonthlyReturns = portfolioMonthlyValuations.map((month, index) => {
  const row = byDate.get(month.date);
  const previous = index ? byDate.get(portfolioMonthlyValuations[index - 1]!.date) : undefined;
  if (!row) throw new Error(`Missing month-end TWR valuation: ${month.date}`);
  return {
    ...row,
    monthlyTwr: ((1 + row.portfolioTwr / 100) / (1 + (previous?.portfolioTwr ?? 0) / 100) - 1) * 100,
  };
});
export const portfolioTwrSnapshot = {
  ...portfolioTwrMonthlyReturns.at(-1)!,
  startDate: portfolioTwrValuations[0]!.date,
  method: "reconstructed-closing-price" as const,
};
