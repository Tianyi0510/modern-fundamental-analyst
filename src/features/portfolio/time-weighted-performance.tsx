import { PortfolioMetric } from "./portfolio-metric";
import { PerformanceChart } from "./performance-chart";
import { portfolioTwrSnapshot } from "./portfolio-twr";
import { formatDate, formatPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

const copy = {
  en: {
    portfolio: "Reconstructed Portfolio TWR",
    benchmark: "SPY Total Return",
    note: "Cumulative · not annualized",
    since: "Since",
  },
  "zh-tw": { portfolio: "投資組合重建 TWR", benchmark: "SPY 總報酬", note: "累積・未年化", since: "自" },
  "zh-cn": { portfolio: "投资组合重建 TWR", benchmark: "SPY 总回报", note: "累计・未年化", since: "自" },
} as const;

export function TimeWeightedPerformance({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const note = (
    <>
      {text.note}
      <br />
      {text.since} {formatDate(portfolioTwrSnapshot.startDate, locale, true)}
    </>
  );
  return (
    <div className="space-y-[var(--space-heading-content)]">
      <dl className="performance-twr-summary grid grid-cols-2 gap-px bg-black compact:grid-cols-1">
        <PortfolioMetric
          tone="highlight"
          label={text.portfolio}
          value={formatPercent(portfolioTwrSnapshot.portfolioTwr)}
          note={note}
        />
        <PortfolioMetric
          tone="paper"
          label={text.benchmark}
          value={formatPercent(portfolioTwrSnapshot.benchmarkTwr)}
          note={note}
        />
      </dl>
      <PerformanceChart locale={locale} />
    </div>
  );
}
