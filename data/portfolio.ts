import {
  getHoldingWeight as calculateHoldingWeight,
  getPortfolioTotals,
  type PortfolioHolding,
} from "@/lib/portfolio-calculations";

export { getHoldingCostPerShare, getHoldingReturn, getPortfolioTotals } from "@/lib/portfolio-calculations";
export type { PortfolioHolding } from "@/lib/portfolio-calculations";

export const portfolioHoldings = [
  {"symbol": "ADBE", "shares": 25, "costBasis": 8506.05, "price": 292.79, "marketValue": 7319.75},
  {"symbol": "AMD", "shares": 30, "costBasis": 3344.27, "price": 470.72, "marketValue": 14121.6},
  {"symbol": "AMZN", "shares": 33, "costBasis": 6614.01, "price": 259.77, "marketValue": 8572.41},
  {"symbol": "BMNR", "shares": 100, "costBasis": 3204.28, "price": 25.32, "marketValue": 2532},
  {"symbol": "BRK.B", "shares": 6, "costBasis": 2759.94, "price": 504.03, "marketValue": 3024.18},
  {"symbol": "DELL", "shares": 18, "costBasis": 1853.3899999999999, "price": 456.01, "marketValue": 8208.18},
  {"symbol": "DUOL", "shares": 30, "costBasis": 8256.06, "price": 148.36, "marketValue": 4450.8},
  {"symbol": "GOOG", "shares": 15, "costBasis": 2764.03, "price": 335.41, "marketValue": 5031.15},
  {"symbol": "GRNY", "shares": 300, "costBasis": 5366.84, "price": 27.83, "marketValue": 8349},
  {"symbol": "LLY", "shares": 5, "costBasis": 3727, "price": 1156.73, "marketValue": 5783.65},
  {"symbol": "META", "shares": 15, "costBasis": 9686.99, "price": 572.34, "marketValue": 8585.1},
  {"symbol": "MSFT", "shares": 25, "costBasis": 10765.85, "price": 507.29, "marketValue": 12682.25},
  {"symbol": "MU", "shares": 1, "costBasis": 746.99, "price": 958.73, "marketValue": 958.73},
  {"symbol": "NVDA", "shares": 29.5, "costBasis": 3911.787, "price": 220.78, "marketValue": 6513.01},
  {"symbol": "PYPL", "shares": 150, "costBasis": 10784.6972, "price": 52.665, "marketValue": 7899.75},
  {"symbol": "TSLA", "shares": 10, "costBasis": 2606, "price": 367.95, "marketValue": 3679.5},
  {"symbol": "UNH", "shares": 25, "costBasis": 9061.21, "price": 389.41, "marketValue": 9735.25},
  {"symbol": "VGT", "shares": 32, "costBasis": 2465.98, "price": 120.49, "marketValue": 3855.68},
] as const satisfies ReadonlyArray<PortfolioHolding>;

export const portfolioIncome = { netDividends: 526.69, financingInterest: 85.75 } as const;
const totals = getPortfolioTotals(portfolioHoldings, portfolioIncome);

export const portfolioSnapshot = {
  asOf: "2026-08-31",
  ...totals,
  ...portfolioIncome,
  xirr: 21.13767139882297,
  benchmarkXirr: 21.002190100241442,
  benchmark: "SPY",
  updateFrequency: "Monthly",
  source: "David's Portfolio Performance",
  sourceUrl: "https://docs.google.com/spreadsheets/d/1NoPTCfxNLB8FlM3tYr1EkR6t5GK1Hlz4Mfc6HU7pjkg/edit?usp=sharing",
} as const;

export function getHoldingWeight(marketValue: number, portfolioMarketValue = portfolioSnapshot.marketValue) {
  return calculateHoldingWeight(marketValue, portfolioMarketValue);
}

