"use client";

import { Empty, EmptyDescription } from "./empty";
import { CartesianGrid, ReferenceLine, Line, LineChart as RechartsLineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./chart";

export function LineChart({
  data,
  config,
  series,
  xKey,
  label,
  emptyMessage,
  dashedSeries = [],
  showPoints = false,
  referenceValue,
  formatX,
  formatY,
  formatValue,
}: {
  data: Array<Record<string, string | number | null>>;
  config: ChartConfig;
  series: string[];
  xKey: string;
  label: string;
  emptyMessage: string;
  dashedSeries?: string[];
  showPoints?: boolean;
  referenceValue?: number;
  formatX?: (value: string | number) => string;
  formatY?: (value: number) => string;
  formatValue?: (value: number | string) => string;
}) {
  if (!data.length)
    return (
      <Empty role="status">
        <EmptyDescription>{emptyMessage}</EmptyDescription>
      </Empty>
    );
  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-[300px] w-full min-w-0 [&_.recharts-surface:focus-visible]:outline-[length:var(--focus-ring-width)] [&_.recharts-surface:focus-visible]:outline-offset-[var(--focus-ring-offset)] [&_.recharts-surface:focus-visible]:outline-[color:var(--focus-ring-color)] [&_.recharts-surface:focus-visible]:outline-solid"
      aria-label={label}
    >
      <RechartsLineChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={xKey}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatX}
          minTickGap={32}
          tickMargin={16}
          height={48}
        />
        <YAxis includeHidden tickLine={false} axisLine={false} tickFormatter={formatY} width={64} />
        {referenceValue !== undefined && (
          <ReferenceLine
            y={referenceValue}
            ifOverflow="extendDomain"
            stroke="var(--chart-reference)"
            strokeDasharray="6 4"
            strokeWidth={1}
            className="chart-baseline"
          />
        )}
        <ChartTooltip
          isAnimationActive={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                const label = typeof value === "string" || typeof value === "number" ? String(value) : "";
                return formatX ? formatX(label) : label;
              }}
              formatter={
                formatValue
                  ? (value, name) => (
                      <>
                        <span>{config[String(name)]?.label ?? name}</span>
                        <span className="ml-auto tabular-nums">
                          {typeof value === "string" || typeof value === "number"
                            ? formatValue(value)
                            : value?.map(formatValue).join(" – ")}
                        </span>
                      </>
                    )
                  : undefined
              }
            />
          }
        />
        {Object.keys(config).map((key, index) => (
          <Line
            key={key}
            dataKey={key}
            hide={!series.includes(key)}
            type="linear"
            stroke={`var(--color-${key}, var(--color-chart-${(index % 5) + 1}))`}
            strokeWidth={3}
            strokeDasharray={dashedSeries.includes(key) ? "8 5" : undefined}
            dot={showPoints ? { r: 3 } : false}
            connectNulls={false}
            isAnimationActive={false}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
}
