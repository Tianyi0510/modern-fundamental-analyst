"use client";

import { ChevronDown } from "lucide-react";
import { formatDate, formatPercent, formatUsd } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { AnimatedDisclosure } from "@/components/animated-disclosure";
import styles from "./performance-chart.module.css";

// The horizontally scrollable data region needs keyboard focus.
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */

const copy = {
  en: {
    portfolio: "Portfolio",
    data: "View Monthly Data",
    month: "Month End",
    value: "Stock Market Value",
    caption: "Month-End Data · Newest First",
    scroll: "Swipe horizontally to compare columns; scroll vertically for earlier months.",
  },
  "zh-tw": {
    portfolio: "投資組合",
    data: "查看每月數據",
    month: "月底日期",
    value: "股票市場價值",
    caption: "月底數據・最新月份在前",
    scroll: "左右滑動比較欄位，上下捲動查看較早月份。",
  },
  "zh-cn": {
    portfolio: "投资组合",
    data: "查看每月数据",
    month: "月底日期",
    value: "股票市场价值",
    caption: "月底数据・最新月份在前",
    scroll: "左右滑动比较各列，上下滚动查看较早月份。",
  },
} as const;

const twrCopy = {
  en: {
    title: "Reconstructed TWR vs SPY",
    note: "Cumulative, non-annualized closing-price TWR. Contributions are modeled at period start; net income and costs at period end. Not observed intraday TWR.",
    axis: "Cumulative Reconstructed TWR",
  },
  "zh-tw": {
    title: "重建 TWR 與 SPY",
    note: "以收盤估值重建的累積 TWR，未年化；假設資金於期初流入，淨股息與費用於期末結算，並非實際日內 TWR。",
    axis: "累積重建 TWR",
  },
  "zh-cn": {
    title: "重建 TWR 与 SPY",
    note: "以收盘估值重建的累计 TWR，未年化；假设资金于期初流入，净股息与费用于期末结算，并非实际日内 TWR。",
    axis: "累计重建 TWR",
  },
} as const;

const xirrCopy = {
  en: {
    title: "Annualized XIRR vs SPY",
    note: "Since-inception annualized XIRR at each month-end, not individual monthly returns. Periods shorter than 30 days are not annualized and are omitted from the lines.",
    axis: "Annualized XIRR",
    unavailable: "Not annualized: less than 30 days",
  },
  "zh-tw": {
    title: "年化 XIRR 與 SPY",
    note: "每個月底自成立以來的年化 XIRR，並非各月份的單月報酬；不足 30 天的期間不作年化，也不繪入折線。",
    axis: "年化 XIRR",
    unavailable: "未年化：不足 30 天",
  },
  "zh-cn": {
    title: "年化 XIRR 与 SPY",
    note: "每个月底自成立以来的年化 XIRR，并非各月份的单月回报；不足 30 天的期间不作年化，也不绘入折线。",
    axis: "年化 XIRR",
    unavailable: "未年化：不足 30 天",
  },
} as const;

export type ChartObservation = {
  date: string;
  marketValue: number;
  portfolioReturn: number | null;
  benchmarkReturn: number | null;
};

export function PerformanceChartView({
  locale,
  measure,
  observations,
}: {
  locale: Locale;
  measure: "twr" | "xirr";
  observations: ChartObservation[];
}) {
  const text = { ...copy[locale], ...(measure === "twr" ? twrCopy[locale] : xirrCopy[locale]) };
  const titleId = measure === "twr" ? "performance-twr-chart-title" : "performance-chart-title";
  const points = observations.filter(
    (row): row is typeof row & { portfolioReturn: number; benchmarkReturn: number } =>
      row.portfolioReturn !== null && row.benchmarkReturn !== null,
  );
  const returnLabel = measure === "twr" ? "TWR" : "XIRR";
  const formatReturn = (value: number | null) => (value === null ? xirrCopy[locale].unavailable : formatPercent(value));
  const values = points.flatMap((row) => [row.portfolioReturn, row.benchmarkReturn]);
  const lower = Math.floor(Math.min(...values) / 20) * 20;
  const upper = Math.max(lower + 20, Math.ceil(Math.max(...values) / 20) * 20);
  const y = (value: number) => 12 + (276 * (upper - value)) / (upper - lower);
  const latest = points[points.length - 1]!;
  const line = (key: "portfolioReturn" | "benchmarkReturn") =>
    points.map((row, index) => `${(index * 800) / (points.length - 1)},${y(row[key])}`).join(" ");
  const ticks = Array.from({ length: (upper - lower) / 20 + 1 }, (_, index) => upper - index * 20);
  return (
    <figure className={styles.figure} aria-labelledby={titleId}>
      <figcaption>
        <h3 id={titleId}>{text.title}</h3>
        <p>{text.note}</p>
      </figcaption>
      <ul className={styles.legend} aria-label={text.title}>
        <li>
          <span className={styles.portfolioKey} />
          {text.portfolio}
        </li>
        <li>
          <span className={styles.benchmarkKey} />
          SPY
        </li>
      </ul>
      <p>{text.axis}</p>
      <div className={styles.plot}>
        <div className={styles.ticks} aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick}>{tick}%</span>
          ))}
        </div>
        <svg
          viewBox="0 0 800 300"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${text.title}. ${text.note} ${formatDate(latest.date, locale, true)}: ${text.portfolio} ${formatPercent(latest.portfolioReturn)}, SPY ${formatPercent(latest.benchmarkReturn)}.`}
        >
          {ticks.map((tick) => (
            <line
              key={tick}
              x1="0"
              x2="800"
              y1={y(tick)}
              y2={y(tick)}
              className={tick === 0 ? styles.zeroLine : styles.grid}
            />
          ))}
          <polyline points={line("benchmarkReturn")} className={styles.benchmarkLine} />
          <polyline points={line("portfolioReturn")} className={styles.portfolioLine} />
        </svg>
      </div>
      <div className={styles.dates}>
        <span>{formatDate(points[0]!.date, locale, true)}</span>
        <span className={styles.midpoint}>
          {formatDate(points[Math.floor((points.length - 1) / 2)]!.date, locale, true)}
        </span>
        <span>{formatDate(latest.date, locale, true)}</span>
      </div>
      <AnimatedDisclosure
        className={styles.details}
        summary={
          <>
            <span>{text.data}</span>
            <ChevronDown className={styles.chevron} size={20} strokeWidth={2} aria-hidden="true" />
          </>
        }
      >
        <p className={styles.scrollHint} id={`${titleId}-hint`}>
          {text.scroll}
        </p>
        {/* Keyboard focus allows horizontal scrolling of the monthly table. */}
        <div
          className={styles.tableScroll}
          tabIndex={0}
          role="region"
          aria-label={text.data}
          aria-describedby={`${titleId}-hint`}
        >
          <table>
            <caption>{text.caption}</caption>
            <thead>
              <tr>
                <th scope="col">{text.month}</th>
                <th scope="col">{text.value}</th>
                <th scope="col">
                  {text.portfolio} {returnLabel}
                </th>
                <th scope="col">SPY {returnLabel}</th>
              </tr>
            </thead>
            <tbody>
              {observations.toReversed().map((row) => (
                <tr key={row.date}>
                  <th scope="row">{formatDate(row.date, locale, true)}</th>
                  <td>{formatUsd(row.marketValue)}</td>
                  <td>{formatReturn(row.portfolioReturn)}</td>
                  <td>{formatReturn(row.benchmarkReturn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedDisclosure>
    </figure>
  );
}
