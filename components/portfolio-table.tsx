"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { formatPercent, formatShares, formatUsd } from "@/lib/format";
import { getHoldingCostPerShare, getHoldingReturn, getHoldingWeight, getPortfolioTotals, type PortfolioHolding } from "@/lib/portfolio-calculations";

type SortKey = "symbol" | "shares" | "costBasis" | "price" | "marketValue" | "returnPct" | "weight";
type SortDirection = "asc" | "desc";

type PortfolioTableProps = {
  copy: PortfolioTableCopy;
  holdings: ReadonlyArray<PortfolioHolding>;
};

export type PortfolioTableCopy = Record<SortKey, string> & {
  ariaLabel: string;
  ascending: string;
  descending: string;
  sortBy: string;
  total: string;
};

const columns: SortKey[] = ["symbol", "shares", "price", "costBasis", "marketValue", "returnPct", "weight"];

export function PortfolioTable({ copy, holdings }: PortfolioTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("marketValue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const totals = useMemo(() => getPortfolioTotals(holdings), [holdings]);
  const rows = useMemo(() => holdings.map((holding) => ({
    holding,
    returnPct: getHoldingReturn(holding),
    costPerShare: getHoldingCostPerShare(holding),
    weight: getHoldingWeight(holding.marketValue, totals.marketValue),
  })), [holdings, totals.marketValue]);

  const sortedRows = useMemo(() => rows.toSorted((a, b) => {
    const getSortValue = (row: (typeof rows)[number]) => {
      if (sortKey === "weight") return row.weight;
      if (sortKey === "returnPct") return row.returnPct;
      if (sortKey === "costBasis") return row.costPerShare;
      return row.holding[sortKey];
    };
    const first = getSortValue(a);
    const second = getSortValue(b);
    const comparison = typeof first === "string" ? first.localeCompare(String(second)) : first - Number(second);
    return sortDirection === "asc" ? comparison : -comparison;
  }), [rows, sortDirection, sortKey]);

  const changeSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
      return;
    }

    setSortKey(nextKey);
    setSortDirection(nextKey === "symbol" ? "asc" : "desc");
  };

  return (
    <div className="portfolio-table portfolio-table-detailed" role="table" aria-label={copy.ariaLabel}>
      <div className="portfolio-mobile-sort">
        <label>
          <span>{copy.sortBy}</span>
          <select value={sortKey} onChange={(event) => changeSort(event.target.value as SortKey)}>
            {columns.map((column) => <option value={column} key={column}>{copy[column]}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => setSortDirection((current) => current === "asc" ? "desc" : "asc")} aria-label={`${copy.sortBy}: ${sortDirection === "asc" ? copy.ascending : copy.descending}`}>
          <span>{sortDirection === "asc" ? copy.ascending : copy.descending}</span>
          {sortDirection === "asc" ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />}
        </button>
      </div>
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
      {sortedRows.map(({ holding, costPerShare, returnPct, weight }) => (
          <div className="portfolio-row" role="row" key={holding.symbol}>
            <span role="cell" data-label={copy.symbol}>{holding.symbol}</span>
            <span role="cell" data-label={copy.shares}>{formatShares(holding.shares)}</span>
            <span role="cell" data-label={copy.price}>{formatUsd(holding.price)}</span>
            <span role="cell" data-label={copy.costBasis}>{formatUsd(costPerShare)}</span>
            <span role="cell" data-label={copy.marketValue}>{formatUsd(holding.marketValue)}</span>
            <span role="cell" data-label={copy.returnPct} className={`data-value ${returnPct < 0 ? "negative" : "positive"}`}>{formatPercent(returnPct, 1)}</span>
            <span role="cell" data-label={copy.weight}>{weight.toFixed(1)}%</span>
          </div>
      ))}
      <div className="portfolio-row portfolio-total-row" role="row">
        <span role="cell" data-label={copy.symbol}>{copy.total}</span>
        <span role="cell" />
        <span role="cell" />
        <span role="cell" data-label={copy.costBasis} />
        <span className="portfolio-total-market" role="cell" data-label={copy.marketValue}>{formatUsd(totals.marketValue)}</span>
        <strong role="cell" data-label={copy.returnPct} className={`portfolio-total-return data-value ${totals.totalReturn < 0 ? "negative" : "positive"}`}>
          {formatPercent(totals.totalReturn)}
        </strong>
        <span role="cell" data-label={copy.weight} />
      </div>
    </div>
  );
}
