"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { getHoldingWeight, portfolioSnapshot, type PortfolioHolding } from "@/data/portfolio";

type SortKey = "symbol" | "shares" | "costBasis" | "price" | "marketValue" | "returnPct" | "weight";
type SortDirection = "asc" | "desc";

type PortfolioTableProps = {
  holdings: ReadonlyArray<PortfolioHolding>;
  locale?: "en" | "zh-tw";
};

const labels = {
  en: { symbol: "Position", shares: "Shares", costBasis: "Cost basis", price: "Price", marketValue: "Market value", returnPct: "Return", weight: "Weight", sortBy: "Sort by" },
  "zh-tw": { symbol: "部位", shares: "股數", costBasis: "成本基礎", price: "價格", marketValue: "市場價值", returnPct: "報酬", weight: "權重", sortBy: "排序依據" },
} as const;

const columns: SortKey[] = ["symbol", "shares", "costBasis", "price", "marketValue", "returnPct", "weight"];

export function PortfolioTable({ holdings, locale = "en" }: PortfolioTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("marketValue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const copy = labels[locale];

  const sortedHoldings = useMemo(() => holdings.toSorted((a, b) => {
    const first = sortKey === "weight" ? getHoldingWeight(a.marketValue) : a[sortKey];
    const second = sortKey === "weight" ? getHoldingWeight(b.marketValue) : b[sortKey];
    const comparison = typeof first === "string" ? first.localeCompare(String(second)) : first - Number(second);
    return sortDirection === "asc" ? comparison : -comparison;
  }), [holdings, sortDirection, sortKey]);

  const changeSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
      return;
    }

    setSortKey(nextKey);
    setSortDirection(nextKey === "symbol" ? "asc" : "desc");
  };

  return (
    <div className="portfolio-table portfolio-table-detailed" role="table" aria-label={locale === "zh-tw" ? "投資組合持股" : "Portfolio holdings"}>
      <div className="table-head" role="row">
        {columns.map((column) => {
          const isActive = sortKey === column;
          const ariaSort = isActive ? (sortDirection === "asc" ? "ascending" : "descending") : "none";
          const Icon = !isActive ? ArrowUpDown : sortDirection === "asc" ? ArrowUp : ArrowDown;

          return <span role="columnheader" aria-sort={ariaSort} key={column}>
            <button className={`sort-button${isActive ? " is-active" : ""}`} type="button" onClick={() => changeSort(column)} aria-label={`${copy.sortBy} ${copy[column]}`}>
              {copy[column]} <Icon aria-hidden="true" />
            </button>
          </span>;
        })}
      </div>
      {sortedHoldings.map((holding, index) => (
        <div className="portfolio-row" role="row" key={holding.symbol}>
          <span role="cell">{String(index + 1).padStart(2,"0")} · {holding.symbol}</span>
          <span role="cell">{formatShares(holding.shares)}</span>
          <span role="cell">{formatUsd(holding.costBasis)}</span>
          <span role="cell">{formatUsd(holding.price)}</span>
          <span role="cell">{formatUsd(holding.marketValue)}</span>
          <span role="cell" className={`data-value ${holding.returnPct < 0 ? "negative" : "positive"}`}>{holding.returnPct > 0 ? "+" : ""}{holding.returnPct.toFixed(1)}%</span>
          <span role="cell">{getHoldingWeight(holding.marketValue).toFixed(1)}%</span>
        </div>
      ))}
      <div className="portfolio-row portfolio-total-row" role="row">
        <span role="cell">{locale === "zh-tw" ? "合計" : "Total"}</span>
        <span role="cell">—</span>
        <span role="cell">{formatUsd(portfolioSnapshot.costBasis)}</span>
        <span role="cell">—</span>
        <span role="cell">{formatUsd(portfolioSnapshot.marketValue)}</span>
        <strong role="cell" className={`data-value ${portfolioSnapshot.totalReturn < 0 ? "negative" : "positive"}`}>
          {portfolioSnapshot.totalReturn > 0 ? "+" : ""}{portfolioSnapshot.totalReturn.toFixed(2)}%
        </strong>
        <strong role="cell">100.0%</strong>
      </div>
    </div>
  );
}

const formatUsd = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value);
const formatShares = (value: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
