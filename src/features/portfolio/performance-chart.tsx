import { portfolioTwrMonthlyReturns } from "./portfolio-twr";
import { portfolioMonthlyReturns } from "./portfolio";
import { PerformanceChartView } from "./performance-chart-view";
import { ChartBoundary } from "./chart-boundary";
import type { Locale } from "@/lib/i18n";

export function PerformanceChart({ locale, measure = "twr" }: { locale: Locale; measure?: "twr" | "xirr" }) {
  const observations =
    measure === "twr"
      ? portfolioTwrMonthlyReturns.map((row) => ({
          date: row.date,
          marketValue: row.endingValue,
          portfolioReturn: row.portfolioTwr,
          benchmarkReturn: row.benchmarkTwr,
        }))
      : portfolioMonthlyReturns.map((row) => ({
          date: row.date,
          marketValue: row.marketValue,
          portfolioReturn: row.portfolioXirr,
          benchmarkReturn: row.benchmarkXirr,
        }));
  return (
    <ChartBoundary key={`${locale}-${measure}`} locale={locale} measure={measure}>
      <PerformanceChartView locale={locale} measure={measure} observations={observations} />
    </ChartBoundary>
  );
}
