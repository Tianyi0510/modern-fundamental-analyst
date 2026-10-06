import type { PortfolioClosingMark } from "./portfolio-closing-marks";

type Purchase = { date: string; symbol: string; shares: number; grossAmount: number; fees: number };
type CashEvent = { date: string; amount: number };
type CorporateAction =
  | { date: string; symbol: string; kind: "gift"; quantity: number }
  | { date: string; symbol: string; kind: "forwardSplit"; factor: number };

// Stock-sleeve model: contributions at period start; distributed income/costs at period end.
// This reconstructs closing-price TWR, not actual intraday account valuations.
export function reconstructTimeWeightedReturns({
  marks,
  purchases,
  cashEvents,
  corporateActions,
}: {
  marks: ReadonlyArray<PortfolioClosingMark>;
  purchases: ReadonlyArray<Purchase>;
  cashEvents: ReadonlyArray<CashEvent>;
  corporateActions: ReadonlyArray<CorporateAction>;
}) {
  if (!marks.length) throw new Error("TWR needs closing marks");
  const dates = new Set(marks.map((mark) => mark.date));
  if (dates.size !== marks.length) throw new Error("Duplicate TWR valuation date");
  if (marks.some((mark, index) => index > 0 && marks[index - 1]!.date >= mark.date)) {
    throw new Error("TWR marks must be chronological");
  }
  for (const event of [...purchases, ...cashEvents, ...corporateActions]) {
    if (!dates.has(event.date)) throw new Error(`Missing TWR event valuation: ${event.date}`);
  }
  const shares = new Map<string, number>();
  let value = 0;
  let growth = 1;
  const spyStart = marks[0]!.spyAdjustedClose;
  if (!(spyStart > 0) || !Number.isFinite(spyStart)) throw new Error("Invalid opening SPY price");
  return marks.map((mark, index) => {
    const previous = marks[index - 1];
    if (mark.priceDate > mark.date) throw new Error("TWR cannot use a future closing price");
    let contribution = 0;
    for (const action of corporateActions.filter((row) => row.date === mark.date)) {
      const quantity = shares.get(action.symbol) ?? 0;
      if (action.kind === "forwardSplit") shares.set(action.symbol, quantity * action.factor);
      else {
        // Beginning-of-period transfer value uses the preceding position's closing mark.
        const price = previous?.prices[action.symbol];
        if (!(price && price > 0)) throw new Error(`Missing TWR transfer price: ${action.symbol}`);
        contribution += action.quantity * price;
        shares.set(action.symbol, quantity + action.quantity);
      }
    }
    for (const purchase of purchases.filter((row) => row.date === mark.date)) {
      contribution += purchase.grossAmount + purchase.fees;
      shares.set(purchase.symbol, (shares.get(purchase.symbol) ?? 0) + purchase.shares);
    }
    const income = cashEvents.filter((row) => row.date === mark.date).reduce((sum, row) => sum + row.amount, 0);
    const endingValue = [...shares].reduce((sum, [symbol, quantity]) => {
      const price = mark.prices[symbol];
      if (typeof price !== "number" || !(price > 0) || !Number.isFinite(price))
        throw new Error(`Missing TWR position price: ${mark.date} ${symbol}`);
      return sum + quantity * price;
    }, 0);
    const openingCapital = value + contribution;
    if (!(openingCapital > 0) || !Number.isFinite(openingCapital)) throw new Error("Invalid TWR opening capital");
    const factor = (endingValue + income) / openingCapital;
    if (!(factor > 0) || !Number.isFinite(factor)) throw new Error("Invalid TWR return factor");
    if (!(mark.spyAdjustedClose > 0) || !Number.isFinite(mark.spyAdjustedClose)) throw new Error("Invalid SPY price");
    growth *= factor;
    const beginningValue = value;
    value = endingValue;
    return {
      date: mark.date,
      priceDate: mark.priceDate,
      beginningValue,
      contribution,
      income,
      endingValue,
      periodReturn: (factor - 1) * 100,
      portfolioTwr: (growth - 1) * 100,
      benchmarkTwr: (mark.spyAdjustedClose / spyStart - 1) * 100,
    };
  });
}
