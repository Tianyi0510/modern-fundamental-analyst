import { ChevronDown } from "lucide-react";
import { formatDate, formatPercent, formatUsd } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { PerformanceChartExplorer } from "./performance-chart-explorer";
import { AnimatedDisclosure } from "@/components/animated-disclosure";
import styles from "./performance-chart.module.css";

const copy = {
  en: {
    portfolio: "Portfolio",
    data: "View Monthly Data",
    month: "Month End",
    value: "Stock Market Value",
    caption: "Month-end data · newest first",
    scroll: "Scroll the table to compare columns and find earlier months.",
  },
  "zh-tw": {
    portfolio: "投資組合",
    data: "查看每月數據",
    month: "月底日期",
    value: "股票市場價值",
    caption: "月底數據・最新月份在前",
    scroll: "捲動表格以比較欄位，並查看較早月份。",
  },
  "zh-cn": {
    portfolio: "投资组合",
    data: "查看每月数据",
    month: "月底日期",
    value: "股票市场价值",
    caption: "月底数据・最新月份在前",
    scroll: "滚动表格以比较各列，并查看较早月份。",
  },
} as const;

const twrCopy = {
  en: {
    title: "Cumulative Reconstructed TWRR",
    note: "Cumulative closing-price TWRR. Contributions are modeled at period start; net income and costs at period end. Not observed intraday TWRR.",
    axis: "Cumulative Reconstructed TWRR",
  },
  "zh-tw": {
    title: "累積重建 TWRR",
    note: "以收盤估值重建的累積 TWRR；假設資金於期初流入，淨股息與費用於期末結算，並非實際日內 TWRR。",
    axis: "累積重建 TWRR",
  },
  "zh-cn": {
    title: "累计重建 TWRR",
    note: "以收盘估值重建的累计 TWRR；假设资金于期初流入，净股息与费用于期末结算，并非实际日内 TWRR。",
    axis: "累计重建 TWRR",
  },
} as const;

const xirrCopy = {
  en: {
    title: "Annualized XIRR",
    note: "Since-inception annualized XIRR at each month-end, not individual monthly returns. Periods shorter than 30 days are not annualized and are omitted from the lines.",
    axis: "Annualized XIRR",
    unavailable: "Not annualized: less than 30 days",
  },
  "zh-tw": {
    title: "年化 XIRR",
    note: "每個月底自成立以來的年化 XIRR，並非各月份的單月報酬；不足 30 天的期間不作年化，也不繪入折線。",
    axis: "年化 XIRR",
    unavailable: "未年化：不足 30 天",
  },
  "zh-cn": {
    title: "年化 XIRR",
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
  const returnLabel = measure === "twr" ? "TWRR" : "XIRR";
  const formatReturn = (value: number | null) => (value === null ? xirrCopy[locale].unavailable : formatPercent(value));
  return (
    <Card className="gap-0 p-[var(--space-5)] compact:p-[var(--space-4)]">
      <figure className={styles.figure} aria-labelledby={titleId}>
        <figcaption>
          <h3 id={titleId}>{text.title}</h3>
          <p>{text.note}</p>
        </figcaption>
        <PerformanceChartExplorer
          observations={observations}
          locale={locale}
          measure={measure}
          title={text.title}
          portfolio={text.portfolio}
        />
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
          <Table
            containerProps={{
              className: styles.tableScroll,
              tabIndex: 0,
              role: "region",
              "aria-label": text.data,
              "aria-describedby": `${titleId}-hint`,
            }}
          >
            <TableCaption className="mt-0 text-inherit">{text.caption}</TableCaption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col">{text.month}</TableHead>
                <TableHead scope="col">{text.value}</TableHead>
                <TableHead scope="col">
                  {text.portfolio} {returnLabel}
                </TableHead>
                <TableHead scope="col">SPY {returnLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {observations.toReversed().map((row) => (
                <TableRow className="hover:bg-transparent" key={row.date}>
                  <TableHead scope="row">{formatDate(row.date, locale, true)}</TableHead>
                  <TableCell>{formatUsd(row.marketValue)}</TableCell>
                  <TableCell>{formatReturn(row.portfolioReturn)}</TableCell>
                  <TableCell>{formatReturn(row.benchmarkReturn)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AnimatedDisclosure>
      </figure>
    </Card>
  );
}
