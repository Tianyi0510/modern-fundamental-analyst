"use client";

import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { ChartBoundary } from "./chart-boundary";
import styles from "./performance-chart.module.css";
import type { ChartObservation } from "./performance-chart-view";

const InteractiveLineChart = lazy(() =>
  import("@/components/ui/line-chart").then((module) => ({ default: module.LineChart })),
);
const copy = {
  en: {
    loading: "Loading interactive chart…",
    empty: "No performance data is available.",
    hint: "Hover, touch, or use the Left and Right Arrow keys to compare monthly returns.",
  },
  "zh-tw": {
    loading: "正在載入互動圖表…",
    empty: "目前沒有績效資料。",
    hint: "使用滑鼠、觸控或左右方向鍵，比較每月報酬。",
  },
  "zh-cn": {
    loading: "正在加载互动图表…",
    empty: "目前没有绩效数据。",
    hint: "使用鼠标、触控或左右方向键，比较每月回报。",
  },
} as const;

export function PerformanceChartExplorer({
  observations,
  locale,
  measure,
  title,
  portfolio,
}: {
  observations: ChartObservation[];
  locale: Locale;
  measure: "twr" | "xirr";
  title: string;
  portfolio: string;
}) {
  const text = copy[locale];
  return (
    <>
      <ul className={styles.legend} aria-label={title}>
        <li>
          <span className={styles.portfolioKey} />
          {portfolio}
        </li>
        <li>
          <span className={styles.benchmarkKey} />
          SPY
        </li>
      </ul>
      <div className="mt-6">
        <p>{text.hint}</p>
        <p>{title}</p>
        <ChartBoundary locale={locale} measure={measure}>
          <Suspense
            fallback={
              <div role="status">
                <span className="sr-only">{text.loading}</span>
                <Skeleton className="h-[300px] w-full" />
              </div>
            }
          >
            <InteractiveLineChart
              data={observations.map((row) => ({ ...row }))}
              config={{
                portfolioReturn: { label: portfolio, color: "var(--chart-portfolio)" },
                benchmarkReturn: { label: "SPY", color: "var(--chart-benchmark)" },
              }}
              series={["portfolioReturn", "benchmarkReturn"]}
              showPoints={false}
              referenceValue={0}
              dashedSeries={["benchmarkReturn"]}
              xKey="date"
              label={title}
              emptyMessage={text.empty}
              formatX={(value) => formatDate(String(value), locale, true)}
              formatY={(value) => formatPercent(Number(value), 0)}
              formatValue={(value) => formatPercent(Number(value))}
            />
          </Suspense>
        </ChartBoundary>
      </div>
    </>
  );
}
