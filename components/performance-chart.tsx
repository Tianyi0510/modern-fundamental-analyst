import { ChevronDown } from "lucide-react";
import { portfolioMonthlyReturns } from "@/data/portfolio";
import { formatDate, formatPercent, formatUsd } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { AnimatedDisclosure } from "./animated-disclosure";
import styles from "./performance-chart.module.css";

// The horizontally scrollable data region needs keyboard focus.
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */

const copy = {
  en: {
    title: "Portfolio vs SPY",
    note: "Since-inception annualized XIRR at each month-end. These are not individual monthly returns.",
    portfolio: "Portfolio",
    data: "View monthly data",
    month: "Month end",
    value: "Stock market value",
    unavailable: "Not annualized: less than 30 days",
    axis: "Annualized XIRR",
    caption: "Month-end data · newest first",
    scroll: "Swipe horizontally to compare columns; scroll vertically for earlier months.",
  },
  "zh-tw": {
    title: "投資組合與 SPY",
    note: "每個月底自成立以來的年化 XIRR，並非各月份的單月報酬。",
    portfolio: "投資組合",
    data: "查看每月數據",
    month: "月底日期",
    value: "股票市場價值",
    unavailable: "未年化：不足 30 天",
    axis: "年化 XIRR",
    caption: "月底數據・最新月份在前",
    scroll: "左右滑動比較欄位，上下捲動查看較早月份。",
  },
  "zh-cn": {
    title: "投资组合与 SPY",
    note: "每个月底自成立以来的年化 XIRR，并非各月份的单月回报。",
    portfolio: "投资组合",
    data: "查看每月数据",
    month: "月底日期",
    value: "股票市场价值",
    unavailable: "未年化：不足 30 天",
    axis: "年化 XIRR",
    caption: "月底数据・最新月份在前",
    scroll: "左右滑动比较各列，上下滚动查看较早月份。",
  },
} as const;

export function PerformanceChart({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const points = portfolioMonthlyReturns.filter((row) => row.portfolioXirr !== null && row.benchmarkXirr !== null);
  const values = points.flatMap((row) => [row.portfolioXirr, row.benchmarkXirr]);
  const lower = Math.floor(Math.min(...values) / 20) * 20;
  const upper = Math.ceil(Math.max(...values) / 20) * 20;
  const y = (value: number) => 12 + (276 * (upper - value)) / (upper - lower);
  const latest = points[points.length - 1]!;
  const line = (key: "portfolioXirr" | "benchmarkXirr") =>
    points.map((row, index) => `${(index * 800) / (points.length - 1)},${y(row[key])}`).join(" ");
  const ticks = Array.from({ length: (upper - lower) / 20 + 1 }, (_, index) => upper - index * 20);
  return (
    <figure className={styles.figure} aria-labelledby="performance-chart-title">
      <figcaption>
        <h3 id="performance-chart-title">{text.title}</h3>
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
          aria-label={`${text.title}. ${text.note} ${formatDate(latest.date, locale, true)}: ${text.portfolio} ${formatPercent(latest.portfolioXirr)}, SPY ${formatPercent(latest.benchmarkXirr)}.`}
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
          <polyline points={line("benchmarkXirr")} className={styles.benchmarkLine} />
          <polyline points={line("portfolioXirr")} className={styles.portfolioLine} />
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
        <p className={styles.scrollHint} id="performance-table-hint">
          {text.scroll}
        </p>
        {/* Keyboard focus allows horizontal scrolling of the monthly table. */}
        <div
          className={styles.tableScroll}
          tabIndex={0}
          role="region"
          aria-label={text.data}
          aria-describedby="performance-table-hint"
        >
          <table>
            <caption>{text.caption}</caption>
            <thead>
              <tr>
                <th scope="col">{text.month}</th>
                <th scope="col">{text.value}</th>
                <th scope="col">{text.portfolio} XIRR</th>
                <th scope="col">SPY XIRR</th>
              </tr>
            </thead>
            <tbody>
              {portfolioMonthlyReturns.toReversed().map((row) => (
                <tr key={row.date}>
                  <th scope="row">{formatDate(row.date, locale, true)}</th>
                  <td>{formatUsd(row.marketValue)}</td>
                  <td className={row.portfolioXirr === null ? styles.unavailable : undefined}>
                    {row.portfolioXirr === null ? text.unavailable : formatPercent(row.portfolioXirr)}
                  </td>
                  <td className={row.benchmarkXirr === null ? styles.unavailable : undefined}>
                    {row.benchmarkXirr === null ? text.unavailable : formatPercent(row.benchmarkXirr)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedDisclosure>
    </figure>
  );
}