// Month-end since-inception annualized XIRR; null denotes a horizon below 30 days.
// Source: portfolio-return-analysis-monthly-xirr.xlsx, Monthly XIRR!A5:H25;
// August Statement!A16:D33 supplies the statement-backed August valuation.
export const portfolioMonthlyReturns = [
  {
    "date": "2024-12-31",
    "marketValue": 542.29,
    "portfolioXirr": null,
    "benchmarkXirr": null
  },
  {
    "date": "2025-01-31",
    "marketValue": 17083.219999999998,
    "portfolioXirr": 7.050947844242993,
    "benchmarkXirr": 35.85447345641552
  },
  {
    "date": "2025-02-28",
    "marketValue": 27669.010000000002,
    "portfolioXirr": -39.74630615229532,
    "benchmarkXirr": -4.764958183139662
  },
  {
    "date": "2025-03-31",
    "marketValue": 37731.70999999999,
    "portfolioXirr": -39.856457325513325,
    "benchmarkXirr": -29.324595561745138
  },
  {
    "date": "2025-04-30",
    "marketValue": 44215.43,
    "portfolioXirr": -20.677916727875974,
    "benchmarkXirr": -16.830244265524655
  },
  {
    "date": "2025-05-31",
    "marketValue": 52220.755000000005,
    "portfolioXirr": 15.152183501149716,
    "benchmarkXirr": 8.956398782722005
  },
  {
    "date": "2025-06-30",
    "marketValue": 56326.475,
    "portfolioXirr": 38.61286906698796,
    "benchmarkXirr": 23.2445357918651
  },
  {
    "date": "2025-07-31",
    "marketValue": 63165.744999999995,
    "portfolioXirr": 39.40820433168272,
    "benchmarkXirr": 24.525237484983077
  },
  {
    "date": "2025-08-31",
    "marketValue": 65258.270000000004,
    "portfolioXirr": 34.39208957374279,
    "benchmarkXirr": 25.029712750589482
  },
  {
    "date": "2025-09-30",
    "marketValue": 81436.73999999999,
    "portfolioXirr": 43.170145965783675,
    "benchmarkXirr": 29.215999091725394
  },
  {
    "date": "2025-10-31",
    "marketValue": 95641.97499999999,
    "portfolioXirr": 46.69258004020399,
    "benchmarkXirr": 29.725528144970287
  },
  {
    "date": "2025-11-30",
    "marketValue": 99987.88,
    "portfolioXirr": 24.640340753611916,
    "benchmarkXirr": 25.550985346929938
  },
  {
    "date": "2025-12-31",
    "marketValue": 102259.87999999999,
    "portfolioXirr": 19.133746593053235,
    "benchmarkXirr": 21.74742485703566
  },
  {
    "date": "2026-01-31",
    "marketValue": 100301.44499999999,
    "portfolioXirr": 9.362882532204852,
    "benchmarkXirr": 21.42640232581368
  },
  {
    "date": "2026-02-28",
    "marketValue": 93502.545,
    "portfolioXirr": -2.9152840099359945,
    "benchmarkXirr": 17.60194592989441
  },
  {
    "date": "2026-03-31",
    "marketValue": 88918.83,
    "portfolioXirr": -8.476476079294551,
    "benchmarkXirr": 8.61648913030031
  },
  {
    "date": "2026-04-30",
    "marketValue": 105144.505,
    "portfolioXirr": 11.628612481019925,
    "benchmarkXirr": 20.53825658421165
  },
  {
    "date": "2026-05-31",
    "marketValue": 117464.22999999998,
    "portfolioXirr": 23.778881815409274,
    "benchmarkXirr": 24.944940994093248
  },
  {
    "date": "2026-06-30",
    "marketValue": 114136.235,
    "portfolioXirr": 18.655408218378962,
    "benchmarkXirr": 21.641780094125114
  },
  {
    "date": "2026-07-31",
    "marketValue": 117230.23999999999,
    "portfolioXirr": 19.265566707963984,
    "benchmarkXirr": 19.93655278376187
  },
  {
    "date": "2026-08-31",
    "marketValue": 121301.99,
    "portfolioXirr": 21.13767139882297,
    "benchmarkXirr": 21.002190100241442
  }
] as const;
